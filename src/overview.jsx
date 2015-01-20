var Overview=React.createClass({
  getInitialState: function() {
  	return {};
  },
  getDefFromEntryId: function(e) {
    var entryIndex=e.target.value;
    this.props.gotoEntry(entryIndex);
  },
  shouldComponentUpdate: function(nextProps,nextState) {
    if(nextProps.result==this.props.result) return false;
    else return true;
  },
  componentDidUpdate: function() {
    var that=this;
    if(this.props.result.length!=0){
      setTimeout(function(){
        that.refs.entryList.getDOMNode().selectedIndex=0;
       that.props.gotoEntry(that.props.result[0][1]); 
      },500);
     }
    //if(defaultIndex) this.autogetEntry(defaultIndex);
  },
  renderResult: function(item,index) {
    if(item!="搜尋結果列表") return (<option value={item[1]}>{item[0]}</option>);
    else return (<option>{item}</option>);
  },
  render: function() {
    var resCounter=0;
  	var res=this.props.result || "";
    if(res!="搜尋結果列表") {
      if(!this.props.fulltextResultLength) resCounter=res.length;
      else resCounter=this.props.fulltextResultLength;
    }
    //if(res.length==0) res=[["沒有結果"]];
    return(
	<div>
		<select className="resultlist" ref="entryList" onChange={this.getDefFromEntryId}>
    {this.props.result.map(this.renderResult)}
		</select>
    <span className="counter">{resCounter}</span>
	</div>	
    ); 
  }
});
module.exports=Overview;