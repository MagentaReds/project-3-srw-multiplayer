var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var PilotSchema = new Schema({
  name: String,
  stats: {
    mel: [Number], rng: [Number], hit: [Number],
    evd: [Number], def: [Number], sp: [Number]
  },
  terrain: String,
  spiritCommands: [[Schema.Types.Mixed]],
  aceBonus: String,
  willGain: [Number],
  pilotSkills: [[Schema.Types.Mixed]],
  relationships: [{}]
});


var Pilot = mongoose.model("Pilot", PilotSchema);

module.exports = Pilot;