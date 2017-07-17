var dbPilot = require("../models/pilot.js");
var dbMech = require("../models/mech.js");
var dbWeapon = require("../models/weapon.js");

var dbTeam = require("../models/team.js");

var Promise = require("bluebird");

function makeTeamsAndUnits() {
  return new Promise(function(resolve, reject) {
    var SRX = {
      name: "SRX",
      number: 1,
      units: [
        {
          pilotName: "Lefina Enfield",
          mechName: "Hiryu Custom",
        },
        {
          pilotName: "Ryusei Date",
          mechName: "R-1",
        },
        {
          pilotName: "Raidese F. Branstein",
          mechName: "R-2 Powered",
        },
        {
          pilotName: "Aya Kobayashi",
          mechName: "R-3 Powered",
        },
        {
          pilotName: "Mai Kobayashi",
          mechName: "R-Gun Powered",
        },
        {
          pilotName: "Katina Tarask",
          mechName: "R-Blade",
        },
      ]
    };

  // SRX-
  // Hiryu Custom, Lefina
  // R-1, Ryuusei
  // R-2 Powered, Rai
  // R-3 Powered, Aya
  // R-Gun Powered, Mai
  // R-Blade, Katina

    var ATX = {
      name: "ATX",
      number: 2,
      units: [
        {
          pilotName: "Tetsuya Onodera",
          mechName: "Hagane"
        },
        {
          pilotName: "Kyosuke Nambu",
          mechName: "Alteisen"
        },
        {
          pilotName: "Excellen Browning",
          mechName: "Weissritter"
        },
        {
          pilotName: "Irmgult Kazahara",
          mechName: "Grungust"
        },
        {
          pilotName: "Lamia Loveless",
          mechName: "Angelg"
        },
        {
          pilotName: "Brooklyn 'Bullet' Luckfield",
          mechName: "Koryuoh"
        }
      ]
    };


    // ATX- (complete)
    // Hagane tronium, Tetsuya
    // Alteisen Riese, Kyosuke
    // Wiessritter, Excellen
    // Grungust, Irm
    // Angelg, Lamia
    // Koryuoh, Bullet

    var TheSchool = {
      name: "The School",
      number: 3,
      units: [
        {
          pilotName: "Sean Webley",
          mechName: "Hagane (Shiro Type)"
        },
        {
          pilotName: "Latooni Subota",
          mechName: "Fairlion-S"
        },
        {
          pilotName: "Shine Hausen",
          mechName: "Fairlion-G"
        },
        {
          pilotName: "Seolla Schweizer",
          mechName: "Wildfalken"
        },
        {
          pilotName: "Arado Balanga",
          mechName: "Wildwurger"
        },
        {
          pilotName: "Ouka Nagisa",
          mechName: "Valsione"
        }
      ]
    };

    // The School- (complete)
    // Hagane Shiro, Sean
    // Fairlion-G, Shine
    // Fairlion-S, Latooni
    // Wildfalken, Seolla
    // Wildwurger, Arado,
    // Rapiecage, Ouka,

    var TheAggressors = {
      name: "The Aggressors",
      number: 4,
      units: [
        {
          pilotName: "Daitetsu Minase",
          mechName: "Kurogane"
        },
        {
          pilotName: "Kai Kitamura",
          mechName: "Gespenst MkII-S"
        },
        {
          pilotName: "Sanger Zonvolt",
          mechName: "Dygenguard"
        },
        {
          pilotName: "Ratsel Feinschmecker",
          mechName: "Ausenseiter"
        },
        {
          pilotName: "Gilliam Yager",
          mechName: "Gespenst"
        },
        {
          pilotName: "Ring Mao",
          mechName: "Huckebein"
        }
      ]
    };

    // Aggressors-
    // Kurogane, Daitetsu
    // Gespenst MKII-S, Kai
    // Dygenguard, Sanger
    // Ausenseiter, Ratsel
    // Gespenst, Gilliam
    // Huckebein, Ring

    var Aliens = {
      name: "Aliens",
      number: 5,
      units: [
        {
          pilotName: "Lee Linjun",
          mechName: "Shirogane"
        },
        {
          pilotName: "Viletta Vadmin",
          mechName: "Ashsaber"
        },
        {
          pilotName: "Excellen Browning",
          mechName: "Rein Weissritter"
        },
        {
          pilotName: "Gilliam Yager",
          mechName: "Gespenst"
        },
        {
          pilotName: "Lamia Loveless",
          mechName: "Vaisaga"
        },
        {
          pilotName: "Alfimi",
          mechName: "Lichkeit"
        }
      ]
    };

    // Aliens- (complete)
    // Shirogane, Lee
    // Ashsaber, Viletta
    // Rein Weissritter, Excellen
    // Gespenst, Gilliam
    // Vaisaga, Lamia
    // Lichkeit, Alfimi

    var Tank = {
      name: "Team Tank",
      number: 6,
      units: [
        {
          pilotName: "Daitetsu Minase",
          mechName: "Kurogane"
        },
        {
          pilotName: "Irmgult Kazahara",
          mechName: "Grungust"
        },
        {
          pilotName: "Sanger Zonvolt",
          mechName: "Grungust Type 3"
        },
        {
          pilotName: "Tasuku Shinguji",
          mechName: "Giganscudo Duro"
        },
        {
          pilotName: "Ricarla Borgnine",
          mechName: "Randgrith"
        },
        {
          pilotName: "Russel Bergman",
          mechName: "Grungust Type 2"
        }
      ]
    };

    // Team Tank- (complete)
    // Kurogane, Daitetsu, Tetsuya
    // Grungst, Irm
    // Grungust Type 3, Sanger
    // Giganscudo Duro, Tasuku
    // Randgrith, Carla
    // Grungust Type 2, Russel
      
    var teams =[SRX, ATX, TheSchool, TheAggressors, Aliens, Tank];
    dbTeam.remove({}, function(err, results){
      if(err) return console.log(err);
      dbTeam.insertMany(teams, function(err, results){
        if(err) return console.log(err);
        console.log("Finished inserting Teams");
        resolve(true);
      });
    });
  
  });
}

module.exports = makeTeamsAndUnits;