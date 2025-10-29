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

// Upload Cloudinary (cover + images)
router.post(
  '/projects/add',
  upload.fields([
    { name: 'cover_image', maxCount: 1 },
    { name: 'images', maxCount: 10 }
  ]),
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
  adminController.postEditProject
);

// Supprimer projet
router.post('/projects/delete/:id', adminController.deleteProject);

// Supprimer image individuelle
router.post('/projects/delete-image', adminController.deleteProjectImage);

module.exports = router;
