/* Généré par scripts/generer-donnees.mjs depuis data/*.json : NE PAS MODIFIER À LA MAIN.
   Prix = grille tarifaire de Naya (Instagram, 31/07/2026). Aucune durée, aucun acompte : le site n'a ni agenda ni paiement. */
window.NY = {
 "brand": "Nayls 04 Esthétique",
 "owner": "Naya",
 "groups": [
  {
   "id": "mains",
   "title": "Les mains",
   "kicker": "Gel · semi-permanent · nail art",
   "intro": "Gel, semi-permanent, french, nail art : la forme, la longueur et la couleur que vous imaginez.",
   "photo": "ig-DcdhZD9ozkY",
   "items": [
    {
     "id": "pose-gel",
     "name": "Pose complète gel",
     "price": 35,
     "tags": [
      "base-mains"
     ]
    },
    {
     "id": "remplissage",
     "name": "Remplissage",
     "price": 35,
     "tags": [
      "base-mains"
     ]
    },
    {
     "id": "semi-gainage",
     "name": "Semi permanent / Gainage",
     "price": 30,
     "tags": [
      "base-mains"
     ]
    },
    {
     "id": "depose-mains",
     "name": "Dépose",
     "price": 15
    },
    {
     "id": "nail-art",
     "name": "Nail art",
     "price": 0,
     "quote": true,
     "addon": true,
     "requires": [
      "pose-gel",
      "remplissage",
      "semi-gainage",
      "forfait-mains-pieds"
     ],
     "desc": "Sur devis : le tarif dépend du dessin. Envoyez une photo d’inspiration à Naya."
    }
   ]
  },
  {
   "id": "pieds",
   "title": "Les pieds",
   "kicker": "Semi-permanent · gel",
   "intro": "Semi-permanent ou gel, pour des pieds impeccables.",
   "photo": "ig-Db8cbqfIrVG",
   "items": [
    {
     "id": "pieds-semi",
     "name": "Semi permanent / gel",
     "price": 27,
     "tags": [
      "base-pieds"
     ]
    },
    {
     "id": "depose-pieds",
     "name": "Dépose",
     "price": 15
    },
    {
     "id": "rallongement-pouce",
     "name": "Rallongement pouce",
     "price": 1,
     "unit": "par ongle",
     "addon": true,
     "requires": [
      "pieds-semi",
      "forfait-mains-pieds"
     ]
    }
   ]
  },
  {
   "id": "forfaits",
   "title": "Les forfaits",
   "kicker": "Plus doux pour le budget",
   "intro": "Mains et pieds en une seule venue, ou rehaussement de cils et browlift ensemble.",
   "photo": "g24",
   "items": [
    {
     "id": "forfait-mains-pieds",
     "name": "Pose complète mains et pieds",
     "price": 58,
     "tags": [
      "base-mains",
      "base-pieds"
     ]
    },
    {
     "id": "forfait-cils-brow",
     "name": "Rehaussement de cils + Browlift",
     "price": 58,
     "tags": [
      "cils",
      "brow"
     ]
    }
   ]
  },
  {
   "id": "cils",
   "title": "Cils & sourcils",
   "kicker": "Courbe naturelle · effet subtil",
   "intro": "Courbe naturelle, résultat naturel, effet subtil.",
   "photo": "cils-regard",
   "items": [
    {
     "id": "cils",
     "name": "Rehaussement de cils",
     "price": 35,
     "tags": [
      "cils"
     ],
     "desc": "Courbe naturelle, résultat naturel, effet subtil."
    },
    {
     "id": "browlift",
     "name": "Browlift",
     "price": 35,
     "tags": [
      "brow"
     ],
     "desc": "Des sourcils structurés, brossés vers le haut."
    },
    {
     "id": "teinture",
     "name": "Teinture et/ou décoloration",
     "price": 5,
     "addon": true,
     "requires": [
      "cils",
      "browlift",
      "forfait-cils-brow"
     ]
    }
   ]
  }
 ],
 "hours": {
  "0": null,
  "1": [
   "09:00",
   "20:00"
  ],
  "2": [
   "09:00",
   "20:00"
  ],
  "3": [
   "09:00",
   "20:00"
  ],
  "4": [
   "09:00",
   "20:00"
  ],
  "5": [
   "09:00",
   "20:00"
  ],
  "6": [
   "09:00",
   "20:00"
  ]
 },
 "rating": {
  "value": "4,8",
  "count": 33,
  "url": "https://www.google.com/maps/place/Nayls+04+Esthetique+-+Proth%C3%A9siste+ongulaire+Forcalquier/@43.9508852,5.7682398,17z/data=!4m8!3m7!1s0xa7bc768ea35d3da1:0x1fe84637bf400f84!8m2!3d43.9508852!4d5.7682398!9m1!1b1!16s%2Fg%2F11xzv7k564?hl=fr"
 }
};
