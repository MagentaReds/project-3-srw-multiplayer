// Require mongoose
var mongoose = require("mongoose");
// Create a schema class
var Schema = mongoose.Schema;

// Create the Note schema
var MechaSchema = new Schema({
  // Just a string
  name: {
    type: String
  },
  // Just a string
  body: {
    type: String
  }
});

// Remember, Mongoose will automatically save the ObjectIds of the notes
// These ids are referred to in the Article model

// Create the Note model with the NoteSchema
var Mecha = mongoose.model("Mecha", MechaSchema);

// Export the Note model
module.exports = Mecha;