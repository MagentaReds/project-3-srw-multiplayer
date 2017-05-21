var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var SpiritSchema = new Schema({
  name: {
    type: String
  },
  body: {
    type: String
  }
});


var Spirit = mongoose.model("Spirit", SpiritSchema);

module.exports = Spirit;