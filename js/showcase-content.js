// Public site content only.
window.VS_SHOWCASE = {
  "characters": [
    {
      "id": "vex",
      "name": "Vex",
      "role": "The Pacifist",
      "sprite": "assets/Sprites/vexSprite.webp",
      "color": "#3f3f73",
      "description": "A purple pacifist who sees the best in everyone. No matter the situation, Vex refuses to give up hope."
    },
    {
      "id": "shell",
      "name": "Shell",
      "role": "The Pessimist",
      "sprite": "assets/Sprites/shellSprite.webp",
      "color": "#2059be",
      "description": "A pragmatic realist and pessimist who doesn't see the good in people, only their many flaws."
    },
    {
      "id": "sid",
      "name": "Sid",
      "role": "The Shopkeeper",
      "sprite": "assets/Sprites/sid.webp",
      "color": "#70418c",
      "description": "Sid is one of the many shopkeepers Vex and Shell meet on their journey. Sid travels around, so you'll see him in many different places."
    },
    {
      "id": "linus",
      "name": "Linus",
      "role": "The Scientist",
      "sprite": "assets/Sprites/linus.webp",
      "color": "#984f22",
      "description": "Linus is a scientist who will help Vex and Shell take down the BBI. He's a tech genius and one of the smartest people in the world."
    },
    {
      "id": "greg",
      "name": "Greg",
      "role": "",
      "sprite": "assets/Sprites/greg.webp",
      "color": "#57544a",
      "description": "\"description? no thanks.\""
    },
    {
      "id": "fez",
      "name": "Fez",
      "role": "",
      "sprite": "assets/Sprites/fez.webp",
      "color": "#86483e",
      "description": "A marshmallow-adjacent \"creature\"."
    }
  ],
  "guests": [
    {
      "id": "riyan",
      "name": "Riyan",
      "role": "Guest Party Member",
      "sprite": "assets/Sprites/riyan.webp",
      "color": "#6a623e",
      "description": "A gunslinging mayor of a Wild West town in Duneboon. Riyan swore an oath to protect his people."
    },
    {
      "id": "guest-one",
      "concealed": true,
      "sprite": "assets/Concealed/guest-1.svg",
      "color": "#494e69"
    },
    {
      "id": "guest-two",
      "concealed": true,
      "sprite": "assets/Concealed/guest-2.svg",
      "color": "#434676"
    }
  ],
  "combat": {
    "description": "Vex & Shell features turn-based combat. Choose your moves wisely and time your hits to deal extra damage.",
    "actionRing": "Move icons and options sit on the action ring, with move choices appearing inside it. When it's time for bullet-hell combat, the ring expands into the combat box.",
    "moodsDescription": "Some enemies change their appearance based on their mode, others have no emotions at all."
  },
  "artStyle": {
    "description": "In Vex & Shell, the world changes its appearance in different contexts. Enemies and NPCs look simple in the main world, but get more detailed in battle. There are even secret art styles you'll have to discover for yourself."
  },
  "dialogue": {
    "description": "Dialogue bloops are voiced by real people. Dialogue portraits blink, talk, and change expression during conversation.",
    "frames": {
      "vex_neutral": [
        "_blink",
        "_talking",
        "_talking_blink"
      ],
      "shell_neutral": [
        "_blink",
        "_talking",
        "_talking_blink"
      ],
      "greg_neutral": [
        "_blink",
        "_talking",
        "_talking_blink"
      ],
      "vex_angry": [
        "_blink",
        "_talking",
        "_talking_blink"
      ],
      "vex_kawaii": [
        "_blink",
        "_talking",
        "_talking_blink"
      ],
      "vex_meh": [
        "_blink",
        "_talking",
        "_talking_blink"
      ],
      "vex_nervous": [
        "_blink",
        "_talking",
        "_talking_blink"
      ],
      "vex_sad": [
        "_blink",
        "_talking",
        "_talking_blink"
      ],
      "vex_slightsmile": [
        "_blink",
        "_talking",
        "_talking_blink"
      ],
      "shell_smirk": [
        "_blink",
        "_talking",
        "_talking_blink"
      ],
      "shell_suspicious": [
        "_blink",
        "_talking",
        "_talking_blink"
      ]
    },
    "portraits": [
      {
        "name": "Vex",
        "base": "assets/Sprites/vex_neutral",
        "expressions": [
          [
            "Neutral",
            "neutral"
          ],
          [
            "Angry",
            "angry"
          ],
          [
            "Kawaii",
            "kawaii"
          ],
          [
            "Meh",
            "meh"
          ],
          [
            "Nervous",
            "nervous"
          ],
          [
            "Sad",
            "sad"
          ],
          [
            "Slight smile",
            "slightsmile"
          ]
        ],
        "voice": "assets/SoundEffects/vexsfx2NEW.flac",
        "color": "#3f3f73"
      },
      {
        "name": "Shell",
        "base": "assets/Sprites/shell_neutral",
        "expressions": [
          [
            "Neutral",
            "neutral"
          ],
          [
            "Smirk",
            "smirk"
          ],
          [
            "Suspicious",
            "suspicious"
          ]
        ],
        "voice": "assets/SoundEffects/shellsfxNEW.flac",
        "color": "#2059be"
      }
    ]
  },
  "karma": {
    "description": "Vex & Shell features a karma meter, your choices directly affect it. Good deeds improve your karma, bad deeds lower it.",
    "consequences": "Your karma directly impacts how NPCs perceive you, and will change the outcome of the story.",
    "freedom": "You can kill ANY NPC if you'd like. But just remember, every choice has consequences.",
    "vexHint": "Vex is a pacifist. How far will you push him?"
  },
  "music": {
    "description": "Meet the composers behind the Vex & Shell soundtrack.",
    "composers": [
      {
        "name": "Neoware",
        "image": "assets/Composers/neoware.jpg",
        "url": "https://www.youtube.com/@nwcr_"
      },
      {
        "name": "Caf",
        "image": "assets/Composers/composer-four.jpg",
        "url": "https://www.youtube.com/channel/UCI3H8wXmxzf60qIJZUidCsA"
      },
      {
        "name": "Luis F.",
        "image": "assets/Composers/luis.jpg",
        "url": "https://www.youtube.com/@LuisFStudio"
      },
      {
        "name": "celeriac",
        "image": "assets/Composers/overceleriac.jpg",
        "url": "https://www.youtube.com/@overceleriac"
      }
    ]
  },
  "enemies": [
    {
      "id": "stik",
      "name": "Stik",
      "color": "#594132",
      "mainWorldSprite": "assets/Overworld/enemy-stik.webp",
      "cry": "assets/EnemyCries/stik.flac",
      "description": "A graceful woodland sprite who sometimes feels a little silly.",
      "initialMood": "normal",
      "moods": [
        {
          "id": "normal",
          "label": "Normal",
          "sprite": "assets/Enemies/stik.webp"
        },
        {
          "id": "silly",
          "label": "Silly",
          "sprite": "assets/Enemies/stik_silly.webp"
        }
      ],
      "unrevealedSprite": "assets/Concealed/appearance-1.svg"
    },
    {
      "id": "minbus",
      "name": "Minbus",
      "color": "#474452",
      "mainWorldSprite": "assets/Overworld/enemy-minbus.webp",
      "cry": "assets/EnemyCries/minbus.flac",
      "description": "An emotional, fluffy little guy.",
      "initialMood": "angry",
      "moods": [
        {
          "id": "angry",
          "label": "Angry",
          "sprite": "assets/Enemies/angryminbus.webp"
        },
        {
          "id": "happy",
          "label": "Happy",
          "sprite": "assets/Enemies/happyminbus.webp"
        },
        {
          "id": "sad",
          "label": "Sad",
          "sprite": "assets/Enemies/sadminbus.webp",
          "action": {
            "label": "Precipitate",
            "sprite": "assets/Enemies/minbus-precipitate.webp",
            "durationMs": 1200
          }
        }
      ],
      "unrevealedSprite": "assets/Concealed/appearance-2.svg"
    },
    {
      "id": "possessed-stump",
      "name": "Possessed Stump",
      "color": "#4a5036",
      "mainWorldSprite": "assets/Overworld/enemy-possessed-stump.webp",
      "cry": "assets/EnemyCries/possessed-stump.flac",
      "description": "A Stumpion possessed by an ancient evil.",
      "initialMood": "normal",
      "moods": [
        {
          "id": "normal",
          "label": "Battle appearance",
          "sprite": "assets/Enemies/possessed-stump.webp"
        }
      ],
      "unrevealedSprite": "assets/Concealed/appearance-3.svg"
    }
  ],
  "bbi": {
    "hatters": [
      {
        "rank": 1,
        "sprite": "assets/Concealed/executive-1.svg"
      },
      {
        "rank": 2,
        "sprite": "assets/Concealed/executive-2.svg"
      },
      {
        "rank": 3,
        "sprite": "assets/Concealed/executive-3.svg"
      },
      {
        "rank": 4,
        "sprite": "assets/Concealed/executive-4.svg"
      },
      {
        "rank": 5,
        "sprite": "assets/Concealed/executive-5.svg"
      }
    ]
  },
  "tracks": [
    {
      "title": "Title Theme",
      "composer": "neoware",
      "src": "assets/Music/title-theme-preview.ogg",
      "seconds": 30,
      "composerUrl": ""
    },
    {
      "title": "The Sid Shop",
      "composer": "Caf",
      "src": "assets/Music/sid-shop-preview.ogg",
      "seconds": 30
    },
    {
      "title": "Atawawa Battle",
      "composer": "Neoware",
      "src": "assets/Music/atawawa-battle-preview.ogg",
      "seconds": 30
    },
    {
      "title": "Riyan's Theme",
      "composer": "Luis F.",
      "src": "assets/Music/riyans-theme-preview.ogg",
      "seconds": 30
    }
  ]
};
