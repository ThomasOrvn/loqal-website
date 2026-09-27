# Loqal – Points à compléter avant le lancement

Ce document liste les éléments à finaliser avant la mise en ligne du site.

## ✅ Terminé

- [x] Structure du site statique avec Astro + Tailwind CSS
- [x] Design system Loqal (couleurs, typographie, espacements)
- [x] Page d'accueil avec toutes les sections :
  - Hero
  - Univers du terroir (6 catégories)
  - Section visiteurs
  - Section professionnels
  - Présentation du fondateur
  - FAQ (6 questions)
  - Formulaire liste d'attente (2 onglets)
- [x] Pages légales (mentions légales, politique de confidentialité)
- [x] Page 404 personnalisée
- [x] SEO (meta tags, Open Graph, Twitter Card, sitemap.xml, robots.txt, structured data)
- [x] Header avec navigation fixe et menu mobile
- [x] Footer
- [x] Responsive design (desktop + mobile)
- [x] Script Google Apps Script pour la liste d'attente
- [x] Documentation complète en français (README.md)

## 📋 À compléter

### 1. Images

#### Logo
- [ ] **Créer un logo light/ivoire** pour le fond sombre du hero
  - Actuellement : filtre CSS (inversé)
  - Idéal : SVG avec deux versions (dark + light)
  - Alternative : exporter le logo en ivoire depuis votre logiciel de design

#### Photos des sections
Remplacez les placeholders par vos vraies photos :

- [ ] **Univers** (`src/components/Univers.astro`) :
  - Artisanat : `https://placehold.co/...` → photo réelle
  - Pêche : placeholder → photo réelle
  - Chasse : placeholder → photo réelle
  - Gastronomie : placeholder → photo réelle
  - Savoir-faire : placeholder → photo réelle
  - Vin : `vineyard.jpg` (déjà en place)

- [ ] **Section Visiteurs** (`src/components/Visitors.astro`) :
  - Interface mobile : placeholder → capture d'écran de l'app

- [ ] **Section Professionnels** (`src/components/Pros.astro`) :
  - Captures d'écran du dashboard pro : placeholder → vraies captures

- [ ] **Fondateur** (`src/components/Founder.astro`) :
  - Photo de Thomas : placeholder → vraie photo (N&B de préférence)

#### Image OG
- [ ] **Générer `public/og-image.jpg`** :
  1. Ouvrir `og-image-generator.html` dans un navigateur
  2. Prendre une capture d'écran exacte de la zone 1200×630px
  3. Enregistrer sous `public/og-image.jpg`
  4. Optionnel : optimiser avec TinyPNG

### 2. Mentions légales

Compléter les placeholders dans `src/pages/mentions-legales.astro` :

- [ ] `[NOM DE LA SOCIÉTÉ À COMPLÉTER]`
- [ ] `[FORME JURIDIQUE À COMPLÉTER]` (ex: SAS, SARL, auto-entrepreneur...)
- [ ] `[SIRET À COMPLÉTER]`
- [ ] `[ADRESSE COMPLÈTE À COMPLÉTER]`
- [ ] `[NOM DE L'HÉBERGEUR À COMPLÉTER]` (Vercel, Netlify ou Cloudflare Pages)
- [ ] `[ADRESSE DE L'HÉBERGEUR À COMPLÉTER]`

### 3. Politique de confidentialité

Compléter les placeholders dans `src/pages/politique-confidentialite.astro` :

- [ ] `[NOM DE LA SOCIÉTÉ À COMPLÉTER]`
- [ ] `[SIRET À COMPLÉTER]`
- [ ] `[ADRESSE COMPLÈTE À COMPLÉTER]`

### 4. Google Apps Script (Liste d'attente)

Suivre les instructions dans `scripts/waitlist-apps-script.gs` et le README :

1. [ ] Créer un Google Sheets avec deux onglets :
   - "Visiteurs" (colonnes : Date | Prénom | Email | Régions | Centres d'intérêt)
   - "Professionnels" (colonnes : Date | Nom | Email | Activité | Catégorie | Commune | Téléphone)

2. [ ] Déployer le script :
   - Extensions > Apps Script
   - Coller le code de `scripts/waitlist-apps-script.gs`
   - Déployer > Nouveau déploiement
   - Copier l'URL du déploiement

3. [ ] Configurer l'URL dans le projet :
   - Créer `.env` à la racine
   - Ajouter : `PUBLIC_WAITLIST_ENDPOINT=https://script.google.com/macros/s/VOTRE_ID/exec`

4. [ ] Tester le formulaire

### 5. Déploiement sur GitHub Pages

Le site est configuré pour GitHub Pages avec déploiement automatique :

- [ ] **Activer GitHub Pages** dans Settings > Pages
  - Source : **GitHub Actions** (pas "Deploy from a branch")
  
- [ ] **Configurer le DNS** chez votre registrar (Gandi, OVH, etc.) :
  - Ajouter les 4 enregistrements A (185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153)
  - Ajouter les 4 enregistrements AAAA (2606:50c0:8000::153, etc.)
  - Ajouter le CNAME pour www → thomasorvn.github.io.
  
- [ ] **Attendre la propagation DNS** (15 min à 48h)

- [ ] **Activer HTTPS** dans Settings > Pages :
  - Cocher "Enforce HTTPS"
  - Attendre le provisionnement du certificat SSL

- [ ] **Vérifier le déploiement** :
  - Push sur main déclenche automatiquement le build
  - Suivre la progression dans l'onglet Actions
  - Vérifier que https://loqal.fr fonctionne

- [ ] **Mettre à jour les mentions légales** avec :
  - Hébergeur : GitHub Pages (Microsoft Corporation)
  - Adresse : GitHub, Inc., 88 Colin P Kelly Jr St, San Francisco, CA 94107, USA

## 📝 Notes

### Textes éditables
Tous les textes sont dans `src/content/site.json`. Vous pouvez les modifier facilement sans toucher au code.

### Logo à long terme
Le logo actuel contient une grappe de raisin (spécifique au vin). Pour la refonte avec le positionnement élargi au terroir, pensez à :
- Garder le pin de géolocalisation
- Remplacer ou supprimer la grappe (épi, feuille, main, outil... ou juste le pin)

### Tests recommandés
Avant le lancement :
- [ ] Tester le formulaire visiteur sur mobile
- [ ] Tester le formulaire pro sur mobile
- [ ] Vérifier que tous les emails arrivent bien dans le Google Sheet
- [ ] Tester le partage sur Facebook, Twitter, LinkedIn (vérifier l'image OG)
- [ ] Tester sur Safari, Chrome, Firefox
- [ ] Vérifier l'accessibilité (navigation au clavier, lecteurs d'écran)

## 🚀 Une fois tout complété

1. Build final : `npm run build`
2. Test local : `npm run preview`
3. Déploiement sur l'hébergeur choisi
4. Configuration DNS
5. Test en production
6. C'est en ligne ! 🎉

---

Questions ? thomas@loqal.fr
