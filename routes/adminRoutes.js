const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const multer = require('multer');
const path = require('path');

// Multer pour upload images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/'); // dossier de destination
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // nom unique
    }
});

// Filtrage éventuel des fichiers
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.test(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Seules les images sont autorisées'));
    }
};

// Création de l’upload Multer
const upload = multer({ storage, fileFilter });

// Routes login/logout
router.get('/login', adminController.getLogin);
router.post('/login', adminController.postLogin);
router.get('/logout', adminController.logout);

// Middleware auth
router.use(adminController.isAuthenticated);

// CRUD projets
router.get('/projects', adminController.getProjects);
router.get('/projects/add', adminController.getAddProject);

// Upload couverture + galerie (noms corrigés pour correspondre au formulaire)
router.post(
  '/projects/add', 
  upload.fields([
    { name: 'cover_image', maxCount: 1 }, 
    { name: 'images', maxCount: 10 }
  ]), 
  adminController.postAddProject
);

router.get('/projects/edit/:id', adminController.getEditProject);
router.post(
  '/projects/edit/:id', 
  upload.fields([
    { name: 'cover_image', maxCount: 1 }, 
    { name: 'images', maxCount: 10 }
  ]), 
  adminController.postEditProject
);

// Supprimer projet entier
router.post('/projects/delete/:id', adminController.deleteProject);

// Supprimer une image individuelle
router.post('/projects/delete-image', adminController.deleteProjectImage);

module.exports = router;
