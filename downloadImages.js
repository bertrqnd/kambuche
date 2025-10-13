const fs = require('fs');
const fetch = require('node-fetch');
const path = require('path');

// Liste des noms de fichiers correspondant aux projets
const filenames = [
  "maison-moderne.jpg",
  "appartement-minimaliste.jpg",
  "villa-mediterraneenne.jpg",
  "maison-ecologique.jpg",
  "studio-urbain.jpg",
  "loft-industriel.jpg",
  "maison-familiale.jpg",
  "cabane-en-bois.jpg",
  "penthouse-luxe.jpg",
  "maison-contemporaine.jpg",
  "villa-bord-de-mer.jpg",
  "maison-de-campagne.jpg",
  "residence-etudiante.jpg",
  "maison-passive.jpg",
  "cabinet-medical.jpg",
  "maison-a-patio.jpg",
  "appartement-design.jpg",
  "villa-jardin.jpg",
  "maison-en-pierre.jpg",
  "loft-moderne.jpg"
];

// Crée le dossier uploads s'il n'existe pas
const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Fonction pour télécharger une image depuis Unsplash
async function downloadImage(filename, keyword) {
    const url = `https://source.unsplash.com/400x300/?${keyword}`;
    const res = await fetch(url);
    const buffer = await res.buffer();
    fs.writeFileSync(path.join(uploadDir, filename), buffer);
    console.log(`Image téléchargée : ${filename}`);
}

// Télécharger toutes les images avec des mots-clés variés
(async () => {
    const keywords = [
        "house,modern", "apartment,modern", "villa", "eco,house", "studio,apartment",
        "loft,industrial", "family,house", "cabin,wood", "penthouse,luxury", "modern,house",
        "villa,seaside", "country,house", "student,residence", "passive,house", "medical,building",
        "patio,house", "design,apartment", "garden,villa", "stone,house", "modern,loft"
    ];

    for (let i = 0; i < filenames.length; i++) {
        await downloadImage(filenames[i], keywords[i]);
    }

    console.log("Toutes les images ont été téléchargées !");
})();
