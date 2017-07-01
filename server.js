var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var path = require("path");
var cookieParser = require("cookie-parser");
var session = require("express-session");
var dotenv = require("dotenv");
var passport = require("passport");
var Auth0Strategy = require("passport-auth0");

// Load environmental variables from .env file
dotenv.load();

var Promise = require("bluebird");

var PORT = process.env.PORT || 8080;

mongoose.Promise = Promise;

// Initialize Express
var app = express();

//adding app to http, since socket uses http to handle connections
var http = require('http').Server(app);
var io = require('socket.io')(http);

// This will configure Passport to use Auth0
var strategy = new Auth0Strategy({
	domain:       process.env.AUTH0_DOMAIN,
	clientID:     process.env.AUTH0_CLIENT_ID,
	clientSecret: process.env.AUTH0_CLIENT_SECRET,
	callbackURL:  'http://localhost:8080/callback'
}, function(accessToken, refreshToken, extraParams, profile, done) {
    // profile has all the information from the user
    return done(null, profile);
});

// Here we are adding the Auth0 Strategy to our passport framework
passport.use(strategy);

// The searlize and deserialize user methods will allow us to get the user data once they are logged in.
passport.serializeUser(function(user, done) {
	done(null, user);
});

passport.deserializeUser(function(user, done) {
	done(null, user);
});


if(process.env.MONGODB_URI) {
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
}

//Socket IO
var GameInterface = require("./game/gameInterface.js");
var gameInt = new GameInterface(http, io);



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
app.use(express.static(path.join(__dirname, "public/frontend")));
app.use(passport.initialize());
app.use(passport.session());
app.set('views', path.join(__dirname, 'public/frontend'));
app.set('view engine', 'jade');


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
app.use("/", apiRoutes);
app.use("/", htmlRoutes);



// Listen on port 3000, using http instead of app due to socket.io
http.listen(PORT, function() {
  console.log("App running on port: "+PORT);
});