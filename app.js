require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const cookieParser = require('cookie-parser');
const { doubleCsrf } = require('csrf-csrf');
const DOMPurify = require('isomorphic-dompurify');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const app = express();

// Trust proxy pour Render/Heroku (permet secure cookies derrière reverse proxy)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Helmet avec CSP configurée pour autoriser Cloudinary, TinyMCE et Google Fonts
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tiny.cloud"], // TinyMCE CDN
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://cdn.tiny.cloud",       // TinyMCE styles
        "https://fonts.googleapis.com"   // Google Fonts
      ],
      connectSrc: ["'self'", "https://res.cloudinary.com", "https://cdn.tiny.cloud"], // TinyMCE API
      frameAncestors: ["'self'"],
      fontSrc: [
        "'self'",
        "data:",
        "https://cdn.tiny.cloud",        // TinyMCE fonts
        "https://fonts.gstatic.com"      // Google Fonts
      ],
    },
  })
);

// HSTS - Force HTTPS en production
if (process.env.NODE_ENV === 'production') {
  app.use(helmet.hsts({
    maxAge: 31536000, // 1 an
    includeSubDomains: true,
    preload: true
  }));
}

// COOP - Isolation des fenêtres (sécurité)
// Note: 'same-origin-allow-popups' pour permettre Google OAuth
app.use(helmet.crossOriginOpenerPolicy({ policy: 'same-origin-allow-popups' }));

// Autres middlewares
app.use(compression()); // Gzip compression
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(express.json({ limit: '10kb' }));

// Assets statiques avec cache HTTP optimisé
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1y',        // Cache 1 an pour tous les assets (CSS, JS, images, fonts)
  immutable: true,     // Les fichiers ne changent jamais (recommandé avec cache busting)
  etag: true,          // Génère des ETags pour validation
  lastModified: true   // Ajoute header Last-Modified
}));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads'), {
  maxAge: '1y',
  immutable: true,
  etag: true,
  lastModified: true
}));

// View engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Cookie parser (requis pour CSRF)
app.use(cookieParser());

// Session sécurisée
const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret || sessionSecret === 'secretkey') {
  console.warn('⚠️  ATTENTION: SESSION_SECRET non défini ou trop faible. Définissez une clé forte dans .env');
}

app.use(session({
  secret: sessionSecret || 'dev-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 2, // 2 heures
    httpOnly: true,
    sameSite: 'lax', // 'lax' nécessaire pour OAuth (callback depuis Google)
    secure: process.env.NODE_ENV === 'production' // HTTPS en production
  }
}));

// Configuration Passport Google OAuth
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  },
  (_accessToken, _refreshToken, profile, done) => {
    // Vérifier que l'email est autorisé
    const email = profile.emails && profile.emails[0] && profile.emails[0].value;
    if (email === process.env.ALLOWED_EMAIL) {
      return done(null, { id: profile.id, email: email, name: profile.displayName });
    } else {
      return done(null, false, { message: 'Email non autorisé' });
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

app.use(passport.initialize());
app.use(passport.session());

// Configuration CSRF
const csrfConfig = doubleCsrf({
  getSecret: () => sessionSecret || 'dev-csrf-secret',
  cookieName: '__csrf',
  cookieOptions: {
    httpOnly: true,
    sameSite: 'lax', // 'lax' au lieu de 'strict' pour permettre les formulaires
    secure: process.env.NODE_ENV === 'production',
    path: '/'
  },
  getTokenFromRequest: (req) => {
    // Essayer de récupérer le token depuis plusieurs sources
    return req.body._csrf || req.headers['x-csrf-token'] || req.headers['csrf-token'];
  },
  getSessionIdentifier: (req) => {
    // Utiliser sessionID fourni par express-session
    return req.sessionID || '';
  }
});

const { doubleCsrfProtection, generateCsrfToken } = csrfConfig;

// Middleware pour passer le token CSRF à toutes les vues
app.use((req, res, next) => {
  res.locals.csrfToken = generateCsrfToken(req, res);
  next();
});

// Middleware pour passer la clé TinyMCE et le sanitizer à toutes les vues
app.use((_req, res, next) => {
  res.locals.tinymceApiKey = process.env.TINYMCE_API_KEY || '';

  // Helper pour sanitiser le HTML (protection XSS)
  res.locals.sanitize = (html) => DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'pre', 'code', 'span', 'div'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'style', 'target', 'rel']
  });

  // Helper pour optimiser les URLs Cloudinary
  res.locals.cloudinaryOptimize = (url, width = 1200) => {
    if (!url || typeof url !== 'string' || !url.includes('cloudinary.com')) return url;
    return url.replace('/upload/', `/upload/w_${width},f_auto,q_auto/`);
  };

  // Helper pour images responsive Cloudinary (srcset)
  res.locals.cloudinaryResponsive = (url, sizes = [400, 800, 1200, 1920]) => {
    if (!url || typeof url !== 'string' || !url.includes('cloudinary.com')) {
      return { src: url, srcset: '' };
    }

    const src = url.replace('/upload/', `/upload/w_${sizes[2]},f_auto,q_auto/`);
    const srcset = sizes.map(w =>
      `${url.replace('/upload/', `/upload/w_${w},f_auto,q_auto/`)} ${w}w`
    ).join(', ');

    return { src, srcset };
  };

  next();
});

// Export CSRF protection pour les routes admin (avant le chargement des routes)
module.exports = { doubleCsrfProtection };

// Import routes (après l'export pour éviter la dépendance circulaire)
const publicRoutes = require('./routes/publicRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Routes
app.use('/', publicRoutes);
app.use('/admin', adminRoutes);

// Middleware 404 global
app.use((_req, res) => {
  res.status(404).render('public/404');
});

// Error handler global (doit être après toutes les routes)
app.use((err, _req, res, _next) => {
  console.error('❌ Erreur serveur:', err);

  // Ne pas exposer les détails d'erreur en production
  const isDev = process.env.NODE_ENV !== 'production';

  res.status(err.status || 500);

  // En production, message générique
  if (!isDev) {
    return res.render('public/404', {
      message: 'Une erreur est survenue'
    });
  }

  // En dev, afficher les détails
  res.send(`
    <h1>Erreur ${err.status || 500}</h1>
    <pre>${err.stack}</pre>
  `);
});

// Start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

// Augmenter le timeout pour les uploads de fichiers volumineux (5 minutes)
server.timeout = 300000; // 5 minutes en millisecondes
