/**
 * Script Google Apps Script pour l'audit de réservabilité Loqal
 * 
 * Analyse un site web pour déterminer sa « réservabilité » :
 * - Bouton de réservation en ligne (35 pts)
 * - Horaires affichés (25 pts)
 * - Site optimisé mobile (20 pts)
 * - Fiche Google complète (20 pts)
 * 
 * Déployez ce script en tant qu'application web avec :
 * - Exécuter en tant que : Moi
 * - Qui a accès : Tout le monde
 * 
 * Copiez l'URL de déploiement dans PUBLIC_AUDIT_ENDPOINT
 */

/**
 * Gère les requêtes GET (pour les redirections)
 */
function doGet(e) {
  return ContentService.createTextOutput(
    JSON.stringify({ error: 'Utilisez POST pour soumettre un audit' })
  ).setMimeType(ContentService.MimeType.TEXT);
}

/**
 * Gère les requêtes POST pour l'audit
 */
function doPost(e) {
  try {
    // Parse les paramètres
    const params = e.parameter;
    const url = params.url;
    const googleComplete = params.googleComplete === 'yes';

    // Validation de l'URL
    if (!url) {
      return createResponse({ error: 'URL manquante' });
    }

    // Refuse les IPs privées et localhost
    if (isPrivateUrl(url)) {
      return createResponse({ error: 'Les URLs locales ou privées ne sont pas autorisées' });
    }

    // Fetch le site web
    const html = fetchWebsite(url);
    if (!html) {
      return createResponse({ error: 'Impossible de récupérer le site web' });
    }

    // Analyse les critères
    const criteria = analyzeCriteria(html, url, googleComplete);
    
    // Calcule le score total
    const score = criteria.reduce((sum, c) => sum + (c.ok ? c.points : 0), 0);

    // Enregistre l'audit dans la feuille Google (optionnel)
    try {
      logAudit(url, score, criteria);
    } catch (logError) {
      console.error('Erreur lors de l\'enregistrement:', logError);
      // Continue même si l'enregistrement échoue
    }

    // Retourne le résultat
    return createResponse({ score, criteria });

  } catch (error) {
    console.error('Erreur dans doPost:', error);
    return createResponse({ 
      error: 'Une erreur est survenue lors de l\'analyse',
      details: error.toString()
    });
  }
}

/**
 * Fetch le contenu HTML d'un site web
 */
function fetchWebsite(url) {
  try {
    const response = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true,
      followRedirects: true,
      validateHttpsCertificates: false,
      headers: {
        'User-Agent': 'Loqal-Audit-Bot/1.0'
      },
      timeout: 10
    });

    if (response.getResponseCode() >= 400) {
      return null;
    }

    return response.getContentText();
  } catch (error) {
    console.error('Erreur fetch:', error);
    return null;
  }
}

/**
 * Analyse les critères de réservabilité
 */
function analyzeCriteria(html, url, googleComplete) {
  const criteria = [];
  const htmlLower = html.toLowerCase();

  // 1. Bouton de réservation en ligne (35 pts)
  const bookingResult = checkBooking(htmlLower);
  criteria.push({
    id: 'booking',
    label: 'Bouton de réservation en ligne',
    ok: bookingResult.found,
    points: 35,
    conseil: bookingResult.found ? '' : 'Ajoutez un bouton "Réserver" visible et un système de réservation en ligne (Calendly, Regiondo, etc.).'
  });

  // 2. Horaires affichés (25 pts)
  const hoursResult = checkHours(html, htmlLower);
  criteria.push({
    id: 'hours',
    label: 'Horaires de visite affichés',
    ok: hoursResult.found,
    points: 25,
    conseil: hoursResult.found ? '' : 'Affichez clairement vos horaires d\'ouverture (jours et heures) sur votre site.'
  });

  // 3. Site optimisé mobile (20 pts)
  const mobileResult = checkMobile(html, url);
  criteria.push({
    id: 'mobile',
    label: 'Site optimisé mobile',
    ok: mobileResult.ok,
    points: 20,
    conseil: mobileResult.ok ? '' : mobileResult.conseil
  });

  // 4. Fiche Google complète (20 pts)
  const googleResult = checkGoogle(htmlLower, googleComplete);
  criteria.push({
    id: 'google',
    label: 'Fiche Google complète',
    ok: googleResult.ok,
    points: 20,
    conseil: googleResult.ok ? '' : 'Créez et complétez votre fiche Google Business Profile avec horaires, photos et coordonnées.'
  });

  return criteria;
}

/**
 * Vérifie la présence de boutons/liens de réservation
 */
function checkBooking(htmlLower) {
  // Mots-clés de réservation
  const bookingKeywords = [
    'réserver', 'réservation', 'book', 'booking', 'rendez-vous',
    'prendre rendez-vous', 'je réserve', 'reserver maintenant'
  ];

  // Widgets de réservation connus
  const bookingWidgets = [
    'calendly', 'bookingkit', 'regiondo', 'fareharbor', 'rezdy',
    'weekendesk', 'zenchef', 'thefork', 'winalist', 'vinotrip',
    'bookvisit', 'bokun', 'peek.com', 'resabooking', 'bookeo'
  ];

  // Patterns pour détecter les boutons/liens de réservation
  const buttonPatterns = [
    /<a[^>]*href[^>]*>(.*?réserv.*?)<\/a>/gi,
    /<button[^>]*>(.*?réserv.*?)<\/button>/gi,
    /<a[^>]*class="[^"]*book[^"]*"[^>]*>/gi,
    /<button[^>]*class="[^"]*book[^"]*"[^>]*>/gi
  ];

  // Vérifie les mots-clés dans les liens et boutons
  for (const keyword of bookingKeywords) {
    if (htmlLower.includes(keyword)) {
      // Vérifie que c'est dans un contexte de lien ou bouton
      const context = htmlLower.indexOf(keyword);
      const surrounding = htmlLower.substring(Math.max(0, context - 50), context + 50);
      if (surrounding.includes('<a ') || surrounding.includes('<button') || surrounding.includes('href')) {
        return { found: true };
      }
    }
  }

  // Vérifie les widgets de réservation
  for (const widget of bookingWidgets) {
    if (htmlLower.includes(widget)) {
      return { found: true };
    }
  }

  // Vérifie les iframes de réservation
  if (htmlLower.includes('<iframe') && 
      (htmlLower.includes('book') || htmlLower.includes('reserv'))) {
    return { found: true };
  }

  return { found: false };
}

/**
 * Vérifie la présence d'horaires d'ouverture
 */
function checkHours(html, htmlLower) {
  // Schema.org openingHours
  if (htmlLower.includes('openinghours') || 
      htmlLower.includes('openinghoursspecification')) {
    return { found: true };
  }

  // Jours de la semaine
  const daysPatterns = [
    'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche',
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
    'lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim'
  ];

  // Patterns d'horaires
  const timePatterns = [
    /\d{1,2}h\d{0,2}/gi,          // 10h, 10h30
    /\d{1,2}:\d{2}/g,              // 10:00, 14:30
    /\d{1,2}h\s*-\s*\d{1,2}h/gi,  // 10h - 18h
    /\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}/g  // 10:00 - 18:00
  ];

  // Compte les occurrences de jours
  let dayCount = 0;
  for (const day of daysPatterns) {
    if (htmlLower.includes(day)) {
      dayCount++;
    }
  }

  // Compte les occurrences d'horaires
  let timeCount = 0;
  for (const pattern of timePatterns) {
    const matches = html.match(pattern);
    if (matches) {
      timeCount += matches.length;
    }
  }

  // Si on trouve au moins 3 jours ET au moins 2 horaires, c'est bon
  if (dayCount >= 3 && timeCount >= 2) {
    return { found: true };
  }

  return { found: false };
}

/**
 * Vérifie l'optimisation mobile et HTTPS
 */
function checkMobile(html, url) {
  const htmlLower = html.toLowerCase();
  
  // Vérifie HTTPS
  const isHttps = url.toLowerCase().startsWith('https://');
  
  // Vérifie la balise viewport
  const hasViewport = htmlLower.includes('width=device-width') &&
                      htmlLower.includes('viewport');

  if (!isHttps && !hasViewport) {
    return { 
      ok: false, 
      conseil: 'Passez en HTTPS et ajoutez une balise meta viewport pour l\'optimisation mobile.' 
    };
  }
  
  if (!isHttps) {
    return { 
      ok: false, 
      conseil: 'Passez votre site en HTTPS pour la sécurité et le référencement.' 
    };
  }
  
  if (!hasViewport) {
    return { 
      ok: false, 
      conseil: 'Ajoutez la balise <meta name="viewport" content="width=device-width"> pour l\'optimisation mobile.' 
    };
  }

  return { ok: true, conseil: '' };
}

/**
 * Vérifie la présence d'une fiche Google
 */
function checkGoogle(htmlLower, googleComplete) {
  // Bonus si un lien Google Maps/Business est présent
  const hasGoogleLink = htmlLower.includes('google.com/maps') || 
                        htmlLower.includes('g.page/');

  // Score basé sur la déclaration du pro + bonus si lien trouvé
  return { ok: googleComplete || hasGoogleLink };
}

/**
 * Enregistre l'audit dans une feuille Google
 */
function logAudit(url, score, criteria) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName('Audits');
    
    // Crée la feuille si elle n'existe pas
    if (!sheet) {
      sheet = ss.insertSheet('Audits');
      sheet.appendRow([
        'Date',
        'URL',
        'Score',
        'Réservation',
        'Horaires',
        'Mobile',
        'Google'
      ]);
    }

    // Ajoute une ligne avec les résultats
    sheet.appendRow([
      new Date(),
      url,
      score,
      criteria[0].ok ? 'Oui' : 'Non',
      criteria[1].ok ? 'Oui' : 'Non',
      criteria[2].ok ? 'Oui' : 'Non',
      criteria[3].ok ? 'Oui' : 'Non'
    ]);
  } catch (error) {
    console.error('Erreur logAudit:', error);
    throw error;
  }
}

/**
 * Vérifie si une URL est privée ou locale
 */
function isPrivateUrl(url) {
  const urlLower = url.toLowerCase();
  
  // Localhost et IPs locales
  if (urlLower.includes('localhost') ||
      urlLower.includes('127.0.0.1') ||
      urlLower.includes('0.0.0.0') ||
      urlLower.includes('192.168.') ||
      urlLower.includes('10.0.') ||
      urlLower.includes('172.16.')) {
    return true;
  }

  return false;
}

/**
 * Crée une réponse formatée pour CORS
 */
function createResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.TEXT);
}
