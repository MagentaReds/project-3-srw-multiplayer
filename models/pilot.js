var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var pilotFlags = require("../game/statesAndFlags.js").pilot;

var PilotSchema = new Schema({
  name: String,
  stats: {
    mel: [Number], rng: [Number], hit: [Number],
    evd: [Number], def: [Number], man: [Number], sp: [Number]
  },
  terrain: {
    type: String,
    validate: /[A-DS]{4}/
  },
  spiritCommands: {
    type: [Schema.Types.Mixed],
    validate: {
      validator: function(v){
        var spiritValues = [];
        for(key in pilotFlags.spiritCommand) {
          spiritValues.push(pilotFlags.spiritCommand[key]);
        }

        let pass=true;
        for(let i=0; i<v.length; ++i)
          if(!spiritValues.includes(v[i][0]))
            pass=false;

        return pass;
      },
      message: "{Value} is not a valid spirit command list"
    }
  },
  aceBonus: String,
  willGain: {
    type:[Number],
    validate: {
      validator: function(v){
        return v.length===6;
      },
      message: "{Value} is not a valid will gain list"
    }
  },
  pilotSkills: {
    type: [Schema.Types.Mixed],
    validate: {
      validator: function(v){
        var skillValues = [];
        for(key in pilotFlags.skill) {
          skillValues.push(pilotFlags.skill[key]);
        }
        
        let pass=true;
        for(let i=0; i<v.length; ++i)
          if(!skillValues.includes(v[i][0]))
            pass=false;
            
        return pass;
      },
      message: "{Value} is not a valid pilot skill list"
    }
  },
  relationships: [{}]
});


var Pilot = mongoose.model("Pilot", PilotSchema);

module.exports = Pilot;