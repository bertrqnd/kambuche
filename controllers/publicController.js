const Project = require('../models/Project');

// Page d'accueil
exports.getHome = async (req, res) => {
    const projects = await Project.find().sort({ date: -1 }).limit(5);
    res.render('public/home', { 
        projects, 
        meta: { 
            title: 'Andrea Layton - Architecte', 
            description: "Découvrez les projets architecturaux d'Andrea Layton" 
        } 
    });
}

// Liste de tous les projets
exports.getProjects = async (req, res) => {
    const projects = await Project.find().sort({ date: -1 });
    res.render('public/projects', { 
        projects, 
        meta: { 
            title: 'Projets - Andrea Layton', 
            description: "Tous les projets architecturaux réalisés par Andrea Layton" 
        } 
    });
}

// Page projet unique
exports.getProject = async (req, res) => {
    const project = await Project.findOne({ slug: req.params.slug });
    if(!project) return res.status(404).render('public/404');

    res.render('public/project', { 
        project, 
        meta: { 
            title: project.title + ' - Andrea Layton', 
            description: project.description 
        } 
    });
}

// Page à propos
exports.getAbout = (req, res) => {
    res.render('public/about', { 
        meta: { 
            title: 'À propos - Andrea Layton', 
            description: "En savoir plus sur l'architecte Andrea Layton" 
        } 
    });
}

// Page contact
exports.getContact = (req, res) => {
    res.render('public/contact', { 
        meta: { 
            title: 'Contact - Andrea Layton', 
            description: "Contactez Andrea Layton, architecte" 
        } 
    });
}
