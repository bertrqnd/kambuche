const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { upload } = require('../config/cloudinary'); // Import depuis cloudinary config

// Routes login/logout
router.get('/login', adminController.getLogin);
router.post('/login', adminController.postLogin);
router.get('/logout', adminController.logout);

// Middleware auth
router.use(adminController.isAuthenticated);

// CRUD projets
router.get('/projects', adminController.getProjects);
router.get('/projects/add', adminController.getAddProject);

// Upload couverture + galerie avec Cloudinary
router.post(
  '/projects/add', 
  upload.fields([
    { name: 'cover_image', maxCount: 1 }, 
    { name: 'images', maxCount: 20 }
  ]), 
  adminController.postAddProject
);

router.get('/projects/edit/:id', adminController.getEditProject);

// Éditer projet - IMPORTANT : new_images au lieu de images
router.post(
  '/projects/edit/:id', 
  upload.fields([
    { name: 'cover_image', maxCount: 1 }, 
    { name: 'new_images', maxCount: 20 } // new_images pour l'édition
  ]), 
  adminController.postEditProject
);

// Supprimer projet entier
router.post('/projects/delete/:id', adminController.deleteProject);

// Supprimer une image individuelle
router.post('/projects/delete-image', adminController.deleteProjectImage);

module.exports = router;