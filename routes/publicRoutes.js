const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

router.get('/', publicController.getProjects);
router.get('/projets/:slug', publicController.getProject);
router.get('/projets', (req, res) => {
  res.redirect('/');
});
router.get('/contact', publicController.getContact);
router.get('/a-propos', publicController.getAbout);

router.get('/sitemap.xml', publicController.getSitemap);
router.get('/robots.txt', publicController.getRobots);

module.exports = router;
