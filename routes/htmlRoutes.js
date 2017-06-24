var express = require("express");
var passport = require("passport");
var router = express.Router();
var ensureLoggedIn = require("connect-ensure-login").ensureLoggedIn();
var request = require("request");

router.get("/", function(req, res) {
	res.send("Home page");
});

router.get('/login',function(req, res) {
	res.send('To the login page!');
});

module.exports = router;