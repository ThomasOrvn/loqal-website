/**
 * Script Google Apps Script pour l'audit de réservabilité Loqal avec Gemini AI
 * 
 * Utilise l'API Gemini avec l'outil de recherche Google (grounding) pour analyser
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
const GEMINI_MODEL = 'gemini-1.5-flash-latest'; // ou gemini-1.5-pro-latest pour plus de précision
const MAX_AUDITS_PER_HOUR = 20; // Limite anti-abus
const CACHE_DURATION_HOURS = 24; // Cache des résultats

/**
 * Gère les requêtes POST pour l'audit
 */
function doPost(e) {
  try {
    const params = e.parameter;
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
      return createResponse({ error: result.error });
    }

    // Mettre en cache
    cacheResult(cacheKey, result);

    // Enregistrer l'audit
    try {
      logAudit(activityName, city, url, result.score);
    } catch (logError) {
      console.error('Erreur lors de l\'enregistrement:', logError);
    }

    return createResponse(result);

  } catch (error) {
    console.error('Erreur dans doPost:', error);
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
    return { error: 'Clé API Gemini non configurée. Contactez l\'administrateur.' };
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
   - Systèmes acceptés : Calendly, Regiondo, Winalist, Bookingkit, formulaire de réservation, etc.

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

  // Appel API Gemini avec grounding
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
  
  const payload = {
    contents: [{
      parts: [{
        text: prompt
      }]
    }],
    tools: [{
      googleSearchRetrieval: {
        dynamicRetrievalConfig: {
          mode: "MODE_DYNAMIC",
          dynamicThreshold: 0.3
        }
      }
    }],
    generationConfig: {
      temperature: 0.2,
      topP: 0.8,
      topK: 40
    }
  };

  try {
    const response = UrlFetchApp.fetch(apiUrl, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });

    const responseCode = response.getResponseCode();
    if (responseCode !== 200) {
      console.error('Erreur API Gemini:', response.getContentText());
      return { error: 'Erreur lors de l\'analyse IA. Veuillez réessayer.' };
    }

    const data = JSON.parse(response.getContentText());
    
    if (!data.candidates || data.candidates.length === 0) {
      return { error: 'Aucune réponse de l\'IA. Veuillez réessayer.' };
    }

    const textContent = data.candidates[0].content.parts[0].text;
    
    // Parser le JSON de la réponse
    const result = parseGeminiResponse(textContent);
    
    return result;

  } catch (error) {
    console.error('Erreur appel Gemini:', error);
    return { error: 'Erreur lors de l\'analyse IA. Veuillez réessayer.' };
  }
}

/**
 * Parse la réponse de Gemini et extrait le JSON
 */
function parseGeminiResponse(text) {
  try {
    // Extraire le JSON (peut être entouré de ```json ... ```)
    let jsonText = text.trim();
    
    // Retirer les marqueurs de code markdown si présents
    jsonText = jsonText.replace(/^```json\s*/i, '').replace(/```\s*$/, '');
    jsonText = jsonText.replace(/^```\s*/, '').replace(/```\s*$/, '');
    
    const data = JSON.parse(jsonText);
    
    // Validation et recalcul du score
    if (!data.criteria || !Array.isArray(data.criteria)) {
      throw new Error('Format de réponse invalide');
    }

    // Recalculer le score pour être sûr
    let calculatedScore = 0;
    data.criteria.forEach(criterion => {
      if (criterion.ok) {
        calculatedScore += criterion.points;
      }
    });

    data.score = calculatedScore;

    return data;

  } catch (error) {
    console.error('Erreur parsing:', error, 'Texte:', text);
    return { 
      error: 'Impossible d\'analyser la réponse. Veuillez réessayer.',
      details: error.toString()
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
 * Gère les requêtes GET
 */
function doGet(e) {
  return createResponse({ 
    error: 'Utilisez POST pour soumettre un audit',
    info: 'Script d\'audit Loqal avec Gemini AI'
  });
}
