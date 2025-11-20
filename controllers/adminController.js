const Project = require('../models/Project');
const Page = require('../models/Page');
const slugify = require('slugify');
const { cloudinary } = require('../config/cloudinary');

// Page de login (affiche le bouton Google)
exports.getLogin = (req, res) => {
    res.render('admin/login', { query: req.query });
}

exports.getProjects = async (req, res) => {
    const projects = await Project.find().sort({ order: 1, date: -1 });
    res.render('admin/projects', { projects });
}

exports.getAddProject = (req, res) => {
    res.render('admin/addProject');
}

exports.postAddProject = async (req, res) => {
    try {
        const { title, short_description, usage, surface, location_year, description, language } = req.body;


        const cover_image_url = req.files && req.files.cover_image ?
            req.files.cover_image[0].path : '';

        const images_url = req.files && req.files.images ?
            req.files.images.map(file => file.path) : [];


        const slug = slugify(title, { lower: true, strict: true });

        await Project.create({
            title,
            short_description,
            usage,
            surface,
            location_year,
            description,
            cover_image_url,
            images_url,
            slug,
            language: language || 'fr'
        });

        console.log('✅ Projet créé avec succès');
        res.redirect('/admin/projects');
    } catch (err) {
        console.error('❌ Erreur ajout projet:', err);
        res.redirect('/admin/projects/add');
    }
}

exports.getEditProject = async (req, res) => {
    const project = await Project.findById(req.params.id);
    res.render('admin/editProject', { project });
}

exports.postEditProject = async (req, res) => {
    try {
        const { title, short_description, usage, surface, location_year, description, gallery_order, language } = req.body;
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.redirect('/admin/projects');
        }


        project.title = title;
        project.short_description = short_description;
        project.usage = usage || '';
        project.surface = surface || '';
        project.location_year = location_year || '';
        project.description = description;
        project.language = language || project.language || 'fr';
        project.slug = slugify(title, { lower: true, strict: true });

        if (req.files && req.files.cover_image && req.files.cover_image.length > 0) {
            if (project.cover_image_url) {
                const publicId = extractPublicId(project.cover_image_url);
                if (publicId) {
                    try {
                        await cloudinary.uploader.destroy(publicId);
                        console.log('🗑️ Ancienne cover supprimée:', publicId);
                    } catch (err) {
                        console.error('⚠️ Erreur suppression cover:', err);
                    }
                }
            }
            project.cover_image_url = req.files.cover_image[0].path;
            console.log('✅ Nouvelle cover:', project.cover_image_url);
        }

        // Gérer l'ordre des images de la galerie
        if (gallery_order) {
            try {
                const orderedUrls = JSON.parse(gallery_order);
                console.log('📸 Nouvel ordre reçu:', orderedUrls);
                project.images_url = orderedUrls;
            } catch (err) {
                console.error('⚠️ Erreur parsing gallery_order:', err);
            }
        }

        // Ajouter les nouvelles images à la fin
        if (req.files && req.files.new_images && req.files.new_images.length > 0) {
            const newImages = req.files.new_images.map(file => file.path);
            project.images_url = [...project.images_url, ...newImages];
            console.log('✅ Nouvelles images ajoutées:', newImages.length);
        }

        await project.save();
        console.log('✅ Projet mis à jour avec succès');
        res.redirect('/admin/projects/edit/' + req.params.id);

    } catch (err) {
        console.error('❌ Erreur édition projet:', err);
        res.redirect('/admin/projects');
    }
}

exports.deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.redirect('/admin/projects');

        if (project.cover_image_url) {
            const publicId = extractPublicId(project.cover_image_url);
            if (publicId) {
                try {
                    await cloudinary.uploader.destroy(publicId);
                    console.log('🗑️ Cover supprimée:', publicId);
                } catch (err) {
                    console.error('⚠️ Erreur suppression cover:', err);
                }
            }
        }

        if (project.images_url && project.images_url.length > 0) {
            for (const imgUrl of project.images_url) {
                const publicId = extractPublicId(imgUrl);
                if (publicId) {
                    try {
                        await cloudinary.uploader.destroy(publicId);
                        console.log('🗑️ Image supprimée:', publicId);
                    } catch (err) {
                        console.error('⚠️ Erreur suppression image:', err);
                    }
                }
            }
        }

        await Project.findByIdAndDelete(req.params.id);
        console.log('✅ Projet supprimé avec succès');
        res.redirect('/admin/projects');

    } catch (err) {
        console.error('❌ Erreur suppression projet:', err);
        res.redirect('/admin/projects');
    }
}

exports.deleteProjectImage = async (req, res) => {
    try {
        const { projectId, imageUrl, type } = req.body;

        const project = await Project.findById(projectId);
        if (!project) return res.status(404).send('Projet non trouvé');

        const publicId = extractPublicId(imageUrl);
        if (publicId) {
            try {
                await cloudinary.uploader.destroy(publicId);
                console.log('🗑️ Image individuelle supprimée:', publicId);
            } catch (err) {
                console.error('⚠️ Erreur suppression image:', err);
            }
        }

        if (type === 'cover') {
            project.cover_image_url = '';
        } else if (type === 'gallery') {
            project.images_url = project.images_url.filter(img => img !== imageUrl);
        }

        await project.save();
        console.log('✅ Image supprimée du projet');
        res.redirect('/admin/projects/edit/' + projectId);

    } catch (err) {
        console.error('❌ Erreur suppression image:', err);
        res.redirect('/admin/projects');
    }
}

function extractPublicId(url) {
    try {
        const uploadIndex = url.indexOf('/upload/');
        if (uploadIndex === -1) return null;

        const afterUpload = url.substring(uploadIndex + 8);
        const withoutVersion = afterUpload.replace(/^v\d+\//, '');
        const publicId = withoutVersion.substring(0, withoutVersion.lastIndexOf('.'));

        console.log('🔑 Public ID extrait:', publicId);
        return publicId;
    } catch (err) {
        console.error('❌ Erreur extraction public_id:', err);
        return null;
    }
}

// === GESTION DES PAGES (À propos, Contact) ===

// Afficher la liste des pages
exports.getPages = async (req, res) => {
    try {
        const pages = await Page.find();
        res.render('admin/pages', { pages });
    } catch (err) {
        console.error('❌ Erreur récupération pages:', err);
        res.redirect('/admin/projects');
    }
};

// Afficher le formulaire d'édition d'une page
exports.getEditPage = async (req, res) => {
    try {
        const { slug } = req.params;
        const lang = req.query.lang || 'fr';

        // Chercher la page par slug et langue
        let page = await Page.findOne({ slug, language: lang });

        // Si la page n'existe pas, la créer avec un contenu par défaut
        if (!page) {
            const defaultTitle = slug === 'about' ? 'À propos' : 'Contact';
            const defaultContent = slug === 'about'
                ? '<p>Contenu de la page À propos...</p>'
                : '<p>Contenu de la page Contact...</p>';

            page = await Page.create({
                slug,
                title: defaultTitle,
                content: defaultContent,
                language: lang
            });
            console.log('✅ Page créée:', slug, lang);
        }

        res.render('admin/editPage', { page });
    } catch (err) {
        console.error('❌ Erreur récupération page:', err);
        res.redirect('/admin/pages');
    }
};

// Sauvegarder les modifications d'une page
exports.postEditPage = async (req, res) => {
    try {
        const { slug } = req.params;
        const { title, content, phone, email, language } = req.body;

        console.log('📝 Modification page:', slug);
        console.log('📝 Titre:', title);
        console.log('📝 Langue:', language);
        console.log('📝 Contenu (extrait):', content ? content.substring(0, 100) + '...' : 'N/A');

        // Préparer les données à mettre à jour
        const updateData = {
            title,
            content: content || '',
            language: language || 'fr',
            updatedAt: Date.now()
        };

        // Ajouter l'image si uploadée (pour la page À propos)
        if (slug === 'about' && req.file) {
            updateData.image_url = req.file.path;
        }

        // Ajouter phone et email seulement pour la page Contact
        if (slug === 'contact') {
            updateData.phone = phone || '';
            updateData.email = email || '';
        }

        // Mettre à jour ou créer la page
        await Page.findOneAndUpdate(
            { slug, language: language || 'fr' },
            updateData,
            {
                new: true,
                upsert: true, // Créer si n'existe pas
                runValidators: false // Désactiver la validation pour permettre content vide
            }
        );

        console.log('✅ Page sauvegardée:', slug, language);
        res.redirect('/admin/pages/edit/' + slug + '?lang=' + (language || 'fr'));
    } catch (err) {
        console.error('❌ Erreur sauvegarde page:', err);
        res.redirect('/admin/pages');
    }
};

// Réorganiser l'ordre des projets
exports.reorderProjects = async (req, res) => {
    try {
        const { projectIds } = req.body;
        console.log('📝 Réorganisation des projets:', projectIds);

        // Mettre à jour l'ordre de chaque projet
        const updatePromises = projectIds.map((id, index) => {
            return Project.findByIdAndUpdate(id, { order: index });
        });

        await Promise.all(updatePromises);

        console.log('✅ Ordre des projets sauvegardé');
        res.json({ success: true, message: 'Ordre sauvegardé' });
    } catch (err) {
        console.error('❌ Erreur réorganisation projets:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

module.exports = exports;