// Require mongoose
var mongoose = require("mongoose");
// Create a schema class
var Schema = mongoose.Schema;

// Create the Note schema
var UserSchema = new Schema({
  // Just a string
  email: {
  	unique: true,
  	required: true,
  	type: String
  },
  hash: {
  	required: true,
  	type: String
  },
  username: {
  	required: true,
  	type: String
  },
  team: {
  	required: true,
  	type: Number,
    validate: {
      validator: function(v) {
        return v>0 && v<7;
      },
      message: "{Value} is not a valid team number"
    }
  }
});

// Remember, Mongoose will automatically save the ObjectIds of the notes
// These ids are referred to in the Article model

// Create the Note model with the NoteSchema
var User = mongoose.model("User", UserSchema);

// Export the Note model
module.exports = User;