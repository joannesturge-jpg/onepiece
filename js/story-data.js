/* Story data for Luffy's Voyage. Each island has an intro, one or more
   decision points, sometimes a villain to battle and a devil fruit to find,
   and an outro. Choices adjust bond, resolve, infamy and food, some set a
   crew flag that later text and battles react to, and some deal direct
   damage to Luffy for reckless or costly choices. */

const ISLANDS = [
  {
    id: "foosha",
    region: "East Blue",
    name: "Foosha Village",
    art: "boatImage",
    photo: "assets/loc-foosha.webp",
    tagline: "Your story begins where the wind first fills your sail.",
    intro: [
      "The morning sun climbs over Foosha Village. You are Monkey D. Luffy, and today is the day you finally push your little rowboat into the waves.",
      "Somewhere out past the horizon waits the Grand Line, and the treasure left behind by the Pirate King himself. All you have is a straw hat, a rubber body, and a promise to become King of the Pirates."
    ],
    decisions: [
      {
        prompt: "How do you leave the village behind?",
        options: [
          {
            label: "Slip away quietly at dawn, alone in your tiny boat",
            outcome: "You paddle out before anyone wakes, watching the rooftops shrink behind you. No fanfare, just the sea and your own two hands.",
            effects: { resolve: 10, bond: -5, infamy: 0, food: 0 }
          },
          {
            label: "Throw one last loud goodbye with the whole village watching",
            outcome: "The whole village turns out on the dock, cheering and crying at once, and they load your boat with every last rice ball in town. Word of your departure spreads fast, and not everyone who hears it wishes you well.",
            effects: { resolve: 0, bond: 10, infamy: 5, food: 15 }
          }
        ]
      }
    ],
    outro: [
      "The current catches your little boat and pulls you toward open water. Foosha Village disappears behind you, and the real voyage begins."
    ]
  },

  {
    id: "shells-town",
    region: "East Blue",
    name: "Shells Town",
    art: "swordArt",
    photo: "assets/loc-shellstown.webp",
    tagline: "Storm clouds part over a Marine stronghold ruled by a tyrant's fist.",
    intro: [
      "A rough storm throws your boat against the docks of Shells Town, a port under the thumb of a Marine base. Rumor says the base captain, Axe-Hand Morgan, rules the town like a tyrant.",
      "Tied to a wooden cross in the town square is a pirate hunter named Roronoa Zoro, left to starve as entertainment for Morgan's men."
    ],
    decisions: [
      {
        prompt: "Zoro sits bound and starving, sentenced to die at Morgan's word. What do you do?",
        options: [
          {
            label: "Cut him loose and take on Morgan's Marines together",
            outcome: "You free Zoro on the spot. Together you tear through Morgan's base, and the swordsman agrees to sail with you before the fight even ends.",
            effects: { bond: 15, resolve: 10, infamy: 10, food: -5 },
            flag: "zoro"
          },
          {
            label: "Keep walking and let the Marines sort out their own mess",
            outcome: "You decide it isn't your fight and move on, but Morgan's men rough you up on your way out of town for staring too long.",
            effects: { bond: -5, resolve: -5, infamy: 0, food: 0 },
            damage: 10
          }
        ]
      }
    ],
    villain: { id: "morgan", name: "Axe-Hand Morgan", maxHp: 60, retaliation: [6, 12], rewardPoints: 120 },
    outro: {
      zoro: ["With Zoro's three swords now backing your straw hat, your little rowboat suddenly feels a lot less lonely."],
      default: ["You push off from Shells Town with the same crew you arrived with: just yourself."]
    }
  },

  {
    id: "orange-town",
    region: "East Blue",
    name: "Orange Town",
    art: "townArt",
    tagline: "Smoke curls over a town held hostage by a clown with a blade for a body.",
    intro: [
      "Orange Town lies half in ruins, terrorized by Buggy the Clown and his crew. A sharp tongued young thief named Nami is here too, working her own angle against the pirates who wrecked the place.",
      "Buggy's crew has the frightened townsfolk pinned down, and nobody in Orange Town has been able to fight back."
    ],
    decisions: [
      {
        prompt: "How do you deal with Buggy's crew?",
        options: [
          {
            label: "Charge straight into the middle of them",
            outcome: "You go in loud, fists first, and the fight turns into a citywide brawl that burns through your supplies.",
            effects: { resolve: 15, infamy: 15, bond: 0, food: -10 }
          },
          {
            label: "Team up with Nami and pick them off one at a time",
            outcome: "You let Nami read the crew's movements, and together you dismantle them one small group at a time. She still doesn't trust you, but she shares her rations anyway.",
            effects: { bond: 10, resolve: 5, infamy: 5, food: 5 },
            flag: "nami_trust"
          }
        ]
      },
      {
        prompt: "Nami says she's not interested in joining any crew, but admits she needs a large sum of money for her village. Do you promise to help her, no questions asked?",
        options: [
          {
            label: "Give her your word, whatever she needs",
            outcome: "She looks at you like you're a fool for promising something so big to a stranger. She doesn't say thank you, but she doesn't forget it either.",
            effects: { bond: 15, resolve: 0, infamy: 0, food: 0 }
          },
          {
            label: "Tell her that's her own problem to solve",
            outcome: "She shrugs it off like she expected nothing else, and tosses you some dried fish anyway before you part on cool terms.",
            effects: { bond: -10, resolve: 5, infamy: 0, food: 5 }
          }
        ]
      }
    ],
    villain: { id: "buggy", name: "Buggy the Clown", maxHp: 70, retaliation: [7, 13], rewardPoints: 120 },
    outro: ["Buggy's crew scatters, and Orange Town's people start rebuilding. You set your sights further down the coast."]
  },

  {
    id: "syrup-village",
    region: "East Blue",
    name: "Syrup Village",
    art: "flagArt",
    photo: "assets/loc-syrupvillage.webp",
    tagline: "A boy who cries wolf guards a village that doesn't believe him, and this time the wolf is real.",
    intro: [
      "A battered ship finally brings you to Syrup Village, where a long nosed boy named Usopp spends his days telling wild pirate stories that nobody believes.",
      "This time, one of his stories is true: a real pirate crew under a hidden captain named Kuro is closing in on the village, hunting a girl named Kaya who lives in the manor on the hill."
    ],
    decisions: [
      {
        prompt: "Usopp's tall tales have made him a laughingstock, but this warning sounds real. Do you take him seriously?",
        options: [
          {
            label: "Trust him and help him prepare the village to fight back",
            outcome: "You take his warning at face value, and when the real threat arrives, Usopp fights harder than anyone expects. Grateful villagers restock your ship before he asks to join your crew, slingshot and all.",
            effects: { bond: 15, resolve: 10, infamy: 5, food: 5 },
            flag: "usopp"
          },
          {
            label: "Write him off as just another liar and keep moving",
            outcome: "You sail on before the trouble arrives, missing the fight entirely and the chance to resupply along with it.",
            effects: { resolve: -5, bond: 0, infamy: 0, food: -5 }
          }
        ]
      }
    ],
    villain: { id: "kuro", name: "Captain Kuro", maxHp: 65, retaliation: [7, 12], rewardPoints: 120, requiresFlag: "usopp" },
    fruit: {
      id: "balloon",
      name: "Balo Balo no Mi",
      shortName: "the Balloon-Balloon Fruit",
      description: "Found bobbing in the wreckage of Kuro's ship, this strange fruit swells whoever eats it into a bouncing, blast-absorbing balloon.",
      bonusHp: 30
    },
    outro: {
      usopp: ["Usopp claims his stories will one day be about himself. Watching him climb aboard, you almost believe it."],
      default: ["The coastline of Syrup Village fades behind you, its stories left unfinished."]
    }
  },

  {
    id: "baratie",
    region: "East Blue",
    name: "Baratie",
    art: "shipArt",
    photo: "assets/loc-baratie.webp",
    tagline: "Even a floating restaurant isn't safe from a fleet with nothing left to lose.",
    intro: [
      "Hunger drags your ship toward the Baratie, a restaurant built on an old fighting ship that floats permanently at sea. The cooks here fight as hard as they serve food.",
      "A pirate armada under Don Krieg descends on the Baratie demanding food, ships, and total surrender. One cook, a sharp tongued young man named Sanji, refuses to bow."
    ],
    decisions: [
      {
        prompt: "Don Krieg's fleet threatens to burn the Baratie to the waterline. What do you do?",
        options: [
          {
            label: "Stand with Sanji and fight to protect the restaurant",
            outcome: "You throw yourself into the fight beside Sanji, and between his kicks and your fists, Krieg's ambitions collapse. The grateful cooks send you off with a full larder, and Sanji ties on his coat for good.",
            effects: { bond: 15, resolve: 15, infamy: 10, food: 20 },
            flag: "sanji"
          },
          {
            label: "Let the cooks settle their own war",
            outcome: "You hang back and let the Baratie's crew handle Krieg themselves. They manage it, barely, but you leave hungrier than you came and Sanji never gets the push he needed.",
            effects: { resolve: -10, bond: 0, infamy: 0, food: 0 },
            damage: 5
          }
        ]
      }
    ],
    villain: { id: "krieg", name: "Don Krieg", maxHp: 80, retaliation: [8, 14], rewardPoints: 150 },
    outro: {
      sanji: ["Sanji lights a cigarette and looks back at the Baratie only once before joining your crew for good."],
      default: ["You eat well, but you sail out of Baratie's waters with the same crew as before."]
    }
  },

  {
    id: "arlong-park",
    region: "East Blue",
    name: "Arlong Park",
    art: "swordArt",
    photo: "assets/loc-arlongpark.webp",
    tagline: "A village pays its taxes in fear to a fishman who never planned to let it go.",
    intro: [
      "Your ship reaches Cocoyasi Village, Nami's home, ruled from behind by the fishman pirate Arlong. For years Nami has secretly worked for him, buying her village's freedom one stolen fortune at a time.",
      "The truth finally spills out in front of everyone: Nami has been carrying this weight alone since she was a child."
    ],
    decisions: [
      {
        prompt: "Nami's secret is out, and she begs everyone to stay out of it. How do you respond?",
        options: [
          {
            label: "Declare war on Arlong Park, whether she asks for help or not",
            outcome: "You walk straight through Arlong Park's gate and tear it apart piece by piece. Nami finally breaks down, and afterward she asks to join your crew for real.",
            effects: { bond: 20, resolve: 20, infamy: 15, food: 0 },
            flag: "nami"
          },
          {
            label: "Respect her wishes and hold your crew back",
            outcome: "You wait, tense and unhappy, while Nami faces Arlong on her own terms. She survives it, but the wait wears on you, and something between you stays distant.",
            effects: { resolve: -15, bond: -5, infamy: 0, food: 0 },
            damage: 10
          }
        ]
      }
    ],
    villain: { id: "arlong", name: "Arlong", maxHp: 85, retaliation: [9, 15], rewardPoints: 150 },
    fruit: {
      id: "bell",
      name: "Kane Kane no Mi",
      shortName: "the Bell-Bell Fruit",
      description: "Locked away in Arlong's vault of stolen treasure, this fruit lets whoever eats it ring out a shockwave shout that staggers anything standing in front of them.",
      bonusHp: 30
    },
    outro: {
      nami: ["Cocoyasi Village raises its flags again, free for the first time in years, and Nami finally has a crew and a map worth drawing."],
      default: ["Cocoyasi Village is free, but Nami keeps her distance as your ship pulls away from the coast."]
    }
  },

  {
    id: "loguetown",
    region: "East Blue",
    name: "Loguetown",
    art: "flagArt",
    photo: "assets/loc-loguetown.webp",
    tagline: "The town of beginnings and endings has one more test before the Grand Line.",
    intro: [
      "Loguetown: the town where the Pirate King Gold Roger was born, and the same platform where he was executed. It is the last town before the Grand Line, and every pirate passes through it eventually.",
      "A Marine officer named Smoker has already marked you as trouble, and Buggy the Clown is somewhere in town looking for revenge."
    ],
    decisions: [
      {
        prompt: "Smoker moves to capture you before you can reach the Grand Line. How do you make your escape?",
        options: [
          {
            label: "Stand your ground and fight him head on",
            outcome: "You plant your feet right on Gold Roger's execution platform and refuse to back down.",
            effects: { resolve: 20, infamy: 20, bond: 0, food: 0 },
            flag: "engage_smoker"
          },
          {
            label: "Slip away through the crowd gathered at the old execution site",
            outcome: "You duck through the crowd and back to your ship before Smoker can close the distance, leaving him fuming on the dock.",
            effects: { resolve: 5, infamy: 5, bond: 0, food: 0 }
          }
        ]
      }
    ],
    villain: { id: "smoker", name: "Smoker", maxHp: 90, retaliation: [10, 16], rewardPoints: 200, requiresFlag: "engage_smoker" },
    outro: ["The lighthouse of Loguetown fades into the fog behind your ship. Ahead of you, the Grand Line waits."]
  }
];

const ENDINGS = [
  {
    id: "pirate-king",
    minResolve: 75,
    minBond: 75,
    title: "THE ONE WHO WILL BE KING",
    text: "Your crew is strong, your bonds are unbreakable, and your name already turns heads across the East Blue. The Grand Line will have to try a lot harder than that to stop you."
  },
  {
    id: "found-family",
    minResolve: 0,
    minBond: 75,
    title: "CAPTAIN OF A FOUND FAMILY",
    text: "You didn't always throw the hardest punch, but you never once let your crew face the sea alone. Whatever waits on the Grand Line, you won't be facing it by yourself."
  },
  {
    id: "lone-monster",
    minResolve: 75,
    minBond: 0,
    title: "THE LONE MONSTER OF THE EAST BLUE",
    text: "Every fight, you threw yourself in first and asked questions later. Your resolve is a legend already, but your ship feels a little emptier than it could have been."
  },
  {
    id: "rising-rookie",
    minResolve: 0,
    minBond: 0,
    title: "A PIRATE ON THE RISE",
    text: "It wasn't always pretty, and you didn't win every fight, but you made it out of the East Blue in one piece. The Grand Line is close now, and there's still time to become the legend you set out to be."
  }
];

const CREW_NAMES = {
  zoro: "Roronoa Zoro",
  nami: "Nami",
  usopp: "Usopp",
  sanji: "Sanji"
};

const CREW_ORDER = ["luffy", "zoro", "nami", "usopp", "sanji"];
const CREW_INITIALS = { luffy: "L", zoro: "Z", nami: "N", usopp: "U", sanji: "S" };

const LUFFY_MOVES = [
  { id: "pistol", label: "Gomu Gomu Pistol", dmg: [8, 14] },
  { id: "gatling", label: "Gomu Gomu Gatling", qte: "mash", base: [4, 6], bonusMax: 14 },
  { id: "bazooka", label: "Gomu Gomu Bazooka", qte: "type", codeLength: 4, hitDmg: [18, 26], missDmg: [4, 6], selfRecoil: 5 },
  { id: "brace", label: "Brace and Reposition", defend: true, reduceFactor: 0.6, heal: 8 }
];

const ASSIST_MOVES = {
  zoro: { id: "zoro-oni", label: "Zoro: Oni Giri", dmg: [12, 18] },
  nami: { id: "nami-guide", label: "Nami: Read the Weather", defend: true, reduceFactor: 0.7, heal: 5 },
  usopp: { id: "usopp-star", label: "Usopp: Kayaku Boshi", qte: "type", codeLength: 3, hitDmg: [14, 20], missDmg: [4, 6] },
  sanji: { id: "sanji-diable", label: "Sanji: Diable Jambe", qte: "mash", base: [6, 9], bonusMax: 16 }
};
