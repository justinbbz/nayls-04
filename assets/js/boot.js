/* Démarrage : marque la page « avec JavaScript » et applique la préférence d'animations avant le premier affichage (évite un flash). */
(function () {
  var d = document.documentElement;
  d.classList.add('js');
  try {
    var s = localStorage.getItem('ny-motion');
    if (s) d.dataset.motion = s;
    else if (matchMedia('(prefers-reduced-motion: reduce)').matches) d.dataset.motion = 'off';
  } catch (e) { /* aucune */ }
})();
