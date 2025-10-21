const Project = require('../models/Project');


// Liste de tous les projets
exports.getProjects = async (req, res) => {
    const projects = await Project.find().sort({ date: -1 });
    console.log('Projets récupérés :', projects);

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


// Page contact
exports.getContact = (req, res) => {
    res.render('public/contact', { 
        meta: { 
            title: 'Contact - Andrea Layton', 
            description: "Contactez Andrea Layton, architecte" 
        } 
    });
}
