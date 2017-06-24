var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var path = require("path");
var cookieParser = require("cookie-parser");
var session = require("express-session");
var dotenv = require("dotenv");

// Load environmental variables from .env file
dotenv.load();

var Promise = require("bluebird");

var PORT = process.env.PORT || 8080;

var app = express();

mongoose.Promise = Promise;

// Initialize Express
var app = express();

// Use morgan and body parser with our app
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(session({
	// Create unique session identifier
	secret: 'hushhush',
	resave: true,
	saveUnitiailized: true
}));
// Make public a static dir
app.use(express.static(path.join(__dirname, "public")));

app.set('view engine', 'jade');

// // Database configuration with mongoose
// mongoose.connect("mongodb://localhost/project3");
// var db = mongoose.connection;

// // Show any mongoose errors
// db.on("error", function(error) {
//   console.log("Mongoose Error: ", error);
// });

// // Once logged in to the db through mongoose, log a success message
// db.once("open", function() {
//   console.log("Mongoose connection successful.");
// });


//Routes
var apiRoutes = require("./routes/apiRoutes.js");
var htmlRoutes = require("./routes/htmlRoutes.js");
app.use("/", apiRoutes);
app.use("/", htmlRoutes);


//Testing stuff
// var testing= require("./database/import_script.js");
// testing();


// Listen on port 3000
app.listen(PORT, function() {
  console.log("App running on port: "+PORT);
});