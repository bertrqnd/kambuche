// Détecter si c'est le premier chargement de la session
let isFirstLoad = !sessionStorage.getItem('hasVisited');

// Effet de fondu au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
  if (isFirstLoad) {
    // Premier chargement : fondu complet du body (navbar + main)
    document.body.classList.add('fade-in');
    sessionStorage.setItem('hasVisited', 'true');
  } else {
    // Navigation interne : navbar visible immédiatement, main fait son fade-in
    document.body.style.opacity = '1';

    // Attendre un petit délai pour que le DOM soit prêt
    requestAnimationFrame(() => {
      const main = document.querySelector('main');
      if (main) {
        // Démarrer avec opacity 0
        main.style.opacity = '0';

        // Attendre le prochain frame pour appliquer le fade-in
        requestAnimationFrame(() => {
          main.style.opacity = '1';
        });
      }
    });
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

  // Faire fondre uniquement le main (pas la navbar)
  const main = document.querySelector('main');
  if (main) {
    main.style.opacity = '0';
  }

  // Naviguer après l'animation (500ms)
  setTimeout(() => {
    window.location.href = href;
  }, 500);
});

// Gérer le bouton retour du navigateur
window.addEventListener('pageshow', (event) => {
  // Si la page vient du cache (bouton retour)
  if (event.persisted) {
    document.body.classList.remove('fade-out', 'content-fade-out');
    document.body.style.opacity = '1';

    const main = document.querySelector('main');
    if (main) {
      main.style.opacity = '1';
    }
  }
});
