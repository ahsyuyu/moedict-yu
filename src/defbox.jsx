var Defbox=React.createClass({
  getInitialState: function() {
  	return {searchResult:[],tofinds:[]};
  },
  componentWillReceiveProps: function() {
    $('html, body').scrollTop(0);
  },
  renderDef: function(item,e) {
    var parsedItem=item.replace(/./g,function(r){
        return '<span data-entry='+e+'>'+r+'</span>';
      });
    return parsedItem;
  },
  dosearch_history: function(e) {
    var entryIndex=e.target.dataset.entry;
    var tofind=e.target.textContent;
    var next=e.target.nextSibling;
    var tf=this.state.tofinds;
    for(var i=0; i<10; i++){
      //if(!next || next.textContent.match(/[。，、「」：]/g)) break;  
      tofind+=next.textContent;
      next=next.nextSibling;
    }
    if(tf.length==0) tf.push(this.state.searchResult[0][0]);
    tf.push(tofind);
    if(entryIndex) {
      this.state.searchResult.map(function(item){item.push(tf[tf.length-2])});
      this.props.pushHistory(this.state.searchResult,entryIndex);
    }
    this.props.dosearch(tofind);
  },
  reverseDef: function(d) {
    var defs=[];
    for(var i=0; i<d.length; i++){
      defs[d.length-i-1]=d[i];
    }
    return defs;
  },
  tohighlight: function(def) {
    return this.props.highlight(def,this.props.tofind,this.props.entryIndex);
  },
  render: function() {
    var d=this.reverseDef(this.props.defs);
    //if(this.props.searchfield=="fulltext") d=this.tohighlight(d);
    var defs=[];
    this.state.searchResult=[];
    if(d.length!=0) {
      for(var i=0; i<d.length; i++) {
        var t=d[i][0].split("\n");
        var title='<div class="title">'+t[0]+'</div>';
        defs.push(title);
        this.state.searchResult.push([t[0],d[i][1]]);
        for(var j=1; j<t.length; j++) {
          var t1=this.renderDef(t[j],d[i][1]);
          defs.push(t1);
        }
      }
    }
    return(

    <div className="defbox" dangerouslySetInnerHTML={{__html: defs.join("<br>")}} onClick={this.dosearch_history}/>

    ); 
  }
});
module.exports=Defbox;