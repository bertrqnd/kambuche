const Project = require('../models/Project');
const Page = require('../models/Page');

// === Liste de tous les projets ===
exports.getProjects = async (req, res) => {
  const projects = await Project.find().sort({ order: 1, date: -1 });
  console.log('Projets récupérés :', projects);

  // Préparer les données pour le carousel
  const carouselProjects = projects.map(p => ({
    title: p.title,
    short_description: p.short_description,
    slug: p.slug,
    image: p.cover_image_url || (p.images_url && p.images_url[0]) || '/images/default.jpg'
  }));

  res.render('public/projects', { 
    projects,          // pour le menu dropdown
    carouselProjects,  // pour le carousel
    meta: { 
      title: 'Andrea Layton - Maître d\'œuvre',
      description: "Diplômée d'architecture. Je réalise vos projets de construction, rénovation et aménagement." 
    } 
  });
};


// === Page projet unique ===
exports.getProject = async (req, res) => {
  const project = await Project.findOne({ slug: req.params.slug });
  if (!project) return res.status(404).render('public/404');

  res.render('public/project', { 
    project, 
    meta: { 
      title: `${project.title} par Andrea Layton, Maître d\'œuvre`, 
      description: project.description 
    } 
  });
};


// === Page contact ===
exports.getContact = async (req, res) => {
  const projects = await Project.find().sort({ order: 1, date: -1 });
  let page = await Page.findOne({ slug: 'contact' });

  // Si la page n'existe pas, créer un contenu par défaut
  if (!page) {
    page = {
      title: 'Contact',
      content: '<p>Contenu de la page Contact...</p>'
    };
  }

  res.render('public/contact', {
    projects,
    page,
    meta: {
      title: `${page.title} - Andrea Layton - Maître d\'œuvre`,
      description: "Contactez-moi."
    }
  });
};


// === Page à propos ===
exports.getAbout = async (req, res) => {
  const projects = await Project.find().sort({ order: 1, date: -1 });
  let page = await Page.findOne({ slug: 'about' });

  // Si la page n'existe pas, créer un contenu par défaut
  if (!page) {
    page = {
      title: 'À propos',
      content: '<p>Contenu de la page À propos...</p>'
    };
  }

  res.render('public/about', {
    projects,
    page,
    meta: {
      title: `${page.title} - Andrea Layton - Maître d\'œuvre`,
      description: "En savoir plus sur moi."
    }
  });
};
