//var mongoose = require("mongoose");

var pilots = require("./pilots.js");
var mechs = require("./mechs.js");
var weapons = require("./weapons.js");

var dbPilot = require("../models/pilot.js");
var dbMech = require("../models/mech.js");
var dbWeapon = require("../models/weapon.js");

var pilotFlags = require("../game/statesAndFlags").pilot;
var weaponFlags = require("../game/statesAndFlags").weapon;


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
      break;
    case "importWeapons":
      importWeapons();
      break;
  }
}

function importWeapons() {
  dbWeapon.remove({}, function(err) {
    if(err) {
      console.log(err);
      return;
    }

    var manyNewWeapons = [];

    // var upRate = ["VS", "S", "M", "F", "VF", ""];
    // var upCost = ["VL", "L", "M", "H", "VH", ""];
    // var prop = ["C", "P", "MAP"];
    // var type = ["M", "R", "S"];
    // var cat = [];
    // for(key in weaponFlags.category) 
    //     cat.push(weaponFlags.category[key]);
    
    // //have to do this in parts.
    // //part one wp space weapons
    // var workingSet = weapons.wp_space;
    // for(let i=0; i<workingSet.length; ++i){
    //   var tempWpn = workingSet[i]; 
    //   var newWeapon = {
    //     name: tempWpn.name,
    //     wpSpace: tempWpn.wpSpace,
    //     mechCodeName: "wp_space",
    //     damage: tempWpn.damage,
    //     range: tempWpn.range,
    //     hit: tempWpn.hit,
    //     terrain: tempWpn.terrain,
    //     ammo: tempWpn.ammo,
    //     en: tempWpn.en,
    //     crit: tempWpn.crit,
    //     skill: tempWpn.skill,
    //     properties: []
    //   };
    //   if(upRate.includes(tempWpn.upgradeRate))
    //     newWeapon.upgradeRate = tempWpn.upgradeRate;
    //   else {
    //     console.log(`Failed at ${tempWpn.name} and ${tempWpn.upgradeRate}`);
    //     throw new Error();
    //   }
    //   if(upCost.includes(tempWpn.upgradeCost))
    //     newWeapon.upgradeCost = tempWpn.upgradeCost;
    //   else {
    //     console.log(`Failed at ${tempWpn.name} and ${tempWpn.upgradeCost}`);
    //     throw new Error();
    //   }
    //   if(cat.includes(tempWpn.category))
    //     newWeapon.category = tempWpn.category;
    //   else {
    //     console.log(`Failed at ${tempWpn.name} and ${tempWpn.category}`);
    //     throw new Error();
    //   }
    //   if(type.includes(tempWpn.type))
    //     newWeapon.type = tempWpn.type;
    //   else {
    //     console.log(`Failed at ${tempWpn.name} and ${tempWpn.type}`);
    //     throw new Error();
    //   }

    //   for(let i=0; i<tempWpn.properties.length; ++i){
    //     if(prop.includes(tempWpn.properties[i]))
    //       newWeapon.properties.push(tempWpn.properties[i]);
    //     else {
    //       console.log(`Failed at ${tempWpn.name} and ${tempWpn.properties[i]}`);
    //       throw new Error();
    //     }
    //   }

    //   manyNewWeapons.push(newWeapon);
    // }

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

function addWeaponsHelper(dataSource, key, builtIn, outputArray){
  var upRate = ["VS", "S", "M", "F", "VF", ""];
  var upCost = ["VL", "L", "M", "H", "VH", ""];
  var prop = ["C", "P", "MAP"];
  var type = ["M", "R", "S"];
  var cat = [];
  for(key in weaponFlags.category) 
      cat.push(weaponFlags.category[key]);


  var workingSet = dataSource;
  for(let i=0; i<workingSet.length; ++i){
    var tempWpn = workingSet[i]; 
    var newWeapon = {
      name: tempWpn.name,
      wpSpace: tempWpn.wpSpace,
      mechCodeName: key,
      damage: tempWpn.damage,
      range: tempWpn.range,
      hit: tempWpn.hit,
      terrain: tempWpn.terrain,
      ammo: tempWpn.ammo,
      en: tempWpn.en,
      crit: tempWpn.crit,
      skill: tempWpn.skill,
      properties: [],
      builtIn: builtIn
    };
    if(tempWpn.range.length !==2){
      console.log(`Failed at ${tempWpn.name} and range ${tempWpn.range}`);
      throw new Error();
    }
    if(upRate.includes(tempWpn.upgradeRate))
      newWeapon.upgradeRate = tempWpn.upgradeRate;
    else {
      console.log(`Failed at ${tempWpn.name} and rate ${tempWpn.upgradeRate}`);
      throw new Error();
    }
    if(upCost.includes(tempWpn.upgradeCost))
      newWeapon.upgradeCost = tempWpn.upgradeCost;
    else {
      console.log(`Failed at ${tempWpn.name} and cost ${tempWpn.upgradeCost}`);
      throw new Error();
    }
    if(cat.includes(tempWpn.category))
      newWeapon.category = tempWpn.category;
    else {
      console.log(`Failed at ${tempWpn.name} and category ${tempWpn.category}`);
      throw new Error();
    }
    if(type.includes(tempWpn.type))
      newWeapon.type = tempWpn.type;
    else {
      console.log(`Failed at ${tempWpn.name} and type ${tempWpn.type}`);
      throw new Error();
    }

    for(let i=0; i<tempWpn.properties.length; ++i){
      if(prop.includes(tempWpn.properties[i]))
        newWeapon.properties.push(tempWpn.properties[i]);
      else {
        console.log(`Failed at ${tempWpn.name} and ${tempWpn.properties[i]}`);
        throw new Error();
      }
    }

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
        spiritCommands: [],
        relationships: pilot.relationships,
        pilotSkills: []
      };

      var spiritValues = [];
      for(key in pilotFlags.spiritCommand) {
        spiritValues.push(pilotFlags.spiritCommand[key]);
      }

      //console.log(spiritValues);

      for(let i=0; i<pilot.spiritCommands.length; ++i) {
        if(spiritValues.includes(pilot.spiritCommands[i][0]))
          tempPilot.spiritCommands.push(pilot.spiritCommands[i]);
        else {
          console.log(`Failed at pilot ${pilot.name} on spirit ${pilot.spiritCommands[i][0]}`);
          throw new Error();
        }
      }

      for(let i=0; i<pilot.pilotSkills.length; ++i){
        switch(pilot.pilotSkills[i][0]) {
          case "Chain Attack":
            tempPilot.pilotSkills.push([pilotFlags.skill.chainAttack, pilot.pilotSkills[i][1]]);
            break;
          case "Counter":
            tempPilot.pilotSkills.push([pilotFlags.skill.counter, pilot.pilotSkills[i][1]]);
            break;
          case "In-fight":
            tempPilot.pilotSkills.push([pilotFlags.skill.infight, pilot.pilotSkills[i][1]]);
            break;
          case "Gunfight":
            tempPilot.pilotSkills.push([pilotFlags.skill.gunfight, pilot.pilotSkills[i][1]]);
            break;
          case "Attacker":
            tempPilot.pilotSkills.push([pilotFlags.skill.attacker, pilot.pilotSkills[i][1]]);
            break;
          case "Revenge":
            tempPilot.pilotSkills.push([pilotFlags.skill.revenge, pilot.pilotSkills[i][1]]);
            break;
          case "Command":
            tempPilot.pilotSkills.push([pilotFlags.skill.command, pilot.pilotSkills[i][1]]);
            break;
          case "Guard":
            tempPilot.pilotSkills.push([pilotFlags.skill.guard, pilot.pilotSkills[i][1]]);
            break;
          case "Predict":
            tempPilot.pilotSkills.push([pilotFlags.skill.predict, pilot.pilotSkills[i][1]]);
            break;
          case "Off.Support":
            tempPilot.pilotSkills.push([pilotFlags.skill.offSupport, pilot.pilotSkills[i][1]]);
            break;
          case "Combo Attack":
            tempPilot.pilotSkills.push([pilotFlags.skill.combo, pilot.pilotSkills[i][1]]);
            break;
          case "Def.Support":
            tempPilot.pilotSkills.push([pilotFlags.skill.defSupport, pilot.pilotSkills[i][1]]);
            break;
          case "SP Up":
            tempPilot.pilotSkills.push([pilotFlags.skill.spUp, pilot.pilotSkills[i][1]]);
            break;
          case "SP Regenerate":
            tempPilot.pilotSkills.push([pilotFlags.skill.spRegen, pilot.pilotSkills[i][1]]);
            break;
          case "Focus":
            tempPilot.pilotSkills.push([pilotFlags.skill.focus, pilot.pilotSkills[i][1]]);
            break;
          case "Resolve":
            tempPilot.pilotSkills.push([pilotFlags.skill.resolve, pilot.pilotSkills[i][1]]);
            break;
          case "Morale":
            tempPilot.pilotSkills.push([pilotFlags.skill.morale, pilot.pilotSkills[i][1]]);
            break;
          case "Will+ (Evade)":
            tempPilot.pilotSkills.push([pilotFlags.skill.willEvd, pilot.pilotSkills[i][1]]);
            break;
          case "Will+ (Hit)":
            tempPilot.pilotSkills.push([pilotFlags.skill.willHit, pilot.pilotSkills[i][1]]);
            break;
          case "Will+ (Damaged)":
            tempPilot.pilotSkills.push([pilotFlags.skill.willDmg, pilot.pilotSkills[i][1]]);
            break;
          case "Prevail":
            tempPilot.pilotSkills.push([pilotFlags.skill.prevail, pilot.pilotSkills[i][1]]);
            break;
          case "Hit & Away":
            tempPilot.pilotSkills.push([pilotFlags.skill.hitAway, pilot.pilotSkills[i][1]]);
            break;
          case "Ammo Save":
            tempPilot.pilotSkills.push([pilotFlags.skill.ammoSave, pilot.pilotSkills[i][1]]);
            break;
          case "EN Save":
            tempPilot.pilotSkills.push([pilotFlags.skill.enSave, pilot.pilotSkills[i][1]]);
            break;
          case "Mechanic":
            tempPilot.pilotSkills.push([pilotFlags.skill.mechanic, pilot.pilotSkills[i][1]]);
            break;
          case "Resupply":
            tempPilot.pilotSkills.push([pilotFlags.skill.resupply, pilot.pilotSkills[i][1]]);
            break;
          case "Genius":
            tempPilot.pilotSkills.push([pilotFlags.skill.genius, pilot.pilotSkills[i][1]]);
            break;
          case "Fortune":
            tempPilot.pilotSkills.push([pilotFlags.skill.fortune, pilot.pilotSkills[i][1]]);
            break;
          case "Lucky":
            tempPilot.pilotSkills.push([pilotFlags.skill.lucky, pilot.pilotSkills[i][1]]);
            break;
          case "Telekinesis":
            tempPilot.pilotSkills.push([pilotFlags.skill.telekinesis, pilot.pilotSkills[i][1]]);
            break;
          case "Prophesy":
            tempPilot.pilotSkills.push([pilotFlags.skill.prophesy, pilot.pilotSkills[i][1]]);
            break;
          default:
            console.log(`Failed at pilot ${pilot.name}`);
            throw new Error();
        }
      }

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