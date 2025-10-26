const Project = require('../models/Project');

// === Liste de tous les projets ===
exports.getProjects = async (req, res) => {
  const projects = await Project.find().sort({ date: -1 });
  console.log('Projets récupérés :', projects);

  // Préparer les données pour le carousel
  const carouselProjects = projects.map(p => ({
    title: p.title,
    description: p.description,
    slug: p.slug,
    image: p.cover_image_url || (p.images_url && p.images_url[0]) || '/images/default.jpg'
  }));

  res.render('public/projects', { 
    projects,          // pour le menu dropdown
    carouselProjects,  // pour le carousel
    meta: { 
      title: 'Andrea Layton - Diplômée d\'architecture', 
      description: "Je réalise vos projets de construction, rénovation et aménagement." 
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
      title: `${project.title} - Andrea Layton`, 
      description: project.description 
    } 
  });
};


// === Page contact ===
exports.getContact = async (req, res) => {
  const projects = await Project.find().sort({ date: -1 });

  res.render('public/contact', { 
    projects,
    meta: { 
      title: 'Contact - Andrea Layton', 
      description: "Contactez Andrea Layton, maître d'œuvre diplômée d’architecture." 
    } 
  });
};


// === Page à propos ===
exports.getAbout = async (req, res) => {
  const projects = await Project.find().sort({ date: -1 });

  res.render('public/about', { 
    projects,
    meta: { 
      title: 'À propos - Andrea Layton', 
      description: "A propos d'Andrea Layton, maître d'oeuvre, diplomée d'architecture." 
    } 
  });
};
