//var mongoose = require("mongoose");

var pilots = require("./pilots.js");
var mechs = require("./mechs.js");
var weapons = require("./weapons.js");

var dbPilot = require("../models/pilot.js");
var dbMech = require("../models/mech.js");
var dbWeapon = require("../models/weapon.js");

var pilotFlags = require("../game/statesAndFlags").pilot;
var weaponFlags = require("../game/statesAndFlags").weapon;
var mechFlags = require("../game/statesAndFlags").mech;


function doStuff(command) {
  console.log(`Weapons keys ${Object.keys(weapons)}`);
  console.log("============================");
  console.log(`Mechs keys ${Object.keys(mechs)}`);
  console.log("============================");
  console.log(`Pilots keys ${Object.keys(pilots)}`);

  switch(command) {
    case "importPilots":
      console.log("Dropping and reuploading Pilots into mongoDB");
      importPilots();
      break;
    case "importMechs":
      importMechs();
      break;
    case "importWeapons":
      importWeapons();
      break;
  }
}

function importMechs() {
  dbMech.remove({}, function(err) {
    if(err) {
      console.log(err);
      return;
    }

    dbWeapon.find({mechCodeName: "wp_space"}, function(err, wpWeapons) {
      var workingSet = null;

      for(containerKey in mechs){
        workingSet = mechs[containerKey];
        workingSetKeys = Object.keys(workingSet);
        for(key in workingSet)
          addMechsHelper(workingSet[key], key, wpWeapons); 
      }

    });
  });
}

function addMechsHelper(dataSource, mechCodeName, wpWeapons){
  dbWeapon.find({mechCodename: mechCodeName}, function(err, docWeapons) {
    var types = ["Air", "Grd","Wtr","Spc","UndGrd"];
    var sizes = ["S","M","L","LL"];
    var abilities = []
    for(key in mechFlags.abilities) 
        abilities.push(mechFlags.abilities[key]);

    for(let i=0; i<dataSource.length; ++i){
      var tempMech = dataSource[i];
      var newMech = {
        name: tempMech.name,
        mechCodeName: mechCodeName,
        stats: tempMech.stats,
        upgrade: tempMech.upgrade,
        move: tempMech.move,
        wpSpace: tempMech.wpSpace,
        partSlots: tempMech.partSlots,
        fub: tempMech.fub,
        abilities: [],
        iWeapons: [],
        weapons: [],
      };
    }

    dbMech.create(tempMech, function(err, docs){
      if(err)
        return console.log(err);
    });

  });
}

function importWeapons() {
  dbWeapon.remove({}, function(err) {
    if(err)
      return console.log(err);

    var manyNewWeapons = [];

    //part one redux
    var workingSet = weapons.wp_space;
    //console.log("wp_space");
    addWeaponsHelper(workingSet, "wp_space", false, manyNewWeapons);

    //part two, electic boogaloo
    for(containerKey in weapons){
      if(containerKey!=="wp_space") {
        workingSet = weapons[containerKey];
        workingSetKeys = Object.keys(workingSet);
        //console.log(workingSetKeys);
        for(key in workingSet)
          addWeaponsHelper(workingSet[key], key, true, manyNewWeapons);
      }
    }

    dbWeapon.insertMany(manyNewWeapons, function(err, docs){
      console.log("Finished inserting weapons");
      if(err)
        console.log(err);
    })
  });
}

function addWeaponsHelper(dataSource, mechCodeName, builtIn, outputArray){
  var workingSet = dataSource;
  for(let i=0; i<workingSet.length; ++i){
    var tempWpn = workingSet[i]; 
    var newWeapon = {
      name: tempWpn.name,
      wpSpace: tempWpn.wpSpace,
      mechCodeName: mechCodeName,
      damage: tempWpn.damage,
      range: tempWpn.range,
      hit: tempWpn.hit,
      terrain: tempWpn.terrain,
      ammo: tempWpn.ammo,
      en: tempWpn.en,
      crit: tempWpn.crit,
      skill: tempWpn.skill,
      properties: tempWpn.properties,
      builtIn: builtIn,
      type: tempWpn.type,
      category: tempWpn.category,
      upgradeCost: tempWpn.upgradeCost,
      upgradeRate: tempWpn.upgradeRate
    };

    outputArray.push(newWeapon);
  }
}


function importPilots() {
  //drop the entire collection first, then reupload from databasefile
  dbPilot.remove({}, function(err){

    if(err) {
      console.log(err);
      return;
    }

    var manyNewPilots = [];

    pilots.forEach(function(pilot) {

      console.log(pilot.name);

      var tempPilot = {
        name:pilot.name, 
        stats: pilot.stats,
        terrain: pilot.terrain,
        aceBonus: pilot.aceBonus,
        willGain: pilot.willGain,
        spiritCommands: pilot.spiritCommands,
        relationships: pilot.relationships,
        pilotSkills: pilot.pilotSkills
      };

      manyNewPilots.push(tempPilot);
    });

    console.log(manyNewPilots.length);

    dbPilot.insertMany(manyNewPilots, function(err, docs){
      if(err)
        console.log(err);
    });
    
  });
}

module.exports = doStuff;