var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var TeamSchema = new Schema({
  name: {
    type: String
  },
  body: {
    type: String
  }
});


var Item = mongoose.model("Team", TeamSchema);

module.exports = Team;