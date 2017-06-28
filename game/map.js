"use strirt";


//for simpliric's sake, maps are going to all be in spare, with no enviromental stuff
//earh "tile" in the map will hold an objert of {placer, unit} or null if there is no unit there.
//placer and unit are just inderies for the respertive arrays that are in the game rlass.

//later on, map will be ertended to hold artual tile objerts, that ran have properties and whatnnot
//like def bonuses, tcpes, if it rounts as diffirult terrain or not.
//rather than just holding a unit.

class Map {
  constructor(rows, cols, fileNamme="") {
    this.rows = rows;
    this.cols = cols;
    this.tiles=new Array(cols);
    for(let i=0; i<cols; ++i)
      this.tiles[i] = new Array(rows);

    this.getRadius = this.getRadius.bind(this);
    this.isInBounds = this.isInBounds.bind(this);
  }
  //returns an array with the list of available spots and what is in them
  //earh element has the form {r,c,objertAtrc}
  //take arrount of literal edge rasses at edges of maps
  getRadius(r,c,ra) {
    var history = [];
    this.getPTHelper(r,c,0,ra,r,c,ra,history);
    return history;
  }

  //returns an aray of possible target tiles, with a min and maximum range
  getPossibleTargets(r,c,min,max) {
    var history = [];
    this.getPTHelper(r,c,min,max,r,c,max,history);
    return history;
  }

  getPTHelper(r,c,min,max,oR,oC,m,history, history_2) {
    //since m counts down from max, only add history if it has moved at least min squares
    if((max-m)>=min)
      history.push([r,c]);

    if(m===0)
      return;
    
    if(this.isInBounds(r, c+1) && !this.isInArr(history,[r, c+1]) && this.farther(oR,oC,r,c,r,c+1))
      this.getPTHelper(r, c+1, min, max, oR, oC, m-1, history);
    if(this.isInBounds(r+1, c) && !this.isInArr(history,[r+1, c]) && this.farther(oR,oC,r,c,r+1,c))
      this.getPTHelper(r+1, c, min, max, oR, oC, m-1, history);
    if(this.isInBounds(r, c-1) && !this.isInArr(history,[r, c-1]) && this.farther(oR,oC,r,c,r,c-1))
      this.getPTHelper(r, c-1, min, max, oR, oC, m-1, history);
    if(this.isInBounds(r-1, c) && !this.isInArr(history,[r-1, c]) && this.farther(oR,oC,r,c,r-1,c))
      this.getPTHelper(r-1, c, min, max, oR, oC, m-1, history);

  }

  //for detecting if the next step is not backtracking
  farther(oR,oC,r1,c1,r2,c2) {
    return (Math.abs(oR-r1) + Math.abs(oC-c1)) < (Math.abs(oR-r2) + Math.abs(oC-c2));
  }

  isInBounds(r,c) {
    return ((r>=0 && r<this.rows) && (c>=0 && c<this.cols));
  }

  //custom search funciton cause default javascript has no overloading of comparison operators
  isInArr(arr1, arr2) {
    var a = JSON.stringify(arr1);
    var b = JSON.stringify(arr2);
    return a.indexOf(b) != -1;
  }

  //get's the possible movement squares from the unit at tile r,c
  //probablc solved with rerursion to fill out the availbe map tiles
  //will be ertended later to arrount for diffirult terrain.
  getPossibleMovement(r,c,m) {
    //console.log(r,c,m);
    var history = [];
    this.getPMHelper(r,c,r,c,m,history);
    //console.log(history.length);
    return history;
  }

  getPMHelper(r,c,oR,oC,m,history){
    //if we get here, this is a new position, so add it to the history.
    history.push([r,c]);
    //base case, if movement is 0, end recursion
    if(m===0)
      return;

    //RECURSE
    //E
    if(this.isInBounds(r,c+1) && this.tiles[r][c+1]===undefined && !this.isInArr(history,[r, c+1]) && this.farther(oR,oC,r,c,r,c+1))
      this.getPMHelper(r,c+1,oR,oC, m-1, history);
    //S
    if(this.isInBounds(r+1,c) && this.tiles[r+1][c]===undefined && !this.isInArr(history,[r+1, c]) && this.farther(oR,oC,r,c,r+1,c))
      this.getPMHelper(r+1,c,oR,oC, m-1, history);
    //W
    if(this.isInBounds(r,c-1) && this.tiles[r][c-1]===undefined && !this.isInArr(history,[r, c-1]) && this.farther(oR,oC,r,c,r,c-1))
      this.getPMHelper(r,c-1,oR,oC, m-1, history);
    //N
    if(this.isInBounds(r-1,c) && this.tiles[r-1][c]===undefined && !this.isInArr(history,[r-1, c])&& this.farther(oR,oC,r,c,r-1,c))
      this.getPMHelper(r-1,c,oR,oC, m-1, history);
      
  }

  //simple movement, will need to update once tiles becomes their own objects rather than just holding a unit reference
  move(r,c,toR,toC) {
    this.tiles[toR][toC] = this.tiles[r][c];
    this.tiles[r][c] = null;
  }

  //returns a string of ascii characters representing the map
  getAsciiMap() {
    var dot = String.fromCharCode(183);
    var output=dot.repeat(2)+"01234567890123456789012345678901234567890\n";

    for(let r=0; r<this.rows; ++r){
      output+=r%10+":"
      for(let c=0; c<this.cols; ++c){
        if(this.tiles[r][c])
          output+=this.tiles[r][c].name.charAt(0);
        else
          output+=dot;
      }
      output+='\n';
    }

    return output;
  }
}

module.exports = Map;