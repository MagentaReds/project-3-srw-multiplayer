var Promise = require("bluebird");

var Game = require("../game/gameEngine.js");
var Unit = require("../game/unit.js");

var dbWeapon = require("../models/weapon.js");
var dbMech = require("../models/mech.js");
var dbPilot = require("../models/pilot.js");

module.exports = function() {
  var clientList = [{id: 145, name: "Bob", units:[]}, {id: 213, name:"Johnson", units:[]}];

  var pilot1, pilot2, mech1, mech2;

  return dbPilot.findById("594f51f9fcea503080e0ae66")
  .then(function(pilot){
    pilot1=pilot;
     return dbMech.findById("594f51f9fcea503080e0afba");
  }).then(function(mech){
    clientList[0].units.push(new Unit(pilot1, mech));
    return dbPilot.findById("594f51f9fcea503080e0ae67");
  }).then(function(pilot){
    pilot2=pilot;
    return dbMech.findById("594f51f9fcea503080e0afe7")
  }).then(function(mech){
    clientList[1].units.push(new Unit(pilot2, mech));
    return new Promise(function (resolve, reject) {
      var game = new Game(clientList);
      resolve(game);
    });
  });
  
}