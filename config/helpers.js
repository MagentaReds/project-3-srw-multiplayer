//Just some helper functions

var helpers = {
  //Checks to see if an array of arrays (arr1) includes arr2
  isInArr: function(arr1, arr2) {
    //custom search funciton cause default javascript has no overloading of comparison operators
    var a = JSON.stringify(arr1);
    var b = JSON.stringify(arr2);
    return a.indexOf(b) != -1;
  },

  //returns index where arr2 first matches arr1[i], assumes arr1 is an array of length 2 arrays, and arr2 length is 2
  getIndexArr: function(arr1, arr2) {
    for(var i=0; i<arr1.length; ++i){
      if(arr1[i][0]===arr2[0] && arr1[i][1]===arr2[1]) {
        return i;
      }
    }

    return -1;
  }
}

module.exports = helpers;