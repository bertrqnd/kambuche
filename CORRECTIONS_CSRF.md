# Corrections CSRF et Optimisations - Récapitulatif

## 🐛 **Problèmes identifiés**

### 1. Invalid CSRF Token
**Symptôme :** "Erreur d'upload : invalid csrf token" lors de la création/modification de projets

**Causes possibles :**
- Cookie CSRF avec `sameSite: 'strict'` trop restrictif
- Session identifier mal configuré
- COOP policy trop restrictive

### 2. Route /admin sans redirection
**Symptôme :** `/admin` ne redirige nulle part

### 3. DOCTYPE manquant
**Symptôme :** PageSpeed Insights - "La page n'a pas d'attribut doctype HTML"

### 4. Google Fonts bloqué par CSP
**Symptôme :** "Refused to load the stylesheet" - Violation Content Security Policy

---

## ✅ **Corrections appliquées**

### **1. Configuration CSRF améliorée**
**Fichier :** `app.js` lignes 140-158

**Changements :**
```javascript
// AVANT
cookieOptions: {
  sameSite: 'strict',  // ❌ Trop restrictif
  secure: process.env.NODE_ENV === 'production'
}
getSessionIdentifier: (req) => req.session?.id || ''  // ❌ session.id n'existe pas toujours

// APRÈS
cookieOptions: {
  sameSite: 'lax',  // ✅ Permet les formulaires POST
  secure: process.env.NODE_ENV === 'production',
  path: '/'  // ✅ Cookie disponible sur tous les chemins
}
getSessionIdentifier: (req) => req.sessionID || ''  // ✅ Utilise sessionID d'express-session
```

**Impact :** Permet aux formulaires admin de fonctionner avec CSRF protection

---

### **2. COOP Policy ajustée**
**Fichier :** `app.js` ligne 59

**Changement :**
```javascript
// AVANT
app.use(helmet.crossOriginOpenerPolicy({ policy: 'same-origin' }));  // ❌ Bloque Google OAuth

// APRÈS
app.use(helmet.crossOriginOpenerPolicy({ policy: 'same-origin-allow-popups' }));  // ✅ Permet OAuth
```

**Impact :** Google OAuth fonctionne correctement

---

### **3. Redirection /admin**
**Fichier :** `routes/adminRoutes.js` lignes 18-24

**Ajout :**
```javascript
router.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/admin/projects');
  }
  res.redirect('/admin/login');
});
```

**Impact :**
- `/admin` → `/admin/login` (si non connecté)
- `/admin` → `/admin/projects` (si connecté)

---

### **4. DOCTYPE ajouté**
**Fichiers :**
- `views/public/projects.ejs` ligne 1
- `views/public/project.ejs` ligne 1

**Ajout :**
```html
<!DOCTYPE html>
```

**Impact :** Mode standards du navigateur activé, PageSpeed Insights content

---

### **5. Google Fonts autorisé dans CSP**
**Fichier :** `app.js` lignes 30-43

**Changement :**
```javascript
// Ajout dans styleSrc
styleSrc: [
  "'self'",
  "'unsafe-inline'",
  "https://cdn.tiny.cloud",
  "https://fonts.googleapis.com"   // ✅ NOUVEAU
],

// Ajout dans fontSrc
fontSrc: [
  "'self'",
  "data:",
  "https://cdn.tiny.cloud",
  "https://fonts.gstatic.com"      // ✅ NOUVEAU
]
```

**Impact :** Google Fonts se charge correctement

---

### **6. Logs de débogage CSRF**
**Fichier :** `routes/adminRoutes.js` lignes 84-89

**Ajout :**
```javascript
router.post('/projects/add',
  (req, res, next) => {
    console.log('📝 CSRF Token reçu:', req.body._csrf?.substring(0, 20) + '...');
    console.log('🍪 CSRF Cookie:', req.cookies.__csrf?.substring(0, 20) + '...');
    console.log('🔑 Session ID:', req.sessionID?.substring(0, 20) + '...');
    next();
  },
  doubleCsrfProtection,
  // ...
);
```

**Impact :** Permet de débugger les problèmes CSRF

---

## 🧪 **Comment tester**

### Test 1 : CSRF Token
```bash
1. Redémarrer le serveur : npm start
2. Se connecter à /admin
3. Créer un projet avec une image
4. Vérifier les logs dans la console serveur
5. Le projet doit être créé sans erreur ✅
```

### Test 2 : Redirection /admin
```bash
1. Déconnexion : http://localhost:3000/admin/logout
2. Aller sur : http://localhost:3000/admin
   → Doit rediriger vers /admin/login ✅

3. Se connecter
4. Aller sur : http://localhost:3000/admin
   → Doit rediriger vers /admin/projects ✅
```

### Test 3 : PageSpeed Insights
```bash
1. Déployer sur Render
2. Tester sur https://pagespeed.web.dev/
3. Score "Bonnes pratiques" : 100/100 ✅
```

---

## 🔍 **Si CSRF ne fonctionne toujours pas**

### Étape 1 : Vérifier les logs
Les logs doivent afficher :
```
📝 CSRF Token reçu: abc123xyz...
🍪 CSRF Cookie: abc123xyz...
🔑 Session ID: xyz789abc...
```

**Si Token = undefined :**
- Le formulaire n'envoie pas le champ `_csrf`
- Vérifier que `<input type="hidden" name="_csrf" value="<%= csrfToken %>">` existe

**Si Cookie = undefined :**
- Le cookie CSRF n'est pas créé
- Vérifier que `cookie-parser` est bien chargé AVANT la config CSRF

**Si Session ID = undefined :**
- La session n'est pas créée
- Vérifier la connexion MongoDB
- Vérifier que `express-session` est configuré

---

### Étape 2 : Vérifier l'ordre des middlewares
Dans `app.js`, l'ordre DOIT être :
```javascript
1. app.use(cookieParser());
2. app.use(session({ ... }));
3. app.use(passport.initialize());
4. app.use(passport.session());
5. const csrfConfig = doubleCsrf({ ... });
6. app.use((req, res, next) => { res.locals.csrfToken = ... });
```

---

### Étape 3 : Solution de secours (désactiver CSRF temporairement)
**⚠️ UNIQUEMENT POUR DEBUG**

Dans `routes/adminRoutes.js`, commenter temporairement :
```javascript
router.post('/projects/add',
  // doubleCsrfProtection,  // ❌ COMMENTÉ TEMPORAIREMENT
  upload.fields([...]),
  // ...
);
```

Si ça marche sans CSRF, le problème vient de la config CSRF.

---

## 📊 **Résumé des optimisations (bonus)**

### Performance
- ✅ Google Fonts avec preconnect
- ✅ Images Cloudinary optimisées (f_auto, q_auto, w_XXX)
- ✅ Cache HTTP 1 an
- ✅ Minification CSS/JS disponible (`npm run minify`)

### SEO
- ✅ DOCTYPE HTML5
- ✅ Meta tags complets (OG, Twitter, Schema.org)
- ✅ Sitemap XML dynamique
- ✅ Robots.txt

### Sécurité
- ✅ CSRF protection
- ✅ CSP configuré
- ✅ COOP header
- ✅ HSTS (production)
- ✅ Helmet activé

---

Date : 22/11/2025
