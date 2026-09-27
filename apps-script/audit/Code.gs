/**
 * Script Google Apps Script pour l'audit de réservabilité Loqal avec Gemini AI
 * 
 * Utilise l'API Gemini avec l'outil de recherche Google pour analyser
 * la réservabilité d'une activité professionnelle.
 * 
 * Configuration requise :
 * 1. Créer une clé API Gemini sur Google AI Studio (https://aistudio.google.com/app/apikey)
 * 2. Dans le script : Projet > Propriétés > Propriétés du script
 *    Ajouter : GEMINI_API_KEY = votre_clé_api
 * 3. Déployer : Déployer > Nouveau déploiement > Application Web
 *    - Exécuter en tant que : Moi
 *    - Qui a accès : Tout le monde
 */

// Configuration
// Modèle : voir https://ai.google.dev/gemini-api/docs/models
const GEMINI_MODEL = 'gemini-3.8-flash';
const MAX_AUDITS_PER_HOUR = 20; // Limite anti-abus
const CACHE_DURATION_HOURS = 24; // Cache des résultats

/**
 * Gère les requêtes POST pour l'audit et la waitlist
 */
function doPost(e) {
  try {
    const params = e.parameter;
    const action = params.action || 'audit'; // Default to audit for backward compatibility
    
    // Route based on action
    if (action === 'waitlist') {
      return handleWaitlist(params);
    } else {
      return handleAudit(params);
    }
  } catch (error) {
    console.error('Erreur dans doPost:', error);
    return createResponse({ 
      error: 'Une erreur est survenue. Veuillez réessayer.',
      details: error.toString()
    });
  }
}

/**
 * Gère les inscriptions à la waitlist
 */
function handleWaitlist(params) {
  try {
    // Honeypot check - reject if 'website' field is filled
    if (params.website && params.website.trim() !== '') {
      console.log('Spam detected: honeypot filled');
      return createResponse({ ok: true }); // Silently accept spam
    }

    // Validation
    const email = params.email;
    const type = params.type; // 'visiteur' or 'professionnel'
    
    if (!email || !type) {
      return createResponse({ error: 'Email et type requis' });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return createResponse({ error: 'Email invalide' });
    }

    // Check for duplicate email (simple dedupe)
    if (isEmailAlreadyRegistered(email)) {
      console.log('Email already registered:', email);
      return createResponse({ ok: true }); // Silently accept duplicate
    }

    // Get or create Waitlist sheet
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName('Waitlist');
    
    if (!sheet) {
      sheet = ss.insertSheet('Waitlist');
      // Add headers
      sheet.appendRow([
        'Date',
        'Type',
        'Email',
        'Nom/Prénom',
        'Ville',
        'Activité',
        'Catégorie',
        'Téléphone',
        'Régions',
        'Centres d\'intérêt'
      ]);
      // Freeze header row
      sheet.setFrozenRows(1);
    }

    // Prepare row data
    const rowData = [
      new Date(),
      type || '',
      email || '',
      params.name || params.firstName || '',
      params.city || '',
      params.activityName || '',
      params.category || '',
      params.phone || '',
      params.regions || '',
      params.interests || '' // Will be comma-separated if array
    ];

    // Append to sheet
    sheet.appendRow(rowData);

    // Send confirmation email (non-blocking)
    try {
      const firstName = params.firstName || params.name || '';
      sendWaitlistConfirmationEmail(email, type, firstName);
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the registration if email fails
    }

    return createResponse({ ok: true });

  } catch (error) {
    console.error('Erreur handleWaitlist:', error);
    return createResponse({ 
      error: 'Une erreur est survenue. Veuillez réessayer.',
      details: error.toString()
    });
  }
}

/**
 * Vérifie si un email est déjà enregistré dans la waitlist
 */
function isEmailAlreadyRegistered(email) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Waitlist');
    
    if (!sheet) return false;
    
    const data = sheet.getDataRange().getValues();
    // Skip header row (index 0)
    for (let i = 1; i < data.length; i++) {
      if (data[i][2] && data[i][2].toString().toLowerCase() === email.toLowerCase()) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.warn('Erreur isEmailAlreadyRegistered:', error);
    return false; // On error, allow registration
  }
}

/**
 * Gère les requêtes d'audit (ancienne fonction doPost)
 */
function handleAudit(params) {
  try {
    const activityName = params.activityName;
    const city = params.city;
    const url = params.url || '';

    // Validation
    if (!activityName || !city) {
      return createResponse({ error: 'Nom de l\'activité et ville requis' });
    }

    // Anti-abus : vérifier le nombre d'audits
    if (!checkRateLimit()) {
      return createResponse({ 
        error: 'Limite d\'audits atteinte. Veuillez réessayer dans une heure.' 
      });
    }

    // Vérifier le cache
    const cacheKey = getCacheKey(activityName, city);
    const cached = getCachedResult(cacheKey);
    if (cached) {
      return createResponse(cached);
    }

    // Vérifier l'URL si fournie
    if (url && isPrivateUrl(url)) {
      return createResponse({ error: 'Les URLs locales ou privées ne sont pas autorisées' });
    }

    // Récupérer des indices du site si URL fournie
    let siteHints = null;
    if (url) {
      try {
        siteHints = fetchSiteHints(url);
      } catch (error) {
        console.warn('Erreur lors de la récupération du site:', error);
        // Continue sans les indices du site
      }
    }

    // Appeler l'API Gemini
    const result = callGeminiAudit(activityName, city, url, siteHints);
    
    if (result.error) {
      // Ne pas mettre en cache ni compter les erreurs
      return createResponse(result);
    }

    // Mettre en cache uniquement les succès
    cacheResult(cacheKey, result);

    // Enregistrer l'audit
    try {
      logAudit(activityName, city, url, result.score);
    } catch (logError) {
      console.error('Erreur lors de l\'enregistrement:', logError);
    }

    return createResponse(result);

  } catch (error) {
    console.error('Erreur dans handleAudit:', error);
    return createResponse({ 
      error: 'Une erreur est survenue lors de l\'analyse. Veuillez réessayer.',
      details: error.toString()
    });
  }
}

/**
 * Appelle l'API Gemini pour analyser la réservabilité
 */
function callGeminiAudit(activityName, city, url, siteHints) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  
  if (!apiKey) {
    return { 
      error: 'Clé API Gemini non configurée. Contactez l\'administrateur.',
      details: 'GEMINI_API_KEY not found in script properties'
    };
  }

  // Construction du prompt
  let prompt = `Tu es un expert en réservabilité et en présence en ligne pour les activités du terroir français.

Analyse la réservabilité de cette activité :
- Nom : ${activityName}
- Ville : ${city}`;

  if (url) {
    prompt += `\n- Site web : ${url}`;
  }

  if (siteHints) {
    prompt += `\n\nIndices techniques du site web :\n${JSON.stringify(siteHints, null, 2)}`;
  }

  prompt += `

Utilise la recherche Google pour vérifier ces 4 critères précis :

1. **Réservation en ligne avec créneaux disponibles** (35 points)
   - L'activité propose-t-elle un système de réservation en ligne fonctionnel ?
   - Les créneaux/dates sont-ils visibles et disponibles ?
   - Tout système de réservation en ligne compte.

2. **Horaires/périodes de visite affichés** (25 points)
   - Les horaires d'ouverture ou périodes de visite sont-ils clairement indiqués ?
   - Sur le site web ou la fiche Google Business ?

3. **Site adapté au mobile** (20 points)
   - Le site web est-il optimisé pour mobile (responsive) ?
   - Utilise-t-il HTTPS ?

4. **Fiche Google Business complète avec horaires et photos** (20 points)
   - La fiche Google Business Profile existe-t-elle ?
   - Contient-elle les horaires ?
   - Contient-elle des photos de qualité ?

IMPORTANT :
- Ne rien inventer : si l'information est introuvable, mettre ok=false
- Pour chaque critère, inclure une URL source quand elle existe
- Donner un conseil concret pour chaque critère non validé
- Pour le critère "booking" (réservation en ligne), le conseil doit mentionner Loqal : "Proposez la réservation en ligne de vos visites et dégustations avec créneaux en temps réel, c'est ce que Loqal vous permet de faire simplement."
- Pour les autres critères, donner un conseil générique et concret sans nommer de produits ou services tiers (Google Business Profile peut être nommé)

Réponds UNIQUEMENT avec ce JSON strict (aucun texte avant ou après) :
{
  "score": <somme des points ok>,
  "criteria": [
    {
      "id": "booking",
      "label": "Réservation en ligne avec créneaux disponibles",
      "ok": true/false,
      "points": 35,
      "conseil": "conseil si ok=false",
      "source": "URL source ou vide"
    },
    {
      "id": "hours",
      "label": "Horaires/périodes de visite affichés",
      "ok": true/false,
      "points": 25,
      "conseil": "conseil si ok=false",
      "source": "URL source ou vide"
    },
    {
      "id": "mobile",
      "label": "Site adapté au mobile",
      "ok": true/false,
      "points": 20,
      "conseil": "conseil si ok=false",
      "source": "URL source ou vide"
    },
    {
      "id": "google",
      "label": "Fiche Google Business complète avec horaires et photos",
      "ok": true/false,
      "points": 20,
      "conseil": "conseil si ok=false",
      "source": "URL source ou vide"
    }
  ]
}`;

  // Appel API Gemini avec google_search (generateContent API legacy)
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
  
  const payload = {
    contents: [{
      parts: [{
        text: prompt
      }]
    }],
    tools: [{
      google_search: {}
    }],
    generationConfig: {
      temperature: 0.2
    }
  };

  try {
    const response = UrlFetchApp.fetch(apiUrl, {
      method: 'post',
      contentType: 'application/json',
      headers: {
        'x-goog-api-key': apiKey
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });

    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    if (responseCode !== 200) {
      console.error('Erreur API Gemini:', responseText);
      let errorDetails = `HTTP ${responseCode}`;
      try {
        const errorData = JSON.parse(responseText);
        if (errorData.error) {
          errorDetails += `: ${errorData.error.status || ''} ${errorData.error.message || ''}`.trim();
        }
      } catch (e) {
        errorDetails += `: ${responseText.substring(0, 200)}`;
      }
      return { 
        error: 'Erreur lors de l\'analyse IA. Veuillez réessayer.',
        details: errorDetails
      };
    }

    const data = JSON.parse(responseText);
    
    // Gérer les cas sans candidates ou avec finishReason/promptFeedback
    if (!data.candidates || data.candidates.length === 0) {
      let errorDetails = 'No candidates';
      if (data.promptFeedback) {
        errorDetails += `, promptFeedback: ${JSON.stringify(data.promptFeedback)}`;
      }
      console.error('Aucun candidat:', errorDetails);
      return { 
        error: 'Aucune réponse de l\'IA. Veuillez réessayer.',
        details: errorDetails
      };
    }

    const candidate = data.candidates[0];
    
    // Vérifier si le content existe
    if (!candidate.content || !candidate.content.parts) {
      const finishReason = candidate.finishReason || 'unknown';
      console.error('Pas de content:', JSON.stringify(candidate));
      return { 
        error: 'Réponse incomplète de l\'IA. Veuillez réessayer.',
        details: `finishReason: ${finishReason}`
      };
    }

    // Concaténer tous les parts text (ignorer les parts sans text ou thought)
    let textContent = '';
    for (const part of candidate.content.parts) {
      if (part.text) {
        textContent += part.text;
      }
    }

    if (!textContent) {
      console.error('Aucun texte dans parts:', JSON.stringify(candidate.content.parts));
      return { 
        error: 'Réponse vide de l\'IA. Veuillez réessayer.',
        details: 'No text in parts'
      };
    }

    // Extraire sources depuis groundingMetadata si disponible
    let groundingSources = [];
    if (candidate.groundingMetadata && candidate.groundingMetadata.groundingChunks) {
      for (const chunk of candidate.groundingMetadata.groundingChunks) {
        if (chunk.web && chunk.web.uri) {
          groundingSources.push(chunk.web.uri);
        }
      }
    }
    
    // Parser le JSON de la réponse
    const result = parseGeminiResponse(textContent, groundingSources);
    
    return result;

  } catch (error) {
    console.error('Exception appel Gemini:', error.toString());
    return { 
      error: 'Erreur lors de l\'analyse IA. Veuillez réessayer.',
      details: error.toString()
    };
  }
}

/**
 * Parse la réponse de Gemini et extrait le JSON
 */
function parseGeminiResponse(text, groundingSources) {
  try {
    // Extraction JSON robuste : premier { au dernier }
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    
    if (firstBrace === -1 || lastBrace === -1 || firstBrace >= lastBrace) {
      throw new Error('Aucun JSON trouvé dans la réponse');
    }
    
    const jsonText = text.substring(firstBrace, lastBrace + 1);
    const data = JSON.parse(jsonText);
    
    // Validation et recalcul du score
    if (!data.criteria || !Array.isArray(data.criteria)) {
      throw new Error('Format de réponse invalide : criteria manquant ou invalide');
    }

    // Recalculer le score pour être sûr
    let calculatedScore = 0;
    data.criteria.forEach(criterion => {
      if (criterion.ok) {
        calculatedScore += criterion.points;
      }
      // Utiliser groundingSources si source est vide et qu'on a des sources
      if ((!criterion.source || criterion.source === '') && groundingSources && groundingSources.length > 0) {
        criterion.source = groundingSources[0]; // Prendre la première source
      }
    });

    data.score = calculatedScore;

    // Ajouter les sources de grounding si disponibles
    if (groundingSources && groundingSources.length > 0) {
      data.sources = groundingSources;
    }

    return data;

  } catch (error) {
    console.error('Erreur parsing JSON:', error.toString());
    console.error('Texte reçu:', text.substring(0, 500));
    return { 
      error: 'Impossible d\'analyser la réponse. Veuillez réessayer.',
      details: `Parse error: ${error.toString()}`
    };
  }
}

/**
 * Récupère des indices techniques du site web si URL fournie
 */
function fetchSiteHints(url) {
  try {
    const response = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true,
      followRedirects: true,
      validateHttpsCertificates: false,
      headers: {
        'User-Agent': 'Loqal-Audit-Bot/2.0'
      },
      timeout: 10
    });

    if (response.getResponseCode() >= 400) {
      return null;
    }

    const html = response.getContentText();
    const htmlLower = html.toLowerCase();

    const hints = {
      hasHttps: url.toLowerCase().startsWith('https://'),
      hasViewport: htmlLower.includes('width=device-width'),
      hasBookingKeywords: false,
      hasBookingWidgets: false,
      hasOpeningHours: false,
      hasGoogleMapsLink: false
    };

    // Vérifier mots-clés de réservation
    const bookingKeywords = ['réserv', 'book', 'rendez-vous'];
    hints.hasBookingKeywords = bookingKeywords.some(kw => htmlLower.includes(kw));

    // Vérifier widgets de réservation
    const widgets = ['calendly', 'bookingkit', 'regiondo', 'winalist', 'fareharbor', 'rezdy'];
    hints.hasBookingWidgets = widgets.some(w => htmlLower.includes(w));

    // Vérifier horaires
    hints.hasOpeningHours = htmlLower.includes('openinghours') || 
                            htmlLower.includes('openinghoursspecification');

    // Vérifier lien Google
    hints.hasGoogleMapsLink = htmlLower.includes('google.com/maps') || 
                              htmlLower.includes('g.page/');

    return hints;

  } catch (error) {
    console.warn('Erreur fetchSiteHints:', error);
    return null;
  }
}

/**
 * Vérifie la limite de taux (rate limiting)
 */
function checkRateLimit() {
  const cache = CacheService.getScriptCache();
  const key = 'audit_count';
  const count = cache.get(key);
  
  if (!count) {
    cache.put(key, '1', 3600); // 1 heure
    return true;
  }

  const currentCount = parseInt(count);
  if (currentCount >= MAX_AUDITS_PER_HOUR) {
    return false;
  }

  cache.put(key, (currentCount + 1).toString(), 3600);
  return true;
}

/**
 * Génère une clé de cache
 */
function getCacheKey(activityName, city) {
  return 'audit_' + Utilities.base64Encode(
    Utilities.computeDigest(
      Utilities.DigestAlgorithm.MD5,
      activityName + '|' + city
    )
  );
}

/**
 * Récupère un résultat du cache
 */
function getCachedResult(key) {
  try {
    const cache = CacheService.getScriptCache();
    const cached = cache.get(key);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    return null;
  }
}

/**
 * Met en cache un résultat
 */
function cacheResult(key, result) {
  try {
    const cache = CacheService.getScriptCache();
    cache.put(key, JSON.stringify(result), CACHE_DURATION_HOURS * 3600);
  } catch (error) {
    console.warn('Erreur mise en cache:', error);
  }
}

/**
 * Enregistre l'audit dans la feuille Google
 */
function logAudit(activityName, city, url, score) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName('Audits');
    
    if (!sheet) {
      sheet = ss.insertSheet('Audits');
      sheet.appendRow([
        'Date',
        'Activité',
        'Ville',
        'Site web',
        'Score'
      ]);
    }

    sheet.appendRow([
      new Date(),
      activityName,
      city,
      url || '(non fourni)',
      score
    ]);
  } catch (error) {
    console.error('Erreur logAudit:', error);
    throw error;
  }
}

/**
 * Vérifie si une URL est privée
 */
function isPrivateUrl(url) {
  const urlLower = url.toLowerCase();
  
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

/**
 * Function to authorize Gmail sending permissions
 * Run this once in Apps Script editor to trigger OAuth consent screen
 * Menu: Run > authorizeEmail
 */
function authorizeEmail() {
  try {
    // Check aliases (requires gmail.settings.basic scope)
    const aliases = GmailApp.getAliases();
    console.log('Available aliases:', aliases.join(', '));
    
    // Send test email (requires gmail.send scope)
    // Using thomas@loqal.fr for authorization test
    const testEmail = 'thomas@loqal.fr';
    console.log('Sending authorization test email to:', testEmail);
    
    GmailApp.sendEmail(
      testEmail,
      'Loqal - Test d\'autorisation Gmail',
      'Ce message confirme que les permissions Gmail ont été accordées avec succès.\n\nVous pouvez ignorer cet e-mail.',
      {
        name: 'Loqal',
        replyTo: 'contact@loqal.fr'
      }
    );
    
    console.log('✅ Authorization successful! Email permissions granted.');
    console.log('You can now close this and the waitlist confirmation emails will work.');
    
    return {
      success: true,
      aliases: aliases,
      message: 'Email permissions authorized successfully'
    };
  } catch (error) {
    console.error('❌ Authorization failed:', error);
    throw error;
  }
}


/**
 * Fonction de test pour diagnostiquer l'API Gemini depuis l'éditeur Apps Script
 * Menu : Exécution > testAudit
 */
function testAudit() {
  console.log('=== Test de l\'audit Gemini ===');
  console.log('Modèle :', GEMINI_MODEL);
  
  const result = callGeminiAudit(
    'Château de Pommard',
    'Pommard',
    'https://www.chateaudepommard.com',
    null
  );
  
  console.log('Résultat :');
  console.log(JSON.stringify(result, null, 2));
  
  if (result.error) {
    console.error('❌ Erreur :', result.error);
    if (result.details) {
      console.error('Détails :', result.details);
    }
  } else {
    console.log('✅ Score :', result.score + '/100');
    console.log('✅ Critères validés :', result.criteria.filter(c => c.ok).length + '/4');
    if (result.sources) {
      console.log('✅ Sources :', result.sources.length);
    }
  }
  
  return result;
}
