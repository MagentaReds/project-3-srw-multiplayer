var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var mechFlags = require("../game/statesAndFlags.js").mech;


var MechSchema = new Schema({
  name: {
    type: String,
    unqiue: true
  },
  mechCodeName: {
    type: String,
    unique: true
  },
  stats: {
    type: [Number],
    validate: {
      validator: function(v) {
        return v.length===4;
      },
      message: "{Value} is not a valid stats array"
    }
  },
  upgrade: {
    type: [Number],
    validate: {
      validator: function(v) {
        return v.length===4;
      },
      message: "{Value} is not a valid upgrade array"
    }
  },
  move: Number,
  type: {
    type: [String],
    validate: {
      validator: function(v) {
        var types = ["Air", "Grd","Wtr","Spc","UndGrd"];
        var pass=true;
        for(var i=0; i<v.length; ++i)
          if(!types.includes(v[i]))
            pass=false;
        return pass;
      },
      message: "{Value} is not a valid type array"
    }
  },
  terrain: {
    type: String,
    validate: /[A-DS]{4}/
  },
  size: {
    type: String,
    validate: {
      validator: function(v){
        var sizes = ["S","M","L","LL"];
        return sizes.includes(v);
      },
      message: "{Value} is not a valid size"
    }
  },
  wpSpace: Number,
  partSlots: Number,
  fub: String,
  abilities: {
    type: [String],
    validate: {
      validator: function(v) {
        var abilities = []
        for(key in mechFlags.abilities) 
            abilities.push(mechFlags.abilities[key]);

        var pass=true;
        for(var i=0; i<v.length; ++i)
          if(!abilities.includes(v[i]))
            pass=false;
        return pass;
      },
      message: "{Value} is not a valid ability array"
    }
  },
  iWeapons: [{
    type: Schema.Types.ObjectId,
    ref: "Weapon"
  }],
  weapons: [{
    type: Schema.Types.ObjectId,
    ref: "Weapon"
  }]
});

var Mech = mongoose.model("Mech", MechSchema);

module.exports = Mech;