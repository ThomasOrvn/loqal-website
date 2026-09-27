# Loqal – Site vitrine

Site vitrine statique pour Loqal, la plateforme qui connecte les passionnés du terroir avec les vignerons, artisans et guides locaux.

## 🚀 Démarrage rapide

### Prérequis

- Node.js 18+ installé
- npm ou yarn

### Installation

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

Le site sera accessible sur `http://localhost:4321`

## 📝 Modifier les contenus

### Textes du site

Tous les textes sont centralisés dans un seul fichier JSON pour faciliter les modifications :

**`src/content/site.json`**

Ce fichier contient :
- Les textes du hero (titre, sous-titre, boutons)
- Les univers du terroir
- Les sections visiteurs et professionnels
- La présentation du fondateur
- La FAQ
- Les formulaires de liste d'attente
- Le footer

Pour modifier un texte, éditez simplement ce fichier et relancez le serveur de dev.

### Pages légales

Les mentions légales et la politique de confidentialité contiennent des **placeholders** à compléter :

- `src/pages/mentions-legales.astro` : remplacez `[SIRET À COMPLÉTER]`, `[ADRESSE À COMPLÉTER]`, etc.
- `src/pages/politique-confidentialite.astro` : même chose

### Images

Les images sont dans le dossier `public/` :
- `public/logo.png` : logo Loqal (version sombre)
- `public/favicon.ico` : favicon du site
- `public/og-image.jpg` : image de partage sur les réseaux sociaux (à générer)
- `public/images/univers/` : photos des différents univers du terroir
- `public/images/thomas-orvain.webp` : photo du fondateur

**Toutes les photos des univers proviennent d'Unsplash** et sont sous licence libre. Consultez le fichier `CREDITS.md` pour les détails complets (auteurs, sources, licences).

## 🎨 Générer l'image OG (Open Graph)

L'image OG s'affiche quand vous partagez le site sur les réseaux sociaux.

**⚠️ Important :** Cette image n'est pas encore générée. Suivez ces étapes :

1. Ouvrez `og-image-generator.html` dans un navigateur
2. Prenez une capture d'écran exacte de la zone 1200×630px affichée
3. Enregistrez-la sous `public/og-image.jpg`
4. Optionnel : optimisez avec [TinyPNG](https://tinypng.com)

💡 Jusqu'à ce que l'image soit générée, un fallback par défaut sera utilisé par les réseaux sociaux.

## 📮 Configuration de la liste d'attente

Le formulaire de liste d'attente envoie les données vers un Google Apps Script.

### Étape 1 : Créer le Google Sheet

1. Créez un nouveau Google Sheets
2. Créez deux onglets :
   - **Visiteurs** (colonnes : Date | Prénom | Email | Régions | Centres d'intérêt)
   - **Professionnels** (colonnes : Date | Nom | Email | Activité | Catégorie | Commune | Téléphone)

### Étape 2 : Déployer le script

1. Dans Google Sheets, allez dans **Extensions > Apps Script**
2. Supprimez le code par défaut
3. Copiez-collez le contenu de `scripts/waitlist-apps-script.gs`
4. Enregistrez (Ctrl+S ou Cmd+S)
5. Cliquez sur **Déployer > Nouveau déploiement**
   - Type : **Application Web**
   - Exécuter en tant que : **Moi**
   - Qui a accès : **Tout le monde**
6. Autorisez l'application
7. Copiez l'URL du déploiement (ressemble à `https://script.google.com/macros/s/.../exec`)

### Étape 3 : Configurer l'URL dans le site

1. Créez un fichier `.env` à la racine du projet :

```bash
PUBLIC_WAITLIST_ENDPOINT=https://script.google.com/macros/s/VOTRE_ID_SCRIPT/exec
```

2. Redémarrez le serveur de dev

### Test

Remplissez le formulaire sur le site. Les données doivent apparaître dans votre Google Sheet.

## 🎯 Configuration de l'audit gratuit avec Gemini AI

L'audit de réservabilité utilise l'API Gemini de Google avec recherche web (grounding) pour analyser automatiquement la présence en ligne des professionnels.

### Étape 1 : Obtenir une clé API Gemini

1. Allez sur **Google AI Studio** : [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Connectez-vous avec votre compte Google
3. Cliquez sur **Create API key** (ou **Obtenir une clé API**)
4. Choisissez un projet Google Cloud existant ou créez-en un nouveau
5. Copiez la clé API générée (format : `AIza...`)

⚠️ **Important** : Cette clé donne accès à l'API Gemini. Ne la partagez jamais publiquement.

### Étape 2 : Créer le Google Sheet

1. Créez un nouveau Google Sheets
2. Le script créera automatiquement un onglet **Audits** lors du premier audit
3. Cet onglet contiendra : Date | Activité | Ville | Site web | Score

### Étape 3 : Déployer le script d'audit

1. Dans Google Sheets, allez dans **Extensions > Apps Script**
2. Supprimez le code par défaut
3. Copiez-collez le contenu de `scripts/audit-apps-script.gs`
4. Enregistrez (Ctrl+S ou Cmd+S)

### Étape 4 : Ajouter la clé API Gemini comme propriété de script

1. Dans l'éditeur Apps Script, cliquez sur **Projet** (icône d'engrenage ⚙️ dans la barre latérale gauche)
2. Allez dans l'onglet **Propriétés du script**
3. Cliquez sur **Ajouter une propriété de script**
4. Nom : `GEMINI_API_KEY`
5. Valeur : Collez votre clé API Gemini (celle obtenue à l'étape 1)
6. Cliquez sur **Enregistrer les propriétés de script**

⚠️ **Important** : La clé API est stockée de manière sécurisée dans les propriétés du script et ne sera jamais visible dans le code ou les logs.

### Étape 5 : Déployer l'application web

1. Cliquez sur **Déployer > Nouveau déploiement**
2. Type : **Application Web**
3. Description : "Audit Loqal avec Gemini"
4. Exécuter en tant que : **Moi**
5. Qui a accès : **Tout le monde**
6. Cliquez sur **Déployer**
7. **Autorisez l'application** : Google vous demandera des permissions pour :
   - Accéder aux feuilles de calcul
   - Se connecter à un service externe (API Gemini)
   - Acceptez toutes les permissions
8. Copiez l'**URL de déploiement** (format : `https://script.google.com/macros/s/.../exec`)

### Étape 6 : Configurer l'URL dans le site

#### Option A : Variable d'environnement locale (.env)

Pour le développement local, créez un fichier `.env` à la racine du projet :

```bash
PUBLIC_AUDIT_ENDPOINT=https://script.google.com/macros/s/VOTRE_ID_SCRIPT_AUDIT/exec
```

Redémarrez le serveur de dev.

#### Option B : Variable GitHub Actions (pour le déploiement)

Si votre site est déployé via GitHub Actions :

1. Allez dans les **Settings** du repository GitHub
2. **Secrets and variables > Actions**
3. Onglet **Variables**
4. Cliquez sur **New repository variable**
5. Nom : `PUBLIC_AUDIT_ENDPOINT`
6. Valeur : L'URL de déploiement du script
7. Cliquez sur **Add variable**

Le workflow GitHub Actions utilisera automatiquement cette variable lors du build.

### Comment fonctionne l'audit avec Gemini ?

L'API Gemini avec recherche Google (grounding) analyse 4 critères pour un score sur 100 :

1. **Réservation en ligne avec créneaux disponibles (35 points)** : Gemini recherche un système de réservation fonctionnel (Calendly, Regiondo, etc.) et vérifie que des créneaux sont disponibles

2. **Horaires/périodes de visite affichés (25 points)** : Recherche les horaires sur le site web ou la fiche Google Business

3. **Site adapté au mobile (20 points)** : Vérifie l'optimisation mobile (responsive) et HTTPS

4. **Fiche Google Business complète avec horaires et photos (20 points)** : Vérifie l'existence et la complétude de la fiche Google Business Profile

**Avantages de l'analyse par IA :**
- Recherche web en temps réel via Google
- Compréhension contextuelle des pages web
- Vérification des créneaux réellement disponibles
- Analyse de la qualité et complétude des informations

**Sécurité et limites :**
- Cache de 24h par activité/ville pour économiser les requêtes API
- Limite de 20 audits par heure pour éviter les abus
- Les résultats sont enregistrés automatiquement dans la feuille Google

### Mettre à jour le script d'audit

Quand le code du script change (nouvelle version dans `scripts/audit-apps-script.gs`) :

1. **Copier le nouveau code**
   - Ouvrez `scripts/audit-apps-script.gs`
   - Sélectionnez tout (Ctrl+A / Cmd+A) et copiez

2. **Mettre à jour dans Apps Script**
   - Ouvrez votre script dans Apps Script
   - Remplacez tout l'ancien code par le nouveau
   - Enregistrez (Ctrl+S / Cmd+S)

3. **Déployer la nouvelle version**
   - Cliquez sur **Déployer > Gérer les déploiements**
   - Cliquez sur l'icône ✏️ (crayon) à droite
   - **Version** : Nouvelle version
   - Cliquez sur **Déployer**

**L'URL `/exec` reste identique, pas besoin de toucher GitHub.**

### Diagnostiquer les erreurs

Si l'audit retourne une erreur :

- Ouvrez la console navigateur (F12) pour voir les détails techniques
- Dans Apps Script, utilisez **Vue > Journaux** pour voir les logs
- Exécutez la fonction `testAudit()` depuis l'éditeur Apps Script pour tester
- Vérifiez que `GEMINI_API_KEY` est bien configurée dans les propriétés
- Vérifiez que le modèle `gemini-3.8-flash` est accessible

## 🤖 Déploiement automatique des scripts Apps Script

Les scripts Apps Script sont automatiquement déployés depuis GitHub avec [clasp](https://github.com/google/clasp) (Command Line Apps Script Projects).

### Prérequis : Configuration initiale (une seule fois)

#### 1. Activer l'API Google Apps Script

1. Allez sur https://script.google.com/home/usersettings
2. Activez **Google Apps Script API** (basculer le switch)

#### 2. Authentifier clasp localement

Sur votre machine locale, exécutez :

```bash
npx @google/clasp login
```

- Sélectionnez votre compte Google (`thomas@loqal.fr`)
- Autorisez l'accès
- Un fichier `~/.clasprc.json` est créé dans votre dossier utilisateur

#### 3. Récupérer le contenu de `~/.clasprc.json`

**Sur macOS/Linux** :
```bash
cat ~/.clasprc.json
```

**Sur Windows** :
```powershell
type %USERPROFILE%\.clasprc.json
```

Copiez **tout le contenu** du fichier (c'est un JSON avec vos tokens OAuth).

#### 4. Ajouter le secret GitHub `CLASPRC_JSON`

1. Allez sur https://github.com/ThomasOrvn/loqal-website/settings/secrets/actions
2. Cliquez sur **New repository secret**
3. Name : `CLASPRC_JSON`
4. Value : Collez le contenu complet de `~/.clasprc.json`
5. Cliquez sur **Add secret**

⚠️ **Important** : Ne partagez jamais ce fichier publiquement, il contient vos tokens d'authentification.

#### 5. Récupérer les identifiants des scripts

Pour **chaque script** (audit et waitlist) :

**A. Script ID** :
1. Ouvrez le script dans Apps Script
2. Cliquez sur **Projet** (icône ⚙️) dans la barre latérale
3. Copiez l'**ID du script** (format : `AKfycbz...`)

**B. Deployment ID** :
1. Dans le script Apps Script, cliquez sur **Déployer > Gérer les déploiements**
2. À droite de votre déploiement "Application Web", cliquez sur l'icône ⓘ (informations)
3. Copiez l'**ID de déploiement** (format : `AKfycby...`)

#### 6. Ajouter les variables GitHub

1. Allez sur https://github.com/ThomasOrvn/loqal-website/settings/variables/actions
2. Cliquez sur **New repository variable** pour chaque variable :

**Pour le script d'audit (obligatoire)** :
- Name : `APPS_SCRIPT_AUDIT_ID`
- Value : Le Script ID de votre script d'audit

- Name : `APPS_SCRIPT_AUDIT_DEPLOYMENT_ID`
- Value : Le Deployment ID de votre script d'audit

**Pour le script de liste d'attente (optionnel)** :
- Name : `APPS_SCRIPT_WAITLIST_ID`
- Value : Le Script ID de votre script waitlist

- Name : `APPS_SCRIPT_WAITLIST_DEPLOYMENT_ID`
- Value : Le Deployment ID de votre script waitlist

### Utilisation : Déploiement automatique

Une fois la configuration initiale terminée, le déploiement est **entièrement automatique** :

1. **Modifier le code** : Éditez les fichiers dans `apps-script/audit/Code.gs` ou `apps-script/waitlist/Code.gs`
2. **Commit et push** : `git commit -am "Message" && git push`
3. **GitHub Actions déploie** : Le workflow se déclenche automatiquement
4. **Nouvelle version créée** : Une nouvelle version est créée et déployée
5. **L'URL reste identique** : `https://script.google.com/macros/s/.../exec`

**Vous ne devez plus jamais** :
- ❌ Copier-coller le code dans Apps Script
- ❌ Cliquer sur "Déployer > Gérer les déploiements"
- ❌ Créer des versions manuellement

### Déclencher manuellement un déploiement

Vous pouvez aussi déclencher un déploiement sans modifier le code :

1. Allez sur https://github.com/ThomasOrvn/loqal-website/actions/workflows/deploy-apps-script.yml
2. Cliquez sur **Run workflow**
3. Sélectionnez la branche `main`
4. Cliquez sur **Run workflow**

### Vérifier le déploiement

Après un push, le workflow s'exécute automatiquement :

1. Allez sur https://github.com/ThomasOrvn/loqal-website/actions
2. Cliquez sur le workflow **Deploy Apps Script**
3. Suivez la progression en temps réel

En cas d'erreur :
- Le workflow affiche un message clair (secret manquant, erreur clasp, etc.)
- Les logs détaillés sont disponibles dans chaque étape

### Structure des dossiers

```
apps-script/
├── audit/
│   ├── Code.gs           # Script d'audit (ancien scripts/audit-apps-script.gs)
│   └── appsscript.json   # Configuration du projet Apps Script
└── waitlist/
    ├── Code.gs           # Script waitlist (ancien scripts/waitlist-apps-script.gs)
    └── appsscript.json   # Configuration du projet Apps Script
```

**Note** : La propriété `GEMINI_API_KEY` reste dans Apps Script (Projet > Propriétés du script) et n'est **pas touchée** par clasp. Elle n'est jamais versionnée ni déployée depuis GitHub.

### Coûts et limites

L'API Gemini propose un quota gratuit pour les développements et tests. Au-delà de ce quota, la **recherche Google est facturée par requête de recherche** effectuée par le modèle.

**Consultez les tarifs actuels et les limites gratuites :**
- Documentation officielle des prix : [https://ai.google.dev/gemini-api/docs/pricing](https://ai.google.dev/gemini-api/docs/pricing)

Le script utilise par défaut **Gemini 3.8 Flash** qui offre un bon équilibre entre rapidité et qualité d'analyse. Vous pouvez modifier la constante `GEMINI_MODEL` dans le script si nécessaire (voir la liste des modèles disponibles : [https://ai.google.dev/gemini-api/docs/models](https://ai.google.dev/gemini-api/docs/models)).

### Test

Remplissez le formulaire sur le site. Les données doivent apparaître dans votre Google Sheet.

## 🌐 Déploiement sur GitHub Pages

Le site est hébergé gratuitement sur **GitHub Pages** avec le domaine personnalisé `loqal.fr`.

### Configuration du repository

Le site est déployé automatiquement depuis le repository public **ThomasOrvn/loqal-website**.

### Étape 1 : Activer GitHub Pages

1. Allez dans les **Settings** du repository sur GitHub
2. Section **Pages** (dans le menu latéral)
3. Sous **Source**, sélectionnez **GitHub Actions** (au lieu de "Deploy from a branch")
4. Enregistrez

### Étape 2 : Configurer le DNS chez votre registrar

Connectez-vous chez votre registrar (Gandi, OVH, etc.) et configurez les enregistrements DNS pour `loqal.fr` :

#### Enregistrements A (IPv4) :
Ajoutez ces 4 enregistrements A pointant vers les serveurs GitHub Pages :

```
Type: A    Nom: @    Valeur: 185.199.108.153
Type: A    Nom: @    Valeur: 185.199.109.153
Type: A    Nom: @    Valeur: 185.199.110.153
Type: A    Nom: @    Valeur: 185.199.111.153
```

#### Enregistrements AAAA (IPv6) :
Ajoutez ces 4 enregistrements AAAA :

```
Type: AAAA    Nom: @    Valeur: 2606:50c0:8000::153
Type: AAAA    Nom: @    Valeur: 2606:50c0:8001::153
Type: AAAA    Nom: @    Valeur: 2606:50c0:8002::153
Type: AAAA    Nom: @    Valeur: 2606:50c0:8003::153
```

#### Enregistrement CNAME pour www :
Redirigez le sous-domaine www vers votre site GitHub Pages :

```
Type: CNAME    Nom: www    Valeur: thomasorvn.github.io.
```

⚠️ **Important** : Notez le point final dans `thomasorvn.github.io.`

### Étape 3 : Activer HTTPS

Une fois les DNS propagés (15 minutes à 48h selon les registrars) :

1. Retournez dans **Settings > Pages** sur GitHub
2. Cochez **Enforce HTTPS**
3. Attendez que le certificat SSL soit provisionné (quelques minutes)

### Étape 4 : Vérifier le déploiement

1. Chaque push sur la branche `main` déclenche automatiquement un déploiement
2. Suivez la progression dans l'onglet **Actions** du repository
3. Une fois terminé, votre site est en ligne sur https://loqal.fr

### Variables d'environnement

Pour configurer l'URL du script Google Apps Script de la liste d'attente :

1. Créez un fichier `.env` à la racine du projet (en local uniquement) :

```bash
PUBLIC_WAITLIST_ENDPOINT=https://script.google.com/macros/s/VOTRE_ID_SCRIPT/exec
```

2. Commitez et pushez vos changements
3. Le workflow GitHub Actions build le site avec la variable

⚠️ **Note** : `PUBLIC_WAITLIST_ENDPOINT` est une variable publique (préfixe `PUBLIC_`). Elle est incluse dans le code JavaScript côté client et n'est pas un secret. Ne mettez jamais de clés API privées ou de secrets dans ce fichier.

### Workflow GitHub Actions

Le fichier `.github/workflows/deploy.yml` est déjà configuré pour :
- Builder le site à chaque push sur `main`
- Déployer automatiquement sur GitHub Pages
- Inclure le fichier `CNAME` pour le domaine personnalisé

Vous n'avez rien à faire, tout est automatique !

## 🛠️ Commandes npm

```bash
# Développement
npm run dev              # Lance le serveur de dev sur localhost:4321

# Production
npm run build            # Build le site dans dist/
npm run preview          # Prévisualise le build en local

# Checks
npm run astro check      # Vérifie les erreurs TypeScript et Astro
```

## 📁 Structure du projet

```
/
├── public/              # Assets statiques (images, favicon, robots.txt)
├── scripts/             # Script Google Apps Script pour la waitlist
├── src/
│   ├── components/      # Composants Astro réutilisables
│   ├── content/         # Fichier JSON avec tous les textes
│   ├── layouts/         # Layout principal
│   ├── pages/           # Pages du site (index, legal, 404)
│   └── styles/          # CSS global et Tailwind
├── astro.config.mjs     # Config Astro
├── tailwind.config.mjs  # Config Tailwind (couleurs, fonts...)
└── package.json
```

## 🎨 Design system

Le design system Loqal est configuré dans `tailwind.config.mjs` et `src/styles/global.css`.

### Couleurs

- **Ink** (#213B2F) : vert forêt, texte principal, fond hero/footer
- **Ivory** (#F0EFEA) : fond de page, texte sur fond sombre
- **Olive** (#4C7061) : accents, hover, focus
- **Warm Grey** (#69776E) : texte secondaire

### Typographie

- **Fraunces** (serif) : titres (h1, h2, h3, h4)
- **Inter** (sans-serif) : texte courant, UI

## 🔧 Maintenance

### Ajouter une nouvelle section

1. Créez un composant dans `src/components/`
2. Importez-le dans `src/pages/index.astro`
3. Ajoutez les textes dans `src/content/site.json`

### Modifier les couleurs

Éditez `tailwind.config.mjs` dans la section `theme.extend.colors`.

### Ajouter une page

Créez un fichier `.astro` dans `src/pages/`. Astro génère automatiquement les routes :
- `src/pages/about.astro` → `/about`
- `src/pages/blog/post.astro` → `/blog/post`

## 📷 Crédits photos

Toutes les photos utilisées sur le site proviennent d'Unsplash et sont sous licence libre. Les détails complets (auteurs, titres, sources et licences) sont disponibles dans le fichier `CREDITS.md` à la racine du projet.

Photos des univers :
- **Vin & Vignobles** : Hermes Rivera
- **Artisanat** : Lenny Kuhne
- **Pêche** : Jonny Gios
- **Chasse** : Lukasz Szmigiel
- **Gastronomie** : Toa Heftiba
- **Savoir-faire** : Quino Al

## 📧 Support

Questions ? Contactez Thomas à [thomas@loqal.fr](mailto:thomas@loqal.fr)

## 📄 Licence

© 2026 Loqal. Tous droits réservés.
