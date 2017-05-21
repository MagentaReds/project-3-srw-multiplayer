var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var WeaponSchema = new Schema({
  name: {
    type: String
  },
  body: {
    type: String
  }
});


var Weapon = mongoose.model("Weapon", WeaponSchema);

module.exports = Weapon;