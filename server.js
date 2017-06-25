var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

var Promise = require("bluebird");

var dotenv = require('dotenv');
dotenv.load();

var PORT = process.env.PORT || 8080;

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

mongoose.Promise = Promise;

// Initialize Express
var app = express();

// Use morgan and body parser with our app
app.use(logger("dev"));
app.use(bodyParser.urlencoded({extended: false}));

// Make public a static dir
app.use(express.static("public"));

// Database configuration with mongoose
mongoose.connect("mongodb://localhost/project3");
var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
  console.log("Mongoose connection successful.");


  if(process.env.POPULATE_MONGODB){
    //imported data from file into mongodb.
    console.log("Repopulating MONGODB");
    var importScript = require("./database/import_script.js");
    importScript();
  }
});

//Socket IO
io.on('connection', function(socket){
  console.log('a user connected');
});


//Routes
var apiRoutes = require("./routes/apiRoutes.js");

app.use("/", apiRoutes);


//game engine teseting
var clientList = [{name: "bob", units:[]}, {name:"Grant", units:[]}];
// var Game =require("./game/gameEngine.js");
// var game = new Game(clientList);



// Listen on port 3000
http.listen(PORT, function() {
  console.log("App running on port: "+PORT);
});