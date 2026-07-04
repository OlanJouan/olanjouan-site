# Olan Jouan · l'artisan du web

Site vitrine de mon activité : création de sites internet et de fiches Google Business pour artisans, à Montpellier.

Site 100 % statique : HTML, CSS et JavaScript vanilla. Aucun framework, aucune dépendance.

## Structure

```
site web/
├── index.html              → la page principale (one-page)
├── mentions-legales.html   → mentions légales
├── merci.html              → page affichée après l'envoi du formulaire
├── css/style.css           → tout le design
├── js/script.js            → menu, FAQ, formulaire, animations
├── images/                 → photo + favicon
├── robots.txt              → consignes pour Google
└── sitemap.xml             → plan du site pour Google
```

## Les 2 choses à remplacer avant la mise en ligne

1. **PLACEHOLDER-EMAIL** → mon adresse email. Elle apparaît dans :
   - `index.html` (footer)
   - `merci.html` (footer)
   - `mentions-legales.html` (3 endroits + footer)
2. **PLACEHOLDER-DOMAINE.fr** → le vrai nom de domaine. Il apparaît dans :
   - `index.html` (balises canonical, Open Graph, JSON-LD)
   - `robots.txt`
   - `sitemap.xml`

Astuce : dans VS Code, `Ctrl+Maj+H` permet de remplacer partout d'un coup.

## Tester le site en local

Ouvrir un terminal dans ce dossier, puis :

```
python -m http.server 8000
```

Et ouvrir http://localhost:8000 dans le navigateur.
(Ou simplement double-cliquer sur `index.html`, ça marche aussi.)

## Mettre le site en ligne (GitHub + Vercel)

### Étape 1 — Créer le dépôt GitHub

1. Aller sur https://github.com/new
2. Nom du dépôt : `olanjouan-site`
3. Laisser en **Public** (ou Private, les deux marchent avec Vercel)
4. Ne rien cocher d'autre (pas de README, pas de .gitignore, ils existent déjà)
5. Cliquer sur **Create repository**

### Étape 2 — Pousser le code

Ouvrir un terminal dans le dossier `site web` et taper :

```
git remote add origin https://github.com/VOTRE-PSEUDO-GITHUB/olanjouan-site.git
git branch -M main
git push -u origin main
```

(Remplacer `VOTRE-PSEUDO-GITHUB` par votre pseudo GitHub.
Le premier commit est déjà fait, pas besoin de `git add` ni `git commit`.)

### Étape 3 — Connecter à Vercel

1. Aller sur https://vercel.com et se connecter avec le compte GitHub
2. Cliquer sur **Add New… → Project**
3. Choisir le dépôt `olanjouan-site` et cliquer sur **Import**
4. Ne rien changer aux réglages (Vercel détecte que c'est un site statique)
5. Cliquer sur **Deploy**

Le site est en ligne en moins d'une minute, sur une adresse du type
`olanjouan-site.vercel.app`.

Ensuite, à chaque fois qu'on pousse du code sur GitHub (`git push`),
Vercel met le site à jour automatiquement.

### Étape 4 — Plus tard : brancher un nom de domaine

1. Acheter le domaine (OVH, Gandi, Namecheap…)
2. Dans Vercel : ouvrir le projet → **Settings → Domains** → ajouter le domaine
3. Vercel affiche les réglages DNS à faire chez le vendeur du domaine
   (en général : un enregistrement `A` vers `76.76.21.21` et un `CNAME`
   `www` vers `cname.vercel-dns.com`)
4. Attendre la propagation (souvent moins d'une heure, jusqu'à 48h max)
5. Remplacer `PLACEHOLDER-DOMAINE.fr` dans les fichiers (voir plus haut),
   puis pousser la mise à jour

## Tester le formulaire

Le formulaire envoie les messages via Web3Forms sur l'email associé à la clé.

1. Ouvrir le site (en local ou en ligne)
2. Remplir le formulaire avec de vraies infos et envoyer
3. Vérifier l'arrivée de l'email (regarder aussi les spams la première fois)
4. Vérifier que la page `merci.html` s'affiche après l'envoi

## Après la mise en ligne (rappels)

- Créer la propriété dans Google Search Console et soumettre `sitemap.xml`
- Créer ma propre fiche Google Business (autant appliquer ce que je vends)
- Compléter les mentions légales avec le SIRET une fois la micro-entreprise créée
  (la section est déjà prête, en commentaire dans `mentions-legales.html`)
