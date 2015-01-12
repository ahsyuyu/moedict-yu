var kse=require("ksana-search");
var kde=require("ksana-database");
var entries=[];

var dosearch = function (tofind) {
	kde.open("moedict",function(err,db){
		entries=db.get("pageNames");
		var index=indexOfSorted(entries,tofind);
		var i=0;
		while(entries[index+i].indexOf(tofind)==0){
			console.log(entries[index+i]);
			i++
		}
		
	});	
}
var indexOfSorted = function (array, obj) { 
	var low = 0,
	high = array.length-1;
	while (low < high) {
	  var mid = (low + high) >> 1;
	  array[mid] < obj ? low = mid + 1 : high = mid;
	}
	if(array[low] != obj) return null;
	return low;
}

dosearch("明");