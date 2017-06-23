// stats are [increase per level, base at level 0]
// terrain is air/ground/water/space
// spiritCommands are [name, cost]
// willgains [attack hit, attack missed, dodge success, dodge fail, ally defeated, kill]
// pilot skills (at max level) [name, level]

/*
var blank =  
  {
    name: "",
    stats: {
      mel: [], rng: [], hit: [], 
      evd: [], def: [], man: [], sp:[]
    },
    terrain: "",
    spiritCommands: [
      [], [], [], 
      [], [], []
    ], 
    aceBonus: "",
    willGain: [],
    pilotSkills: [
      [], []
    ],
    relationships: [
      {
        people: [], 
        type: "",
        level: 0,
        effect: ""
      }
    ]
  };
*/

var pilots = [
  {
    name: "Kyosuke Nambu",
    stats: {
      mel: [.8723,142], rng: [.6064,129], hit: [2,177], 
      evd: [1.6702,163], def: [.8298,124], man: [.8404,140], sp:[1.6596,46]
    },
    terrain: "AABA",
    spiritCommands: [
      ["Accel", 5], ["Focus", 15], ["Assail", 15], 
      ["Strike", 10], ["Valor", 40], ["Alert", 10]
    ],
    aceBonus: "Counter Activation +10%, Melee +10%",
    willGain: [2,-1,0,2,2,5],
    pilotSkills: [
      ["Fortune", 1], ["Counter", 8]
    ],
    relationships: [
      {
        people: ["Excellen"],
        type: "Love",
        level: 3,
        effect: "+12% damage to enemies"
      },
      {
        people: ["Sanger", "Bullet"],
        type: "Friendship",
        level: 2,
        effect: "+10% hit and evade"
      },
      {
        people: ["Ryusei"],
        type: "Rivalry",
        level: 2,
        effect: "+10% critical"
      }
    ]
  },
  {
    name: "Excellen Browning",
    stats: {
      mel: [.6702,126], rng: [.8723,139], hit: [2,178], 
      evd: [2.2021,176], def: [.6064, 101], man: [.8404,136], sp:[1.6596,44]
    },
    terrain: "AABA",
    spiritCommands: [
      ["Alert", 10], ["Focus", 15], ["Snipe", 10], 
      ["Valor", 40], ["Strike", 10], ["Love", 65]
    ], 
    aceBonus: "Off. Support and Def. Support +10%",
    willGain: [0,3,1,2,0,5],
    pilotSkills: [
      ["Hit & Away", 1], ["Def.Support", 3]
    ],
    relationships: [
      {
        people: ["Kyosuke"], 
        type: "Love",
        level: 3,
        effect: "+12% damage to enemies"
      },
      {
        people: ["Sanger", "Bullet"], 
        type: "Friendship",
        level: 2,
        effect: "+10% hit and evade"
      }
    ]
  },
  {
    name: "Lee Linjun",
    stats: {
      mel: [.6702,121], rng: [.8723,135], hit: [2,161], 
      evd: [2.2021,94], def: [.6064,113], man: [.8404,137], sp:[1.6596,46]
    },
    terrain: "AAAA",
    spiritCommands: [
      ["Guard", 20], ["Strike", 20], ["Gain", 15], 
      ["Snipe", 25], ["Valor", 55], ["Assail", 30]
    ], 
    aceBonus: "Counter strike chance +10%, Damage Taken -10%",
    willGain: [1,1,1,1,1,5],
    pilotSkills: [
      ["Command", 4], ["Off.Support", 3]
    ],
    relationships: []
  },
  {
    name: "Lamia Loveless",
    stats: {
      mel: [.8,137], rng: [.7579,139], hit: [2,180], 
      evd: [2,171], def: [.7474,121], man: [.7474,138], sp:[1.6632,56]
    },
    terrain: "AAAA",
    spiritCommands: [
      ["Strike", 10], ["Guard", 20], ["Focus", 10], 
      ["Valor", 40], ["Alert", 10], ["Zeal", 55]
    ], 
    aceBonus: "Shooting +5%, Accuracy +10%",
    willGain: [2,0,2,1,2,3],
    pilotSkills: [
      ["Prevail", 8], ["Counter", 1], ["Predict", 1]
    ],
    relationships: [
      {
        people: ["Kyosuke"], 
        type: "Rivalry",
        level: 1,
        effect: "+5% critical"
      },
      {
        people: ["Excellen"], 
        type: "Friendship",
        level: 2,
        effect: "+10% hit and evade"
      }
    ]
  },
  {
    name: "Brooklyn 'Bullet' Luckfield",
    stats: {
      mel: [.8, 138], rng: [.7579, 136], hit: [2, 173], 
      evd: [2, 173], def: [.7474, 107], man: [.7474, 134], sp:[1.6632, 43]
    },
    terrain: "AABA",
    spiritCommands: [
      ["Alert", 10], ["Strike", 15], ["Gain", 20], 
      ["Focus", 15], ["Valor", 35], ["Spirit", 35]
    ], 
    aceBonus: "Accuracy +10%, Critical +10%",
    willGain: [2,-1,0,2,2,5],
    pilotSkills: [
      ["Telekinesis", 8], ["In-fight", 8]
    ],
    relationships: [
      {
        people: ["Kusuha"], 
        type: "Love",
        level: 2,
        effect: "+8% Damage"
      },
      {
        people: ["Sanger", "Excellen", "Kyosuke"], 
        type: "Friendship",
        level: 2,
        effect: "+10% hit and evade"
      },
      {
        people: ["Yuuki"], 
        type: "Rivalry",
        level: 2,
        effect: "+10% critical"
      }
    ]
  },
  {
    name: "Sleigh Presty",
    stats: {
      mel: [.6737, 134], rng: [.8737, 139], hit: [2, 178], 
      evd: [2.2, 179], def: [.6, 109], man: [.8316, 140], sp:[1.6632, 48]
    },
    terrain: "AAAA",
    spiritCommands: [
      ["Accel", 5], ["Focus", 15], ["Alert", 10], 
      ["Snipe", 20], ["Valor", 30], ["Strike", 20]
    ], 
    aceBonus: "+10% counterstrike chance",
    willGain: [1,1,1,1,1,5],
    pilotSkills: [
      ["Hit & Away", 1], ["Attacker", 1]
    ],
    relationships: [
      {
        people: ["Ibis"], 
        type: "Frienship",
        level: 1,
        effect: "+10% hit and evade"
      }
    ]
  },
  {
    name: "Ibis Douglas",
    stats: {
      mel: [.7368, 131], rng: [.9053, 135], hit: [2.0316, 173], 
      evd: [2.1368, 173], def: [.6316, 97], man: [.7474, 129], sp:[1.7474, 39]
    },
    terrain: "AABA",
    spiritCommands: [
      ["Focus", 15], ["Strike", 20], ["Gain", 10], 
      ["Alert", 10], ["Valor", 40], ["Accel", 5]
    ], 
    aceBonus: "+1 mobility",
    willGain: [2,-1,0,2,2,5],
    pilotSkills: [
      ["Off.Support", 3], ["Combo Attack", 1], ["Counter", 6]
    ],
    relationships: [
      {
        people: ["Sleigh"], 
        type: "Friendship",
        level: 2,
        effect: "+10% hit and evade"
      }
    ]
  },
  {
    name: "Raidese F. Branstein",
    stats: {
      mel: [.6703, 131], rng: [.8681, 140], hit: [2, 178], 
      evd: [2.1978, 175], def: [.6044, 113], man: [.8352, 138], sp:[1.6593, 44]
    },
    terrain: "AAAA",
    spiritCommands: [
      ["Focus", 15], ["Accel", 5], ["Strike", 10], 
      ["Snipe", 10], ["Valor", 40], ["Fury", 20]
    ], 
    aceBonus: "Accuracy +10%, Evade +10%",
    willGain: [2,0,2,1,2,3],
    pilotSkills: [
      ["Genius", 1], ["Hit & Away", 1]
    ],
    relationships: [
      {
        people: ["Ratsel", "Leona"], 
        type: "Friendship",
        level: 1,
        effect: "+5% hit and evade"
      },
      {
        people: ["Ryusei", "Aya", "Mai", "Villeta"], 
        type: "Friendship",
        level: 2,
        effect: "+10% hit and evade"
      }
    ]
  },
  {
    name: "Latooni Subota",
    stats: {
      mel: [.8022, 137], rng: [.7912, 137], hit: [2.011, 177], 
      evd: [1.978, 177], def: [.7582, 95], man: [.7473, 138], sp:[2.1209, 39]
    },
    terrain: "AAAA",
    spiritCommands: [
      ["Alert", 10], ["Focus", 10], ["Strike", 15], 
      ["Faith", 40], ["Valor", 45], ["Enable", 70]
    ], 
    aceBonus: "+20% EXP",
    willGain: [2,0,2,1,2,3],
    pilotSkills: [
      ["Genius", 1], ["Off.Support", 2], ["Def.Support", 2]
    ],
    relationships: [
      {
        people: ["Ryusei"], 
        type: "Love",
        level: 1,
        effect: "+4% damage to enemies"
      },
      {
        people: ["Kai", "Shine"], 
        type: "Friendship",
        level: 2,
        effect: "+10% hit and evade"
      },
      {
        people: ["Arado", "Seolla", "Ouka"], 
        type: "Friendship",
        level: 3,
        effect: "+15% hit and evade"
      }
    ]
  },
  {
    name: "Kai Kitamura",
    stats: {
      mel: [.8, 140], rng: [.7556, 134], hit: [2, 177], 
      evd: [1.6667, 177], def: [.8333, 136], man: [.7556, 142], sp:[1.6667, 53]
    },
    terrain: "ASAS",
    spiritCommands: [
      ["Focus", 15], ["Valor", 35], ["Strike", 15], 
      ["Resolve", 10], ["Guard", 30], ["Drive", 55]
    ], 
    aceBonus: "Command Bonus +5%, Critical +10%",
    willGain: [2,-1,0,2,2,5],
    pilotSkills: [
      ["Command", 3], ["Attacker", 1], ["Chain Attack", 4]
    ],
    relationships: [
      {
        people: ["Latooni"], 
        type: "Friendship",
        level: 2,
        effect: "+10% hit and evade"
      },
      {
        people: ["Sanger", "Ratsel", "Gilliam"], 
        type: "Friendship",
        level: 3,
        effect: "+15% hit and evade"
      }
    ]
  },
  {
    name: "Tetsuya Onodera",
    stats: {
      mel: [.6067, 129], rng: [.7416, 128], hit: [1.6742, 154], 
      evd: [2, 96], def: [.6067, 100], man: [.6517, 128], sp:[1.6629, 36]
    },
    terrain: "AAAA",
    spiritCommands: [
      ["Strike", 20], ["Guard", 25], ["Guts", 35], 
      ["Snipe", 20], ["Fury", 30], ["Valor", 40]
    ], 
    aceBonus: "Damage Received -10%",
    willGain: [1,1,1,1,1,5],
    pilotSkills: [
      ["Command", 4], ["Off.Support", 3], ["Def.Support", 3]
    ],
    relationships: [
      {
        people: ["Lefina"], 
        type: "Friendshi[",
        level: 1,
        effect: "+5% hit and evade"
      }
    ]
  },
  {
    name: "Daitetsu Minase",
    stats: {
      mel: [.6067, 130], rng: [.7416, 131], hit: [1.6742, 156], 
      evd: [2, 97], def: [.6067, 104], man: [.6517, 145], sp:[1.6629, 46]
    },
    terrain: "AAAA",
    spiritCommands: [
      ["Strike", 20], ["Guard", 30], ["Guts", 40], 
      ["Mercy", 10], ["Fury", 30], ["Valor", 45]
    ], 
    aceBonus: "Damage taken -10%",
    willGain: [1,1,1,1,1,5],
    pilotSkills: [
      ["Command", 4], ["Off.Support", 3], ["Def.Support", 3]
    ],
    relationships: [
    ]
  },
  {
    name: "Villeta Vadmin",
    stats: {
      mel: [.6742, 134], rng: [.8652, 139], hit: [2, 179], 
      evd: [2.2022, 179], def: [.6067, 101], man: [.8315, 142], sp:[1.6629, 48]
    },
    terrain: "ASBS",
    spiritCommands: [
      ["Scan", 1], ["Focus", 10], ["Accel", 5], 
      ["Alert", 10], ["Valor", 40], ["Strike", 10]
    ], 
    aceBonus: "Critical +20%, SP +10",
    willGain: [2,0,2,1,2,3],
    pilotSkills: [
      ["Gunfight", 9], ["Focus", 1], ["Def.Support", 2]
    ],
    relationships: [
      {
        people: ["Ryusei", "Rai", "Aya", "Mai"], 
        type: "Friendship",
        level: 2,
        effect: "+10% hit and evade"
      }
    ]
  },
  {
    name: "Ryusei Date",
    stats: {
      mel: [.8, 138], rng: [.7556, 138], hit: [2, 175], 
      evd: [2, 174], def: [.7444, 108], man: [.7444, 136], sp:[1.6667, 42]
    },
    terrain: "AABA",
    spiritCommands: [
      ["Focus", 15], ["Alert", 10], ["Strike", 15], 
      ["Luck", 30], ["Valor", 35], ["Zeal", 70]
    ], 
    aceBonus: "Telekinesis Weapons Damage +10%",
    willGain: [2,-1,0,2,2,5],
    pilotSkills: [
      ["Telekinesis", 9], ["Prevail", 9], ["Chain Attack", 4]
    ],
    relationships: [
      {
        people: ["Rai", "Aya", "Mai", "Villeta"], 
        type: "Friendship",
        level: 2,
        effect: "+10% hit and evade"
      },
      {
        people: ["Kyosuke"], 
        type: "Rivalry",
        level: 2,
        effect: "+10% critical"
      }
    ]
  },
  {
    name: "Irmgult Kazahara",
    stats: {
      mel: [.8764, 140], rng: [.6067, 137], hit: [2, 176], 
      evd: [1.6742, 127], def: [.8315, 127], man: [.8315, 142], sp:[1.6629, 49]
    },
    terrain: "AAAA",
    spiritCommands: [
      ["Strike", 10], ["Alert", 10], ["Spirit", 35], 
      ["Valor", 40], ["Focus", 15], ["Love", 60]
    ], 
    aceBonus: "Love Costs 45 SP",
    willGain: [0,3,1,2,0,5],
    pilotSkills: [
      ["Prevail", 9], ["In-fight", 5], ["Predict", 1]
    ],
    relationships: [
      {
        people: ["Ring"], 
        type: "Love",
        level: 3,
        effect: "+12% damage to enemies"
      },
      {
        people: ["Kyosuke", "Excellen"], 
        type: "Friendship",
        level: 2,
        effect: "+10% hit and evade"
      }
    ]
  },
  {
    name: "Russel Bergman",
    stats: {
      mel: [.8621, 128], rng: [.5057, 132], hit: [2, 165], 
      evd: [1.6667, 169], def: [1, 146], man: [.6667, 124], sp:[1.6667, 72]
    },
    terrain: "AABA",
    spiritCommands: [
      ["Strike", 20], ["Guard", 15], ["Trust", 20], 
      ["Gain", 15], ["Faith", 30], ["Rouse", 30]
    ], 
    aceBonus: "Damage Received -20%",
    willGain: [0,0,1,1,1,5],
    pilotSkills: [
      ["Prevail", 9], ["Off.Support", 3], ["Def.Support", 3]
    ],
    relationships: [
      {
        people: ["Leona", "Tasuku", "Lefina", "Katina"], 
        type: "Friendship",
        level: 2,
        effect: "+10% hit and evade"
      }
    ]
  },
  {
    name: "Katina Tarask",
    stats: {
      mel: [.8046, 135], rng: [.8276, 133], hit: [2, 174], 
      evd: [2, 172], def: [.6322, 130], man: [.7471, 139], sp:[1.6667, 57]
    },
    terrain: "AABA",
    spiritCommands: [
      ["Strike", 20], ["Valor", 30], ["Assail", 5], 
      ["Accel", 5], ["Alert", 10], ["Drive", 55]
    ], 
    aceBonus: "Accuracy +10%, Damage Received -10% ",
    willGain: [0,2,0,2,2,5],
    pilotSkills: [
      ["Counter", 7], ["Revenge", 1], ["Chain Attack", 4]
    ],
    relationships: [
      {
        people: ["Leona", "Tasuku", "Lefina", "Russel"], 
        type: "Friendship",
        level: 2,
        effect: "+10% hit and evade"
      }
    ]
  },
  {
    name: "Leona Garstein",
    stats: {
      mel: [.6667, 134], rng: [.8736, 137], hit: [2, 177], 
      evd: [2.1954, 175], def: [.5977, 103], man: [.8391, 137], sp:[1.6667, 44]
    },
    terrain: "AABS",
    spiritCommands: [
      ["Accel", 5], ["Focus", 15], ["Fury", 20], 
      ["Strike", 15], ["Valor", 40], ["Alert", 10]
    ], 
    aceBonus: "Accuracy +10%, Evade +20%",
    willGain: [2,0,2,1,2,3],
    pilotSkills: [
      ["Telekinesis", 8], ["Attacker", 1], ["Hit & Away", 1]
    ],
    relationships: [
      {
        people: ["Ratsel", "Rai"], 
        type: "Friendship",
        level: 1,
        effect: "+5% hit and evade"
      },
      {
        people: ["Lefina", "Russel", "Katina"], 
        type: "Friendship",
        level: 2,
        effect: "10% hit and evade"
      },
      {
        people: ["Tasuku"], 
        type: "Love",
        level: 2,
        effect: "+8 damage to enemies"
      }
    ]
  },
  {
    name: "Tasuku Shinguji",
    stats: {
      mel: [.8621, 136], rng: [.5057, 129], hit: [2, 173], 
      evd: [1.6667, 157], def: [1, 137], man: [.6667, 127], sp:[1.6667, 45]
    },
    terrain: "AABA",
    spiritCommands: [
      ["Strike", 20], ["Luck", 25], ["Accel", 5], 
      ["Guard", 25], ["Valor", 35], ["Love", 70]
    ], 
    aceBonus: "Lucky Activation +10%, Luck costs 15 SP",
    willGain: [0,3,1,2,0,5],
    pilotSkills: [
      ["Telekinesis", 8], ["Lucky", 1], ["Def.Support", 3]
    ],
    relationships: [
      {
        people: ["Lefina", "Russel", "Katina"], 
        type: "Friendship",
        level: 2,
        effect: "+10% hit and evade"
      },
      {
        people: ["Leona"], 
        type: "Love",
        level: 2,
        effect: "+8% damage to enemies"
      }
    ]
  },
  {
    name: "Lefina Enfield",
    stats: {
      mel: [.7586, 101], rng: [.9425, 124], hit: [2.0575, 157], 
      evd: [2.1839, 102], def: [.6322, 109], man: [.7586, 118], sp:[1.7241, 48]
    },
    terrain: "AAAA",
    spiritCommands: [
      ["Strike", 15], ["Gain", 10], ["Trust", 20], 
      ["Bless", 20], ["Rouse", 50], ["Hope", 70]
    ], 
    aceBonus: "Command Bonus +5%",
    willGain: [1,-2,1,1,-1,5],
    pilotSkills: [
      ["Command", 4], ["Off.Support", 3], ["Def.Support", 3]
    ],
    relationships: [
      {
        people: ["Daitetsu", "Tetsuya"], 
        type: "Friendship",
        level: 1,
        effect: "+5% hit and evade"
      },
      {
        people: ["Leona", "Tasuku", "Katina", "Russel"], 
        type: "Friendship",
        level: 2,
        effect: "+10% hit and evade"
      }
    ]
  },
  {
    name: "Sean Webley",
    stats: {
      mel: [.5977, 95], rng: [.7471, 124], hit: [1.6667, 152], 
      evd: [2, 95], def: [.5977, 109], man: [.6552, 139], sp:[1.6667, 49]
    },
    terrain: "AAAA",
    spiritCommands: [
      ["Mercy", 10], ["Vigor", 15], ["Luck", 40], 
      ["Guard", 30], ["Valor", 40], ["Alert", 10]
    ], 
    aceBonus: "Critical +5%",
    willGain: [1,-2,1,1,-1,5],
    pilotSkills: [
    ],
    relationships: [
    ]
  },
  {
    name: "Lune Zoldark",
    stats: {
      mel: [.6747, 136], rng: [.8675, 137], hit: [2, 174], 
      evd: [2.1928, 183], def: [.6024, 109], man: [.8313, 140], sp:[1.627, 45]
    },
    terrain: "AABA",
    spiritCommands: [
      ["Strike", 20], ["Alert", 10], ["Focus", 15], 
      ["Gain", 15], ["Valor", 35], ["Spirit", 35]
    ], 
    aceBonus: "Damage +10%",
    willGain: [2,-1,0,2,2,5],
    pilotSkills: [
      ["Gunfight", 8], ["Off.Support", 2], ["Revenge", 1]
    ],
    relationships: [
      {
        people: ["Masaki"], 
        type: "Love",
        level: 3,
        effect: "+12% damage to enemies"
      }
    ]
  },
  {
    name: "Gilliam Yager",
    stats: {
      mel: [.8049, 137], rng: [.7561, 140], hit: [2, 180], 
      evd: [2, 181], def: [.7439, 102], man: [.7439, 143], sp:[1.6585, 43]
    },
    terrain: "ASAS",
    spiritCommands: [
      ["Resolve", 10], ["Focus", 10], ["Strike", 10], 
      ["Valor", 40], ["Alert", 10], ["Zeal", 55]
    ], 
    aceBonus: "Evade +15%",
    willGain: [1,1,1,1,1,5],
    pilotSkills: [
      ["Prophesy", 1], ["SP Regenerate", 1], ["Hit & Away", 1], ["Off.Support", 2]
    ],
    relationships: [
      {
        people: ["Sanger", "Ratsel", "Kai"], 
        type: "Friendship",
        level: 3,
        effect: "+15% hit and evade"
      },
      {
        people: ["Lamia"], 
        type: "Rivalry",
        level: 1,
        effect: "+4% damage to enemies"
      }
    ]
  },
  {
    name: "Radha Byraban",
    stats: {
      mel: [.506, 117], rng: [.494, 134], hit: [1.6988, 172], 
      evd: [1.6506, 176], def: [.6024, 143], man: [.5542, 129], sp:[2, 66]
    },
    terrain: "AABA",
    spiritCommands: [
      ["Focus", 10], ["Alert", 10], ["Bless", 30], 
      ["Attune", 35], ["Prayer", 10], ["Enable", 80]
    ], 
    aceBonus: "Dodge +10%, SP +20",
    willGain: [0,0,1,1,1,5],
    pilotSkills: [
      ["Prophesy", 1], ["SP Regenerate", 1], ["Def.Support", 3]
    ],
    relationships: [
      {
        people: ["Rio", "Ryoto", "Ring"], 
        type: "Friendship",
        level: 2,
        effect: "+10% hit and evade"
      }
    ]
  },
  {
    name: "Arado Balanga",
    stats: {
      mel: [.988, 130], rng: [.6265, 121], hit: [2.0482, 169], 
      evd: [1.8916, 168], def: [.9036, 138], man: [.7831, 114], sp:[1.7108, 70]
    },
    terrain: "AABA",
    spiritCommands: [
      ["Alert", 10], ["Strike", 15], ["Guts", 20], 
      ["Focus", 15], ["Valor", 35], ["Spirit", 30]
    ], 
    aceBonus: "Melee +5%, money +10%",
    willGain: [0,3,1,2,0,5],
    pilotSkills: [
      ["Fortune", 1], ["Lucky", 1], ["Def.Support", 4]
    ],
    relationships: [
      {
        people: ["Seolla"], 
        type: "Love",
        level: 3,
        effect: "+12% damage to enemies"
      },
      {
        people: ["Ouka", "Latooni"], 
        type: "Friendship",
        level: 3,
        effect: "+10% hit and evade"
      }
    ]
  },
  {
    name: "Ring Mao",
    stats: {
      mel: [.8072, 136], rng: [.759, 139], hit: [2, 176], 
      evd: [2, 175], def: [.747, 118], man: [.747, 138], sp:[1.6627, 65]
    },
    terrain: "AAAS",
    spiritCommands: [
      ["Strike", 10], ["Focus", 15], ["Alert", 10], 
      ["Valor", 40], ["Rouse", 50], ["Enable", 70]
    ], 
    aceBonus: "Accuracy +10%, Evade +10%, Critical +10%",
    willGain: [0,0,0,1,0,5],
    pilotSkills: [
      ["Off.Support", 3], ["Hit & Away", 1], ["Focus", 1], ["Predict", 1]
    ],
    relationships: [
      {
        people: ["Irm"], 
        type: "Love",
        level: 3,
        effect: "+12% damage to enemies"
      },
      {
        people: ["Radha", "Rio", "Ryoto"], 
        type: "Friendship",
        level: 2,
        effect: "+10% hit and evade"
      }
    ]
  },
  {
    name: "Rio Meilong",
    stats: {
      mel: [.8072, 133], rng: [.8313, 135], hit: [2, 175], 
      evd: [2, 172], def: [.6386, 124], man: [.747, 133], sp:[1.6627, 48]
    },
    terrain: "AABA",
    spiritCommands: [
      ["Alert", 10], ["Gain", 15], ["Valor", 35], 
      ["Strike", 20], ["Focus", 15], ["Accel", 5]
    ], 
    aceBonus: "EXP +10%, Kills +10%",
    willGain: [2,-1,0,2,2,5],
    pilotSkills: [
      ["Telekinesis", 8], ["Prevail", 9], ["Morale", 1]
    ],
    relationships: [
      {
        people: ["Ring", "Radha"], 
        type: "Friendship",
        level: 2,
        effect: "+10% hit and evade"
      },
      {
        people: ["Ryoto"], 
        type: "Love",
        level: 2,
        effect: "+8% damage to enemies"
      }
    ]
  },
  {
    name: "Ryoto Hikawa",
    stats: {
      mel: [.8072, 136], rng: [.759, 134], hit: [2, 176], 
      evd: [2, 176], def: [.747, 99], man: [.747, 136], sp:[1.6627, 41]
    },
    terrain: "AABA",
    spiritCommands: [
      ["Focus", 15], ["Alert", 10], ["Mercy", 5], 
      ["Strike", 15], ["Valor", 40], ["Zeal", 60]
    ], 
    aceBonus: "Damage Dealt +5%, Damage Taken -5%",
    willGain: [0,0,1,1,1,5],
    pilotSkills: [
      ["Telekinesis", 9], ["Def.Support", 3], ["Predict", 1]
    ],
    relationships: [
      {
        people: ["Ring", "Radha"], 
        type: "Friendship",
        level: 2,
        effect: "+10% hit and evade"
      },
      {
        people: ["Rio"], 
        type: "Love",
        level: 2,
        effect: "+8% damage to enemies"
      }
    ]
  },
  {
    name: "Kusuha Mizuha",
    stats: {
      mel: [.8095, 136], rng: [.75, 137], hit: [2, 175], 
      evd: [2, 161], def: [.75, 114], man: [.75, 131], sp:[1.6667, 52]
    },
    terrain: "AAAA",
    spiritCommands: [
      ["Strike", 15], ["Guard", 25], ["Focus", 15], 
      ["Valor", 45], ["Zeal", 60], ["Love", 65]
    ], 
    aceBonus: "Support Defence +10%, EXP +10% ",
    willGain: [1,1,1,1,1,5],
    pilotSkills: [
      ["Telekinesis", 9], ["Def.Support", 2], ["Focus", 1]
    ],
    relationships: [
      {
        people: ["Bullet"], 
        type: "Love",
        level: 2,
        effect: "+8% damage to enemies"
      },
      {
        people: ["Ryusei"], 
        type: "Friendship",
        level: 2,
        effect: "+10% hit and evade"
      }
    ]
  },
  {
    name: "Ratsel Feinschmecker",
    stats: {
      mel: [.8049, 133], rng: [.7561, 141], hit: [2, 185], 
      evd: [2, 172], def: [.7439, 136], man: [.7439, 144], sp:[1.6585, 45]
    },
    terrain: "AAAS",
    spiritCommands: [
      ["Focus", 10], ["Strike", 10], ["Alert", 10], 
      ["Accel", 5], ["Valor", 40], ["Fury", 15]
    ], 
    aceBonus: "Shooting +10%",
    willGain: [1,1,1,1,1,5],
    pilotSkills: [
      ["Genius", 1], ["Gunfight", 9], ["Focus", 1], ["Hit & Away", 1]
    ],
    relationships: [
      {
        people: ["Rai", "Leona"], 
        type: "Friendship",
        level: 1,
        effect: "+5% hit and evade"
      },
      {
        people: ["Sanger", "Gilliam", "Kai"], 
        type: "Friendship",
        level: 2,
        effect: "+10% hit and evade"
      }
    ]
  },
  {
    name: "Masaki Andoh",
    stats: {
      mel: [.8072, 139], rng: [.8313, 136], hit: [2, 176], 
      evd: [2, 177], def: [.6386, 107], man: [.747, 137], sp:[1.6627, 41]
    },
    terrain: "AABA",
    spiritCommands: [
      ["Focus", 15], ["Alert", 10], ["Luck", 40], 
      ["Valor", 35], ["Spirit", 35], ["Strike", 10]
    ], 
    aceBonus: "Damage +5%, Accuracy +10%",
    willGain: [2,-1,0,2,2,5],
    pilotSkills: [
      ["Prevail", 9], ["In-fight", 8], ["Chain Attack", 4]
    ],
    relationships: [
      {
        people: ["Lune"], 
        type: "Love",
        level: 2,
        effect: "+8% damage to enemies"
      }
    ]
  },
  {
    name: "Sanger Zonvolt",
    stats: {
      mel: [.875, 145], rng: [.6, 130], hit: [2, 177], 
      evd: [1.675, 163], def: [.8375, 129], man: [.8375, 153], sp:[1.6625, 46]
    },
    terrain: "ASAS",
    spiritCommands: [
      ["Strike", 10], ["Drive", 45], ["Guard", 30], 
      ["Resolve", 10], ["Valor", 35], ["Alert", 10]
    ], 
    aceBonus: "Melee +10%",
    willGain: [2,-1,0,2,2,5],
    pilotSkills: [
      ["Prevail", 9], ["Counter", 9], ["In-fight", 9], ["Predict", 1]
    ],
    relationships: [
      {
        people: ["Kyosuke", "Excellen", "Bullet"], 
        type: "Friendship",
        level: 2,
        effect: "+10% hit and evade"
      },
      {
        people: ["Ratsel", "Gilliam", "Kai"], 
        type: "Friendship",
        level: 3,
        effect: "+15% hit and evade"
      }
    ]
  },
  {
    name: "Shine Hausen",
    stats: {
      mel: [.8667, 122], rng: [.8933, 120], hit: [2.08, 169], 
      evd: [2.0533, 170], def: [.7867, 121], man: [.7867, 115], sp:[2.1467, 59]
    },
    terrain: "AACA",
    spiritCommands: [
      ["Alert", 10], ["Cheer", 25], ["Focus", 20], 
      ["Bless", 50], ["Valor", 40], ["Strike", 15]
    ], 
    aceBonus: "Money +20%",
    willGain: [0,0,0,1,0,5],
    pilotSkills: [
      ["Prophesy", 1], ["Fortune", 1], ["Focus", 1], ["Off.Support", 3]
    ],
    relationships: [
      {
        people: ["Rai"], 
        type: "Love",
        level: 3,
        effect: "+12% damage to enemies"
      },
      {
        people: ["Latooni"], 
        type: "Friendship",
        level: 2,
        effect: "+10% hit and evade"
      }
    ]
  },
  {
    name: "Aya Kobayashi",
    stats: {
      mel: [.6053, 125], rng: [.7368, 137], hit: [1.6711, 176], 
      evd: [2, 174], def: [.6053, 126], man: [.6447, 133], sp:[1.6579, 64]
    },
    terrain: "AABA",
    spiritCommands: [
      ["Alert", 10], ["Prayer", 15], ["Focus", 15], 
      ["Attune", 30], ["Valor", 40], ["Renew", 60]
    ], 
    aceBonus: "Accuracy +10%, SP +20",
    willGain: [0,0,1,1,1,5],
    pilotSkills: [
      ["Telekinesis", 7], ["Def.Support", 3], ["Off.Support", 3], ["Focus", 1]
    ],
    relationships: [
      {
        people: ["Ryusei", "Rai", "Villeta"], 
        type: "Friendship",
        level: 2,
        effect: "+10% hit and evade"
      },
      {
        people: ["Mai"], 
        type: "Friendship",
        level: 3,
        effect: "+15% hit and evade"
      }
    ]
  },
  {
    name: "Mai Kobayashi",
    stats: {
      mel: [.8026, 124], rng: [.75, 139], hit: [2, 177], 
      evd: [2, 177], def: [.75, 114], man: [.75, 130], sp:[1.6579, 57]
    },
    terrain: "AABA",
    spiritCommands: [
      ["Strike", 10], ["Focus", 15], ["Attune", 30], 
      ["Alert", 10], ["Valor", 45], ["Zeal", 55]
    ], 
    aceBonus: "Accuracy +10%, SP +20",
    willGain: [1,1,1,1,1,5],
    pilotSkills: [
      ["Telekinesis", 9], ["SP Regenerate", 1], ["Fortune", 1], ["Off.Support", 3]
    ],
    relationships: [
      {
        people: ["Ryusei", "Rai", "Villeta"], 
        type: "Friendship",
        level: 2,
        effect: "+10% hit and evade"
      },
      {
        people: ["Aya"], 
        type: "Friendship",
        level: 3,
        effect: "+15% hit and evade"
      }
    ]
  },
  {
    name: "Carla Borgnine",
    stats: {
      mel: [.6667, 134], rng: [.8406, 130], hit: [2, 173], 
      evd: [2, 171], def: [.7391, 148], man: [.7536, 134], sp:[1.6667, 57]
    },
    terrain: "AAAA",
    spiritCommands: [
      ["Assail", 25], ["Focus", 15], ["Strike", 15], 
      ["Rouse", 40], ["Valor", 35], ["Love", 60]
    ], 
    aceBonus: "Accuracy +10%, Kills +10%",
    willGain: [0,3,1,2,0,5],
    pilotSkills: [
      ["Telekinesis", 8], ["Fortune", 1], ["Def.Support", 3], ["Off.Support", 3]
    ],
    relationships: [
      {
        people: ["Yuuki"], 
        type: "Love",
        level: 2,
        effect: "+8% damage to enemies"
      }
    ]
  },
  {
    name: "Yuuki Jaggar",
    stats: {
      mel: [.8088, 136], rng: [.8235, 138], hit: [2, 176], 
      evd: [2, 177], def: [.6324, 133], man: [.75, 139], sp:[1.6618, 61]
    },
    terrain: "AAAA",
    spiritCommands: [
      ["Focus", 15], ["Strike", 10], ["Alert", 10], 
      ["Accel", 5], ["Valor", 40], ["Drive", 45]
    ], 
    aceBonus: "Evade +10%, Critical +10%",
    willGain: [2,0,2,1,2,3],
    pilotSkills: [
      ["Telekinesis", 8], ["Hit & Away", 1], ["Off.Support", 2], ["Predict", 1]
    ],
    relationships: [
      {
        people: ["Carla"], 
        type: "Love",
        level: 2,
        effect: "+8% damage to enemies"
      }
    ]
  },
  {
    name: "Seolla Schweizer",
    stats: {
      mel: [.597, 125], rng: [.7463, 138], hit: [1.6716, 178], 
      evd: [2, 178], def: [.597, 113], man: [.6567, 140], sp:[1.6567, 46]
    },
    terrain: "AAAA",
    spiritCommands: [
      ["Focus", 15], ["Guard", 30], ["Strike", 10], 
      ["Snipe", 10], ["Valor", 35], ["Love", 60]
    ], 
    aceBonus: "Shooting +5%, EXP +10%",
    willGain: [2,-1,0,2,2,5],
    pilotSkills: [
      ["Off.Support", 3], ["Def.Support", 4], ["Hit & Away", 1], ["Gunfight", 8]
    ],
    relationships: [
      {
        people: ["Arado"], 
        type: "Love",
        level: 3,
        effect: "+12% damage to enemies"
      },
      {
        people: ["Ouka", "Latooni"], 
        type: "Friendship",
        level: 3,
        effect: "+15% to hit and evade"
      }
    ]
  },
  {
    name: "Ouka Nagisa",
    stats: {
      mel: [.8033,141], rng: [.7541, 141], hit: [2, 199], 
      evd: [2, 194], def: [.7377, 145], man: [.7541, 142], sp:[1.6557, 72]
    },
    terrain: "SSAS",
    spiritCommands: [
      ["Focus", 10], ["Alert", 5], ["Rouse", 20], 
      ["Strike", 10], ["Valor", 30], ["Drive", 50]
    ], 
    aceBonus: "Counterstrike +10%",
    willGain: [2,0,2,1,2,3],
    pilotSkills: [
      ["Genius", 1], ["Guard", 1], ["Predict", 1], ["Prevail", 9], ["Gunfight", 9], ["In-fight", 9]
    ],
    relationships: [
      {
        people: ["Arado", "Seolla", "Latooni"], 
        type: "Friendship",
        level: 3,
        effect: "+15% hit and evade"
      }
    ]
  },
  {
    name: "Alfimi",
    stats: {
      mel: [.54, 145], rng: [.64, 150], hit: [1.76, 200], 
      evd: [1.74, 195], def: [.58, 124], man: [.8, 136], sp:[2, 60]
    },
    terrain: "SSSS",
    spiritCommands: [
      ["Attune", 5], ["Hope", 50], ["Rouse", 40], 
      ["Enable", 40], ["Prayer", 10], ["Love", 50]
    ], 
    aceBonus: "Off.Support and Def.Support +10%",
    willGain: [2,-1,0,2,2,5],
    pilotSkills: [
      ["Prophesy", 1], ["Off.Support", 3], ["SP Regenerate", 1], ["Chain Attack", 4], ["Prevail", 9], ["Def.Support", 3]
    ],
    relationships: [
      {
        people: ["Kyosuke"], 
        type: "Love",
        level: 3,
        effect: "+12% damage to enemies"
      }
    ]
  },
  {
    name: "Bob Johnson",
    stats: {
      mel: [.75, 130], rng: [.75, 130], hit: [2, 170], 
      evd: [2, 170], def: [.75, 120], man: [.75, 120], sp:[2, 30]
    },
    terrain: "AAAA",
    spiritCommands: [
      ["Focus", 15], ["Alert", 10], ["Strike", 20], 
      ["Valor", 45], ["Guard", 25], ["Drive", 55]
    ], 
    aceBonus: "None",
    willGain: [1,1,1,1,1,5],
    pilotSkills: [
    ],
    relationships: [
    ]
  }
  
];

module.exports = pilots;