const Project = require('../models/Project');
const Page = require('../models/Page');

// === Liste de tous les projets ===
exports.getProjects = async (req, res) => {
  const lang = req.language || 'fr';
  const projects = await Project.find({ language: lang }).sort({ order: 1, date: -1 });
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
    projects,
    carouselProjects,
    meta: {
      title: req.t('seo.home_title'),
      description: req.t('seo.home_description')
    },
    canonical: `${baseUrl}/${lang}`,
    ogImage: `${baseUrl}/og-image.png`,
    req
  });
};


// === Page projet unique ===
exports.getProject = async (req, res) => {
  const lang = req.language || 'fr';
  const project = await Project.findOne({ slug: req.params.slug, language: lang });
  if (!project) return res.status(404).render('public/404');

  const baseUrl = process.env.SITE_URL || 'https://www.andrea-layton.com';

  res.render('public/project', {
    project,
    meta: {
      title: req.t('seo.project_title', { title: project.title }),
      description: project.short_description || `${project.title}. ${project.usage || ''} ${project.location_year || ''}`
    },
    canonical: `${baseUrl}/${lang}/projets/${project.slug}`,
    ogImage: project.cover_image_url || `${baseUrl}/og-image.jpg`,
    req
  });
};


// === Page contact ===
exports.getContact = async (req, res) => {
  const lang = req.language || 'fr';
  const projects = await Project.find({ language: lang }).sort({ order: 1, date: -1 });
  let page = await Page.findOne({ slug: 'contact', language: lang });

  // Si la page n'existe pas, créer un contenu par défaut
  if (!page) {
    page = {
      title: req.t('contact.page_title'),
      content: '<p>Contenu de la page Contact...</p>'
    };
  }

  const baseUrl = process.env.SITE_URL || 'https://www.andrea-layton.com';

  res.render('public/contact', {
    projects,
    page,
    meta: {
      title: req.t('contact.meta_title'),
      description: req.t('contact.meta_description')
    },
    canonical: `${baseUrl}/${lang}/contact`,
    ogImage: `${baseUrl}/og-image.png`,
    req
  });
};


// === Page à propos ===
exports.getAbout = async (req, res) => {
  const lang = req.language || 'fr';
  const projects = await Project.find({ language: lang }).sort({ order: 1, date: -1 });
  let page = await Page.findOne({ slug: 'about', language: lang });

  // Si la page n'existe pas, créer un contenu par défaut
  if (!page) {
    page = {
      title: req.t('about.page_title'),
      content: '<p>Contenu de la page À propos...</p>'
    };
  }

  const baseUrl = process.env.SITE_URL || 'https://www.andrea-layton.com';

  res.render('public/about', {
    projects,
    page,
    meta: {
      title: req.t('about.meta_title'),
      description: req.t('about.meta_description')
    },
    canonical: `${baseUrl}/${lang}/a-propos`,
    ogImage: page.image_url || `${baseUrl}/og-image.jpg`,
    req
  });
};


// === Sitemap XML ===
exports.getSitemap = async (req, res) => {
  const projects = await Project.find().sort({ order: 1, date: -1 });
  const languages = ['fr', 'en', 'es'];

  // URL de base depuis les variables d'environnement
  const baseUrl = process.env.SITE_URL || `${req.protocol}://${req.get('host')}`;

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';

  // Pages statiques pour chaque langue
  const staticPages = [
    { url: '', priority: '1.0', changefreq: 'weekly' },
    { url: '/a-propos', priority: '0.8', changefreq: 'monthly' },
    { url: '/contact', priority: '0.8', changefreq: 'monthly' }
  ];

  languages.forEach(lang => {
    staticPages.forEach(page => {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/${lang}${page.url}</loc>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += '  </url>\n';
    });
  });

  // Pages projets dynamiques pour chaque langue
  projects.forEach(project => {
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}/${project.language}/projets/${project.slug}</loc>\n`;
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
