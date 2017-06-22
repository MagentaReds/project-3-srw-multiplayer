//A unit is a pilot/mecha combined class, with upgrades taken into account, 
//and equipped with weapons and items based on the slots availble to the mech

//this needs to change.  I want this to be completely seperate from the other collections
//it will be it's own self contained thing with all the information it needs in itself.
//each entry will get created when the User/Client submits the team to be saved
//then based on the uprades/ weapons equipped/pilot upgrades/ will generate a full stated entry here
//(or in our early develtopment case, will be premade)

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