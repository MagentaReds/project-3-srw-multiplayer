var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var weaponFlags = require("../game/statesAndFlags.js").weapon;

var WeaponSchema = new Schema({
  name: String,
  upgradeRate: {
    type: String,
    validate: {
      validator: function(v){
        var upRate = ["VS", "S", "M", "F", "VF", ""];
        return upRate.includes(v);
      },
      message: "{Value} is not a valid upgrade Rate"
    }
  },
  upgradeCost: {
    type: String,
    validate: {
      validator: function(v){
        var upCost = ["VL", "L", "M", "H", "VH", ""];
        return upCost.includes(v);
      },
      message: "{Value} is not a valid upgrade cost"
    }
  },
  wpSpace: Number,
  type: {
    type: String,
    validate: {
      validator: function(v){
        var type = ["M", "R", "S"];
        return type.includes(v);
      },
      message: "{Value} is not a valid type"
    }
  },
  properties: {
    type: [String],
    validate: {
      validator: function(v){
        var prop = ["C", "P", "MAP"];
        var pass=true;
        for(var i=0; i<v.length; ++i)
          if(!prop.includes(v[i]))
            pass=false;
        return pass;
      },
      message: "{Value} is not a valid property list"
    }
  },
  damage: Number,
  range: {
    type: [Number],
    validate: {
      validator: function(v) {
        return v.length===2 && v[0]<=v[1];
      },
      message: "{Value} is not a valid range."
    }
  },
  hit: Number,
  terrain: {
    type: String,
    validate: /[A-DS]{4}/,
  },
  ammo: Number,
  en: Number,
  crit: Number,
  will: Number,
  category: {
    type: String,
    validate: {
      validator: function(v) {
        var cat = [];
        for(key in weaponFlags.category) 
            cat.push(weaponFlags.category[key]);

        return cat.includes(v);
      },
      message: "{Value} is not a valid category."
    }
  },
  skill: String,
  builtIn: {
    type: Boolean,
    default: false
  },
  mechCodeName: {
    type: String
  }
});


var Weapon = mongoose.model("Weapon", WeaponSchema);

module.exports = Weapon;