var Searchbar=React.createClass({
  getInitialState: function() {
  	return {field:[],tofind:[],ckeckRadio:false};
  },
  // componentDidMount: function() {
  //   var that=this;
  // 	var tofind=this.refs.tofind.getDOMNode().value;
  //   setTimeout(function(){
  //    that.props.dosearch(tofind,"start");//this.props.searchfield
  //   },500);
  // },
  componentWillUpdate: function() {
  	//$("label[data-type='"+this.state.field+"']").
	$("label[data-type='"+this.state.field+"']").attr('id', 'checkedfield');
  },
  dosearch_radio: function(e) {
  	$("label").removeAttr('id');
  	var tofind=this.refs.tofind.getDOMNode().value;
    //var field=$(this.refs.searchtype.getDOMNode()).find("label")[0].dataset.type;
    var field=e.target.dataset.type;
    if(field) {
	    if (this.state.field != field || this.state.tofind != tofind ) {
	    	this.setState({field:field,tofind:tofind})
	   		if(!field) field=this.props.searchfield;
	  		this.props.dosearch(tofind,field);   	
	    }
	}
  },
  dosearch_input: function(e) {
  	var tofind=this.refs.tofind.getDOMNode().value;
    //var field=$(this.refs.searchtype.getDOMNode()).find("label")[0].dataset.type;

    if (this.state.tofind != tofind) {
    	this.setState({tofind:tofind});
  		this.props.dosearch(tofind,this.props.searchfield);   	
	}
  },
  render: function() {
    return(
  <div>
  	<div>
  	  <div className="inline">
  	    <input className="maininput" type="text" ref="tofind" placeholder="請輸入字詞" defaultValue="點" onChange={this.dosearch_input}/>
  	  </div>    
  	  <div className="radio-toolbar inline vertical_middle center" ref="searchtype" onClick={this.dosearch_radio}>
        &nbsp;<label data-type="start" id="checkedfield">
  	      <input type="radio" name="field" defaultChecked>頭</input>
  	    </label>&nbsp;
  	    <label data-type="end">
  	      <input type="radio" name="field">尾</input>
  	    </label>&nbsp;
  	    <label data-type="middle">
  	      <input type="radio" name="field">中</input>
  	    </label>&nbsp;
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