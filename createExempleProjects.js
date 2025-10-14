require('dotenv').config();
const mongoose = require('mongoose');
const Project = require('./models/Project');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

async function downloadImage(filename, id) {
    try {
        const url = `https://picsum.photos/800/600?random=${id}`;
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        fs.writeFileSync(path.join(uploadDir, filename), response.data);
        console.log(`Image téléchargée : ${filename}`);
        return '/uploads/' + filename;
    } catch (err) {
        console.error(`Erreur téléchargement ${filename}:`, err.message);
        return '';
    }
}

async function seedProjects() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connecté à MongoDB');

    // Vider la collection
    await Project.deleteMany({});
    console.log('Collection Project vidée');

    const projects = [];

    for (let i = 1; i <= 20; i++) {
        const title = `Projet Exemple ${i}`;
        const slug = `projet-exemple-${i}`;
        const description = `Description du projet Exemple ${i}. Un projet fictif pour le site.`;

        // Image de couverture
        const cover_image_url = await downloadImage(`cover-${i}.jpg`, i);

        // Galerie d'images (3 à 5 images aléatoires)
        const imagesCount = 3 + Math.floor(Math.random() * 3);
        const images_url = [];
        for (let j = 1; j <= imagesCount; j++) {
            const imgUrl = await downloadImage(`gallery-${i}-${j}.jpg`, i*10 + j);
            images_url.push(imgUrl);
        }

        projects.push({ title, description, slug, cover_image_url, images_url, date: new Date() });
    }

    await Project.insertMany(projects);
    console.log('20 projets exemples ajoutés avec couverture + galerie');

    await mongoose.disconnect();
    console.log('Déconnecté de MongoDB');
}

seedProjects();
