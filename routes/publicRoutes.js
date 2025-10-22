const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController'); // ✅ pas d’erreur ici

router.get('/', (req, res) => res.redirect('/projets'));
router.get('/projets', publicController.getProjects);
router.get('/projets/:slug', publicController.getProject);
router.get('/contact', publicController.getContact);
router.get('/a-propos', publicController.getAbout);


module.exports = router;