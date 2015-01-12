var Searchbar=React.createClass({
  getInitialState: function() {
  	return {};
  },
  dosearch: function() {
  	var tofind=this.refs.tofind.getDOMNode().value;
    var field=$(this.refs.searchtype.getDOMNode()).find(".active")[0].dataset.type;
    
  	if(tofind) this.props.dosearch(tofind,field);
  },
  render: function() {
    return(
  <div>
  	<div> 
	  <div className="col-sm-3">
	    <input className="form-control col-sm-1" type="text" ref="tofind" placeholder="請輸入字詞" defaultValue="月" onKeyDown={this.dosearch} onChange={this.dosearch}/>
	  </div>  
	  <br/><br/>&nbsp;&nbsp;&nbsp;&nbsp;    
	  <div className="btn-group" data-toggle="buttons" ref="searchtype" onClick={this.dosearch}>
	    <label data-type="start" className="btn btn-success active">
	      <input type="radio" name="field" autocomplete="off">頭</input>
	    </label>
	    <label data-type="end" className="btn btn-success">
	      <input type="radio" name="field" autocomplete="off">尾</input>
	    </label>
	    <label data-type="middle" className="btn btn-success" >
	      <input type="radio" name="field" autocomplete="off">中</input>
	    </label>
	    <label data-type="fulltext" className="btn btn-success" >
	      <input type="radio" name="field" autocomplete="off">全</input>
	    </label>
	  </div>
	</div>
  </div>
    	
    ); 
  }
});
module.exports=Searchbar;