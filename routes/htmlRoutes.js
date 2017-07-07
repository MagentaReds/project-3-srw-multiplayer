var express = require("express");
var passport = require("passport");
var router = express.Router();
var ensureLoggedIn = require("connect-ensure-login").ensureLoggedIn();
var request = require("request");
var path = require("path");
var dbUser = require("../models/user.js");

var env = {
	AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
	AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
	AUTH0_CALLBACK_URL: 'http://localhost:8080/callback'
};

router.get("/", function(req, res) {
	res.render('index', {env: env });
});

router.get("/createaccount", function(req, res) {
	res.render('createaccount');
})

router.get('/profile',function(req, res) {
	if (req.isAuthenticated()) {
		res.render('profile');
	} else {
		res.redirect('/login');
	}
});

router.get("/user", function(req, res) {
	if (req.isAuthenticated()) {
		res.json({success: true, user: req.user});
	} else {
		res.json({success: false, message: "You are not logged in"});
	}
});

router.get('/callback',
	passport.authenticate('auth0', { failureRedirect: '/' }),
	function(req, res) {
		res.redirect('/profile');
	});

router.get("/game", function(req, res){
	if (req.isAuthenticated()) {
		res.render('game');
	} else {
		res.redirect('/login');
	}
});

module.exports = router;