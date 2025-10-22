const User = require('../models/User');
const Project = require('../models/Project');
const bcrypt = require('bcrypt');
const slugify = require('slugify');
const fs = require('fs');
const path = require('path');

// Afficher le formulaire de login
exports.getLogin = (req, res) => {
    res.render('admin/login');
}

// Traiter le login
exports.postLogin = async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.render('admin/login', { error: 'Utilisateur non trouvé' });

    const match = await user.comparePassword(password);
    if (!match) return res.render('admin/login', { error: 'Mot de passe incorrect' });

    req.session.userId = user._id;
    res.redirect('/admin/projects');
}

// Logout
exports.logout = (req, res) => {
    req.session.destroy();
    res.redirect('/admin/login');
}

// Middleware pour protéger les routes admin
exports.isAuthenticated = (req, res, next) => {
    if (req.session.userId) return next();
    res.redirect('/admin/login');
}

// Afficher tous les projets
exports.getProjects = async (req, res) => {
    const projects = await Project.find().sort({ date: -1 });
    res.render('admin/projects', { projects });
}

// Formulaire ajout projet
exports.getAddProject = (req, res) => {
    res.render('admin/addProject');
}

// Ajouter projet
exports.postAddProject = async (req, res) => {
    const { title, description } = req.body;

    // Noms corrigés pour correspondre aux inputs du formulaire
    const cover_image_url = req.files.cover_image ? '/uploads/' + req.files.cover_image[0].filename : '';
    const images_url = req.files.images ? req.files.images.map(file => '/uploads/' + file.filename) : [];

    const slug = slugify(title, { lower: true, strict: true });

    await Project.create({ title, description, cover_image_url, images_url, slug });
    res.redirect('/admin/projects');
}

// Formulaire modifier projet
exports.getEditProject = async (req, res) => {
    const project = await Project.findById(req.params.id);
    res.render('admin/editProject', { project });
}

// Modifier projet
exports.postEditProject = async (req, res) => {
    const { title, description } = req.body;

    const cover_image_url = req.files.cover_image ? '/uploads/' + req.files.cover_image[0].filename : undefined;
    const images_url = req.files.images ? req.files.images.map(file => '/uploads/' + file.filename) : undefined;

    const slug = slugify(title, { lower: true, strict: true });

    const update = { title, description, slug };
    if (cover_image_url) update.cover_image_url = cover_image_url;
    if (images_url) update.images_url = images_url;

    await Project.findByIdAndUpdate(req.params.id, update);
    res.redirect('/admin/projects/edit/' + req.params.id);
}

// Supprimer projet entier avec suppression des fichiers
exports.deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.redirect('/admin/projects');

        // Supprimer l'image de couverture
        if (project.cover_image_url) {
            const coverPath = path.join(__dirname, '..', 'public', project.cover_image_url);
            if (fs.existsSync(coverPath)) fs.unlinkSync(coverPath);
        }

        // Supprimer les images de la galerie
        if (project.images_url && project.images_url.length > 0) {
            project.images_url.forEach(img => {
                const imgPath = path.join(__dirname, '..', 'public', img);
                if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
            });
        }

        await Project.findByIdAndDelete(req.params.id);
        res.redirect('/admin/projects');

    } catch (err) {
        console.error(err);
        res.redirect('/admin/projects');
    }
}

// Supprimer une image individuelle (couverture ou galerie)
exports.deleteProjectImage = async (req, res) => {
    try {
        const { projectId, imageUrl, type } = req.body;

        const project = await Project.findById(projectId);
        if (!project) return res.status(404).send('Projet non trouvé');

        // Supprime le fichier du dossier public/uploads
        const filePath = path.join(__dirname, '..', 'public', imageUrl);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        if (type === 'cover') {
            project.cover_image_url = '';
        } else if (type === 'gallery') {
            project.images_url = project.images_url.filter(img => img !== imageUrl);
        }

        await project.save();
        res.redirect('/admin/projects/edit/' + projectId);

    } catch (err) {
        console.error(err);
        res.redirect('/admin/projects');
    }
}
