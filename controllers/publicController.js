const Project = require('../models/Project');
const Page = require('../models/Page');

exports.getProjects = async (req, res) => {
  const projects = await Project.find().sort({ order: 1, date: -1 });
  console.log('Projets récupérés :', projects);

  const carouselProjects = projects.map(p => ({
    title: p.title,
    short_description: p.short_description,
    slug: p.slug,
    image: p.cover_image_url || (p.images_url && p.images_url[0]) || '/images/default.jpg'
  }));

  // Récupérer le texte de la slide d'intro
  let introPage = await Page.findOne({ slug: 'intro' });
  const introText = introPage ? introPage.content : 'Diplômée d\'architecture, je vous accompagne dans vos projets de construction, extension et rénovation';

  const baseUrl = process.env.SITE_URL || 'https://www.andrea-layton.com';

  res.render('public/projects', {
    projects,
    carouselProjects,
    introText,
    meta: {
      title: 'Andrea Layton - Conception et maîtrise d\'œuvre',
      description: "Diplômée d'architecture, je vous accompagne dans vos projets de construction, d'extension ou de rénovation."
    },
    canonical: baseUrl,
    ogImage: `${baseUrl}/og-image.png`
  });
};

exports.getProject = async (req, res) => {
  const project = await Project.findOne({ slug: req.params.slug });
  if (!project) return res.status(404).render('public/404');

  const baseUrl = process.env.SITE_URL || 'https://www.andrea-layton.com';

  res.render('public/project', {
    project,
    meta: {
      title: `${project.title} | Andrea Layton - Conception et maîtrise d\'œuvre`,
      description: project.short_description || `Projet ${project.title} réalisé par Andrea Layton, maître d'œuvre à Toulouse. ${project.usage ? project.usage + '.' : ''} ${project.location_year || ''}`
    },
    canonical: `${baseUrl}/projets/${project.slug}`,
    ogImage: project.cover_image_url || `${baseUrl}/og-image.jpg`
  });
};

exports.getContact = async (req, res) => {
  const projects = await Project.find().sort({ order: 1, date: -1 });
  let page = await Page.findOne({ slug: 'contact' });

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
      title: 'Contact | Andrea Layton - Conception et maîtrise d\'œuvre',
      description: "Contacter Andrea Layton pour échanger sur votre projet, demander un devis ou tout autre question..."
    },
    canonical: `${baseUrl}/contact`,
    ogImage: `${baseUrl}/og-image.png`
  });
};

exports.getAbout = async (req, res) => {
  const projects = await Project.find().sort({ order: 1, date: -1 });
  let page = await Page.findOne({ slug: 'about' });

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
      title: 'À propos | Andrea Layton - Conception et maîtrise d\'œuvre',
      description: "Découvrez le parcours d'Andrea Layton, maître d'œuvre à Toulouse. Expertise en rénovation, extension et projets d'architecture sur mesure."
    },
    canonical: `${baseUrl}/a-propos`,
    ogImage: page.image_url || `${baseUrl}/og-image.jpg`
  });
};

exports.getSitemap = async (req, res) => {
  const projects = await Project.find().sort({ order: 1, date: -1 });
  const baseUrl = process.env.SITE_URL || `${req.protocol}://${req.get('host')}`;

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

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

exports.getRobots = (req, res) => {
  const baseUrl = process.env.SITE_URL || `${req.protocol}://${req.get('host')}`;

  const robots = `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml

Disallow: /admin/
`;

  res.set('Content-Type', 'text/plain');
  res.send(robots);
};
