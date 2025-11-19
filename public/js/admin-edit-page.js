// Validation de la taille de l'image pour la page À propos
document.addEventListener('DOMContentLoaded', function() {
  const imageInput = document.getElementById('image');

  if (imageInput) {
    imageInput.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        const maxSize = 10 * 1024 * 1024; // 10 MB en octets
        if (file.size > maxSize) {
          alert(`L'image est trop volumineuse (${(file.size / 1024 / 1024).toFixed(2)} MB).\nTaille maximum: 10 MB.\nVeuillez compresser ou choisir une autre image.`);
          e.target.value = ''; // Réinitialiser l'input
        }
      }
    });
  }
});
