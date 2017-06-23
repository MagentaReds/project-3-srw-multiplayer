var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var WeaponSchema = new Schema({
  name: String,
  upgradeRate: String,
  upgradeCost: String,
  wpSpace: Number,
  type: String,
  properties: [String],
  damage: Number,
  range: [Number],
  hit: Number,
  terrain: {
    type: String,
    validate: /[A-DS]{4}/,
  },
  ammo: Number,
  en: Number,
  crit: Number,
  will: Number,
  category: String,
  skill: String,
});


var Weapon = mongoose.model("Weapon", WeaponSchema);

module.exports = Weapon;