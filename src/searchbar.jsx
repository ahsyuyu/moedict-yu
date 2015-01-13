var Searchbar=React.createClass({
  getInitialState: function() {
  	return {field:[]};
  },
  componentDidMount: function() {
  	// var tofind=this.refs.tofind.getDOMNode().value;
  	// this.props.dosearch(tofind,this.props.searchfield);
  },
  componentWillUpdate: function() {
	$("label[data-type='"+this.state.field+"']").attr('id', 'checkedfield');
  },
  todosearch: function(e) {
  	if(e.target.nodeName=="LABEL") $("label").removeAttr('id');
  	var tofind=this.refs.tofind.getDOMNode().value;
    //var field=$(this.refs.searchtype.getDOMNode()).find("label")[0].dataset.type;
    var field=e.target.dataset.type;
    this.setState({field:field});
  	if(tofind) {
  		if(field) this.props.dosearch(tofind,field);
  		else this.props.dosearch(tofind,this.props.searchfield);
  	}
  },
  render: function() {
    return(
  <div>
  	<div>
	  <div>
	    <input className="maininput" type="text" ref="tofind" placeholder="請輸入字詞" defaultValue="月" onChange={this.todosearch}/>
	  </div>    
	  <div className="radio-toolbar" ref="searchtype" onClick={this.todosearch}>
	    <label data-type="start" id="checkedfield">
	      <input type="radio" name="field" checked>頭</input>
	    </label>
	    <label data-type="end">
	      <input type="radio" name="field">尾</input>
	    </label>
	    <label data-type="middle">
	      <input type="radio" name="field">中</input>
	    </label>
	    <label data-type="fulltext">
	      <input type="radio" name="field">全</input>
	    </label>
	  </div>
	</div>
  </div>
    	
    ); 
  }
});
module.exports=Searchbar;