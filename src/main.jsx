var kse=require("ksana-search");
var kde=require("ksana-database");
var api=require("./api");
var Showtext=require("./showtext.jsx");
var Searchbar=require("./searchbar.jsx");
var Overview=require("./overview.jsx");
var maincomponent = React.createClass({
  getInitialState: function() {
    var that=this;
    kde.open("moedict",function(err,db){
      var entries=db.get("segnames");
      that.setState({entries:entries,db:db});
    });    
  	return {entries:[],result:["搜尋結果列表"],searchtype:"start",defs:[]};
  },
  dosearch: function(tofind,field) {
    if(field=="start"){
      this.search_start(tofind);
    }
    if(field=="end"){
      this.search_end(tofind);
    }
    if(field=="middle"){
      this.search_middle(tofind);
    }
    if(field=="fulltext"){
      this.search_fulltext(tofind);
    }
  },
  search_start: function(tofind) {
    var out=[];
    var index=api.indexOfSorted(this.state.entries,tofind);
    var i=0;
    while(this.state.entries[index+i].indexOf(tofind)==0){
      out.push([this.state.entries[index+i],parseInt(index)+i]);
      i++;
    }
    this.setState({result:out});
  },
  search_end: function(tofind) {
    var out=[];
    var i=0;
    for(var i=0; i<this.state.entries.length; i++){
      if(this.state.entries[i].indexOf(tofind)==this.state.entries[i].length-1){
        out.push([this.state.entries[i],i]);
      }
    }
    this.setState({result:out});
  },
  search_middle: function(tofind) {
    var out=[];
    var i=0;
    for(var i=0; i<this.state.entries.length; i++){
      var ent=this.state.entries[i];
      if(ent.indexOf(tofind) >-1 && ent.indexOf(tofind)!=0 && ent.indexOf(tofind)!=ent.length-1){
        out.push([this.state.entries[i],i]);
      }
    }
    this.setState({result:out});  
  },

  search_fulltext: function(tofind) {
    var that=this;
    var out=[];
    kse.search("moedict",tofind,{range:{start:0,maxseg:500}},function(err,data){
      out=data.excerpt.map(function(item){return [item.segname,item.seg];});
      that.setState({result:out});
    }) 
    // kse.highlightSeg(this.state.db,0,{q:tofind,nospan:true},function(data){
    //   out=data.excerpt.map(function(item){return [item.segname,item.seg];});
    //   that.setState({result:out});
    // });
  },
  defSearch: function(tofind,reset) {//點選def做搜尋就是用defSearch
    this.setState({tofind:tofind});
    if(reset==1) defs=[];
    var that=this;
    var index=api.indexOfSorted(this.state.entries,tofind);
    if(this.state.entries[index]==tofind){
      kde.open("moedict",function(err,db){
        var def=db.get(["filecontents",0,index],function(data){
          defs.push([data,index]);
          that.setState({defs:defs});
          //that.state.defs.push(data);
        });
      });    
    }
  },
  gotoEntry: function(index) {// 從下拉選單點選的項目or 點searchhistory會用gotoEntry 來顯示def
    var that=this;
    var defs=[];
    kde.open("moedict",function(err,db){
      //var def=db.get("moedict.fileContents.0."+index);
      var def=db.get(["filecontents",0,index],function(data){
        defs.push([data,index]);
        that.setState({defs:defs});
      });
    }); 
  },
  render: function() {
    return(
    <div>
      <Searchbar dosearch={this.dosearch} />
      <Overview result={this.state.result} gotoEntry={this.gotoEntry} />
      <br></br><br></br>
      <Showtext gotoEntry={this.gotoEntry} defSearch={this.defSearch} defs={this.state.defs} tofind={this.state.tofind} result={this.state.result}/>
    </div>
    );
  }
});
module.exports=maincomponent;