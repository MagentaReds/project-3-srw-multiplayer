var Unit = require("../game/unit.js");

var dbUser = require("../models/user.js");
var dbTeam = require("../models/team.js");
var dbPilot = require("../models/pilot.js");
var dbMech = require("../models/mech.js");
var dbWeapon = require("../models/weapon.js");

var Promise = require("bluebird");

var teamHelper = {
  makeUnitsFromTeam: function(userId) {
    console.log(userId);
    return new Promise(function(resolve, reject) {
      var client= {
        
      };
      var units=new Array(6);
      dbUser.findById(userId, function(err, res){
        if(err) return reject();
        //console.log(res);
        dbTeam.findOne({number: res.team}, function(err, res2){
          //console.log(res2);
          var promi = [];
          for(let i=0; i<6; ++i){
            promi.push(dbPilot.findOne({name: res2.units[i].pilotName}));    
          }
          Promise.all(promi).then(function(pilotVals) {
            var promi2=[];
            for(let i=0; i<6; ++i)
              promi2.push(dbMech.findOne({name:res2.units[i].mechName}).populate("weapons iWeapons").exec());
            Promise.all(promi2).then(function(mechVals){
              for(let i=0; i<6; ++i){
                units[i]=new Unit(res._id, pilotVals[i], mechVals[i]);
              }
              client.id=res._id;
              client.name=res.username;
              client.units=units;
              resolve(client);
            });
          });
          
        })
      })
    });
  }
};

module.exports = teamHelper;