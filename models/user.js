// Require mongoose
var mongoose = require("mongoose");
// Create a schema class
var Schema = mongoose.Schema;

// Create the Note schema
var UserSchema = new Schema({
  // Just a string
  userName: {
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
var User = mongoose.model("User", UserSchema);

// Export the Note model
module.exports = User;