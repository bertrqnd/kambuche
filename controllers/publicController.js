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

  const baseUrl = process.env.SITE_URL || 'https://www.andrea-layton.com';

  res.render('public/projects', {
    projects,          // pour le menu dropdown
    carouselProjects,  // pour le carousel
    meta: {
      title: 'Andrea Layton - Maître d\'œuvre à Toulouse | Rénovation & Construction',
      description: "Andrea Layton, maître d'œuvre à Toulouse. Spécialisée en rénovation, extension et construction neuve. Accompagnement personnalisé pour vos projets d'architecture."
    },
    canonical: baseUrl,
    ogImage: `${baseUrl}/og-image.png`
  });
};


// === Page projet unique ===
exports.getProject = async (req, res) => {
  const project = await Project.findOne({ slug: req.params.slug });
  if (!project) return res.status(404).render('public/404');

  const baseUrl = process.env.SITE_URL || 'https://www.andrea-layton.com';

  res.render('public/project', {
    project,
    meta: {
      title: `${project.title} | Andrea Layton - Maître d'œuvre Toulouse`,
      description: project.short_description || `Projet ${project.title} réalisé par Andrea Layton, maître d'œuvre à Toulouse. ${project.usage ? project.usage + '.' : ''} ${project.location_year || ''}`
    },
    canonical: `${baseUrl}/projets/${project.slug}`,
    ogImage: project.cover_image_url || `${baseUrl}/og-image.jpg`
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

  const baseUrl = process.env.SITE_URL || 'https://www.andrea-layton.com';

  res.render('public/contact', {
    projects,
    page,
    meta: {
      title: 'Contact | Andrea Layton - Maître d\'œuvre Toulouse',
      description: "Contactez Andrea Layton, maître d'œuvre à Toulouse. Devis gratuit pour vos projets de rénovation, extension ou construction neuve."
    },
    canonical: `${baseUrl}/contact`,
    ogImage: `${baseUrl}/og-image.png`
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

  const baseUrl = process.env.SITE_URL || 'https://www.andrea-layton.com';

  res.render('public/about', {
    projects,
    page,
    meta: {
      title: 'À propos | Andrea Layton - Maître d\'œuvre Toulouse',
      description: "Découvrez le parcours d'Andrea Layton, maître d'œuvre à Toulouse. Expertise en rénovation, extension et projets d'architecture sur mesure."
    },
    canonical: `${baseUrl}/a-propos`,
    ogImage: page.image_url || `${baseUrl}/og-image.jpg`
  });
};


// === Sitemap XML ===
exports.getSitemap = async (req, res) => {
  const projects = await Project.find().sort({ order: 1, date: -1 });

  // URL de base depuis les variables d'environnement
  const baseUrl = process.env.SITE_URL || `${req.protocol}://${req.get('host')}`;

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // Pages statiques
  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'weekly' },
    { url: '/a-propos', priority: '0.8', changefreq: 'monthly' },
    { url: '/contact', priority: '0.8', changefreq: 'monthly' }
  ];

  staticPages.forEach(page => {
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}${page.url}</loc>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += '  </url>\n';
  });

  // Pages projets dynamiques
  projects.forEach(project => {
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}/projets/${project.slug}</loc>\n`;
    xml += `    <lastmod>${project.date.toISOString().split('T')[0]}</lastmod>\n`;
    xml += '    <changefreq>monthly</changefreq>\n';
    xml += '    <priority>0.9</priority>\n';
    xml += '  </url>\n';
  });

  xml += '</urlset>';

  res.set('Content-Type', 'application/xml');
  res.send(xml);
};


// === Robots.txt ===
exports.getRobots = (req, res) => {
  const baseUrl = process.env.SITE_URL || `${req.protocol}://${req.get('host')}`;

  const robots = `User-agent: *
Allow: /

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# Interdire l'admin
Disallow: /admin/
`;

  res.set('Content-Type', 'text/plain');
  res.send(robots);
};
