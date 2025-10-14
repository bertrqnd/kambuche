require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const Project = require('./models/Project');

const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const projectsData = [
  "Maison Moderne", "Appartement Minimaliste", "Villa Méditerranéenne", "Maison Écologique",
  "Studio Urbain", "Loft Industriel", "Maison Familiale", "Cabane en Bois",
  "Penthouse Luxe", "Maison Contemporaine", "Villa Bord de Mer", "Maison de Campagne",
  "Résidence Étudiante", "Maison Passive", "Cabinet Médical", "Maison à Patio",
  "Appartement Design", "Villa Jardin", "Maison en Pierre", "Loft Moderne"
];

async function downloadImage(filename, id) {
  const url = `https://picsum.photos/800/600?random=${id}`;
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  fs.writeFileSync(path.join(uploadDir, filename), response.data);
  return `/uploads/${filename}`;
}

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('🟢 Connecté à MongoDB');

  await Project.deleteMany({});
  console.log('🗑️ Base de données vidée');

  const projects = [];

  for (let i = 0; i < projectsData.length; i++) {
    const title = projectsData[i];
    const slug = title.toLowerCase().replace(/\s+/g, '-');

    // Couverture
    const coverFilename = `cover-${slug}.jpg`;
    const coverImage = await downloadImage(coverFilename, i + 1);

    // 5 images supplémentaires
    const gallery = [];
    for (let j = 0; j < 5; j++) {
      const galleryFilename = `gallery-${slug}-${j + 1}.jpg`;
      const imgUrl = await downloadImage(galleryFilename, i * 10 + j);
      gallery.push(imgUrl);
    }

    projects.push({
      title,
      description: `Description du projet ${title}. Exemple généré automatiquement.`,
      slug,
      cover_image_url: coverImage,
      images_url: gallery,
      date: new Date()
    });
  }

  await Project.insertMany(projects);
  console.log('✅ 20 projets ajoutés avec leurs images !');

  mongoose.disconnect();
  console.log('🔴 Déconnecté de MongoDB');
}

seed().catch(err => console.error(err));
