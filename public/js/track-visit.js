// track-visit.js - Marque que l'utilisateur a visité une page projet
(function() {
  'use strict';

  // Marquer que l'intro slide ne doit plus s'afficher
  function markIntroAsVisited() {
    try {
      localStorage.setItem('shouldHideIntroSlide', 'true');
    } catch (e) {
      // Fallback vers sessionStorage si localStorage est bloqué
      try {
        sessionStorage.setItem('shouldHideIntroSlide', 'true');
      } catch {
        // Mode navigation privée strict - pas de stockage disponible
        console.warn('Storage unavailable: intro may reappear on refresh');
      }
    }
  }

  markIntroAsVisited();
})();
