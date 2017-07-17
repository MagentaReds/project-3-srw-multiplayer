var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var path = require("path");
//var passportOneSessionPerUser=require('passport-one-session-per-user');
var session = require("express-session");
const MongoStore = require('connect-mongo')(session);
var dotenv = require("dotenv");
var passport = require("passport");
var dbUser = require("./models/user.js");
var GameInterface = require("./game/gameInterface.js");
var LocalStrategy = require("passport-local").Strategy;
var bcrypt = require("bcrypt");
var gameInt;

// Load environmental variables from .env file
//dotenv.load();

var Promise = require("bluebird");

var PORT = process.env.PORT || 8080;

mongoose.Promise = Promise;

// Initialize Express
var app = express();

// Use morgan and body parser with our app
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, "public/frontend")));
app.set('views', path.join(__dirname, 'public/frontend'));
app.set('view engine', 'ejs');


//using connect-mongo for our ession store
// Basic usage 
if(process.env.MONGODB_URI) {
  app.use(session({
    secret: 'hushhush',
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({ 
      url: process.env.MONGODB_URI,
      ttl: 14 * 24 * 60 * 60 // = 14 days. Default  
    })
  }));
} else {
  app.use(session({
    secret: 'hushhush',
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({ 
      url: 'mongodb://localhost/project3',
      ttl: 14 * 24 * 60 * 60 // = 14 days. Default  
     })
  }));
}

//passport setup
app.use(passport.initialize());
app.use(passport.session());

// passport.use(new passportOneSessionPerUser());
// app.use(passport.authenticate('passport-one-session-per-user'));

//adding app to http, since socket uses http to handle connections
var http = require('http').Server(app);
var io = require('socket.io')(http);

// Database configuration with mongoose
if(process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI);
} else {
  mongoose.connect("mongodb://localhost/project3");
}

var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
  console.log("Mongoose connection successful.");

  //if populate mongodb, wait for import script to finish then make the gameIntercae
  //otherwise just make the gameInterface.
  if(process.env.POPULATE_MONGODB && process.env.POPULATE_MONGODB==="true"){
    //imported data from file into mongodb.
    console.log("Repopulating MONGODB");
    var importScript = require("./database/import_script.js");
    importScript().then(()=>{
      var importTeams = require("./database/make_premade_teams.js");
      importTeams().then(()=>{
        var makeUsers = require("./database/premade_users.js");
        return makeUsers();
      }).then(()=>{
        gameInt= new GameInterface(http, io, false);
      });
    });
  } else
  gameInt= new GameInterface(http, io, false);
});

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, function(req, username, password, done) {
  //console.log("In autheitcate new local start thing"),
  //console.log(req.body, username, password);
  var loggedUser = {
    email: username.toLowerCase().trim(),
    password: password.trim()
  };

  dbUser.findOne({email: loggedUser.email}, function(error, data) {
    if (error) {
      console.log("Error, User not logged in");
      return done(null, false, {message: "No account found, check email"});
    }
    if (!data) {
      console.log("No data, User not logged in");
      return done(null, false, {message: "No account found, check email"});
    }

    bcrypt.compare(loggedUser.password, data.hash, function(err, res) {
      if(res===true){
        console.log("User logged in!");
        return done(null, data);
      } else {
        console.log("User not logged in");
        return done(null, false, {message: "Incorrect Password"});
      }
    });
  });
}));


// The searlize and deserialize user methods will allow us to get the user data once they are logged in.
passport.serializeUser(function(user, done) {
  //console.log("When do we seriallize");
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  //console.log("When do we deseriallize");
  done(null, user);
});


app.use(function(err, req, res, next) {
	res.status(err.status || 500);
  //res.send(err)
  res.render('error', {
  	message: err.message,
  	error: err
  });

});


//Routes
var apiRoutes = require("./routes/apiRoutes.js");
var htmlRoutes = require("./routes/htmlRoutes.js");
app.use(apiRoutes);
app.use(htmlRoutes);


// Listen on port 3000, using http instead of app due to socket.io
http.listen(PORT, function() {
  console.log("App running on port: "+PORT);
});