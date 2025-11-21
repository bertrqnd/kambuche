// Détecter si c'est le premier chargement de la session
let isFirstLoad = !sessionStorage.getItem('hasVisited');

// Effet de fondu au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
  // Faire fondre tout le body (navbar + main)
  document.body.style.opacity = '0';

  // Utiliser setTimeout pour forcer le navigateur à appliquer la transition
  setTimeout(() => {
    document.body.style.opacity = '1';
  }, 50);

  // Marquer comme visité après le premier chargement
  if (isFirstLoad) {
    sessionStorage.setItem('hasVisited', 'true');
  }
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

  // Faire fondre tout le body (navbar + main)
  document.body.style.opacity = '0';

  // Naviguer après l'animation (400ms)
  setTimeout(() => {
    window.location.href = href;
  }, 400);
});

// Gérer le bouton retour du navigateur
window.addEventListener('pageshow', (event) => {
  // Si la page vient du cache (bouton retour)
  if (event.persisted) {
    document.body.classList.remove('fade-out', 'content-fade-out');
    document.body.style.opacity = '1';
  }
});
