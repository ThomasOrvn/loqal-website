/**
 * Google Apps Script pour gérer les soumissions de la liste d'attente Loqal
 * 
 * INSTRUCTIONS D'INSTALLATION :
 * 
 * 1. Créez un nouveau Google Sheets avec deux onglets :
 *    - Nommez le premier onglet "Visiteurs"
 *    - Nommez le second onglet "Professionnels"
 * 
 * 2. Dans chaque onglet, ajoutez les en-têtes de colonnes :
 * 
 *    Visiteurs (ligne 1) :
 *    Date | Prénom | Email | Régions | Centres d'intérêt
 * 
 *    Professionnels (ligne 1) :
 *    Date | Nom | Email | Activité | Catégorie | Commune | Téléphone
 * 
 * 3. Dans votre Google Sheets, allez dans Extensions > Apps Script
 * 
 * 4. Supprimez le code par défaut et collez ce script
 * 
 * 5. Enregistrez le script (Ctrl+S ou Cmd+S)
 * 
 * 6. Cliquez sur "Déployer" > "Nouveau déploiement"
 *    - Type : Application Web
 *    - Exécuter en tant que : Moi
 *    - Qui a accès : Tout le monde
 * 
 * 7. Autorisez l'application (vous devrez peut-être passer par l'écran "Application non vérifiée")
 * 
 * 8. Copiez l'URL du déploiement web (elle ressemble à :
 *    https://script.google.com/macros/s/ABC.../exec)
 * 
 * 9. Ajoutez cette URL dans votre fichier .env :
 *    PUBLIC_WAITLIST_ENDPOINT=https://script.google.com/macros/s/.../exec
 * 
 * 10. Redéployez votre site Loqal
 */

function doPost(e) {
  try {
    // Parse les données JSON
    const data = JSON.parse(e.postData.contents);
    
    // Ouvre le Google Sheet actif
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    
    // Détermine l'onglet selon le type
    const sheetName = data.type === 'visiteur' ? 'Visiteurs' : 'Professionnels';
    const targetSheet = sheet.getSheetByName(sheetName);
    
    if (!targetSheet) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          error: `Onglet "${sheetName}" non trouvé. Créez un onglet avec ce nom exact.`
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Prépare la ligne de données selon le type
    let row;
    const timestamp = new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' });
    
    if (data.type === 'visiteur') {
      row = [
        timestamp,
        data.firstName || '',
        data.email || '',
        data.regions || '',
        data.interests || ''
      ];
    } else {
      row = [
        timestamp,
        data.name || '',
        data.email || '',
        data.activityName || '',
        data.category || '',
        data.city || '',
        data.phone || ''
      ];
    }
    
    // Ajoute la ligne au tableau
    targetSheet.appendRow(row);
    
    // Optionnel : Envoie un email de notification à l'équipe Loqal
    // Décommentez les lignes suivantes pour activer les notifications :
    /*
    MailApp.sendEmail({
      to: 'thomas@loqal.fr',
      subject: `Nouvelle inscription ${sheetName} - Loqal`,
      body: `Nouvelle inscription reçue :\n\n${JSON.stringify(data, null, 2)}`
    });
    */
    
    // Retourne une réponse de succès
    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Retourne une erreur
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Fonction de test (optionnelle)
 * Pour tester le script, exécutez cette fonction depuis l'éditeur Apps Script
 */
function testVisitorSubmission() {
  const testData = {
    type: 'visiteur',
    firstName: 'Jean',
    email: 'jean@example.com',
    regions: 'Bourgogne',
    interests: 'Vin, Gastronomie'
  };
  
  const mockEvent = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };
  
  const response = doPost(mockEvent);
  Logger.log(response.getContent());
}

function testProSubmission() {
  const testData = {
    type: 'professionnel',
    name: 'Marie Dupont',
    email: 'marie@example.com',
    activityName: 'Domaine des Vignes',
    category: 'Vigneron / Domaine viticole',
    city: 'Beaune',
    phone: '06 12 34 56 78'
  };
  
  const mockEvent = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };
  
  const response = doPost(mockEvent);
  Logger.log(response.getContent());
}
