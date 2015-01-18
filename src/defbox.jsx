var debug=true;
var Defbox=React.createClass({
  getInitialState: function() {
  	return {searchResult:[],tofinds:[]};
  },
  shouldComponentUpdate: function(nextProps) {
    if(nextProps.defs != this.props.defs) return true;
    else return false;
  },
  componentWillReceiveProps: function() {
    $('html, body').scrollTop(0);
  },
  dosearch_history: function(e) {
    var entryIndex=e.target.parentElement.dataset.entry;
    var vpos=e.target.attributes[0].value;
    var tofind=e.target.textContent;
    var next=e.target.nextSibling;
    var tf=this.state.tofinds;
    this.setState({vpos:vpos});
    for(var i=0; i<10; i++){
      //if(!next || next.textContent.match(/[。，、「」：]/g)) break;  
      if(!next.textContent) break;  
      tofind+=next.textContent;
      next=next.nextSibling;
    }
    if(tf.length==0) tf.push(this.state.searchResult[0][0]);
    tf.push(tofind);
    if(entryIndex) {
      this.state.searchResult.map(function(item){
        item.push(tf[tf.length-2]);
        item.push(vpos);
      });
      this.props.pushHistory(this.state.searchResult,entryIndex);
    }
    this.props.dosearch(tofind);
  },
  reverseDef: function(d) {
    if(debug) console.log("renderDef:",new Date());
    var defs=[];
    for(var i=0; i<d.length; i++){
      defs[d.length-i-1]=d[i];
    }
    return defs;
  },
  tohighlight: function(def) {
    var out=[];
    var coloredDef=this.props.highlight(def[0][0],this.props.tofind,def[0][1]);
    console.log(out);
    out.push([coloredDef.text,coloredDef.seg]);
    return out;
  },
  render: function() {
    if(debug) console.log("render:",new Date());
    var d=this.reverseDef(this.props.defs);//d=[def,entry]
    if(this.props.searchfield=="fulltext") d=this.tohighlight(d);
    var defs=[];
    this.state.searchResult=[];
    if(d.length!=0) {
      for(var i=0; i<d.length; i++) {
        var t=d[i][0].split("\n");
        var title='<div data-entry="'+d[i][1]+'"><div class="title">'+t[0]+'</div>';
        defs.push(title);
        this.state.searchResult.push([t[0],d[i][1]]);
        for(var j=1; j<t.length; j++) {
          defs.push(t[j]);
        }
        defs.push("</div>")
      }
    }
    if(debug) console.log("Finish Def render:",new Date());
    return(

    <div className="defbox" dangerouslySetInnerHTML={{__html: defs.join("<br>")}} onClick={this.dosearch_history}/>

    ); 
  }
});
module.exports=Defbox;