const express = require('express');
const router = express.Router();
const passport = require('passport');
const rateLimit = require('express-rate-limit');
const adminController = require('../controllers/adminController');
const { upload } = require('../config/cloudinary');
const { doubleCsrfProtection } = require('../app');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives maximum
  message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
});

router.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/admin/projects');
  }
  res.redirect('/admin/login');
});

router.get('/login', adminController.getLogin);

router.get('/auth/google', authLimiter, passport.authenticate('google', {
  scope: ['profile', 'email']
}));

router.get('/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/admin/login?error=unauthorized',
    failureMessage: true
  }),
  (req, res) => {
    res.redirect('/admin/projects');
  }
);

router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) console.error('Erreur logout:', err);
    req.session.destroy();
    res.redirect('/admin/login');
  });
});

const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/admin/login');
};

router.use(isAuthenticated);

router.get('/projects', adminController.getProjects);
router.get('/projects/add', adminController.getAddProject);

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

router.post(
  '/projects/add',
  upload.fields([
    { name: 'cover_image', maxCount: 1 },
    { name: 'images', maxCount: 10 }
  ]),
  handleMulterError,
  (req, res, next) => {
    console.log('📝 CSRF Token reçu:', req.body._csrf?.substring(0, 20) + '...');
    console.log('🍪 CSRF Cookie:', req.cookies.__csrf?.substring(0, 20) + '...');
    console.log('🔑 Session ID:', req.sessionID?.substring(0, 20) + '...');
    next();
  },
  doubleCsrfProtection,
  adminController.postAddProject
);

router.get('/projects/edit/:id', adminController.getEditProject);

router.post(
  '/projects/edit/:id',
  upload.fields([
    { name: 'cover_image', maxCount: 1 },
    { name: 'new_images', maxCount: 10 }
  ]),
  handleMulterError,
  (req, res, next) => {
    console.log('🔧 EDIT - CSRF Token reçu:', req.body._csrf?.substring(0, 20) + '...');
    console.log('🔧 EDIT - CSRF Cookie:', req.cookies.__csrf?.substring(0, 20) + '...');
    console.log('🔧 EDIT - Session ID:', req.sessionID?.substring(0, 20) + '...');
    next();
  },
  doubleCsrfProtection,
  adminController.postEditProject
);

router.post('/projects/delete/:id', doubleCsrfProtection, adminController.deleteProject);
router.post('/projects/delete-image', doubleCsrfProtection, adminController.deleteProjectImage);
router.post('/projects/reorder', doubleCsrfProtection, adminController.reorderProjects);

router.get('/pages', adminController.getPages);
router.get('/pages/edit/:slug', adminController.getEditPage);
router.post(
  '/pages/edit/:slug',
  upload.single('image'),
  handleMulterError,
  doubleCsrfProtection,
  adminController.postEditPage
);

module.exports = router;
