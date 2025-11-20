require('dotenv').config();
const mongoose = require('mongoose');
const Project = require('./models/Project');
const Page = require('./models/Page');

async function migrateLanguageField() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connecté');

    // Mettre à jour tous les projets sans champ language
    const projectsResult = await Project.updateMany(
      { language: { $exists: false } },
      { $set: { language: 'fr' } }
    );
    console.log(`✅ ${projectsResult.modifiedCount} projets mis à jour avec language='fr'`);

    // Mettre à jour toutes les pages sans champ language
    const pagesResult = await Page.updateMany(
      { language: { $exists: false } },
      { $set: { language: 'fr' } }
    );
    console.log(`✅ ${pagesResult.modifiedCount} pages mises à jour avec language='fr'`);

    // Afficher un résumé des projets
    const allProjects = await Project.find();
    console.log('\n📊 Résumé des projets:');
    allProjects.forEach(p => {
      console.log(`  - ${p.title} (${p.language})`);
    });

    // Afficher un résumé des pages
    const allPages = await Page.find();
    console.log('\n📊 Résumé des pages:');
    allPages.forEach(p => {
      console.log(`  - ${p.slug} - ${p.title} (${p.language})`);
    });

    await mongoose.disconnect();
    console.log('\n✅ Migration terminée');
  } catch (err) {
    console.error('❌ Erreur:', err);
    process.exit(1);
  }
}

migrateLanguageField();
