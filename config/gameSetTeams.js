var Promise = require("bluebird");

var Unit = require("../game/unit.js");

var dbWeapon = require("../models/weapon.js");
var dbMech = require("../models/mech.js");
var dbPilot = require("../models/pilot.js");

//Returns a promise with the built client list, use .then(unitList) to access it.
//will return you with times,*2 Units/Clients
module.exports = function(times) {
  var clientList = [];

  var startVals = [{id: 100, name: "Bob_", units:[]}, {id: 200, name: "Johnson_", units:[]}];
  var pilot1, pilot2;
  var mech1, mech2;

  return dbPilot.findOne({name: "Kyosuke Nambu"})
  .then(function(pilot){
    pilot1=pilot;
     return dbMech.findOne({name: "Alteisen"}).populate("Weapon");
  }).then(function(mech){
    mech1=mech;
    return dbPilot.findOne({name: "Excellen Browning"});
  }).then(function(pilot){
    pilot2=pilot;
    return dbMech.findOne({name: "Weissritter"}).populate("Weapon")
  }).then(function(mech){
    mech2=mech;
    return new Promise(function (resolve, reject) {
      
      for(var i=0; i<times; ++i) {
        var c1 = {};
        c1.id=startVals[0].id+i;
        c1.name=startVals[0].name+i;
        c1.units=[new Unit(pilot1, mech1)];

        var c2 = {};
        c2.id=startVals[1].id+i;
        c2.name=startVals[1].name+i;
        c2.units=[new Unit(pilot2, mech2)];

        clientList.push(c1);
        clientList.push(c2);
      }


      resolve(clientList);
    });
  });
  
}