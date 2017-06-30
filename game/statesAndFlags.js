"use strict";

//one big object to hold all my state strings? sure why not

var statesAndFlags ={
  game : {
    state: {
      newRound: "Start of new Round",
      isMoving: "Unit has started moving",
      hasMoved: "Unit has moved",
      isAttacking: "Selecting Weapons/Targets",
      confirmAttack: "Unit Attack is confirmed",
      defenderConfirm: "Defender has selected defend action",
      hasAttacked: "Unit has finished attacking",
      standby: "Unit has stoodby, Moving on",
      hasHitAndAway: "Unit can move after attcking",
      turnOver: "Unit's turn has ended"
    },
    action: {
      move: "Move",
      getMove: "Get Move",
      attack: "Attack",
      getAttack: "Get Attack",
      status: "Status",
      defend: "Defend",
      evade: "Evade",
      counter: "Counter",
      getCounter: "Get Counter"
    }
  },
  mech:{
    type: {
      air: "Air",
      ground: "Grd",
      water: "Wtr",
      space: "Spc",
      underground: "UndGnd"
    },
    size: {
      small: "S",
      medium: "M",
      large: "L",
      veryLarge: "LL"
    },
    abilities:{
      enRegenSmall: "EN Regen (S)",
      enRegenMedium: "EN Regen (M)",
      enRegenLarge: "EN Regen (L)",
      hpRegenSmall: "HP Regen (S)",
      hpRegenMedium: "HP Regen (M)",
      hpRegenLarge: "HP Regen (L)",
      eField: "E Field",
      beamCoat: "Beam Coat",
      abField: "AB Field",
      gWall: "G Wall",
      doubleImage: "Double Image",
      gTerritory: "G Territory",
      tkField: "TK Field",
      jammer: "Jammer",
      breakBlock: "Break Block",
      specialWeaponBlock: "SplWpn Block",
      moraleBlock: "Morale Block",
      spBlock: "SP Block",
      changeWingGust: "Change: Wing Gust",
      changeGustLander: "Change: Gust Lander",
      changeGrungust: "Change: Grungust",
      changeGHawk: "Change: G-Hawk",
      changeGrugust2: "Change: Grungust Type 2",
      changeKoryuoh: "Change: Koryuoh",
      changeRyukooh: "Change: Ryukooh",
      changeRWing: "Change: R-Wing",
      changeR1: "Change: R-1",
      changeCybird: "Change: Cybird",
      changeCybuster: "Change: Cybuster",

    }
  },
  weapon: {
    type:{
      melee: "M",
      ranged: "R",
      special: "S"
    },
    category: {
      missile: "Missile",
      bullet: "Bullet",
      energyBeam: "Energy Beam",
      map: "Map",
      supreme: "Supreme",
      physical: "Physical",
      phyicalBlade: "Physical Blade",
      energyBlade: "Energy Blade",
      remote: "Remote",
      break: "Break",
      net: "Net",
      chaff: "Chaff",
      enDrain: "EN Drain",
      enAbsorb: "EN Absorb",
      spDrain: "SP Drain",
      spAbsorb: "SP Absorb",
      antiSpirit: "Anti-Spirit",
      repair: "Repair",
      replenish: "Replenish",
    },
    upgradeRate: {
      verySlow: "VS",
      slow: "S",
      medium: "M",
      fast: "F",
      veryFast: "VF"
    },
    upgradeCost: {
      veryLow: "VL",
      low: "L",
      medium: "M",
      high: "H",
      veryHigh: "VH"
    },
    properties: {
      postMovement: "P",
      chainAttack: "C",
      map: "MAP"
    }
  },
  pilot: {
    skill: {
      chainAttack: "Chain Attack",
      counter: "Counter",
      infight: "In-fight",
      gunfight: "Gunfight",
      attacker: "Attacker",
      revenge: "Revenge",
      command: "Command",
      guard: "Guard",
      predict: "Predict",
      offSupport: "Off.Support",
      combo: "Combo Attack",
      defSupport: "Def.Support",
      spUp: "SP Up",
      spRegen: "SP Regenerate",
      focus: "Focus",
      resolve: "Resolve",
      morale: "Morale",
      willEvd: "Will+ (Evade)",
      willHit: "Will+ (Hit)",
      willDmg: "Will+ (Damaged)",
      prevail: "Prevail",
      hitAway: "Hit & Away",
      ammoSave: "Ammo Save",
      enSave: "EN Save",
      mechanic: "Mechanic",
      resupply: "Resupply",
      genius: "Genius",
      fortune: "Fortune",
      lucky: "Lucky",
      telekinesis: "Telekinesis",
      prophesy: "Prophesy"
    },
    spiritCommand: {
      valor: "Valor",
      gain: "Gain",
      strike: "Strike",
      zeal: "Zeal",
      trust: "Trust",
      rouse: "Rouse",
      cheer: "Cheer",
      attune: "Attune",
      vigor: "Vigor",
      faith: "Faith",
      hope: "Hope",
      mercy: "Mercy",
      luck: "Luck",
      guts: "Guts",
      renew: "Renew",
      assail: "Assail",
      snipe: "Snipe",
      bless: "Bless",
      guard: "Guard",
      spirit: "Spirit",
      enable: "Enable",
      fury: "Fury",
      alert: "Alert",
      focus: "Focus",
      accel: "Accel",
      drive: "Drive",
      scan: "Scan",
      resolve: "Resolve",
      prayer: "Prayer",
      love: "Love"
    }
  },
  unit: {
    status: {
      accel: "Ac",
      net: "Net",
      goAgain: "+1",
      strike: "St",
      focus: "Fo",
      guard: "Gu",
      guts: "Gt",
      mercy: "Mc",
      alert: "Al",
      assail: "As"
    }
  }
};

module.exports = statesAndFlags;