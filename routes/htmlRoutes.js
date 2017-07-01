var express = require("express");
var passport = require("passport");
var router = express.Router();
var ensureLoggedIn = require("connect-ensure-login").ensureLoggedIn();
var request = require("request");

var env = {
	AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
	AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
	AUTH0_CALLBACK_URL: 'http://localhost:8080/callback'
};

router.get("/", function(req, res) {
	res.render('frontend/index', {env: env });
});

router.get('/login',function(req, res) {
	res.render('login', { env: env });
});

router.get('/callback',
	passport.authenticate('auth0', { failureRedirect: '/' }),
	function(req, res) {
		res.redirect(req.session.returnTo || '/');
	});
module.exports = router;