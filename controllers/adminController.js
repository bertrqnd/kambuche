const User = require('../models/User');
const Project = require('../models/Project');
const bcrypt = require('bcrypt');
const slugify = require('slugify');

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

    const cover_image_url = req.files.cover ? '/uploads/' + req.files.cover[0].filename : '';
    const images_url = req.files.gallery ? req.files.gallery.map(file => '/uploads/' + file.filename) : [];

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

    const cover_image_url = req.files.cover ? '/uploads/' + req.files.cover[0].filename : undefined;
    const images_url = req.files.gallery ? req.files.gallery.map(file => '/uploads/' + file.filename) : undefined;

    const slug = slugify(title, { lower: true, strict: true });

    const update = { title, description, slug };
    if (cover_image_url) update.cover_image_url = cover_image_url;
    if (images_url) update.images_url = images_url;

    await Project.findByIdAndUpdate(req.params.id, update);
    res.redirect('/admin/projects');
}

// Supprimer projet
exports.deleteProject = async (req, res) => {
    await Project.findByIdAndDelete(req.params.id);
    res.redirect('/admin/projects');
}
