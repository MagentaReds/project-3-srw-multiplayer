var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var TeamSchema = new Schema({
  name: {
    type: String
  },
  number: {
    type: Number
  },
  units: {
    type: [{
      pilotName: {
        type: String
      },
      mechName: {
        type: String
      }
    }]
  }
});


var Team = mongoose.model("Team", TeamSchema);

module.exports = Team;