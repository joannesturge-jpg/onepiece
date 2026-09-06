/* Story data for Luffy's Voyage. Each island has an intro, one or more
   decision points, and an outro. Choices adjust bond, resolve, and infamy,
   and some choices set a crew flag that later text reacts to. */

const ISLANDS = [
  {
    id: "foosha",
    region: "East Blue",
    name: "Foosha Village",
    art: "shipArt",
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
            effects: { resolve: 10, bond: -5, infamy: 0 }
          },
          {
            label: "Throw one last loud goodbye with the whole village watching",
            outcome: "The whole village turns out on the dock, cheering and crying at once. Word of your departure spreads fast, and not everyone who hears it wishes you well.",
            effects: { resolve: 0, bond: 10, infamy: 5 }
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
    intro: [
      "A rough storm throws your boat against the docks of Shells Town, a port under the thumb of a Marine base. Rumor says the base captain, Axe Hand Morgan, rules the town like a tyrant.",
      "Tied to a wooden cross in the town square is a pirate hunter named Roronoa Zoro, left to starve as entertainment for Morgan's men."
    ],
    decisions: [
      {
        prompt: "Zoro sits bound and starving, sentenced to die at Morgan's word. What do you do?",
        options: [
          {
            label: "Cut him loose and take on Morgan's Marines together",
            outcome: "You free Zoro on the spot. Together you tear through Morgan's base, and by the time the smoke clears, the swordsman agrees to sail with you.",
            effects: { bond: 15, resolve: 10, infamy: 10 },
            flag: "zoro"
          },
          {
            label: "Keep walking and let the Marines sort out their own mess",
            outcome: "You decide it isn't your fight and move on. Later you hear the cross was empty by nightfall, but you never learn what became of the swordsman.",
            effects: { bond: -5, resolve: -5, infamy: 0 }
          }
        ]
      }
    ],
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
            outcome: "You go in loud, fists first, and the fight turns into a citywide brawl. Buggy escapes in pieces, but the town is a little more wrecked for it.",
            effects: { resolve: 15, infamy: 15, bond: 0 }
          },
          {
            label: "Team up with Nami and pick them off one at a time",
            outcome: "You let Nami read the crew's movements, and together you dismantle them one small group at a time. She still doesn't trust you, but she stops rolling her eyes at you.",
            effects: { bond: 10, resolve: 5, infamy: 5 },
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
            effects: { bond: 15, resolve: 0, infamy: 0 }
          },
          {
            label: "Tell her that's her own problem to solve",
            outcome: "She shrugs it off like she expected nothing else, and the two of you part on cool terms.",
            effects: { bond: -10, resolve: 5, infamy: 0 }
          }
        ]
      }
    ],
    outro: ["Buggy's crew scatters, and Orange Town's people start rebuilding. You set your sights further down the coast."]
  },

  {
    id: "syrup-village",
    region: "East Blue",
    name: "Syrup Village",
    art: "flagArt",
    intro: [
      "A battered ship finally brings you to Syrup Village, where a long nosed boy named Usopp spends his days telling wild pirate stories that nobody believes.",
      "This time, one of his stories is true: a real pirate crew is closing in on the village, hunting a girl named Kaya who lives in the manor on the hill."
    ],
    decisions: [
      {
        prompt: "Usopp's tall tales have made him a laughingstock, but this warning sounds real. Do you take him seriously?",
        options: [
          {
            label: "Trust him and help him prepare the village to fight back",
            outcome: "You take his warning at face value, and when the real threat arrives, Usopp fights harder than anyone expects. He asks to join your crew, slingshot and all.",
            effects: { bond: 15, resolve: 10, infamy: 5 },
            flag: "usopp"
          },
          {
            label: "Write him off as just another liar and keep moving",
            outcome: "You sail on before the trouble arrives, missing the fight entirely and never learning if his story was true.",
            effects: { resolve: -5, bond: 0, infamy: 0 }
          }
        ]
      }
    ],
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
            outcome: "You throw yourself into the fight beside Sanji, and between his kicks and your fists, Krieg's ambitions collapse. Sanji, grumbling the whole way, agrees to be your ship's cook.",
            effects: { bond: 15, resolve: 15, infamy: 10 },
            flag: "sanji"
          },
          {
            label: "Let the cooks settle their own war",
            outcome: "You hang back and let the Baratie's crew handle Krieg themselves. They manage it, barely, but Sanji never gets the push he needed to leave the only home he's known.",
            effects: { resolve: -10, bond: 0, infamy: 0 }
          }
        ]
      }
    ],
    outro: {
      sanji: ["Sanji ties on his coat, lights a cigarette, and looks back at the Baratie only once before joining your crew for good."],
      default: ["You eat well, but you sail out of Baratie's waters with the same crew as before."]
    }
  },

  {
    id: "arlong-park",
    region: "East Blue",
    name: "Arlong Park",
    art: "swordArt",
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
            effects: { bond: 20, resolve: 20, infamy: 15 },
            flag: "nami"
          },
          {
            label: "Respect her wishes and hold your crew back",
            outcome: "You wait, tense and unhappy, while Nami faces Arlong on her own terms. She survives it, but something between you stays distant.",
            effects: { resolve: -15, bond: -5, infamy: 0 }
          }
        ]
      }
    ],
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
            outcome: "You trade blows with Smoker right on Gold Roger's execution platform, refusing to back down even when the odds look bad. Word of the fight reaches the Marines' higher ranks before you even leave the harbor.",
            effects: { resolve: 20, infamy: 20, bond: 0 }
          },
          {
            label: "Slip away through the crowd gathered at the old execution site",
            outcome: "You duck through the crowd and back to your ship before Smoker can close the distance, leaving him fuming on the dock.",
            effects: { resolve: 5, infamy: 5, bond: 0 }
          }
        ]
      }
    ],
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
