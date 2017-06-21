var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var MechaSchema = new Schema({
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

var Mecha = mongoose.model("Mecha", MechaSchema);

module.exports = Mecha;