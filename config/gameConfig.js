var Promise = require("bluebird");

var Game = require("../game/gameEngine.js");
var Unit = require("../game/unit.js");

var dbWeapon = require("../models/weapon.js");
var dbMech = require("../models/mech.js");
var dbPilot = require("../models/pilot.js");

//Returns a promise with the built client list, use .then(clientList) to access it.
module.exports = function() {
  var clientList = [{id: 145, name: "Bob", units:[]}, {id: 213, name:"Johnson", units:[]}];

  var pilot1, pilot2, mech1, mech2;

  return dbPilot.findOne({name: "Kyosuke Nambu"})
  .then(function(pilot){
    pilot1=pilot;
     return dbMech.findOne({name: "Alteisen"}).populate("Weapon");
  }).then(function(mech){
    clientList[0].units.push(new Unit(pilot1, mech));
    return dbPilot.findOne({name: "Excellen Browning"});
  }).then(function(pilot){
    pilot2=pilot;
    return dbMech.findOne({name: "Weissritter"}).populate("Weapon")
  }).then(function(mech){
    clientList[1].units.push(new Unit(pilot2, mech));
    return new Promise(function (resolve, reject) {
      //var game = new Game(clientList);
      resolve(clientList);
    });
  });
  
}