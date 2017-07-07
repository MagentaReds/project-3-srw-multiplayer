var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var path = require("path");
var cookieParser = require("cookie-parser");
var session = require("express-session");
var dotenv = require("dotenv");
var passport = require("passport");
var dbUser = require("./models/user.js");
var GameInterface = require("./game/gameInterface.js");
var LocalStrategy = require("passport-local").Strategy;
var bcrypt = require("bcrypt");
var gameInt;

// Load environmental variables from .env file
dotenv.load();

var Promise = require("bluebird");

var PORT = process.env.PORT || 8080;

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
  resave: false,
  saveUnitiailized: false,
  cookie: {}
}));
// Make public a static dir
app.use(express.static(path.join(__dirname, "public/frontend")));
app.use(passport.initialize());
app.use(passport.session());
app.set('views', path.join(__dirname, 'public/frontend'));
// app.set('view engine', 'jade');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

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
  if(process.env.POPULATE_MONGODB){
    //imported data from file into mongodb.
    console.log("Repopulating MONGODB");
    var importScript = require("./database/import_script.js");
    importScript().then(()=>{
      gameInt= new GameInterface(http, io);
    });
  } else
  gameInt= new GameInterface(http, io);
});

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, function(req, username, password, done) {
  var loggedUser = {
    email: username,
    password: password
  };

  dbUser.findOne({email: loggedUser.email}, function(error, data) {
    if (error) {
      return done(null, false, {message: "No account found, check email"});
    }
    if (!data) {
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
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

//Socket IO
var GameInterface = require("./game/gameInterface.js");
var gameInt = new GameInterface(http, io);


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
app.use("/", htmlRoutes);


// Listen on port 3000, using http instead of app due to socket.io
http.listen(PORT, function() {
  console.log("App running on port: "+PORT);
});