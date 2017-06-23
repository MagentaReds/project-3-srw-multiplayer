var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var MechSchema = new Schema({
  name: {
    type: String,
    unqiue: true
  },
  stats: {
    type: [Number],
    length: 4
  },
  upgrade: {
    type: [Number],
    length: 4
  },
  move: Number,
  type: {
    type: String,
  },
  type: [Schema.Types.Mixed],
  terrain: {
    type: String,
    validate: /[A-DS]{4}/
  },
  size: String,
  wpSpace: Number,
  partSlots: Number,
  fub: String,
  abilities: [String],
  weapons: [String],
  equipedWeapons: [String]
});

var Mech = mongoose.model("Mech", MechSchema);

module.exports = Mech;