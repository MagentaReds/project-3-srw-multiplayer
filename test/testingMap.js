var Map = require("../game/map.js");

var map = new Map(20,20);

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


console.log("===============Get Movement 5,5,1=================");
console.log(map.getPossibleMovement(5,5,1));
console.log("===============Get Movement 5,5,1=================");
console.log(map.getPossibleMovement(5,5,2));

function displayArray(r,c,array) {
  var display=new Array(r);
  for(var i=0; i<r; ++i){
      display[i]=new Array(c);
      for(var j=0; j<c; ++j){
         display[i][j]=String.fromCharCode(183);
    }  
  }

  var tempArray;
  for(let y=0; y<array.length; ++y){
    tempArray=array[y]
    display[tempArray[0]][tempArray[1]] = "X";
  } 

  for(var x=0; x<r; ++x)
    console.log(display[x].join(""));
} 

console.log("===============Get Movement 5,5,1=================");
displayArray(20,20,map.getPossibleMovement(5,5,1));
console.log("===============Get Movement 5,5,1=================");
displayArray(20,20,map.getPossibleMovement(5,5,2));
console.log("===============Get Movement 5,5,4=================");
displayArray(20,20,map.getPossibleMovement(5,5,4));


console.log("ADDING OBSTABLCES");
map.tiles[5][6]="X";
map.tiles[6][6]="X";
map.tiles[4][5]="X";


// console.log("===============Get Movement 5,5,1=================");
// console.log(displayArray(map.getPossibleMovement(5,5,1)));
// console.log("===============Get Movement 5,5,1=================");
// console.log(displayArray(map.getPossibleMovement(5,5,2)));
// console.log("===============Get Movement 5,5,3=================");
// console.log(displayArray(map.getPossibleMovement(5,5,3)));
console.log("===============Get Movement 5,5,4=================");
displayArray(20,20,map.getPossibleMovement(5,5,4));



console.log("===============Get Possible Targets 5,5,1,1=================");
displayArray(20,20,map.getPossibleTargets(5,5,1,1));

console.log("===============Get Possible Targets 5,5,0,2=================");
displayArray(20,20,map.getPossibleTargets(5,5,0,2));

console.log("===============Get Possible Targets 5,5,2,4=================");
displayArray(20,20,map.getPossibleTargets(5,5,2,4));

console.log("===============Get Possible Targets 5,5,3,4=================");
displayArray(20,20,map.getPossibleTargets(5,5,3,4));

console.log("===============Get Possible Targets 5,5,4,4=================");
displayArray(20,20,map.getPossibleTargets(5,5,4,4));

console.log("===============Get Possible Targets 5,5,4,4=================");
displayArray(20,20,map.getPossibleTargets(0,0,4,4));