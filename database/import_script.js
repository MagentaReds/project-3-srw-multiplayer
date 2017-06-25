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


function populateDatabase() {
  //starts chain inot promise hell!
  //this then calls importWeapons
  ///which then calls importMechs;
  importPilots();
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
        for(key in workingSet)
          addMechsHelper(workingSet[key], key, wpWeapons); 
      }
      console.log("Finished inserting Mechs");

    });
  });
}

function addMechsHelper(dataSource, mechCodeName, wpWeapons){
  dbWeapon.find({mechCodeName: mechCodeName}, function(err, docWeapons) {
    var tempMech = dataSource;
    var newMech = {
      name: tempMech.name,
      mechCodeName: mechCodeName,
      stats: tempMech.stats,
      upgrade: tempMech.upgrade,
      move: tempMech.move,
      wpSpace: tempMech.wpSpace,
      partSlots: tempMech.partSlots,
      fub: tempMech.fub,
      abilities: tempMech.abilities,
      type: tempMech.type.split("/"),
      weapons: [],
      iWeapons: [],
    };

    var found=false;
    for(var i=0; i<tempMech.weapons.length; ++i) {
      for(var j=0; j<wpWeapons.length; ++j){
        if(tempMech.weapons[i]===wpWeapons[j].name) {
          newMech.weapons.push(wpWeapons[j]._id);
          found=true;
        }
      }
      if(found)
        found=false;
      else {
        console.log(`${mechCodeName} cannot find ${tempMech.weapons[i]}`);
        throw Error();
      }
    }

    for(var i=0; i<docWeapons.length; ++i) {
      newMech.iWeapons.push(docWeapons[i]._id);
    }

    dbMech.create(newMech, function(err, docs){
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
      if(err)
        return console.log(err);
      console.log("Finished inserting weapons");
      importMechs();
    });

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

    dbPilot.insertMany(manyNewPilots, function(err, docs){
      if(err)
        return console.log(err);
      console.log("Finished inserting Pilots");
      importWeapons();
    });
    
  });
}

module.exports = populateDatabase;