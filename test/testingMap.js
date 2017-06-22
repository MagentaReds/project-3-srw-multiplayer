var Map = require("../game/map.js");

var map = new Map(10,10);

console.log("============5,5,0==========");
console.log(map.isInBounds(5,5));
console.log(map.getRadius(5,5,0));
console.log("============5,5,1==========");
console.log(map.getRadius(5,5,1));
console.log("============5,5,2==========");
console.log(map.getRadius(5,5,2));
console.log("============5,5,3==========");
console.log(map.getRadius(5,5,3));
console.log("============0,0,3==========");
console.log(map.getRadius(0,0,3));
console.log("============0,0,2==========");
console.log(map.getRadius(0,0,2));
console.log("============0,0,1==========");
console.log(map.getRadius(0,0,1));