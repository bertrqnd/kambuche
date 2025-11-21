// Effet de fondu au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
  // Fade in au chargement
  document.body.classList.add('fade-in');
});

// Intercepter les clics sur les liens pour ajouter un fondu avant navigation
document.addEventListener('click', (e) => {
  const link = e.target.closest('a');

  // Ignorer si ce n'est pas un lien ou si c'est un lien externe ou avec target="_blank"
  if (!link || link.target === '_blank' || link.hostname !== window.location.hostname) {
    return;
  }

  // Ignorer les liens avec des attributs spéciaux (download, mailto, tel, etc.)
  if (link.hasAttribute('download') || link.href.startsWith('mailto:') || link.href.startsWith('tel:')) {
    return;
  }

  const href = link.href;

  // Si le lien pointe vers la page actuelle, ne rien faire
  if (href === window.location.href) {
    e.preventDefault();
    return;
  }

  // Empêcher la navigation par défaut
  e.preventDefault();

  // Ajouter la classe fade-out
  document.body.classList.remove('fade-in');
  document.body.classList.add('fade-out');

  // Naviguer après l'animation (300ms)
  setTimeout(() => {
    window.location.href = href;
  }, 500);
});

// Gérer le bouton retour du navigateur
window.addEventListener('pageshow', (event) => {
  // Si la page vient du cache (bouton retour), forcer le fade-in
  if (event.persisted) {
    document.body.classList.remove('fade-out');
    document.body.classList.add('fade-in');
  }
});
