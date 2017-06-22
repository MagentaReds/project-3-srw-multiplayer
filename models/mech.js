var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var MechSchema = new Schema({
  name: String,
  stats: {
    type: [Number],
    length: 4
  },
  upgrade: {
    type: [Number],
    length: 4
  },
  move: Number,
  type: String,
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