var Searchhistory=React.createClass({
  getInitialState: function() {
  	return {vpos:[]};
  },
  componentDidUpdate: function() {
    var vpos=this.state.vpos;
    $('span[vpos=]').removeClass("highlight");
    $('span[vpos="'+vpos+'"]').addClass("highlight");
  },
  goEntry: function(e) {
  	var entryIndex=e.target.parentElement.dataset.entry
  	var that=this;
    //$('html, body').scrollTop($("div[class='title']").position().top);
  	this.props.entryHistory.map(function(item,index){
  		if(item[1]==entryIndex) {
  			if(index==0) {
  				var text=item[0].replace(/[<>="a-z0-9\/ ]/g,"");
  				that.props.defSearch(text);
          that.setState({vpos:item[3]});
  			} else {
          that.props.defSearch(item[2]);
          that.setState({vpos:item[3]});
        }
  			that.props.popHistory(index);
  		}
  	})
  },
  renderHistory: function(item) {
  	return '<a data-entry='+item[1]+'>'+item[0]+'</a>';
  },
  render: function() {
  	var s=this.props.entryHistory;
  	var res=s.map(this.renderHistory);
  	var searchhistory=res.join(" > ");
    return(
	<div onClick={this.goEntry}>
		<div className="history" dangerouslySetInnerHTML={{__html: searchhistory}} />
	</div>
    	
    ); 
  }
});
module.exports=Searchhistory;