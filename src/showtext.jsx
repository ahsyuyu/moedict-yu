var Searchhistory=require("./searchhistory.jsx");
var Defbox=require("./defbox.jsx");
var Showtext=React.createClass({
  getInitialState: function() {
  	return {entryHistory:[],tofind:""};
  },
  pushHistory: function(searchResult,clickedIndex) {//searchResult [title,titleIndex,tofind]
    var that=this;
    searchResult.map(function(item){
      if(item[1]==clickedIndex) that.state.entryHistory.push(item);
    });
  },
  dosearch: function(tofind) {
    for(var i=1; i<tofind.length; i++){
      var t=tofind.substr(0,i);
      this.props.defSearch(t,i);
    }
  },
  render: function() {
    return (
    <div>
    	<Searchhistory defSearch={this.props.defSearch} dosearch={this.dosearch} gotoEntry={this.props.gotoEntry} entryHistory={this.state.entryHistory} result={this.props.result}/>
      <br/>
    	<Defbox dosearch={this.dosearch} pushHistory={this.pushHistory} defs={this.props.defs} result={this.props.result} /> 	
    </div>
    );
  }
});
module.exports=Showtext;