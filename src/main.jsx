var kse=require("ksana-search");
var kde=require("ksana-database");
var api=require("./api");
var Showtext=require("./showtext.jsx");
var Searchbar=require("./searchbar.jsx");
var Overview=require("./overview.jsx");
var debug=false;
var maincomponent = React.createClass({
  getInitialState: function() {
    if(debug) console.log("getInitialState:",new Date());
    var that=this;
    kde.open("moedict",function(err,db){
      var entries=db.get("segnames");
      that.setState({entries:entries,db:db});
    });    
  	return {entries:[],result:["搜尋結果列表"],searchfield:"start",defs:[],entryIndex:[]};
  },
  // componentDidUpdate: function(){
  //   setTimeout(function(){
  //       this.setState({renderSplash:true})
  //     },3000);
  // },
  dosearch: function(tofind,field) {
    var out=[];
    if(debug) console.log("dosearch:",new Date());
    this.setState({tofind:tofind,searchfield:field});
    if(tofind != ""){
      if(field=="start"){
        if(this.state.entries.length != 0) out=api.search_start(this.state.entries,tofind);
        this.setState({result:out,fulltextResultLength:null});
      }
      if(field=="end"){
        out=api.search_end(this.state.entries,tofind);       
        this.setState({result:out,fulltextResultLength:null});
      }
      if(field=="middle"){
        out=api.search_middle(this.state.entries,tofind);
        this.setState({result:out,fulltextResultLength:null});
      }
      if(field=="fulltext"){
        this.search_fulltext(tofind);
      }
    }
  },
  search_fulltext: function(tofind) {
    var that=this;
    var out=[];
    kse.search("moedict",tofind,{range:{start:0,maxseg:99}},function(err,data){
      out=data.excerpt.map(function(item){return [item.segname,item.seg];});
      that.setState({result:out,fulltextResultLength:data.rawresult.length});
    }) 
    // out=[["一丁點",132],["一班半點",854],["一點",1332]];
    // this.setState({result:out});
  },
  getEntryIndexByTofind: function(tofind,entries) {
    var entriesIndex=[];
    for(var i=1; i<tofind.length+1; i++){
      var t=tofind.substr(0,i);
      var index=api.indexOfSorted(entries,t);
      if(entries[index]==t) {
        entriesIndex.push(index);
      }
    }
    return entriesIndex;
  },
  defSearch: function(tofind) {//點選def做搜尋就是用defSearch
    var eIdx=this.getEntryIndexByTofind(tofind,this.state.entries);
    var out=[], defs=[];
    var that=this;
    // for(var i=0;i<eIdx.length;i++){
    //   kse.highlightSeg(this.state.db,0,eIdx[i],{q:this.state.entries[eIdx[i]]},function(data){
    //     defs.push([data.text,eIdx[i]]);
    //     if(defs.length==eIdx.length)that.setState({defs:defs});
    //   });      
    // }
    for(var i=0;i<eIdx.length;i++){
      (function(idx) {  //用參數idx 保存 eIdx[i]的值
        kse.highlightSeg(that.state.db,0,idx,{span:true},function(data){//that.state.entries[idx]
                  //debugger;//強迫停在這裡觀察
          defs.push([data.text,idx]);
          if(defs.length==eIdx.length)that.setState({defs:defs}); //eIdx.length 可以用，因為這個值不變
        });      
      } )(eIdx[i]);
    }

  },
  gotoEntry: function(index) {// 從下拉選單點選的項目or 點searchhistory會用gotoEntry 來顯示def
    if(debug) console.log("gotoEntry:",new Date());
    var that=this;
    var defs=[];
    //this.setState({entryIndex:index});
    // kde.open("moedict",function(err,db){
    //   var def=db.get(["filecontents",0,index],function(data){
    //     defs.push([data,index]);
    //     that.setState({defs:defs});
    //   });
    // }); 
    kse.highlightSeg(this.state.db,0,index,{span:true},function(data){//q:this.state.tofind
      //debugger;
      defs.push([data.text,index]);
      that.setState({defs:defs});
    });
    
  },
  highlight: function(def,tofind,segid) {
    var out=[];
    kse.highlightSeg(this.state.db,0,segid,{q:tofind,span:true},function(data){
      out=data;
    });
    return out;
  },
  render: function() {
    return(
    <div className="entriearea">

        <Searchbar searchfield={this.state.searchfield} dosearch={this.dosearch} />
      <div className="space" />
        <Overview searchfield={this.state.searchfield} result={this.state.result} gotoEntry={this.gotoEntry} fulltextResultLength={this.state.fulltextResultLength} />
      <div className="space" />
        <Showtext highlight={this.highlight} searchfield={this.state.searchfield} gotoEntry={this.gotoEntry} dosearch={this.dosearch} defSearch={this.defSearch} defs={this.state.defs} tofind={this.state.tofind} result={this.state.result} />
    </div>
    );
  }
});
module.exports=maincomponent;