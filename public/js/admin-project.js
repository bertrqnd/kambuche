document.addEventListener("DOMContentLoaded", () => {
  // Initialisation TinyMCE depuis le CDN
  if (document.querySelector('#description')) {
    tinymce.init({
      selector: '#description',
      height: 500,
      menubar: false,
      plugins: 'link image code lists',
      toolbar: 'undo redo | formatselect | bold italic underline | alignleft aligncenter alignright | bullist numlist | link image | code',
      skin: 'oxide-dark',
      content_css: 'dark'
    });
  }
});
