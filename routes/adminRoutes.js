const express = require('express');
const router = express.Router();
const passport = require('passport');
const rateLimit = require('express-rate-limit');
const adminController = require('../controllers/adminController');
const { upload } = require('../config/cloudinary');
const { doubleCsrfProtection } = require('../app');

// Rate limiter pour les tentatives de connexion
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives maximum
  message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Page de login
router.get('/login', adminController.getLogin);

// Démarrer l'authentification Google (avec rate limiting)
router.get('/auth/google', authLimiter, passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// Callback Google
router.get('/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/admin/login?error=unauthorized',
    failureMessage: true
  }),
  (req, res) => {
    // Authentification réussie
    res.redirect('/admin/projects');
  }
);

// Logout
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) console.error('Erreur logout:', err);
    req.session.destroy();
    res.redirect('/admin/login');
  });
});

// Middleware auth (vérifie que l'utilisateur est connecté via Passport)
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/admin/login');
};

router.use(isAuthenticated);

// CRUD projets
router.get('/projects', adminController.getProjects);
router.get('/projects/add', adminController.getAddProject);

// Middleware de gestion d'erreur Multer
const handleMulterError = (err, req, res, next) => {
  if (err) {
    console.error('❌ Erreur Multer:', err.message);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).send('Fichier trop volumineux (max 10MB)');
    }
    return res.status(400).send(`Erreur d'upload: ${err.message}`);
  }
  next();
};

// Upload Cloudinary (cover + images)
router.post(
  '/projects/add',
  doubleCsrfProtection,
  upload.fields([
    { name: 'cover_image', maxCount: 1 },
    { name: 'images', maxCount: 10 }
  ]),
  handleMulterError,
  adminController.postAddProject
);

router.get('/projects/edit/:id', adminController.getEditProject);

// Correction ici aussi pour "new_images"
router.post(
  '/projects/edit/:id',
  doubleCsrfProtection,
  upload.fields([
    { name: 'cover_image', maxCount: 1 },
    { name: 'new_images', maxCount: 10 }
  ]),
  handleMulterError,
  adminController.postEditProject
);

// Supprimer projet
router.post('/projects/delete/:id', doubleCsrfProtection, adminController.deleteProject);

// Supprimer image individuelle
router.post('/projects/delete-image', doubleCsrfProtection, adminController.deleteProjectImage);

// Réorganiser l'ordre des projets
router.post('/projects/reorder', doubleCsrfProtection, adminController.reorderProjects);

// Routes pour éditer les pages (À propos et Contact)
router.get('/pages', adminController.getPages);
router.get('/pages/edit/:slug', adminController.getEditPage);
router.post(
  '/pages/edit/:slug',
  doubleCsrfProtection,
  upload.single('image'),
  handleMulterError,
  adminController.postEditPage
);

module.exports = router;
