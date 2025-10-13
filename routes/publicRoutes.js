const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');


router.get('/', publicController.getHome);
router.get('/projets', publicController.getProjects);
router.get('/projets/:slug', publicController.getProject);
router.get('/a-propos', publicController.getAbout);
router.get('/contact', publicController.getContact);


module.exports = router;