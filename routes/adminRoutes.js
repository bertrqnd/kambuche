const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const multer = require('multer');
const path = require('path');


// Multer pour upload images
const storage = multer.diskStorage({
destination: (req, file, cb) => cb(null, 'public/uploads/'),
filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });


// Routes login/logout
router.get('/login', adminController.getLogin);
router.post('/login', adminController.postLogin);
router.get('/logout', adminController.logout);


// Middleware auth
router.use(adminController.isAuthenticated);


// CRUD projets
router.get('/projects', adminController.getProjects);
router.get('/projects/add', adminController.getAddProject);
router.post('/projects/add', upload.single('image'), adminController.postAddProject);
router.get('/projects/edit/:id', adminController.getEditProject);
router.post('/projects/edit/:id', upload.single('image'), adminController.postEditProject);
router.post('/projects/delete/:id', adminController.deleteProject);


module.exports = router;