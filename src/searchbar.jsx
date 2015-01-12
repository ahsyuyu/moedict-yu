var Searchbar=React.createClass({
  getInitialState: function() {
  	return {field:[]};
  },
  componentWillUpdate: function() {
	$("label[data-type='"+this.state.field+"']").attr('id', 'checkedfield');
  },
  todosearch: function(e) {
  	$("label").removeAttr('id');
  	var tofind=this.refs.tofind.getDOMNode().value;
    //var field=$(this.refs.searchtype.getDOMNode()).find("label")[0].dataset.type;
    var field=e.target.dataset.type;
    this.setState({field:field});
  	if(tofind) this.props.dosearch(tofind,field);
  },
  render: function() {
    return(
  <div>
  	<div>
	  <div>
	    <input className="maininput" type="text" ref="tofind" placeholder="請輸入字詞" defaultValue="月" onKeyDown={this.dosearch} onChange={this.dosearch}/>
	  </div>    
	  <div className="radio-toolbar" ref="searchtype" onClick={this.todosearch}>
	    <label data-type="start">
	      <input type="radio" name="field" autocomplete="off" checked="checked">頭</input>
	    </label>
	    &nbsp;&nbsp;<label data-type="end">
	      <input type="radio" name="field" autocomplete="off">尾</input>
	    </label>
	    &nbsp;&nbsp;<label data-type="middle">
	      <input type="radio" name="field" autocomplete="off">中</input>
	    </label>
	    &nbsp;&nbsp;<label data-type="fulltext">
	      <input type="radio" name="field" autocomplete="off">全</input>
	    </label>
	  </div>
	</div>
  </div>
    	
    ); 
  }
});
module.exports=Searchbar;