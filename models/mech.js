var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var MechSchema = new Schema({
  name: {
    type: String,
    unqiue: true
  },
  mechCodeName: {
    type: String,
    unique: true
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
  iWeapons: [{
    type: Schema.Types.ObjectId,
    ref: "Weapon"
  }],
  weapons: [String]
});

var Mech = mongoose.model("Mech", MechSchema);

module.exports = Mech;