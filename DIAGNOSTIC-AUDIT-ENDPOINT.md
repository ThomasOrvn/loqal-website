# 🔍 Diagnostic : Endpoint d'audit non configuré

## Problème identifié

La variable de repo GitHub `PUBLIC_AUDIT_ENDPOINT` n'est **pas injectée** dans le build déployé.

### Preuve

Dans le site déployé sur GitHub Pages (`https://thomasorvn.github.io/loqal-website/`), le code JavaScript contient :

```javascript
var e=``  // ← Variable d'endpoint vide
```

Au lieu de :

```javascript
var e=`https://script.google.com/macros/s/...`
```

---

## ✅ Ce qui fonctionne

1. ✅ Le workflow GitHub Actions est correctement configuré :
   ```yaml
   - name: Build site
     run: npm run build
     env:
       PUBLIC_WAITLIST_ENDPOINT: ${{ vars.PUBLIC_WAITLIST_ENDPOINT }}
       PUBLIC_AUDIT_ENDPOINT: ${{ vars.PUBLIC_AUDIT_ENDPOINT }}
   ```

2. ✅ Le code Astro utilise correctement la variable :
   ```typescript
   const auditEndpoint = import.meta.env.PUBLIC_AUDIT_ENDPOINT || '';
   ```

3. ✅ Le build local avec `PUBLIC_AUDIT_ENDPOINT=test npm run build` injecte bien la variable

---

## ❌ Cause du problème

La variable de repo GitHub `PUBLIC_AUDIT_ENDPOINT` est soit :
- ❌ Non créée
- ❌ Créée mais vide
- ❌ Créée avec un nom incorrect (casse, espaces)

---

## 🔧 Solution

### 1. Vérifier la variable de repo GitHub

1. Aller sur https://github.com/ThomasOrvn/loqal-website/settings/variables/actions
2. Vérifier que la variable `PUBLIC_AUDIT_ENDPOINT` existe
3. Vérifier qu'elle contient l'URL complète de l'Apps Script déployé

### 2. Format attendu

**Nom exact** : `PUBLIC_AUDIT_ENDPOINT` (sensible à la casse)

**Valeur** : L'URL complète du Google Apps Script en mode Web App, par exemple :
```
https://script.google.com/macros/s/AKfycbz.../exec
```

### 3. Après avoir configuré la variable

Relancer le workflow :
```bash
gh workflow run "Deploy to GitHub Pages" --ref main
```

Ou faire un commit/push sur `main` pour déclencher un déploiement automatique.

### 4. Vérifier l'injection

Après le déploiement, vérifier dans le HTML publié :
```bash
curl -s https://thomasorvn.github.io/loqal-website/ | grep -o 'var e=`[^`]*`' | head -1
```

Doit afficher :
```
var e=`https://script.google.com/macros/s/.../exec`
```

---

## 🧪 Tester l'endpoint manuellement

Une fois l'URL de l'endpoint récupérée, utiliser le script de test :

```bash
node test-audit-endpoint.js "https://script.google.com/macros/s/.../exec"
```

Ce script teste l'endpoint avec les données du Château de Pommard et affiche :
- Le statut HTTP
- La latence
- La réponse JSON complète
- Le score et les critères
- Les sources utilisées

---

## 📝 Diagnostic des erreurs possibles

Si l'endpoint répond mais avec une erreur, voici les causes probables :

### Erreur : "GEMINI_API_KEY not found"
➡️ Ajouter la clé API dans les propriétés du script Apps Script :
   - Ouvrir le script dans Apps Script
   - Projet → Paramètres → Propriétés du script
   - Ajouter : `GEMINI_API_KEY` = `votre_clé_API`

### Erreur : "Model not found" ou "Invalid model"
➡️ Vérifier que le script utilise `gemini-3.8-flash` (ligne 13 de `audit-apps-script.gs`)

### Erreur : "Tool google_search not recognized"
➡️ Vérifier le format de l'outil dans l'appel Gemini :
```javascript
tools: [{ google_search: {} }]
```

### Erreur : CORS (dans le navigateur)
➡️ Vérifier le header CORS dans `doPost()` :
```javascript
const output = ContentService.createTextOutput(
  JSON.stringify(result)
).setMimeType(ContentService.MimeType.TEXT);
output.setHeader('Access-Control-Allow-Origin', '*');
return output;
```

### Erreur : "Service invoked too many times"
➡️ La limite de taux (20 audits/heure) est atteinte
   - Attendre ou augmenter `MAX_AUDITS_PER_HOUR` dans le script

### Timeout ou très lent (>30s)
➡️ L'appel Gemini avec Google Search peut prendre 10-20 secondes
   - C'est normal pour la première requête
   - Les suivantes seront en cache (24h)

---

## ✅ Checklist complète

- [ ] Variable `PUBLIC_AUDIT_ENDPOINT` créée dans GitHub
- [ ] Variable contient l'URL complète du Web App
- [ ] Workflow GitHub Actions a tourné après la création de la variable
- [ ] Le HTML déployé contient l'URL (vérifier avec curl)
- [ ] Le script Apps Script a la propriété `GEMINI_API_KEY`
- [ ] Le script Apps Script utilise `gemini-3.8-flash` et `tools: [{ google_search: {} }]`
- [ ] Le script Apps Script est déployé en Web App avec accès "Tout le monde"
- [ ] Test manuel avec `test-audit-endpoint.js` réussit

---

**Prochaine étape** : Thomas doit configurer `PUBLIC_AUDIT_ENDPOINT` dans les variables de repo GitHub, puis relancer un déploiement.
