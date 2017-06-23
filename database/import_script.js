//var mongoose = require("mongoose");

var pilots = require("./pilots.js");
var mechs = require("./mechs.js");
var weapons = require("./weapons.js");

var dbPilot = require("../models/pilot.js");
var dbMech = require("../models/mech.js");
var dbWeapon = require("../models/weapon.js");

var pilotFlags = require("../game/statesAndFlags").pilot;


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

    
  });
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