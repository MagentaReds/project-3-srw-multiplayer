//A unit is a pilot/mecha combined class, with upgrades taken into account, 
//and equipped with weapons and items based on the slots availble to the mecha


var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var UnitSchema = new Schema({
  name: String,
  mech: {
    type: Schema.Types.ObjectId,
    ref: "Mech"
  },
  pilot: {
    type: Schema.Types.ObjectId,
    ref: "Pilot"
  },
  parts: [{
    type: Schema.Types.ObjectId,
    ref: "Part"
  }],
  weapons: [{
    type: Schema.Types.ObjectId,
    ref: "Weapon"
  }],
  mechUpgrade: [Number]
});


var Unit = mongoose.model("Unit", UnitSchema);

module.exports = Unit;