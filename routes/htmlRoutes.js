var express = require("express");
var passport = require("passport");
var router = express.Router();
var ensureLoggedIn = require("connect-ensure-login").ensureLoggedIn();
var request = require("request");
var path = require("path");
var dbUser = require("../models/user.js");


router.get("/", function(req, res) {
	var ejsObj = {authed: req.isAuthenticated(), name: null};
	if(req.isAuthenticated())
		ejsObj.name = req.user.username;
	res.render('index.ejs', ejsObj);
});

router.get("/createaccount", function(req, res) {
	res.render('createaccount');
})

router.get('/profile',function(req, res) {
	if (req.isAuthenticated()) {
		res.render('profile', {username: req.user.username, email: req.user.email, team: req.user.team});
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
		res.sendfile('./public/views/game.html');
	} else {
		res.redirect('/login');
	}
});

module.exports = router;