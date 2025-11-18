require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const morgan = require('morgan');
const helmet = require('helmet');
const path = require('path');

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

// Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'secretkey',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: { maxAge: 1000 * 60 * 60 * 2 } // 2 heures
}));

// Middleware pour passer la clé TinyMCE à toutes les vues
app.use((_req, res, next) => {
  res.locals.tinymceApiKey = process.env.TINYMCE_API_KEY || '';
  next();
});

// Routes
app.use('/', publicRoutes);
app.use('/admin', adminRoutes);

// Start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

// Augmenter le timeout pour les uploads de fichiers volumineux (5 minutes)
server.timeout = 300000; // 5 minutes en millisecondes
