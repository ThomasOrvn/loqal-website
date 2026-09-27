# 📋 Rapport de test de l'endpoint d'audit

**Date** : 27 septembre 2026  
**Workflow exécuté** : Deploy to GitHub Pages (run #36330421020)  
**Statut du déploiement** : ✅ Réussi  
**Site déployé** : https://thomasorvn.github.io/loqal-website/

---

## 🔍 Résultat du diagnostic

### ❌ Problème identifié

La variable de repo GitHub **`PUBLIC_AUDIT_ENDPOINT` est vide** dans le build déployé.

#### Preuve technique

Inspection du site déployé :
```javascript
// Dans le JavaScript compilé de la section audit :
var e=``  // ← Variable d'endpoint vide !
```

**Impact** : Le formulaire d'audit affiche le mode exemple (données factices) au lieu d'appeler le vrai endpoint Google Apps Script.

---

## ✅ Ce qui fonctionne correctement

1. **✅ Workflow GitHub Actions**  
   - Le workflow passe bien les variables d'environnement au build
   - Dernière exécution : succès en 24 secondes
   - Configuration correcte dans `.github/workflows/deploy.yml`

2. **✅ Code Astro**  
   - Utilise correctement `import.meta.env.PUBLIC_AUDIT_ENDPOINT`
   - Gère le fallback vers le mode exemple si l'endpoint est vide
   - Affiche un message informatif : "ℹ️ Mode exemple : configurez PUBLIC_AUDIT_ENDPOINT"

3. **✅ Build local**  
   - Test avec `PUBLIC_AUDIT_ENDPOINT=test npm run build` : variable injectée ✓
   - Le mécanisme d'injection fonctionne

---

## 🔧 Action requise par Thomas

### Étape 1 : Configurer la variable GitHub

1. Aller sur https://github.com/ThomasOrvn/loqal-website/settings/variables/actions
2. Cliquer sur **"New repository variable"**
3. Renseigner :
   - **Name** : `PUBLIC_AUDIT_ENDPOINT` (exactement, sensible à la casse)
   - **Value** : L'URL complète de votre Web App Google Apps Script

**Format attendu** :
```
https://script.google.com/macros/s/AKfycbz_VOTRE_ID_ICI/exec
```

### Étape 2 : Redéployer

Deux options :

**Option A - Push un commit** (recommandé) :
```bash
# N'importe quel commit sur main déclenchera un redéploiement
git commit --allow-empty -m "Trigger redeploy after endpoint config"
git push
```

**Option B - Workflow manuel** :
```bash
gh workflow run "Deploy to GitHub Pages" --ref main
```

### Étape 3 : Vérifier l'injection

Après le déploiement (24 secondes environ), vérifier :

```bash
curl -s https://thomasorvn.github.io/loqal-website/ | grep -o 'var e=`[^`]*`' | head -1
```

**Résultat attendu** :
```
var e=`https://script.google.com/macros/s/AKfycbz.../exec`
```

Si toujours vide → la variable GitHub n'est pas correctement configurée.

---

## 🧪 Tester l'endpoint manuellement

Une fois la variable configurée et le site redéployé, vous pouvez tester l'endpoint directement avec le script fourni :

```bash
node test-audit-endpoint.js "VOTRE_URL_ENDPOINT_ICI"
```

**Données de test utilisées** :
- Activité : "Château de Pommard"
- Ville : "Pommard"  
- Site : "https://www.chateaudepommard.com"

Le script affichera :
- ✅ Statut HTTP (devrait être 200)
- ⏱️ Latence (généralement 10-20 secondes avec Google Search)
- 📊 Score et critères détaillés
- 📚 Sources utilisées par Gemini
- ❌ Messages d'erreur détaillés si échec

---

## 🐛 Diagnostic des erreurs possibles

### Erreur 1 : "GEMINI_API_KEY not found"

**Cause** : La clé API Gemini n'est pas configurée dans Apps Script

**Solution** :
1. Ouvrir le script dans [Apps Script](https://script.google.com)
2. Aller dans **Projet → Paramètres → Propriétés du script**
3. Ajouter : `GEMINI_API_KEY` = `votre_clé_API_gemini`

---

### Erreur 2 : "Model not found" ou 400 Bad Request

**Cause** : Le modèle Gemini utilisé n'existe pas ou est mal nommé

**Solution** : Vérifier ligne 13 de `scripts/audit-apps-script.gs` :
```javascript
const GEMINI_MODEL = 'gemini-3.8-flash';  // ← Doit être exactement ceci
```

---

### Erreur 3 : "Tool google_search not recognized"

**Cause** : Format incorrect de l'outil de recherche Google

**Solution** : Vérifier dans la fonction `callGeminiAudit` :
```javascript
tools: [{ google_search: {} }]  // ← Format correct pour Gemini 3.8
```

**NE PAS** utiliser l'ancien format :
```javascript
tools: [{ googleSearchRetrieval: {} }]  // ❌ Ancien format (Gemini 1.5)
```

---

### Erreur 4 : CORS (Access-Control-Allow-Origin)

**Symptôme** : Erreur dans la console du navigateur, mais le script `test-audit-endpoint.js` fonctionne

**Cause** : Headers CORS manquants dans la réponse Apps Script

**Solution** : Vérifier dans `doPost()` :
```javascript
const output = ContentService.createTextOutput(
  JSON.stringify(result)
).setMimeType(ContentService.MimeType.TEXT);

output.setHeader('Access-Control-Allow-Origin', '*');  // ← Important !
return output;
```

---

### Erreur 5 : "Service invoked too many times"

**Cause** : Limite de taux dépassée (définie à 20 audits/heure)

**Solutions** :
- Attendre 1 heure
- Augmenter `MAX_AUDITS_PER_HOUR` dans le script (ligne 14)
- Nettoyer les anciennes entrées dans la feuille 'RateLimit'

---

### Erreur 6 : Timeout ou très lent (>30 secondes)

**Cause** : L'appel Gemini avec Google Search peut prendre du temps

**Normal** :
- Première requête pour une activité : 10-20 secondes
- Requêtes suivantes (cache 24h) : 2-5 secondes

**Si > 30s** :
- Vérifier la connexion réseau
- Vérifier les quotas Gemini API
- Essayer sans le site web (champ optionnel)

---

## 📚 Documentation complète

Tous les détails sont dans `DIAGNOSTIC-AUDIT-ENDPOINT.md` :
- ✅ Checklist complète de configuration
- 🔧 Instructions de déploiement Apps Script
- 🧪 Guide de test et débogage
- 📝 Exemples de réponses JSON

---

## ✅ Checklist de validation

- [ ] Variable `PUBLIC_AUDIT_ENDPOINT` créée dans GitHub
- [ ] Variable contient l'URL complète (format `https://script.google.com/macros/s/.../exec`)
- [ ] Workflow GitHub Actions exécuté avec succès après la création
- [ ] Vérification : `curl` retourne l'URL et non une chaîne vide
- [ ] Script Apps Script déployé en "Web app" avec accès "Tout le monde"
- [ ] Propriété `GEMINI_API_KEY` ajoutée dans Apps Script
- [ ] Modèle `gemini-3.8-flash` utilisé dans le script
- [ ] Tool `google_search` (et non `googleSearchRetrieval`)
- [ ] Test manuel avec `node test-audit-endpoint.js` réussi
- [ ] Test dans le navigateur sur le site déployé réussi

---

## 📞 Prochaines étapes

**Immédiat** :
1. Thomas configure `PUBLIC_AUDIT_ENDPOINT` dans GitHub
2. Redéploiement automatique ou manuel
3. Vérification de l'injection dans le HTML déployé

**Après configuration** :
4. Test manuel avec `test-audit-endpoint.js`
5. Test dans le navigateur sur le site déployé
6. Validation avec les vraies données du Château de Pommard

**Si tout fonctionne** :
7. ✅ L'audit est opérationnel en production
8. ✅ Les visiteurs peuvent tester leur réservabilité
9. ✅ Les résultats incluent le score, critères, conseils et sources web

---

**Note** : Ce rapport a été généré automatiquement après le diagnostic du déploiement actuel. Le code du site est correct, seule la variable GitHub doit être configurée pour activer l'endpoint d'audit.
