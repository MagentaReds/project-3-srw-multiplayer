var Unit = require("../game/unit.js");

var dbUser = require("../models/user.js");
var dbTeam = require("../models/team.js");
var dbPilot = require("../models/pilot.js");
var dbMech = require("../models/mech.js");

var Promise = require("bluebird");

//Just some helper functions

var helpers = {
  //Checks to see if an array of arrays (arr1) includes arr2
  isInArr: function(arr1, arr2) {
    //custom search funciton cause default javascript has no overloading of comparison operators
    var a = JSON.stringify(arr1);
    var b = JSON.stringify(arr2);
    return a.indexOf(b) != -1;
  },

  //returns index where arr2 first matches arr1[i], assumes arr1 is an array of length 2 arrays, and arr2 length is 2
  getIndexArr: function(arr1, arr2) {
    for(var i=0; i<arr1.length; ++i){
      if(arr1[i][0]===arr2[0] && arr1[i][1]===arr2[1]) {
        return i;
      }
    }

    return -1;
  },

  getPrevailHitEvdArm(level, percentHp) {
    if(!level)
      return 0;

    var table=new Array(10);
    table[1]=[5,0,0,0,0,0,0,0,0,0];
    table[2]=[10,5,0,0,0,0,0,0,0,0];
    table[3]=[15,10,5,0,0,0,0,0,0,0];
    table[4]=[20,15,10,5,0,0,0,0,0,0];
    table[5]=[25,20,15,10,5,0,0,0,0,0];
    table[6]=[30,25,20,15,10,5,0,0,0,0];
    table[7]=[35,30,25,20,15,10,5,0,0,0];
    table[8]=[40,35,30,25,20,15,10,5,0,0];
    table[9]=[45,40,35,30,25,20,15,10,5,0];

    var temp = Math.floor(percentHp*10);
    return table[level][temp];
  },

  getPrevailCrit(level, percentHp) {
    if(!level)
      return 0;

    var table=new Array(10);
    table[1]=[8,0,0,0,0,0,0,0,0,0];
    table[2]=[16,8,0,0,0,0,0,0,0,0];
    table[3]=[24,16,8,0,0,0,0,0,0,0];
    table[4]=[32,24,16,8,0,0,0,0,0,0];
    table[5]=[40,32,24,16,8,0,0,0,0,0];
    table[6]=[48,40,32,24,16,8,0,0,0,0];
    table[7]=[56,48,40,32,24,16,8,0,0,0];
    table[8]=[64,56,48,40,32,24,16,8,0,0];
    table[9]=[72,64,56,48,40,32,24,16,8,0];

    var temp = Math.floor(percentHp*10);
    return table[level][temp];
  },

  getTKHitEvd(level) {
    return (level-1)*3;
  },

  getTKField(level) {
    return level*200;
  },

  getFightDmg(level) {
    if(level>=1 && level <=3)
      return level*50;
    else if(level>=4 && level<=6)
      return (level-1)*50;
    else if(level>=6 && level<=9)
      return (level-2)*50;
  },

  makeUnitsFromTeam(userId) {
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
              promi2.push(dbMech.findOne({name:res2.units[i].mechName}));
            Promise.all(promi2).then(function(mechVals){
              for(let i=0; i<6; ++i){
                //console.log(pilotVals[i].name, mechVals[i].name);
                units[i]=new Unit(userId, pilotVals[i], mechVals[i]);
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
}

module.exports = helpers;

//Gunfight
// Lv 1 - Power +50
// Lv 2 - Power +100
// Lv 3 - Power +150
// Lv 4 - Power +150, Range +1
// Lv 5 - Power +200, Range +1
// Lv 6 - Power +250, Range +1
// Lv 7 - Power +250, Range +2
// Lv 8 - Power +300, Range +2
// Lv 9 - Power +350, Range +2

//In-fight
// Lv 1 - Power +50
// Lv 2 - Power +100
// Lv 3 - Power +150
// Lv 4 - Power +150, Movement +1
// Lv 5 - Power +200, Movement +1
// Lv 6 - Power +250, Movement +1
// Lv 7 - Power +250, Movement +2
// Lv 8 - Power +300, Movement +2
// Lv 9 - Power +350, Movement +2

//Telekinesis       (Hit and Dodge Bonus),(Nendou Field Bonus)
// Lv 1 -  0%, +200         
// Lv 2 -  3%, +400
// Lv 3 -  6%, +600 
// Lv 4 -  9%, +800
// Lv 5 - 12%, +1000 
// Lv 6 - 15%, +1200 
// Lv 7 - 18%, +1400 
// Lv 8 - 21%, +1600 
// Lv 9 - 24%, +1800

//Prevail                             Remaining HP  
//         10%   20%   30%   40%   50%   60%   70%   80%   90%   
//                       Hit, Dodge, Armour Bonus
// Lv 1 -   5%    -     -     -     -     -     -     -     -       
// Lv 2 -  10%    5%    -     -     -     -     -     -     -
// Lv 3 -  15%   10%    5%    -     -     -     -     -     - 
// Lv 4 -  20%   15%   10%    5%    -     -     -     -     -
// Lv 5 -  25%   20%   15%   10%    5%    -     -     -     -
// Lv 6 -  30%   25%   20%   15%   10%    5%    -     -     -
// Lv 7 -  35%   30%   25%   20%   15%   10%    5%    -     -
// Lv 8 -  40%   35%   30%   25%   20%   15%   10%    5%    - 
// Lv 9 -  45%   40%   35%   30%   25%   20%   15%   10%    5%

//Prevail                             Remaining HP  
//         10%   20%   30%   40%   50%   60%   70%   80%   90%   
//                         Critical rate Bonus
// Lv 1 -   8%    -     -     -     -     -     -     -     -       
// Lv 2 -  16%    8%    -     -     -     -     -     -     -
// Lv 3 -  24%   16%    8%    -     -     -     -     -     - 
// Lv 4 -  32%   24%   16%    8%    -     -     -     -     -
// Lv 5 -  40%   32%   24%   16%    8%    -     -     -     -
// Lv 6 -  48%   40%   32%   24%   16%    8%    -     -     -
// Lv 7 -  56%   48%   40%   32%   24%   16%    8%    -     -
// Lv 8 -  64%   56%   48%   40%   32%   24%   16%    8%    - 
// Lv 9 -  72%   64%   56%   48%   40%   32%   24%   16%    8%