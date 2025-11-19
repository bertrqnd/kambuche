const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController'); // ✅ pas d’erreur ici

// La page d'accueil rend directement projects.ejs
router.get('/', publicController.getProjects);

// Route pour les projets individuels
router.get('/projets/:slug', publicController.getProject);
router.get('/projets', (req, res) => {
  res.redirect('/');
});

// Autres pages
router.get('/contact', publicController.getContact);
router.get('/a-propos', publicController.getAbout);

// SEO
router.get('/sitemap.xml', publicController.getSitemap);
router.get('/robots.txt', publicController.getRobots);

module.exports = router;
