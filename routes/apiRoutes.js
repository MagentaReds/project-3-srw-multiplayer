var express = require("express");
var request = require("request");
var dbUser = require("../models/user.js");
var bcrypt = require("bcrypt");
var passport = require("passport");

var router = express.Router();

router.get("/api/test", function(req, res) {
	res.json(req.user);
});

router.post("/createaccount", function(req, res, next) {
	console.log(req.body);
	if (req.isAuthenticated()) {
		res.redirect("/profile");
	} else {
		var user = {
			username: req.body.username,
			email: req.body.email.toLowerCase().trim()
		};

		dbUser.find({email: user.email}, function(error, data) {
			//console.log(data);
			if (error) {
				res.json({success: false, error: error, msg: "ERROR IN SERVER DB, TRY AGAIN"});
				console.log("error");
			}

			if (data.length == 0) {
				const saltRounds = 11;

				bcrypt.hash(req.body.password.trim(), saltRounds, function(error, hash) {
					user.hash = hash;
					user.team = Math.floor(Math.random() * (6)) + 1;
					dbUser.create(user, function(err, user){
						req.login(user, function(err) {
							if (err) { return next(err); }
							return;
						});
						//console.log(req.body);
						// passport.authenticate('local', function(err, user, info) {
						// 		if (err) { return next(err); }
						// 		if (!user) { return res.redirect('/login'); }
						// 		req.logIn(user, function(err) {
						// 			if (err) { return next(err); }
						// 			return;
						// 		});
						// 	})(req, res, next);
						res.json({success: true, msg: "Account created"});
					});
				});
			} else {
				console.log(data);
				res.json({success: false, msg: "Email is already taken"});
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

// router.post("/updateaccount", function(req, res) {
// 	//console.log(req.body);
// 	if(req.isAuthenticated()) {
// 		bcrypt.hash(req.body.password.trim(), saltRounds, function(error, hash) {
// 			var updates = { email: req.body.email, username: req.body.username, team: req.body.team };
// 			if(req.body.password.trim())
// 				updates.hash=hash;
			
// 			dbUser.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true }, function (err, updatedUser) {
// 				if (err) return handleError(err);
// 				res.send(updatedUser);
// 				req.session.passport.user = updatedUser;
// 				req.session.save(function(err) {console.log(err);});
// 			});
// 		});
// 	}
// });

router.post("/updateaccount", function(req, res) {
	//console.log(req.body);
	if(req.isAuthenticated()) {
		dbUser.findById(req.user._id, function(err, user){
			bcrypt.compare(req.body.oldPassword, req.user.hash, function(err, result){
				if(err)
					return res.json({success:false, msg:"Server encountered an error, try again"});
				if(!result)
					return res.json({success:false, msg:"Current Password is wrong. Please enter it again."});

				const saltRounds = 11;
				bcrypt.hash(req.body.password.trim(), saltRounds, function(error, hash) {
					if(req.body.password.trim())
						user.hash=hash;
					user.email=req.body.email;
					user.username=req.body.username;
					user.team=req.body.team;
					user.save(function(err, updatedUser){
						if(err) {
							//console.log(err);
							if(err.code===11000) {
								return res.json({success:false, msg:"That email is already taken, please pick a new one"});
							}
							return res.json({success:false, msg:"Server encountered an error, try again"});
						}

						req.session.passport.user = updatedUser;
				 		req.session.save(function(err) {console.log(err);});
						return res.json({success:true, msg:"Account updated successfully"});
					});
				});
			})
		});

		// bcrypt.hash(req.body.password.trim(), saltRounds, function(error, hash) {
		// 	var updates = { email: req.body.email, username: req.body.username, team: req.body.team };
		// 	if(req.body.password.trim())
		// 		updates.hash=hash;
			
		// 	dbUser.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true }, function (err, updatedUser) {
		// 		if (err) return handleError(err);
		// 		res.send(updatedUser);
		// 		req.session.passport.user = updatedUser;
		// 		req.session.save(function(err) {console.log(err);});
		// 	});
		// });
	}
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