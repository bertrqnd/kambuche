// Configuration TinyMCE pour la partie admin
document.addEventListener("DOMContentLoaded", () => {
  tinymce.init({
    selector: '#description',
    height: 500,
    menubar: false,
    plugins: 'link image code lists table charmap searchreplace anchor paste',
    toolbar: 'undo redo | formatselect | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | bullist numlist | outdent indent | blockquote | link image table charmap | searchreplace anchor | code | removeformat',
    skin: 'oxide-dark',
    content_css: 'dark',
    table_toolbar: 'tableprops tabledelete | tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol',
    table_appearance_options: false,
    image_advtab: true,
    link_assume_external_targets: true,
    target_list: false,
    link_title: false,
    font_family_formats: 'Roboto Flex=Roboto Flex, sans-serif',
    content_style: "@import url('https://fonts.googleapis.com/css2?family=Roboto+Flex:wght@100..900&display=swap'); body { font-family: 'Roboto Flex', sans-serif; color: #ffffff !important; background-color: #1e1e1e; font-weight: 300; } * { font-family: 'Roboto Flex', sans-serif !important; color: #ffffff !important; } p, div, span, td, th, li, a, strong, em, u { color: #ffffff !important; }",
    paste_as_text: false,
    paste_block_drop: false,
    paste_remove_styles_if_webkit: true,
    paste_webkit_styles: 'none',
    paste_retain_style_properties: '',
    paste_merge_formats: true,
    paste_preprocess: function(plugin, args) {
      args.content = args.content.replace(/style="[^"]*"/gi, '');
      args.content = args.content.replace(/face="[^"]*"/gi, '');
      args.content = args.content.replace(/color="[^"]*"/gi, '');
      args.content = args.content.replace(/<font[^>]*>/gi, '');
      args.content = args.content.replace(/<\/font>/gi, '');
    },
    formats: {
      forecolor: { inline: 'span', remove: 'all' },
      fontname: { inline: 'span', remove: 'all' }
    }
  });
});
