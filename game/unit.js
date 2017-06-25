"use strict";

var dbMech= require("../models/mech.js");
var dbPilot= require("../models/pilot.js");

class Unit {
  constructor(pilotDb, mechDb) {
    this.name = pilotDb.name;
  } 
}

module.exports = Unit;