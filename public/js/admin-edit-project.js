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

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '/admin/projects/delete-image';
    form.innerHTML = `
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
      <button type="button" class="remove-btn" onclick="removeCover()">×</button>
    `;
    coverPreview.appendChild(div);
  };
  reader.readAsDataURL(file);
}

window.removeCover = function() {
  coverFile = null;
  coverInput.value = '';
  coverPreview.innerHTML = '';
};

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
  files.forEach(file => {
    if (!additionalFiles.find(f => f.name === file.name)) {
      additionalFiles.push(file);
    }
  });
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
  files.forEach(file => {
    if (!additionalFiles.find(f => f.name === file.name)) {
      additionalFiles.push(file);
    }
  });
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
      div.innerHTML = `
        <img src="${e.target.result}" alt="Preview ${index + 1}">
        <button type="button" class="remove-btn" onclick="removeAdditional(${index})">×</button>
      `;
      additionalPreview.appendChild(div);
    };
    reader.readAsDataURL(file);
  });
}

window.removeAdditional = function(index) {
  additionalFiles.splice(index, 1);
  updateAdditionalInput();
  updateAdditionalPreview();
};

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
