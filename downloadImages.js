const fs = require('fs');
const path = require('path');
const axios = require('axios');

const filenames = [
  "maison-moderne.jpg","appartement-minimaliste.jpg","villa-mediterraneenne.jpg",
  "maison-ecologique.jpg","studio-urbain.jpg","loft-industriel.jpg",
  "maison-familiale.jpg","cabane-en-bois.jpg","penthouse-luxe.jpg",
  "maison-contemporaine.jpg","villa-bord-de-mer.jpg","maison-de-campagne.jpg",
  "residence-etudiante.jpg","maison-passive.jpg","cabinet-medical.jpg",
  "maison-a-patio.jpg","appartement-design.jpg","villa-jardin.jpg",
  "maison-en-pierre.jpg","loft-moderne.jpg"
];

const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

async function downloadImage(filename, id) {
  try {
    const url = `https://picsum.photos/400/300?random=${id}`;
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    fs.writeFileSync(path.join(uploadDir, filename), response.data);
    console.log(`Image téléchargée : ${filename}`);
  } catch (err) {
    console.error(`Erreur téléchargement ${filename}:`, err.message);
  }
}

(async () => {
  for (let i = 0; i < filenames.length; i++) {
    await downloadImage(filenames[i], i+1);
  }
  console.log("Toutes les images ont été téléchargées !");
})();
