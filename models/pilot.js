var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var PilotSchema = new Schema({
  name: {
    type: String
  },
  body: {
    type: String
  }
});


var Pilot = mongoose.model("Pilot", PilotSchema);

module.exports = Pilot;