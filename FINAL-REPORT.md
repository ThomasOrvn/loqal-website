# Loqal - Rapport Final de Construction

## ✅ Projet Complété

Le site vitrine Loqal a été construit de A à Z et est prêt pour le déploiement sur **GitHub Pages** avec le domaine personnalisé **loqal.fr**.

---

## 📦 Ce qui a été livré

### 1. Site Statique Complet

**Technologies :**
- **Astro 7.3.5** (framework statique moderne)
- **Tailwind CSS v4** (styling avec design system personnalisé)
- **TypeScript** (typage strict)
- **100% français** avec `lang="fr"`
- **SEO optimisé** (pré-rendu, sitemap, structured data)

**Performance :**
- Pré-rendu complet (SSG) pour un chargement ultra-rapide
- Assets optimisés
- CSS minimal et scopé
- JavaScript uniquement pour les interactions (formulaires, navigation)

### 2. Structure de la Page d'Accueil

#### Section Hero
- Titre : « Le terroir, de l'intérieur. »
- Sous-titre explicatif
- 2 CTAs qui scrollent vers la liste d'attente (onglet visiteur ou pro)
- Fond vert forêt (#213B2F) avec texture grain subtile
- Dégradé vers le fond ivoire en bas

#### Section Univers (6 catégories)
- Vin & Vignobles (photo vineyard.jpg incluse)
- Artisanat (placeholder)
- Pêche (placeholder)
- Chasse (placeholder)
- Gastronomie & Produits locaux (placeholder)
- Savoir-faire traditionnels (placeholder)

Chaque univers a une carte avec image, titre et description.

#### Section Visiteurs
- Titre, description et bénéfices en 3 étapes
- Placeholder pour capture d'écran de l'interface mobile
- Carte flottante avec statistique de démonstration

#### Section Professionnels
- Titre, description et 3 bénéfices principaux
- Placeholder pour captures d'écran du dashboard pro
- Note pour Thomas d'ajouter les vraies captures

#### Section Fondateur
- Présentation de Thomas (seul, pas d'équipe)
- Placeholder pour photo portrait (N&B recommandé)
- Email de contact cliquable (thomas@loqal.fr)

#### Section FAQ
- 6 questions/réponses essentielles
- Accordéons expansibles
- Couvre : disponibilité, tarification, régions, types de pros, liste d'attente, contact

#### Section Liste d'Attente
- **2 onglets** : Visiteur et Professionnel
- **Formulaire Visiteur** :
  - Prénom, email, régions (optionnel), centres d'intérêt (multi-select)
  - Consentement RGPD avec lien vers la politique de confidentialité
  - CTA : « Être prévenu du lancement »
- **Formulaire Professionnel** :
  - Nom, email, nom de l'activité, catégorie (dropdown), commune, téléphone (optionnel)
  - Consentement RGPD
  - CTA : « Réserver ma place de pro fondateur »
- **Sécurité** : Champ honeypot anti-spam
- **Validation** : Côté client avec messages de succès/erreur
- **Backend** : Prêt pour Google Apps Script

### 3. Pages Additionnelles

#### Mentions Légales (`/mentions-legales`)
- Structure complète conforme aux exigences légales françaises
- **Placeholders clairement identifiés** :
  - `[NOM DE LA SOCIÉTÉ À COMPLÉTER]`
  - `[FORME JURIDIQUE À COMPLÉTER]`
  - `[SIRET À COMPLÉTER]`
  - `[ADRESSE À COMPLÉTER]`
  - `[HÉBERGEUR À COMPLÉTER]` → GitHub Pages (instructions incluses)
  - `[ADRESSE DE L'HÉBERGEUR À COMPLÉTER]` → GitHub, Inc., San Francisco

#### Politique de Confidentialité (`/politique-confidentialite`)
- Conforme RGPD
- Détail des données collectées (visiteurs et pros)
- Finalités du traitement
- Droits des utilisateurs (accès, rectification, effacement, etc.)
- Pas de cookies de tracking (mentionné)
- **Placeholders** pour SIRET, adresse, nom de société

#### Page 404 (`/404`)
- Message en français
- Design cohérent avec le site
- Lien de retour à l'accueil

### 4. Design System Loqal

#### Couleurs
- **Ink** #213B2F : Vert forêt (texte, fond hero/footer, boutons primaires)
- **Ivory** #F0EFEA : Fond de page, texte sur fond sombre
- **Olive** #4C7061 : Accents, hover, focus
- **Warm Grey** #69776E : Texte secondaire
- **Border Line** rgba(33, 59, 47, 0.18) : Bordures subtiles

#### Typographie
- **Fraunces** (serif, 400) : Tous les titres (h1-h4)
- **Inter** (sans-serif, 400/500/600) : Texte courant, UI
- Échelle fluide avec `clamp()` pour le responsive
- Letter-spacing ajusté (-0.02em serif, -0.01em sans)

#### Composants
- Rayon par défaut : 6px
- Espacements généreux (py-21 = 5.25rem entre sections)
- Séparateurs fins entre sections (border-top)
- Transitions douces (200ms)
- Ombres discrètes

### 5. SEO & Metadata

#### Meta Tags
- **Title** : « Loqal – Réservez vignerons, artisans et guides du terroir »
- **Description** : « Découvrez et réservez des expériences authentiques auprès des vignerons, artisans et guides locaux. Pros : gérez agenda et réservations. Rejoignez la liste d'attente. »
- **Canonical URL** : https://loqal.fr
- **Lang** : fr

#### Open Graph & Twitter Card
- Prêt pour og:title, og:description, og:image
- Fallback sur logo.png (en attendant génération de og-image.jpg)
- Twitter Card : summary_large_image

#### Fichiers SEO
- ✅ `sitemap.xml` (auto-généré avec dates)
- ✅ `robots.txt` (allow all, lien vers sitemap)
- ✅ Structured Data (Organization schema avec fondateur)

#### Accessibilité
- Balises sémantiques (header, nav, main, section, footer)
- Labels sur tous les champs de formulaire
- Attributs aria pour le menu mobile
- Navigation au clavier fonctionnelle

### 6. Google Apps Script

**Fichier** : `scripts/waitlist-apps-script.gs`

**Fonctionnalités** :
- Reçoit les soumissions POST en JSON
- Route vers l'onglet approprié (Visiteurs / Professionnels)
- Ajoute timestamp français
- Format les données (intérêts en liste CSV)
- Gestion d'erreurs complète
- Fonctions de test incluses
- Instructions détaillées dans les commentaires

**Instructions d'installation** :
1. Créer Google Sheet avec 2 onglets
2. Copier le script dans Apps Script
3. Déployer comme Application Web
4. Configurer l'URL dans `.env`

### 7. Documentation

#### README.md (Français)
Guide complet couvrant :
- Installation et démarrage (`npm install` / `npm run dev`)
- **Modification des contenus** (fichier `src/content/site.json`)
- Pages légales (placeholders à compléter)
- Gestion des images
- **Génération de l'image OG** (og-image-generator.html)
- **Configuration de la liste d'attente** (Google Apps Script)
- **Déploiement sur GitHub Pages** :
  - Activation dans Settings > Pages (source: GitHub Actions)
  - Configuration DNS détaillée (4 A, 4 AAAA, 1 CNAME www)
  - Activation HTTPS
- Commandes npm
- Structure du projet
- Design system
- Maintenance

#### TODO-COMPLETION.md
Checklist détaillée de ce qui reste à faire :
- ✅ Ce qui est terminé (liste exhaustive)
- 📋 À compléter :
  1. **Images** (5 placeholders univers + 3 sections + photo Thomas)
  2. **Image OG** (générer avec og-image-generator.html)
  3. **Mentions légales** (6 placeholders)
  4. **Politique confidentialité** (3 placeholders)
  5. **Google Apps Script** (déploiement et config)
  6. **GitHub Pages** (activation, DNS, HTTPS)
- Tests recommandés avant lancement

#### og-image-generator.html
Outil pour générer l'image Open Graph (1200×630px) :
- Design aux couleurs Loqal
- Instructions intégrées
- Prêt à screenshot

### 8. Déploiement GitHub Pages

#### Workflow GitHub Actions
**Fichier** : `.github/workflows/deploy.yml`

**Configuration** :
- Déclenché sur chaque push vers `main`
- Peut aussi être lancé manuellement (workflow_dispatch)
- Permissions : pages write, id-token write
- **Steps** :
  1. Checkout du code
  2. Setup Node.js 20 avec cache npm
  3. Installation des dépendances (`npm ci`)
  4. Build du site (`npm run build`)
  5. Configuration de Pages
  6. Upload de l'artifact (dossier `dist/`)
  7. Déploiement sur GitHub Pages

#### CNAME
**Fichier** : `public/CNAME`
- Contenu : `loqal.fr`
- Inclus automatiquement dans le build (copié dans `dist/`)
- Permet à GitHub Pages de servir le site sur le domaine personnalisé

#### Configuration Astro
```javascript
site: 'https://loqal.fr'
```
- Défini dans `astro.config.mjs`
- Assure que les URLs canoniques et le sitemap utilisent le bon domaine

#### Instructions de Déploiement

**Pour Thomas :**

1. **Activer GitHub Pages**
   - Repo : ThomasOrvn/loqal-website (public)
   - Settings > Pages
   - Source : **GitHub Actions** (pas "Deploy from a branch")

2. **Configurer le DNS** (chez le registrar)
   ```
   Enregistrements A (IPv4) :
   @  →  185.199.108.153
   @  →  185.199.109.153
   @  →  185.199.110.153
   @  →  185.199.111.153

   Enregistrements AAAA (IPv6) :
   @  →  2606:50c0:8000::153
   @  →  2606:50c0:8001::153
   @  →  2606:50c0:8002::153
   @  →  2606:50c0:8003::153

   CNAME :
   www  →  thomasorvn.github.io.
   ```

3. **Attendre la propagation DNS** (15 min à 48h)

4. **Activer HTTPS**
   - Settings > Pages
   - Cocher "Enforce HTTPS"
   - Attendre le certificat SSL (quelques minutes)

5. **Premier déploiement**
   - Dès que le code est pushé sur main, le workflow démarre automatiquement
   - Suivre la progression dans l'onglet "Actions"
   - Le site sera en ligne sur https://loqal.fr

---

## 🔒 Sécurité : Aucun Secret dans le Repository

### Vérification Effectuée

J'ai effectué une vérification complète du repository pour confirmer qu'**aucun secret n'est présent** :

#### 1. Variables d'Environnement
- ✅ Aucun fichier `.env` committé (protégé par `.gitignore`)
- ✅ Seul `.env.example` est présent (template sans valeurs réelles)
- ✅ `PUBLIC_WAITLIST_ENDPOINT` est une variable **publique** (préfixe `PUBLIC_`)
  - Elle est incluse dans le code JavaScript côté client
  - C'est l'URL d'un script Google Apps Script déployé publiquement
  - **Pas un secret** : n'importe qui peut voir cette URL dans le code source du site
  - Note explicite ajoutée dans `.env.example` pour clarifier

#### 2. Fichiers Vérifiés
- ✅ Aucune clé API privée
- ✅ Aucun token d'authentification
- ✅ Aucun mot de passe
- ✅ Aucune credential
- ✅ Aucune clé privée

#### 3. GitHub Actions
- ✅ Le workflow utilise les permissions standard GitHub Pages
- ✅ `id-token: write` est nécessaire pour l'authentification OIDC (standard GitHub)
- ✅ Aucun secret GitHub Actions requis
- ✅ Pas de `secrets.` utilisés dans le workflow

#### 4. Configuration Git
- ✅ `.gitignore` correctement configuré :
  - `.env` et `.env.production` sont exclus
  - `node_modules/`, `dist/`, `.astro/` exclus
  - Logs exclus

### Pourquoi le Repository est Sûr

1. **Variable Publique Assumée** :
   - `PUBLIC_WAITLIST_ENDPOINT` est **intentionnellement publique**
   - Elle pointe vers un Google Apps Script qui :
     - Est déployé comme "Application Web" accessible à "Tout le monde"
     - Ne retourne pas de données sensibles
     - Sert uniquement à recevoir les inscriptions à la liste d'attente
     - Est protégé par un honeypot anti-spam côté client

2. **Pas d'Authentification Sensible** :
   - Aucune connexion à des bases de données avec credentials
   - Aucun service tiers nécessitant des clés API privées
   - Aucun processus de paiement ou de gestion d'utilisateurs

3. **Architecture Statique** :
   - Site 100% statique (pas de serveur backend)
   - Pas de secrets serveur à gérer
   - Formulaire → Google Apps Script (approche serverless simple)

### Bonnes Pratiques Respectées

- ✅ Documentation claire sur ce qui est public vs. privé
- ✅ Warnings dans `.env.example` et README
- ✅ `.gitignore` correctement configuré
- ✅ Aucun commit de fichier sensible dans l'historique Git
- ✅ Repository prêt à être public sur ThomasOrvn/loqal-website

---

## 📋 Liste de Vérification Finale

### ✅ Complété

- [x] Site Astro + Tailwind construit de zéro
- [x] Design system Loqal implémenté (couleurs, typo, composants)
- [x] Page d'accueil complète (8 sections)
- [x] Pages légales avec placeholders
- [x] Page 404 personnalisée
- [x] Formulaire liste d'attente (2 onglets, validation, honeypot)
- [x] Google Apps Script prêt à déployer
- [x] SEO complet (meta, OG, sitemap, robots.txt, structured data)
- [x] Responsive design (desktop + mobile)
- [x] **GitHub Actions workflow pour GitHub Pages**
- [x] **CNAME file avec loqal.fr**
- [x] **Configuration Astro pour domaine root**
- [x] **README mis à jour avec instructions GitHub Pages**
- [x] **Instructions DNS détaillées (4 A + 4 AAAA + CNAME www)**
- [x] **Vérification sécurité : aucun secret dans le repo**
- [x] Documentation complète en français
- [x] Build réussi (`npm run build` ✅)
- [x] Code committé et pushé sur `main`

### 📝 À Faire par Thomas

#### Images (haute priorité)
- [ ] Remplacer les 5 placeholders des univers
- [ ] Ajouter captures d'écran de l'interface visiteur
- [ ] Ajouter captures d'écran du dashboard pro
- [ ] Ajouter photo portrait (Thomas, N&B recommandé)
- [ ] Générer l'image OG (og-image-generator.html → capture → public/og-image.jpg)

#### Informations Légales
- [ ] Compléter les placeholders dans mentions-legales.astro
- [ ] Compléter les placeholders dans politique-confidentialite.astro

#### Liste d'Attente
- [ ] Créer le Google Sheet (2 onglets : Visiteurs, Professionnels)
- [ ] Déployer le Google Apps Script
- [ ] Créer `.env` avec `PUBLIC_WAITLIST_ENDPOINT=...`
- [ ] Tester le formulaire

#### Déploiement
- [ ] Activer GitHub Pages (Settings > Pages > Source: GitHub Actions)
- [ ] Configurer DNS chez le registrar (4 A, 4 AAAA, 1 CNAME)
- [ ] Attendre propagation DNS
- [ ] Activer "Enforce HTTPS" sur GitHub
- [ ] Vérifier https://loqal.fr

#### Tests Finaux
- [ ] Tester formulaires sur mobile
- [ ] Tester navigation complète
- [ ] Vérifier partage social (image OG)
- [ ] Tester sur Safari, Chrome, Firefox

---

## 🎯 Prêt pour le Lancement

Le site Loqal est **techniquement complet** et prêt pour GitHub Pages. Tous les fichiers sont en place, la documentation est exhaustive, et aucun secret n'est présent dans le repository.

**Repository actuel** : `thomas-orvain/tmp-57f3d8369f1b35a8` (temporaire)  
**Repository final** : `ThomasOrvn/loqal-website` (public)

Thomas peut maintenant :
1. Créer le repository public `ThomasOrvn/loqal-website`
2. Pousser ce code sur ce nouveau repository
3. Suivre les étapes de la checklist ci-dessus
4. Lancer le site sur https://loqal.fr 🚀

---

**Fait avec ❤️ pour Loqal**  
Construit le 27 septembre 2026
