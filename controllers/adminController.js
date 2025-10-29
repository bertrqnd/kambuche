const User = require('../models/User');
const Project = require('../models/Project');
const bcrypt = require('bcrypt');
const slugify = require('slugify');
const { cloudinary } = require('../config/cloudinary');

// ----- Authentification -----

// Afficher le formulaire de login
exports.getLogin = (req, res) => {
  res.render('admin/login');
};

// Traiter le login
exports.postLogin = async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.render('admin/login', { error: 'Utilisateur non trouvé' });

  const match = await user.comparePassword(password);
  if (!match) return res.render('admin/login', { error: 'Mot de passe incorrect' });

  req.session.userId = user._id;
  res.redirect('/admin/projects');
};

// Logout
exports.logout = (req, res) => {
  req.session.destroy();
  res.redirect('/admin/login');
};

// Middleware pour protéger les routes admin
exports.isAuthenticated = (req, res, next) => {
  if (req.session.userId) return next();
  res.redirect('/admin/login');
};

// ----- CRUD Projets -----

// Afficher tous les projets
exports.getProjects = async (req, res) => {
  const projects = await Project.find().sort({ date: -1 });
  res.render('admin/projects', { projects });
};

// Formulaire ajout projet
exports.getAddProject = (req, res) => {
  res.render('admin/addProject');
};

// Ajouter projet (avec Cloudinary)
exports.postAddProject = async (req, res) => {
  try {
    const { title, description } = req.body;

    const cover_image_url = req.files.cover_image
      ? req.files.cover_image[0].path
      : '';

    const images_url = req.files.images
      ? req.files.images.map((file) => file.path)
      : [];

    const slug = slugify(title, { lower: true, strict: true });

    await Project.create({
      title,
      description,
      cover_image_url,
      images_url,
      slug,
    });

    res.redirect('/admin/projects');
  } catch (err) {
    console.error('Erreur ajout projet:', err);
    res.redirect('/admin/projects/add');
  }
};

// Formulaire modifier projet
exports.getEditProject = async (req, res) => {
  const project = await Project.findById(req.params.id);
  res.render('admin/editProject', { project });
};

// Modifier projet (avec Cloudinary)
exports.postEditProject = async (req, res) => {
  try {
    const { title, description } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.redirect('/admin/projects');
    }

    // Mettre à jour titre et description
    project.title = title;
    project.description = description;
    project.slug = slugify(title, { lower: true, strict: true });

    // Nouvelle image de couverture
    if (req.files.cover_image && req.files.cover_image.length > 0) {
      if (project.cover_image_url) {
        const publicId = extractPublicId(project.cover_image_url);
        if (publicId) await cloudinary.uploader.destroy(publicId);
      }
      project.cover_image_url = req.files.cover_image[0].path;
    }

    // Ajouter de nouvelles images à la galerie
    if (req.files.images && req.files.images.length > 0) {
      const newImages = req.files.images.map((file) => file.path);
      project.images_url = [...project.images_url, ...newImages];
    }

    await project.save();
    res.redirect('/admin/projects/edit/' + req.params.id);
  } catch (err) {
    console.error('Erreur modification projet:', err);
    res.redirect('/admin/projects');
  }
};

// Supprimer projet entier + images Cloudinary
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.redirect('/admin/projects');

    // Supprimer couverture Cloudinary
    if (project.cover_image_url) {
      const publicId = extractPublicId(project.cover_image_url);
      if (publicId) await cloudinary.uploader.destroy(publicId);
    }

    // Supprimer galerie Cloudinary
    if (project.images_url && project.images_url.length > 0) {
      for (const imgUrl of project.images_url) {
        const publicId = extractPublicId(imgUrl);
        if (publicId) await cloudinary.uploader.destroy(publicId);
      }
    }

    await Project.findByIdAndDelete(req.params.id);
    res.redirect('/admin/projects');
  } catch (err) {
    console.error('Erreur suppression projet:', err);
    res.redirect('/admin/projects');
  }
};

// Supprimer une image individuelle
exports.deleteProjectImage = async (req, res) => {
  try {
    const { projectId, imageUrl, type } = req.body;
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).send('Projet non trouvé');

    const publicId = extractPublicId(imageUrl);
    if (publicId) await cloudinary.uploader.destroy(publicId);

    if (type === 'cover') {
      project.cover_image_url = '';
    } else if (type === 'gallery') {
      project.images_url = project.images_url.filter((img) => img !== imageUrl);
    }

    await project.save();
    res.redirect('/admin/projects/edit/' + projectId);
  } catch (err) {
    console.error('Erreur suppression image:', err);
    res.redirect('/admin/projects');
  }
};

// ----- Fonction utilitaire -----
function extractPublicId(url) {
  try {
    const parts = url.split('/');
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex === -1) return null;
    const publicIdParts = parts.slice(uploadIndex + 2);
    const filename = publicIdParts.join('/').split('.')[0];
    return filename;
  } catch (err) {
    console.error('Erreur extraction public_id:', err);
    return null;
  }
}
