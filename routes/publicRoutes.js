const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');


router.get('/', (req, res) => {
    res.redirect('/projets');
}); 
router.get('/projets', publicController.getProjects);
router.get('/projets/:slug', publicController.getProject);


module.exports = router;