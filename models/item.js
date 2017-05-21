var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ItemSchema = new Schema({
  name: {
    type: String
  },
  body: {
    type: String
  }
});


var Item = mongoose.model("Item", ItemSchema);

module.exports = Item;