var indexOfSorted = function (array, obj) { 
    var low = 0,
    high = array.length-1;
    while (low < high) {
      var mid = (low + high) >> 1;
      array[mid] < obj ? low = mid + 1 : high = mid;
    }
    //if(array[low] != obj) return null;
    return low;
 }

var search_start = function(array,tofind) {
    var out=[];
    var index=indexOfSorted(array,tofind);
    var i=0;
    while(array[index+i].indexOf(tofind)==0){
      out.push([array[index+i],parseInt(index)+i]);
      i++;
    }
    return out;
}
var search_end = function(array,tofind) {
    var out=[];
    var i=0;
    for(var i=0; i<array.length; i++){
      if(array[i].indexOf(tofind)==array[i].length-1){
        out.push([array[i],i]);
      }
    }
    return out;
}
var search_middle = function(array,tofind) {
    var out=[];
    var i=0;
    for(var i=0; i<array.length; i++){
      var ent=array[i];
      if(ent.indexOf(tofind) >-1 && ent.indexOf(tofind)!=0 && ent.indexOf(tofind)!=ent.length-1){
        out.push([array[i],i]);
      }
    }
    return out;
}

 var api={search_end:search_end,search_middle:search_middle,search_start:search_start,indexOfSorted:indexOfSorted};

module.exports=api;