// Script de migration pour initialiser les pages par défaut
// Exécuter avec: node scripts/initDefaultPages.js

require('dotenv').config();
const mongoose = require('mongoose');
const Page = require('../models/Page');

const defaultPages = [
  {
    slug: 'intro',
    title: 'Slide d\'intro',
    content: 'Diplômée d\'architecture, je vous accompagne dans vos projets de construction, extension et rénovation'
  },
  {
    slug: 'about',
    title: 'À propos',
    content: '<p>Diplômée de l\'École Nationale Supérieure d\'Architecture de Toulouse, j\'ai développé une expertise complète en conception architecturale et suivi de chantier.</p><p>Mon approche allie créativité, technicité et écoute pour donner vie à vos projets.</p>',
    image_url: ''
  },
  {
    slug: 'contact',
    title: 'Contact',
    content: 'N\'hésitez pas à me contacter pour discuter de votre projet.',
    phone: '',
    email: ''
  }
];

async function initDefaultPages() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('✅ Connecté à MongoDB');

    // Vérifier et créer chaque page par défaut
    for (const pageData of defaultPages) {
      const exists = await Page.findOne({ slug: pageData.slug });

      if (!exists) {
        await Page.create(pageData);
        console.log(`✅ Page "${pageData.slug}" créée avec succès`);
      } else {
        console.log(`ℹ️  Page "${pageData.slug}" existe déjà, ignorée`);
      }
    }

    console.log('\n✨ Migration terminée avec succès !');
    process.exit(0);

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  }
}

// Exécuter la migration
initDefaultPages();
