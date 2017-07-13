var Promise = require("bluebird");
var bcrypt = require("bcrypt");

var dbUser = require("../models/user.js");


function makeTestUsers() {
  return new Promise(function(resolve, reject) {
    console.log("Making test users");
    var users = [
      {
        username: "Test1",
        email: "test1@test1.com",
        hash: "", //test1
        team: 1
      },
      {
        username: "Test2",
        email: "test2@test2.com",
        hash: "", //test2
        team: 2
      }
    ];

    bcrypt.hash("test1", 10).then(function(hash){
      users[0].hash=hash;
      return bcrypt.hash("test2", 10);
    }).then(function(hash){
      users[1].hash=hash;
      return dbUser.findOneAndRemove({email: users[0].email}).exec();
    }).then(function(result){
      return dbUser.findOneAndRemove({email: users[1].email}).exec();
    }).then(function(result) {
      return dbUser.insertMany(users);
    }).then(function() {
      console.log("Finished created Test1 and Test2 users");
      resolve();
    });

    
  });
}

module.exports = makeTestUsers;
