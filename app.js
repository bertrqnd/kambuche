require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const morgan = require('morgan');
const helmet = require('helmet');
const path = require('path');
const cookieParser = require('cookie-parser');
const { doubleCsrf } = require('csrf-csrf');
const DOMPurify = require('isomorphic-dompurify');

// Import routes
const publicRoutes = require('./routes/publicRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Helmet avec CSP configurée pour autoriser Cloudinary et TinyMCE
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tiny.cloud"], // TinyMCE CDN
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.tiny.cloud"], // TinyMCE styles
      connectSrc: ["'self'", "https://res.cloudinary.com", "https://cdn.tiny.cloud"], // TinyMCE API
      frameAncestors: ["'self'"],
      fontSrc: ["'self'", "data:", "https://cdn.tiny.cloud"], // TinyMCE fonts
    },
  })
);

// Autres middlewares
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));

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
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production' // HTTPS en production
  }
}));

// Configuration CSRF
const { doubleCsrfProtection, generateToken } = doubleCsrf({
  getSecret: () => sessionSecret || 'dev-csrf-secret',
  cookieName: '__csrf',
  cookieOptions: {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production'
  },
  getTokenFromRequest: (req) => req.body._csrf || req.headers['x-csrf-token']
});

// Middleware pour passer le token CSRF à toutes les vues
app.use((req, res, next) => {
  res.locals.csrfToken = generateToken(req, res);
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
  next();
});

// Routes
app.use('/', publicRoutes);
app.use('/admin', adminRoutes);

// Export CSRF protection pour les routes admin
module.exports = { doubleCsrfProtection };

// Start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

// Augmenter le timeout pour les uploads de fichiers volumineux (5 minutes)
server.timeout = 300000; // 5 minutes en millisecondes
