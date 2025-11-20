// Gestion des formulaires d'ajout et d'édition de projets
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM chargé, initialisation du JavaScript...');

  // Variables globales
  let coverFile = null;
  let additionalFiles = [];

  // Gestion de l'image de couverture
  const coverInput = document.getElementById('cover_image');
  const coverZone = document.getElementById('coverZone');
  const coverPreview = document.getElementById('coverPreview');

  if (!coverInput || !coverZone || !coverPreview) {
    console.error('Éléments cover introuvables!');
    return;
  }

  // Click handler pour ouvrir le sélecteur de fichier
  coverZone.addEventListener('click', (e) => {
    e.preventDefault();
    coverInput.click();
  });

  coverInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérifier la taille (10 MB max pour Cloudinary gratuit)
      const maxSize = 10 * 1024 * 1024; // 10 MB en octets
      if (file.size > maxSize) {
        alert(`L'image de couverture est trop volumineuse (${(file.size / 1024 / 1024).toFixed(2)} MB).\nTaille maximum: 10 MB.\nVeuillez compresser ou choisir une autre image.`);
        coverInput.value = '';
        return;
      }
      coverFile = file;
      showCoverPreview(file);
    }
  });

  // Drag & drop pour cover
  coverZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    coverZone.classList.add('dragover');
  });

  coverZone.addEventListener('dragleave', () => {
    coverZone.classList.remove('dragover');
  });

  coverZone.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    coverZone.classList.remove('dragover');

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      // Vérifier la taille (10 MB max pour Cloudinary gratuit)
      const maxSize = 10 * 1024 * 1024; // 10 MB en octets
      if (file.size > maxSize) {
        alert(`L'image de couverture est trop volumineuse (${(file.size / 1024 / 1024).toFixed(2)} MB).\nTaille maximum: 10 MB.\nVeuillez compresser ou choisir une autre image.`);
        return;
      }
      coverFile = file;
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      coverInput.files = dataTransfer.files;
      showCoverPreview(file);
    }
  });

  function showCoverPreview(file) {
    coverPreview.innerHTML = '';
    const reader = new FileReader();
    reader.onload = (e) => {
      const div = document.createElement('div');
      div.className = 'image-preview-item';

      const img = document.createElement('img');
      img.src = e.target.result;
      img.alt = 'Cover preview';

      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'remove-btn';
      removeBtn.setAttribute('data-action', 'remove-cover');
      removeBtn.textContent = '×';
      removeBtn.addEventListener('click', removeCover);

      div.appendChild(img);
      div.appendChild(removeBtn);
      coverPreview.appendChild(div);
    };
    reader.readAsDataURL(file);
  }

  function removeCover() {
    coverFile = null;
    coverInput.value = '';
    coverPreview.innerHTML = '';
  }

  // Gestion des images supplémentaires
  const additionalInput = document.getElementById('additional_images');
  const additionalZone = document.getElementById('additionalZone');
  const additionalPreview = document.getElementById('additionalPreview');

  if (!additionalInput || !additionalZone || !additionalPreview) {
    console.error('Éléments additionnels introuvables!');
    return;
  }

  // Click handler pour ouvrir le sélecteur de fichiers multiples
  additionalZone.addEventListener('click', (e) => {
    e.preventDefault();
    additionalInput.click();
  });

  additionalInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    const maxSize = 10 * 1024 * 1024; // 10 MB en octets
    const rejectedFiles = [];

    files.forEach(file => {
      if (file.size > maxSize) {
        rejectedFiles.push(`${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
      } else if (!additionalFiles.find(f => f.name === file.name)) {
        additionalFiles.push(file);
      }
    });

    if (rejectedFiles.length > 0) {
      alert(`Les images suivantes sont trop volumineuses (max 10 MB):\n\n${rejectedFiles.join('\n')}\n\nVeuillez compresser ces images.`);
    }

    updateAdditionalInput();
    updateAdditionalPreview();
  });

  // Drag & drop pour images supplémentaires
  additionalZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    additionalZone.classList.add('dragover');
  });

  additionalZone.addEventListener('dragleave', () => {
    additionalZone.classList.remove('dragover');
  });

  additionalZone.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    additionalZone.classList.remove('dragover');

    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    const maxSize = 10 * 1024 * 1024; // 10 MB en octets
    const rejectedFiles = [];

    files.forEach(file => {
      if (file.size > maxSize) {
        rejectedFiles.push(`${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
      } else if (!additionalFiles.find(f => f.name === file.name)) {
        additionalFiles.push(file);
      }
    });

    if (rejectedFiles.length > 0) {
      alert(`Les images suivantes sont trop volumineuses (max 10 MB):\n\n${rejectedFiles.join('\n')}\n\nVeuillez compresser ces images.`);
    }

    updateAdditionalInput();
    updateAdditionalPreview();
  });

  function updateAdditionalInput() {
    const dataTransfer = new DataTransfer();
    additionalFiles.forEach(file => dataTransfer.items.add(file));
    additionalInput.files = dataTransfer.files;
  }

  function updateAdditionalPreview() {
    additionalPreview.innerHTML = '';
    additionalFiles.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const div = document.createElement('div');
        div.className = 'image-preview-item';
        div.setAttribute('draggable', 'true');
        div.setAttribute('data-index', index);

        const img = document.createElement('img');
        img.src = e.target.result;
        img.alt = `Preview ${index + 1}`;

        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'remove-btn';
        removeBtn.setAttribute('data-index', index);
        removeBtn.textContent = '×';
        removeBtn.addEventListener('click', function() {
          removeAdditional(parseInt(this.dataset.index));
        });

        const dragHandle = document.createElement('div');
        dragHandle.className = 'drag-handle';
        dragHandle.textContent = '⋮⋮';

        div.appendChild(img);
        div.appendChild(removeBtn);
        div.appendChild(dragHandle);
        additionalPreview.appendChild(div);

        // Ajouter les handlers de drag & drop
        addDragHandlers(div);
      };
      reader.readAsDataURL(file);
    });
  }

  // Gestion du drag & drop pour réorganiser les images
  let draggedItem = null;

  function addDragHandlers(item) {
    item.addEventListener('dragstart', function(e) {
      draggedItem = this;
      this.style.opacity = '0.5';
      e.dataTransfer.effectAllowed = 'move';
    });

    item.addEventListener('dragend', function() {
      this.style.opacity = '1';
    });

    item.addEventListener('dragover', function(e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';

      if (this !== draggedItem) {
        this.style.border = '2px solid #4ecdc4';
      }
    });

    item.addEventListener('dragleave', function() {
      this.style.border = '';
    });

    item.addEventListener('drop', function(e) {
      e.preventDefault();
      e.stopPropagation();
      this.style.border = '';

      if (draggedItem !== this) {
        // Réorganiser le tableau additionalFiles
        const draggedIndex = parseInt(draggedItem.dataset.index);
        const targetIndex = parseInt(this.dataset.index);

        const [movedFile] = additionalFiles.splice(draggedIndex, 1);
        additionalFiles.splice(targetIndex, 0, movedFile);

        // Mettre à jour l'affichage et l'input
        updateAdditionalInput();
        updateAdditionalPreview();
      }
    });
  }

  function removeAdditional(index) {
    additionalFiles.splice(index, 1);
    updateAdditionalInput();
    updateAdditionalPreview();
  }

  // Gestion du submit avec loader et validation
  const form = document.getElementById('projectForm');
  const submitWrapper = document.getElementById('submitWrapper');
  const coverError = document.getElementById('coverError');
  const descriptionError = document.getElementById('descriptionError');
  const descriptionTextarea = document.getElementById('description');

  console.log('Form trouvé:', form ? 'OUI' : 'NON');
  console.log('submitWrapper trouvé:', submitWrapper ? 'OUI' : 'NON');
  console.log('coverError trouvé:', coverError ? 'OUI' : 'NON');
  console.log('descriptionError trouvé:', descriptionError ? 'OUI' : 'NON');

  if (!form || !submitWrapper || !coverError || !descriptionError) {
    console.error('Éléments de formulaire manquants!');
    return;
  }

  form.addEventListener('submit', (e) => {
    console.log('🚀 Événement submit déclenché!');
    console.log('TinyMCE disponible:', typeof tinymce !== 'undefined');

    // Synchroniser TinyMCE avec le textarea
    if (typeof tinymce !== 'undefined' && tinymce.get('description')) {
      console.log('Synchronisation TinyMCE...');
      tinymce.get('description').save();
    } else {
      console.warn('TinyMCE non disponible ou pas initialisé!');
    }

    // Vérifier la description
    const description = descriptionTextarea.value.trim();
    console.log('Description longueur:', description.length);

    if (!description || description.length === 0) {
      console.warn('❌ Description vide!');
      e.preventDefault();
      descriptionError.style.display = 'block';
      // Scroll vers TinyMCE
      descriptionTextarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }

    // Vérifier si une image de couverture est sélectionnée
    console.log('Fichiers cover:', coverInput.files);
    console.log('Nombre de fichiers cover:', coverInput.files ? coverInput.files.length : 0);

    if (!coverInput.files || coverInput.files.length === 0) {
      console.warn('❌ Aucune image de couverture sélectionnée!');
      e.preventDefault();
      coverError.style.display = 'block';
      coverZone.style.borderColor = '#ff6b6b';

      // Scroll vers le champ d'erreur
      coverZone.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }

    // Tout est OK, afficher le loader
    console.log('✅ Validation OK, soumission du formulaire...');
    coverError.style.display = 'none';
    descriptionError.style.display = 'none';
    submitWrapper.classList.add('loading');

    // Compter le nombre total de fichiers
    const totalFiles = (coverInput.files ? coverInput.files.length : 0) + additionalFiles.length;
    if (totalFiles > 3) {
      console.log(`⏳ Upload de ${totalFiles} images en cours... Cela peut prendre quelques instants.`);
    }
  });

  // Retirer l'erreur quand une image est sélectionnée
  coverInput.addEventListener('change', () => {
    if (coverInput.files && coverInput.files.length > 0) {
      coverError.style.display = 'none';
      coverZone.style.borderColor = '';
    }
  });

  // Debug: ajouter un click handler sur le bouton submit
  const submitButton = form.querySelector('button[type="submit"]');
  if (submitButton) {
    submitButton.addEventListener('click', (e) => {
      console.log('🖱️ Bouton cliqué!');
    });
  }

  console.log('✅ JavaScript initialisé avec succès!');
});
