var mongoose = require("mongoose");

var pilots = require("./pilots.js");
var mechs = require("./mechs.js");
var weapons = require("./weapons.js");

var Pilot = require("../models/pilot.js");
var Mecha = require("../models/mecha.js");
var Weapon = require("../models/weapon.js");


function doStuff() {
  console.log(`Weapons keys ${Object.keys(weapons)}`);
  console.log("============================");
  console.log(`Mechs keys ${Object.keys(mechs)}`);
  console.log("============================");
  console.log(`Pilots keys ${Object.keys(pilots)}`);
}

module.exports = doStuff;