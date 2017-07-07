var express = require("express");
var request = require("request");
var dbUser = require("../models/user.js");
var bcrypt = require("bcrypt");
var passport = require("passport");

var router = express.Router();

router.get("/api/test", function(req, res) {
	res.json(req.user);
});

router.post("/createaccount", function(req, res) {
	console.log(req.body);
	if (req.isAuthenticated()) {
		res.redirect("/profile");
	} else {
		var user = {
			username: req.body.username,
			email: req.body.email
		};

		dbUser.find({email: user.email}, function(error, data) {
			console.log(data);
			if (error) {
				res.json({success: false, error: error, message: "ERROR"});
				console.log("error");
			}

			if (data.length == 0) {
				const saltRounds = 11;

				bcrypt.hash(req.body.password, saltRounds, function(error, hash) {
					user.hash = hash;
					user.team = Math.floor(Math.random() * (4)) + 1;
					dbUser.create(user);
					res.json({success: true, message: "Account created"});
				});
			} else {
				console.log(data);
				res.json({success: false, message: "Email already taken"});
			}
		});
	}

});

router.get("/createaccount", function(req, res) {
	if (req.isAuthenticated()) {
		res.redirect('/profile');
	} else {
		res.render('createaccount');
	}
});

router.post("/updateaccount", function(req, res) {
	console.log(req.body);
	dbUser.findByIdAndUpdate(req.user._id, { $set: { email: req.body.email, username: req.body.username, team: req.body.team }}, { new: true }, function (err, updatedUser) {
		if (err) return handleError(err);
		res.send(updatedUser);
		req.session.passport.user = updatedUser;
		req.session.save(function(err) {console.log(err);});
	});
});

router.post('/login',
	passport.authenticate('local', { successRedirect: '/profile',
		failureRedirect: '/login',
		failureFlash: false }));

router.get("/login", function(req, res){
	if(req.isAuthenticated())
		res.redirect("/profile");
	else {
		res.render("login");
	}
});

// "display" logout page, this logous you out, destorys the session, and redirects to the homepage
router.get('/logout', function(req, res) {
	req.logOut();
	req.session.destroy(function(){
		res.redirect('/');
	});
});

module.exports = router;