var Searchhistory=require("./searchhistory.jsx");
var Defbox=require("./defbox.jsx");
var Showtext=React.createClass({
  getInitialState: function() {
  	return {entryHistory:[],tofind:"",vpos:[]};
  },
  popHistory: function(index) {
    var h=this.state.entryHistory;
    for(var i=0; i<h.length-index+1; i++){
      this.state.entryHistory.pop();
      console.log(h);
    }
  },
  pushHistory: function(searchResult,clickedIndex) {//searchResult [title,titleIndex,tofind]
    var that=this;
    searchResult.map(function(item){
      if(item[1]==clickedIndex) that.state.entryHistory.push(item);
    });
  },
  dosearch: function(tofind) {
      this.props.defSearch(tofind);
  },
  render: function() {
    return (
    <div>
    	<Searchhistory popHistory={this.popHistory} defSearch={this.props.defSearch} dosearch={this.dosearch} gotoEntry={this.props.gotoEntry} entryHistory={this.state.entryHistory} result={this.props.result}/>
      <br/>
    	<Defbox vpos={this.state.vpos} highlight={this.props.highlight} tofind={this.props.tofind} searchfield={this.props.searchfield} dosearch={this.dosearch} pushHistory={this.pushHistory} defs={this.props.defs} result={this.props.result} /> 	
    </div>
    );
  }
});
module.exports=Showtext;