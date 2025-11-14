const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { upload } = require('../config/cloudinary');

// Routes login/logout
router.get('/login', adminController.getLogin);
router.post('/login', adminController.postLogin);
router.get('/logout', adminController.logout);

// Middleware auth
router.use(adminController.isAuthenticated);

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
  upload.fields([
    { name: 'cover_image', maxCount: 1 },
    { name: 'new_images', maxCount: 10 }
  ]),
  handleMulterError,
  adminController.postEditProject
);

// Supprimer projet
router.post('/projects/delete/:id', adminController.deleteProject);

// Supprimer image individuelle
router.post('/projects/delete-image', adminController.deleteProjectImage);

// Réorganiser l'ordre des projets
router.post('/projects/reorder', adminController.reorderProjects);

// Routes pour éditer les pages (À propos et Contact)
router.get('/pages', adminController.getPages);
router.get('/pages/edit/:slug', adminController.getEditPage);
router.post('/pages/edit/:slug', adminController.postEditPage);

module.exports = router;
