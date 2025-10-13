require('dotenv').config();
const mongoose = require('mongoose');
const Project = require('./models/Project');

async function addProjects() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connecté à MongoDB');

    const sampleProjects = [
        { title: "Maison Moderne", description: "Maison contemporaine avec grandes baies vitrées et jardin intégré.", slug: "maison-moderne", image_url: "/uploads/maison-moderne.jpg", date: new Date() },
        { title: "Appartement Minimaliste", description: "Appartement urbain optimisé avec mobilier sur mesure.", slug: "appartement-minimaliste", image_url: "/uploads/appartement-minimaliste.jpg", date: new Date() },
        { title: "Villa Méditerranéenne", description: "Villa spacieuse avec piscine et vue sur la mer.", slug: "villa-mediterraneenne", image_url: "/uploads/villa-mediterraneenne.jpg", date: new Date() },
        { title: "Maison Écologique", description: "Maison respectueuse de l'environnement avec panneaux solaires.", slug: "maison-ecologique", image_url: "/uploads/maison-ecologique.jpg", date: new Date() },
        { title: "Studio Urbain", description: "Petit studio fonctionnel en centre-ville.", slug: "studio-urbain", image_url: "/uploads/studio-urbain.jpg", date: new Date() },
        { title: "Loft Industriel", description: "Loft avec style industriel et grandes ouvertures.", slug: "loft-industriel", image_url: "/uploads/loft-industriel.jpg", date: new Date() },
        { title: "Maison Familiale", description: "Maison spacieuse adaptée à une famille nombreuse.", slug: "maison-familiale", image_url: "/uploads/maison-familiale.jpg", date: new Date() },
        { title: "Cabane en Bois", description: "Cabane cosy au milieu de la nature.", slug: "cabane-en-bois", image_url: "/uploads/cabane-en-bois.jpg", date: new Date() },
        { title: "Penthouse Luxe", description: "Appartement haut de gamme avec terrasse panoramique.", slug: "penthouse-luxe", image_url: "/uploads/penthouse-luxe.jpg", date: new Date() },
        { title: "Maison Contemporaine", description: "Maison moderne avec design épuré.", slug: "maison-contemporaine", image_url: "/uploads/maison-contemporaine.jpg", date: new Date() },
        { title: "Villa Bord de Mer", description: "Villa avec vue imprenable sur l'océan.", slug: "villa-bord-de-mer", image_url: "/uploads/villa-bord-de-mer.jpg", date: new Date() },
        { title: "Maison de Campagne", description: "Maison rustique avec jardin et verger.", slug: "maison-de-campagne", image_url: "/uploads/maison-de-campagne.jpg", date: new Date() },
        { title: "Résidence Étudiante", description: "Logement pratique pour étudiants.", slug: "residence-etudiante", image_url: "/uploads/residence-etudiante.jpg", date: new Date() },
        { title: "Maison Passive", description: "Maison basse consommation avec isolation optimale.", slug: "maison-passive", image_url: "/uploads/maison-passive.jpg", date: new Date() },
        { title: "Cabinet Médical", description: "Bâtiment fonctionnel pour cabinet de santé.", slug: "cabinet-medical", image_url: "/uploads/cabinet-medical.jpg", date: new Date() },
        { title: "Maison à Patio", description: "Maison avec patio central lumineux.", slug: "maison-a-patio", image_url: "/uploads/maison-a-patio.jpg", date: new Date() },
        { title: "Appartement Design", description: "Appartement urbain avec design moderne et ergonomique.", slug: "appartement-design", image_url: "/uploads/appartement-design.jpg", date: new Date() },
        { title: "Villa Jardin", description: "Villa entourée d'un grand jardin paysager.", slug: "villa-jardin", image_url: "/uploads/villa-jardin.jpg", date: new Date() },
        { title: "Maison en Pierre", description: "Maison traditionnelle en pierre avec charme rustique.", slug: "maison-en-pierre", image_url: "/uploads/maison-en-pierre.jpg", date: new Date() },
        { title: "Loft Moderne", description: "Grand loft moderne avec open-space lumineux.", slug: "loft-moderne", image_url: "/uploads/loft-moderne.jpg", date: new Date() }
    ];

    await Project.insertMany(sampleProjects);
    console.log('20 projets exemples ajoutés');
    mongoose.disconnect();
}

addProjects();
