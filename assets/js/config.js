/* Réglages du site Nayls 04 Esthétique.
   Prix : data/catalogue.json (puis node scripts/generer-donnees.mjs). */
window.NYCFG = {
  /* Site 100 % statique, sans serveur ni abonnement : les rendez-vous se prennent par message (Instagram), SMS ou téléphone.
     « Votre message, déjà écrit » (assets/js/rdv.js) prépare le texte ; rien n'est envoyé ni enregistré par le site. */

  /* Salon */
  PHONE_DISPLAY: '07 87 04 86 70',
  PHONE_TEL: '+33787048670',
  ADDRESS: 'Impasse les jardins d’Ingrid, 04300 Forcalquier',
  LAT: 43.9508852,
  LNG: 5.7682398,
  OWNER: 'Naya',
  BRAND: 'Nayls 04 Esthétique',
  INSTAGRAM: 'https://www.instagram.com/nayls04/',
  DM: 'https://ig.me/m/nayls04',
  MAP_EMBED: 'https://www.google.com/maps?q=43.9508852,5.7682398&z=16&output=embed&hl=fr',

  /* Film d'entrée : ordinateur (3:4, dans l'arche) et téléphone (même cadrage, plus léger) — voir scripts/fabriquer-film.py */
  FILM: { desktop: 'assets/video/film-arche.mp4', mobile: 'assets/video/film-mobile.mp4', posterDesktop: 'assets/img/film-arche-poster.webp', posterMobile: 'assets/img/film-mobile-poster.webp' }
};
