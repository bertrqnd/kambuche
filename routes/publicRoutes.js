const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

// Middleware pour extraire et valider la langue
const languageMiddleware = (req, res, next) => {
  const lang = req.params.lang || 'fr';
  const supportedLanguages = ['fr', 'en', 'es'];

  if (!supportedLanguages.includes(lang)) {
    return res.redirect('/fr' + req.path);
  }

  req.language = lang;
  req.i18n.changeLanguage(lang);
  next();
};

// Redirection de la racine vers /fr
router.get('/', (_req, res) => {
  res.redirect('/fr');
});

// Routes avec préfixe de langue
router.get('/:lang', languageMiddleware, publicController.getProjects);
router.get('/:lang/projets', languageMiddleware, (req, res) => {
  res.redirect('/' + req.params.lang);
});
router.get('/:lang/projets/:slug', languageMiddleware, publicController.getProject);
router.get('/:lang/contact', languageMiddleware, publicController.getContact);
router.get('/:lang/a-propos', languageMiddleware, publicController.getAbout);

// SEO (pas de préfixe de langue)
router.get('/sitemap.xml', publicController.getSitemap);
router.get('/robots.txt', publicController.getRobots);

module.exports = router;
