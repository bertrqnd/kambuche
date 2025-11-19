// Gestion du formulaire d'édition de projet
// Variables globales
let coverFile = null;
let additionalFiles = [];

// Gestionnaire pour les boutons de suppression d'images existantes
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('delete-image-btn')) {
    const projectId = e.target.dataset.projectId;
    const imageUrl = e.target.dataset.imageUrl;
    const type = e.target.dataset.type;

    if (!confirm('Supprimer cette image ?')) return;

    // Récupérer le token CSRF
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '/admin/projects/delete-image';
    form.innerHTML = `
      <input type="hidden" name="_csrf" value="${csrfToken}">
      <input type="hidden" name="projectId" value="${projectId}">
      <input type="hidden" name="imageUrl" value="${imageUrl}">
      <input type="hidden" name="type" value="${type}">
    `;
    document.body.appendChild(form);
    form.submit();
  }
});

// Gestion de l'image de couverture
const coverInput = document.getElementById('cover_image');
const coverZone = document.getElementById('coverZone');
const coverPreview = document.getElementById('coverPreview');

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
    div.innerHTML = `
      <img src="${e.target.result}" alt="Cover preview">
      <button type="button" class="remove-btn" data-action="remove-cover">×</button>
    `;
    coverPreview.appendChild(div);

    // Ajouter l'event listener au bouton
    const removeBtn = div.querySelector('.remove-btn');
    removeBtn.addEventListener('click', removeCover);
  };
  reader.readAsDataURL(file);
}

function removeCover() {
  coverFile = null;
  coverInput.value = '';
  coverPreview.innerHTML = '';
}

// Gestion des images supplémentaires
const additionalInput = document.getElementById('new_images');
const additionalZone = document.getElementById('additionalZone');
const additionalPreview = document.getElementById('additionalPreview');

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
      div.innerHTML = `
        <img src="${e.target.result}" alt="Preview ${index + 1}">
        <button type="button" class="remove-btn" data-index="${index}">×</button>
        <div class="drag-handle">⋮⋮</div>
      `;
      additionalPreview.appendChild(div);

      // Ajouter l'event listener au bouton de suppression
      const removeBtn = div.querySelector('.remove-btn');
      removeBtn.addEventListener('click', function() {
        removeAdditional(parseInt(this.dataset.index));
      });

      // Ajouter les handlers de drag & drop
      addDragHandlers(div);
    };
    reader.readAsDataURL(file);
  });
}

// Gestion du drag & drop pour les images EXISTANTES
const existingImagesContainer = document.getElementById('existingImagesContainer');
const galleryOrderInput = document.getElementById('gallery_order');

if (existingImagesContainer) {
  const existingItems = existingImagesContainer.querySelectorAll('.existing-image-item');
  let draggedExistingItem = null;

  existingItems.forEach(item => {
    item.style.cursor = 'move';

    item.addEventListener('dragstart', function(e) {
      draggedExistingItem = this;
      this.style.opacity = '0.5';
      e.dataTransfer.effectAllowed = 'move';
    });

    item.addEventListener('dragend', function() {
      this.style.opacity = '1';
    });

    item.addEventListener('dragover', function(e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';

      if (this !== draggedExistingItem) {
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

      if (draggedExistingItem !== this) {
        // Réorganiser visuellement
        const allItems = Array.from(existingImagesContainer.querySelectorAll('.existing-image-item'));
        const draggedIndex = allItems.indexOf(draggedExistingItem);
        const targetIndex = allItems.indexOf(this);

        if (draggedIndex < targetIndex) {
          existingImagesContainer.insertBefore(draggedExistingItem, this.nextSibling);
        } else {
          existingImagesContainer.insertBefore(draggedExistingItem, this);
        }

        // Mettre à jour l'ordre dans l'input caché
        updateGalleryOrder();
      }
    });
  });

  // Fonction pour mettre à jour l'ordre des images de la galerie
  function updateGalleryOrder() {
    const items = existingImagesContainer.querySelectorAll('.existing-image-item');
    const imageUrls = Array.from(items).map(item => item.dataset.imageUrl);
    galleryOrderInput.value = JSON.stringify(imageUrls);
    console.log('📸 Nouvel ordre des images:', imageUrls);
  }

  // Initialiser l'ordre au chargement
  updateGalleryOrder();
}

// Gestion du drag & drop pour réorganiser les NOUVELLES images
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

// Gestion du submit avec loader
const form = document.querySelector('form');
const submitWrapper = document.getElementById('submitWrapper');

form.addEventListener('submit', (e) => {
  // Synchroniser TinyMCE avec le textarea
  if (typeof tinymce !== 'undefined' && tinymce.get('description')) {
    tinymce.get('description').save();
  }

  submitWrapper.classList.add('loading');
});
