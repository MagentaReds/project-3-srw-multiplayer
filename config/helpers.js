//Just some helper functions

var helpers = {
  //Checks to see if an array of arrays (arr1) includes arr2
  isInArr: function(arr1, arr2) {
    //custom search funciton cause default javascript has no overloading of comparison operators
    var a = JSON.stringify(arr1);
    var b = JSON.stringify(arr2);
    return a.indexOf(b) != -1;
  }
}

module.exports = helpers;