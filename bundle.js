(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/yu/ksana2015/moedict-yu/index.js":[function(require,module,exports){
var runtime=require("ksana2015-webruntime");
runtime.boot("moedict-yu",function(){
	var Main=React.createElement(require("./src/main.jsx"));
	ksana.mainComponent=React.render(Main,document.getElementById("main"));
});
},{"./src/main.jsx":"/Users/yu/ksana2015/moedict-yu/src/main.jsx","ksana2015-webruntime":"/Users/yu/ksana2015/node_modules/ksana2015-webruntime/index.js"}],"/Users/yu/ksana2015/moedict-yu/src/api.js":[function(require,module,exports){
var indexOfSorted = function (array, obj) { 
    var low = 0,
    high = array.length-1;
    while (low < high) {
      var mid = (low + high) >> 1;
      array[mid] < obj ? low = mid + 1 : high = mid;
    }
    //if(array[low] != obj) return null;
    return low;
 }

 var test = function(input) {
 	console.log(input);
 }

 var api={test:test,indexOfSorted:indexOfSorted};

module.exports=api;
},{}],"/Users/yu/ksana2015/moedict-yu/src/defbox.jsx":[function(require,module,exports){
var Defbox=React.createClass({displayName: "Defbox",
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
  render: function() {
    var d=this.props.defs;
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

    React.createElement("div", {className: "defbox", dangerouslySetInnerHTML: {__html: defs.join("<br>")}, onClick: this.dosearch_history})

    ); 
  }
});
module.exports=Defbox;
},{}],"/Users/yu/ksana2015/moedict-yu/src/main.jsx":[function(require,module,exports){
var kse=require("ksana-search");
var kde=require("ksana-database");
var api=require("./api");
var Showtext=require("./showtext.jsx");
var Searchbar=require("./searchbar.jsx");
var Overview=require("./overview.jsx");
var maincomponent = React.createClass({displayName: "maincomponent",
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
    React.createElement("div", {className: "entriearea"}, 
      React.createElement("div", {className: "center toolbar"}, 
        React.createElement(Searchbar, {dosearch: this.dosearch}), 
        React.createElement(Overview, {result: this.state.result, gotoEntry: this.gotoEntry}), 
        React.createElement("br", null)
      ), 
      React.createElement(Showtext, {gotoEntry: this.gotoEntry, defSearch: this.defSearch, defs: this.state.defs, tofind: this.state.tofind, result: this.state.result})
    )
    );
  }
});
module.exports=maincomponent;
},{"./api":"/Users/yu/ksana2015/moedict-yu/src/api.js","./overview.jsx":"/Users/yu/ksana2015/moedict-yu/src/overview.jsx","./searchbar.jsx":"/Users/yu/ksana2015/moedict-yu/src/searchbar.jsx","./showtext.jsx":"/Users/yu/ksana2015/moedict-yu/src/showtext.jsx","ksana-database":"/Users/yu/ksana2015/node_modules/ksana-database/index.js","ksana-search":"/Users/yu/ksana2015/node_modules/ksana-search/index.js"}],"/Users/yu/ksana2015/moedict-yu/src/overview.jsx":[function(require,module,exports){
var Overview=React.createClass({displayName: "Overview",
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
    if(item!="搜尋結果列表") return (React.createElement("option", {value: item[1]}, item[0]));
    else return (React.createElement("option", null, item));
  },
  render: function() {
    var resCounter=0;
  	var res=this.props.result || "";
    if(res!="搜尋結果列表") resCounter=res.length;
    return(
	React.createElement("div", null, 
    React.createElement("span", {className: "counter"}, resCounter), 
			React.createElement("select", {className: "resultlist", ref: "entryList", onChange: this.getDefFromEntryId}, 
      this.props.result.map(this.renderResult)
			)
	)	
    ); 
  }
});
module.exports=Overview;
},{}],"/Users/yu/ksana2015/moedict-yu/src/searchbar.jsx":[function(require,module,exports){
var Searchbar=React.createClass({displayName: "Searchbar",
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
  React.createElement("div", null, 
  	React.createElement("div", null, 
	  React.createElement("div", null, 
	    React.createElement("input", {className: "maininput", type: "text", ref: "tofind", placeholder: "請輸入字詞", defaultValue: "月", onKeyDown: this.dosearch, onChange: this.dosearch})
	  ), 
	  React.createElement("div", {className: "radio-toolbar", ref: "searchtype", onClick: this.todosearch}, 
	    React.createElement("label", {"data-type": "start"}, 
	      React.createElement("input", {type: "radio", name: "field", autocomplete: "off", checked: "checked"}, "頭")
	    ), 
	    "  ", React.createElement("label", {"data-type": "end"}, 
	      React.createElement("input", {type: "radio", name: "field", autocomplete: "off"}, "尾")
	    ), 
	    "  ", React.createElement("label", {"data-type": "middle"}, 
	      React.createElement("input", {type: "radio", name: "field", autocomplete: "off"}, "中")
	    ), 
	    "  ", React.createElement("label", {"data-type": "fulltext"}, 
	      React.createElement("input", {type: "radio", name: "field", autocomplete: "off"}, "全")
	    )
	  )
	)
  )
    	
    ); 
  }
});
module.exports=Searchbar;
},{}],"/Users/yu/ksana2015/moedict-yu/src/searchhistory.jsx":[function(require,module,exports){
var Searchhistory=React.createClass({displayName: "Searchhistory",
  getInitialState: function() {
  	return {};
  },
  goEntry: function(e) {
  	var entryIndex=e.target.dataset.entry;
  	var that=this;
  	this.props.entryHistory.map(function(item,index){
  		if(item[1]==entryIndex) {
  			if(index==0) that.props.defSearch(item[2],1);
  			else that.props.dosearch(item[2]);
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
	React.createElement("div", {onClick: this.goEntry}, 
		React.createElement("div", {className: "history", dangerouslySetInnerHTML: {__html: searchhistory}})
	)
    	
    ); 
  }
});
module.exports=Searchhistory;
},{}],"/Users/yu/ksana2015/moedict-yu/src/showtext.jsx":[function(require,module,exports){
var Searchhistory=require("./searchhistory.jsx");
var Defbox=require("./defbox.jsx");
var Showtext=React.createClass({displayName: "Showtext",
  getInitialState: function() {
  	return {entryHistory:[],tofind:""};
  },
  popHistory: function(index) {
    var h=this.state.entryHistory;
    for(var i=0; i<h.length-index+1; i++){
      this.state.entryHistory.pop();
      console.log(h);
    }
  },
  pushHistory: function(searchResult,clickedIndex) {//searchResult [title,titleIndex,tofind]
    var that=this;
    searchResult.map(function(item){
      if(item[1]==clickedIndex) that.state.entryHistory.push(item);
    });
  },
  dosearch: function(tofind) {
    for(var i=1; i<tofind.length+1; i++){
      var t=tofind.substr(0,i);
      this.props.defSearch(t,i);
    }
  },
  render: function() {
    return (
    React.createElement("div", null, 
    	React.createElement(Searchhistory, {popHistory: this.popHistory, defSearch: this.props.defSearch, dosearch: this.dosearch, gotoEntry: this.props.gotoEntry, entryHistory: this.state.entryHistory, result: this.props.result}), 
      React.createElement("br", null), 
    	React.createElement(Defbox, {dosearch: this.dosearch, pushHistory: this.pushHistory, defs: this.props.defs, result: this.props.result})	
    )
    );
  }
});
module.exports=Showtext;
},{"./defbox.jsx":"/Users/yu/ksana2015/moedict-yu/src/defbox.jsx","./searchhistory.jsx":"/Users/yu/ksana2015/moedict-yu/src/searchhistory.jsx"}],"/Users/yu/ksana2015/node_modules/ksana-analyzer/configs.js":[function(require,module,exports){
var tokenizers=require('./tokenizers');
var normalizeTbl=null;
var setNormalizeTable=function(tbl,obj) {
	if (!obj) {
		obj={};
		for (var i=0;i<tbl.length;i++) {
			var arr=tbl[i].split("=");
			obj[arr[0]]=arr[1];
		}
	}
	normalizeTbl=obj;
	return obj;
}
var normalize1=function(token) {
	if (!token) return "";
	token=token.replace(/[ \n\.,，。！．「」：；、]/g,'').trim();
	if (!normalizeTbl) return token;
	if (token.length==1) {
		return normalizeTbl[token] || token;
	} else {
		for (var i=0;i<token.length;i++) {
			token[i]=normalizeTbl[token[i]] || token[i];
		}
		return token;
	}
}
var isSkip1=function(token) {
	var t=token.trim();
	return (t=="" || t=="　" || t=="※" || t=="\n");
}
var normalize_tibetan=function(token) {
	return token.replace(/[།་ ]/g,'').trim();
}

var isSkip_tibetan=function(token) {
	var t=token.trim();
	return (t=="" || t=="　" ||  t=="\n");	
}
var simple1={
	func:{
		tokenize:tokenizers.simple
		,setNormalizeTable:setNormalizeTable
		,normalize: normalize1
		,isSkip:	isSkip1
	}
	
}
var tibetan1={
	func:{
		tokenize:tokenizers.tibetan
		,setNormalizeTable:setNormalizeTable
		,normalize:normalize_tibetan
		,isSkip:isSkip_tibetan
	}
}
module.exports={"simple1":simple1,"tibetan1":tibetan1}
},{"./tokenizers":"/Users/yu/ksana2015/node_modules/ksana-analyzer/tokenizers.js"}],"/Users/yu/ksana2015/node_modules/ksana-analyzer/index.js":[function(require,module,exports){
/* 
  custom func for building and searching ydb

  keep all version
  
  getAPI(version); //return hash of functions , if ver is omit , return lastest
	
  postings2Tree      // if version is not supply, get lastest
  tokenize(text,api) // convert a string into tokens(depends on other api)
  normalizeToken     // stemming and etc
  isSpaceChar        // not a searchable token
  isSkipChar         // 0 vpos

  for client and server side
  
*/
var configs=require("./configs");
var config_simple="simple1";
var optimize=function(json,config) {
	config=config||config_simple;
	return json;
}

var getAPI=function(config) {
	config=config||config_simple;
	var func=configs[config].func;
	func.optimize=optimize;
	if (config=="simple1") {
		//add common custom function here
	} else if (config=="tibetan1") {

	} else throw "config "+config +"not supported";

	return func;
}

module.exports={getAPI:getAPI};
},{"./configs":"/Users/yu/ksana2015/node_modules/ksana-analyzer/configs.js"}],"/Users/yu/ksana2015/node_modules/ksana-analyzer/tokenizers.js":[function(require,module,exports){
var tibetan =function(s) {
	//continuous tsheg grouped into same token
	//shad and space grouped into same token
	var offset=0;
	var tokens=[],offsets=[];
	s=s.replace(/\r\n/g,'\n').replace(/\r/g,'\n');
	var arr=s.split('\n');

	for (var i=0;i<arr.length;i++) {
		var last=0;
		var str=arr[i];
		str.replace(/[།་ ]+/g,function(m,m1){
			tokens.push(str.substring(last,m1)+m);
			offsets.push(offset+last);
			last=m1+m.length;
		});
		if (last<str.length) {
			tokens.push(str.substring(last));
			offsets.push(last);
		}
		if (i===arr.length-1) break;
		tokens.push('\n');
		offsets.push(offset+last);
		offset+=str.length+1;
	}

	return {tokens:tokens,offsets:offsets};
};
var isSpace=function(c) {
	return (c==" ") ;//|| (c==",") || (c==".");
}
var isCJK =function(c) {return ((c>=0x3000 && c<=0x9FFF) 
|| (c>=0xD800 && c<0xDC00) || (c>=0xFF00) ) ;}
var simple1=function(s) {
	var offset=0;
	var tokens=[],offsets=[];
	s=s.replace(/\r\n/g,'\n').replace(/\r/g,'\n');
	arr=s.split('\n');

	var pushtoken=function(t,off) {
		var i=0;
		if (t.charCodeAt(0)>255) {
			while (i<t.length) {
				var c=t.charCodeAt(i);
				offsets.push(off+i);
				tokens.push(t[i]);
				if (c>=0xD800 && c<=0xDFFF) {
					tokens[tokens.length-1]+=t[i]; //extension B,C,D
				}
				i++;
			}
		} else {
			tokens.push(t);
			offsets.push(off);	
		}
	}
	for (var i=0;i<arr.length;i++) {
		var last=0,sp="";
		str=arr[i];
		str.replace(/[_0-9A-Za-z]+/g,function(m,m1){
			while (isSpace(sp=str[last]) && last<str.length) {
				tokens[tokens.length-1]+=sp;
				last++;
			}
			pushtoken(str.substring(last,m1)+m , offset+last);
			offsets.push(offset+last);
			last=m1+m.length;
		});

		if (last<str.length) {
			while (isSpace(sp=str[last]) && last<str.length) {
				tokens[tokens.length-1]+=sp;
				last++;
			}
			pushtoken(str.substring(last), offset+last);
			
		}		
		offsets.push(offset+last);
		offset+=str.length+1;
		if (i===arr.length-1) break;
		tokens.push('\n');
	}

	return {tokens:tokens,offsets:offsets};

};

var simple=function(s) {
	var token='';
	var tokens=[], offsets=[] ;
	var i=0; 
	var lastspace=false;
	var addtoken=function() {
		if (!token) return;
		tokens.push(token);
		offsets.push(i);
		token='';
	}
	while (i<s.length) {
		var c=s.charAt(i);
		var code=s.charCodeAt(i);
		if (isCJK(code)) {
			addtoken();
			token=c;
			if (code>=0xD800 && code<0xDC00) { //high sorragate
				token+=s.charAt(i+1);i++;
			}
			addtoken();
		} else {
			if (c=='&' || c=='<' || c=='?' || c=="," || c=="."
			|| c=='|' || c=='~' || c=='`' || c==';' 
			|| c=='>' || c==':' 
			|| c=='=' || c=='@'  || c=="-" 
			|| c==']' || c=='}'  || c==")" 
			//|| c=='{' || c=='}'|| c=='[' || c==']' || c=='(' || c==')'
			|| code==0xf0b || code==0xf0d // tibetan space
			|| (code>=0x2000 && code<=0x206f)) {
				addtoken();
				if (c=='&' || c=='<'){ // || c=='{'|| c=='('|| c=='[') {
					var endchar='>';
					if (c=='&') endchar=';'
					//else if (c=='{') endchar='}';
					//else if (c=='[') endchar=']';
					//else if (c=='(') endchar=')';

					while (i<s.length && s.charAt(i)!=endchar) {
						token+=s.charAt(i);
						i++;
					}
					token+=endchar;
					addtoken();
				} else {
					token=c;
					addtoken();
				}
				token='';
			} else {
				if (c==" ") {
					token+=c;
					lastspace=true;
				} else {
					if (lastspace) addtoken();
					lastspace=false;
					token+=c;
				}
			}
		}
		i++;
	}
	addtoken();
	return {tokens:tokens,offsets:offsets};
}
module.exports={simple:simple,tibetan:tibetan};
},{}],"/Users/yu/ksana2015/node_modules/ksana-database/bsearch.js":[function(require,module,exports){
var indexOfSorted = function (array, obj, near) { 
  var low = 0,
  high = array.length;
  while (low < high) {
    var mid = (low + high) >> 1;
    if (array[mid]==obj) return mid;
    array[mid] < obj ? low = mid + 1 : high = mid;
  }
  if (near) return low;
  else if (array[low]==obj) return low;else return -1;
};
var indexOfSorted_str = function (array, obj, near) { 
  var low = 0,
  high = array.length;
  while (low < high) {
    var mid = (low + high) >> 1;
    if (array[mid]==obj) return mid;
    //(array[mid].localeCompare(obj)<0) ? low = mid + 1 : high = mid;
    array[mid]<obj ? low=mid+1 : high=mid;
  }
  if (near) return low;
  else if (array[low]==obj) return low;else return -1;
};


var bsearch=function(array,value,near) {
	var func=indexOfSorted;
	if (typeof array[0]=="string") func=indexOfSorted_str;
	return func(array,value,near);
}
var bsearchNear=function(array,value) {
	return bsearch(array,value,true);
}

module.exports=bsearch;//{bsearchNear:bsearchNear,bsearch:bsearch};
},{}],"/Users/yu/ksana2015/node_modules/ksana-database/index.js":[function(require,module,exports){
var KDE=require("./kde");
//currently only support node.js fs, ksanagap native fs, html5 file system
//use socket.io to read kdb from remote server in future
module.exports=KDE;
},{"./kde":"/Users/yu/ksana2015/node_modules/ksana-database/kde.js"}],"/Users/yu/ksana2015/node_modules/ksana-database/kde.js":[function(require,module,exports){
/* Ksana Database Engine

   2015/1/2 , 
   move to ksana-database
   simplified by removing document support and socket.io support


*/
var pool={},localPool={};
var apppath="";
var bsearch=require("./bsearch");
var Kdb=require('ksana-jsonrom');
var kdbs=[]; //available kdb , id and absolute path
var strsep="\uffff";
var kdblisted=false;
/*
var _getSync=function(paths,opts) {
	var out=[];
	for (var i in paths) {
		out.push(this.getSync(paths[i],opts));	
	}
	return out;
}
*/
var _gets=function(paths,opts,cb) { //get many data with one call

	if (!paths) return ;
	if (typeof paths=='string') {
		paths=[paths];
	}
	var engine=this, output=[];

	var makecb=function(path){
		return function(data){
				if (!(data && typeof data =='object' && data.__empty)) output.push(data);
				engine.get(path,opts,taskqueue.shift());
		};
	};

	var taskqueue=[];
	for (var i=0;i<paths.length;i++) {
		if (typeof paths[i]=="null") { //this is only a place holder for key data already in client cache
			output.push(null);
		} else {
			taskqueue.push(makecb(paths[i]));
		}
	};

	taskqueue.push(function(data){
		output.push(data);
		cb.apply(engine.context||engine,[output,paths]); //return to caller
	});

	taskqueue.shift()({__empty:true}); //run the task
}

var getFileRange=function(i) {
	var engine=this;

	var filesegcount=engine.get(["filesegcount"]);
	if (filesegcount) {
		if (i==0) {
			return {start:0,end:filesegcount[0]-1};
		} else {
			return {start:filesegcount[i-1],end:filesegcount[i]-1};
		}
	}
	//old buggy code
	var filenames=engine.get(["filenames"]);
	var fileoffsets=engine.get(["fileoffsets"]);
	var segoffsets=engine.get(["segoffsets"]);
	var segnames=engine.get(["segnames"]);
	var filestart=fileoffsets[i], fileend=fileoffsets[i+1]-1;

	var start=bsearch(segoffsets,filestart,true);
	//if (segOffsets[start]==fileStart) start--;
	
	//work around for jiangkangyur
	while (segNames[start+1]=="_") start++;

  //if (i==0) start=0; //work around for first file
	var end=bsearch(segoffsets,fileend,true);
	return {start:start,end:end};
}

var getfileseg=function(absoluteseg) {
	var fileoffsets=this.get(["fileoffsets"]);
	var segoffsets=this.get(["segoffsets"]);
	var segoffset=segoffsets[absoluteseg];
	var file=bsearch(fileoffsets,segoffset,true)-1;

	var fileStart=fileoffsets[file];
	var start=bsearch(segoffsets,fileStart,true);	

	var seg=absoluteseg-start-1;
	return {file:file,seg:seg};
}
//return array of object of nfile nseg given segname
var findSeg=function(segname) {
	var segnames=this.get("segnames");
	var out=[];
	for (var i=0;i<segnames.length;i++) {
		if (segnames[i]==segname) {
			var fileseg=getfileseg.apply(this,[i]);
			out.push({file:fileseg.file,seg:fileseg.seg,absseg:i});
		}
	}
	return out;
}
var getFileSegOffsets=function(i) {
	var segoffsets=this.get("segoffsets");
	var range=getFileRange.apply(this,[i]);
	return segoffsets.slice(range.start,range.end+1);
}
var getFileSegByVpos=function(vpos) {
	var segoffsets=this.get(["segoffsets"]);
	var i=bsearch(segoffsets,vpos,true);
	return getfileseg.apply(this,[i]);
}
var getFileSegNames=function(i) {
	var range=getFileRange.apply(this,[i]);
	var segnames=this.get("segnames");
	return segnames.slice(range.start,range.end+1);
}
var localengine_get=function(path,opts,cb,context) {
	var engine=this;
	if (typeof opts=="function") {
		context=cb;
		cb=opts;
		opts={recursive:false};
	}
	if (!path) {
		if (cb) cb.apply(context,[null]);
		return null;
	}

	if (typeof cb!="function") {
		return engine.kdb.get(path,opts);
	}

	if (typeof path=="string") {
		return engine.kdb.get([path],opts,cb,context);
	} else if (typeof path[0] =="string") {
		return engine.kdb.get(path,opts,cb,context);
	} else if (typeof path[0] =="object") {
		return _gets.apply(engine,[path,opts,cb,context]);
	} else {
		engine.kdb.get([],opts,function(data){
			cb.apply(context,[data]);//return top level keys
		},context);
	}
};	

var getPreloadField=function(user) {
	var preload=[["meta"],["filenames"],["fileoffsets"],["segnames"],["segoffsets"],["filesegcount"]];
	//["tokens"],["postingslen"] kse will load it
	if (user && user.length) { //user supply preload
		for (var i=0;i<user.length;i++) {
			if (preload.indexOf(user[i])==-1) {
				preload.push(user[i]);
			}
		}
	}
	return preload;
}
var createLocalEngine=function(kdb,opts,cb,context) {
	var engine={kdb:kdb, queryCache:{}, postingCache:{}, cache:{}};

	if (typeof context=="object") engine.context=context;
	engine.get=localengine_get;

	engine.segOffset=segOffset;
	engine.fileOffset=fileOffset;
	engine.getFileSegNames=getFileSegNames;
	engine.getFileSegOffsets=getFileSegOffsets;
	engine.getFileRange=getFileRange;
	engine.findSeg=findSeg;
	engine.getFileSegByVpos=getFileSegByVpos;
	//only local engine allow getSync
	//if (kdb.fs.getSync) engine.getSync=engine.kdb.getSync;
	
	//speedy native functions
	if (kdb.fs.mergePostings) {
		engine.mergePostings=kdb.fs.mergePostings.bind(kdb.fs);
	}
	
	var setPreload=function(res) {
		engine.dbname=res[0].name;
		//engine.customfunc=customfunc.getAPI(res[0].config);
		engine.ready=true;
	}

	var preload=getPreloadField(opts.preload);
	var opts={recursive:true};
	//if (typeof cb=="function") {
		_gets.apply(engine,[ preload, opts,function(res){
			setPreload(res);
			cb.apply(engine.context,[engine]);
		}]);
	//} else {
	//	setPreload(_getSync.apply(engine,[preload,opts]));
	//}
	return engine;
}

var segOffset=function(segname) {
	var engine=this;
	if (arguments.length>1) throw "argument : segname ";

	var segNames=engine.get("segnames");
	var segOffsets=engine.get("segoffsets");

	var i=segNames.indexOf(segname);
	return (i>-1)?segOffsets[i]:0;
}
var fileOffset=function(fn) {
	var engine=this;
	var filenames=engine.get("filenames");
	var offsets=engine.get("fileoffsets");
	var i=filenames.indexOf(fn);
	if (i==-1) return null;
	return {start: offsets[i], end:offsets[i+1]};
}

var folderOffset=function(folder) {
	var engine=this;
	var start=0,end=0;
	var filenames=engine.get("filenames");
	var offsets=engine.get("fileoffsets");
	for (var i=0;i<filenames.length;i++) {
		if (filenames[i].substring(0,folder.length)==folder) {
			if (!start) start=offsets[i];
			end=offsets[i];
		} else if (start) break;
	}
	return {start:start,end:end};
}

 //TODO delete directly from kdb instance
 //kdb.free();
var closeLocal=function(kdbid) {
	var engine=localPool[kdbid];
	if (engine) {
		engine.kdb.free();
		delete localPool[kdbid];
	}
}
var close=function(kdbid) {
	var engine=pool[kdbid];
	if (engine) {
		engine.kdb.free();
		delete pool[kdbid];
	}
}

var getLocalTries=function(kdbfn) {
	if (!kdblisted) {
		kdbs=require("./listkdb")();
		kdblisted=true;
	}

	var kdbid=kdbfn.replace('.kdb','');
	var tries= ["./"+kdbid+".kdb"
	           ,"../"+kdbid+".kdb"
	];

	for (var i=0;i<kdbs.length;i++) {
		if (kdbs[i][0]==kdbid) {
			tries.push(kdbs[i][1]);
		}
	}
	return tries;
}
var openLocalKsanagap=function(kdbid,opts,cb,context) {
	var kdbfn=kdbid;
	var tries=getLocalTries(kdbfn);

	for (var i=0;i<tries.length;i++) {
		if (fs.existsSync(tries[i])) {
			//console.log("kdb path: "+nodeRequire('path').resolve(tries[i]));
			var kdb=new Kdb.open(tries[i],function(err,kdb){
				if (err) {
					cb.apply(context,[err]);
				} else {
					createLocalEngine(kdb,opts,function(engine){
						localPool[kdbid]=engine;
						cb.apply(context||engine.context,[0,engine]);
					},context);
				}
			});
			return null;
		}
	}
	if (cb) cb.apply(context,[kdbid+" not found"]);
	return null;

}
var openLocalNode=function(kdbid,opts,cb,context) {
	var fs=require('fs');
	var tries=getLocalTries(kdbid);

	for (var i=0;i<tries.length;i++) {
		if (fs.existsSync(tries[i])) {

			new Kdb.open(tries[i],function(err,kdb){
				if (err) {
					cb.apply(context||engine.content,[err]);
				} else {
					createLocalEngine(kdb,opts,function(engine){
							localPool[kdbid]=engine;
							cb.apply(context||engine.context,[0,engine]);
					},context);
				}
			});
			return null;
		}
	}
	if (cb) cb.apply(context,[kdbid+" not found"]);
	return null;
}

var openLocalHtml5=function(kdbid,opts,cb,context) {	
	var engine=localPool[kdbid];
	var kdbfn=kdbid;
	if (kdbfn.indexOf(".kdb")==-1) kdbfn+=".kdb";
	new Kdb.open(kdbfn,function(err,handle){
		if (err) {
			cb.apply(context,[err]);
		} else {
			createLocalEngine(handle,opts,function(engine){
				localPool[kdbid]=engine;
				cb.apply(context||engine.context,[0,engine]);
			},context);
		}
	});
}
//omit cb for syncronize open
var openLocal=function(kdbid,opts,cb,context)  {
	if (typeof opts=="function") { //no opts
		if (typeof cb=="object") context=cb;
		cb=opts;
		opts={};
	}

	var engine=localPool[kdbid];
	if (engine) {
		if (cb) cb.apply(context||engine.context,[0,engine]);
		return engine;
	}

	var platform=require("./platform").getPlatform();
	if (platform=="node-webkit" || platform=="node") {
		openLocalNode(kdbid,opts,cb,context);
	} else if (platform=="html5" || platform=="chrome"){
		openLocalHtml5(kdbid,opts,cb,context);		
	} else {
		openLocalKsanagap(kdbid,opts,cb,context);	
	}
}
var setPath=function(path) {
	apppath=path;
	console.log("set path",path)
}

var enumKdb=function(cb,context){
	return kdbs.map(function(k){return k[0]});
}

module.exports={open:openLocal,setPath:setPath, close:closeLocal, enumKdb:enumKdb, bsearch:bsearch};
},{"./bsearch":"/Users/yu/ksana2015/node_modules/ksana-database/bsearch.js","./listkdb":"/Users/yu/ksana2015/node_modules/ksana-database/listkdb.js","./platform":"/Users/yu/ksana2015/node_modules/ksana-database/platform.js","fs":false,"ksana-jsonrom":"/Users/yu/ksana2015/node_modules/ksana-jsonrom/index.js"}],"/Users/yu/ksana2015/node_modules/ksana-database/listkdb.js":[function(require,module,exports){
/* return array of dbid and absolute path*/
var listkdb_html5=function() {
	throw "not implement yet";
	require("ksana-jsonrom").html5fs.readdir(function(kdbs){
			cb.apply(this,[kdbs]);
	},context||this);		

}

var listkdb_node=function(){
	var fs=require("fs");
	var path=require("path")
	var parent=path.resolve(process.cwd(),"..");
	var files=fs.readdirSync(parent);
	var output=[];
	files.map(function(f){
		var subdir=parent+path.sep+f;
		var stat=fs.statSync(subdir );
		if (stat.isDirectory()) {
			var subfiles=fs.readdirSync(subdir);
			for (var i=0;i<subfiles.length;i++) {
				var file=subfiles[i];
				var idx=file.indexOf(".kdb");
				if (idx>-1&&idx==file.length-4) {
					output.push([ file.substr(0,file.length-4), subdir+path.sep+file]);
				}
			}
		}
	})
	return output;
}
var fileNameOnly=function(fn) {
	var at=fn.lastIndexOf("/");
	if (at>-1) return fn.substr(at+1);
	return fn;
}
var listkdb_ksanagap=function() {
	var output=[];
	var apps=JSON.parse(kfs.listApps());
	for (var i=0;i<apps.length;i++) {
		var app=apps[i];
		if (app.files) for (var j=0;j<app.files.length;j++) {
			var file=app.files[j];
			if (file.substr(file.length-4)==".kdb") {
				output.push([app.dbid,fileNameOnly(file)]);
			}
		}
	};
	return output;
}
var listkdb=function() {
	var platform=require("./platform").getPlatform();
	var files=[];
	if (platform=="node" || platform=="node-webkit") {
		files=listkdb_node();
	} else if (typeof kfs!="undefined") {
		files=listkdb_ksanagap();
	} else {
		throw "not implement yet";
	}
	return files;
}
module.exports=listkdb;
},{"./platform":"/Users/yu/ksana2015/node_modules/ksana-database/platform.js","fs":false,"ksana-jsonrom":"/Users/yu/ksana2015/node_modules/ksana-jsonrom/index.js","path":false}],"/Users/yu/ksana2015/node_modules/ksana-database/platform.js":[function(require,module,exports){
var getPlatform=function() {
	if (typeof ksanagap=="undefined") {
		platform="node";
	} else {
		platform=ksanagap.platform;
	}
	return platform;
}
module.exports={getPlatform:getPlatform};
},{}],"/Users/yu/ksana2015/node_modules/ksana-jsonrom/html5read.js":[function(require,module,exports){

/* emulate filesystem on html5 browser */
/* emulate filesystem on html5 browser */
var read=function(handle,buffer,offset,length,position,cb) {//buffer and offset is not used
	var xhr = new XMLHttpRequest();
	xhr.open('GET', handle.url , true);
	var range=[position,length+position-1];
	xhr.setRequestHeader('Range', 'bytes='+range[0]+'-'+range[1]);
	xhr.responseType = 'arraybuffer';
	xhr.send();
	xhr.onload = function(e) {
		var that=this;
		setTimeout(function(){
			cb(0,that.response.byteLength,that.response);
		},0);
	}; 
}
var close=function(handle) {}
var fstatSync=function(handle) {
	throw "not implement yet";
}
var fstat=function(handle,cb) {
	throw "not implement yet";
}
var _open=function(fn_url,cb) {
		var handle={};
		if (fn_url.indexOf("filesystem:")==0){
			handle.url=fn_url;
			handle.fn=fn_url.substr( fn_url.lastIndexOf("/")+1);
		} else {
			handle.fn=fn_url;
			var url=API.files.filter(function(f){ return (f[0]==fn_url)});
			if (url.length) handle.url=url[0][1];
			else cb(null);
		}
		cb(handle);
}
var open=function(fn_url,cb) {
		if (!API.initialized) {init(1024*1024,function(){
			_open.apply(this,[fn_url,cb]);
		},this)} else _open.apply(this,[fn_url,cb]);
}
var load=function(filename,mode,cb) {
	open(filename,mode,cb,true);
}
function errorHandler(e) {
	console.error('Error: ' +e.name+ " "+e.message);
}
var readdir=function(cb,context) {
	 var dirReader = API.fs.root.createReader();
	 var out=[],that=this;
		dirReader.readEntries(function(entries) {
			if (entries.length) {
				for (var i = 0, entry; entry = entries[i]; ++i) {
					if (entry.isFile) {
						out.push([entry.name,entry.toURL ? entry.toURL() : entry.toURI()]);
					}
				}
			}
			API.files=out;
			if (cb) cb.apply(context,[out]);
		}, function(){
			if (cb) cb.apply(context,[null]);
		});
}
var initfs=function(grantedBytes,cb,context) {
	webkitRequestFileSystem(PERSISTENT, grantedBytes,  function(fs) {
		API.fs=fs;
		API.quota=grantedBytes;
		readdir(function(){
			API.initialized=true;
			cb.apply(context,[grantedBytes,fs]);
		},context);
	}, errorHandler);
}
var init=function(quota,cb,context) {
	navigator.webkitPersistentStorage.requestQuota(quota, 
			function(grantedBytes) {
				initfs(grantedBytes,cb,context);
		}, errorHandler 
	);
}
var API={
	read:read
	,readdir:readdir
	,open:open
	,close:close
	,fstatSync:fstatSync
	,fstat:fstat
}
module.exports=API;
},{}],"/Users/yu/ksana2015/node_modules/ksana-jsonrom/index.js":[function(require,module,exports){
module.exports={
	open:require("./kdb")
	,create:require("./kdbw")
}

},{"./kdb":"/Users/yu/ksana2015/node_modules/ksana-jsonrom/kdb.js","./kdbw":"/Users/yu/ksana2015/node_modules/ksana-jsonrom/kdbw.js"}],"/Users/yu/ksana2015/node_modules/ksana-jsonrom/kdb.js":[function(require,module,exports){
/*
	KDB version 3.0 GPL
	yapcheahshen@gmail.com
	2013/12/28
	asyncronize version of yadb

  remove dependency of Q, thanks to
  http://stackoverflow.com/questions/4234619/how-to-avoid-long-nesting-of-asynchronous-functions-in-node-js

  2015/1/2
  moved to ksanaforge/ksana-jsonrom
  add err in callback for node.js compliant
*/
var Kfs=null;

if (typeof ksanagap=="undefined") {
	Kfs=require('./kdbfs');			
} else {
	if (ksanagap.platform=="ios") {
		Kfs=require("./kdbfs_ios");
	} else if (ksanagap.platform=="node-webkit") {
		Kfs=require("./kdbfs");
	} else if (ksanagap.platform=="chrome") {
		Kfs=require("./kdbfs");
	} else {
		Kfs=require("./kdbfs_android");
	}
		
}


var DT={
	uint8:'1', //unsigned 1 byte integer
	int32:'4', // signed 4 bytes integer
	utf8:'8',  
	ucs2:'2',
	bool:'^', 
	blob:'&',
	utf8arr:'*', //shift of 8
	ucs2arr:'@', //shift of 2
	uint8arr:'!', //shift of 1
	int32arr:'$', //shift of 4
	vint:'`',
	pint:'~',	

	array:'\u001b',
	object:'\u001a' 
	//ydb start with object signature,
	//type a ydb in command prompt shows nothing
}
var verbose=0, readLog=function(){};
var _readLog=function(readtype,bytes) {
	console.log(readtype,bytes,"bytes");
}
if (verbose) readLog=_readLog;
var strsep="\uffff";
var Create=function(path,opts,cb) {
	/* loadxxx functions move file pointer */
	// load variable length int
	if (typeof opts=="function") {
		cb=opts;
		opts={};
	}

	
	var loadVInt =function(opts,blocksize,count,cb) {
		//if (count==0) return [];
		var that=this;

		this.fs.readBuf_packedint(opts.cur,blocksize,count,true,function(o){
			//console.log("vint");
			opts.cur+=o.adv;
			cb.apply(that,[o.data]);
		});
	}
	var loadVInt1=function(opts,cb) {
		var that=this;
		loadVInt.apply(this,[opts,6,1,function(data){
			//console.log("vint1");
			cb.apply(that,[data[0]]);
		}])
	}
	//for postings
	var loadPInt =function(opts,blocksize,count,cb) {
		var that=this;
		this.fs.readBuf_packedint(opts.cur,blocksize,count,false,function(o){
			//console.log("pint");
			opts.cur+=o.adv;
			cb.apply(that,[o.data]);
		});
	}
	// item can be any type (variable length)
	// maximum size of array is 1TB 2^40
	// structure:
	// signature,5 bytes offset, payload, itemlengths
	var getArrayLength=function(opts,cb) {
		var that=this;
		var dataoffset=0;

		this.fs.readUI8(opts.cur,function(len){
			var lengthoffset=len*4294967296;
			opts.cur++;
			that.fs.readUI32(opts.cur,function(len){
				opts.cur+=4;
				dataoffset=opts.cur; //keep this
				lengthoffset+=len;
				opts.cur+=lengthoffset;

				loadVInt1.apply(that,[opts,function(count){
					loadVInt.apply(that,[opts,count*6,count,function(sz){						
						cb({count:count,sz:sz,offset:dataoffset});
					}]);
				}]);
				
			});
		});
	}

	var loadArray = function(opts,blocksize,cb) {
		var that=this;
		getArrayLength.apply(this,[opts,function(L){
				var o=[];
				var endcur=opts.cur;
				opts.cur=L.offset;

				if (opts.lazy) { 
						var offset=L.offset;
						L.sz.map(function(sz){
							o[o.length]=strsep+offset.toString(16)
								   +strsep+sz.toString(16);
							offset+=sz;
						})
				} else {
					var taskqueue=[];
					for (var i=0;i<L.count;i++) {
						taskqueue.push(
							(function(sz){
								return (
									function(data){
										if (typeof data=='object' && data.__empty) {
											 //not pushing the first call
										}	else o.push(data);
										opts.blocksize=sz;
										load.apply(that,[opts, taskqueue.shift()]);
									}
								);
							})(L.sz[i])
						);
					}
					//last call to child load
					taskqueue.push(function(data){
						o.push(data);
						opts.cur=endcur;
						cb.apply(that,[o]);
					});
				}

				if (opts.lazy) cb.apply(that,[o]);
				else {
					taskqueue.shift()({__empty:true});
				}
			}
		])
	}		
	// item can be any type (variable length)
	// support lazy load
	// structure:
	// signature,5 bytes offset, payload, itemlengths, 
	//                    stringarray_signature, keys
	var loadObject = function(opts,blocksize,cb) {
		var that=this;
		var start=opts.cur;
		getArrayLength.apply(this,[opts,function(L) {
			opts.blocksize=blocksize-opts.cur+start;
			load.apply(that,[opts,function(keys){ //load the keys
				if (opts.keys) { //caller ask for keys
					keys.map(function(k) { opts.keys.push(k)});
				}

				var o={};
				var endcur=opts.cur;
				opts.cur=L.offset;
				if (opts.lazy) { 
					var offset=L.offset;
					for (var i=0;i<L.sz.length;i++) {
						//prefix with a \0, impossible for normal string
						o[keys[i]]=strsep+offset.toString(16)
							   +strsep+L.sz[i].toString(16);
						offset+=L.sz[i];
					}
				} else {
					var taskqueue=[];
					for (var i=0;i<L.count;i++) {
						taskqueue.push(
							(function(sz,key){
								return (
									function(data){
										if (typeof data=='object' && data.__empty) {
											//not saving the first call;
										} else {
											o[key]=data; 
										}
										opts.blocksize=sz;
										if (verbose) readLog("key",key);
										load.apply(that,[opts, taskqueue.shift()]);
									}
								);
							})(L.sz[i],keys[i-1])

						);
					}
					//last call to child load
					taskqueue.push(function(data){
						o[keys[keys.length-1]]=data;
						opts.cur=endcur;
						cb.apply(that,[o]);
					});
				}
				if (opts.lazy) cb.apply(that,[o]);
				else {
					taskqueue.shift()({__empty:true});
				}
			}]);
		}]);
	}

	//item is same known type
	var loadStringArray=function(opts,blocksize,encoding,cb) {
		var that=this;
		this.fs.readStringArray(opts.cur,blocksize,encoding,function(o){
			opts.cur+=blocksize;
			cb.apply(that,[o]);
		});
	}
	var loadIntegerArray=function(opts,blocksize,unitsize,cb) {
		var that=this;
		loadVInt1.apply(this,[opts,function(count){
			var o=that.fs.readFixedArray(opts.cur,count,unitsize,function(o){
				opts.cur+=count*unitsize;
				cb.apply(that,[o]);
			});
		}]);
	}
	var loadBlob=function(blocksize,cb) {
		var o=this.fs.readBuf(this.cur,blocksize);
		this.cur+=blocksize;
		return o;
	}	
	var loadbysignature=function(opts,signature,cb) {
		  var blocksize=opts.blocksize||this.fs.size; 
			opts.cur+=this.fs.signature_size;
			var datasize=blocksize-this.fs.signature_size;
			//basic types
			if (signature===DT.int32) {
				opts.cur+=4;
				this.fs.readI32(opts.cur-4,cb);
			} else if (signature===DT.uint8) {
				opts.cur++;
				this.fs.readUI8(opts.cur-1,cb);
			} else if (signature===DT.utf8) {
				var c=opts.cur;opts.cur+=datasize;
				this.fs.readString(c,datasize,'utf8',cb);
			} else if (signature===DT.ucs2) {
				var c=opts.cur;opts.cur+=datasize;
				this.fs.readString(c,datasize,'ucs2',cb);	
			} else if (signature===DT.bool) {
				opts.cur++;
				this.fs.readUI8(opts.cur-1,function(data){cb(!!data)});
			} else if (signature===DT.blob) {
				loadBlob(datasize,cb);
			}
			//variable length integers
			else if (signature===DT.vint) {
				loadVInt.apply(this,[opts,datasize,datasize,cb]);
			}
			else if (signature===DT.pint) {
				loadPInt.apply(this,[opts,datasize,datasize,cb]);
			}
			//simple array
			else if (signature===DT.utf8arr) {
				loadStringArray.apply(this,[opts,datasize,'utf8',cb]);
			}
			else if (signature===DT.ucs2arr) {
				loadStringArray.apply(this,[opts,datasize,'ucs2',cb]);
			}
			else if (signature===DT.uint8arr) {
				loadIntegerArray.apply(this,[opts,datasize,1,cb]);
			}
			else if (signature===DT.int32arr) {
				loadIntegerArray.apply(this,[opts,datasize,4,cb]);
			}
			//nested structure
			else if (signature===DT.array) {
				loadArray.apply(this,[opts,datasize,cb]);
			}
			else if (signature===DT.object) {
				loadObject.apply(this,[opts,datasize,cb]);
			}
			else {
				console.error('unsupported type',signature,opts)
				cb.apply(this,[null]);//make sure it return
				//throw 'unsupported type '+signature;
			}
	}

	var load=function(opts,cb) {
		opts=opts||{}; // this will served as context for entire load procedure
		opts.cur=opts.cur||0;
		var that=this;
		this.fs.readSignature(opts.cur, function(signature){
			loadbysignature.apply(that,[opts,signature,cb])
		});
		return this;
	}
	var CACHE=null;
	var KEY={};
	var ADDRESS={};
	var reset=function(cb) {
		if (!CACHE) {
			load.apply(this,[{cur:0,lazy:true},function(data){
				CACHE=data;
				cb.call(this);
			}]);	
		} else {
			cb.call(this);
		}
	}

	var exists=function(path,cb) {
		if (path.length==0) return true;
		var key=path.pop();
		var that=this;
		get.apply(this,[path,false,function(data){
			if (!path.join(strsep)) return (!!KEY[key]);
			var keys=KEY[path.join(strsep)];
			path.push(key);//put it back
			if (keys) cb.apply(that,[keys.indexOf(key)>-1]);
			else cb.apply(that,[false]);
		}]);
	}

	var getSync=function(path) {
		if (!CACHE) return undefined;	
		var o=CACHE;
		for (var i=0;i<path.length;i++) {
			var r=o[path[i]];
			if (typeof r=="undefined") return null;
			o=r;
		}
		return o;
	}
	var get=function(path,opts,cb) {
		if (typeof path=='undefined') path=[];
		if (typeof path=="string") path=[path];
		//opts.recursive=!!opts.recursive;
		if (typeof opts=="function") {
			cb=opts;node
			opts={};
		}
		var that=this;
		if (typeof cb!='function') return getSync(path);

		reset.apply(this,[function(){
			var o=CACHE;
			if (path.length==0) {
				if (opts.address) {
					cb([0,that.fs.size]);
				} else {
					cb(Object.keys(CACHE));	
				}
				return;
			} 
			
			var pathnow="",taskqueue=[],newopts={},r=null;
			var lastkey="";

			for (var i=0;i<path.length;i++) {
				var task=(function(key,k){

					return (function(data){
						if (!(typeof data=='object' && data.__empty)) {
							if (typeof o[lastkey]=='string' && o[lastkey][0]==strsep) o[lastkey]={};
							o[lastkey]=data; 
							o=o[lastkey];
							r=data[key];
							KEY[pathnow]=opts.keys;								
						} else {
							data=o[key];
							r=data;
						}

						if (typeof r==="undefined") {
							taskqueue=null;
							cb.apply(that,[r]); //return empty value
						} else {							
							if (parseInt(k)) pathnow+=strsep;
							pathnow+=key;
							if (typeof r=='string' && r[0]==strsep) { //offset of data to be loaded
								var p=r.substring(1).split(strsep).map(function(item){return parseInt(item,16)});
								var cur=p[0],sz=p[1];
								newopts.lazy=!opts.recursive || (k<path.length-1) ;
								newopts.blocksize=sz;newopts.cur=cur,newopts.keys=[];
								lastkey=key; //load is sync in android
								if (opts.address && taskqueue.length==1) {
									ADDRESS[pathnow]=[cur,sz];
									taskqueue.shift()(null,ADDRESS[pathnow]);
								} else {
									load.apply(that,[newopts, taskqueue.shift()]);
								}
							} else {
								if (opts.address && taskqueue.length==1) {
									taskqueue.shift()(null,ADDRESS[pathnow]);
								} else {
									taskqueue.shift().apply(that,[r]);
								}
							}
						}
					})
				})
				(path[i],i);
				
				taskqueue.push(task);
			}

			if (taskqueue.length==0) {
				cb.apply(that,[o]);
			} else {
				//last call to child load
				taskqueue.push(function(data,cursz){
					if (opts.address) {
						cb.apply(that,[cursz]);
					} else{
						var key=path[path.length-1];
						o[key]=data; KEY[pathnow]=opts.keys;
						cb.apply(that,[data]);
					}
				});
				taskqueue.shift()({__empty:true});			
			}

		}]); //reset
	}
	// get all keys in given path
	var getkeys=function(path,cb) {
		if (!path) path=[]
		var that=this;
		get.apply(this,[path,false,function(){
			if (path && path.length) {
				cb.apply(that,[KEY[path.join(strsep)]]);
			} else {
				cb.apply(that,[Object.keys(CACHE)]); 
				//top level, normally it is very small
			}
		}]);
	}

	var setupapi=function() {
		this.load=load;
//		this.cur=0;
		this.cache=function() {return CACHE};
		this.key=function() {return KEY};
		this.free=function() {
			CACHE=null;
			KEY=null;
			this.fs.free();
		}
		this.setCache=function(c) {CACHE=c};
		this.keys=getkeys;
		this.get=get;   // get a field, load if needed
		this.exists=exists;
		this.DT=DT;
		
		//install the sync version for node
		//if (typeof process!="undefined") require("./kdb_sync")(this);
		//if (cb) setTimeout(cb.bind(this),0);
		var that=this;
		var err=0;
		if (cb) {
			setTimeout(function(){
				cb(err,that);	
			},0);
		}
	}
	var that=this;
	var kfs=new Kfs(path,opts,function(err){
		if (err) {
			setTimeout(function(){
				cb(err,0);
			},0);
			return null;
		} else {
			that.size=this.size;
			setupapi.call(that);			
		}
	});
	this.fs=kfs;
	return this;
}

Create.datatypes=DT;

if (module) module.exports=Create;
//return Create;

},{"./kdbfs":"/Users/yu/ksana2015/node_modules/ksana-jsonrom/kdbfs.js","./kdbfs_android":"/Users/yu/ksana2015/node_modules/ksana-jsonrom/kdbfs_android.js","./kdbfs_ios":"/Users/yu/ksana2015/node_modules/ksana-jsonrom/kdbfs_ios.js"}],"/Users/yu/ksana2015/node_modules/ksana-jsonrom/kdbfs.js":[function(require,module,exports){
/* node.js and html5 file system abstraction layer*/
try {
	var fs=require("fs");
	var Buffer=require("buffer").Buffer;
} catch (e) {
	var fs=require('./html5read');
	var Buffer=function(){ return ""};
	var html5fs=true; 	
}
var signature_size=1;
var verbose=0, readLog=function(){};
var _readLog=function(readtype,bytes) {
	console.log(readtype,bytes,"bytes");
}
if (verbose) readLog=_readLog;

var unpack_int = function (ar, count , reset) {
   count=count||ar.length;
  var r = [], i = 0, v = 0;
  do {
	var shift = 0;
	do {
	  v += ((ar[i] & 0x7F) << shift);
	  shift += 7;	  
	} while (ar[++i] & 0x80);
	r.push(v); if (reset) v=0;
	count--;
  } while (i<ar.length && count);
  return {data:r, adv:i };
}
var Open=function(path,opts,cb) {
	opts=opts||{};

	var readSignature=function(pos,cb) {
		var buf=new Buffer(signature_size);
		var that=this;
		fs.read(this.handle,buf,0,signature_size,pos,function(err,len,buffer){
			if (html5fs) var signature=String.fromCharCode((new Uint8Array(buffer))[0])
			else var signature=buffer.toString('utf8',0,signature_size);
			cb.apply(that,[signature]);
		});
	}

	//this is quite slow
	//wait for StringView +ArrayBuffer to solve the problem
	//https://groups.google.com/a/chromium.org/forum/#!topic/blink-dev/ylgiNY_ZSV0
	//if the string is always ucs2
	//can use Uint16 to read it.
	//http://updates.html5rocks.com/2012/06/How-to-convert-ArrayBuffer-to-and-from-String
	var decodeutf8 = function (utftext) {
		var string = "";
		var i = 0;
		var c=0,c1 = 0, c2 = 0 , c3=0;
		for (var i=0;i<utftext.length;i++) {
			if (utftext.charCodeAt(i)>127) break;
		}
		if (i>=utftext.length) return utftext;

		while ( i < utftext.length ) {
			c = utftext.charCodeAt(i);
			if (c < 128) {
				string += utftext[i];
				i++;
			} else if((c > 191) && (c < 224)) {
				c2 = utftext.charCodeAt(i+1);
				string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				i += 2;
			} else {
				c2 = utftext.charCodeAt(i+1);
				c3 = utftext.charCodeAt(i+2);
				string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}
		}
		return string;
	}

	var readString= function(pos,blocksize,encoding,cb) {
		encoding=encoding||'utf8';
		var buffer=new Buffer(blocksize);
		var that=this;
		fs.read(this.handle,buffer,0,blocksize,pos,function(err,len,buffer){
			readLog("string",len);
			if (html5fs) {
				if (encoding=='utf8') {
					var str=decodeutf8(String.fromCharCode.apply(null, new Uint8Array(buffer)))
				} else { //ucs2 is 3 times faster
					var str=String.fromCharCode.apply(null, new Uint16Array(buffer))	
				}
				
				cb.apply(that,[str]);
			} 
			else cb.apply(that,[buffer.toString(encoding)]);	
		});
	}

	//work around for chrome fromCharCode cannot accept huge array
	//https://code.google.com/p/chromium/issues/detail?id=56588
	var buf2stringarr=function(buf,enc) {
		if (enc=="utf8") 	var arr=new Uint8Array(buf);
		else var arr=new Uint16Array(buf);
		var i=0,codes=[],out=[],s="";
		while (i<arr.length) {
			if (arr[i]) {
				codes[codes.length]=arr[i];
			} else {
				s=String.fromCharCode.apply(null,codes);
				if (enc=="utf8") out[out.length]=decodeutf8(s);
				else out[out.length]=s;
				codes=[];				
			}
			i++;
		}
		
		s=String.fromCharCode.apply(null,codes);
		if (enc=="utf8") out[out.length]=decodeutf8(s);
		else out[out.length]=s;

		return out;
	}
	var readStringArray = function(pos,blocksize,encoding,cb) {
		var that=this,out=null;
		if (blocksize==0) return [];
		encoding=encoding||'utf8';
		var buffer=new Buffer(blocksize);
		fs.read(this.handle,buffer,0,blocksize,pos,function(err,len,buffer){
			if (html5fs) {
				readLog("stringArray",buffer.byteLength);

				if (encoding=='utf8') {
					out=buf2stringarr(buffer,"utf8");
				} else { //ucs2 is 3 times faster
					out=buf2stringarr(buffer,"ucs2");
				}
			} else {
				readLog("stringArray",buffer.length);
				out=buffer.toString(encoding).split('\0');
			} 	
			cb.apply(that,[out]);
		});
	}
	var readUI32=function(pos,cb) {
		var buffer=new Buffer(4);
		var that=this;
		fs.read(this.handle,buffer,0,4,pos,function(err,len,buffer){
			readLog("ui32",len);
			if (html5fs){
				//v=(new Uint32Array(buffer))[0];
				var v=new DataView(buffer).getUint32(0, false)
				cb(v);
			}
			else cb.apply(that,[buffer.readInt32BE(0)]);	
		});		
	}

	var readI32=function(pos,cb) {
		var buffer=new Buffer(4);
		var that=this;
		fs.read(this.handle,buffer,0,4,pos,function(err,len,buffer){
			readLog("i32",len);
			if (html5fs){
				var v=new DataView(buffer).getInt32(0, false)
				cb(v);
			}
			else  	cb.apply(that,[buffer.readInt32BE(0)]);	
		});
	}
	var readUI8=function(pos,cb) {
		var buffer=new Buffer(1);
		var that=this;

		fs.read(this.handle,buffer,0,1,pos,function(err,len,buffer){
			readLog("ui8",len);
			if (html5fs)cb( (new Uint8Array(buffer))[0]) ;
			else  			cb.apply(that,[buffer.readUInt8(0)]);	
			
		});
	}
	var readBuf=function(pos,blocksize,cb) {
		var that=this;
		var buf=new Buffer(blocksize);
		fs.read(this.handle,buf,0,blocksize,pos,function(err,len,buffer){
			readLog("buf",len);
			var buff=new Uint8Array(buffer)
			cb.apply(that,[buff]);
		});
	}
	var readBuf_packedint=function(pos,blocksize,count,reset,cb) {
		var that=this;
		readBuf.apply(this,[pos,blocksize,function(buffer){
			cb.apply(that,[unpack_int(buffer,count,reset)]);	
		}]);
		
	}
	var readFixedArray_html5fs=function(pos,count,unitsize,cb) {
		var func=null;
		if (unitsize===1) {
			func='getUint8';//Uint8Array;
		} else if (unitsize===2) {
			func='getUint16';//Uint16Array;
		} else if (unitsize===4) {
			func='getUint32';//Uint32Array;
		} else throw 'unsupported integer size';

		fs.read(this.handle,null,0,unitsize*count,pos,function(err,len,buffer){
			readLog("fix array",len);
			var out=[];
			if (unitsize==1) {
				out=new Uint8Array(buffer);
			} else {
				for (var i = 0; i < len / unitsize; i++) { //endian problem
				//	out.push( func(buffer,i*unitsize));
					out.push( v=new DataView(buffer)[func](i,false) );
				}
			}

			cb.apply(that,[out]);
		});
	}
	// signature, itemcount, payload
	var readFixedArray = function(pos ,count, unitsize,cb) {
		var func=null;
		var that=this;
		
		if (unitsize* count>this.size && this.size)  {
			console.log("array size exceed file size",this.size)
			return;
		}
		
		if (html5fs) return readFixedArray_html5fs.apply(this,[pos,count,unitsize,cb]);

		var items=new Buffer( unitsize* count);
		if (unitsize===1) {
			func=items.readUInt8;
		} else if (unitsize===2) {
			func=items.readUInt16BE;
		} else if (unitsize===4) {
			func=items.readUInt32BE;
		} else throw 'unsupported integer size';
		//console.log('itemcount',itemcount,'buffer',buffer);

		fs.read(this.handle,items,0,unitsize*count,pos,function(err,len,buffer){
			readLog("fix array",len);
			var out=[];
			for (var i = 0; i < items.length / unitsize; i++) {
				out.push( func.apply(items,[i*unitsize]));
			}
			cb.apply(that,[out]);
		});
	}

	var free=function() {
		//console.log('closing ',handle);
		fs.closeSync(this.handle);
	}
	var setupapi=function() {
		var that=this;
		this.readSignature=readSignature;
		this.readI32=readI32;
		this.readUI32=readUI32;
		this.readUI8=readUI8;
		this.readBuf=readBuf;
		this.readBuf_packedint=readBuf_packedint;
		this.readFixedArray=readFixedArray;
		this.readString=readString;
		this.readStringArray=readStringArray;
		this.signature_size=signature_size;
		this.free=free;
		if (html5fs) {
			var fn=path;
			if (path.indexOf("filesystem:")==0) fn=path.substr(path.lastIndexOf("/"));
			fs.fs.root.getFile(fn,{},function(entry){
			  entry.getMetadata(function(metadata) { 
				that.size=metadata.size;
				if (cb) setTimeout(cb.bind(that),0);
				});
			});
		} else {
			var stat=fs.fstatSync(this.handle);
			this.stat=stat;
			this.size=stat.size;		
			if (cb)	setTimeout(cb.bind(this,0),0);	
		}
	}

	var that=this;
	if (html5fs) {
		fs.open(path,function(h){
			if (!h) {
				if (cb)	setTimeout(cb.bind(null,"file not found:"+path),0);	
			} else {
				that.handle=h;
				that.html5fs=true;
				setupapi.call(that);
				that.opened=true;				
			}
		})
	} else {
		if (fs.existsSync(path)){
			this.handle=fs.openSync(path,'r');//,function(err,handle){
			this.opened=true;
			setupapi.call(this);
		} else {
			if (cb)	setTimeout(cb.bind(null,"file not found:"+path),0);	
			return null;
		}
	}
	return this;
}
module.exports=Open;
},{"./html5read":"/Users/yu/ksana2015/node_modules/ksana-jsonrom/html5read.js","buffer":false,"fs":false}],"/Users/yu/ksana2015/node_modules/ksana-jsonrom/kdbfs_android.js":[function(require,module,exports){
/*
  JAVA can only return Number and String
	array and buffer return in string format
	need JSON.parse
*/
var verbose=0;

var readSignature=function(pos,cb) {
	if (verbose) console.debug("read signature");
	var signature=kfs.readUTF8String(this.handle,pos,1);
	if (verbose) console.debug(signature,signature.charCodeAt(0));
	cb.apply(this,[signature]);
}
var readI32=function(pos,cb) {
	if (verbose) console.debug("read i32 at "+pos);
	var i32=kfs.readInt32(this.handle,pos);
	if (verbose) console.debug(i32);
	cb.apply(this,[i32]);	
}
var readUI32=function(pos,cb) {
	if (verbose) console.debug("read ui32 at "+pos);
	var ui32=kfs.readUInt32(this.handle,pos);
	if (verbose) console.debug(ui32);
	cb.apply(this,[ui32]);
}
var readUI8=function(pos,cb) {
	if (verbose) console.debug("read ui8 at "+pos); 
	var ui8=kfs.readUInt8(this.handle,pos);
	if (verbose) console.debug(ui8);
	cb.apply(this,[ui8]);
}
var readBuf=function(pos,blocksize,cb) {
	if (verbose) console.debug("read buffer at "+pos+ " blocksize "+blocksize);
	var buf=kfs.readBuf(this.handle,pos,blocksize);
	var buff=JSON.parse(buf);
	if (verbose) console.debug("buffer length"+buff.length);
	cb.apply(this,[buff]);	
}
var readBuf_packedint=function(pos,blocksize,count,reset,cb) {
	if (verbose) console.debug("read packed int at "+pos+" blocksize "+blocksize+" count "+count);
	var buf=kfs.readBuf_packedint(this.handle,pos,blocksize,count,reset);
	var adv=parseInt(buf);
	var buff=JSON.parse(buf.substr(buf.indexOf("[")));
	if (verbose) console.debug("packedInt length "+buff.length+" first item="+buff[0]);
	cb.apply(this,[{data:buff,adv:adv}]);	
}


var readString= function(pos,blocksize,encoding,cb) {
	if (verbose) console.debug("readstring at "+pos+" blocksize " +blocksize+" enc:"+encoding);
	if (encoding=="ucs2") {
		var str=kfs.readULE16String(this.handle,pos,blocksize);
	} else {
		var str=kfs.readUTF8String(this.handle,pos,blocksize);	
	}	 
	if (verbose) console.debug(str);
	cb.apply(this,[str]);	
}

var readFixedArray = function(pos ,count, unitsize,cb) {
	if (verbose) console.debug("read fixed array at "+pos+" count "+count+" unitsize "+unitsize); 
	var buf=kfs.readFixedArray(this.handle,pos,count,unitsize);
	var buff=JSON.parse(buf);
	if (verbose) console.debug("array length"+buff.length);
	cb.apply(this,[buff]);	
}
var readStringArray = function(pos,blocksize,encoding,cb) {
	if (verbose) console.log("read String array at "+pos+" blocksize "+blocksize +" enc "+encoding); 
	encoding = encoding||"utf8";
	var buf=kfs.readStringArray(this.handle,pos,blocksize,encoding);
	//var buff=JSON.parse(buf);
	if (verbose) console.debug("read string array");
	var buff=buf.split("\uffff"); //cannot return string with 0
	if (verbose) console.debug("array length"+buff.length);
	cb.apply(this,[buff]);	
}
var mergePostings=function(positions,cb) {
	var buf=kfs.mergePostings(this.handle,JSON.stringify(positions));
	if (!buf || buf.length==0) return [];
	else return JSON.parse(buf);
}

var free=function() {
	//console.log('closing ',handle);
	kfs.close(this.handle);
}
var Open=function(path,opts,cb) {
	opts=opts||{};
	var signature_size=1;
	var setupapi=function() { 
		this.readSignature=readSignature;
		this.readI32=readI32;
		this.readUI32=readUI32;
		this.readUI8=readUI8;
		this.readBuf=readBuf;
		this.readBuf_packedint=readBuf_packedint;
		this.readFixedArray=readFixedArray;
		this.readString=readString;
		this.readStringArray=readStringArray;
		this.signature_size=signature_size;
		this.mergePostings=mergePostings;
		this.free=free;
		this.size=kfs.getFileSize(this.handle);
		if (verbose) console.log("filesize  "+this.size);
		if (cb)	cb.call(this);
	}

	this.handle=kfs.open(path);
	this.opened=true;
	setupapi.call(this);
	return this;
}

module.exports=Open;
},{}],"/Users/yu/ksana2015/node_modules/ksana-jsonrom/kdbfs_ios.js":[function(require,module,exports){
/*
  JSContext can return all Javascript types.
*/
var verbose=1;

var readSignature=function(pos,cb) {
	if (verbose)  ksanagap.log("read signature at "+pos);
	var signature=kfs.readUTF8String(this.handle,pos,1);
	if (verbose)  ksanagap.log(signature+" "+signature.charCodeAt(0));
	cb.apply(this,[signature]);
}
var readI32=function(pos,cb) {
	if (verbose)  ksanagap.log("read i32 at "+pos);
	var i32=kfs.readInt32(this.handle,pos);
	if (verbose)  ksanagap.log(i32);
	cb.apply(this,[i32]);	
}
var readUI32=function(pos,cb) {
	if (verbose)  ksanagap.log("read ui32 at "+pos);
	var ui32=kfs.readUInt32(this.handle,pos);
	if (verbose)  ksanagap.log(ui32);
	cb.apply(this,[ui32]);
}
var readUI8=function(pos,cb) {
	if (verbose)  ksanagap.log("read ui8 at "+pos); 
	var ui8=kfs.readUInt8(this.handle,pos);
	if (verbose)  ksanagap.log(ui8);
	cb.apply(this,[ui8]);
}
var readBuf=function(pos,blocksize,cb) {
	if (verbose)  ksanagap.log("read buffer at "+pos);
	var buf=kfs.readBuf(this.handle,pos,blocksize);
	if (verbose)  ksanagap.log("buffer length"+buf.length);
	cb.apply(this,[buf]);	
}
var readBuf_packedint=function(pos,blocksize,count,reset,cb) {
	if (verbose)  ksanagap.log("read packed int fast, blocksize "+blocksize+" at "+pos);var t=new Date();
	var buf=kfs.readBuf_packedint(this.handle,pos,blocksize,count,reset);
	if (verbose)  ksanagap.log("return from packedint, time" + (new Date()-t));
	if (typeof buf.data=="string") {
		buf.data=eval("["+buf.data.substr(0,buf.data.length-1)+"]");
	}
	if (verbose)  ksanagap.log("unpacked length"+buf.data.length+" time" + (new Date()-t) );
	cb.apply(this,[buf]);
}


var readString= function(pos,blocksize,encoding,cb) {

	if (verbose)  ksanagap.log("readstring at "+pos+" blocksize "+blocksize+" "+encoding);var t=new Date();
	if (encoding=="ucs2") {
		var str=kfs.readULE16String(this.handle,pos,blocksize);
	} else {
		var str=kfs.readUTF8String(this.handle,pos,blocksize);	
	}
	if (verbose)  ksanagap.log(str+" time"+(new Date()-t));
	cb.apply(this,[str]);	
}

var readFixedArray = function(pos ,count, unitsize,cb) {
	if (verbose)  ksanagap.log("read fixed array at "+pos); var t=new Date();
	var buf=kfs.readFixedArray(this.handle,pos,count,unitsize);
	if (verbose)  ksanagap.log("array length "+buf.length+" time"+(new Date()-t));
	cb.apply(this,[buf]);	
}
var readStringArray = function(pos,blocksize,encoding,cb) {
	//if (verbose)  ksanagap.log("read String array "+blocksize +" "+encoding); 
	encoding = encoding||"utf8";
	if (verbose)  ksanagap.log("read string array at "+pos);var t=new Date();
	var buf=kfs.readStringArray(this.handle,pos,blocksize,encoding);
	if (typeof buf=="string") buf=buf.split("\0");
	//var buff=JSON.parse(buf);
	//var buff=buf.split("\uffff"); //cannot return string with 0
	if (verbose)  ksanagap.log("string array length"+buf.length+" time"+(new Date()-t));
	cb.apply(this,[buf]);
}

var mergePostings=function(positions) {
	var buf=kfs.mergePostings(this.handle,positions);
	if (typeof buf=="string") {
		buf=eval("["+buf.substr(0,buf.length-1)+"]");
	}
	return buf;
}
var free=function() {
	////if (verbose)  ksanagap.log('closing ',handle);
	kfs.close(this.handle);
}
var Open=function(path,opts,cb) {
	opts=opts||{};
	var signature_size=1;
	var setupapi=function() { 
		this.readSignature=readSignature;
		this.readI32=readI32;
		this.readUI32=readUI32;
		this.readUI8=readUI8;
		this.readBuf=readBuf;
		this.readBuf_packedint=readBuf_packedint;
		this.readFixedArray=readFixedArray;
		this.readString=readString;
		this.readStringArray=readStringArray;
		this.signature_size=signature_size;
		this.mergePostings=mergePostings;
		this.free=free;
		this.size=kfs.getFileSize(this.handle);
		if (verbose)  ksanagap.log("filesize  "+this.size);
		if (cb)	cb.call(this);
	}

	this.handle=kfs.open(path);
	this.opened=true;
	setupapi.call(this);
	return this;
}

module.exports=Open;
},{}],"/Users/yu/ksana2015/node_modules/ksana-jsonrom/kdbw.js":[function(require,module,exports){
/*
  convert any json into a binary buffer
  the buffer can be saved with a single line of fs.writeFile
*/

var DT={
	uint8:'1', //unsigned 1 byte integer
	int32:'4', // signed 4 bytes integer
	utf8:'8',  
	ucs2:'2',
	bool:'^', 
	blob:'&',
	utf8arr:'*', //shift of 8
	ucs2arr:'@', //shift of 2
	uint8arr:'!', //shift of 1
	int32arr:'$', //shift of 4
	vint:'`',
	pint:'~',	

	array:'\u001b',
	object:'\u001a' 
	//ydb start with object signature,
	//type a ydb in command prompt shows nothing
}
var key_writing="";//for debugging
var pack_int = function (ar, savedelta) { // pack ar into
  if (!ar || ar.length === 0) return []; // empty array
  var r = [],
  i = 0,
  j = 0,
  delta = 0,
  prev = 0;
  
  do {
	delta = ar[i];
	if (savedelta) {
		delta -= prev;
	}
	if (delta < 0) {
	  console.trace('negative',prev,ar[i])
	  throw 'negetive';
	  break;
	}
	
	r[j++] = delta & 0x7f;
	delta >>= 7;
	while (delta > 0) {
	  r[j++] = (delta & 0x7f) | 0x80;
	  delta >>= 7;
	}
	prev = ar[i];
	i++;
  } while (i < ar.length);
  return r;
}
var Kfs=function(path,opts) {
	
	var handle=null;
	opts=opts||{};
	opts.size=opts.size||65536*2048; 
	console.log('kdb estimate size:',opts.size);
	var dbuf=new Buffer(opts.size);
	var cur=0;//dbuf cursor
	
	var writeSignature=function(value,pos) {
		dbuf.write(value,pos,value.length,'utf8');
		if (pos+value.length>cur) cur=pos+value.length;
		return value.length;
	}
	var writeOffset=function(value,pos) {
		dbuf.writeUInt8(Math.floor(value / (65536*65536)),pos);
		dbuf.writeUInt32BE( value & 0xFFFFFFFF,pos+1);
		if (pos+5>cur) cur=pos+5;
		return 5;
	}
	var writeString= function(value,pos,encoding) {
		encoding=encoding||'ucs2';
		if (value=="") throw "cannot write null string";
		if (encoding==='utf8')dbuf.write(DT.utf8,pos,1,'utf8');
		else if (encoding==='ucs2')dbuf.write(DT.ucs2,pos,1,'utf8');
		else throw 'unsupported encoding '+encoding;
			
		var len=Buffer.byteLength(value, encoding);
		dbuf.write(value,pos+1,len,encoding);
		
		if (pos+len+1>cur) cur=pos+len+1;
		return len+1; // signature
	}
	var writeStringArray = function(value,pos,encoding) {
		encoding=encoding||'ucs2';
		if (encoding==='utf8') dbuf.write(DT.utf8arr,pos,1,'utf8');
		else if (encoding==='ucs2')dbuf.write(DT.ucs2arr,pos,1,'utf8');
		else throw 'unsupported encoding '+encoding;
		
		var v=value.join('\0');
		var len=Buffer.byteLength(v, encoding);
		if (0===len) {
			throw "empty string array " + key_writing;
		}
		dbuf.write(v,pos+1,len,encoding);
		if (pos+len+1>cur) cur=pos+len+1;
		return len+1;
	}
	var writeI32=function(value,pos) {
		dbuf.write(DT.int32,pos,1,'utf8');
		dbuf.writeInt32BE(value,pos+1);
		if (pos+5>cur) cur=pos+5;
		return 5;
	}
	var writeUI8=function(value,pos) {
		dbuf.write(DT.uint8,pos,1,'utf8');
		dbuf.writeUInt8(value,pos+1);
		if (pos+2>cur) cur=pos+2;
		return 2;
	}
	var writeBool=function(value,pos) {
		dbuf.write(DT.bool,pos,1,'utf8');
		dbuf.writeUInt8(Number(value),pos+1);
		if (pos+2>cur) cur=pos+2;
		return 2;
	}		
	var writeBlob=function(value,pos) {
		dbuf.write(DT.blob,pos,1,'utf8');
		value.copy(dbuf, pos+1);
		var written=value.length+1;
		if (pos+written>cur) cur=pos+written;
		return written;
	}		
	/* no signature */
	var writeFixedArray = function(value,pos,unitsize) {
		//console.log('v.len',value.length,items.length,unitsize);
		if (unitsize===1) var func=dbuf.writeUInt8;
		else if (unitsize===4)var func=dbuf.writeInt32BE;
		else throw 'unsupported integer size';
		if (!value.length) {
			throw "empty fixed array "+key_writing;
		}
		for (var i = 0; i < value.length ; i++) {
			func.apply(dbuf,[value[i],i*unitsize+pos])
		}
		var len=unitsize*value.length;
		if (pos+len>cur) cur=pos+len;
		return len;
	}

	this.writeI32=writeI32;
	this.writeBool=writeBool;
	this.writeBlob=writeBlob;
	this.writeUI8=writeUI8;
	this.writeString=writeString;
	this.writeSignature=writeSignature;
	this.writeOffset=writeOffset; //5 bytes offset
	this.writeStringArray=writeStringArray;
	this.writeFixedArray=writeFixedArray;
	Object.defineProperty(this, "buf", {get : function(){ return dbuf; }});
	
	return this;
}

var Create=function(path,opts) {
	opts=opts||{};
	var kfs=new Kfs(path,opts);
	var cur=0;

	var handle={};
	
	//no signature
	var writeVInt =function(arr) {
		var o=pack_int(arr,false);
		kfs.writeFixedArray(o,cur,1);
		cur+=o.length;
	}
	var writeVInt1=function(value) {
		writeVInt([value]);
	}
	//for postings
	var writePInt =function(arr) {
		var o=pack_int(arr,true);
		kfs.writeFixedArray(o,cur,1);
		cur+=o.length;
	}
	
	var saveVInt = function(arr,key) {
		var start=cur;
		key_writing=key;
		cur+=kfs.writeSignature(DT.vint,cur);
		writeVInt(arr);
		var written = cur-start;
		pushitem(key,written);
		return written;		
	}
	var savePInt = function(arr,key) {
		var start=cur;
		key_writing=key;
		cur+=kfs.writeSignature(DT.pint,cur);
		writePInt(arr);
		var written = cur-start;
		pushitem(key,written);
		return written;	
	}

	
	var saveUI8 = function(value,key) {
		var written=kfs.writeUI8(value,cur);
		cur+=written;
		pushitem(key,written);
		return written;
	}
	var saveBool=function(value,key) {
		var written=kfs.writeBool(value,cur);
		cur+=written;
		pushitem(key,written);
		return written;
	}
	var saveI32 = function(value,key) {
		var written=kfs.writeI32(value,cur);
		cur+=written;
		pushitem(key,written);
		return written;
	}	
	var saveString = function(value,key,encoding) {
		encoding=encoding||stringencoding;
		key_writing=key;
		var written=kfs.writeString(value,cur,encoding);
		cur+=written;
		pushitem(key,written);
		return written;
	}
	var saveStringArray = function(arr,key,encoding) {
		encoding=encoding||stringencoding;
		key_writing=key;
		try {
			var written=kfs.writeStringArray(arr,cur,encoding);
		} catch(e) {
			throw e;
		}
		cur+=written;
		pushitem(key,written);
		return written;
	}
	
	var saveBlob = function(value,key) {
		key_writing=key;
		var written=kfs.writeBlob(value,cur);
		cur+=written;
		pushitem(key,written);
		return written;
	}

	var folders=[];
	var pushitem=function(key,written) {
		var folder=folders[folders.length-1];	
		if (!folder) return ;
		folder.itemslength.push(written);
		if (key) {
			if (!folder.keys) throw 'cannot have key in array';
			folder.keys.push(key);
		}
	}	
	var open = function(opt) {
		var start=cur;
		var key=opt.key || null;
		var type=opt.type||DT.array;
		cur+=kfs.writeSignature(type,cur);
		cur+=kfs.writeOffset(0x0,cur); // pre-alloc space for offset
		var folder={
			type:type, key:key,
			start:start,datastart:cur,
			itemslength:[] };
		if (type===DT.object) folder.keys=[];
		folders.push(folder);
	}
	var openObject = function(key) {
		open({type:DT.object,key:key});
	}
	var openArray = function(key) {
		open({type:DT.array,key:key});
	}
	var saveInts=function(arr,key,func) {
		func.apply(handle,[arr,key]);
	}
	var close = function(opt) {
		if (!folders.length) throw 'empty stack';
		var folder=folders.pop();
		//jump to lengths and keys
		kfs.writeOffset( cur-folder.datastart, folder.datastart-5);
		var itemcount=folder.itemslength.length;
		//save lengths
		writeVInt1(itemcount);
		writeVInt(folder.itemslength);
		
		if (folder.type===DT.object) {
			//use utf8 for keys
			cur+=kfs.writeStringArray(folder.keys,cur,'utf8');
		}
		written=cur-folder.start;
		pushitem(folder.key,written);
		return written;
	}
	
	
	var stringencoding='ucs2';
	var stringEncoding=function(newencoding) {
		if (newencoding) stringencoding=newencoding;
		else return stringencoding;
	}
	
	var allnumber_fast=function(arr) {
		if (arr.length<5) return allnumber(arr);
		if (typeof arr[0]=='number'
		    && Math.round(arr[0])==arr[0] && arr[0]>=0)
			return true;
		return false;
	}
	var allstring_fast=function(arr) {
		if (arr.length<5) return allstring(arr);
		if (typeof arr[0]=='string') return true;
		return false;
	}	
	var allnumber=function(arr) {
		for (var i=0;i<arr.length;i++) {
			if (typeof arr[i]!=='number') return false;
		}
		return true;
	}
	var allstring=function(arr) {
		for (var i=0;i<arr.length;i++) {
			if (typeof arr[i]!=='string') return false;
		}
		return true;
	}
	var getEncoding=function(key,encs) {
		var enc=encs[key];
		if (!enc) return null;
		if (enc=='delta' || enc=='posting') {
			return savePInt;
		} else if (enc=="variable") {
			return saveVInt;
		}
		return null;
	}
	var save=function(J,key,opts) {
		opts=opts||{};
		
		if (typeof J=="null" || typeof J=="undefined") {
			throw 'cannot save null value of ['+key+'] folders'+JSON.stringify(folders);
			return;
		}
		var type=J.constructor.name;
		if (type==='Object') {
			openObject(key);
			for (var i in J) {
				save(J[i],i,opts);
				if (opts.autodelete) delete J[i];
			}
			close();
		} else if (type==='Array') {
			if (allnumber_fast(J)) {
				if (J.sorted) { //number array is sorted
					saveInts(J,key,savePInt);	//posting delta format
				} else {
					saveInts(J,key,saveVInt);	
				}
			} else if (allstring_fast(J)) {
				saveStringArray(J,key);
			} else {
				openArray(key);
				for (var i=0;i<J.length;i++) {
					save(J[i],null,opts);
					if (opts.autodelete) delete J[i];
				}
				close();
			}
		} else if (type==='String') {
			saveString(J,key);
		} else if (type==='Number') {
			if (J>=0&&J<256) saveUI8(J,key);
			else saveI32(J,key);
		} else if (type==='Boolean') {
			saveBool(J,key);
		} else if (type==='Buffer') {
			saveBlob(J,key);
		} else {
			throw 'unsupported type '+type;
		}
	}
	
	var free=function() {
		while (folders.length) close();
		kfs.free();
	}
	var currentsize=function() {
		return cur;
	}

	Object.defineProperty(handle, "size", {get : function(){ return cur; }});

	var writeFile=function(fn,opts,cb) {
		if (typeof fs=="undefined") {
			var fs=opts.fs||require('fs');	
		}
		var totalbyte=handle.currentsize();
		var written=0,batch=0;
		
		if (typeof cb=="undefined" || typeof opts=="function") {
			cb=opts;
		}
		opts=opts||{};
		batchsize=opts.batchsize||1024*1024*16; //16 MB

		if (fs.existsSync(fn)) fs.unlinkSync(fn);

		var writeCb=function(total,written,cb,next) {
			return function(err) {
				if (err) throw "write error"+err;
				cb(total,written);
				batch++;
				next();
			}
		}

		var next=function() {
			if (batch<batches) {
				var bufstart=batchsize*batch;
				var bufend=bufstart+batchsize;
				if (bufend>totalbyte) bufend=totalbyte;
				var sliced=kfs.buf.slice(bufstart,bufend);
				written+=sliced.length;
				fs.appendFile(fn,sliced,writeCb(totalbyte,written, cb,next));
			}
		}
		var batches=1+Math.floor(handle.size/batchsize);
		next();
	}
	handle.free=free;
	handle.saveI32=saveI32;
	handle.saveUI8=saveUI8;
	handle.saveBool=saveBool;
	handle.saveString=saveString;
	handle.saveVInt=saveVInt;
	handle.savePInt=savePInt;
	handle.saveInts=saveInts;
	handle.saveBlob=saveBlob;
	handle.save=save;
	handle.openArray=openArray;
	handle.openObject=openObject;
	handle.stringEncoding=stringEncoding;
	//this.integerEncoding=integerEncoding;
	handle.close=close;
	handle.writeFile=writeFile;
	handle.currentsize=currentsize;
	return handle;
}

module.exports=Create;
},{"fs":false}],"/Users/yu/ksana2015/node_modules/ksana-search/boolsearch.js":[function(require,module,exports){
/*
  TODO
  and not

*/

// http://jsfiddle.net/neoswf/aXzWw/
var plist=require('./plist');
function intersect(I, J) {
  var i = j = 0;
  var result = [];

  while( i < I.length && j < J.length ){
     if      (I[i] < J[j]) i++; 
     else if (I[i] > J[j]) j++; 
     else {
       result[result.length]=l[i];
       i++;j++;
     }
  }
  return result;
}

/* return all items in I but not in J */
function subtract(I, J) {
  var i = j = 0;
  var result = [];

  while( i < I.length && j < J.length ){
    if (I[i]==J[j]) {
      i++;j++;
    } else if (I[i]<J[j]) {
      while (I[i]<J[j]) result[result.length]= I[i++];
    } else {
      while(J[j]<I[i]) j++;
    }
  }

  if (j==J.length) {
    while (i<I.length) result[result.length]=I[i++];
  }

  return result;
}

var union=function(a,b) {
	if (!a || !a.length) return b;
	if (!b || !b.length) return a;
    var result = [];
    var ai = 0;
    var bi = 0;
    while (true) {
        if ( ai < a.length && bi < b.length) {
            if (a[ai] < b[bi]) {
                result[result.length]=a[ai];
                ai++;
            } else if (a[ai] > b[bi]) {
                result[result.length]=b[bi];
                bi++;
            } else {
                result[result.length]=a[ai];
                result[result.length]=b[bi];
                ai++;
                bi++;
            }
        } else if (ai < a.length) {
            result.push.apply(result, a.slice(ai, a.length));
            break;
        } else if (bi < b.length) {
            result.push.apply(result, b.slice(bi, b.length));
            break;
        } else {
            break;
        }
    }
    return result;
}
var OPERATION={'include':intersect, 'union':union, 'exclude':subtract};

var boolSearch=function(opts) {
  opts=opts||{};
  ops=opts.op||this.opts.op;
  this.docs=[];
	if (!this.phrases.length) return;
	var r=this.phrases[0].docs;
  /* ignore operator of first phrase */
	for (var i=1;i<this.phrases.length;i++) {
		var op= ops[i] || 'union';
		r=OPERATION[op](r,this.phrases[i].docs);
	}
	this.docs=plist.unique(r);
	return this;
}
module.exports={search:boolSearch}
},{"./plist":"/Users/yu/ksana2015/node_modules/ksana-search/plist.js"}],"/Users/yu/ksana2015/node_modules/ksana-search/bsearch.js":[function(require,module,exports){
var indexOfSorted = function (array, obj, near) { 
  var low = 0,
  high = array.length;
  while (low < high) {
    var mid = (low + high) >> 1;
    if (array[mid]==obj) return mid;
    array[mid] < obj ? low = mid + 1 : high = mid;
  }
  if (near) return low;
  else if (array[low]==obj) return low;else return -1;
};
var indexOfSorted_str = function (array, obj, near) { 
  var low = 0,
  high = array.length;
  while (low < high) {
    var mid = (low + high) >> 1;
    if (array[mid]==obj) return mid;
    (array[mid].localeCompare(obj)<0) ? low = mid + 1 : high = mid;
  }
  if (near) return low;
  else if (array[low]==obj) return low;else return -1;
};


var bsearch=function(array,value,near) {
	var func=indexOfSorted;
	if (typeof array[0]=="string") func=indexOfSorted_str;
	return func(array,value,near);
}
var bsearchNear=function(array,value) {
	return bsearch(array,value,true);
}

module.exports=bsearch;//{bsearchNear:bsearchNear,bsearch:bsearch};
},{}],"/Users/yu/ksana2015/node_modules/ksana-search/excerpt.js":[function(require,module,exports){
var plist=require("./plist");

var getPhraseWidths=function (Q,phraseid,vposs) {
	var res=[];
	for (var i in vposs) {
		res.push(getPhraseWidth(Q,phraseid,vposs[i]));
	}
	return res;
}
var getPhraseWidth=function (Q,phraseid,vpos) {
	var P=Q.phrases[phraseid];
	var width=0,varwidth=false;
	if (P.width) return P.width; // no wildcard
	if (P.termid.length<2) return P.termlength[0];
	var lasttermposting=Q.terms[P.termid[P.termid.length-1]].posting;

	for (var i in P.termid) {
		var T=Q.terms[P.termid[i]];
		if (T.op=='wildcard') {
			width+=T.width;
			if (T.wildcard=='*') varwidth=true;
		} else {
			width+=P.termlength[i];
		}
	}
	if (varwidth) { //width might be smaller due to * wildcard
		var at=plist.indexOfSorted(lasttermposting,vpos);
		var endpos=lasttermposting[at];
		if (endpos-vpos<width) width=endpos-vpos+1;
	}

	return width;
}
/* return [vpos, phraseid, phrasewidth, optional_tagname] by slot range*/
var hitInRange=function(Q,startvpos,endvpos) {
	var res=[];
	if (!Q || !Q.rawresult || !Q.rawresult.length) return res;
	for (var i=0;i<Q.phrases.length;i++) {
		var P=Q.phrases[i];
		if (!P.posting) continue;
		var s=plist.indexOfSorted(P.posting,startvpos);
		var e=plist.indexOfSorted(P.posting,endvpos);
		var r=P.posting.slice(s,e+1);
		var width=getPhraseWidths(Q,i,r);

		res=res.concat(r.map(function(vpos,idx){ return [vpos,width[idx],i] }));
	}
	// order by vpos, if vpos is the same, larger width come first.
	// so the output will be
	// <tag1><tag2>one</tag2>two</tag1>
	//TODO, might cause overlap if same vpos and same width
	//need to check tag name
	res.sort(function(a,b){return a[0]==b[0]? b[1]-a[1] :a[0]-b[0]});

	return res;
}

var tagsInRange=function(Q,renderTags,startvpos,endvpos) {
	var res=[];
	if (typeof renderTags=="string") renderTags=[renderTags];

	renderTags.map(function(tag){
		var starts=Q.engine.get(["fields",tag+"_start"]);
		var ends=Q.engine.get(["fields",tag+"_end"]);
		if (!starts) return;

		var s=plist.indexOfSorted(starts,startvpos);
		var e=s;
		while (e<starts.length && starts[e]<endvpos) e++;
		var opentags=starts.slice(s,e);

		s=plist.indexOfSorted(ends,startvpos);
		e=s;
		while (e<ends.length && ends[e]<endvpos) e++;
		var closetags=ends.slice(s,e);

		opentags.map(function(start,idx) {
			res.push([start,closetags[idx]-start,tag]);
		})
	});
	// order by vpos, if vpos is the same, larger width come first.
	res.sort(function(a,b){return a[0]==b[0]? b[1]-a[1] :a[0]-b[0]});

	return res;
}

/*
given a vpos range start, file, convert to filestart, fileend
   filestart : starting file
   start   : vpos start
   showfile: how many files to display
   showpage: how many pages to display

output:
   array of fileid with hits
*/
var getFileWithHits=function(engine,Q,range) {
	var fileOffsets=engine.get("fileoffsets");
	var out=[],filecount=100;
	var start=0 , end=Q.byFile.length;
	Q.excerptOverflow=false;
	if (range.start) {
		var first=range.start ;
		var last=range.end;
		if (!last) last=Number.MAX_SAFE_INTEGER;
		for (var i=0;i<fileOffsets.length;i++) {
			//if (fileOffsets[i]>first) break;
			if (fileOffsets[i]>last) {
				end=i;
				break;
			}
			if (fileOffsets[i]<first) start=i;
		}		
	} else {
		start=range.filestart || 0;
		if (range.maxfile) {
			filecount=range.maxfile;
		} else if (range.showseg) {
			throw "not implement yet"
		}
	}

	var fileWithHits=[],totalhit=0;
	range.maxhit=range.maxhit||1000;

	for (var i=start;i<end;i++) {
		if(Q.byFile[i].length>0) {
			totalhit+=Q.byFile[i].length;
			fileWithHits.push(i);
			range.nextFileStart=i;
			if (fileWithHits.length>=filecount) {
				Q.excerptOverflow=true;
				break;
			}
			if (totalhit>range.maxhit) {
				Q.excerptOverflow=true;
				break;
			}
		}
	}
	if (i>=end) { //no more file
		Q.excerptStop=true;
	}
	return fileWithHits;
}
var resultlist=function(engine,Q,opts,cb) {
	var output=[];
	if (!Q.rawresult || !Q.rawresult.length) {
		cb(output);
		return;
	}

	if (opts.range) {
		if (opts.range.maxhit && !opts.range.maxfile) {
			opts.range.maxfile=opts.range.maxhit;
			opts.range.maxseg=opts.range.maxhit;
		}
		if (!opts.range.maxseg) opts.range.maxseg=100;
		if (!opts.range.end) {
			opts.range.end=Number.MAX_SAFE_INTEGER;
		}
	}
	var fileWithHits=getFileWithHits(engine,Q,opts.range);
	if (!fileWithHits.length) {
		cb(output);
		return;
	}

	var output=[],files=[];//temporary holder for segnames
	for (var i=0;i<fileWithHits.length;i++) {
		var nfile=fileWithHits[i];
		var segoffsets=engine.getFileSegOffsets(nfile);
		var segnames=engine.getFileSegNames(nfile);
		files[nfile]={segoffsets:segoffsets};
		var segwithhit=plist.groupbyposting2(Q.byFile[ nfile ],  segoffsets);
		//if (segoffsets[0]==1)
		//segwithhit.shift(); //the first item is not used (0~Q.byFile[0] )

		for (var j=0; j<segwithhit.length;j++) {
			if (!segwithhit[j].length) continue;
			//var offsets=segwithhit[j].map(function(p){return p- fileOffsets[i]});
			if (segoffsets[j]>opts.range.end) break;
			output.push(  {file: nfile, seg:j,  segname:segnames[j]});
			if (output.length>opts.range.maxseg) break;
		}
	}

	var segpaths=output.map(function(p){
		return ["filecontents",p.file,p.seg];
	});
	//prepare the text
	engine.get(segpaths,function(segs){
		var seq=0;
		if (segs) for (var i=0;i<segs.length;i++) {
			var startvpos=files[output[i].file].segoffsets[output[i].seg-1] ||0;
			var endvpos=files[output[i].file].segoffsets[output[i].seg];
			var hl={};

			if (opts.range && opts.range.start  ) {
				if ( startvpos<opts.range.start) startvpos=opts.range.start;
			//	if (endvpos>opts.range.end) endvpos=opts.range.end;
			}
			
			if (opts.nohighlight) {
				hl.text=segs[i];
				hl.hits=hitInRange(Q,startvpos,endvpos);
			} else {
				var o={nocrlf:true,nospan:true,
					text:segs[i],startvpos:startvpos, endvpos: endvpos, 
					Q:Q,fulltext:opts.fulltext};
				hl=highlight(Q,o);
			}
			if (hl.text) {
				output[i].text=hl.text;
				output[i].hits=hl.hits;
				output[i].seq=seq;
				seq+=hl.hits.length;

				output[i].start=startvpos;				
			} else {
				output[i]=null; //remove item vpos less than opts.range.start
			}
		} 
		output=output.filter(function(o){return o!=null});
		cb(output);
	});
}
var injectTag=function(Q,opts){
	var hits=opts.hits;
	var tags=opts.tags;
	if (!tags) tags=[];
	var hitclass=opts.hitclass||'hl';
	var output='',O=[],j=0,k=0;
	var surround=opts.surround||5;

	var tokens=Q.tokenize(opts.text).tokens;
	var vpos=opts.vpos;
	var i=0,previnrange=!!opts.fulltext ,inrange=!!opts.fulltext;
	var hitstart=0,hitend=0,tagstart=0,tagend=0,tagclass="";
	while (i<tokens.length) {
		var skip=Q.isSkip(tokens[i]);
		var hashit=false;
		inrange=opts.fulltext || (j<hits.length && vpos+surround>=hits[j][0] ||
				(j>0 && j<=hits.length &&  hits[j-1][0]+surround*2>=vpos));	

		if (previnrange!=inrange) {
			output+=opts.abridge||"...";
		}
		previnrange=inrange;
		var token=tokens[i];
		if (opts.nocrlf && token=="\n") token="";

		if (inrange && i<tokens.length) {
			if (skip) {
				output+=token;
			} else {
				var classes="";	

				//check hit
				if (j<hits.length && vpos==hits[j][0]) {
					var nphrase=hits[j][2] % 10, width=hits[j][1];
					hitstart=hits[j][0];
					hitend=hitstart+width;
					j++;
				}

				//check tag
				if (k<tags.length && vpos==tags[k][0]) {
					var width=tags[k][1];
					tagstart=tags[k][0];
					tagend=tagstart+width;
					tagclass=tags[k][2];
					k++;
				}

				if (vpos>=hitstart && vpos<hitend) classes=hitclass+" "+hitclass+nphrase;
				if (vpos>=tagstart && vpos<tagend) classes+=" "+tagclass;

				if (classes || !opts.nospan) {
					output+='<span vpos="'+vpos+'"';
					if (classes) classes=' class="'+classes+'"';
					output+=classes+'>';
					output+=token+'</span>';
				} else {
					output+=token;
				}
			}
		}
		if (!skip) vpos++;
		i++; 
	}

	O.push(output);
	output="";

	return O.join("");
}
var highlight=function(Q,opts) {
	if (!opts.text) return {text:"",hits:[]};
	var opt={text:opts.text,
		hits:null,abridge:opts.abridge,vpos:opts.startvpos,
		fulltext:opts.fulltext,renderTags:opts.renderTags,nospan:opts.nospan,nocrlf:opts.nocrlf,
	};

	opt.hits=hitInRange(opts.Q,opts.startvpos,opts.endvpos);
	return {text:injectTag(Q,opt),hits:opt.hits};
}

var getSeg=function(engine,fileid,segid,opts,cb,context) {
	if (typeof opts=="function") {
		context=cb;
		cb=opts;
		opts={};
	}

	var fileOffsets=engine.get("fileoffsets");
	var segpaths=["filecontents",fileid,segid];
	var segnames=engine.getFileSegNames(fileid);

	engine.get(segpaths,function(text){
		//if (opts.span) text=addspan.apply(engine,[text]);
		cb.apply(context||engine.context,[{text:text,file:fileid,seg:segid,segname:segnames[segid]}]);
	});
}

var getSegSync=function(engine,fileid,segid) {
	var fileOffsets=engine.get("fileoffsets");
	var segpaths=["filecontents",fileid,segid];
	var segnames=engine.getFileSegNames(fileid);

	var text=engine.get(segpaths);
	return {text:text,file:fileid,seg:segid,segname:segnames[segid]};
}

var getRange=function(engine,start,end,cb) {
	var fileoffsets=engine.get("fileoffsets");
	//var pagepaths=["fileContents",];
	//find first page and last page
	//create get paths

}

var getFile=function(engine,fileid,cb) {
	var filename=engine.get("filenames")[fileid];
	var segnames=engine.getFileSegNames(fileid);
	var filestart=engine.get("fileoffsets")[fileid];
	var offsets=engine.getFileSegOffsets(fileid);
	var pc=0;
	engine.get(["fileContents",fileid],true,function(data){
		var text=data.map(function(t,idx) {
			if (idx==0) return ""; 
			var pb='<pb n="'+segnames[idx]+'"></pb>';
			return pb+t;
		});
		cb({texts:data,text:text.join(""),segnames:segnames,filestart:filestart,offsets:offsets,file:fileid,filename:filename}); //force different token
	});
}

var highlightRange=function(Q,startvpos,endvpos,opts,cb){
	//not implement yet
}

var highlightFile=function(Q,fileid,opts,cb) {
	if (typeof opts=="function") {
		cb=opts;
	}

	if (!Q || !Q.engine) return cb(null);

	var segoffsets=Q.engine.getFileSegOffsets(fileid);
	var output=[];	
	//console.log(startvpos,endvpos)
	Q.engine.get(["fileContents",fileid],true,function(data){
		if (!data) {
			console.error("wrong file id",fileid);
		} else {
			for (var i=0;i<data.length-1;i++ ){
				var startvpos=segoffsets[i];
				var endvpos=segoffsets[i+1];
				var segnames=Q.engine.getFileSegNames(fileid);
				var seg=getSegSync(Q.engine, fileid,i+1);
					var opt={text:seg.text,hits:null,tag:'hl',vpos:startvpos,
					fulltext:true,nospan:opts.nospan,nocrlf:opts.nocrlf};
				var segname=segnames[i+1];
				opt.hits=hitInRange(Q,startvpos,endvpos);
				var pb='<pb n="'+segname+'"></pb>';
				var withtag=injectTag(Q,opt);
				output.push(pb+withtag);
			}			
		}

		cb.apply(Q.engine.context,[{text:output.join(""),file:fileid}]);
	})
}
var highlightSeg=function(Q,fileid,segid,opts,cb,context) {
	if (typeof opts=="function") {
		cb=opts;
	}

	if (!Q || !Q.engine) return cb.apply(context,[null]);
	var segoffsets=Q.engine.getFileSegOffsets(fileid);
	var startvpos=segoffsets[segid-1];
	var endvpos=segoffsets[segid];
	var segnames=Q.engine.getFileSegNames(fileid);

	this.getSeg(Q.engine,fileid,segid,function(res){
		var opt={text:res.text,hits:null,vpos:startvpos,fulltext:true,
			nospan:opts.nospan,nocrlf:opts.nocrlf};
		opt.hits=hitInRange(Q,startvpos,endvpos);
		if (opts.renderTags) {
			opt.tags=tagsInRange(Q,opts.renderTags,startvpos,endvpos);
		}

		var segname=segnames[segid];
		cb.apply(context||Q.engine.context,[{text:injectTag(Q,opt),seg:segid,file:fileid,hits:opt.hits,segname:segname}]);
	});
}
module.exports={resultlist:resultlist, 
	hitInRange:hitInRange, 
	highlightSeg:highlightSeg,
	getSeg:getSeg,
	highlightFile:highlightFile,
	getFile:getFile
	//highlightRange:highlightRange,
  //getRange:getRange,
};
},{"./plist":"/Users/yu/ksana2015/node_modules/ksana-search/plist.js"}],"/Users/yu/ksana2015/node_modules/ksana-search/index.js":[function(require,module,exports){
/*
  Ksana Search Engine.

  need a KDE instance to be functional
  
*/
var bsearch=require("./bsearch");
var dosearch=require("./search");

var prepareEngineForSearch=function(engine,cb){
	if (engine.analyzer) {
		cb();
		return;
	}
	var analyzer=require("ksana-analyzer");
	var config=engine.get("meta").config;
	engine.analyzer=analyzer.getAPI(config);
	engine.get([["tokens"],["postingslength"]],function(){
		cb();
	});
}

var _search=function(engine,q,opts,cb,context) {
	if (typeof engine=="string") {//browser only
		var kde=require("ksana-database");
		if (typeof opts=="function") { //user didn't supply options
			if (typeof cb=="object")context=cb;
			cb=opts;
			opts={};
		}
		opts.q=q;
		opts.dbid=engine;
		kde.open(opts.dbid,function(err,db){
			if (err) {
				cb(err);
				return;
			}
			console.log("opened",opts.dbid)
			prepareEngineForSearch(db,function(){
				return dosearch(db,q,opts,cb);	
			});
		},context);
	} else {
		prepareEngineForSearch(engine,function(){
			return dosearch(engine,q,opts,cb);	
		});
	}
}

var _highlightSeg=function(engine,fileid,segid,opts,cb,context){
	if (!opts.q) {
		api.excerpt.getSeg(engine,fileid,segid,opts,cb,context);
	} else {
		_search(engine,opts.q,opts,function(err,Q){
			api.excerpt.highlightSeg(Q,fileid,segid,opts,cb,context);
		});			
	}
}
var _highlightRange=function(engine,start,end,opts,cb,context){

	if (opts.q) {
		_search(engine,opts.q,opts,function(Q){
			api.excerpt.highlightRange(Q,start,end,opts,cb,context);
		});
	} else {
		prepareEngineForSearch(engine,function(){
			api.excerpt.getRange(engine,start,end,cb,context);
		});
	}
}
var _highlightFile=function(engine,fileid,opts,cb){
	if (!opts.q) opts.q=""; 
	_search(engine,opts.q,opts,function(Q){
		api.excerpt.highlightFile(Q,fileid,opts,cb);
	});
	/*
	} else {
		api.excerpt.getFile(engine,fileid,function(data) {
			cb.apply(engine.context,[data]);
		});
	}
	*/
}

var vpos2fileseg=function(engine,vpos) {
    var segoffsets=engine.get("segoffsets");
    var fileoffsets=engine.get(["fileoffsets"]);
    var segnames=engine.get("segnames");
    var fileid=bsearch(fileoffsets,vpos+1,true);
    fileid--;
    var segid=bsearch(segoffsets,vpos+1,true);
	var range=engine.getFileRange(fileid);
	segid-=range.start;
    return {file:fileid,seg:segid};
}
var api={
	search:_search
//	,concordance:require("./concordance")
//	,regex:require("./regex")
	,highlightSeg:_highlightSeg
	,highlightFile:_highlightFile
//	,highlightRange:_highlightRange
	,excerpt:require("./excerpt")
	,vpos2fileseg:vpos2fileseg
}
module.exports=api;
},{"./bsearch":"/Users/yu/ksana2015/node_modules/ksana-search/bsearch.js","./excerpt":"/Users/yu/ksana2015/node_modules/ksana-search/excerpt.js","./search":"/Users/yu/ksana2015/node_modules/ksana-search/search.js","ksana-analyzer":"/Users/yu/ksana2015/node_modules/ksana-analyzer/index.js","ksana-database":"/Users/yu/ksana2015/node_modules/ksana-database/index.js"}],"/Users/yu/ksana2015/node_modules/ksana-search/plist.js":[function(require,module,exports){

var unpack = function (ar) { // unpack variable length integer list
  var r = [],
  i = 0,
  v = 0;
  do {
	var shift = 0;
	do {
	  v += ((ar[i] & 0x7F) << shift);
	  shift += 7;
	} while (ar[++i] & 0x80);
	r[r.length]=v;
  } while (i < ar.length);
  return r;
}

/*
   arr:  [1,1,1,1,1,1,1,1,1]
   levels: [0,1,1,2,2,0,1,2]
   output: [5,1,3,1,1,3,1,1]
*/

var groupsum=function(arr,levels) {
  if (arr.length!=levels.length+1) return null;
  var stack=[];
  var output=new Array(levels.length);
  for (var i=0;i<levels.length;i++) output[i]=0;
  for (var i=1;i<arr.length;i++) { //first one out of toc scope, ignored
    if (stack.length>levels[i-1]) {
      while (stack.length>levels[i-1]) stack.pop();
    }
    stack.push(i-1);
    for (var j=0;j<stack.length;j++) {
      output[stack[j]]+=arr[i];
    }
  }
  return output;
}
/* arr= 1 , 2 , 3 ,4 ,5,6,7 //token posting
  posting= 3 , 5  //tag posting
  out = 3 , 2, 2
*/
var countbyposting = function (arr, posting) {
  if (!posting.length) return [arr.length];
  var out=[];
  for (var i=0;i<posting.length;i++) out[i]=0;
  out[posting.length]=0;
  var p=0,i=0,lasti=0;
  while (i<arr.length && p<posting.length) {
    if (arr[i]<=posting[p]) {
      while (p<posting.length && i<arr.length && arr[i]<=posting[p]) {
        out[p]++;
        i++;
      }      
    } 
    p++;
  }
  out[posting.length] = arr.length-i; //remaining
  return out;
}

var groupbyposting=function(arr,gposting) { //relative vpos
  if (!gposting.length) return [arr.length];
  var out=[];
  for (var i=0;i<=gposting.length;i++) out[i]=[];
  
  var p=0,i=0,lasti=0;
  while (i<arr.length && p<gposting.length) {
    if (arr[i]<gposting[p]) {
      while (p<gposting.length && i<arr.length && arr[i]<gposting[p]) {
        var start=0;
        if (p>0) start=gposting[p-1];
        out[p].push(arr[i++]-start);  // relative
      }      
    } 
    p++;
  }
  //remaining
  while(i<arr.length) out[out.length-1].push(arr[i++]-gposting[gposting.length-1]);
  return out;
}
var groupbyposting2=function(arr,gposting) { //absolute vpos
  if (!arr || !arr.length) return [];
  if (!gposting.length) return [arr.length];
  var out=[];
  for (var i=0;i<=gposting.length;i++) out[i]=[];
  
  var p=0,i=0,lasti=0;
  while (i<arr.length && p<gposting.length) {
    if (arr[i]<gposting[p]) {
      while (p<gposting.length && i<arr.length && arr[i]<gposting[p]) {
        var start=0;
        if (p>0) start=gposting[p-1]; //absolute
        out[p].push(arr[i++]);
      }      
    } 
    p++;
  }
  //remaining
  while(i<arr.length) out[out.length-1].push(arr[i++]-gposting[gposting.length-1]);
  return out;
}
var groupbyblock2 = function(ar, ntoken,slotshift,opts) {
  if (!ar.length) return [{},{}];
  
  slotshift = slotshift || 16;
  var g = Math.pow(2,slotshift);
  var i = 0;
  var r = {}, ntokens={};
  var groupcount=0;
  do {
    var group = Math.floor(ar[i] / g) ;
    if (!r[group]) {
      r[group] = [];
      ntokens[group]=[];
      groupcount++;
    }
    r[group].push(ar[i] % g);
    ntokens[group].push(ntoken[i]);
    i++;
  } while (i < ar.length);
  if (opts) opts.groupcount=groupcount;
  return [r,ntokens];
}
var groupbyslot = function (ar, slotshift, opts) {
  if (!ar.length)
	return {};
  
  slotshift = slotshift || 16;
  var g = Math.pow(2,slotshift);
  var i = 0;
  var r = {};
  var groupcount=0;
  do {
	var group = Math.floor(ar[i] / g) ;
	if (!r[group]) {
	  r[group] = [];
	  groupcount++;
	}
	r[group].push(ar[i] % g);
	i++;
  } while (i < ar.length);
  if (opts) opts.groupcount=groupcount;
  return r;
}
/*
var identity = function (value) {
  return value;
};
var sortedIndex = function (array, obj, iterator) { //taken from underscore
  iterator || (iterator = identity);
  var low = 0,
  high = array.length;
  while (low < high) {
	var mid = (low + high) >> 1;
	iterator(array[mid]) < iterator(obj) ? low = mid + 1 : high = mid;
  }
  return low;
};*/

var indexOfSorted = function (array, obj) { 
  var low = 0,
  high = array.length-1;
  while (low < high) {
    var mid = (low + high) >> 1;
    array[mid] < obj ? low = mid + 1 : high = mid;
  }
  return low;
};
var plhead=function(pl, pltag, opts) {
  opts=opts||{};
  opts.max=opts.max||1;
  var out=[];
  if (pltag.length<pl.length) {
    for (var i=0;i<pltag.length;i++) {
       k = indexOfSorted(pl, pltag[i]);
       if (k>-1 && k<pl.length) {
        if (pl[k]==pltag[i]) {
          out[out.length]=pltag[i];
          if (out.length>=opts.max) break;
        }
      }
    }
  } else {
    for (var i=0;i<pl.length;i++) {
       k = indexOfSorted(pltag, pl[i]);
       if (k>-1 && k<pltag.length) {
        if (pltag[k]==pl[i]) {
          out[out.length]=pltag[k];
          if (out.length>=opts.max) break;
        }
      }
    }
  }
  return out;
}
/*
 pl2 occur after pl1, 
 pl2>=pl1+mindis
 pl2<=pl1+maxdis
*/
var plfollow2 = function (pl1, pl2, mindis, maxdis) {
  var r = [],i=0;
  var swap = 0;
  
  while (i<pl1.length){
    var k = indexOfSorted(pl2, pl1[i] + mindis);
    var t = (pl2[k] >= (pl1[i] +mindis) && pl2[k]<=(pl1[i]+maxdis)) ? k : -1;
    if (t > -1) {
      r[r.length]=pl1[i];
      i++;
    } else {
      if (k>=pl2.length) break;
      var k2=indexOfSorted (pl1,pl2[k]-maxdis);
      if (k2>i) {
        var t = (pl2[k] >= (pl1[i] +mindis) && pl2[k]<=(pl1[i]+maxdis)) ? k : -1;
        if (t>-1) r[r.length]=pl1[k2];
        i=k2;
      } else break;
    }
  }
  return r;
}

var plnotfollow2 = function (pl1, pl2, mindis, maxdis) {
  var r = [],i=0;
  
  while (i<pl1.length){
    var k = indexOfSorted(pl2, pl1[i] + mindis);
    var t = (pl2[k] >= (pl1[i] +mindis) && pl2[k]<=(pl1[i]+maxdis)) ? k : -1;
    if (t > -1) {
      i++;
    } else {
      if (k>=pl2.length) {
        r=r.concat(pl1.slice(i));
        break;
      } else {
        var k2=indexOfSorted (pl1,pl2[k]-maxdis);
        if (k2>i) {
          r=r.concat(pl1.slice(i,k2));
          i=k2;
        } else break;
      }
    }
  }
  return r;
}
/* this is incorrect */
var plfollow = function (pl1, pl2, distance) {
  var r = [],i=0;

  while (i<pl1.length){
    var k = indexOfSorted(pl2, pl1[i] + distance);
    var t = (pl2[k] === (pl1[i] + distance)) ? k : -1;
    if (t > -1) {
      r.push(pl1[i]);
      i++;
    } else {
      if (k>=pl2.length) break;
      var k2=indexOfSorted (pl1,pl2[k]-distance);
      if (k2>i) {
        t = (pl2[k] === (pl1[k2] + distance)) ? k : -1;
        if (t>-1) {
           r.push(pl1[k2]);
           k2++;
        }
        i=k2;
      } else break;
    }
  }
  return r;
}
var plnotfollow = function (pl1, pl2, distance) {
  var r = [];
  var r = [],i=0;
  var swap = 0;
  
  while (i<pl1.length){
    var k = indexOfSorted(pl2, pl1[i] + distance);
    var t = (pl2[k] === (pl1[i] + distance)) ? k : -1;
    if (t > -1) { 
      i++;
    } else {
      if (k>=pl2.length) {
        r=r.concat(pl1.slice(i));
        break;
      } else {
        var k2=indexOfSorted (pl1,pl2[k]-distance);
        if (k2>i) {
          r=r.concat(pl1.slice(i,k2));
          i=k2;
        } else break;
      }
    }
  }
  return r;
}
var pland = function (pl1, pl2, distance) {
  var r = [];
  var swap = 0;
  
  if (pl1.length > pl2.length) { //swap for faster compare
    var t = pl2;
    pl2 = pl1;
    pl1 = t;
    swap = distance;
    distance = -distance;
  }
  for (var i = 0; i < pl1.length; i++) {
    var k = indexOfSorted(pl2, pl1[i] + distance);
    var t = (pl2[k] === (pl1[i] + distance)) ? k : -1;
    if (t > -1) {
      r.push(pl1[i] - swap);
    }
  }
  return r;
}
var combine=function (postings) {
  var out=[];
  for (var i in postings) {
    out=out.concat(postings[i]);
  }
  out.sort(function(a,b){return a-b});
  return out;
}

var unique = function(ar){
   if (!ar || !ar.length) return [];
   var u = {}, a = [];
   for(var i = 0, l = ar.length; i < l; ++i){
    if(u.hasOwnProperty(ar[i])) continue;
    a.push(ar[i]);
    u[ar[i]] = 1;
   }
   return a;
}



var plphrase = function (postings,ops) {
  var r = [];
  for (var i=0;i<postings.length;i++) {
  	if (!postings[i])  return [];
  	if (0 === i) {
  	  r = postings[0];
  	} else {
      if (ops[i]=='andnot') {
        r = plnotfollow(r, postings[i], i);  
      }else {
        r = pland(r, postings[i], i);  
      }
  	}
  }
  
  return r;
}
//return an array of group having any of pl item
var matchPosting=function(pl,gupl,start,end) {
  start=start||0;
  end=end||-1;
  if (end==-1) end=Math.pow(2, 53); // max integer value

  var count=0, i = j= 0,  result = [] ,v=0;
  var docs=[], freq=[];
  if (!pl) return {docs:[],freq:[]};
  while( i < pl.length && j < gupl.length ){
     if (pl[i] < gupl[j] ){ 
       count++;
       v=pl[i];
       i++; 
     } else {
       if (count) {
        if (v>=start && v<end) {
          docs.push(j);
          freq.push(count);          
        }
       }
       j++;
       count=0;
     }
  }
  if (count && j<gupl.length && v>=start && v<end) {
    docs.push(j);
    freq.push(count);
    count=0;
  }
  else {
    while (j==gupl.length && i<pl.length && pl[i] >= gupl[gupl.length-1]) {
      i++;
      count++;
    }
    if (v>=start && v<end) {
      docs.push(j);
      freq.push(count);      
    }
  } 
  return {docs:docs,freq:freq};
}

var trim=function(arr,start,end) {
  var s=indexOfSorted(arr,start);
  var e=indexOfSorted(arr,end);
  return arr.slice(s,e+1);
}
var plist={};
plist.unpack=unpack;
plist.plphrase=plphrase;
plist.plhead=plhead;
plist.plfollow2=plfollow2;
plist.plnotfollow2=plnotfollow2;
plist.plfollow=plfollow;
plist.plnotfollow=plnotfollow;
plist.unique=unique;
plist.indexOfSorted=indexOfSorted;
plist.matchPosting=matchPosting;
plist.trim=trim;

plist.groupbyslot=groupbyslot;
plist.groupbyblock2=groupbyblock2;
plist.countbyposting=countbyposting;
plist.groupbyposting=groupbyposting;
plist.groupbyposting2=groupbyposting2;
plist.groupsum=groupsum;
plist.combine=combine;
module.exports=plist;
},{}],"/Users/yu/ksana2015/node_modules/ksana-search/search.js":[function(require,module,exports){
/*
var dosearch2=function(engine,opts,cb,context) {
	opts
		nfile,npage  //return a highlighted page
		nfile,[pages] //return highlighted pages 
		nfile        //return entire highlighted file
		abs_npage
		[abs_pages]  //return set of highlighted pages (may cross file)

		filename, pagename
		filename,[pagenames]

		excerpt      //
	    sortBy       //default natural, sortby by vsm ranking

	//return err,array_of_string ,Q  (Q contains low level search result)
}

*/
/* TODO sorted tokens */
var plist=require("./plist");
var boolsearch=require("./boolsearch");
var excerpt=require("./excerpt");
var parseTerm = function(engine,raw,opts) {
	if (!raw) return;
	var res={raw:raw,variants:[],term:'',op:''};
	var term=raw, op=0;
	var firstchar=term[0];
	var termregex="";
	if (firstchar=='-') {
		term=term.substring(1);
		firstchar=term[0];
		res.exclude=true; //exclude
	}
	term=term.trim();
	var lastchar=term[term.length-1];
	term=engine.analyzer.normalize(term);
	
	if (term.indexOf("%")>-1) {
		var termregex="^"+term.replace(/%+/g,".+")+"$";
		if (firstchar=="%") 	termregex=".+"+termregex.substr(1);
		if (lastchar=="%") 	termregex=termregex.substr(0,termregex.length-1)+".+";
	}

	if (termregex) {
		res.variants=expandTerm(engine,termregex);
	}

	res.key=term;
	return res;
}
var expandTerm=function(engine,regex) {
	var r=new RegExp(regex);
	var tokens=engine.get("tokens");
	var postingsLength=engine.get("postingslength");
	if (!postingsLength) postingsLength=[];
	var out=[];
	for (var i=0;i<tokens.length;i++) {
		var m=tokens[i].match(r);
		if (m) {
			out.push([m[0],postingsLength[i]||1]);
		}
	}
	out.sort(function(a,b){return b[1]-a[1]});
	return out;
}
var isWildcard=function(raw) {
	return !!raw.match(/[\*\?]/);
}

var isOrTerm=function(term) {
	term=term.trim();
	return (term[term.length-1]===',');
}
var orterm=function(engine,term,key) {
		var t={text:key};
		if (engine.analyzer.simplifiedToken) {
			t.simplified=engine.analyzer.simplifiedToken(key);
		}
		term.variants.push(t);
}
var orTerms=function(engine,tokens,now) {
	var raw=tokens[now];
	var term=parseTerm(engine,raw);
	if (!term) return;
	orterm(engine,term,term.key);
	while (isOrTerm(raw))  {
		raw=tokens[++now];
		var term2=parseTerm(engine,raw);
		orterm(engine,term,term2.key);
		for (var i in term2.variants){
			term.variants[i]=term2.variants[i];
		}
		term.key+=','+term2.key;
	}
	return term;
}

var getOperator=function(raw) {
	var op='';
	if (raw[0]=='+') op='include';
	if (raw[0]=='-') op='exclude';
	return op;
}
var parsePhrase=function(q) {
	var match=q.match(/(".+?"|'.+?'|\S+)/g)
	match=match.map(function(str){
		var n=str.length, h=str.charAt(0), t=str.charAt(n-1)
		if (h===t&&(h==='"'|h==="'")) str=str.substr(1,n-2)
		return str;
	})
	return match;
}
var tibetanNumber={
	"\u0f20":"0","\u0f21":"1","\u0f22":"2",	"\u0f23":"3",	"\u0f24":"4",
	"\u0f25":"5","\u0f26":"6","\u0f27":"7","\u0f28":"8","\u0f29":"9"
}
var parseNumber=function(raw) {
	var n=parseInt(raw,10);
	if (isNaN(n)){
		var converted=[];
		for (var i=0;i<raw.length;i++) {
			var nn=tibetanNumber[raw[i]];
			if (typeof nn !="undefined") converted[i]=nn;
			else break;
		}
		return parseInt(converted,10);
	} else {
		return n;
	}
}
var parseWildcard=function(raw) {
	var n=parseNumber(raw) || 1;
	var qcount=raw.split('?').length-1;
	var scount=raw.split('*').length-1;
	var type='';
	if (qcount) type='?';
	else if (scount) type='*';
	return {wildcard:type, width: n , op:'wildcard'};
}

var newPhrase=function() {
	return {termid:[],posting:[],raw:'',termlength:[]};
} 
var parseQuery=function(q,sep) {
	if (sep && q.indexOf(sep)>-1) {
		var match=q.split(sep);
	} else {
		var match=q.match(/(".+?"|'.+?'|\S+)/g)
		match=match.map(function(str){
			var n=str.length, h=str.charAt(0), t=str.charAt(n-1)
			if (h===t&&(h==='"'|h==="'")) str=str.substr(1,n-2)
			return str
		})
		//console.log(input,'==>',match)		
	}
	return match;
}
var loadPhrase=function(phrase) {
	/* remove leading and ending wildcard */
	var Q=this;
	var cache=Q.engine.postingCache;
	if (cache[phrase.key]) {
		phrase.posting=cache[phrase.key];
		return Q;
	}
	if (phrase.termid.length==1) {
		if (!Q.terms.length){
			phrase.posting=[];
		} else {
			cache[phrase.key]=phrase.posting=Q.terms[phrase.termid[0]].posting;	
		}
		return Q;
	}

	var i=0, r=[],dis=0;
	while(i<phrase.termid.length) {
	  var T=Q.terms[phrase.termid[i]];
		if (0 === i) {
			r = T.posting;
		} else {
		    if (T.op=='wildcard') {
		    	T=Q.terms[phrase.termid[i++]];
		    	var width=T.width;
		    	var wildcard=T.wildcard;
		    	T=Q.terms[phrase.termid[i]];
		    	var mindis=dis;
		    	if (wildcard=='?') mindis=dis+width;
		    	if (T.exclude) r = plist.plnotfollow2(r, T.posting, mindis, dis+width);
		    	else r = plist.plfollow2(r, T.posting, mindis, dis+width);		    	
		    	dis+=(width-1);
		    }else {
		    	if (T.posting) {
		    		if (T.exclude) r = plist.plnotfollow(r, T.posting, dis);
		    		else r = plist.plfollow(r, T.posting, dis);
		    	}
		    }
		}
		dis += phrase.termlength[i];
		i++;
		if (!r) return Q;
  }
  phrase.posting=r;
  cache[phrase.key]=r;
  return Q;
}
var trimSpace=function(engine,query) {
	if (!query) return "";
	var i=0;
	var isSkip=engine.analyzer.isSkip;
	while (i<query.length && isSkip(query[i])) i++;
	return query.substring(i);
}
var getSegWithHit=function(fileid,offsets) {
	var Q=this,engine=Q.engine;
	var segWithHit=plist.groupbyposting2(Q.byFile[fileid ], offsets);
	if (segWithHit.length) segWithHit.shift(); //the first item is not used (0~Q.byFile[0] )
	var out=[];
	segWithHit.map(function(p,idx){if (p.length) out.push(idx)});
	return out;
}
var segWithHit=function(fileid) {
	var Q=this,engine=Q.engine;
	var offsets=engine.getFileSegOffsets(fileid);
	return getSegWithHit.apply(this,[fileid,offsets]);
}
var isSimplePhrase=function(phrase) {
	var m=phrase.match(/[\?%^]/);
	return !m;
}

// 發菩提心   ==> 發菩  提心       2 2   
// 菩提心     ==> 菩提  提心       1 2
// 劫劫       ==> 劫    劫         1 1   // invalid
// 因緣所生道  ==> 因緣  所生   道   2 2 1
var splitPhrase=function(engine,simplephrase,bigram) {
	var bigram=bigram||engine.get("meta").bigram||[];
	var tokens=engine.analyzer.tokenize(simplephrase).tokens;
	var loadtokens=[],lengths=[],j=0,lastbigrampos=-1;
	while (j+1<tokens.length) {
		var token=engine.analyzer.normalize(tokens[j]);
		var nexttoken=engine.analyzer.normalize(tokens[j+1]);
		var bi=token+nexttoken;
		var i=plist.indexOfSorted(bigram,bi);
		if (bigram[i]==bi) {
			loadtokens.push(bi);
			if (j+3<tokens.length) {
				lastbigrampos=j;
				j++;
			} else {
				if (j+2==tokens.length){ 
					if (lastbigrampos+1==j ) {
						lengths[lengths.length-1]--;
					}
					lastbigrampos=j;
					j++;
				}else {
					lastbigrampos=j;	
				}
			}
			lengths.push(2);
		} else {
			if (!bigram || lastbigrampos==-1 || lastbigrampos+1!=j) {
				loadtokens.push(token);
				lengths.push(1);				
			}
		}
		j++;
	}

	while (j<tokens.length) {
		var token=engine.analyzer.normalize(tokens[j]);
		loadtokens.push(token);
		lengths.push(1);
		j++;
	}

	return {tokens:loadtokens, lengths: lengths , tokenlength: tokens.length};
}
/* host has fast native function */
var fastPhrase=function(engine,phrase) {
	var phrase_term=newPhrase();
	//var tokens=engine.analyzer.tokenize(phrase).tokens;
	var splitted=splitPhrase(engine,phrase);

	var paths=postingPathFromTokens(engine,splitted.tokens);
//create wildcard

	phrase_term.width=splitted.tokenlength; //for excerpt.js to getPhraseWidth

	engine.get(paths,{address:true},function(postingAddress){ //this is sync
		phrase_term.key=phrase;
		var postingAddressWithWildcard=[];
		for (var i=0;i<postingAddress.length;i++) {
			postingAddressWithWildcard.push(postingAddress[i]);
			if (splitted.lengths[i]>1) {
				postingAddressWithWildcard.push([splitted.lengths[i],0]); //wildcard has blocksize==0 
			}
		}
		engine.postingCache[phrase]=engine.mergePostings(postingAddressWithWildcard);
	});
	return phrase_term;
	// put posting into cache[phrase.key]
}
var slowPhrase=function(engine,terms,phrase) {
	var j=0,tokens=engine.analyzer.tokenize(phrase).tokens;
	var phrase_term=newPhrase();
	var termid=0;
	while (j<tokens.length) {
		var raw=tokens[j], termlength=1;
		if (isWildcard(raw)) {
			if (phrase_term.termid.length==0)  { //skip leading wild card
				j++
				continue;
			}
			terms.push(parseWildcard(raw));
			termid=terms.length-1;
			phrase_term.termid.push(termid);
			phrase_term.termlength.push(termlength);
		} else if (isOrTerm(raw)){
			var term=orTerms.apply(this,[tokens,j]);
			if (term) {
				terms.push(term);
				termid=terms.length-1;
				j+=term.key.split(',').length-1;					
			}
			j++;
			phrase_term.termid.push(termid);
			phrase_term.termlength.push(termlength);
		} else {
			var phrase="";
			while (j<tokens.length) {
				if (!(isWildcard(tokens[j]) || isOrTerm(tokens[j]))) {
					phrase+=tokens[j];
					j++;
				} else break;
			}

			var splitted=splitPhrase(engine,phrase);
			for (var i=0;i<splitted.tokens.length;i++) {

				var term=parseTerm(engine,splitted.tokens[i]);
				var termidx=terms.map(function(a){return a.key}).indexOf(term.key);
				if (termidx==-1) {
					terms.push(term);
					termid=terms.length-1;
				} else {
					termid=termidx;
				}				
				phrase_term.termid.push(termid);
				phrase_term.termlength.push(splitted.lengths[i]);
			}
		}
		j++;
	}
	phrase_term.key=phrase;
	//remove ending wildcard
	var P=phrase_term , T=null;
	do {
		T=terms[P.termid[P.termid.length-1]];
		if (!T) break;
		if (T.wildcard) P.termid.pop(); else break;
	} while(T);		
	return phrase_term;
}
var newQuery =function(engine,query,opts) {
	//if (!query) return;
	opts=opts||{};
	query=trimSpace(engine,query);

	var phrases=query,phrases=[];
	if (typeof query=='string' && query) {
		phrases=parseQuery(query,opts.phrase_sep || "");
	}
	
	var phrase_terms=[], terms=[],variants=[],operators=[];
	var pc=0;//phrase count
	for  (var i=0;i<phrases.length;i++) {
		var op=getOperator(phrases[pc]);
		if (op) phrases[pc]=phrases[pc].substring(1);

		/* auto add + for natural order ?*/
		//if (!opts.rank && op!='exclude' &&i) op='include';
		operators.push(op);

		if (isSimplePhrase(phrases[pc]) && engine.mergePostings ) {
			var phrase_term=fastPhrase(engine,phrases[pc]);
		} else {
			var phrase_term=slowPhrase(engine,terms,phrases[pc]);
		}
		phrase_terms.push(phrase_term);

		if (!engine.mergePostings && phrase_terms[pc].termid.length==0) {
			phrase_terms.pop();
		} else pc++;
	}
	opts.op=operators;

	var Q={dbname:engine.dbname,engine:engine,opts:opts,query:query,
		phrases:phrase_terms,terms:terms
	};
	Q.tokenize=function() {return engine.analyzer.tokenize.apply(engine,arguments);}
	Q.isSkip=function() {return engine.analyzer.isSkip.apply(engine,arguments);}
	Q.normalize=function() {return engine.analyzer.normalize.apply(engine,arguments);}
	Q.segWithHit=segWithHit;

	//Q.getRange=function() {return that.getRange.apply(that,arguments)};
	//API.queryid='Q'+(Math.floor(Math.random()*10000000)).toString(16);
	return Q;
}
var postingPathFromTokens=function(engine,tokens) {
	var alltokens=engine.get("tokens");

	var tokenIds=tokens.map(function(t){ return 1+alltokens.indexOf(t)});
	var postingid=[];
	for (var i=0;i<tokenIds.length;i++) {
		postingid.push( tokenIds[i]); // tokenId==0 , empty token
	}
	return postingid.map(function(t){return ["postings",t]});
}
var loadPostings=function(engine,tokens,cb) {
	var toloadtokens=tokens.filter(function(t){
		return !engine.postingCache[t.key]; //already in cache
	});
	if (toloadtokens.length==0) {
		cb();
		return;
	}
	var postingPaths=postingPathFromTokens(engine,tokens.map(function(t){return t.key}));
	engine.get(postingPaths,function(postings){
		postings.map(function(p,i) { tokens[i].posting=p });
		if (cb) cb();
	});
}
var groupBy=function(Q,posting) {
	phrases.forEach(function(P){
		var key=P.key;
		var docfreq=docfreqcache[key];
		if (!docfreq) docfreq=docfreqcache[key]={};
		if (!docfreq[that.groupunit]) {
			docfreq[that.groupunit]={doclist:null,freq:null};
		}		
		if (P.posting) {
			var res=matchPosting(engine,P.posting);
			P.freq=res.freq;
			P.docs=res.docs;
		} else {
			P.docs=[];
			P.freq=[];
		}
		docfreq[that.groupunit]={doclist:P.docs,freq:P.freq};
	});
	return this;
}
var groupByFolder=function(engine,filehits) {
	var files=engine.get("filenames");
	var prevfolder="",hits=0,out=[];
	for (var i=0;i<filehits.length;i++) {
		var fn=files[i];
		var folder=fn.substring(0,fn.indexOf('/'));
		if (prevfolder && prevfolder!=folder) {
			out.push(hits);
			hits=0;
		}
		hits+=filehits[i].length;
		prevfolder=folder;
	}
	out.push(hits);
	return out;
}
var phrase_intersect=function(engine,Q) {
	var intersected=null;
	var fileoffsets=Q.engine.get("fileoffsets");
	var empty=[],emptycount=0,hashit=0;
	for (var i=0;i<Q.phrases.length;i++) {
		var byfile=plist.groupbyposting2(Q.phrases[i].posting,fileoffsets);
		if (byfile.length) byfile.shift();
		if (byfile.length) byfile.pop();
		byfile.pop();
		if (intersected==null) {
			intersected=byfile;
		} else {
			for (var j=0;j<byfile.length;j++) {
				if (!(byfile[j].length && intersected[j].length)) {
					intersected[j]=empty; //reuse empty array
					emptycount++;
				} else hashit++;
			}
		}
	}

	Q.byFile=intersected;
	Q.byFolder=groupByFolder(engine,Q.byFile);
	var out=[];
	//calculate new rawposting
	for (var i=0;i<Q.byFile.length;i++) {
		if (Q.byFile[i].length) out=out.concat(Q.byFile[i]);
	}
	Q.rawresult=out;
	countFolderFile(Q);
}
var countFolderFile=function(Q) {
	Q.fileWithHitCount=0;
	Q.byFile.map(function(f){if (f.length) Q.fileWithHitCount++});
			
	Q.folderWithHitCount=0;
	Q.byFolder.map(function(f){if (f) Q.folderWithHitCount++});
}

var main=function(engine,q,opts,cb){
	var starttime=new Date();
	var meta=engine.get("meta");
	if (meta.normalize && engine.analyzer.setNormalizeTable) {
		meta.normalizeObj=engine.analyzer.setNormalizeTable(meta.normalize,meta.normalizeObj);
	}
	if (typeof opts=="function") cb=opts;
	opts=opts||{};
	var Q=engine.queryCache[q];
	if (!Q) Q=newQuery(engine,q,opts); 
	if (!Q) {
		engine.searchtime=new Date()-starttime;
		engine.totaltime=engine.searchtime;
		if (engine.context) cb.apply(engine.context,["empty result",{rawresult:[]}]);
		else cb("empty result",{rawresult:[]});
		return;
	};
	engine.queryCache[q]=Q;
	if (Q.phrases.length) {
		loadPostings(engine,Q.terms,function(){
			if (!Q.phrases[0].posting) {
				engine.searchtime=new Date()-starttime;
				engine.totaltime=engine.searchtime

				cb.apply(engine.context,["no such posting",{rawresult:[]}]);
				return;			
			}
			
			if (!Q.phrases[0].posting.length) { //
				Q.phrases.forEach(loadPhrase.bind(Q));
			}
			if (Q.phrases.length==1) {
				Q.rawresult=Q.phrases[0].posting;
			} else {
				phrase_intersect(engine,Q);
			}
			var fileoffsets=Q.engine.get("fileoffsets");
			//console.log("search opts "+JSON.stringify(opts));

			if (!Q.byFile && Q.rawresult && !opts.nogroup) {
				Q.byFile=plist.groupbyposting2(Q.rawresult, fileoffsets);
				Q.byFile.shift();Q.byFile.pop();
				Q.byFolder=groupByFolder(engine,Q.byFile);

				countFolderFile(Q);
			}

			if (opts.range) {
				engine.searchtime=new Date()-starttime;
				excerpt.resultlist(engine,Q,opts,function(data) { 
					//console.log("excerpt ok");
					Q.excerpt=data;
					engine.totaltime=new Date()-starttime;
					cb.apply(engine.context,[0,Q]);
				});
			} else {
				engine.searchtime=new Date()-starttime;
				engine.totaltime=new Date()-starttime;
				cb.apply(engine.context,[0,Q]);
			}
		});
	} else { //empty search
		engine.searchtime=new Date()-starttime;
		engine.totaltime=new Date()-starttime;
		cb.apply(engine.context,[0,Q]);
	};
}

main.splitPhrase=splitPhrase; //just for debug
module.exports=main;
},{"./boolsearch":"/Users/yu/ksana2015/node_modules/ksana-search/boolsearch.js","./excerpt":"/Users/yu/ksana2015/node_modules/ksana-search/excerpt.js","./plist":"/Users/yu/ksana2015/node_modules/ksana-search/plist.js"}],"/Users/yu/ksana2015/node_modules/ksana2015-webruntime/checkbrowser.js":[function(require,module,exports){
/** @jsx React.DOM */
/*
convert to pure js
save -g reactify
*/
var E=React.createElement;

var hasksanagap=(typeof ksanagap!="undefined");
if (hasksanagap && (typeof console=="undefined" || typeof console.log=="undefined")) {
		window.console={log:ksanagap.log,error:ksanagap.error,debug:ksanagap.debug,warn:ksanagap.warn};
		console.log("install console output funciton");
}

var checkfs=function() {
	return (navigator && navigator.webkitPersistentStorage) || hasksanagap;
}
var featurechecks={
	"fs":checkfs
}
var checkbrowser = React.createClass({
	getInitialState:function() {

		var missingFeatures=this.getMissingFeatures();
		return {ready:false, missing:missingFeatures};
	},
	getMissingFeatures:function() {
		var feature=this.props.feature.split(",");
		var status=[];
		feature.map(function(f){
			var checker=featurechecks[f];
			if (checker) checker=checker();
			status.push([f,checker]);
		});
		return status.filter(function(f){return !f[1]});
	},
	downloadbrowser:function() {
		window.location="https://www.google.com/chrome/"
	},
	renderMissing:function() {
		var showMissing=function(m) {
			return E("div", null, m);
		}
		return (
		 E("div", {ref: "dialog1", className: "modal fade", "data-backdrop": "static"}, 
		    E("div", {className: "modal-dialog"}, 
		      E("div", {className: "modal-content"}, 
		        E("div", {className: "modal-header"}, 
		          E("button", {type: "button", className: "close", "data-dismiss": "modal", "aria-hidden": "true"}, "×"), 
		          E("h4", {className: "modal-title"}, "Browser Check")
		        ), 
		        E("div", {className: "modal-body"}, 
		          E("p", null, "Sorry but the following feature is missing"), 
		          this.state.missing.map(showMissing)
		        ), 
		        E("div", {className: "modal-footer"}, 
		          E("button", {onClick: this.downloadbrowser, type: "button", className: "btn btn-primary"}, "Download Google Chrome")
		        )
		      )
		    )
		  )
		 );
	},
	renderReady:function() {
		return E("span", null, "browser ok")
	},
	render:function(){
		return  (this.state.missing.length)?this.renderMissing():this.renderReady();
	},
	componentDidMount:function() {
		if (!this.state.missing.length) {
			this.props.onReady();
		} else {
			$(this.refs.dialog1.getDOMNode()).modal('show');
		}
	}
});

module.exports=checkbrowser;
},{}],"/Users/yu/ksana2015/node_modules/ksana2015-webruntime/downloader.js":[function(require,module,exports){

var userCancel=false;
var files=[];
var totalDownloadByte=0;
var targetPath="";
var tempPath="";
var nfile=0;
var baseurl="";
var result="";
var downloading=false;
var startDownload=function(dbid,_baseurl,_files) { //return download id
	var fs     = require("fs");
	var path   = require("path");

	
	files=_files.split("\uffff");
	if (downloading) return false; //only one session
	userCancel=false;
	totalDownloadByte=0;
	nextFile();
	downloading=true;
	baseurl=_baseurl;
	if (baseurl[baseurl.length-1]!='/')baseurl+='/';
	targetPath=ksanagap.rootPath+dbid+'/';
	tempPath=ksanagap.rootPath+".tmp/";
	result="";
	return true;
}

var nextFile=function() {
	setTimeout(function(){
		if (nfile==files.length) {
			nfile++;
			endDownload();
		} else {
			downloadFile(nfile++);	
		}
	},100);
}

var downloadFile=function(nfile) {
	var url=baseurl+files[nfile];
	var tmpfilename=tempPath+files[nfile];
	var mkdirp = require("./mkdirp");
	var fs     = require("fs");
	var http   = require("http");

	mkdirp.sync(path.dirname(tmpfilename));
	var writeStream = fs.createWriteStream(tmpfilename);
	var datalength=0;
	var request = http.get(url, function(response) {
		response.on('data',function(chunk){
			writeStream.write(chunk);
			totalDownloadByte+=chunk.length;
			if (userCancel) {
				writeStream.end();
				setTimeout(function(){nextFile();},100);
			}
		});
		response.on("end",function() {
			writeStream.end();
			setTimeout(function(){nextFile();},100);
		});
	});
}

var cancelDownload=function() {
	userCancel=true;
	endDownload();
}
var verify=function() {
	return true;
}
var endDownload=function() {
	nfile=files.length+1;//stop
	result="cancelled";
	downloading=false;
	if (userCancel) return;
	var fs     = require("fs");
	var mkdirp = require("./mkdirp");

	for (var i=0;i<files.length;i++) {
		var targetfilename=targetPath+files[i];
		var tmpfilename   =tempPath+files[i];
		mkdirp.sync(path.dirname(targetfilename));
		fs.renameSync(tmpfilename,targetfilename);
	}
	if (verify()) {
		result="success";
	} else {
		result="error";
	}
}

var downloadedByte=function() {
	return totalDownloadByte;
}
var doneDownload=function() {
	if (nfile>files.length) return result;
	else return "";
}
var downloadingFile=function() {
	return nfile-1;
}

var downloader={startDownload:startDownload, downloadedByte:downloadedByte,
	downloadingFile:downloadingFile, cancelDownload:cancelDownload,doneDownload:doneDownload};
module.exports=downloader;
},{"./mkdirp":"/Users/yu/ksana2015/node_modules/ksana2015-webruntime/mkdirp.js","fs":false,"http":false,"path":false}],"/Users/yu/ksana2015/node_modules/ksana2015-webruntime/fileinstaller.js":[function(require,module,exports){
/** @jsx React.DOM */

/* todo , optional kdb */

var HtmlFS=require("./htmlfs");
var html5fs=require("./html5fs");
var CheckBrowser=require("./checkbrowser");
var E=React.createElement;
  

var FileList = React.createClass({
	getInitialState:function() {
		return {downloading:false,progress:0};
	},
	updatable:function(f) {
        var classes="btn btn-warning";
        if (this.state.downloading) classes+=" disabled";
		if (f.hasUpdate) return   E("button", {className: classes, 
			"data-filename": f.filename, "data-url": f.url, 
	            onClick: this.download
	       }, "Update")
		else return null;
	},
	showLocal:function(f) {
        var classes="btn btn-danger";
        if (this.state.downloading) classes+=" disabled";
	  return E("tr", null, E("td", null, f.filename), 
	      E("td", null), 
	      E("td", {className: "pull-right"}, 
	      this.updatable(f), E("button", {className: classes, 
	               onClick: this.deleteFile, "data-filename": f.filename}, "Delete")
	        
	      )
	  )
	},  
	showRemote:function(f) { 
	  var classes="btn btn-warning";
	  if (this.state.downloading) classes+=" disabled";
	  return (E("tr", {"data-id": f.filename}, E("td", null, 
	      f.filename), 
	      E("td", null, f.desc), 
	      E("td", null, 
	      E("span", {"data-filename": f.filename, "data-url": f.url, 
	            className: classes, 
	            onClick: this.download}, "Download")
	      )
	  ));
	},
	showFile:function(f) {
	//	return <span data-id={f.filename}>{f.url}</span>
		return (f.ready)?this.showLocal(f):this.showRemote(f);
	},
	reloadDir:function() {
		this.props.action("reload");
	},
	download:function(e) {
		var url=e.target.dataset["url"];
		var filename=e.target.dataset["filename"];
		this.setState({downloading:true,progress:0,url:url});
		this.userbreak=false;
		html5fs.download(url,filename,function(){
			this.reloadDir();
			this.setState({downloading:false,progress:1});
			},function(progress,total){
				if (progress==0) {
					this.setState({message:"total "+total})
			 	}
			 	this.setState({progress:progress});
			 	//if user press abort return true
			 	return this.userbreak;
			}
		,this);
	},
	deleteFile:function( e) {
		var filename=e.target.attributes["data-filename"].value;
		this.props.action("delete",filename);
	},
	allFilesReady:function(e) {
		return this.props.files.every(function(f){ return f.ready});
	},
	dismiss:function() {
		$(this.refs.dialog1.getDOMNode()).modal('hide');
		this.props.action("dismiss");
	},
	abortdownload:function() {
		this.userbreak=true;
	},
	showProgress:function() {
	     if (this.state.downloading) {
	      var progress=Math.round(this.state.progress*100);
	      return (
	      	E("div", null, 
	      	"Downloading from ", this.state.url, 
	      E("div", {key: "progress", className: "progress col-md-8"}, 
	          E("div", {className: "progress-bar", role: "progressbar", 
	              "aria-valuenow": progress, "aria-valuemin": "0", 
	              "aria-valuemax": "100", style: {width: progress+"%"}}, 
	            progress, "%"
	          )
	        ), 
	        E("button", {onClick: this.abortdownload, 
	        	className: "btn btn-danger col-md-4"}, "Abort")
	        )
	        );
	      } else {
	      		if ( this.allFilesReady() ) {
	      			return E("button", {onClick: this.dismiss, className: "btn btn-success"}, "Ok")
	      		} else return null;
	      		
	      }
	},
	showUsage:function() {
		var percent=this.props.remainPercent;
           return (E("div", null, E("span", {className: "pull-left"}, "Usage:"), E("div", {className: "progress"}, 
		  E("div", {className: "progress-bar progress-bar-success progress-bar-striped", role: "progressbar", style: {width: percent+"%"}}, 
		    	percent+"%"
		  )
		)));
	},
	render:function() {
	  	return (
		E("div", {ref: "dialog1", className: "modal fade", "data-backdrop": "static"}, 
		    E("div", {className: "modal-dialog"}, 
		      E("div", {className: "modal-content"}, 
		        E("div", {className: "modal-header"}, 
		          E("h4", {className: "modal-title"}, "File Installer")
		        ), 
		        E("div", {className: "modal-body"}, 
		        	E("table", {className: "table"}, 
		        	E("tbody", null, 
		          	this.props.files.map(this.showFile)
		          	)
		          )
		        ), 
		        E("div", {className: "modal-footer"}, 
		        	this.showUsage(), 
		           this.showProgress()
		        )
		      )
		    )
		  )
		);
	},	
	componentDidMount:function() {
		$(this.refs.dialog1.getDOMNode()).modal('show');
	}
});
/*TODO kdb check version*/
var Filemanager = React.createClass({
	getInitialState:function() {
		var quota=this.getQuota();
		return {browserReady:false,noupdate:true,	requestQuota:quota,remain:0};
	},
	getQuota:function() {
		var q=this.props.quota||"128M";
		var unit=q[q.length-1];
		var times=1;
		if (unit=="M") times=1024*1024;
		else if (unit="K") times=1024;
		return parseInt(q) * times;
	},
	missingKdb:function() {
		if (ksanagap.platform!="chrome") return [];
		var missing=this.props.needed.filter(function(kdb){
			for (var i in html5fs.files) {
				if (html5fs.files[i][0]==kdb.filename) return false;
			}
			return true;
		},this);
		return missing;
	},
	getRemoteUrl:function(fn) {
		var f=this.props.needed.filter(function(f){return f.filename==fn});
		if (f.length ) return f[0].url;
	},
	genFileList:function(existing,missing){
		var out=[];
		for (var i in existing) {
			var url=this.getRemoteUrl(existing[i][0]);
			out.push({filename:existing[i][0], url :url, ready:true });
		}
		for (var i in missing) {
			out.push(missing[i]);
		}
		return out;
	},
	reload:function() {
		html5fs.readdir(function(files){
  			this.setState({files:this.genFileList(files,this.missingKdb())});
  		},this);
	 },
	deleteFile:function(fn) {
	  html5fs.rm(fn,function(){
	  	this.reload();
	  },this);
	},
	onQuoteOk:function(quota,usage) {
		if (ksanagap.platform!="chrome") {
			//console.log("onquoteok");
			this.setState({noupdate:true,missing:[],files:[],autoclose:true
				,quota:quota,remain:quota-usage,usage:usage});
			return;
		}
		//console.log("quote ok");
		var files=this.genFileList(html5fs.files,this.missingKdb());
		var that=this;
		that.checkIfUpdate(files,function(hasupdate) {
			var missing=this.missingKdb();
			var autoclose=this.props.autoclose;
			if (missing.length) autoclose=false;
			that.setState({autoclose:autoclose,
				quota:quota,usage:usage,files:files,
				missing:missing,
				noupdate:!hasupdate,
				remain:quota-usage});
		});
	},  
	onBrowserOk:function() {
	  this.totalDownloadSize();
	}, 
	dismiss:function() {
		this.props.onReady(this.state.usage,this.state.quota);
		setTimeout(function(){
			var modalin=$(".modal.in");
			if (modalin.modal) modalin.modal('hide');
		},500);
	}, 
	totalDownloadSize:function() {
		var files=this.missingKdb();
		var taskqueue=[],totalsize=0;
		for (var i=0;i<files.length;i++) {
			taskqueue.push(
				(function(idx){
					return (function(data){
						if (!(typeof data=='object' && data.__empty)) totalsize+=data;
						html5fs.getDownloadSize(files[idx].url,taskqueue.shift());
					});
				})(i)
			);
		}
		var that=this;
		taskqueue.push(function(data){	
			totalsize+=data;
			setTimeout(function(){that.setState({requireSpace:totalsize,browserReady:true})},0);
		});
		taskqueue.shift()({__empty:true});
	},
	checkIfUpdate:function(files,cb) {
		var taskqueue=[];
		for (var i=0;i<files.length;i++) {
			taskqueue.push(
				(function(idx){
					return (function(data){
						if (!(typeof data=='object' && data.__empty)) files[idx-1].hasUpdate=data;
						html5fs.checkUpdate(files[idx].url,files[idx].filename,taskqueue.shift());
					});
				})(i)
			);
		}
		var that=this;
		taskqueue.push(function(data){	
			files[files.length-1].hasUpdate=data;
			var hasupdate=files.some(function(f){return f.hasUpdate});
			if (cb) cb.apply(that,[hasupdate]);
		});
		taskqueue.shift()({__empty:true});
	},
	render:function(){
    		if (!this.state.browserReady) {   
      			return E(CheckBrowser, {feature: "fs", onReady: this.onBrowserOk})
    		} if (!this.state.quota || this.state.remain<this.state.requireSpace) {  
    			var quota=this.state.requestQuota;
    			if (this.state.usage+this.state.requireSpace>quota) {
    				quota=(this.state.usage+this.state.requireSpace)*1.5;
    			}
      			return E(HtmlFS, {quota: quota, autoclose: "true", onReady: this.onQuoteOk})
      		} else {
			if (!this.state.noupdate || this.missingKdb().length || !this.state.autoclose) {
				var remain=Math.round((this.state.usage/this.state.quota)*100);				
				return E(FileList, {action: this.action, files: this.state.files, remainPercent: remain})
			} else {
				setTimeout( this.dismiss ,0);
				return E("span", null, "Success");
			}
      		}
	},
	action:function() {
	  var args = Array.prototype.slice.call(arguments);
	  var type=args.shift();
	  var res=null, that=this;
	  if (type=="delete") {
	    this.deleteFile(args[0]);
	  }  else if (type=="reload") {
	  	this.reload();
	  } else if (type=="dismiss") {
	  	this.dismiss();
	  }
	}
});

module.exports=Filemanager;
},{"./checkbrowser":"/Users/yu/ksana2015/node_modules/ksana2015-webruntime/checkbrowser.js","./html5fs":"/Users/yu/ksana2015/node_modules/ksana2015-webruntime/html5fs.js","./htmlfs":"/Users/yu/ksana2015/node_modules/ksana2015-webruntime/htmlfs.js"}],"/Users/yu/ksana2015/node_modules/ksana2015-webruntime/html5fs.js":[function(require,module,exports){
/* emulate filesystem on html5 browser */
var get_head=function(url,field,cb){
	var xhr = new XMLHttpRequest();
	xhr.open("HEAD", url, true);
	xhr.onreadystatechange = function() {
			if (this.readyState == this.DONE) {
				cb(xhr.getResponseHeader(field));
			} else {
				if (this.status!==200&&this.status!==206) {
					cb("");
				}
			} 
	};
	xhr.send();	
}
var get_date=function(url,cb) {
	get_head(url,"Last-Modified",function(value){
		cb(value);
	});
}
var get_size=function(url, cb) {
	get_head(url,"Content-Length",function(value){
		cb(parseInt(value));
	});
};
var checkUpdate=function(url,fn,cb) {
	if (!url) {
		cb(false);
		return;
	}
	get_date(url,function(d){
		API.fs.root.getFile(fn, {create: false, exclusive: false}, function(fileEntry) {
			fileEntry.getMetadata(function(metadata){
				var localDate=Date.parse(metadata.modificationTime);
				var urlDate=Date.parse(d);
				cb(urlDate>localDate);
			});
		},function(){
			cb(false);
		});
	});
}
var download=function(url,fn,cb,statuscb,context) {
	 var totalsize=0,batches=null,written=0;
	 var fileEntry=0, fileWriter=0;
	 var createBatches=function(size) {
		var bytes=1024*1024, out=[];
		var b=Math.floor(size / bytes);
		var last=size %bytes;
		for (var i=0;i<=b;i++) {
			out.push(i*bytes);
		}
		out.push(b*bytes+last);
		return out;
	 }
	 var finish=function() {
		 rm(fn,function(){
				fileEntry.moveTo(fileEntry.filesystem.root, fn,function(){
					setTimeout( cb.bind(context,false) , 0) ; 
				},function(e){
					console.log("failed",e)
				});
		 },this); 
	 };
		var tempfn="temp.kdb";
		var batch=function(b) {
		var abort=false;
		var xhr = new XMLHttpRequest();
		var requesturl=url+"?"+Math.random();
		xhr.open('get', requesturl, true);
		xhr.setRequestHeader('Range', 'bytes='+batches[b]+'-'+(batches[b+1]-1));
		xhr.responseType = 'blob';    
		xhr.addEventListener('load', function() {
			var blob=this.response;
			fileEntry.createWriter(function(fileWriter) {
				fileWriter.seek(fileWriter.length);
				fileWriter.write(blob);
				written+=blob.size;
				fileWriter.onwriteend = function(e) {
					if (statuscb) {
						abort=statuscb.apply(context,[ fileWriter.length / totalsize,totalsize ]);
						if (abort) setTimeout( cb.bind(context,false) , 0) ;
				 	}
					b++;
					if (!abort) {
						if (b<batches.length-1) setTimeout(batch.bind(context,b),0);
						else                    finish();
				 	}
			 	};
			}, console.error);
		},false);
		xhr.send();
	}

	get_size(url,function(size){
		totalsize=size;
		if (!size) {
			if (cb) cb.apply(context,[false]);
		} else {//ready to download
			rm(tempfn,function(){
				 batches=createBatches(size);
				 if (statuscb) statuscb.apply(context,[ 0, totalsize ]);
				 API.fs.root.getFile(tempfn, {create: 1, exclusive: false}, function(_fileEntry) {
							fileEntry=_fileEntry;
						batch(0);
				 });
			},this);
		}
	});
}

var readFile=function(filename,cb,context) {
	API.fs.root.getFile(filename, function(fileEntry) {
			var reader = new FileReader();
			reader.onloadend = function(e) {
					if (cb) cb.apply(cb,[this.result]);
				};            
	}, console.error);
}
var writeFile=function(filename,buf,cb,context){
	API.fs.root.getFile(filename, {create: true, exclusive: true}, function(fileEntry) {
			fileEntry.createWriter(function(fileWriter) {
				fileWriter.write(buf);
				fileWriter.onwriteend = function(e) {
					if (cb) cb.apply(cb,[buf.byteLength]);
				};            
			}, console.error);
	}, console.error);
}

var readdir=function(cb,context) {
	var dirReader = API.fs.root.createReader();
	var out=[],that=this;
	dirReader.readEntries(function(entries) {
		if (entries.length) {
			for (var i = 0, entry; entry = entries[i]; ++i) {
				if (entry.isFile) {
					out.push([entry.name,entry.toURL ? entry.toURL() : entry.toURI()]);
				}
			}
		}
		API.files=out;
		if (cb) cb.apply(context,[out]);
	}, function(){
		if (cb) cb.apply(context,[null]);
	});
}
var getFileURL=function(filename) {
	if (!API.files ) return null;
	var file= API.files.filter(function(f){return f[0]==filename});
	if (file.length) return file[0][1];
}
var rm=function(filename,cb,context) {
	var url=getFileURL(filename);
	if (url) rmURL(url,cb,context);
	else if (cb) cb.apply(context,[false]);
}

var rmURL=function(filename,cb,context) {
	webkitResolveLocalFileSystemURL(filename, function(fileEntry) {
		fileEntry.remove(function() {
			if (cb) cb.apply(context,[true]);
		}, console.error);
	},  function(e){
		if (cb) cb.apply(context,[false]);//no such file
	});
}
function errorHandler(e) {
	console.error('Error: ' +e.name+ " "+e.message);
}
var initfs=function(grantedBytes,cb,context) {
	webkitRequestFileSystem(PERSISTENT, grantedBytes,  function(fs) {
		API.fs=fs;
		API.quota=grantedBytes;
		readdir(function(){
			API.initialized=true;
			cb.apply(context,[grantedBytes,fs]);
		},context);
	}, errorHandler);
}
var init=function(quota,cb,context) {
	navigator.webkitPersistentStorage.requestQuota(quota, 
			function(grantedBytes) {
				initfs(grantedBytes,cb,context);
		}, errorHandler
	);
}
var queryQuota=function(cb,context) {
	var that=this;
	navigator.webkitPersistentStorage.queryUsageAndQuota( 
	 function(usage,quota){
			initfs(quota,function(){
				cb.apply(context,[usage,quota]);
			},context);
	});
}
var API={
	init:init
	,readdir:readdir
	,checkUpdate:checkUpdate
	,rm:rm
	,rmURL:rmURL
	,getFileURL:getFileURL
	,writeFile:writeFile
	,readFile:readFile
	,download:download
	,get_head:get_head
	,get_date:get_date
	,get_size:get_size
	,getDownloadSize:get_size
	,queryQuota:queryQuota
}
module.exports=API;
},{}],"/Users/yu/ksana2015/node_modules/ksana2015-webruntime/htmlfs.js":[function(require,module,exports){
var html5fs=require("./html5fs");
var E=React.createElement;

var htmlfs = React.createClass({
	getInitialState:function() { 
		return {ready:false, quota:0,usage:0,Initialized:false,autoclose:this.props.autoclose};
	},
	initFilesystem:function() {
		var quota=this.props.quota||1024*1024*128; // default 128MB
		quota=parseInt(quota);
		html5fs.init(quota,function(q){
			this.dialog=false;
			$(this.refs.dialog1.getDOMNode()).modal('hide');
			this.setState({quota:q,autoclose:true});
		},this);
	},
	welcome:function() {
		return (
		E("div", {ref: "dialog1", className: "modal fade", id: "myModal", "data-backdrop": "static"}, 
		    E("div", {className: "modal-dialog"}, 
		      E("div", {className: "modal-content"}, 
		        E("div", {className: "modal-header"}, 
		          E("h4", {className: "modal-title"}, "Welcome")
		        ), 
		        E("div", {className: "modal-body"}, 
		          "Browser will ask for your confirmation."
		        ), 
		        E("div", {className: "modal-footer"}, 
		          E("button", {onClick: this.initFilesystem, type: "button", 
		            className: "btn btn-primary"}, "Initialize File System")
		        )
		      )
		    )
		  )
		 );
	},
	renderDefault:function(){
		var used=Math.floor(this.state.usage/this.state.quota *100);
		var more=function() {
			if (used>50) return E("button", {type: "button", className: "btn btn-primary"}, "Allocate More");
			else null;
		}
		return (
		E("div", {ref: "dialog1", className: "modal fade", id: "myModal", "data-backdrop": "static"}, 
		    E("div", {className: "modal-dialog"}, 
		      E("div", {className: "modal-content"}, 
		        E("div", {className: "modal-header"}, 
		          E("h4", {className: "modal-title"}, "Sandbox File System")
		        ), 
		        E("div", {className: "modal-body"}, 
		          E("div", {className: "progress"}, 
		            E("div", {className: "progress-bar", role: "progressbar", style: {width: used+"%"}}, 
		               used, "%"
		            )
		          ), 
		          E("span", null, this.state.quota, " total , ", this.state.usage, " in used")
		        ), 
		        E("div", {className: "modal-footer"}, 
		          E("button", {onClick: this.dismiss, type: "button", className: "btn btn-default", "data-dismiss": "modal"}, "Close"), 
		          more()
		        )
		      )
		    )
		  )
		  );
	},
	dismiss:function() {
		var that=this;
		setTimeout(function(){
			that.props.onReady(that.state.quota,that.state.usage);	
		},0);
	},
	queryQuota:function() {
		if (ksanagap.platform=="chrome") {
			html5fs.queryQuota(function(usage,quota){
				this.setState({usage:usage,quota:quota,initialized:true});
			},this);			
		} else {
			this.setState({usage:333,quota:1000*1000*1024,initialized:true,autoclose:true});
		}
	},
	render:function() {
		var that=this;
		if (!this.state.quota || this.state.quota<this.props.quota) {
			if (this.state.initialized) {
				this.dialog=true;
				return this.welcome();	
			} else {
				return E("span", null, "checking quota");
			}			
		} else {
			if (!this.state.autoclose) {
				this.dialog=true;
				return this.renderDefault(); 
			}
			this.dismiss();
			this.dialog=false;
			return null;
		}
	},
	componentDidMount:function() {
		if (!this.state.quota) {
			this.queryQuota();

		};
	},
	componentDidUpdate:function() {
		if (this.dialog) $(this.refs.dialog1.getDOMNode()).modal('show');
	}
});

module.exports=htmlfs;
},{"./html5fs":"/Users/yu/ksana2015/node_modules/ksana2015-webruntime/html5fs.js"}],"/Users/yu/ksana2015/node_modules/ksana2015-webruntime/index.js":[function(require,module,exports){
var ksana={"platform":"remote"};
if (typeof window!="undefined") {
	window.ksana=ksana;
	if (typeof ksanagap=="undefined") {
		window.ksanagap=require("./ksanagap"); //compatible layer with mobile
	}
}
if (typeof process !="undefined") {
	if (process.versions && process.versions["node-webkit"]) {
  		if (typeof nodeRequire!="undefined") ksana.require=nodeRequire;
  		ksana.platform="node-webkit";
  		window.ksanagap.platform="node-webkit";
		var ksanajs=require("fs").readFileSync("ksana.js","utf8").trim();
		ksana.js=JSON.parse(ksanajs.substring(14,ksanajs.length-1));
		window.kfs=require("./kfs");
  	}
} else if (typeof chrome!="undefined"){//} && chrome.fileSystem){
//	window.ksanagap=require("./ksanagap"); //compatible layer with mobile
	window.ksanagap.platform="chrome";
	window.kfs=require("./kfs_html5");
	if(window.location.origin.indexOf("//127.0.0.1")>-1) {
		require("./livereload")();
	}
	ksana.platform="chrome";
} else {
	if (typeof ksanagap!="undefined" && typeof fs!="undefined") {//mobile
		var ksanajs=fs.readFileSync("ksana.js","utf8").trim(); //android extra \n at the end
		ksana.js=JSON.parse(ksanajs.substring(14,ksanajs.length-1));
		ksana.platform=ksanagap.platform;
		if (typeof ksanagap.android !="undefined") {
			ksana.platform="android";
		}
	}
}
var timer=null;
var boot=function(appId,cb) {
	ksana.appId=appId;
	if (ksanagap.platform=="chrome") { //need to wait for jsonp ksana.js
		timer=setInterval(function(){
			if (ksana.ready){
				clearInterval(timer);
				if (ksana.js && ksana.js.files && ksana.js.files.length) {
					require("./installkdb")(ksana.js,cb);
				} else {
					cb();		
				}
			}
		},300);
	} else {
		cb();
	}
}

module.exports={boot:boot
	,htmlfs:require("./htmlfs")
	,html5fs:require("./html5fs")
	,liveupdate:require("./liveupdate")
	,fileinstaller:require("./fileinstaller")
	,downloader:require("./downloader")
	,installkdb:require("./installkdb")
};
},{"./downloader":"/Users/yu/ksana2015/node_modules/ksana2015-webruntime/downloader.js","./fileinstaller":"/Users/yu/ksana2015/node_modules/ksana2015-webruntime/fileinstaller.js","./html5fs":"/Users/yu/ksana2015/node_modules/ksana2015-webruntime/html5fs.js","./htmlfs":"/Users/yu/ksana2015/node_modules/ksana2015-webruntime/htmlfs.js","./installkdb":"/Users/yu/ksana2015/node_modules/ksana2015-webruntime/installkdb.js","./kfs":"/Users/yu/ksana2015/node_modules/ksana2015-webruntime/kfs.js","./kfs_html5":"/Users/yu/ksana2015/node_modules/ksana2015-webruntime/kfs_html5.js","./ksanagap":"/Users/yu/ksana2015/node_modules/ksana2015-webruntime/ksanagap.js","./livereload":"/Users/yu/ksana2015/node_modules/ksana2015-webruntime/livereload.js","./liveupdate":"/Users/yu/ksana2015/node_modules/ksana2015-webruntime/liveupdate.js","fs":false}],"/Users/yu/ksana2015/node_modules/ksana2015-webruntime/installkdb.js":[function(require,module,exports){
var Fileinstaller=require("./fileinstaller");

var getRequire_kdb=function() {
    var required=[];
    ksana.js.files.map(function(f){
      if (f.indexOf(".kdb")==f.length-4) {
        var slash=f.lastIndexOf("/");
        if (slash>-1) {
          var dbid=f.substring(slash+1,f.length-4);
          required.push({url:f,dbid:dbid,filename:dbid+".kdb"});
        } else {
          var dbid=f.substring(0,f.length-4);
          required.push({url:ksana.js.baseurl+f,dbid:dbid,filename:f});
        }        
      }
    });
    return required;
}
var callback=null;
var onReady=function() {
	callback();
}
var openFileinstaller=function(keep) {
	var require_kdb=getRequire_kdb().map(function(db){
	  return {
	    url:window.location.origin+window.location.pathname+db.dbid+".kdb",
	    dbdb:db.dbid,
	    filename:db.filename
	  }
	})
	return React.createElement(Fileinstaller, {quota: "512M", autoclose: !keep, needed: require_kdb, 
	                 onReady: onReady});
}
var installkdb=function(ksanajs,cb,context) {
	React.render(openFileinstaller(),document.getElementById("main"));
	callback=cb;
}
module.exports=installkdb;
},{"./fileinstaller":"/Users/yu/ksana2015/node_modules/ksana2015-webruntime/fileinstaller.js"}],"/Users/yu/ksana2015/node_modules/ksana2015-webruntime/kfs.js":[function(require,module,exports){
//Simulate feature in ksanagap
/* 
  runs on node-webkit only
*/

var readDir=function(path) { //simulate Ksanagap function
	var fs=nodeRequire("fs");
	path=path||"..";
	var dirs=[];
	if (path[0]==".") {
		if (path==".") dirs=fs.readdirSync(".");
		else {
			dirs=fs.readdirSync("..");
		}
	} else {
		dirs=fs.readdirSync(path);
	}

	return dirs.join("\uffff");
}
var listApps=function() {
	var fs=nodeRequire("fs");
	var ksanajsfile=function(d) {return "../"+d+"/ksana.js"};
	var dirs=fs.readdirSync("..").filter(function(d){
				return fs.statSync("../"+d).isDirectory() && d[0]!="."
				   && fs.existsSync(ksanajsfile(d));
	});
	
	var out=dirs.map(function(d){
		var content=fs.readFileSync(ksanajsfile(d),"utf8");
  	content=content.replace("})","}");
  	content=content.replace("jsonp_handler(","");
		var obj= JSON.parse(content);
		obj.dbid=d;
		obj.path=d;
		return obj;
	})
	return JSON.stringify(out);
}



var kfs={readDir:readDir,listApps:listApps};

module.exports=kfs;
},{}],"/Users/yu/ksana2015/node_modules/ksana2015-webruntime/kfs_html5.js":[function(require,module,exports){
var readDir=function(){
	return [];
}
var listApps=function(){
	return [];
}
module.exports={readDir:readDir,listApps:listApps};
},{}],"/Users/yu/ksana2015/node_modules/ksana2015-webruntime/ksanagap.js":[function(require,module,exports){
var appname="installer";
var switchApp=function(path) {
	var fs=require("fs");
	path="../"+path;
	appname=path;
	document.location.href= path+"/index.html"; 
	process.chdir(path);
}
var downloader={};
var rootPath="";

var deleteApp=function(app) {
	console.error("not allow on PC, do it in File Explorer/ Finder");
}
var username=function() {
	return "";
}
var useremail=function() {
	return ""
}
var runtime_version=function() {
	return "1.4";
}

//copy from liveupdate
var jsonp=function(url,dbid,callback,context) {
  var script=document.getElementById("jsonp2");
  if (script) {
    script.parentNode.removeChild(script);
  }
  window.jsonp_handler=function(data) {
    if (typeof data=="object") {
      data.dbid=dbid;
      callback.apply(context,[data]);    
    }  
  }
  window.jsonp_error_handler=function() {
    console.error("url unreachable",url);
    callback.apply(context,[null]);
  }
  script=document.createElement('script');
  script.setAttribute('id', "jsonp2");
  script.setAttribute('onerror', "jsonp_error_handler()");
  url=url+'?'+(new Date().getTime());
  script.setAttribute('src', url);
  document.getElementsByTagName('head')[0].appendChild(script); 
}

var ksanagap={
	platform:"node-webkit",
	startDownload:downloader.startDownload,
	downloadedByte:downloader.downloadedByte,
	downloadingFile:downloader.downloadingFile,
	cancelDownload:downloader.cancelDownload,
	doneDownload:downloader.doneDownload,
	switchApp:switchApp,
	rootPath:rootPath,
	deleteApp: deleteApp,
	username:username, //not support on PC
	useremail:username,
	runtime_version:runtime_version,
	
}

if (typeof process!="undefined" && !process.browser) {
	var ksanajs=require("fs").readFileSync("./ksana.js","utf8").trim();
	downloader=require("./downloader");
	console.log(ksanajs);
	//ksana.js=JSON.parse(ksanajs.substring(14,ksanajs.length-1));
	rootPath=process.cwd();
	rootPath=require("path").resolve(rootPath,"..").replace(/\\/g,"/")+'/';
	ksana.ready=true;
} else{
	var url=window.location.origin+window.location.pathname.replace("index.html","")+"ksana.js";
	jsonp(url,appname,function(data){
		ksana.js=data;
		ksana.ready=true;
	});
}
module.exports=ksanagap;
},{"./downloader":"/Users/yu/ksana2015/node_modules/ksana2015-webruntime/downloader.js","fs":false,"path":false}],"/Users/yu/ksana2015/node_modules/ksana2015-webruntime/livereload.js":[function(require,module,exports){
var started=false;
var timer=null;
var bundledate=null;
var get_date=require("./html5fs").get_date;
var checkIfBundleUpdated=function() {
	get_date("bundle.js",function(date){
		if (bundledate &&bundledate!=date){
			location.reload();
		}
		bundledate=date;
	});
}
var livereload=function() {
	if (started) return;

	timer1=setInterval(function(){
		checkIfBundleUpdated();
	},2000);
	started=true;
}

module.exports=livereload;
},{"./html5fs":"/Users/yu/ksana2015/node_modules/ksana2015-webruntime/html5fs.js"}],"/Users/yu/ksana2015/node_modules/ksana2015-webruntime/liveupdate.js":[function(require,module,exports){

var jsonp=function(url,dbid,callback,context) {
  var script=document.getElementById("jsonp");
  if (script) {
    script.parentNode.removeChild(script);
  }
  window.jsonp_handler=function(data) {
    //console.log("receive from ksana.js",data);
    if (typeof data=="object") {
      if (typeof data.dbid=="undefined") {
        data.dbid=dbid;
      }
      callback.apply(context,[data]);
    }  
  }

  window.jsonp_error_handler=function() {
    console.error("url unreachable",url);
    callback.apply(context,[null]);
  }

  script=document.createElement('script');
  script.setAttribute('id', "jsonp");
  script.setAttribute('onerror', "jsonp_error_handler()");
  url=url+'?'+(new Date().getTime());
  script.setAttribute('src', url);
  document.getElementsByTagName('head')[0].appendChild(script); 
}
var runtime_version_ok=function(minruntime) {
  if (!minruntime) return true;//not mentioned.
  var min=parseFloat(minruntime);
  var runtime=parseFloat( ksanagap.runtime_version()||"1.0");
  if (min>runtime) return false;
  return true;
}

var needToUpdate=function(fromjson,tojson) {
  var needUpdates=[];
  for (var i=0;i<fromjson.length;i++) { 
    var to=tojson[i];
    var from=fromjson[i];
    var newfiles=[],newfilesizes=[],removed=[];
    
    if (!to) continue; //cannot reach host
    if (!runtime_version_ok(to.minruntime)) {
      console.warn("runtime too old, need "+to.minruntime);
      continue; 
    }
    if (!from.filedates) {
      console.warn("missing filedates in ksana.js of "+from.dbid);
      continue;
    }
    from.filedates.map(function(f,idx){
      var newidx=to.files.indexOf( from.files[idx]);
      if (newidx==-1) {
        //file removed in new version
        removed.push(from.files[idx]);
      } else {
        var fromdate=Date.parse(f);
        var todate=Date.parse(to.filedates[newidx]);
        if (fromdate<todate) {
          newfiles.push( to.files[newidx] );
          newfilesizes.push(to.filesizes[newidx]);
        }        
      }
    });
    if (newfiles.length) {
      from.newfiles=newfiles;
      from.newfilesizes=newfilesizes;
      from.removed=removed;
      needUpdates.push(from);
    }
  }
  return needUpdates;
}
var getUpdatables=function(apps,cb,context) {
  getRemoteJson(apps,function(jsons){
    var hasUpdates=needToUpdate(apps,jsons);
    cb.apply(context,[hasUpdates]);
  },context);
}
var getRemoteJson=function(apps,cb,context) {
  var taskqueue=[],output=[];
  var makecb=function(app){
    return function(data){
        if (!(data && typeof data =='object' && data.__empty)) output.push(data);
        if (!app.baseurl) {
          taskqueue.shift({__empty:true});
        } else {
          var url=app.baseurl+"/ksana.js";    
          console.log(url);
          jsonp( url ,app.dbid,taskqueue.shift(), context);           
        }
    };
  };
  apps.forEach(function(app){taskqueue.push(makecb(app))});

  taskqueue.push(function(data){
    output.push(data);
    cb.apply(context,[output]);
  });

  taskqueue.shift()({__empty:true}); //run the task
}
var humanFileSize=function(bytes, si) {
    var thresh = si ? 1000 : 1024;
    if(bytes < thresh) return bytes + ' B';
    var units = si ? ['kB','MB','GB','TB','PB','EB','ZB','YB'] : ['KiB','MiB','GiB','TiB','PiB','EiB','ZiB','YiB'];
    var u = -1;
    do {
        bytes /= thresh;
        ++u;
    } while(bytes >= thresh);
    return bytes.toFixed(1)+' '+units[u];
};

var start=function(ksanajs,cb,context){
  var files=ksanajs.newfiles||ksanajs.files;
  var baseurl=ksanajs.baseurl|| "http://127.0.0.1:8080/"+ksanajs.dbid+"/";
  var started=ksanagap.startDownload(ksanajs.dbid,baseurl,files.join("\uffff"));
  cb.apply(context,[started]);
}
var status=function(){
  var nfile=ksanagap.downloadingFile();
  var downloadedByte=ksanagap.downloadedByte();
  var done=ksanagap.doneDownload();
  return {nfile:nfile,downloadedByte:downloadedByte, done:done};
}

var cancel=function(){
  return ksanagap.cancelDownload();
}

var liveupdate={ humanFileSize: humanFileSize, 
  needToUpdate: needToUpdate , jsonp:jsonp, 
  getUpdatables:getUpdatables,
  start:start,
  cancel:cancel,
  status:status
  };
module.exports=liveupdate;
},{}],"/Users/yu/ksana2015/node_modules/ksana2015-webruntime/mkdirp.js":[function(require,module,exports){
function mkdirP (p, mode, f, made) {
     var path = nodeRequire('path');
     var fs = nodeRequire('fs');
	
    if (typeof mode === 'function' || mode === undefined) {
        f = mode;
        mode = 0x1FF & (~process.umask());
    }
    if (!made) made = null;

    var cb = f || function () {};
    if (typeof mode === 'string') mode = parseInt(mode, 8);
    p = path.resolve(p);

    fs.mkdir(p, mode, function (er) {
        if (!er) {
            made = made || p;
            return cb(null, made);
        }
        switch (er.code) {
            case 'ENOENT':
                mkdirP(path.dirname(p), mode, function (er, made) {
                    if (er) cb(er, made);
                    else mkdirP(p, mode, cb, made);
                });
                break;

            // In the case of any other error, just see if there's a dir
            // there already.  If so, then hooray!  If not, then something
            // is borked.
            default:
                fs.stat(p, function (er2, stat) {
                    // if the stat fails, then that's super weird.
                    // let the original error be the failure reason.
                    if (er2 || !stat.isDirectory()) cb(er, made)
                    else cb(null, made);
                });
                break;
        }
    });
}

mkdirP.sync = function sync (p, mode, made) {
    var path = nodeRequire('path');
    var fs = nodeRequire('fs');
    if (mode === undefined) {
        mode = 0x1FF & (~process.umask());
    }
    if (!made) made = null;

    if (typeof mode === 'string') mode = parseInt(mode, 8);
    p = path.resolve(p);

    try {
        fs.mkdirSync(p, mode);
        made = made || p;
    }
    catch (err0) {
        switch (err0.code) {
            case 'ENOENT' :
                made = sync(path.dirname(p), mode, made);
                sync(p, mode, made);
                break;

            // In the case of any other error, just see if there's a dir
            // there already.  If so, then hooray!  If not, then something
            // is borked.
            default:
                var stat;
                try {
                    stat = fs.statSync(p);
                }
                catch (err1) {
                    throw err0;
                }
                if (!stat.isDirectory()) throw err0;
                break;
        }
    }

    return made;
};

module.exports = mkdirP.mkdirp = mkdirP.mkdirP = mkdirP;

},{}]},{},["/Users/yu/ksana2015/moedict-yu/index.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIm1vZWRpY3QteXUvaW5kZXguanMiLCJtb2VkaWN0LXl1L3NyYy9hcGkuanMiLCJtb2VkaWN0LXl1L3NyYy9kZWZib3guanN4IiwibW9lZGljdC15dS9zcmMvbWFpbi5qc3giLCJtb2VkaWN0LXl1L3NyYy9vdmVydmlldy5qc3giLCJtb2VkaWN0LXl1L3NyYy9zZWFyY2hiYXIuanN4IiwibW9lZGljdC15dS9zcmMvc2VhcmNoaGlzdG9yeS5qc3giLCJtb2VkaWN0LXl1L3NyYy9zaG93dGV4dC5qc3giLCJub2RlX21vZHVsZXMva3NhbmEtYW5hbHl6ZXIvY29uZmlncy5qcyIsIm5vZGVfbW9kdWxlcy9rc2FuYS1hbmFseXplci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9rc2FuYS1hbmFseXplci90b2tlbml6ZXJzLmpzIiwibm9kZV9tb2R1bGVzL2tzYW5hLWRhdGFiYXNlL2JzZWFyY2guanMiLCJub2RlX21vZHVsZXMva3NhbmEtZGF0YWJhc2UvaW5kZXguanMiLCJub2RlX21vZHVsZXMva3NhbmEtZGF0YWJhc2Uva2RlLmpzIiwibm9kZV9tb2R1bGVzL2tzYW5hLWRhdGFiYXNlL2xpc3RrZGIuanMiLCJub2RlX21vZHVsZXMva3NhbmEtZGF0YWJhc2UvcGxhdGZvcm0uanMiLCJub2RlX21vZHVsZXMva3NhbmEtanNvbnJvbS9odG1sNXJlYWQuanMiLCJub2RlX21vZHVsZXMva3NhbmEtanNvbnJvbS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9rc2FuYS1qc29ucm9tL2tkYi5qcyIsIm5vZGVfbW9kdWxlcy9rc2FuYS1qc29ucm9tL2tkYmZzLmpzIiwibm9kZV9tb2R1bGVzL2tzYW5hLWpzb25yb20va2RiZnNfYW5kcm9pZC5qcyIsIm5vZGVfbW9kdWxlcy9rc2FuYS1qc29ucm9tL2tkYmZzX2lvcy5qcyIsIm5vZGVfbW9kdWxlcy9rc2FuYS1qc29ucm9tL2tkYncuanMiLCJub2RlX21vZHVsZXMva3NhbmEtc2VhcmNoL2Jvb2xzZWFyY2guanMiLCJub2RlX21vZHVsZXMva3NhbmEtc2VhcmNoL2JzZWFyY2guanMiLCJub2RlX21vZHVsZXMva3NhbmEtc2VhcmNoL2V4Y2VycHQuanMiLCJub2RlX21vZHVsZXMva3NhbmEtc2VhcmNoL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2tzYW5hLXNlYXJjaC9wbGlzdC5qcyIsIm5vZGVfbW9kdWxlcy9rc2FuYS1zZWFyY2gvc2VhcmNoLmpzIiwibm9kZV9tb2R1bGVzL2tzYW5hMjAxNS13ZWJydW50aW1lL2NoZWNrYnJvd3Nlci5qcyIsIm5vZGVfbW9kdWxlcy9rc2FuYTIwMTUtd2VicnVudGltZS9kb3dubG9hZGVyLmpzIiwibm9kZV9tb2R1bGVzL2tzYW5hMjAxNS13ZWJydW50aW1lL2ZpbGVpbnN0YWxsZXIuanMiLCJub2RlX21vZHVsZXMva3NhbmEyMDE1LXdlYnJ1bnRpbWUvaHRtbDVmcy5qcyIsIm5vZGVfbW9kdWxlcy9rc2FuYTIwMTUtd2VicnVudGltZS9odG1sZnMuanMiLCJub2RlX21vZHVsZXMva3NhbmEyMDE1LXdlYnJ1bnRpbWUvaW5kZXguanMiLCJub2RlX21vZHVsZXMva3NhbmEyMDE1LXdlYnJ1bnRpbWUvaW5zdGFsbGtkYi5qcyIsIm5vZGVfbW9kdWxlcy9rc2FuYTIwMTUtd2VicnVudGltZS9rZnMuanMiLCJub2RlX21vZHVsZXMva3NhbmEyMDE1LXdlYnJ1bnRpbWUva2ZzX2h0bWw1LmpzIiwibm9kZV9tb2R1bGVzL2tzYW5hMjAxNS13ZWJydW50aW1lL2tzYW5hZ2FwLmpzIiwibm9kZV9tb2R1bGVzL2tzYW5hMjAxNS13ZWJydW50aW1lL2xpdmVyZWxvYWQuanMiLCJub2RlX21vZHVsZXMva3NhbmEyMDE1LXdlYnJ1bnRpbWUvbGl2ZXVwZGF0ZS5qcyIsIm5vZGVfbW9kdWxlcy9rc2FuYTIwMTUtd2VicnVudGltZS9ta2RpcnAuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaFhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2ZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDclRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Y0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDemFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hhQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbGtCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNVNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBydW50aW1lPXJlcXVpcmUoXCJrc2FuYTIwMTUtd2VicnVudGltZVwiKTtcbnJ1bnRpbWUuYm9vdChcIm1vZWRpY3QteXVcIixmdW5jdGlvbigpe1xuXHR2YXIgTWFpbj1SZWFjdC5jcmVhdGVFbGVtZW50KHJlcXVpcmUoXCIuL3NyYy9tYWluLmpzeFwiKSk7XG5cdGtzYW5hLm1haW5Db21wb25lbnQ9UmVhY3QucmVuZGVyKE1haW4sZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtYWluXCIpKTtcbn0pOyIsInZhciBpbmRleE9mU29ydGVkID0gZnVuY3Rpb24gKGFycmF5LCBvYmopIHsgXG4gICAgdmFyIGxvdyA9IDAsXG4gICAgaGlnaCA9IGFycmF5Lmxlbmd0aC0xO1xuICAgIHdoaWxlIChsb3cgPCBoaWdoKSB7XG4gICAgICB2YXIgbWlkID0gKGxvdyArIGhpZ2gpID4+IDE7XG4gICAgICBhcnJheVttaWRdIDwgb2JqID8gbG93ID0gbWlkICsgMSA6IGhpZ2ggPSBtaWQ7XG4gICAgfVxuICAgIC8vaWYoYXJyYXlbbG93XSAhPSBvYmopIHJldHVybiBudWxsO1xuICAgIHJldHVybiBsb3c7XG4gfVxuXG4gdmFyIHRlc3QgPSBmdW5jdGlvbihpbnB1dCkge1xuIFx0Y29uc29sZS5sb2coaW5wdXQpO1xuIH1cblxuIHZhciBhcGk9e3Rlc3Q6dGVzdCxpbmRleE9mU29ydGVkOmluZGV4T2ZTb3J0ZWR9O1xuXG5tb2R1bGUuZXhwb3J0cz1hcGk7IiwidmFyIERlZmJveD1SZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6IFwiRGVmYm94XCIsXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gIFx0cmV0dXJuIHtzZWFyY2hSZXN1bHQ6W10sdG9maW5kczpbXX07XG4gIH0sXG4gIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uKCkge1xuICAgICQoJ2h0bWwsIGJvZHknKS5zY3JvbGxUb3AoMCk7XG4gIH0sXG4gIHJlbmRlckRlZjogZnVuY3Rpb24oaXRlbSxlKSB7XG4gICAgdmFyIHBhcnNlZEl0ZW09aXRlbS5yZXBsYWNlKC8uL2csZnVuY3Rpb24ocil7XG4gICAgICAgIHJldHVybiAnPHNwYW4gZGF0YS1lbnRyeT0nK2UrJz4nK3IrJzwvc3Bhbj4nO1xuICAgICAgfSk7XG4gICAgcmV0dXJuIHBhcnNlZEl0ZW07XG4gIH0sXG4gIGRvc2VhcmNoX2hpc3Rvcnk6IGZ1bmN0aW9uKGUpIHtcbiAgICB2YXIgZW50cnlJbmRleD1lLnRhcmdldC5kYXRhc2V0LmVudHJ5O1xuICAgIHZhciB0b2ZpbmQ9ZS50YXJnZXQudGV4dENvbnRlbnQ7XG4gICAgdmFyIG5leHQ9ZS50YXJnZXQubmV4dFNpYmxpbmc7XG4gICAgdmFyIHRmPXRoaXMuc3RhdGUudG9maW5kcztcbiAgICBmb3IodmFyIGk9MDsgaTwxMDsgaSsrKXtcbiAgICAgIC8vaWYoIW5leHQgfHwgbmV4dC50ZXh0Q29udGVudC5tYXRjaCgvW+OAgu+8jOOAgeOAjOOAje+8ml0vZykpIGJyZWFrOyAgXG4gICAgICB0b2ZpbmQrPW5leHQudGV4dENvbnRlbnQ7XG4gICAgICBuZXh0PW5leHQubmV4dFNpYmxpbmc7XG4gICAgfVxuICAgIGlmKHRmLmxlbmd0aD09MCkgdGYucHVzaCh0aGlzLnN0YXRlLnNlYXJjaFJlc3VsdFswXVswXSk7XG4gICAgdGYucHVzaCh0b2ZpbmQpO1xuICAgIGlmKGVudHJ5SW5kZXgpIHtcbiAgICAgIHRoaXMuc3RhdGUuc2VhcmNoUmVzdWx0Lm1hcChmdW5jdGlvbihpdGVtKXtpdGVtLnB1c2godGZbdGYubGVuZ3RoLTJdKX0pO1xuICAgICAgdGhpcy5wcm9wcy5wdXNoSGlzdG9yeSh0aGlzLnN0YXRlLnNlYXJjaFJlc3VsdCxlbnRyeUluZGV4KTtcbiAgICB9XG4gICAgdGhpcy5wcm9wcy5kb3NlYXJjaCh0b2ZpbmQpO1xuICB9LFxuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBkPXRoaXMucHJvcHMuZGVmcztcbiAgICB2YXIgZGVmcz1bXTtcbiAgICB0aGlzLnN0YXRlLnNlYXJjaFJlc3VsdD1bXTtcbiAgICBpZihkLmxlbmd0aCE9MCkge1xuICAgICAgZm9yKHZhciBpPTA7IGk8ZC5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgdD1kW2ldWzBdLnNwbGl0KFwiXFxuXCIpO1xuICAgICAgICB2YXIgdGl0bGU9JzxkaXYgY2xhc3M9XCJ0aXRsZVwiPicrdFswXSsnPC9kaXY+JztcbiAgICAgICAgZGVmcy5wdXNoKHRpdGxlKTtcbiAgICAgICAgdGhpcy5zdGF0ZS5zZWFyY2hSZXN1bHQucHVzaChbdFswXSxkW2ldWzFdXSk7XG4gICAgICAgIGZvcih2YXIgaj0xOyBqPHQubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICB2YXIgdDE9dGhpcy5yZW5kZXJEZWYodFtqXSxkW2ldWzFdKTtcbiAgICAgICAgICBkZWZzLnB1c2godDEpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybihcblxuICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJkZWZib3hcIiwgZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUw6IHtfX2h0bWw6IGRlZnMuam9pbihcIjxicj5cIil9LCBvbkNsaWNrOiB0aGlzLmRvc2VhcmNoX2hpc3Rvcnl9KVxuXG4gICAgKTsgXG4gIH1cbn0pO1xubW9kdWxlLmV4cG9ydHM9RGVmYm94OyIsInZhciBrc2U9cmVxdWlyZShcImtzYW5hLXNlYXJjaFwiKTtcbnZhciBrZGU9cmVxdWlyZShcImtzYW5hLWRhdGFiYXNlXCIpO1xudmFyIGFwaT1yZXF1aXJlKFwiLi9hcGlcIik7XG52YXIgU2hvd3RleHQ9cmVxdWlyZShcIi4vc2hvd3RleHQuanN4XCIpO1xudmFyIFNlYXJjaGJhcj1yZXF1aXJlKFwiLi9zZWFyY2hiYXIuanN4XCIpO1xudmFyIE92ZXJ2aWV3PXJlcXVpcmUoXCIuL292ZXJ2aWV3LmpzeFwiKTtcbnZhciBtYWluY29tcG9uZW50ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiBcIm1haW5jb21wb25lbnRcIixcbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgdGhhdD10aGlzO1xuICAgIGtkZS5vcGVuKFwibW9lZGljdFwiLGZ1bmN0aW9uKGVycixkYil7XG4gICAgICB2YXIgZW50cmllcz1kYi5nZXQoXCJzZWduYW1lc1wiKTtcbiAgICAgIHRoYXQuc2V0U3RhdGUoe2VudHJpZXM6ZW50cmllcyxkYjpkYn0pO1xuICAgIH0pOyAgICBcbiAgXHRyZXR1cm4ge2VudHJpZXM6W10scmVzdWx0OltcIuaQnOWwi+e1kOaenOWIl+ihqFwiXSxzZWFyY2h0eXBlOlwic3RhcnRcIixkZWZzOltdfTtcbiAgfSxcbiAgZG9zZWFyY2g6IGZ1bmN0aW9uKHRvZmluZCxmaWVsZCkge1xuICAgIGlmKGZpZWxkPT1cInN0YXJ0XCIpe1xuICAgICAgdGhpcy5zZWFyY2hfc3RhcnQodG9maW5kKTtcbiAgICB9XG4gICAgaWYoZmllbGQ9PVwiZW5kXCIpe1xuICAgICAgdGhpcy5zZWFyY2hfZW5kKHRvZmluZCk7XG4gICAgfVxuICAgIGlmKGZpZWxkPT1cIm1pZGRsZVwiKXtcbiAgICAgIHRoaXMuc2VhcmNoX21pZGRsZSh0b2ZpbmQpO1xuICAgIH1cbiAgICBpZihmaWVsZD09XCJmdWxsdGV4dFwiKXtcbiAgICAgIHRoaXMuc2VhcmNoX2Z1bGx0ZXh0KHRvZmluZCk7XG4gICAgfVxuICB9LFxuICBzZWFyY2hfc3RhcnQ6IGZ1bmN0aW9uKHRvZmluZCkge1xuICAgIHZhciBvdXQ9W107XG4gICAgdmFyIGluZGV4PWFwaS5pbmRleE9mU29ydGVkKHRoaXMuc3RhdGUuZW50cmllcyx0b2ZpbmQpO1xuICAgIHZhciBpPTA7XG4gICAgd2hpbGUodGhpcy5zdGF0ZS5lbnRyaWVzW2luZGV4K2ldLmluZGV4T2YodG9maW5kKT09MCl7XG4gICAgICBvdXQucHVzaChbdGhpcy5zdGF0ZS5lbnRyaWVzW2luZGV4K2ldLHBhcnNlSW50KGluZGV4KStpXSk7XG4gICAgICBpKys7XG4gICAgfVxuICAgIHRoaXMuc2V0U3RhdGUoe3Jlc3VsdDpvdXR9KTtcbiAgfSxcbiAgc2VhcmNoX2VuZDogZnVuY3Rpb24odG9maW5kKSB7XG4gICAgdmFyIG91dD1bXTtcbiAgICB2YXIgaT0wO1xuICAgIGZvcih2YXIgaT0wOyBpPHRoaXMuc3RhdGUuZW50cmllcy5sZW5ndGg7IGkrKyl7XG4gICAgICBpZih0aGlzLnN0YXRlLmVudHJpZXNbaV0uaW5kZXhPZih0b2ZpbmQpPT10aGlzLnN0YXRlLmVudHJpZXNbaV0ubGVuZ3RoLTEpe1xuICAgICAgICBvdXQucHVzaChbdGhpcy5zdGF0ZS5lbnRyaWVzW2ldLGldKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5zZXRTdGF0ZSh7cmVzdWx0Om91dH0pO1xuICB9LFxuICBzZWFyY2hfbWlkZGxlOiBmdW5jdGlvbih0b2ZpbmQpIHtcbiAgICB2YXIgb3V0PVtdO1xuICAgIHZhciBpPTA7XG4gICAgZm9yKHZhciBpPTA7IGk8dGhpcy5zdGF0ZS5lbnRyaWVzLmxlbmd0aDsgaSsrKXtcbiAgICAgIHZhciBlbnQ9dGhpcy5zdGF0ZS5lbnRyaWVzW2ldO1xuICAgICAgaWYoZW50LmluZGV4T2YodG9maW5kKSA+LTEgJiYgZW50LmluZGV4T2YodG9maW5kKSE9MCAmJiBlbnQuaW5kZXhPZih0b2ZpbmQpIT1lbnQubGVuZ3RoLTEpe1xuICAgICAgICBvdXQucHVzaChbdGhpcy5zdGF0ZS5lbnRyaWVzW2ldLGldKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5zZXRTdGF0ZSh7cmVzdWx0Om91dH0pOyAgXG4gIH0sXG5cbiAgc2VhcmNoX2Z1bGx0ZXh0OiBmdW5jdGlvbih0b2ZpbmQpIHtcbiAgICB2YXIgdGhhdD10aGlzO1xuICAgIHZhciBvdXQ9W107XG4gICAga3NlLnNlYXJjaChcIm1vZWRpY3RcIix0b2ZpbmQse3JhbmdlOntzdGFydDowLG1heHNlZzo1MDB9fSxmdW5jdGlvbihlcnIsZGF0YSl7XG4gICAgICBvdXQ9ZGF0YS5leGNlcnB0Lm1hcChmdW5jdGlvbihpdGVtKXtyZXR1cm4gW2l0ZW0uc2VnbmFtZSxpdGVtLnNlZ107fSk7XG4gICAgICB0aGF0LnNldFN0YXRlKHtyZXN1bHQ6b3V0fSk7XG4gICAgfSkgXG4gICAgLy8ga3NlLmhpZ2hsaWdodFNlZyh0aGlzLnN0YXRlLmRiLDAse3E6dG9maW5kLG5vc3Bhbjp0cnVlfSxmdW5jdGlvbihkYXRhKXtcbiAgICAvLyAgIG91dD1kYXRhLmV4Y2VycHQubWFwKGZ1bmN0aW9uKGl0ZW0pe3JldHVybiBbaXRlbS5zZWduYW1lLGl0ZW0uc2VnXTt9KTtcbiAgICAvLyAgIHRoYXQuc2V0U3RhdGUoe3Jlc3VsdDpvdXR9KTtcbiAgICAvLyB9KTtcbiAgfSxcbiAgZGVmU2VhcmNoOiBmdW5jdGlvbih0b2ZpbmQscmVzZXQpIHsvL+m7numBuGRlZuWBmuaQnOWwi+WwseaYr+eUqGRlZlNlYXJjaFxuICAgIHRoaXMuc2V0U3RhdGUoe3RvZmluZDp0b2ZpbmR9KTtcbiAgICBpZihyZXNldD09MSkgZGVmcz1bXTtcbiAgICB2YXIgdGhhdD10aGlzO1xuICAgIHZhciBpbmRleD1hcGkuaW5kZXhPZlNvcnRlZCh0aGlzLnN0YXRlLmVudHJpZXMsdG9maW5kKTtcbiAgICBpZih0aGlzLnN0YXRlLmVudHJpZXNbaW5kZXhdPT10b2ZpbmQpe1xuICAgICAga2RlLm9wZW4oXCJtb2VkaWN0XCIsZnVuY3Rpb24oZXJyLGRiKXtcbiAgICAgICAgdmFyIGRlZj1kYi5nZXQoW1wiZmlsZWNvbnRlbnRzXCIsMCxpbmRleF0sZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgICAgZGVmcy5wdXNoKFtkYXRhLGluZGV4XSk7XG4gICAgICAgICAgdGhhdC5zZXRTdGF0ZSh7ZGVmczpkZWZzfSk7XG4gICAgICAgICAgLy90aGF0LnN0YXRlLmRlZnMucHVzaChkYXRhKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTsgICAgXG4gICAgfVxuICB9LFxuICBnb3RvRW50cnk6IGZ1bmN0aW9uKGluZGV4KSB7Ly8g5b6e5LiL5ouJ6YG45Zau6bue6YG455qE6aCF55uub3Ig6buec2VhcmNoaGlzdG9yeeacg+eUqGdvdG9FbnRyeSDkvobpoa/npLpkZWZcbiAgICB2YXIgdGhhdD10aGlzO1xuICAgIHZhciBkZWZzPVtdO1xuICAgIGtkZS5vcGVuKFwibW9lZGljdFwiLGZ1bmN0aW9uKGVycixkYil7XG4gICAgICAvL3ZhciBkZWY9ZGIuZ2V0KFwibW9lZGljdC5maWxlQ29udGVudHMuMC5cIitpbmRleCk7XG4gICAgICB2YXIgZGVmPWRiLmdldChbXCJmaWxlY29udGVudHNcIiwwLGluZGV4XSxmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgZGVmcy5wdXNoKFtkYXRhLGluZGV4XSk7XG4gICAgICAgIHRoYXQuc2V0U3RhdGUoe2RlZnM6ZGVmc30pO1xuICAgICAgfSk7XG4gICAgfSk7IFxuICB9LFxuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybihcbiAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwiZW50cmllYXJlYVwifSwgXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwiY2VudGVyIHRvb2xiYXJcIn0sIFxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFNlYXJjaGJhciwge2Rvc2VhcmNoOiB0aGlzLmRvc2VhcmNofSksIFxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KE92ZXJ2aWV3LCB7cmVzdWx0OiB0aGlzLnN0YXRlLnJlc3VsdCwgZ290b0VudHJ5OiB0aGlzLmdvdG9FbnRyeX0pLCBcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImJyXCIsIG51bGwpXG4gICAgICApLCBcbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoU2hvd3RleHQsIHtnb3RvRW50cnk6IHRoaXMuZ290b0VudHJ5LCBkZWZTZWFyY2g6IHRoaXMuZGVmU2VhcmNoLCBkZWZzOiB0aGlzLnN0YXRlLmRlZnMsIHRvZmluZDogdGhpcy5zdGF0ZS50b2ZpbmQsIHJlc3VsdDogdGhpcy5zdGF0ZS5yZXN1bHR9KVxuICAgIClcbiAgICApO1xuICB9XG59KTtcbm1vZHVsZS5leHBvcnRzPW1haW5jb21wb25lbnQ7IiwidmFyIE92ZXJ2aWV3PVJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogXCJPdmVydmlld1wiLFxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICBcdHJldHVybiB7fTtcbiAgfSxcbiAgZ2V0RGVmRnJvbUVudHJ5SWQ6IGZ1bmN0aW9uKGUpIHtcbiAgICB2YXIgZW50cnlJbmRleD1lLnRhcmdldC52YWx1ZTtcbiAgICB0aGlzLnByb3BzLmdvdG9FbnRyeShlbnRyeUluZGV4KTtcbiAgfSxcbiAgc2hvdWxkQ29tcG9uZW50VXBkYXRlOiBmdW5jdGlvbihuZXh0UHJvcHMsbmV4dFN0YXRlKSB7XG4gICAgaWYobmV4dFByb3BzLnJlc3VsdD09dGhpcy5wcm9wcy5yZXN1bHQpIHJldHVybiBmYWxzZTtcbiAgICBlbHNlIHJldHVybiB0cnVlO1xuICB9LFxuICBjb21wb25lbnREaWRVcGRhdGU6IGZ1bmN0aW9uKCkge1xuICAgIHZhciB0aGF0PXRoaXM7XG4gICAgaWYodGhpcy5wcm9wcy5yZXN1bHQubGVuZ3RoIT0wKXtcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgdGhhdC5yZWZzLmVudHJ5TGlzdC5nZXRET01Ob2RlKCkuc2VsZWN0ZWRJbmRleD0wO1xuICAgICAgIHRoYXQucHJvcHMuZ290b0VudHJ5KHRoYXQucHJvcHMucmVzdWx0WzBdWzFdKTsgXG4gICAgICB9LDUwMCk7XG4gICAgIH1cbiAgICAvL2lmKGRlZmF1bHRJbmRleCkgdGhpcy5hdXRvZ2V0RW50cnkoZGVmYXVsdEluZGV4KTtcbiAgfSxcbiAgcmVuZGVyUmVzdWx0OiBmdW5jdGlvbihpdGVtLGluZGV4KSB7XG4gICAgaWYoaXRlbSE9XCLmkJzlsIvntZDmnpzliJfooahcIikgcmV0dXJuIChSZWFjdC5jcmVhdGVFbGVtZW50KFwib3B0aW9uXCIsIHt2YWx1ZTogaXRlbVsxXX0sIGl0ZW1bMF0pKTtcbiAgICBlbHNlIHJldHVybiAoUmVhY3QuY3JlYXRlRWxlbWVudChcIm9wdGlvblwiLCBudWxsLCBpdGVtKSk7XG4gIH0sXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHJlc0NvdW50ZXI9MDtcbiAgXHR2YXIgcmVzPXRoaXMucHJvcHMucmVzdWx0IHx8IFwiXCI7XG4gICAgaWYocmVzIT1cIuaQnOWwi+e1kOaenOWIl+ihqFwiKSByZXNDb3VudGVyPXJlcy5sZW5ndGg7XG4gICAgcmV0dXJuKFxuXHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIG51bGwsIFxuICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIsIHtjbGFzc05hbWU6IFwiY291bnRlclwifSwgcmVzQ291bnRlciksIFxuXHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcInNlbGVjdFwiLCB7Y2xhc3NOYW1lOiBcInJlc3VsdGxpc3RcIiwgcmVmOiBcImVudHJ5TGlzdFwiLCBvbkNoYW5nZTogdGhpcy5nZXREZWZGcm9tRW50cnlJZH0sIFxuICAgICAgdGhpcy5wcm9wcy5yZXN1bHQubWFwKHRoaXMucmVuZGVyUmVzdWx0KVxuXHRcdFx0KVxuXHQpXHRcbiAgICApOyBcbiAgfVxufSk7XG5tb2R1bGUuZXhwb3J0cz1PdmVydmlldzsiLCJ2YXIgU2VhcmNoYmFyPVJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogXCJTZWFyY2hiYXJcIixcbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgXHRyZXR1cm4ge2ZpZWxkOltdfTtcbiAgfSxcbiAgY29tcG9uZW50V2lsbFVwZGF0ZTogZnVuY3Rpb24oKSB7XG5cdCQoXCJsYWJlbFtkYXRhLXR5cGU9J1wiK3RoaXMuc3RhdGUuZmllbGQrXCInXVwiKS5hdHRyKCdpZCcsICdjaGVja2VkZmllbGQnKTtcbiAgfSxcbiAgdG9kb3NlYXJjaDogZnVuY3Rpb24oZSkge1xuICBcdCQoXCJsYWJlbFwiKS5yZW1vdmVBdHRyKCdpZCcpO1xuICBcdHZhciB0b2ZpbmQ9dGhpcy5yZWZzLnRvZmluZC5nZXRET01Ob2RlKCkudmFsdWU7XG4gICAgLy92YXIgZmllbGQ9JCh0aGlzLnJlZnMuc2VhcmNodHlwZS5nZXRET01Ob2RlKCkpLmZpbmQoXCJsYWJlbFwiKVswXS5kYXRhc2V0LnR5cGU7XG4gICAgdmFyIGZpZWxkPWUudGFyZ2V0LmRhdGFzZXQudHlwZTtcbiAgICB0aGlzLnNldFN0YXRlKHtmaWVsZDpmaWVsZH0pO1xuICBcdGlmKHRvZmluZCkgdGhpcy5wcm9wcy5kb3NlYXJjaCh0b2ZpbmQsZmllbGQpO1xuICB9LFxuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybihcbiAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCBudWxsLCBcbiAgXHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIG51bGwsIFxuXHQgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgbnVsbCwgXG5cdCAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIiwge2NsYXNzTmFtZTogXCJtYWluaW5wdXRcIiwgdHlwZTogXCJ0ZXh0XCIsIHJlZjogXCJ0b2ZpbmRcIiwgcGxhY2Vob2xkZXI6IFwi6KuL6Ly45YWl5a2X6KmeXCIsIGRlZmF1bHRWYWx1ZTogXCLmnIhcIiwgb25LZXlEb3duOiB0aGlzLmRvc2VhcmNoLCBvbkNoYW5nZTogdGhpcy5kb3NlYXJjaH0pXG5cdCAgKSwgXG5cdCAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcInJhZGlvLXRvb2xiYXJcIiwgcmVmOiBcInNlYXJjaHR5cGVcIiwgb25DbGljazogdGhpcy50b2Rvc2VhcmNofSwgXG5cdCAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwibGFiZWxcIiwge1wiZGF0YS10eXBlXCI6IFwic3RhcnRcIn0sIFxuXHQgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIiwge3R5cGU6IFwicmFkaW9cIiwgbmFtZTogXCJmaWVsZFwiLCBhdXRvY29tcGxldGU6IFwib2ZmXCIsIGNoZWNrZWQ6IFwiY2hlY2tlZFwifSwgXCLpoK1cIilcblx0ICAgICksIFxuXHQgICAgXCLCoMKgXCIsIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJsYWJlbFwiLCB7XCJkYXRhLXR5cGVcIjogXCJlbmRcIn0sIFxuXHQgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIiwge3R5cGU6IFwicmFkaW9cIiwgbmFtZTogXCJmaWVsZFwiLCBhdXRvY29tcGxldGU6IFwib2ZmXCJ9LCBcIuWwvlwiKVxuXHQgICAgKSwgXG5cdCAgICBcIsKgwqBcIiwgUmVhY3QuY3JlYXRlRWxlbWVudChcImxhYmVsXCIsIHtcImRhdGEtdHlwZVwiOiBcIm1pZGRsZVwifSwgXG5cdCAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiLCB7dHlwZTogXCJyYWRpb1wiLCBuYW1lOiBcImZpZWxkXCIsIGF1dG9jb21wbGV0ZTogXCJvZmZcIn0sIFwi5LitXCIpXG5cdCAgICApLCBcblx0ICAgIFwiwqDCoFwiLCBSZWFjdC5jcmVhdGVFbGVtZW50KFwibGFiZWxcIiwge1wiZGF0YS10eXBlXCI6IFwiZnVsbHRleHRcIn0sIFxuXHQgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIiwge3R5cGU6IFwicmFkaW9cIiwgbmFtZTogXCJmaWVsZFwiLCBhdXRvY29tcGxldGU6IFwib2ZmXCJ9LCBcIuWFqFwiKVxuXHQgICAgKVxuXHQgIClcblx0KVxuICApXG4gICAgXHRcbiAgICApOyBcbiAgfVxufSk7XG5tb2R1bGUuZXhwb3J0cz1TZWFyY2hiYXI7IiwidmFyIFNlYXJjaGhpc3Rvcnk9UmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiBcIlNlYXJjaGhpc3RvcnlcIixcbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgXHRyZXR1cm4ge307XG4gIH0sXG4gIGdvRW50cnk6IGZ1bmN0aW9uKGUpIHtcbiAgXHR2YXIgZW50cnlJbmRleD1lLnRhcmdldC5kYXRhc2V0LmVudHJ5O1xuICBcdHZhciB0aGF0PXRoaXM7XG4gIFx0dGhpcy5wcm9wcy5lbnRyeUhpc3RvcnkubWFwKGZ1bmN0aW9uKGl0ZW0saW5kZXgpe1xuICBcdFx0aWYoaXRlbVsxXT09ZW50cnlJbmRleCkge1xuICBcdFx0XHRpZihpbmRleD09MCkgdGhhdC5wcm9wcy5kZWZTZWFyY2goaXRlbVsyXSwxKTtcbiAgXHRcdFx0ZWxzZSB0aGF0LnByb3BzLmRvc2VhcmNoKGl0ZW1bMl0pO1xuICBcdFx0XHR0aGF0LnByb3BzLnBvcEhpc3RvcnkoaW5kZXgpO1xuICBcdFx0fVxuICBcdH0pXG4gIH0sXG4gIHJlbmRlckhpc3Rvcnk6IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgXHRyZXR1cm4gJzxhIGRhdGEtZW50cnk9JytpdGVtWzFdKyc+JytpdGVtWzBdKyc8L2E+JztcbiAgfSxcbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgXHR2YXIgcz10aGlzLnByb3BzLmVudHJ5SGlzdG9yeTtcbiAgXHR2YXIgcmVzPXMubWFwKHRoaXMucmVuZGVySGlzdG9yeSk7XG4gIFx0dmFyIHNlYXJjaGhpc3Rvcnk9cmVzLmpvaW4oXCIgPiBcIik7XG4gICAgcmV0dXJuKFxuXHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtvbkNsaWNrOiB0aGlzLmdvRW50cnl9LCBcblx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwiaGlzdG9yeVwiLCBkYW5nZXJvdXNseVNldElubmVySFRNTDoge19faHRtbDogc2VhcmNoaGlzdG9yeX19KVxuXHQpXG4gICAgXHRcbiAgICApOyBcbiAgfVxufSk7XG5tb2R1bGUuZXhwb3J0cz1TZWFyY2hoaXN0b3J5OyIsInZhciBTZWFyY2hoaXN0b3J5PXJlcXVpcmUoXCIuL3NlYXJjaGhpc3RvcnkuanN4XCIpO1xudmFyIERlZmJveD1yZXF1aXJlKFwiLi9kZWZib3guanN4XCIpO1xudmFyIFNob3d0ZXh0PVJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogXCJTaG93dGV4dFwiLFxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICBcdHJldHVybiB7ZW50cnlIaXN0b3J5OltdLHRvZmluZDpcIlwifTtcbiAgfSxcbiAgcG9wSGlzdG9yeTogZnVuY3Rpb24oaW5kZXgpIHtcbiAgICB2YXIgaD10aGlzLnN0YXRlLmVudHJ5SGlzdG9yeTtcbiAgICBmb3IodmFyIGk9MDsgaTxoLmxlbmd0aC1pbmRleCsxOyBpKyspe1xuICAgICAgdGhpcy5zdGF0ZS5lbnRyeUhpc3RvcnkucG9wKCk7XG4gICAgICBjb25zb2xlLmxvZyhoKTtcbiAgICB9XG4gIH0sXG4gIHB1c2hIaXN0b3J5OiBmdW5jdGlvbihzZWFyY2hSZXN1bHQsY2xpY2tlZEluZGV4KSB7Ly9zZWFyY2hSZXN1bHQgW3RpdGxlLHRpdGxlSW5kZXgsdG9maW5kXVxuICAgIHZhciB0aGF0PXRoaXM7XG4gICAgc2VhcmNoUmVzdWx0Lm1hcChmdW5jdGlvbihpdGVtKXtcbiAgICAgIGlmKGl0ZW1bMV09PWNsaWNrZWRJbmRleCkgdGhhdC5zdGF0ZS5lbnRyeUhpc3RvcnkucHVzaChpdGVtKTtcbiAgICB9KTtcbiAgfSxcbiAgZG9zZWFyY2g6IGZ1bmN0aW9uKHRvZmluZCkge1xuICAgIGZvcih2YXIgaT0xOyBpPHRvZmluZC5sZW5ndGgrMTsgaSsrKXtcbiAgICAgIHZhciB0PXRvZmluZC5zdWJzdHIoMCxpKTtcbiAgICAgIHRoaXMucHJvcHMuZGVmU2VhcmNoKHQsaSk7XG4gICAgfVxuICB9LFxuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAoXG4gICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCBudWxsLCBcbiAgICBcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoU2VhcmNoaGlzdG9yeSwge3BvcEhpc3Rvcnk6IHRoaXMucG9wSGlzdG9yeSwgZGVmU2VhcmNoOiB0aGlzLnByb3BzLmRlZlNlYXJjaCwgZG9zZWFyY2g6IHRoaXMuZG9zZWFyY2gsIGdvdG9FbnRyeTogdGhpcy5wcm9wcy5nb3RvRW50cnksIGVudHJ5SGlzdG9yeTogdGhpcy5zdGF0ZS5lbnRyeUhpc3RvcnksIHJlc3VsdDogdGhpcy5wcm9wcy5yZXN1bHR9KSwgXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiYnJcIiwgbnVsbCksIFxuICAgIFx0UmVhY3QuY3JlYXRlRWxlbWVudChEZWZib3gsIHtkb3NlYXJjaDogdGhpcy5kb3NlYXJjaCwgcHVzaEhpc3Rvcnk6IHRoaXMucHVzaEhpc3RvcnksIGRlZnM6IHRoaXMucHJvcHMuZGVmcywgcmVzdWx0OiB0aGlzLnByb3BzLnJlc3VsdH0pXHRcbiAgICApXG4gICAgKTtcbiAgfVxufSk7XG5tb2R1bGUuZXhwb3J0cz1TaG93dGV4dDsiLCJ2YXIgdG9rZW5pemVycz1yZXF1aXJlKCcuL3Rva2VuaXplcnMnKTtcbnZhciBub3JtYWxpemVUYmw9bnVsbDtcbnZhciBzZXROb3JtYWxpemVUYWJsZT1mdW5jdGlvbih0Ymwsb2JqKSB7XG5cdGlmICghb2JqKSB7XG5cdFx0b2JqPXt9O1xuXHRcdGZvciAodmFyIGk9MDtpPHRibC5sZW5ndGg7aSsrKSB7XG5cdFx0XHR2YXIgYXJyPXRibFtpXS5zcGxpdChcIj1cIik7XG5cdFx0XHRvYmpbYXJyWzBdXT1hcnJbMV07XG5cdFx0fVxuXHR9XG5cdG5vcm1hbGl6ZVRibD1vYmo7XG5cdHJldHVybiBvYmo7XG59XG52YXIgbm9ybWFsaXplMT1mdW5jdGlvbih0b2tlbikge1xuXHRpZiAoIXRva2VuKSByZXR1cm4gXCJcIjtcblx0dG9rZW49dG9rZW4ucmVwbGFjZSgvWyBcXG5cXC4s77yM44CC77yB77yO44CM44CN77ya77yb44CBXS9nLCcnKS50cmltKCk7XG5cdGlmICghbm9ybWFsaXplVGJsKSByZXR1cm4gdG9rZW47XG5cdGlmICh0b2tlbi5sZW5ndGg9PTEpIHtcblx0XHRyZXR1cm4gbm9ybWFsaXplVGJsW3Rva2VuXSB8fCB0b2tlbjtcblx0fSBlbHNlIHtcblx0XHRmb3IgKHZhciBpPTA7aTx0b2tlbi5sZW5ndGg7aSsrKSB7XG5cdFx0XHR0b2tlbltpXT1ub3JtYWxpemVUYmxbdG9rZW5baV1dIHx8IHRva2VuW2ldO1xuXHRcdH1cblx0XHRyZXR1cm4gdG9rZW47XG5cdH1cbn1cbnZhciBpc1NraXAxPWZ1bmN0aW9uKHRva2VuKSB7XG5cdHZhciB0PXRva2VuLnRyaW0oKTtcblx0cmV0dXJuICh0PT1cIlwiIHx8IHQ9PVwi44CAXCIgfHwgdD09XCLigLtcIiB8fCB0PT1cIlxcblwiKTtcbn1cbnZhciBub3JtYWxpemVfdGliZXRhbj1mdW5jdGlvbih0b2tlbikge1xuXHRyZXR1cm4gdG9rZW4ucmVwbGFjZSgvW+C8jeC8iyBdL2csJycpLnRyaW0oKTtcbn1cblxudmFyIGlzU2tpcF90aWJldGFuPWZ1bmN0aW9uKHRva2VuKSB7XG5cdHZhciB0PXRva2VuLnRyaW0oKTtcblx0cmV0dXJuICh0PT1cIlwiIHx8IHQ9PVwi44CAXCIgfHwgIHQ9PVwiXFxuXCIpO1x0XG59XG52YXIgc2ltcGxlMT17XG5cdGZ1bmM6e1xuXHRcdHRva2VuaXplOnRva2VuaXplcnMuc2ltcGxlXG5cdFx0LHNldE5vcm1hbGl6ZVRhYmxlOnNldE5vcm1hbGl6ZVRhYmxlXG5cdFx0LG5vcm1hbGl6ZTogbm9ybWFsaXplMVxuXHRcdCxpc1NraXA6XHRpc1NraXAxXG5cdH1cblx0XG59XG52YXIgdGliZXRhbjE9e1xuXHRmdW5jOntcblx0XHR0b2tlbml6ZTp0b2tlbml6ZXJzLnRpYmV0YW5cblx0XHQsc2V0Tm9ybWFsaXplVGFibGU6c2V0Tm9ybWFsaXplVGFibGVcblx0XHQsbm9ybWFsaXplOm5vcm1hbGl6ZV90aWJldGFuXG5cdFx0LGlzU2tpcDppc1NraXBfdGliZXRhblxuXHR9XG59XG5tb2R1bGUuZXhwb3J0cz17XCJzaW1wbGUxXCI6c2ltcGxlMSxcInRpYmV0YW4xXCI6dGliZXRhbjF9IiwiLyogXG4gIGN1c3RvbSBmdW5jIGZvciBidWlsZGluZyBhbmQgc2VhcmNoaW5nIHlkYlxuXG4gIGtlZXAgYWxsIHZlcnNpb25cbiAgXG4gIGdldEFQSSh2ZXJzaW9uKTsgLy9yZXR1cm4gaGFzaCBvZiBmdW5jdGlvbnMgLCBpZiB2ZXIgaXMgb21pdCAsIHJldHVybiBsYXN0ZXN0XG5cdFxuICBwb3N0aW5nczJUcmVlICAgICAgLy8gaWYgdmVyc2lvbiBpcyBub3Qgc3VwcGx5LCBnZXQgbGFzdGVzdFxuICB0b2tlbml6ZSh0ZXh0LGFwaSkgLy8gY29udmVydCBhIHN0cmluZyBpbnRvIHRva2VucyhkZXBlbmRzIG9uIG90aGVyIGFwaSlcbiAgbm9ybWFsaXplVG9rZW4gICAgIC8vIHN0ZW1taW5nIGFuZCBldGNcbiAgaXNTcGFjZUNoYXIgICAgICAgIC8vIG5vdCBhIHNlYXJjaGFibGUgdG9rZW5cbiAgaXNTa2lwQ2hhciAgICAgICAgIC8vIDAgdnBvc1xuXG4gIGZvciBjbGllbnQgYW5kIHNlcnZlciBzaWRlXG4gIFxuKi9cbnZhciBjb25maWdzPXJlcXVpcmUoXCIuL2NvbmZpZ3NcIik7XG52YXIgY29uZmlnX3NpbXBsZT1cInNpbXBsZTFcIjtcbnZhciBvcHRpbWl6ZT1mdW5jdGlvbihqc29uLGNvbmZpZykge1xuXHRjb25maWc9Y29uZmlnfHxjb25maWdfc2ltcGxlO1xuXHRyZXR1cm4ganNvbjtcbn1cblxudmFyIGdldEFQST1mdW5jdGlvbihjb25maWcpIHtcblx0Y29uZmlnPWNvbmZpZ3x8Y29uZmlnX3NpbXBsZTtcblx0dmFyIGZ1bmM9Y29uZmlnc1tjb25maWddLmZ1bmM7XG5cdGZ1bmMub3B0aW1pemU9b3B0aW1pemU7XG5cdGlmIChjb25maWc9PVwic2ltcGxlMVwiKSB7XG5cdFx0Ly9hZGQgY29tbW9uIGN1c3RvbSBmdW5jdGlvbiBoZXJlXG5cdH0gZWxzZSBpZiAoY29uZmlnPT1cInRpYmV0YW4xXCIpIHtcblxuXHR9IGVsc2UgdGhyb3cgXCJjb25maWcgXCIrY29uZmlnICtcIm5vdCBzdXBwb3J0ZWRcIjtcblxuXHRyZXR1cm4gZnVuYztcbn1cblxubW9kdWxlLmV4cG9ydHM9e2dldEFQSTpnZXRBUEl9OyIsInZhciB0aWJldGFuID1mdW5jdGlvbihzKSB7XG5cdC8vY29udGludW91cyB0c2hlZyBncm91cGVkIGludG8gc2FtZSB0b2tlblxuXHQvL3NoYWQgYW5kIHNwYWNlIGdyb3VwZWQgaW50byBzYW1lIHRva2VuXG5cdHZhciBvZmZzZXQ9MDtcblx0dmFyIHRva2Vucz1bXSxvZmZzZXRzPVtdO1xuXHRzPXMucmVwbGFjZSgvXFxyXFxuL2csJ1xcbicpLnJlcGxhY2UoL1xcci9nLCdcXG4nKTtcblx0dmFyIGFycj1zLnNwbGl0KCdcXG4nKTtcblxuXHRmb3IgKHZhciBpPTA7aTxhcnIubGVuZ3RoO2krKykge1xuXHRcdHZhciBsYXN0PTA7XG5cdFx0dmFyIHN0cj1hcnJbaV07XG5cdFx0c3RyLnJlcGxhY2UoL1vgvI3gvIsgXSsvZyxmdW5jdGlvbihtLG0xKXtcblx0XHRcdHRva2Vucy5wdXNoKHN0ci5zdWJzdHJpbmcobGFzdCxtMSkrbSk7XG5cdFx0XHRvZmZzZXRzLnB1c2gob2Zmc2V0K2xhc3QpO1xuXHRcdFx0bGFzdD1tMSttLmxlbmd0aDtcblx0XHR9KTtcblx0XHRpZiAobGFzdDxzdHIubGVuZ3RoKSB7XG5cdFx0XHR0b2tlbnMucHVzaChzdHIuc3Vic3RyaW5nKGxhc3QpKTtcblx0XHRcdG9mZnNldHMucHVzaChsYXN0KTtcblx0XHR9XG5cdFx0aWYgKGk9PT1hcnIubGVuZ3RoLTEpIGJyZWFrO1xuXHRcdHRva2Vucy5wdXNoKCdcXG4nKTtcblx0XHRvZmZzZXRzLnB1c2gob2Zmc2V0K2xhc3QpO1xuXHRcdG9mZnNldCs9c3RyLmxlbmd0aCsxO1xuXHR9XG5cblx0cmV0dXJuIHt0b2tlbnM6dG9rZW5zLG9mZnNldHM6b2Zmc2V0c307XG59O1xudmFyIGlzU3BhY2U9ZnVuY3Rpb24oYykge1xuXHRyZXR1cm4gKGM9PVwiIFwiKSA7Ly98fCAoYz09XCIsXCIpIHx8IChjPT1cIi5cIik7XG59XG52YXIgaXNDSksgPWZ1bmN0aW9uKGMpIHtyZXR1cm4gKChjPj0weDMwMDAgJiYgYzw9MHg5RkZGKSBcbnx8IChjPj0weEQ4MDAgJiYgYzwweERDMDApIHx8IChjPj0weEZGMDApICkgO31cbnZhciBzaW1wbGUxPWZ1bmN0aW9uKHMpIHtcblx0dmFyIG9mZnNldD0wO1xuXHR2YXIgdG9rZW5zPVtdLG9mZnNldHM9W107XG5cdHM9cy5yZXBsYWNlKC9cXHJcXG4vZywnXFxuJykucmVwbGFjZSgvXFxyL2csJ1xcbicpO1xuXHRhcnI9cy5zcGxpdCgnXFxuJyk7XG5cblx0dmFyIHB1c2h0b2tlbj1mdW5jdGlvbih0LG9mZikge1xuXHRcdHZhciBpPTA7XG5cdFx0aWYgKHQuY2hhckNvZGVBdCgwKT4yNTUpIHtcblx0XHRcdHdoaWxlIChpPHQubGVuZ3RoKSB7XG5cdFx0XHRcdHZhciBjPXQuY2hhckNvZGVBdChpKTtcblx0XHRcdFx0b2Zmc2V0cy5wdXNoKG9mZitpKTtcblx0XHRcdFx0dG9rZW5zLnB1c2godFtpXSk7XG5cdFx0XHRcdGlmIChjPj0weEQ4MDAgJiYgYzw9MHhERkZGKSB7XG5cdFx0XHRcdFx0dG9rZW5zW3Rva2Vucy5sZW5ndGgtMV0rPXRbaV07IC8vZXh0ZW5zaW9uIEIsQyxEXG5cdFx0XHRcdH1cblx0XHRcdFx0aSsrO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHR0b2tlbnMucHVzaCh0KTtcblx0XHRcdG9mZnNldHMucHVzaChvZmYpO1x0XG5cdFx0fVxuXHR9XG5cdGZvciAodmFyIGk9MDtpPGFyci5sZW5ndGg7aSsrKSB7XG5cdFx0dmFyIGxhc3Q9MCxzcD1cIlwiO1xuXHRcdHN0cj1hcnJbaV07XG5cdFx0c3RyLnJlcGxhY2UoL1tfMC05QS1aYS16XSsvZyxmdW5jdGlvbihtLG0xKXtcblx0XHRcdHdoaWxlIChpc1NwYWNlKHNwPXN0cltsYXN0XSkgJiYgbGFzdDxzdHIubGVuZ3RoKSB7XG5cdFx0XHRcdHRva2Vuc1t0b2tlbnMubGVuZ3RoLTFdKz1zcDtcblx0XHRcdFx0bGFzdCsrO1xuXHRcdFx0fVxuXHRcdFx0cHVzaHRva2VuKHN0ci5zdWJzdHJpbmcobGFzdCxtMSkrbSAsIG9mZnNldCtsYXN0KTtcblx0XHRcdG9mZnNldHMucHVzaChvZmZzZXQrbGFzdCk7XG5cdFx0XHRsYXN0PW0xK20ubGVuZ3RoO1xuXHRcdH0pO1xuXG5cdFx0aWYgKGxhc3Q8c3RyLmxlbmd0aCkge1xuXHRcdFx0d2hpbGUgKGlzU3BhY2Uoc3A9c3RyW2xhc3RdKSAmJiBsYXN0PHN0ci5sZW5ndGgpIHtcblx0XHRcdFx0dG9rZW5zW3Rva2Vucy5sZW5ndGgtMV0rPXNwO1xuXHRcdFx0XHRsYXN0Kys7XG5cdFx0XHR9XG5cdFx0XHRwdXNodG9rZW4oc3RyLnN1YnN0cmluZyhsYXN0KSwgb2Zmc2V0K2xhc3QpO1xuXHRcdFx0XG5cdFx0fVx0XHRcblx0XHRvZmZzZXRzLnB1c2gob2Zmc2V0K2xhc3QpO1xuXHRcdG9mZnNldCs9c3RyLmxlbmd0aCsxO1xuXHRcdGlmIChpPT09YXJyLmxlbmd0aC0xKSBicmVhaztcblx0XHR0b2tlbnMucHVzaCgnXFxuJyk7XG5cdH1cblxuXHRyZXR1cm4ge3Rva2Vuczp0b2tlbnMsb2Zmc2V0czpvZmZzZXRzfTtcblxufTtcblxudmFyIHNpbXBsZT1mdW5jdGlvbihzKSB7XG5cdHZhciB0b2tlbj0nJztcblx0dmFyIHRva2Vucz1bXSwgb2Zmc2V0cz1bXSA7XG5cdHZhciBpPTA7IFxuXHR2YXIgbGFzdHNwYWNlPWZhbHNlO1xuXHR2YXIgYWRkdG9rZW49ZnVuY3Rpb24oKSB7XG5cdFx0aWYgKCF0b2tlbikgcmV0dXJuO1xuXHRcdHRva2Vucy5wdXNoKHRva2VuKTtcblx0XHRvZmZzZXRzLnB1c2goaSk7XG5cdFx0dG9rZW49Jyc7XG5cdH1cblx0d2hpbGUgKGk8cy5sZW5ndGgpIHtcblx0XHR2YXIgYz1zLmNoYXJBdChpKTtcblx0XHR2YXIgY29kZT1zLmNoYXJDb2RlQXQoaSk7XG5cdFx0aWYgKGlzQ0pLKGNvZGUpKSB7XG5cdFx0XHRhZGR0b2tlbigpO1xuXHRcdFx0dG9rZW49Yztcblx0XHRcdGlmIChjb2RlPj0weEQ4MDAgJiYgY29kZTwweERDMDApIHsgLy9oaWdoIHNvcnJhZ2F0ZVxuXHRcdFx0XHR0b2tlbis9cy5jaGFyQXQoaSsxKTtpKys7XG5cdFx0XHR9XG5cdFx0XHRhZGR0b2tlbigpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRpZiAoYz09JyYnIHx8IGM9PSc8JyB8fCBjPT0nPycgfHwgYz09XCIsXCIgfHwgYz09XCIuXCJcblx0XHRcdHx8IGM9PSd8JyB8fCBjPT0nficgfHwgYz09J2AnIHx8IGM9PSc7JyBcblx0XHRcdHx8IGM9PSc+JyB8fCBjPT0nOicgXG5cdFx0XHR8fCBjPT0nPScgfHwgYz09J0AnICB8fCBjPT1cIi1cIiBcblx0XHRcdHx8IGM9PSddJyB8fCBjPT0nfScgIHx8IGM9PVwiKVwiIFxuXHRcdFx0Ly98fCBjPT0neycgfHwgYz09J30nfHwgYz09J1snIHx8IGM9PSddJyB8fCBjPT0nKCcgfHwgYz09JyknXG5cdFx0XHR8fCBjb2RlPT0weGYwYiB8fCBjb2RlPT0weGYwZCAvLyB0aWJldGFuIHNwYWNlXG5cdFx0XHR8fCAoY29kZT49MHgyMDAwICYmIGNvZGU8PTB4MjA2ZikpIHtcblx0XHRcdFx0YWRkdG9rZW4oKTtcblx0XHRcdFx0aWYgKGM9PScmJyB8fCBjPT0nPCcpeyAvLyB8fCBjPT0neyd8fCBjPT0nKCd8fCBjPT0nWycpIHtcblx0XHRcdFx0XHR2YXIgZW5kY2hhcj0nPic7XG5cdFx0XHRcdFx0aWYgKGM9PScmJykgZW5kY2hhcj0nOydcblx0XHRcdFx0XHQvL2Vsc2UgaWYgKGM9PSd7JykgZW5kY2hhcj0nfSc7XG5cdFx0XHRcdFx0Ly9lbHNlIGlmIChjPT0nWycpIGVuZGNoYXI9J10nO1xuXHRcdFx0XHRcdC8vZWxzZSBpZiAoYz09JygnKSBlbmRjaGFyPScpJztcblxuXHRcdFx0XHRcdHdoaWxlIChpPHMubGVuZ3RoICYmIHMuY2hhckF0KGkpIT1lbmRjaGFyKSB7XG5cdFx0XHRcdFx0XHR0b2tlbis9cy5jaGFyQXQoaSk7XG5cdFx0XHRcdFx0XHRpKys7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHRva2VuKz1lbmRjaGFyO1xuXHRcdFx0XHRcdGFkZHRva2VuKCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dG9rZW49Yztcblx0XHRcdFx0XHRhZGR0b2tlbigpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHRva2VuPScnO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0aWYgKGM9PVwiIFwiKSB7XG5cdFx0XHRcdFx0dG9rZW4rPWM7XG5cdFx0XHRcdFx0bGFzdHNwYWNlPXRydWU7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0aWYgKGxhc3RzcGFjZSkgYWRkdG9rZW4oKTtcblx0XHRcdFx0XHRsYXN0c3BhY2U9ZmFsc2U7XG5cdFx0XHRcdFx0dG9rZW4rPWM7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0aSsrO1xuXHR9XG5cdGFkZHRva2VuKCk7XG5cdHJldHVybiB7dG9rZW5zOnRva2VucyxvZmZzZXRzOm9mZnNldHN9O1xufVxubW9kdWxlLmV4cG9ydHM9e3NpbXBsZTpzaW1wbGUsdGliZXRhbjp0aWJldGFufTsiLCJ2YXIgaW5kZXhPZlNvcnRlZCA9IGZ1bmN0aW9uIChhcnJheSwgb2JqLCBuZWFyKSB7IFxuICB2YXIgbG93ID0gMCxcbiAgaGlnaCA9IGFycmF5Lmxlbmd0aDtcbiAgd2hpbGUgKGxvdyA8IGhpZ2gpIHtcbiAgICB2YXIgbWlkID0gKGxvdyArIGhpZ2gpID4+IDE7XG4gICAgaWYgKGFycmF5W21pZF09PW9iaikgcmV0dXJuIG1pZDtcbiAgICBhcnJheVttaWRdIDwgb2JqID8gbG93ID0gbWlkICsgMSA6IGhpZ2ggPSBtaWQ7XG4gIH1cbiAgaWYgKG5lYXIpIHJldHVybiBsb3c7XG4gIGVsc2UgaWYgKGFycmF5W2xvd109PW9iaikgcmV0dXJuIGxvdztlbHNlIHJldHVybiAtMTtcbn07XG52YXIgaW5kZXhPZlNvcnRlZF9zdHIgPSBmdW5jdGlvbiAoYXJyYXksIG9iaiwgbmVhcikgeyBcbiAgdmFyIGxvdyA9IDAsXG4gIGhpZ2ggPSBhcnJheS5sZW5ndGg7XG4gIHdoaWxlIChsb3cgPCBoaWdoKSB7XG4gICAgdmFyIG1pZCA9IChsb3cgKyBoaWdoKSA+PiAxO1xuICAgIGlmIChhcnJheVttaWRdPT1vYmopIHJldHVybiBtaWQ7XG4gICAgLy8oYXJyYXlbbWlkXS5sb2NhbGVDb21wYXJlKG9iaik8MCkgPyBsb3cgPSBtaWQgKyAxIDogaGlnaCA9IG1pZDtcbiAgICBhcnJheVttaWRdPG9iaiA/IGxvdz1taWQrMSA6IGhpZ2g9bWlkO1xuICB9XG4gIGlmIChuZWFyKSByZXR1cm4gbG93O1xuICBlbHNlIGlmIChhcnJheVtsb3ddPT1vYmopIHJldHVybiBsb3c7ZWxzZSByZXR1cm4gLTE7XG59O1xuXG5cbnZhciBic2VhcmNoPWZ1bmN0aW9uKGFycmF5LHZhbHVlLG5lYXIpIHtcblx0dmFyIGZ1bmM9aW5kZXhPZlNvcnRlZDtcblx0aWYgKHR5cGVvZiBhcnJheVswXT09XCJzdHJpbmdcIikgZnVuYz1pbmRleE9mU29ydGVkX3N0cjtcblx0cmV0dXJuIGZ1bmMoYXJyYXksdmFsdWUsbmVhcik7XG59XG52YXIgYnNlYXJjaE5lYXI9ZnVuY3Rpb24oYXJyYXksdmFsdWUpIHtcblx0cmV0dXJuIGJzZWFyY2goYXJyYXksdmFsdWUsdHJ1ZSk7XG59XG5cbm1vZHVsZS5leHBvcnRzPWJzZWFyY2g7Ly97YnNlYXJjaE5lYXI6YnNlYXJjaE5lYXIsYnNlYXJjaDpic2VhcmNofTsiLCJ2YXIgS0RFPXJlcXVpcmUoXCIuL2tkZVwiKTtcbi8vY3VycmVudGx5IG9ubHkgc3VwcG9ydCBub2RlLmpzIGZzLCBrc2FuYWdhcCBuYXRpdmUgZnMsIGh0bWw1IGZpbGUgc3lzdGVtXG4vL3VzZSBzb2NrZXQuaW8gdG8gcmVhZCBrZGIgZnJvbSByZW1vdGUgc2VydmVyIGluIGZ1dHVyZVxubW9kdWxlLmV4cG9ydHM9S0RFOyIsIi8qIEtzYW5hIERhdGFiYXNlIEVuZ2luZVxuXG4gICAyMDE1LzEvMiAsIFxuICAgbW92ZSB0byBrc2FuYS1kYXRhYmFzZVxuICAgc2ltcGxpZmllZCBieSByZW1vdmluZyBkb2N1bWVudCBzdXBwb3J0IGFuZCBzb2NrZXQuaW8gc3VwcG9ydFxuXG5cbiovXG52YXIgcG9vbD17fSxsb2NhbFBvb2w9e307XG52YXIgYXBwcGF0aD1cIlwiO1xudmFyIGJzZWFyY2g9cmVxdWlyZShcIi4vYnNlYXJjaFwiKTtcbnZhciBLZGI9cmVxdWlyZSgna3NhbmEtanNvbnJvbScpO1xudmFyIGtkYnM9W107IC8vYXZhaWxhYmxlIGtkYiAsIGlkIGFuZCBhYnNvbHV0ZSBwYXRoXG52YXIgc3Ryc2VwPVwiXFx1ZmZmZlwiO1xudmFyIGtkYmxpc3RlZD1mYWxzZTtcbi8qXG52YXIgX2dldFN5bmM9ZnVuY3Rpb24ocGF0aHMsb3B0cykge1xuXHR2YXIgb3V0PVtdO1xuXHRmb3IgKHZhciBpIGluIHBhdGhzKSB7XG5cdFx0b3V0LnB1c2godGhpcy5nZXRTeW5jKHBhdGhzW2ldLG9wdHMpKTtcdFxuXHR9XG5cdHJldHVybiBvdXQ7XG59XG4qL1xudmFyIF9nZXRzPWZ1bmN0aW9uKHBhdGhzLG9wdHMsY2IpIHsgLy9nZXQgbWFueSBkYXRhIHdpdGggb25lIGNhbGxcblxuXHRpZiAoIXBhdGhzKSByZXR1cm4gO1xuXHRpZiAodHlwZW9mIHBhdGhzPT0nc3RyaW5nJykge1xuXHRcdHBhdGhzPVtwYXRoc107XG5cdH1cblx0dmFyIGVuZ2luZT10aGlzLCBvdXRwdXQ9W107XG5cblx0dmFyIG1ha2VjYj1mdW5jdGlvbihwYXRoKXtcblx0XHRyZXR1cm4gZnVuY3Rpb24oZGF0YSl7XG5cdFx0XHRcdGlmICghKGRhdGEgJiYgdHlwZW9mIGRhdGEgPT0nb2JqZWN0JyAmJiBkYXRhLl9fZW1wdHkpKSBvdXRwdXQucHVzaChkYXRhKTtcblx0XHRcdFx0ZW5naW5lLmdldChwYXRoLG9wdHMsdGFza3F1ZXVlLnNoaWZ0KCkpO1xuXHRcdH07XG5cdH07XG5cblx0dmFyIHRhc2txdWV1ZT1bXTtcblx0Zm9yICh2YXIgaT0wO2k8cGF0aHMubGVuZ3RoO2krKykge1xuXHRcdGlmICh0eXBlb2YgcGF0aHNbaV09PVwibnVsbFwiKSB7IC8vdGhpcyBpcyBvbmx5IGEgcGxhY2UgaG9sZGVyIGZvciBrZXkgZGF0YSBhbHJlYWR5IGluIGNsaWVudCBjYWNoZVxuXHRcdFx0b3V0cHV0LnB1c2gobnVsbCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRhc2txdWV1ZS5wdXNoKG1ha2VjYihwYXRoc1tpXSkpO1xuXHRcdH1cblx0fTtcblxuXHR0YXNrcXVldWUucHVzaChmdW5jdGlvbihkYXRhKXtcblx0XHRvdXRwdXQucHVzaChkYXRhKTtcblx0XHRjYi5hcHBseShlbmdpbmUuY29udGV4dHx8ZW5naW5lLFtvdXRwdXQscGF0aHNdKTsgLy9yZXR1cm4gdG8gY2FsbGVyXG5cdH0pO1xuXG5cdHRhc2txdWV1ZS5zaGlmdCgpKHtfX2VtcHR5OnRydWV9KTsgLy9ydW4gdGhlIHRhc2tcbn1cblxudmFyIGdldEZpbGVSYW5nZT1mdW5jdGlvbihpKSB7XG5cdHZhciBlbmdpbmU9dGhpcztcblxuXHR2YXIgZmlsZXNlZ2NvdW50PWVuZ2luZS5nZXQoW1wiZmlsZXNlZ2NvdW50XCJdKTtcblx0aWYgKGZpbGVzZWdjb3VudCkge1xuXHRcdGlmIChpPT0wKSB7XG5cdFx0XHRyZXR1cm4ge3N0YXJ0OjAsZW5kOmZpbGVzZWdjb3VudFswXS0xfTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHtzdGFydDpmaWxlc2VnY291bnRbaS0xXSxlbmQ6ZmlsZXNlZ2NvdW50W2ldLTF9O1xuXHRcdH1cblx0fVxuXHQvL29sZCBidWdneSBjb2RlXG5cdHZhciBmaWxlbmFtZXM9ZW5naW5lLmdldChbXCJmaWxlbmFtZXNcIl0pO1xuXHR2YXIgZmlsZW9mZnNldHM9ZW5naW5lLmdldChbXCJmaWxlb2Zmc2V0c1wiXSk7XG5cdHZhciBzZWdvZmZzZXRzPWVuZ2luZS5nZXQoW1wic2Vnb2Zmc2V0c1wiXSk7XG5cdHZhciBzZWduYW1lcz1lbmdpbmUuZ2V0KFtcInNlZ25hbWVzXCJdKTtcblx0dmFyIGZpbGVzdGFydD1maWxlb2Zmc2V0c1tpXSwgZmlsZWVuZD1maWxlb2Zmc2V0c1tpKzFdLTE7XG5cblx0dmFyIHN0YXJ0PWJzZWFyY2goc2Vnb2Zmc2V0cyxmaWxlc3RhcnQsdHJ1ZSk7XG5cdC8vaWYgKHNlZ09mZnNldHNbc3RhcnRdPT1maWxlU3RhcnQpIHN0YXJ0LS07XG5cdFxuXHQvL3dvcmsgYXJvdW5kIGZvciBqaWFuZ2thbmd5dXJcblx0d2hpbGUgKHNlZ05hbWVzW3N0YXJ0KzFdPT1cIl9cIikgc3RhcnQrKztcblxuICAvL2lmIChpPT0wKSBzdGFydD0wOyAvL3dvcmsgYXJvdW5kIGZvciBmaXJzdCBmaWxlXG5cdHZhciBlbmQ9YnNlYXJjaChzZWdvZmZzZXRzLGZpbGVlbmQsdHJ1ZSk7XG5cdHJldHVybiB7c3RhcnQ6c3RhcnQsZW5kOmVuZH07XG59XG5cbnZhciBnZXRmaWxlc2VnPWZ1bmN0aW9uKGFic29sdXRlc2VnKSB7XG5cdHZhciBmaWxlb2Zmc2V0cz10aGlzLmdldChbXCJmaWxlb2Zmc2V0c1wiXSk7XG5cdHZhciBzZWdvZmZzZXRzPXRoaXMuZ2V0KFtcInNlZ29mZnNldHNcIl0pO1xuXHR2YXIgc2Vnb2Zmc2V0PXNlZ29mZnNldHNbYWJzb2x1dGVzZWddO1xuXHR2YXIgZmlsZT1ic2VhcmNoKGZpbGVvZmZzZXRzLHNlZ29mZnNldCx0cnVlKS0xO1xuXG5cdHZhciBmaWxlU3RhcnQ9ZmlsZW9mZnNldHNbZmlsZV07XG5cdHZhciBzdGFydD1ic2VhcmNoKHNlZ29mZnNldHMsZmlsZVN0YXJ0LHRydWUpO1x0XG5cblx0dmFyIHNlZz1hYnNvbHV0ZXNlZy1zdGFydC0xO1xuXHRyZXR1cm4ge2ZpbGU6ZmlsZSxzZWc6c2VnfTtcbn1cbi8vcmV0dXJuIGFycmF5IG9mIG9iamVjdCBvZiBuZmlsZSBuc2VnIGdpdmVuIHNlZ25hbWVcbnZhciBmaW5kU2VnPWZ1bmN0aW9uKHNlZ25hbWUpIHtcblx0dmFyIHNlZ25hbWVzPXRoaXMuZ2V0KFwic2VnbmFtZXNcIik7XG5cdHZhciBvdXQ9W107XG5cdGZvciAodmFyIGk9MDtpPHNlZ25hbWVzLmxlbmd0aDtpKyspIHtcblx0XHRpZiAoc2VnbmFtZXNbaV09PXNlZ25hbWUpIHtcblx0XHRcdHZhciBmaWxlc2VnPWdldGZpbGVzZWcuYXBwbHkodGhpcyxbaV0pO1xuXHRcdFx0b3V0LnB1c2goe2ZpbGU6ZmlsZXNlZy5maWxlLHNlZzpmaWxlc2VnLnNlZyxhYnNzZWc6aX0pO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gb3V0O1xufVxudmFyIGdldEZpbGVTZWdPZmZzZXRzPWZ1bmN0aW9uKGkpIHtcblx0dmFyIHNlZ29mZnNldHM9dGhpcy5nZXQoXCJzZWdvZmZzZXRzXCIpO1xuXHR2YXIgcmFuZ2U9Z2V0RmlsZVJhbmdlLmFwcGx5KHRoaXMsW2ldKTtcblx0cmV0dXJuIHNlZ29mZnNldHMuc2xpY2UocmFuZ2Uuc3RhcnQscmFuZ2UuZW5kKzEpO1xufVxudmFyIGdldEZpbGVTZWdCeVZwb3M9ZnVuY3Rpb24odnBvcykge1xuXHR2YXIgc2Vnb2Zmc2V0cz10aGlzLmdldChbXCJzZWdvZmZzZXRzXCJdKTtcblx0dmFyIGk9YnNlYXJjaChzZWdvZmZzZXRzLHZwb3MsdHJ1ZSk7XG5cdHJldHVybiBnZXRmaWxlc2VnLmFwcGx5KHRoaXMsW2ldKTtcbn1cbnZhciBnZXRGaWxlU2VnTmFtZXM9ZnVuY3Rpb24oaSkge1xuXHR2YXIgcmFuZ2U9Z2V0RmlsZVJhbmdlLmFwcGx5KHRoaXMsW2ldKTtcblx0dmFyIHNlZ25hbWVzPXRoaXMuZ2V0KFwic2VnbmFtZXNcIik7XG5cdHJldHVybiBzZWduYW1lcy5zbGljZShyYW5nZS5zdGFydCxyYW5nZS5lbmQrMSk7XG59XG52YXIgbG9jYWxlbmdpbmVfZ2V0PWZ1bmN0aW9uKHBhdGgsb3B0cyxjYixjb250ZXh0KSB7XG5cdHZhciBlbmdpbmU9dGhpcztcblx0aWYgKHR5cGVvZiBvcHRzPT1cImZ1bmN0aW9uXCIpIHtcblx0XHRjb250ZXh0PWNiO1xuXHRcdGNiPW9wdHM7XG5cdFx0b3B0cz17cmVjdXJzaXZlOmZhbHNlfTtcblx0fVxuXHRpZiAoIXBhdGgpIHtcblx0XHRpZiAoY2IpIGNiLmFwcGx5KGNvbnRleHQsW251bGxdKTtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXG5cdGlmICh0eXBlb2YgY2IhPVwiZnVuY3Rpb25cIikge1xuXHRcdHJldHVybiBlbmdpbmUua2RiLmdldChwYXRoLG9wdHMpO1xuXHR9XG5cblx0aWYgKHR5cGVvZiBwYXRoPT1cInN0cmluZ1wiKSB7XG5cdFx0cmV0dXJuIGVuZ2luZS5rZGIuZ2V0KFtwYXRoXSxvcHRzLGNiLGNvbnRleHQpO1xuXHR9IGVsc2UgaWYgKHR5cGVvZiBwYXRoWzBdID09XCJzdHJpbmdcIikge1xuXHRcdHJldHVybiBlbmdpbmUua2RiLmdldChwYXRoLG9wdHMsY2IsY29udGV4dCk7XG5cdH0gZWxzZSBpZiAodHlwZW9mIHBhdGhbMF0gPT1cIm9iamVjdFwiKSB7XG5cdFx0cmV0dXJuIF9nZXRzLmFwcGx5KGVuZ2luZSxbcGF0aCxvcHRzLGNiLGNvbnRleHRdKTtcblx0fSBlbHNlIHtcblx0XHRlbmdpbmUua2RiLmdldChbXSxvcHRzLGZ1bmN0aW9uKGRhdGEpe1xuXHRcdFx0Y2IuYXBwbHkoY29udGV4dCxbZGF0YV0pOy8vcmV0dXJuIHRvcCBsZXZlbCBrZXlzXG5cdFx0fSxjb250ZXh0KTtcblx0fVxufTtcdFxuXG52YXIgZ2V0UHJlbG9hZEZpZWxkPWZ1bmN0aW9uKHVzZXIpIHtcblx0dmFyIHByZWxvYWQ9W1tcIm1ldGFcIl0sW1wiZmlsZW5hbWVzXCJdLFtcImZpbGVvZmZzZXRzXCJdLFtcInNlZ25hbWVzXCJdLFtcInNlZ29mZnNldHNcIl0sW1wiZmlsZXNlZ2NvdW50XCJdXTtcblx0Ly9bXCJ0b2tlbnNcIl0sW1wicG9zdGluZ3NsZW5cIl0ga3NlIHdpbGwgbG9hZCBpdFxuXHRpZiAodXNlciAmJiB1c2VyLmxlbmd0aCkgeyAvL3VzZXIgc3VwcGx5IHByZWxvYWRcblx0XHRmb3IgKHZhciBpPTA7aTx1c2VyLmxlbmd0aDtpKyspIHtcblx0XHRcdGlmIChwcmVsb2FkLmluZGV4T2YodXNlcltpXSk9PS0xKSB7XG5cdFx0XHRcdHByZWxvYWQucHVzaCh1c2VyW2ldKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblx0cmV0dXJuIHByZWxvYWQ7XG59XG52YXIgY3JlYXRlTG9jYWxFbmdpbmU9ZnVuY3Rpb24oa2RiLG9wdHMsY2IsY29udGV4dCkge1xuXHR2YXIgZW5naW5lPXtrZGI6a2RiLCBxdWVyeUNhY2hlOnt9LCBwb3N0aW5nQ2FjaGU6e30sIGNhY2hlOnt9fTtcblxuXHRpZiAodHlwZW9mIGNvbnRleHQ9PVwib2JqZWN0XCIpIGVuZ2luZS5jb250ZXh0PWNvbnRleHQ7XG5cdGVuZ2luZS5nZXQ9bG9jYWxlbmdpbmVfZ2V0O1xuXG5cdGVuZ2luZS5zZWdPZmZzZXQ9c2VnT2Zmc2V0O1xuXHRlbmdpbmUuZmlsZU9mZnNldD1maWxlT2Zmc2V0O1xuXHRlbmdpbmUuZ2V0RmlsZVNlZ05hbWVzPWdldEZpbGVTZWdOYW1lcztcblx0ZW5naW5lLmdldEZpbGVTZWdPZmZzZXRzPWdldEZpbGVTZWdPZmZzZXRzO1xuXHRlbmdpbmUuZ2V0RmlsZVJhbmdlPWdldEZpbGVSYW5nZTtcblx0ZW5naW5lLmZpbmRTZWc9ZmluZFNlZztcblx0ZW5naW5lLmdldEZpbGVTZWdCeVZwb3M9Z2V0RmlsZVNlZ0J5VnBvcztcblx0Ly9vbmx5IGxvY2FsIGVuZ2luZSBhbGxvdyBnZXRTeW5jXG5cdC8vaWYgKGtkYi5mcy5nZXRTeW5jKSBlbmdpbmUuZ2V0U3luYz1lbmdpbmUua2RiLmdldFN5bmM7XG5cdFxuXHQvL3NwZWVkeSBuYXRpdmUgZnVuY3Rpb25zXG5cdGlmIChrZGIuZnMubWVyZ2VQb3N0aW5ncykge1xuXHRcdGVuZ2luZS5tZXJnZVBvc3RpbmdzPWtkYi5mcy5tZXJnZVBvc3RpbmdzLmJpbmQoa2RiLmZzKTtcblx0fVxuXHRcblx0dmFyIHNldFByZWxvYWQ9ZnVuY3Rpb24ocmVzKSB7XG5cdFx0ZW5naW5lLmRibmFtZT1yZXNbMF0ubmFtZTtcblx0XHQvL2VuZ2luZS5jdXN0b21mdW5jPWN1c3RvbWZ1bmMuZ2V0QVBJKHJlc1swXS5jb25maWcpO1xuXHRcdGVuZ2luZS5yZWFkeT10cnVlO1xuXHR9XG5cblx0dmFyIHByZWxvYWQ9Z2V0UHJlbG9hZEZpZWxkKG9wdHMucHJlbG9hZCk7XG5cdHZhciBvcHRzPXtyZWN1cnNpdmU6dHJ1ZX07XG5cdC8vaWYgKHR5cGVvZiBjYj09XCJmdW5jdGlvblwiKSB7XG5cdFx0X2dldHMuYXBwbHkoZW5naW5lLFsgcHJlbG9hZCwgb3B0cyxmdW5jdGlvbihyZXMpe1xuXHRcdFx0c2V0UHJlbG9hZChyZXMpO1xuXHRcdFx0Y2IuYXBwbHkoZW5naW5lLmNvbnRleHQsW2VuZ2luZV0pO1xuXHRcdH1dKTtcblx0Ly99IGVsc2Uge1xuXHQvL1x0c2V0UHJlbG9hZChfZ2V0U3luYy5hcHBseShlbmdpbmUsW3ByZWxvYWQsb3B0c10pKTtcblx0Ly99XG5cdHJldHVybiBlbmdpbmU7XG59XG5cbnZhciBzZWdPZmZzZXQ9ZnVuY3Rpb24oc2VnbmFtZSkge1xuXHR2YXIgZW5naW5lPXRoaXM7XG5cdGlmIChhcmd1bWVudHMubGVuZ3RoPjEpIHRocm93IFwiYXJndW1lbnQgOiBzZWduYW1lIFwiO1xuXG5cdHZhciBzZWdOYW1lcz1lbmdpbmUuZ2V0KFwic2VnbmFtZXNcIik7XG5cdHZhciBzZWdPZmZzZXRzPWVuZ2luZS5nZXQoXCJzZWdvZmZzZXRzXCIpO1xuXG5cdHZhciBpPXNlZ05hbWVzLmluZGV4T2Yoc2VnbmFtZSk7XG5cdHJldHVybiAoaT4tMSk/c2VnT2Zmc2V0c1tpXTowO1xufVxudmFyIGZpbGVPZmZzZXQ9ZnVuY3Rpb24oZm4pIHtcblx0dmFyIGVuZ2luZT10aGlzO1xuXHR2YXIgZmlsZW5hbWVzPWVuZ2luZS5nZXQoXCJmaWxlbmFtZXNcIik7XG5cdHZhciBvZmZzZXRzPWVuZ2luZS5nZXQoXCJmaWxlb2Zmc2V0c1wiKTtcblx0dmFyIGk9ZmlsZW5hbWVzLmluZGV4T2YoZm4pO1xuXHRpZiAoaT09LTEpIHJldHVybiBudWxsO1xuXHRyZXR1cm4ge3N0YXJ0OiBvZmZzZXRzW2ldLCBlbmQ6b2Zmc2V0c1tpKzFdfTtcbn1cblxudmFyIGZvbGRlck9mZnNldD1mdW5jdGlvbihmb2xkZXIpIHtcblx0dmFyIGVuZ2luZT10aGlzO1xuXHR2YXIgc3RhcnQ9MCxlbmQ9MDtcblx0dmFyIGZpbGVuYW1lcz1lbmdpbmUuZ2V0KFwiZmlsZW5hbWVzXCIpO1xuXHR2YXIgb2Zmc2V0cz1lbmdpbmUuZ2V0KFwiZmlsZW9mZnNldHNcIik7XG5cdGZvciAodmFyIGk9MDtpPGZpbGVuYW1lcy5sZW5ndGg7aSsrKSB7XG5cdFx0aWYgKGZpbGVuYW1lc1tpXS5zdWJzdHJpbmcoMCxmb2xkZXIubGVuZ3RoKT09Zm9sZGVyKSB7XG5cdFx0XHRpZiAoIXN0YXJ0KSBzdGFydD1vZmZzZXRzW2ldO1xuXHRcdFx0ZW5kPW9mZnNldHNbaV07XG5cdFx0fSBlbHNlIGlmIChzdGFydCkgYnJlYWs7XG5cdH1cblx0cmV0dXJuIHtzdGFydDpzdGFydCxlbmQ6ZW5kfTtcbn1cblxuIC8vVE9ETyBkZWxldGUgZGlyZWN0bHkgZnJvbSBrZGIgaW5zdGFuY2VcbiAvL2tkYi5mcmVlKCk7XG52YXIgY2xvc2VMb2NhbD1mdW5jdGlvbihrZGJpZCkge1xuXHR2YXIgZW5naW5lPWxvY2FsUG9vbFtrZGJpZF07XG5cdGlmIChlbmdpbmUpIHtcblx0XHRlbmdpbmUua2RiLmZyZWUoKTtcblx0XHRkZWxldGUgbG9jYWxQb29sW2tkYmlkXTtcblx0fVxufVxudmFyIGNsb3NlPWZ1bmN0aW9uKGtkYmlkKSB7XG5cdHZhciBlbmdpbmU9cG9vbFtrZGJpZF07XG5cdGlmIChlbmdpbmUpIHtcblx0XHRlbmdpbmUua2RiLmZyZWUoKTtcblx0XHRkZWxldGUgcG9vbFtrZGJpZF07XG5cdH1cbn1cblxudmFyIGdldExvY2FsVHJpZXM9ZnVuY3Rpb24oa2RiZm4pIHtcblx0aWYgKCFrZGJsaXN0ZWQpIHtcblx0XHRrZGJzPXJlcXVpcmUoXCIuL2xpc3RrZGJcIikoKTtcblx0XHRrZGJsaXN0ZWQ9dHJ1ZTtcblx0fVxuXG5cdHZhciBrZGJpZD1rZGJmbi5yZXBsYWNlKCcua2RiJywnJyk7XG5cdHZhciB0cmllcz0gW1wiLi9cIitrZGJpZCtcIi5rZGJcIlxuXHQgICAgICAgICAgICxcIi4uL1wiK2tkYmlkK1wiLmtkYlwiXG5cdF07XG5cblx0Zm9yICh2YXIgaT0wO2k8a2Ricy5sZW5ndGg7aSsrKSB7XG5cdFx0aWYgKGtkYnNbaV1bMF09PWtkYmlkKSB7XG5cdFx0XHR0cmllcy5wdXNoKGtkYnNbaV1bMV0pO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gdHJpZXM7XG59XG52YXIgb3BlbkxvY2FsS3NhbmFnYXA9ZnVuY3Rpb24oa2RiaWQsb3B0cyxjYixjb250ZXh0KSB7XG5cdHZhciBrZGJmbj1rZGJpZDtcblx0dmFyIHRyaWVzPWdldExvY2FsVHJpZXMoa2RiZm4pO1xuXG5cdGZvciAodmFyIGk9MDtpPHRyaWVzLmxlbmd0aDtpKyspIHtcblx0XHRpZiAoZnMuZXhpc3RzU3luYyh0cmllc1tpXSkpIHtcblx0XHRcdC8vY29uc29sZS5sb2coXCJrZGIgcGF0aDogXCIrbm9kZVJlcXVpcmUoJ3BhdGgnKS5yZXNvbHZlKHRyaWVzW2ldKSk7XG5cdFx0XHR2YXIga2RiPW5ldyBLZGIub3Blbih0cmllc1tpXSxmdW5jdGlvbihlcnIsa2RiKXtcblx0XHRcdFx0aWYgKGVycikge1xuXHRcdFx0XHRcdGNiLmFwcGx5KGNvbnRleHQsW2Vycl0pO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGNyZWF0ZUxvY2FsRW5naW5lKGtkYixvcHRzLGZ1bmN0aW9uKGVuZ2luZSl7XG5cdFx0XHRcdFx0XHRsb2NhbFBvb2xba2RiaWRdPWVuZ2luZTtcblx0XHRcdFx0XHRcdGNiLmFwcGx5KGNvbnRleHR8fGVuZ2luZS5jb250ZXh0LFswLGVuZ2luZV0pO1xuXHRcdFx0XHRcdH0sY29udGV4dCk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXHR9XG5cdGlmIChjYikgY2IuYXBwbHkoY29udGV4dCxba2RiaWQrXCIgbm90IGZvdW5kXCJdKTtcblx0cmV0dXJuIG51bGw7XG5cbn1cbnZhciBvcGVuTG9jYWxOb2RlPWZ1bmN0aW9uKGtkYmlkLG9wdHMsY2IsY29udGV4dCkge1xuXHR2YXIgZnM9cmVxdWlyZSgnZnMnKTtcblx0dmFyIHRyaWVzPWdldExvY2FsVHJpZXMoa2RiaWQpO1xuXG5cdGZvciAodmFyIGk9MDtpPHRyaWVzLmxlbmd0aDtpKyspIHtcblx0XHRpZiAoZnMuZXhpc3RzU3luYyh0cmllc1tpXSkpIHtcblxuXHRcdFx0bmV3IEtkYi5vcGVuKHRyaWVzW2ldLGZ1bmN0aW9uKGVycixrZGIpe1xuXHRcdFx0XHRpZiAoZXJyKSB7XG5cdFx0XHRcdFx0Y2IuYXBwbHkoY29udGV4dHx8ZW5naW5lLmNvbnRlbnQsW2Vycl0pO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGNyZWF0ZUxvY2FsRW5naW5lKGtkYixvcHRzLGZ1bmN0aW9uKGVuZ2luZSl7XG5cdFx0XHRcdFx0XHRcdGxvY2FsUG9vbFtrZGJpZF09ZW5naW5lO1xuXHRcdFx0XHRcdFx0XHRjYi5hcHBseShjb250ZXh0fHxlbmdpbmUuY29udGV4dCxbMCxlbmdpbmVdKTtcblx0XHRcdFx0XHR9LGNvbnRleHQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cblx0fVxuXHRpZiAoY2IpIGNiLmFwcGx5KGNvbnRleHQsW2tkYmlkK1wiIG5vdCBmb3VuZFwiXSk7XG5cdHJldHVybiBudWxsO1xufVxuXG52YXIgb3BlbkxvY2FsSHRtbDU9ZnVuY3Rpb24oa2RiaWQsb3B0cyxjYixjb250ZXh0KSB7XHRcblx0dmFyIGVuZ2luZT1sb2NhbFBvb2xba2RiaWRdO1xuXHR2YXIga2RiZm49a2RiaWQ7XG5cdGlmIChrZGJmbi5pbmRleE9mKFwiLmtkYlwiKT09LTEpIGtkYmZuKz1cIi5rZGJcIjtcblx0bmV3IEtkYi5vcGVuKGtkYmZuLGZ1bmN0aW9uKGVycixoYW5kbGUpe1xuXHRcdGlmIChlcnIpIHtcblx0XHRcdGNiLmFwcGx5KGNvbnRleHQsW2Vycl0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjcmVhdGVMb2NhbEVuZ2luZShoYW5kbGUsb3B0cyxmdW5jdGlvbihlbmdpbmUpe1xuXHRcdFx0XHRsb2NhbFBvb2xba2RiaWRdPWVuZ2luZTtcblx0XHRcdFx0Y2IuYXBwbHkoY29udGV4dHx8ZW5naW5lLmNvbnRleHQsWzAsZW5naW5lXSk7XG5cdFx0XHR9LGNvbnRleHQpO1xuXHRcdH1cblx0fSk7XG59XG4vL29taXQgY2IgZm9yIHN5bmNyb25pemUgb3BlblxudmFyIG9wZW5Mb2NhbD1mdW5jdGlvbihrZGJpZCxvcHRzLGNiLGNvbnRleHQpICB7XG5cdGlmICh0eXBlb2Ygb3B0cz09XCJmdW5jdGlvblwiKSB7IC8vbm8gb3B0c1xuXHRcdGlmICh0eXBlb2YgY2I9PVwib2JqZWN0XCIpIGNvbnRleHQ9Y2I7XG5cdFx0Y2I9b3B0cztcblx0XHRvcHRzPXt9O1xuXHR9XG5cblx0dmFyIGVuZ2luZT1sb2NhbFBvb2xba2RiaWRdO1xuXHRpZiAoZW5naW5lKSB7XG5cdFx0aWYgKGNiKSBjYi5hcHBseShjb250ZXh0fHxlbmdpbmUuY29udGV4dCxbMCxlbmdpbmVdKTtcblx0XHRyZXR1cm4gZW5naW5lO1xuXHR9XG5cblx0dmFyIHBsYXRmb3JtPXJlcXVpcmUoXCIuL3BsYXRmb3JtXCIpLmdldFBsYXRmb3JtKCk7XG5cdGlmIChwbGF0Zm9ybT09XCJub2RlLXdlYmtpdFwiIHx8IHBsYXRmb3JtPT1cIm5vZGVcIikge1xuXHRcdG9wZW5Mb2NhbE5vZGUoa2RiaWQsb3B0cyxjYixjb250ZXh0KTtcblx0fSBlbHNlIGlmIChwbGF0Zm9ybT09XCJodG1sNVwiIHx8IHBsYXRmb3JtPT1cImNocm9tZVwiKXtcblx0XHRvcGVuTG9jYWxIdG1sNShrZGJpZCxvcHRzLGNiLGNvbnRleHQpO1x0XHRcblx0fSBlbHNlIHtcblx0XHRvcGVuTG9jYWxLc2FuYWdhcChrZGJpZCxvcHRzLGNiLGNvbnRleHQpO1x0XG5cdH1cbn1cbnZhciBzZXRQYXRoPWZ1bmN0aW9uKHBhdGgpIHtcblx0YXBwcGF0aD1wYXRoO1xuXHRjb25zb2xlLmxvZyhcInNldCBwYXRoXCIscGF0aClcbn1cblxudmFyIGVudW1LZGI9ZnVuY3Rpb24oY2IsY29udGV4dCl7XG5cdHJldHVybiBrZGJzLm1hcChmdW5jdGlvbihrKXtyZXR1cm4ga1swXX0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cz17b3BlbjpvcGVuTG9jYWwsc2V0UGF0aDpzZXRQYXRoLCBjbG9zZTpjbG9zZUxvY2FsLCBlbnVtS2RiOmVudW1LZGIsIGJzZWFyY2g6YnNlYXJjaH07IiwiLyogcmV0dXJuIGFycmF5IG9mIGRiaWQgYW5kIGFic29sdXRlIHBhdGgqL1xudmFyIGxpc3RrZGJfaHRtbDU9ZnVuY3Rpb24oKSB7XG5cdHRocm93IFwibm90IGltcGxlbWVudCB5ZXRcIjtcblx0cmVxdWlyZShcImtzYW5hLWpzb25yb21cIikuaHRtbDVmcy5yZWFkZGlyKGZ1bmN0aW9uKGtkYnMpe1xuXHRcdFx0Y2IuYXBwbHkodGhpcyxba2Ric10pO1xuXHR9LGNvbnRleHR8fHRoaXMpO1x0XHRcblxufVxuXG52YXIgbGlzdGtkYl9ub2RlPWZ1bmN0aW9uKCl7XG5cdHZhciBmcz1yZXF1aXJlKFwiZnNcIik7XG5cdHZhciBwYXRoPXJlcXVpcmUoXCJwYXRoXCIpXG5cdHZhciBwYXJlbnQ9cGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCksXCIuLlwiKTtcblx0dmFyIGZpbGVzPWZzLnJlYWRkaXJTeW5jKHBhcmVudCk7XG5cdHZhciBvdXRwdXQ9W107XG5cdGZpbGVzLm1hcChmdW5jdGlvbihmKXtcblx0XHR2YXIgc3ViZGlyPXBhcmVudCtwYXRoLnNlcCtmO1xuXHRcdHZhciBzdGF0PWZzLnN0YXRTeW5jKHN1YmRpciApO1xuXHRcdGlmIChzdGF0LmlzRGlyZWN0b3J5KCkpIHtcblx0XHRcdHZhciBzdWJmaWxlcz1mcy5yZWFkZGlyU3luYyhzdWJkaXIpO1xuXHRcdFx0Zm9yICh2YXIgaT0wO2k8c3ViZmlsZXMubGVuZ3RoO2krKykge1xuXHRcdFx0XHR2YXIgZmlsZT1zdWJmaWxlc1tpXTtcblx0XHRcdFx0dmFyIGlkeD1maWxlLmluZGV4T2YoXCIua2RiXCIpO1xuXHRcdFx0XHRpZiAoaWR4Pi0xJiZpZHg9PWZpbGUubGVuZ3RoLTQpIHtcblx0XHRcdFx0XHRvdXRwdXQucHVzaChbIGZpbGUuc3Vic3RyKDAsZmlsZS5sZW5ndGgtNCksIHN1YmRpcitwYXRoLnNlcCtmaWxlXSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH0pXG5cdHJldHVybiBvdXRwdXQ7XG59XG52YXIgZmlsZU5hbWVPbmx5PWZ1bmN0aW9uKGZuKSB7XG5cdHZhciBhdD1mbi5sYXN0SW5kZXhPZihcIi9cIik7XG5cdGlmIChhdD4tMSkgcmV0dXJuIGZuLnN1YnN0cihhdCsxKTtcblx0cmV0dXJuIGZuO1xufVxudmFyIGxpc3RrZGJfa3NhbmFnYXA9ZnVuY3Rpb24oKSB7XG5cdHZhciBvdXRwdXQ9W107XG5cdHZhciBhcHBzPUpTT04ucGFyc2Uoa2ZzLmxpc3RBcHBzKCkpO1xuXHRmb3IgKHZhciBpPTA7aTxhcHBzLmxlbmd0aDtpKyspIHtcblx0XHR2YXIgYXBwPWFwcHNbaV07XG5cdFx0aWYgKGFwcC5maWxlcykgZm9yICh2YXIgaj0wO2o8YXBwLmZpbGVzLmxlbmd0aDtqKyspIHtcblx0XHRcdHZhciBmaWxlPWFwcC5maWxlc1tqXTtcblx0XHRcdGlmIChmaWxlLnN1YnN0cihmaWxlLmxlbmd0aC00KT09XCIua2RiXCIpIHtcblx0XHRcdFx0b3V0cHV0LnB1c2goW2FwcC5kYmlkLGZpbGVOYW1lT25seShmaWxlKV0pO1xuXHRcdFx0fVxuXHRcdH1cblx0fTtcblx0cmV0dXJuIG91dHB1dDtcbn1cbnZhciBsaXN0a2RiPWZ1bmN0aW9uKCkge1xuXHR2YXIgcGxhdGZvcm09cmVxdWlyZShcIi4vcGxhdGZvcm1cIikuZ2V0UGxhdGZvcm0oKTtcblx0dmFyIGZpbGVzPVtdO1xuXHRpZiAocGxhdGZvcm09PVwibm9kZVwiIHx8IHBsYXRmb3JtPT1cIm5vZGUtd2Via2l0XCIpIHtcblx0XHRmaWxlcz1saXN0a2RiX25vZGUoKTtcblx0fSBlbHNlIGlmICh0eXBlb2Yga2ZzIT1cInVuZGVmaW5lZFwiKSB7XG5cdFx0ZmlsZXM9bGlzdGtkYl9rc2FuYWdhcCgpO1xuXHR9IGVsc2Uge1xuXHRcdHRocm93IFwibm90IGltcGxlbWVudCB5ZXRcIjtcblx0fVxuXHRyZXR1cm4gZmlsZXM7XG59XG5tb2R1bGUuZXhwb3J0cz1saXN0a2RiOyIsInZhciBnZXRQbGF0Zm9ybT1mdW5jdGlvbigpIHtcblx0aWYgKHR5cGVvZiBrc2FuYWdhcD09XCJ1bmRlZmluZWRcIikge1xuXHRcdHBsYXRmb3JtPVwibm9kZVwiO1xuXHR9IGVsc2Uge1xuXHRcdHBsYXRmb3JtPWtzYW5hZ2FwLnBsYXRmb3JtO1xuXHR9XG5cdHJldHVybiBwbGF0Zm9ybTtcbn1cbm1vZHVsZS5leHBvcnRzPXtnZXRQbGF0Zm9ybTpnZXRQbGF0Zm9ybX07IiwiXG4vKiBlbXVsYXRlIGZpbGVzeXN0ZW0gb24gaHRtbDUgYnJvd3NlciAqL1xuLyogZW11bGF0ZSBmaWxlc3lzdGVtIG9uIGh0bWw1IGJyb3dzZXIgKi9cbnZhciByZWFkPWZ1bmN0aW9uKGhhbmRsZSxidWZmZXIsb2Zmc2V0LGxlbmd0aCxwb3NpdGlvbixjYikgey8vYnVmZmVyIGFuZCBvZmZzZXQgaXMgbm90IHVzZWRcblx0dmFyIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXHR4aHIub3BlbignR0VUJywgaGFuZGxlLnVybCAsIHRydWUpO1xuXHR2YXIgcmFuZ2U9W3Bvc2l0aW9uLGxlbmd0aCtwb3NpdGlvbi0xXTtcblx0eGhyLnNldFJlcXVlc3RIZWFkZXIoJ1JhbmdlJywgJ2J5dGVzPScrcmFuZ2VbMF0rJy0nK3JhbmdlWzFdKTtcblx0eGhyLnJlc3BvbnNlVHlwZSA9ICdhcnJheWJ1ZmZlcic7XG5cdHhoci5zZW5kKCk7XG5cdHhoci5vbmxvYWQgPSBmdW5jdGlvbihlKSB7XG5cdFx0dmFyIHRoYXQ9dGhpcztcblx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG5cdFx0XHRjYigwLHRoYXQucmVzcG9uc2UuYnl0ZUxlbmd0aCx0aGF0LnJlc3BvbnNlKTtcblx0XHR9LDApO1xuXHR9OyBcbn1cbnZhciBjbG9zZT1mdW5jdGlvbihoYW5kbGUpIHt9XG52YXIgZnN0YXRTeW5jPWZ1bmN0aW9uKGhhbmRsZSkge1xuXHR0aHJvdyBcIm5vdCBpbXBsZW1lbnQgeWV0XCI7XG59XG52YXIgZnN0YXQ9ZnVuY3Rpb24oaGFuZGxlLGNiKSB7XG5cdHRocm93IFwibm90IGltcGxlbWVudCB5ZXRcIjtcbn1cbnZhciBfb3Blbj1mdW5jdGlvbihmbl91cmwsY2IpIHtcblx0XHR2YXIgaGFuZGxlPXt9O1xuXHRcdGlmIChmbl91cmwuaW5kZXhPZihcImZpbGVzeXN0ZW06XCIpPT0wKXtcblx0XHRcdGhhbmRsZS51cmw9Zm5fdXJsO1xuXHRcdFx0aGFuZGxlLmZuPWZuX3VybC5zdWJzdHIoIGZuX3VybC5sYXN0SW5kZXhPZihcIi9cIikrMSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGhhbmRsZS5mbj1mbl91cmw7XG5cdFx0XHR2YXIgdXJsPUFQSS5maWxlcy5maWx0ZXIoZnVuY3Rpb24oZil7IHJldHVybiAoZlswXT09Zm5fdXJsKX0pO1xuXHRcdFx0aWYgKHVybC5sZW5ndGgpIGhhbmRsZS51cmw9dXJsWzBdWzFdO1xuXHRcdFx0ZWxzZSBjYihudWxsKTtcblx0XHR9XG5cdFx0Y2IoaGFuZGxlKTtcbn1cbnZhciBvcGVuPWZ1bmN0aW9uKGZuX3VybCxjYikge1xuXHRcdGlmICghQVBJLmluaXRpYWxpemVkKSB7aW5pdCgxMDI0KjEwMjQsZnVuY3Rpb24oKXtcblx0XHRcdF9vcGVuLmFwcGx5KHRoaXMsW2ZuX3VybCxjYl0pO1xuXHRcdH0sdGhpcyl9IGVsc2UgX29wZW4uYXBwbHkodGhpcyxbZm5fdXJsLGNiXSk7XG59XG52YXIgbG9hZD1mdW5jdGlvbihmaWxlbmFtZSxtb2RlLGNiKSB7XG5cdG9wZW4oZmlsZW5hbWUsbW9kZSxjYix0cnVlKTtcbn1cbmZ1bmN0aW9uIGVycm9ySGFuZGxlcihlKSB7XG5cdGNvbnNvbGUuZXJyb3IoJ0Vycm9yOiAnICtlLm5hbWUrIFwiIFwiK2UubWVzc2FnZSk7XG59XG52YXIgcmVhZGRpcj1mdW5jdGlvbihjYixjb250ZXh0KSB7XG5cdCB2YXIgZGlyUmVhZGVyID0gQVBJLmZzLnJvb3QuY3JlYXRlUmVhZGVyKCk7XG5cdCB2YXIgb3V0PVtdLHRoYXQ9dGhpcztcblx0XHRkaXJSZWFkZXIucmVhZEVudHJpZXMoZnVuY3Rpb24oZW50cmllcykge1xuXHRcdFx0aWYgKGVudHJpZXMubGVuZ3RoKSB7XG5cdFx0XHRcdGZvciAodmFyIGkgPSAwLCBlbnRyeTsgZW50cnkgPSBlbnRyaWVzW2ldOyArK2kpIHtcblx0XHRcdFx0XHRpZiAoZW50cnkuaXNGaWxlKSB7XG5cdFx0XHRcdFx0XHRvdXQucHVzaChbZW50cnkubmFtZSxlbnRyeS50b1VSTCA/IGVudHJ5LnRvVVJMKCkgOiBlbnRyeS50b1VSSSgpXSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRBUEkuZmlsZXM9b3V0O1xuXHRcdFx0aWYgKGNiKSBjYi5hcHBseShjb250ZXh0LFtvdXRdKTtcblx0XHR9LCBmdW5jdGlvbigpe1xuXHRcdFx0aWYgKGNiKSBjYi5hcHBseShjb250ZXh0LFtudWxsXSk7XG5cdFx0fSk7XG59XG52YXIgaW5pdGZzPWZ1bmN0aW9uKGdyYW50ZWRCeXRlcyxjYixjb250ZXh0KSB7XG5cdHdlYmtpdFJlcXVlc3RGaWxlU3lzdGVtKFBFUlNJU1RFTlQsIGdyYW50ZWRCeXRlcywgIGZ1bmN0aW9uKGZzKSB7XG5cdFx0QVBJLmZzPWZzO1xuXHRcdEFQSS5xdW90YT1ncmFudGVkQnl0ZXM7XG5cdFx0cmVhZGRpcihmdW5jdGlvbigpe1xuXHRcdFx0QVBJLmluaXRpYWxpemVkPXRydWU7XG5cdFx0XHRjYi5hcHBseShjb250ZXh0LFtncmFudGVkQnl0ZXMsZnNdKTtcblx0XHR9LGNvbnRleHQpO1xuXHR9LCBlcnJvckhhbmRsZXIpO1xufVxudmFyIGluaXQ9ZnVuY3Rpb24ocXVvdGEsY2IsY29udGV4dCkge1xuXHRuYXZpZ2F0b3Iud2Via2l0UGVyc2lzdGVudFN0b3JhZ2UucmVxdWVzdFF1b3RhKHF1b3RhLCBcblx0XHRcdGZ1bmN0aW9uKGdyYW50ZWRCeXRlcykge1xuXHRcdFx0XHRpbml0ZnMoZ3JhbnRlZEJ5dGVzLGNiLGNvbnRleHQpO1xuXHRcdH0sIGVycm9ySGFuZGxlciBcblx0KTtcbn1cbnZhciBBUEk9e1xuXHRyZWFkOnJlYWRcblx0LHJlYWRkaXI6cmVhZGRpclxuXHQsb3BlbjpvcGVuXG5cdCxjbG9zZTpjbG9zZVxuXHQsZnN0YXRTeW5jOmZzdGF0U3luY1xuXHQsZnN0YXQ6ZnN0YXRcbn1cbm1vZHVsZS5leHBvcnRzPUFQSTsiLCJtb2R1bGUuZXhwb3J0cz17XG5cdG9wZW46cmVxdWlyZShcIi4va2RiXCIpXG5cdCxjcmVhdGU6cmVxdWlyZShcIi4va2Rid1wiKVxufVxuIiwiLypcblx0S0RCIHZlcnNpb24gMy4wIEdQTFxuXHR5YXBjaGVhaHNoZW5AZ21haWwuY29tXG5cdDIwMTMvMTIvMjhcblx0YXN5bmNyb25pemUgdmVyc2lvbiBvZiB5YWRiXG5cbiAgcmVtb3ZlIGRlcGVuZGVuY3kgb2YgUSwgdGhhbmtzIHRvXG4gIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvNDIzNDYxOS9ob3ctdG8tYXZvaWQtbG9uZy1uZXN0aW5nLW9mLWFzeW5jaHJvbm91cy1mdW5jdGlvbnMtaW4tbm9kZS1qc1xuXG4gIDIwMTUvMS8yXG4gIG1vdmVkIHRvIGtzYW5hZm9yZ2Uva3NhbmEtanNvbnJvbVxuICBhZGQgZXJyIGluIGNhbGxiYWNrIGZvciBub2RlLmpzIGNvbXBsaWFudFxuKi9cbnZhciBLZnM9bnVsbDtcblxuaWYgKHR5cGVvZiBrc2FuYWdhcD09XCJ1bmRlZmluZWRcIikge1xuXHRLZnM9cmVxdWlyZSgnLi9rZGJmcycpO1x0XHRcdFxufSBlbHNlIHtcblx0aWYgKGtzYW5hZ2FwLnBsYXRmb3JtPT1cImlvc1wiKSB7XG5cdFx0S2ZzPXJlcXVpcmUoXCIuL2tkYmZzX2lvc1wiKTtcblx0fSBlbHNlIGlmIChrc2FuYWdhcC5wbGF0Zm9ybT09XCJub2RlLXdlYmtpdFwiKSB7XG5cdFx0S2ZzPXJlcXVpcmUoXCIuL2tkYmZzXCIpO1xuXHR9IGVsc2UgaWYgKGtzYW5hZ2FwLnBsYXRmb3JtPT1cImNocm9tZVwiKSB7XG5cdFx0S2ZzPXJlcXVpcmUoXCIuL2tkYmZzXCIpO1xuXHR9IGVsc2Uge1xuXHRcdEtmcz1yZXF1aXJlKFwiLi9rZGJmc19hbmRyb2lkXCIpO1xuXHR9XG5cdFx0XG59XG5cblxudmFyIERUPXtcblx0dWludDg6JzEnLCAvL3Vuc2lnbmVkIDEgYnl0ZSBpbnRlZ2VyXG5cdGludDMyOic0JywgLy8gc2lnbmVkIDQgYnl0ZXMgaW50ZWdlclxuXHR1dGY4Oic4JywgIFxuXHR1Y3MyOicyJyxcblx0Ym9vbDonXicsIFxuXHRibG9iOicmJyxcblx0dXRmOGFycjonKicsIC8vc2hpZnQgb2YgOFxuXHR1Y3MyYXJyOidAJywgLy9zaGlmdCBvZiAyXG5cdHVpbnQ4YXJyOichJywgLy9zaGlmdCBvZiAxXG5cdGludDMyYXJyOickJywgLy9zaGlmdCBvZiA0XG5cdHZpbnQ6J2AnLFxuXHRwaW50Oid+JyxcdFxuXG5cdGFycmF5OidcXHUwMDFiJyxcblx0b2JqZWN0OidcXHUwMDFhJyBcblx0Ly95ZGIgc3RhcnQgd2l0aCBvYmplY3Qgc2lnbmF0dXJlLFxuXHQvL3R5cGUgYSB5ZGIgaW4gY29tbWFuZCBwcm9tcHQgc2hvd3Mgbm90aGluZ1xufVxudmFyIHZlcmJvc2U9MCwgcmVhZExvZz1mdW5jdGlvbigpe307XG52YXIgX3JlYWRMb2c9ZnVuY3Rpb24ocmVhZHR5cGUsYnl0ZXMpIHtcblx0Y29uc29sZS5sb2cocmVhZHR5cGUsYnl0ZXMsXCJieXRlc1wiKTtcbn1cbmlmICh2ZXJib3NlKSByZWFkTG9nPV9yZWFkTG9nO1xudmFyIHN0cnNlcD1cIlxcdWZmZmZcIjtcbnZhciBDcmVhdGU9ZnVuY3Rpb24ocGF0aCxvcHRzLGNiKSB7XG5cdC8qIGxvYWR4eHggZnVuY3Rpb25zIG1vdmUgZmlsZSBwb2ludGVyICovXG5cdC8vIGxvYWQgdmFyaWFibGUgbGVuZ3RoIGludFxuXHRpZiAodHlwZW9mIG9wdHM9PVwiZnVuY3Rpb25cIikge1xuXHRcdGNiPW9wdHM7XG5cdFx0b3B0cz17fTtcblx0fVxuXG5cdFxuXHR2YXIgbG9hZFZJbnQgPWZ1bmN0aW9uKG9wdHMsYmxvY2tzaXplLGNvdW50LGNiKSB7XG5cdFx0Ly9pZiAoY291bnQ9PTApIHJldHVybiBbXTtcblx0XHR2YXIgdGhhdD10aGlzO1xuXG5cdFx0dGhpcy5mcy5yZWFkQnVmX3BhY2tlZGludChvcHRzLmN1cixibG9ja3NpemUsY291bnQsdHJ1ZSxmdW5jdGlvbihvKXtcblx0XHRcdC8vY29uc29sZS5sb2coXCJ2aW50XCIpO1xuXHRcdFx0b3B0cy5jdXIrPW8uYWR2O1xuXHRcdFx0Y2IuYXBwbHkodGhhdCxbby5kYXRhXSk7XG5cdFx0fSk7XG5cdH1cblx0dmFyIGxvYWRWSW50MT1mdW5jdGlvbihvcHRzLGNiKSB7XG5cdFx0dmFyIHRoYXQ9dGhpcztcblx0XHRsb2FkVkludC5hcHBseSh0aGlzLFtvcHRzLDYsMSxmdW5jdGlvbihkYXRhKXtcblx0XHRcdC8vY29uc29sZS5sb2coXCJ2aW50MVwiKTtcblx0XHRcdGNiLmFwcGx5KHRoYXQsW2RhdGFbMF1dKTtcblx0XHR9XSlcblx0fVxuXHQvL2ZvciBwb3N0aW5nc1xuXHR2YXIgbG9hZFBJbnQgPWZ1bmN0aW9uKG9wdHMsYmxvY2tzaXplLGNvdW50LGNiKSB7XG5cdFx0dmFyIHRoYXQ9dGhpcztcblx0XHR0aGlzLmZzLnJlYWRCdWZfcGFja2VkaW50KG9wdHMuY3VyLGJsb2Nrc2l6ZSxjb3VudCxmYWxzZSxmdW5jdGlvbihvKXtcblx0XHRcdC8vY29uc29sZS5sb2coXCJwaW50XCIpO1xuXHRcdFx0b3B0cy5jdXIrPW8uYWR2O1xuXHRcdFx0Y2IuYXBwbHkodGhhdCxbby5kYXRhXSk7XG5cdFx0fSk7XG5cdH1cblx0Ly8gaXRlbSBjYW4gYmUgYW55IHR5cGUgKHZhcmlhYmxlIGxlbmd0aClcblx0Ly8gbWF4aW11bSBzaXplIG9mIGFycmF5IGlzIDFUQiAyXjQwXG5cdC8vIHN0cnVjdHVyZTpcblx0Ly8gc2lnbmF0dXJlLDUgYnl0ZXMgb2Zmc2V0LCBwYXlsb2FkLCBpdGVtbGVuZ3Roc1xuXHR2YXIgZ2V0QXJyYXlMZW5ndGg9ZnVuY3Rpb24ob3B0cyxjYikge1xuXHRcdHZhciB0aGF0PXRoaXM7XG5cdFx0dmFyIGRhdGFvZmZzZXQ9MDtcblxuXHRcdHRoaXMuZnMucmVhZFVJOChvcHRzLmN1cixmdW5jdGlvbihsZW4pe1xuXHRcdFx0dmFyIGxlbmd0aG9mZnNldD1sZW4qNDI5NDk2NzI5Njtcblx0XHRcdG9wdHMuY3VyKys7XG5cdFx0XHR0aGF0LmZzLnJlYWRVSTMyKG9wdHMuY3VyLGZ1bmN0aW9uKGxlbil7XG5cdFx0XHRcdG9wdHMuY3VyKz00O1xuXHRcdFx0XHRkYXRhb2Zmc2V0PW9wdHMuY3VyOyAvL2tlZXAgdGhpc1xuXHRcdFx0XHRsZW5ndGhvZmZzZXQrPWxlbjtcblx0XHRcdFx0b3B0cy5jdXIrPWxlbmd0aG9mZnNldDtcblxuXHRcdFx0XHRsb2FkVkludDEuYXBwbHkodGhhdCxbb3B0cyxmdW5jdGlvbihjb3VudCl7XG5cdFx0XHRcdFx0bG9hZFZJbnQuYXBwbHkodGhhdCxbb3B0cyxjb3VudCo2LGNvdW50LGZ1bmN0aW9uKHN6KXtcdFx0XHRcdFx0XHRcblx0XHRcdFx0XHRcdGNiKHtjb3VudDpjb3VudCxzejpzeixvZmZzZXQ6ZGF0YW9mZnNldH0pO1xuXHRcdFx0XHRcdH1dKTtcblx0XHRcdFx0fV0pO1xuXHRcdFx0XHRcblx0XHRcdH0pO1xuXHRcdH0pO1xuXHR9XG5cblx0dmFyIGxvYWRBcnJheSA9IGZ1bmN0aW9uKG9wdHMsYmxvY2tzaXplLGNiKSB7XG5cdFx0dmFyIHRoYXQ9dGhpcztcblx0XHRnZXRBcnJheUxlbmd0aC5hcHBseSh0aGlzLFtvcHRzLGZ1bmN0aW9uKEwpe1xuXHRcdFx0XHR2YXIgbz1bXTtcblx0XHRcdFx0dmFyIGVuZGN1cj1vcHRzLmN1cjtcblx0XHRcdFx0b3B0cy5jdXI9TC5vZmZzZXQ7XG5cblx0XHRcdFx0aWYgKG9wdHMubGF6eSkgeyBcblx0XHRcdFx0XHRcdHZhciBvZmZzZXQ9TC5vZmZzZXQ7XG5cdFx0XHRcdFx0XHRMLnN6Lm1hcChmdW5jdGlvbihzeil7XG5cdFx0XHRcdFx0XHRcdG9bby5sZW5ndGhdPXN0cnNlcCtvZmZzZXQudG9TdHJpbmcoMTYpXG5cdFx0XHRcdFx0XHRcdFx0ICAgK3N0cnNlcCtzei50b1N0cmluZygxNik7XG5cdFx0XHRcdFx0XHRcdG9mZnNldCs9c3o7XG5cdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHZhciB0YXNrcXVldWU9W107XG5cdFx0XHRcdFx0Zm9yICh2YXIgaT0wO2k8TC5jb3VudDtpKyspIHtcblx0XHRcdFx0XHRcdHRhc2txdWV1ZS5wdXNoKFxuXHRcdFx0XHRcdFx0XHQoZnVuY3Rpb24oc3ope1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiAoXG5cdFx0XHRcdFx0XHRcdFx0XHRmdW5jdGlvbihkYXRhKXtcblx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKHR5cGVvZiBkYXRhPT0nb2JqZWN0JyAmJiBkYXRhLl9fZW1wdHkpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQgLy9ub3QgcHVzaGluZyB0aGUgZmlyc3QgY2FsbFxuXHRcdFx0XHRcdFx0XHRcdFx0XHR9XHRlbHNlIG8ucHVzaChkYXRhKTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0b3B0cy5ibG9ja3NpemU9c3o7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGxvYWQuYXBwbHkodGhhdCxbb3B0cywgdGFza3F1ZXVlLnNoaWZ0KCldKTtcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0XHR9KShMLnN6W2ldKVxuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Ly9sYXN0IGNhbGwgdG8gY2hpbGQgbG9hZFxuXHRcdFx0XHRcdHRhc2txdWV1ZS5wdXNoKGZ1bmN0aW9uKGRhdGEpe1xuXHRcdFx0XHRcdFx0by5wdXNoKGRhdGEpO1xuXHRcdFx0XHRcdFx0b3B0cy5jdXI9ZW5kY3VyO1xuXHRcdFx0XHRcdFx0Y2IuYXBwbHkodGhhdCxbb10pO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKG9wdHMubGF6eSkgY2IuYXBwbHkodGhhdCxbb10pO1xuXHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHR0YXNrcXVldWUuc2hpZnQoKSh7X19lbXB0eTp0cnVlfSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRdKVxuXHR9XHRcdFxuXHQvLyBpdGVtIGNhbiBiZSBhbnkgdHlwZSAodmFyaWFibGUgbGVuZ3RoKVxuXHQvLyBzdXBwb3J0IGxhenkgbG9hZFxuXHQvLyBzdHJ1Y3R1cmU6XG5cdC8vIHNpZ25hdHVyZSw1IGJ5dGVzIG9mZnNldCwgcGF5bG9hZCwgaXRlbWxlbmd0aHMsIFxuXHQvLyAgICAgICAgICAgICAgICAgICAgc3RyaW5nYXJyYXlfc2lnbmF0dXJlLCBrZXlzXG5cdHZhciBsb2FkT2JqZWN0ID0gZnVuY3Rpb24ob3B0cyxibG9ja3NpemUsY2IpIHtcblx0XHR2YXIgdGhhdD10aGlzO1xuXHRcdHZhciBzdGFydD1vcHRzLmN1cjtcblx0XHRnZXRBcnJheUxlbmd0aC5hcHBseSh0aGlzLFtvcHRzLGZ1bmN0aW9uKEwpIHtcblx0XHRcdG9wdHMuYmxvY2tzaXplPWJsb2Nrc2l6ZS1vcHRzLmN1citzdGFydDtcblx0XHRcdGxvYWQuYXBwbHkodGhhdCxbb3B0cyxmdW5jdGlvbihrZXlzKXsgLy9sb2FkIHRoZSBrZXlzXG5cdFx0XHRcdGlmIChvcHRzLmtleXMpIHsgLy9jYWxsZXIgYXNrIGZvciBrZXlzXG5cdFx0XHRcdFx0a2V5cy5tYXAoZnVuY3Rpb24oaykgeyBvcHRzLmtleXMucHVzaChrKX0pO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0dmFyIG89e307XG5cdFx0XHRcdHZhciBlbmRjdXI9b3B0cy5jdXI7XG5cdFx0XHRcdG9wdHMuY3VyPUwub2Zmc2V0O1xuXHRcdFx0XHRpZiAob3B0cy5sYXp5KSB7IFxuXHRcdFx0XHRcdHZhciBvZmZzZXQ9TC5vZmZzZXQ7XG5cdFx0XHRcdFx0Zm9yICh2YXIgaT0wO2k8TC5zei5sZW5ndGg7aSsrKSB7XG5cdFx0XHRcdFx0XHQvL3ByZWZpeCB3aXRoIGEgXFwwLCBpbXBvc3NpYmxlIGZvciBub3JtYWwgc3RyaW5nXG5cdFx0XHRcdFx0XHRvW2tleXNbaV1dPXN0cnNlcCtvZmZzZXQudG9TdHJpbmcoMTYpXG5cdFx0XHRcdFx0XHRcdCAgICtzdHJzZXArTC5zeltpXS50b1N0cmluZygxNik7XG5cdFx0XHRcdFx0XHRvZmZzZXQrPUwuc3pbaV07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHZhciB0YXNrcXVldWU9W107XG5cdFx0XHRcdFx0Zm9yICh2YXIgaT0wO2k8TC5jb3VudDtpKyspIHtcblx0XHRcdFx0XHRcdHRhc2txdWV1ZS5wdXNoKFxuXHRcdFx0XHRcdFx0XHQoZnVuY3Rpb24oc3osa2V5KXtcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHRcdFx0XHRcdFx0ZnVuY3Rpb24oZGF0YSl7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGlmICh0eXBlb2YgZGF0YT09J29iamVjdCcgJiYgZGF0YS5fX2VtcHR5KSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Ly9ub3Qgc2F2aW5nIHRoZSBmaXJzdCBjYWxsO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdG9ba2V5XT1kYXRhOyBcblx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRvcHRzLmJsb2Nrc2l6ZT1zejtcblx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKHZlcmJvc2UpIHJlYWRMb2coXCJrZXlcIixrZXkpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRsb2FkLmFwcGx5KHRoYXQsW29wdHMsIHRhc2txdWV1ZS5zaGlmdCgpXSk7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdFx0fSkoTC5zeltpXSxrZXlzW2ktMV0pXG5cblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdC8vbGFzdCBjYWxsIHRvIGNoaWxkIGxvYWRcblx0XHRcdFx0XHR0YXNrcXVldWUucHVzaChmdW5jdGlvbihkYXRhKXtcblx0XHRcdFx0XHRcdG9ba2V5c1trZXlzLmxlbmd0aC0xXV09ZGF0YTtcblx0XHRcdFx0XHRcdG9wdHMuY3VyPWVuZGN1cjtcblx0XHRcdFx0XHRcdGNiLmFwcGx5KHRoYXQsW29dKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAob3B0cy5sYXp5KSBjYi5hcHBseSh0aGF0LFtvXSk7XG5cdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdHRhc2txdWV1ZS5zaGlmdCgpKHtfX2VtcHR5OnRydWV9KTtcblx0XHRcdFx0fVxuXHRcdFx0fV0pO1xuXHRcdH1dKTtcblx0fVxuXG5cdC8vaXRlbSBpcyBzYW1lIGtub3duIHR5cGVcblx0dmFyIGxvYWRTdHJpbmdBcnJheT1mdW5jdGlvbihvcHRzLGJsb2Nrc2l6ZSxlbmNvZGluZyxjYikge1xuXHRcdHZhciB0aGF0PXRoaXM7XG5cdFx0dGhpcy5mcy5yZWFkU3RyaW5nQXJyYXkob3B0cy5jdXIsYmxvY2tzaXplLGVuY29kaW5nLGZ1bmN0aW9uKG8pe1xuXHRcdFx0b3B0cy5jdXIrPWJsb2Nrc2l6ZTtcblx0XHRcdGNiLmFwcGx5KHRoYXQsW29dKTtcblx0XHR9KTtcblx0fVxuXHR2YXIgbG9hZEludGVnZXJBcnJheT1mdW5jdGlvbihvcHRzLGJsb2Nrc2l6ZSx1bml0c2l6ZSxjYikge1xuXHRcdHZhciB0aGF0PXRoaXM7XG5cdFx0bG9hZFZJbnQxLmFwcGx5KHRoaXMsW29wdHMsZnVuY3Rpb24oY291bnQpe1xuXHRcdFx0dmFyIG89dGhhdC5mcy5yZWFkRml4ZWRBcnJheShvcHRzLmN1cixjb3VudCx1bml0c2l6ZSxmdW5jdGlvbihvKXtcblx0XHRcdFx0b3B0cy5jdXIrPWNvdW50KnVuaXRzaXplO1xuXHRcdFx0XHRjYi5hcHBseSh0aGF0LFtvXSk7XG5cdFx0XHR9KTtcblx0XHR9XSk7XG5cdH1cblx0dmFyIGxvYWRCbG9iPWZ1bmN0aW9uKGJsb2Nrc2l6ZSxjYikge1xuXHRcdHZhciBvPXRoaXMuZnMucmVhZEJ1Zih0aGlzLmN1cixibG9ja3NpemUpO1xuXHRcdHRoaXMuY3VyKz1ibG9ja3NpemU7XG5cdFx0cmV0dXJuIG87XG5cdH1cdFxuXHR2YXIgbG9hZGJ5c2lnbmF0dXJlPWZ1bmN0aW9uKG9wdHMsc2lnbmF0dXJlLGNiKSB7XG5cdFx0ICB2YXIgYmxvY2tzaXplPW9wdHMuYmxvY2tzaXplfHx0aGlzLmZzLnNpemU7IFxuXHRcdFx0b3B0cy5jdXIrPXRoaXMuZnMuc2lnbmF0dXJlX3NpemU7XG5cdFx0XHR2YXIgZGF0YXNpemU9YmxvY2tzaXplLXRoaXMuZnMuc2lnbmF0dXJlX3NpemU7XG5cdFx0XHQvL2Jhc2ljIHR5cGVzXG5cdFx0XHRpZiAoc2lnbmF0dXJlPT09RFQuaW50MzIpIHtcblx0XHRcdFx0b3B0cy5jdXIrPTQ7XG5cdFx0XHRcdHRoaXMuZnMucmVhZEkzMihvcHRzLmN1ci00LGNiKTtcblx0XHRcdH0gZWxzZSBpZiAoc2lnbmF0dXJlPT09RFQudWludDgpIHtcblx0XHRcdFx0b3B0cy5jdXIrKztcblx0XHRcdFx0dGhpcy5mcy5yZWFkVUk4KG9wdHMuY3VyLTEsY2IpO1xuXHRcdFx0fSBlbHNlIGlmIChzaWduYXR1cmU9PT1EVC51dGY4KSB7XG5cdFx0XHRcdHZhciBjPW9wdHMuY3VyO29wdHMuY3VyKz1kYXRhc2l6ZTtcblx0XHRcdFx0dGhpcy5mcy5yZWFkU3RyaW5nKGMsZGF0YXNpemUsJ3V0ZjgnLGNiKTtcblx0XHRcdH0gZWxzZSBpZiAoc2lnbmF0dXJlPT09RFQudWNzMikge1xuXHRcdFx0XHR2YXIgYz1vcHRzLmN1cjtvcHRzLmN1cis9ZGF0YXNpemU7XG5cdFx0XHRcdHRoaXMuZnMucmVhZFN0cmluZyhjLGRhdGFzaXplLCd1Y3MyJyxjYik7XHRcblx0XHRcdH0gZWxzZSBpZiAoc2lnbmF0dXJlPT09RFQuYm9vbCkge1xuXHRcdFx0XHRvcHRzLmN1cisrO1xuXHRcdFx0XHR0aGlzLmZzLnJlYWRVSTgob3B0cy5jdXItMSxmdW5jdGlvbihkYXRhKXtjYighIWRhdGEpfSk7XG5cdFx0XHR9IGVsc2UgaWYgKHNpZ25hdHVyZT09PURULmJsb2IpIHtcblx0XHRcdFx0bG9hZEJsb2IoZGF0YXNpemUsY2IpO1xuXHRcdFx0fVxuXHRcdFx0Ly92YXJpYWJsZSBsZW5ndGggaW50ZWdlcnNcblx0XHRcdGVsc2UgaWYgKHNpZ25hdHVyZT09PURULnZpbnQpIHtcblx0XHRcdFx0bG9hZFZJbnQuYXBwbHkodGhpcyxbb3B0cyxkYXRhc2l6ZSxkYXRhc2l6ZSxjYl0pO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAoc2lnbmF0dXJlPT09RFQucGludCkge1xuXHRcdFx0XHRsb2FkUEludC5hcHBseSh0aGlzLFtvcHRzLGRhdGFzaXplLGRhdGFzaXplLGNiXSk7XG5cdFx0XHR9XG5cdFx0XHQvL3NpbXBsZSBhcnJheVxuXHRcdFx0ZWxzZSBpZiAoc2lnbmF0dXJlPT09RFQudXRmOGFycikge1xuXHRcdFx0XHRsb2FkU3RyaW5nQXJyYXkuYXBwbHkodGhpcyxbb3B0cyxkYXRhc2l6ZSwndXRmOCcsY2JdKTtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKHNpZ25hdHVyZT09PURULnVjczJhcnIpIHtcblx0XHRcdFx0bG9hZFN0cmluZ0FycmF5LmFwcGx5KHRoaXMsW29wdHMsZGF0YXNpemUsJ3VjczInLGNiXSk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmIChzaWduYXR1cmU9PT1EVC51aW50OGFycikge1xuXHRcdFx0XHRsb2FkSW50ZWdlckFycmF5LmFwcGx5KHRoaXMsW29wdHMsZGF0YXNpemUsMSxjYl0pO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAoc2lnbmF0dXJlPT09RFQuaW50MzJhcnIpIHtcblx0XHRcdFx0bG9hZEludGVnZXJBcnJheS5hcHBseSh0aGlzLFtvcHRzLGRhdGFzaXplLDQsY2JdKTtcblx0XHRcdH1cblx0XHRcdC8vbmVzdGVkIHN0cnVjdHVyZVxuXHRcdFx0ZWxzZSBpZiAoc2lnbmF0dXJlPT09RFQuYXJyYXkpIHtcblx0XHRcdFx0bG9hZEFycmF5LmFwcGx5KHRoaXMsW29wdHMsZGF0YXNpemUsY2JdKTtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKHNpZ25hdHVyZT09PURULm9iamVjdCkge1xuXHRcdFx0XHRsb2FkT2JqZWN0LmFwcGx5KHRoaXMsW29wdHMsZGF0YXNpemUsY2JdKTtcblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHRjb25zb2xlLmVycm9yKCd1bnN1cHBvcnRlZCB0eXBlJyxzaWduYXR1cmUsb3B0cylcblx0XHRcdFx0Y2IuYXBwbHkodGhpcyxbbnVsbF0pOy8vbWFrZSBzdXJlIGl0IHJldHVyblxuXHRcdFx0XHQvL3Rocm93ICd1bnN1cHBvcnRlZCB0eXBlICcrc2lnbmF0dXJlO1xuXHRcdFx0fVxuXHR9XG5cblx0dmFyIGxvYWQ9ZnVuY3Rpb24ob3B0cyxjYikge1xuXHRcdG9wdHM9b3B0c3x8e307IC8vIHRoaXMgd2lsbCBzZXJ2ZWQgYXMgY29udGV4dCBmb3IgZW50aXJlIGxvYWQgcHJvY2VkdXJlXG5cdFx0b3B0cy5jdXI9b3B0cy5jdXJ8fDA7XG5cdFx0dmFyIHRoYXQ9dGhpcztcblx0XHR0aGlzLmZzLnJlYWRTaWduYXR1cmUob3B0cy5jdXIsIGZ1bmN0aW9uKHNpZ25hdHVyZSl7XG5cdFx0XHRsb2FkYnlzaWduYXR1cmUuYXBwbHkodGhhdCxbb3B0cyxzaWduYXR1cmUsY2JdKVxuXHRcdH0pO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cdHZhciBDQUNIRT1udWxsO1xuXHR2YXIgS0VZPXt9O1xuXHR2YXIgQUREUkVTUz17fTtcblx0dmFyIHJlc2V0PWZ1bmN0aW9uKGNiKSB7XG5cdFx0aWYgKCFDQUNIRSkge1xuXHRcdFx0bG9hZC5hcHBseSh0aGlzLFt7Y3VyOjAsbGF6eTp0cnVlfSxmdW5jdGlvbihkYXRhKXtcblx0XHRcdFx0Q0FDSEU9ZGF0YTtcblx0XHRcdFx0Y2IuY2FsbCh0aGlzKTtcblx0XHRcdH1dKTtcdFxuXHRcdH0gZWxzZSB7XG5cdFx0XHRjYi5jYWxsKHRoaXMpO1xuXHRcdH1cblx0fVxuXG5cdHZhciBleGlzdHM9ZnVuY3Rpb24ocGF0aCxjYikge1xuXHRcdGlmIChwYXRoLmxlbmd0aD09MCkgcmV0dXJuIHRydWU7XG5cdFx0dmFyIGtleT1wYXRoLnBvcCgpO1xuXHRcdHZhciB0aGF0PXRoaXM7XG5cdFx0Z2V0LmFwcGx5KHRoaXMsW3BhdGgsZmFsc2UsZnVuY3Rpb24oZGF0YSl7XG5cdFx0XHRpZiAoIXBhdGguam9pbihzdHJzZXApKSByZXR1cm4gKCEhS0VZW2tleV0pO1xuXHRcdFx0dmFyIGtleXM9S0VZW3BhdGguam9pbihzdHJzZXApXTtcblx0XHRcdHBhdGgucHVzaChrZXkpOy8vcHV0IGl0IGJhY2tcblx0XHRcdGlmIChrZXlzKSBjYi5hcHBseSh0aGF0LFtrZXlzLmluZGV4T2Yoa2V5KT4tMV0pO1xuXHRcdFx0ZWxzZSBjYi5hcHBseSh0aGF0LFtmYWxzZV0pO1xuXHRcdH1dKTtcblx0fVxuXG5cdHZhciBnZXRTeW5jPWZ1bmN0aW9uKHBhdGgpIHtcblx0XHRpZiAoIUNBQ0hFKSByZXR1cm4gdW5kZWZpbmVkO1x0XG5cdFx0dmFyIG89Q0FDSEU7XG5cdFx0Zm9yICh2YXIgaT0wO2k8cGF0aC5sZW5ndGg7aSsrKSB7XG5cdFx0XHR2YXIgcj1vW3BhdGhbaV1dO1xuXHRcdFx0aWYgKHR5cGVvZiByPT1cInVuZGVmaW5lZFwiKSByZXR1cm4gbnVsbDtcblx0XHRcdG89cjtcblx0XHR9XG5cdFx0cmV0dXJuIG87XG5cdH1cblx0dmFyIGdldD1mdW5jdGlvbihwYXRoLG9wdHMsY2IpIHtcblx0XHRpZiAodHlwZW9mIHBhdGg9PSd1bmRlZmluZWQnKSBwYXRoPVtdO1xuXHRcdGlmICh0eXBlb2YgcGF0aD09XCJzdHJpbmdcIikgcGF0aD1bcGF0aF07XG5cdFx0Ly9vcHRzLnJlY3Vyc2l2ZT0hIW9wdHMucmVjdXJzaXZlO1xuXHRcdGlmICh0eXBlb2Ygb3B0cz09XCJmdW5jdGlvblwiKSB7XG5cdFx0XHRjYj1vcHRzO25vZGVcblx0XHRcdG9wdHM9e307XG5cdFx0fVxuXHRcdHZhciB0aGF0PXRoaXM7XG5cdFx0aWYgKHR5cGVvZiBjYiE9J2Z1bmN0aW9uJykgcmV0dXJuIGdldFN5bmMocGF0aCk7XG5cblx0XHRyZXNldC5hcHBseSh0aGlzLFtmdW5jdGlvbigpe1xuXHRcdFx0dmFyIG89Q0FDSEU7XG5cdFx0XHRpZiAocGF0aC5sZW5ndGg9PTApIHtcblx0XHRcdFx0aWYgKG9wdHMuYWRkcmVzcykge1xuXHRcdFx0XHRcdGNiKFswLHRoYXQuZnMuc2l6ZV0pO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGNiKE9iamVjdC5rZXlzKENBQ0hFKSk7XHRcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9IFxuXHRcdFx0XG5cdFx0XHR2YXIgcGF0aG5vdz1cIlwiLHRhc2txdWV1ZT1bXSxuZXdvcHRzPXt9LHI9bnVsbDtcblx0XHRcdHZhciBsYXN0a2V5PVwiXCI7XG5cblx0XHRcdGZvciAodmFyIGk9MDtpPHBhdGgubGVuZ3RoO2krKykge1xuXHRcdFx0XHR2YXIgdGFzaz0oZnVuY3Rpb24oa2V5LGspe1xuXG5cdFx0XHRcdFx0cmV0dXJuIChmdW5jdGlvbihkYXRhKXtcblx0XHRcdFx0XHRcdGlmICghKHR5cGVvZiBkYXRhPT0nb2JqZWN0JyAmJiBkYXRhLl9fZW1wdHkpKSB7XG5cdFx0XHRcdFx0XHRcdGlmICh0eXBlb2Ygb1tsYXN0a2V5XT09J3N0cmluZycgJiYgb1tsYXN0a2V5XVswXT09c3Ryc2VwKSBvW2xhc3RrZXldPXt9O1xuXHRcdFx0XHRcdFx0XHRvW2xhc3RrZXldPWRhdGE7IFxuXHRcdFx0XHRcdFx0XHRvPW9bbGFzdGtleV07XG5cdFx0XHRcdFx0XHRcdHI9ZGF0YVtrZXldO1xuXHRcdFx0XHRcdFx0XHRLRVlbcGF0aG5vd109b3B0cy5rZXlzO1x0XHRcdFx0XHRcdFx0XHRcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdGRhdGE9b1trZXldO1xuXHRcdFx0XHRcdFx0XHRyPWRhdGE7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGlmICh0eXBlb2Ygcj09PVwidW5kZWZpbmVkXCIpIHtcblx0XHRcdFx0XHRcdFx0dGFza3F1ZXVlPW51bGw7XG5cdFx0XHRcdFx0XHRcdGNiLmFwcGx5KHRoYXQsW3JdKTsgLy9yZXR1cm4gZW1wdHkgdmFsdWVcblx0XHRcdFx0XHRcdH0gZWxzZSB7XHRcdFx0XHRcdFx0XHRcblx0XHRcdFx0XHRcdFx0aWYgKHBhcnNlSW50KGspKSBwYXRobm93Kz1zdHJzZXA7XG5cdFx0XHRcdFx0XHRcdHBhdGhub3crPWtleTtcblx0XHRcdFx0XHRcdFx0aWYgKHR5cGVvZiByPT0nc3RyaW5nJyAmJiByWzBdPT1zdHJzZXApIHsgLy9vZmZzZXQgb2YgZGF0YSB0byBiZSBsb2FkZWRcblx0XHRcdFx0XHRcdFx0XHR2YXIgcD1yLnN1YnN0cmluZygxKS5zcGxpdChzdHJzZXApLm1hcChmdW5jdGlvbihpdGVtKXtyZXR1cm4gcGFyc2VJbnQoaXRlbSwxNil9KTtcblx0XHRcdFx0XHRcdFx0XHR2YXIgY3VyPXBbMF0sc3o9cFsxXTtcblx0XHRcdFx0XHRcdFx0XHRuZXdvcHRzLmxhenk9IW9wdHMucmVjdXJzaXZlIHx8IChrPHBhdGgubGVuZ3RoLTEpIDtcblx0XHRcdFx0XHRcdFx0XHRuZXdvcHRzLmJsb2Nrc2l6ZT1zejtuZXdvcHRzLmN1cj1jdXIsbmV3b3B0cy5rZXlzPVtdO1xuXHRcdFx0XHRcdFx0XHRcdGxhc3RrZXk9a2V5OyAvL2xvYWQgaXMgc3luYyBpbiBhbmRyb2lkXG5cdFx0XHRcdFx0XHRcdFx0aWYgKG9wdHMuYWRkcmVzcyAmJiB0YXNrcXVldWUubGVuZ3RoPT0xKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRBRERSRVNTW3BhdGhub3ddPVtjdXIsc3pdO1xuXHRcdFx0XHRcdFx0XHRcdFx0dGFza3F1ZXVlLnNoaWZ0KCkobnVsbCxBRERSRVNTW3BhdGhub3ddKTtcblx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdFx0bG9hZC5hcHBseSh0aGF0LFtuZXdvcHRzLCB0YXNrcXVldWUuc2hpZnQoKV0pO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRpZiAob3B0cy5hZGRyZXNzICYmIHRhc2txdWV1ZS5sZW5ndGg9PTEpIHtcblx0XHRcdFx0XHRcdFx0XHRcdHRhc2txdWV1ZS5zaGlmdCgpKG51bGwsQUREUkVTU1twYXRobm93XSk7XG5cdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRcdHRhc2txdWV1ZS5zaGlmdCgpLmFwcGx5KHRoYXQsW3JdKTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KVxuXHRcdFx0XHR9KVxuXHRcdFx0XHQocGF0aFtpXSxpKTtcblx0XHRcdFx0XG5cdFx0XHRcdHRhc2txdWV1ZS5wdXNoKHRhc2spO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAodGFza3F1ZXVlLmxlbmd0aD09MCkge1xuXHRcdFx0XHRjYi5hcHBseSh0aGF0LFtvXSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvL2xhc3QgY2FsbCB0byBjaGlsZCBsb2FkXG5cdFx0XHRcdHRhc2txdWV1ZS5wdXNoKGZ1bmN0aW9uKGRhdGEsY3Vyc3ope1xuXHRcdFx0XHRcdGlmIChvcHRzLmFkZHJlc3MpIHtcblx0XHRcdFx0XHRcdGNiLmFwcGx5KHRoYXQsW2N1cnN6XSk7XG5cdFx0XHRcdFx0fSBlbHNle1xuXHRcdFx0XHRcdFx0dmFyIGtleT1wYXRoW3BhdGgubGVuZ3RoLTFdO1xuXHRcdFx0XHRcdFx0b1trZXldPWRhdGE7IEtFWVtwYXRobm93XT1vcHRzLmtleXM7XG5cdFx0XHRcdFx0XHRjYi5hcHBseSh0aGF0LFtkYXRhXSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdFx0dGFza3F1ZXVlLnNoaWZ0KCkoe19fZW1wdHk6dHJ1ZX0pO1x0XHRcdFxuXHRcdFx0fVxuXG5cdFx0fV0pOyAvL3Jlc2V0XG5cdH1cblx0Ly8gZ2V0IGFsbCBrZXlzIGluIGdpdmVuIHBhdGhcblx0dmFyIGdldGtleXM9ZnVuY3Rpb24ocGF0aCxjYikge1xuXHRcdGlmICghcGF0aCkgcGF0aD1bXVxuXHRcdHZhciB0aGF0PXRoaXM7XG5cdFx0Z2V0LmFwcGx5KHRoaXMsW3BhdGgsZmFsc2UsZnVuY3Rpb24oKXtcblx0XHRcdGlmIChwYXRoICYmIHBhdGgubGVuZ3RoKSB7XG5cdFx0XHRcdGNiLmFwcGx5KHRoYXQsW0tFWVtwYXRoLmpvaW4oc3Ryc2VwKV1dKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNiLmFwcGx5KHRoYXQsW09iamVjdC5rZXlzKENBQ0hFKV0pOyBcblx0XHRcdFx0Ly90b3AgbGV2ZWwsIG5vcm1hbGx5IGl0IGlzIHZlcnkgc21hbGxcblx0XHRcdH1cblx0XHR9XSk7XG5cdH1cblxuXHR2YXIgc2V0dXBhcGk9ZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5sb2FkPWxvYWQ7XG4vL1x0XHR0aGlzLmN1cj0wO1xuXHRcdHRoaXMuY2FjaGU9ZnVuY3Rpb24oKSB7cmV0dXJuIENBQ0hFfTtcblx0XHR0aGlzLmtleT1mdW5jdGlvbigpIHtyZXR1cm4gS0VZfTtcblx0XHR0aGlzLmZyZWU9ZnVuY3Rpb24oKSB7XG5cdFx0XHRDQUNIRT1udWxsO1xuXHRcdFx0S0VZPW51bGw7XG5cdFx0XHR0aGlzLmZzLmZyZWUoKTtcblx0XHR9XG5cdFx0dGhpcy5zZXRDYWNoZT1mdW5jdGlvbihjKSB7Q0FDSEU9Y307XG5cdFx0dGhpcy5rZXlzPWdldGtleXM7XG5cdFx0dGhpcy5nZXQ9Z2V0OyAgIC8vIGdldCBhIGZpZWxkLCBsb2FkIGlmIG5lZWRlZFxuXHRcdHRoaXMuZXhpc3RzPWV4aXN0cztcblx0XHR0aGlzLkRUPURUO1xuXHRcdFxuXHRcdC8vaW5zdGFsbCB0aGUgc3luYyB2ZXJzaW9uIGZvciBub2RlXG5cdFx0Ly9pZiAodHlwZW9mIHByb2Nlc3MhPVwidW5kZWZpbmVkXCIpIHJlcXVpcmUoXCIuL2tkYl9zeW5jXCIpKHRoaXMpO1xuXHRcdC8vaWYgKGNiKSBzZXRUaW1lb3V0KGNiLmJpbmQodGhpcyksMCk7XG5cdFx0dmFyIHRoYXQ9dGhpcztcblx0XHR2YXIgZXJyPTA7XG5cdFx0aWYgKGNiKSB7XG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG5cdFx0XHRcdGNiKGVycix0aGF0KTtcdFxuXHRcdFx0fSwwKTtcblx0XHR9XG5cdH1cblx0dmFyIHRoYXQ9dGhpcztcblx0dmFyIGtmcz1uZXcgS2ZzKHBhdGgsb3B0cyxmdW5jdGlvbihlcnIpe1xuXHRcdGlmIChlcnIpIHtcblx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcblx0XHRcdFx0Y2IoZXJyLDApO1xuXHRcdFx0fSwwKTtcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGF0LnNpemU9dGhpcy5zaXplO1xuXHRcdFx0c2V0dXBhcGkuY2FsbCh0aGF0KTtcdFx0XHRcblx0XHR9XG5cdH0pO1xuXHR0aGlzLmZzPWtmcztcblx0cmV0dXJuIHRoaXM7XG59XG5cbkNyZWF0ZS5kYXRhdHlwZXM9RFQ7XG5cbmlmIChtb2R1bGUpIG1vZHVsZS5leHBvcnRzPUNyZWF0ZTtcbi8vcmV0dXJuIENyZWF0ZTtcbiIsIi8qIG5vZGUuanMgYW5kIGh0bWw1IGZpbGUgc3lzdGVtIGFic3RyYWN0aW9uIGxheWVyKi9cbnRyeSB7XG5cdHZhciBmcz1yZXF1aXJlKFwiZnNcIik7XG5cdHZhciBCdWZmZXI9cmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXI7XG59IGNhdGNoIChlKSB7XG5cdHZhciBmcz1yZXF1aXJlKCcuL2h0bWw1cmVhZCcpO1xuXHR2YXIgQnVmZmVyPWZ1bmN0aW9uKCl7IHJldHVybiBcIlwifTtcblx0dmFyIGh0bWw1ZnM9dHJ1ZTsgXHRcbn1cbnZhciBzaWduYXR1cmVfc2l6ZT0xO1xudmFyIHZlcmJvc2U9MCwgcmVhZExvZz1mdW5jdGlvbigpe307XG52YXIgX3JlYWRMb2c9ZnVuY3Rpb24ocmVhZHR5cGUsYnl0ZXMpIHtcblx0Y29uc29sZS5sb2cocmVhZHR5cGUsYnl0ZXMsXCJieXRlc1wiKTtcbn1cbmlmICh2ZXJib3NlKSByZWFkTG9nPV9yZWFkTG9nO1xuXG52YXIgdW5wYWNrX2ludCA9IGZ1bmN0aW9uIChhciwgY291bnQgLCByZXNldCkge1xuICAgY291bnQ9Y291bnR8fGFyLmxlbmd0aDtcbiAgdmFyIHIgPSBbXSwgaSA9IDAsIHYgPSAwO1xuICBkbyB7XG5cdHZhciBzaGlmdCA9IDA7XG5cdGRvIHtcblx0ICB2ICs9ICgoYXJbaV0gJiAweDdGKSA8PCBzaGlmdCk7XG5cdCAgc2hpZnQgKz0gNztcdCAgXG5cdH0gd2hpbGUgKGFyWysraV0gJiAweDgwKTtcblx0ci5wdXNoKHYpOyBpZiAocmVzZXQpIHY9MDtcblx0Y291bnQtLTtcbiAgfSB3aGlsZSAoaTxhci5sZW5ndGggJiYgY291bnQpO1xuICByZXR1cm4ge2RhdGE6ciwgYWR2OmkgfTtcbn1cbnZhciBPcGVuPWZ1bmN0aW9uKHBhdGgsb3B0cyxjYikge1xuXHRvcHRzPW9wdHN8fHt9O1xuXG5cdHZhciByZWFkU2lnbmF0dXJlPWZ1bmN0aW9uKHBvcyxjYikge1xuXHRcdHZhciBidWY9bmV3IEJ1ZmZlcihzaWduYXR1cmVfc2l6ZSk7XG5cdFx0dmFyIHRoYXQ9dGhpcztcblx0XHRmcy5yZWFkKHRoaXMuaGFuZGxlLGJ1ZiwwLHNpZ25hdHVyZV9zaXplLHBvcyxmdW5jdGlvbihlcnIsbGVuLGJ1ZmZlcil7XG5cdFx0XHRpZiAoaHRtbDVmcykgdmFyIHNpZ25hdHVyZT1TdHJpbmcuZnJvbUNoYXJDb2RlKChuZXcgVWludDhBcnJheShidWZmZXIpKVswXSlcblx0XHRcdGVsc2UgdmFyIHNpZ25hdHVyZT1idWZmZXIudG9TdHJpbmcoJ3V0ZjgnLDAsc2lnbmF0dXJlX3NpemUpO1xuXHRcdFx0Y2IuYXBwbHkodGhhdCxbc2lnbmF0dXJlXSk7XG5cdFx0fSk7XG5cdH1cblxuXHQvL3RoaXMgaXMgcXVpdGUgc2xvd1xuXHQvL3dhaXQgZm9yIFN0cmluZ1ZpZXcgK0FycmF5QnVmZmVyIHRvIHNvbHZlIHRoZSBwcm9ibGVtXG5cdC8vaHR0cHM6Ly9ncm91cHMuZ29vZ2xlLmNvbS9hL2Nocm9taXVtLm9yZy9mb3J1bS8jIXRvcGljL2JsaW5rLWRldi95bGdpTllfWlNWMFxuXHQvL2lmIHRoZSBzdHJpbmcgaXMgYWx3YXlzIHVjczJcblx0Ly9jYW4gdXNlIFVpbnQxNiB0byByZWFkIGl0LlxuXHQvL2h0dHA6Ly91cGRhdGVzLmh0bWw1cm9ja3MuY29tLzIwMTIvMDYvSG93LXRvLWNvbnZlcnQtQXJyYXlCdWZmZXItdG8tYW5kLWZyb20tU3RyaW5nXG5cdHZhciBkZWNvZGV1dGY4ID0gZnVuY3Rpb24gKHV0ZnRleHQpIHtcblx0XHR2YXIgc3RyaW5nID0gXCJcIjtcblx0XHR2YXIgaSA9IDA7XG5cdFx0dmFyIGM9MCxjMSA9IDAsIGMyID0gMCAsIGMzPTA7XG5cdFx0Zm9yICh2YXIgaT0wO2k8dXRmdGV4dC5sZW5ndGg7aSsrKSB7XG5cdFx0XHRpZiAodXRmdGV4dC5jaGFyQ29kZUF0KGkpPjEyNykgYnJlYWs7XG5cdFx0fVxuXHRcdGlmIChpPj11dGZ0ZXh0Lmxlbmd0aCkgcmV0dXJuIHV0ZnRleHQ7XG5cblx0XHR3aGlsZSAoIGkgPCB1dGZ0ZXh0Lmxlbmd0aCApIHtcblx0XHRcdGMgPSB1dGZ0ZXh0LmNoYXJDb2RlQXQoaSk7XG5cdFx0XHRpZiAoYyA8IDEyOCkge1xuXHRcdFx0XHRzdHJpbmcgKz0gdXRmdGV4dFtpXTtcblx0XHRcdFx0aSsrO1xuXHRcdFx0fSBlbHNlIGlmKChjID4gMTkxKSAmJiAoYyA8IDIyNCkpIHtcblx0XHRcdFx0YzIgPSB1dGZ0ZXh0LmNoYXJDb2RlQXQoaSsxKTtcblx0XHRcdFx0c3RyaW5nICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoKChjICYgMzEpIDw8IDYpIHwgKGMyICYgNjMpKTtcblx0XHRcdFx0aSArPSAyO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0YzIgPSB1dGZ0ZXh0LmNoYXJDb2RlQXQoaSsxKTtcblx0XHRcdFx0YzMgPSB1dGZ0ZXh0LmNoYXJDb2RlQXQoaSsyKTtcblx0XHRcdFx0c3RyaW5nICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoKChjICYgMTUpIDw8IDEyKSB8ICgoYzIgJiA2MykgPDwgNikgfCAoYzMgJiA2MykpO1xuXHRcdFx0XHRpICs9IDM7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBzdHJpbmc7XG5cdH1cblxuXHR2YXIgcmVhZFN0cmluZz0gZnVuY3Rpb24ocG9zLGJsb2Nrc2l6ZSxlbmNvZGluZyxjYikge1xuXHRcdGVuY29kaW5nPWVuY29kaW5nfHwndXRmOCc7XG5cdFx0dmFyIGJ1ZmZlcj1uZXcgQnVmZmVyKGJsb2Nrc2l6ZSk7XG5cdFx0dmFyIHRoYXQ9dGhpcztcblx0XHRmcy5yZWFkKHRoaXMuaGFuZGxlLGJ1ZmZlciwwLGJsb2Nrc2l6ZSxwb3MsZnVuY3Rpb24oZXJyLGxlbixidWZmZXIpe1xuXHRcdFx0cmVhZExvZyhcInN0cmluZ1wiLGxlbik7XG5cdFx0XHRpZiAoaHRtbDVmcykge1xuXHRcdFx0XHRpZiAoZW5jb2Rpbmc9PSd1dGY4Jykge1xuXHRcdFx0XHRcdHZhciBzdHI9ZGVjb2RldXRmOChTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KG51bGwsIG5ldyBVaW50OEFycmF5KGJ1ZmZlcikpKVxuXHRcdFx0XHR9IGVsc2UgeyAvL3VjczIgaXMgMyB0aW1lcyBmYXN0ZXJcblx0XHRcdFx0XHR2YXIgc3RyPVN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkobnVsbCwgbmV3IFVpbnQxNkFycmF5KGJ1ZmZlcikpXHRcblx0XHRcdFx0fVxuXHRcdFx0XHRcblx0XHRcdFx0Y2IuYXBwbHkodGhhdCxbc3RyXSk7XG5cdFx0XHR9IFxuXHRcdFx0ZWxzZSBjYi5hcHBseSh0aGF0LFtidWZmZXIudG9TdHJpbmcoZW5jb2RpbmcpXSk7XHRcblx0XHR9KTtcblx0fVxuXG5cdC8vd29yayBhcm91bmQgZm9yIGNocm9tZSBmcm9tQ2hhckNvZGUgY2Fubm90IGFjY2VwdCBodWdlIGFycmF5XG5cdC8vaHR0cHM6Ly9jb2RlLmdvb2dsZS5jb20vcC9jaHJvbWl1bS9pc3N1ZXMvZGV0YWlsP2lkPTU2NTg4XG5cdHZhciBidWYyc3RyaW5nYXJyPWZ1bmN0aW9uKGJ1ZixlbmMpIHtcblx0XHRpZiAoZW5jPT1cInV0ZjhcIikgXHR2YXIgYXJyPW5ldyBVaW50OEFycmF5KGJ1Zik7XG5cdFx0ZWxzZSB2YXIgYXJyPW5ldyBVaW50MTZBcnJheShidWYpO1xuXHRcdHZhciBpPTAsY29kZXM9W10sb3V0PVtdLHM9XCJcIjtcblx0XHR3aGlsZSAoaTxhcnIubGVuZ3RoKSB7XG5cdFx0XHRpZiAoYXJyW2ldKSB7XG5cdFx0XHRcdGNvZGVzW2NvZGVzLmxlbmd0aF09YXJyW2ldO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cz1TdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KG51bGwsY29kZXMpO1xuXHRcdFx0XHRpZiAoZW5jPT1cInV0ZjhcIikgb3V0W291dC5sZW5ndGhdPWRlY29kZXV0Zjgocyk7XG5cdFx0XHRcdGVsc2Ugb3V0W291dC5sZW5ndGhdPXM7XG5cdFx0XHRcdGNvZGVzPVtdO1x0XHRcdFx0XG5cdFx0XHR9XG5cdFx0XHRpKys7XG5cdFx0fVxuXHRcdFxuXHRcdHM9U3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShudWxsLGNvZGVzKTtcblx0XHRpZiAoZW5jPT1cInV0ZjhcIikgb3V0W291dC5sZW5ndGhdPWRlY29kZXV0Zjgocyk7XG5cdFx0ZWxzZSBvdXRbb3V0Lmxlbmd0aF09cztcblxuXHRcdHJldHVybiBvdXQ7XG5cdH1cblx0dmFyIHJlYWRTdHJpbmdBcnJheSA9IGZ1bmN0aW9uKHBvcyxibG9ja3NpemUsZW5jb2RpbmcsY2IpIHtcblx0XHR2YXIgdGhhdD10aGlzLG91dD1udWxsO1xuXHRcdGlmIChibG9ja3NpemU9PTApIHJldHVybiBbXTtcblx0XHRlbmNvZGluZz1lbmNvZGluZ3x8J3V0ZjgnO1xuXHRcdHZhciBidWZmZXI9bmV3IEJ1ZmZlcihibG9ja3NpemUpO1xuXHRcdGZzLnJlYWQodGhpcy5oYW5kbGUsYnVmZmVyLDAsYmxvY2tzaXplLHBvcyxmdW5jdGlvbihlcnIsbGVuLGJ1ZmZlcil7XG5cdFx0XHRpZiAoaHRtbDVmcykge1xuXHRcdFx0XHRyZWFkTG9nKFwic3RyaW5nQXJyYXlcIixidWZmZXIuYnl0ZUxlbmd0aCk7XG5cblx0XHRcdFx0aWYgKGVuY29kaW5nPT0ndXRmOCcpIHtcblx0XHRcdFx0XHRvdXQ9YnVmMnN0cmluZ2FycihidWZmZXIsXCJ1dGY4XCIpO1xuXHRcdFx0XHR9IGVsc2UgeyAvL3VjczIgaXMgMyB0aW1lcyBmYXN0ZXJcblx0XHRcdFx0XHRvdXQ9YnVmMnN0cmluZ2FycihidWZmZXIsXCJ1Y3MyXCIpO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZWFkTG9nKFwic3RyaW5nQXJyYXlcIixidWZmZXIubGVuZ3RoKTtcblx0XHRcdFx0b3V0PWJ1ZmZlci50b1N0cmluZyhlbmNvZGluZykuc3BsaXQoJ1xcMCcpO1xuXHRcdFx0fSBcdFxuXHRcdFx0Y2IuYXBwbHkodGhhdCxbb3V0XSk7XG5cdFx0fSk7XG5cdH1cblx0dmFyIHJlYWRVSTMyPWZ1bmN0aW9uKHBvcyxjYikge1xuXHRcdHZhciBidWZmZXI9bmV3IEJ1ZmZlcig0KTtcblx0XHR2YXIgdGhhdD10aGlzO1xuXHRcdGZzLnJlYWQodGhpcy5oYW5kbGUsYnVmZmVyLDAsNCxwb3MsZnVuY3Rpb24oZXJyLGxlbixidWZmZXIpe1xuXHRcdFx0cmVhZExvZyhcInVpMzJcIixsZW4pO1xuXHRcdFx0aWYgKGh0bWw1ZnMpe1xuXHRcdFx0XHQvL3Y9KG5ldyBVaW50MzJBcnJheShidWZmZXIpKVswXTtcblx0XHRcdFx0dmFyIHY9bmV3IERhdGFWaWV3KGJ1ZmZlcikuZ2V0VWludDMyKDAsIGZhbHNlKVxuXHRcdFx0XHRjYih2KTtcblx0XHRcdH1cblx0XHRcdGVsc2UgY2IuYXBwbHkodGhhdCxbYnVmZmVyLnJlYWRJbnQzMkJFKDApXSk7XHRcblx0XHR9KTtcdFx0XG5cdH1cblxuXHR2YXIgcmVhZEkzMj1mdW5jdGlvbihwb3MsY2IpIHtcblx0XHR2YXIgYnVmZmVyPW5ldyBCdWZmZXIoNCk7XG5cdFx0dmFyIHRoYXQ9dGhpcztcblx0XHRmcy5yZWFkKHRoaXMuaGFuZGxlLGJ1ZmZlciwwLDQscG9zLGZ1bmN0aW9uKGVycixsZW4sYnVmZmVyKXtcblx0XHRcdHJlYWRMb2coXCJpMzJcIixsZW4pO1xuXHRcdFx0aWYgKGh0bWw1ZnMpe1xuXHRcdFx0XHR2YXIgdj1uZXcgRGF0YVZpZXcoYnVmZmVyKS5nZXRJbnQzMigwLCBmYWxzZSlcblx0XHRcdFx0Y2Iodik7XG5cdFx0XHR9XG5cdFx0XHRlbHNlICBcdGNiLmFwcGx5KHRoYXQsW2J1ZmZlci5yZWFkSW50MzJCRSgwKV0pO1x0XG5cdFx0fSk7XG5cdH1cblx0dmFyIHJlYWRVSTg9ZnVuY3Rpb24ocG9zLGNiKSB7XG5cdFx0dmFyIGJ1ZmZlcj1uZXcgQnVmZmVyKDEpO1xuXHRcdHZhciB0aGF0PXRoaXM7XG5cblx0XHRmcy5yZWFkKHRoaXMuaGFuZGxlLGJ1ZmZlciwwLDEscG9zLGZ1bmN0aW9uKGVycixsZW4sYnVmZmVyKXtcblx0XHRcdHJlYWRMb2coXCJ1aThcIixsZW4pO1xuXHRcdFx0aWYgKGh0bWw1ZnMpY2IoIChuZXcgVWludDhBcnJheShidWZmZXIpKVswXSkgO1xuXHRcdFx0ZWxzZSAgXHRcdFx0Y2IuYXBwbHkodGhhdCxbYnVmZmVyLnJlYWRVSW50OCgwKV0pO1x0XG5cdFx0XHRcblx0XHR9KTtcblx0fVxuXHR2YXIgcmVhZEJ1Zj1mdW5jdGlvbihwb3MsYmxvY2tzaXplLGNiKSB7XG5cdFx0dmFyIHRoYXQ9dGhpcztcblx0XHR2YXIgYnVmPW5ldyBCdWZmZXIoYmxvY2tzaXplKTtcblx0XHRmcy5yZWFkKHRoaXMuaGFuZGxlLGJ1ZiwwLGJsb2Nrc2l6ZSxwb3MsZnVuY3Rpb24oZXJyLGxlbixidWZmZXIpe1xuXHRcdFx0cmVhZExvZyhcImJ1ZlwiLGxlbik7XG5cdFx0XHR2YXIgYnVmZj1uZXcgVWludDhBcnJheShidWZmZXIpXG5cdFx0XHRjYi5hcHBseSh0aGF0LFtidWZmXSk7XG5cdFx0fSk7XG5cdH1cblx0dmFyIHJlYWRCdWZfcGFja2VkaW50PWZ1bmN0aW9uKHBvcyxibG9ja3NpemUsY291bnQscmVzZXQsY2IpIHtcblx0XHR2YXIgdGhhdD10aGlzO1xuXHRcdHJlYWRCdWYuYXBwbHkodGhpcyxbcG9zLGJsb2Nrc2l6ZSxmdW5jdGlvbihidWZmZXIpe1xuXHRcdFx0Y2IuYXBwbHkodGhhdCxbdW5wYWNrX2ludChidWZmZXIsY291bnQscmVzZXQpXSk7XHRcblx0XHR9XSk7XG5cdFx0XG5cdH1cblx0dmFyIHJlYWRGaXhlZEFycmF5X2h0bWw1ZnM9ZnVuY3Rpb24ocG9zLGNvdW50LHVuaXRzaXplLGNiKSB7XG5cdFx0dmFyIGZ1bmM9bnVsbDtcblx0XHRpZiAodW5pdHNpemU9PT0xKSB7XG5cdFx0XHRmdW5jPSdnZXRVaW50OCc7Ly9VaW50OEFycmF5O1xuXHRcdH0gZWxzZSBpZiAodW5pdHNpemU9PT0yKSB7XG5cdFx0XHRmdW5jPSdnZXRVaW50MTYnOy8vVWludDE2QXJyYXk7XG5cdFx0fSBlbHNlIGlmICh1bml0c2l6ZT09PTQpIHtcblx0XHRcdGZ1bmM9J2dldFVpbnQzMic7Ly9VaW50MzJBcnJheTtcblx0XHR9IGVsc2UgdGhyb3cgJ3Vuc3VwcG9ydGVkIGludGVnZXIgc2l6ZSc7XG5cblx0XHRmcy5yZWFkKHRoaXMuaGFuZGxlLG51bGwsMCx1bml0c2l6ZSpjb3VudCxwb3MsZnVuY3Rpb24oZXJyLGxlbixidWZmZXIpe1xuXHRcdFx0cmVhZExvZyhcImZpeCBhcnJheVwiLGxlbik7XG5cdFx0XHR2YXIgb3V0PVtdO1xuXHRcdFx0aWYgKHVuaXRzaXplPT0xKSB7XG5cdFx0XHRcdG91dD1uZXcgVWludDhBcnJheShidWZmZXIpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBsZW4gLyB1bml0c2l6ZTsgaSsrKSB7IC8vZW5kaWFuIHByb2JsZW1cblx0XHRcdFx0Ly9cdG91dC5wdXNoKCBmdW5jKGJ1ZmZlcixpKnVuaXRzaXplKSk7XG5cdFx0XHRcdFx0b3V0LnB1c2goIHY9bmV3IERhdGFWaWV3KGJ1ZmZlcilbZnVuY10oaSxmYWxzZSkgKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRjYi5hcHBseSh0aGF0LFtvdXRdKTtcblx0XHR9KTtcblx0fVxuXHQvLyBzaWduYXR1cmUsIGl0ZW1jb3VudCwgcGF5bG9hZFxuXHR2YXIgcmVhZEZpeGVkQXJyYXkgPSBmdW5jdGlvbihwb3MgLGNvdW50LCB1bml0c2l6ZSxjYikge1xuXHRcdHZhciBmdW5jPW51bGw7XG5cdFx0dmFyIHRoYXQ9dGhpcztcblx0XHRcblx0XHRpZiAodW5pdHNpemUqIGNvdW50PnRoaXMuc2l6ZSAmJiB0aGlzLnNpemUpICB7XG5cdFx0XHRjb25zb2xlLmxvZyhcImFycmF5IHNpemUgZXhjZWVkIGZpbGUgc2l6ZVwiLHRoaXMuc2l6ZSlcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0XG5cdFx0aWYgKGh0bWw1ZnMpIHJldHVybiByZWFkRml4ZWRBcnJheV9odG1sNWZzLmFwcGx5KHRoaXMsW3Bvcyxjb3VudCx1bml0c2l6ZSxjYl0pO1xuXG5cdFx0dmFyIGl0ZW1zPW5ldyBCdWZmZXIoIHVuaXRzaXplKiBjb3VudCk7XG5cdFx0aWYgKHVuaXRzaXplPT09MSkge1xuXHRcdFx0ZnVuYz1pdGVtcy5yZWFkVUludDg7XG5cdFx0fSBlbHNlIGlmICh1bml0c2l6ZT09PTIpIHtcblx0XHRcdGZ1bmM9aXRlbXMucmVhZFVJbnQxNkJFO1xuXHRcdH0gZWxzZSBpZiAodW5pdHNpemU9PT00KSB7XG5cdFx0XHRmdW5jPWl0ZW1zLnJlYWRVSW50MzJCRTtcblx0XHR9IGVsc2UgdGhyb3cgJ3Vuc3VwcG9ydGVkIGludGVnZXIgc2l6ZSc7XG5cdFx0Ly9jb25zb2xlLmxvZygnaXRlbWNvdW50JyxpdGVtY291bnQsJ2J1ZmZlcicsYnVmZmVyKTtcblxuXHRcdGZzLnJlYWQodGhpcy5oYW5kbGUsaXRlbXMsMCx1bml0c2l6ZSpjb3VudCxwb3MsZnVuY3Rpb24oZXJyLGxlbixidWZmZXIpe1xuXHRcdFx0cmVhZExvZyhcImZpeCBhcnJheVwiLGxlbik7XG5cdFx0XHR2YXIgb3V0PVtdO1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBpdGVtcy5sZW5ndGggLyB1bml0c2l6ZTsgaSsrKSB7XG5cdFx0XHRcdG91dC5wdXNoKCBmdW5jLmFwcGx5KGl0ZW1zLFtpKnVuaXRzaXplXSkpO1xuXHRcdFx0fVxuXHRcdFx0Y2IuYXBwbHkodGhhdCxbb3V0XSk7XG5cdFx0fSk7XG5cdH1cblxuXHR2YXIgZnJlZT1mdW5jdGlvbigpIHtcblx0XHQvL2NvbnNvbGUubG9nKCdjbG9zaW5nICcsaGFuZGxlKTtcblx0XHRmcy5jbG9zZVN5bmModGhpcy5oYW5kbGUpO1xuXHR9XG5cdHZhciBzZXR1cGFwaT1mdW5jdGlvbigpIHtcblx0XHR2YXIgdGhhdD10aGlzO1xuXHRcdHRoaXMucmVhZFNpZ25hdHVyZT1yZWFkU2lnbmF0dXJlO1xuXHRcdHRoaXMucmVhZEkzMj1yZWFkSTMyO1xuXHRcdHRoaXMucmVhZFVJMzI9cmVhZFVJMzI7XG5cdFx0dGhpcy5yZWFkVUk4PXJlYWRVSTg7XG5cdFx0dGhpcy5yZWFkQnVmPXJlYWRCdWY7XG5cdFx0dGhpcy5yZWFkQnVmX3BhY2tlZGludD1yZWFkQnVmX3BhY2tlZGludDtcblx0XHR0aGlzLnJlYWRGaXhlZEFycmF5PXJlYWRGaXhlZEFycmF5O1xuXHRcdHRoaXMucmVhZFN0cmluZz1yZWFkU3RyaW5nO1xuXHRcdHRoaXMucmVhZFN0cmluZ0FycmF5PXJlYWRTdHJpbmdBcnJheTtcblx0XHR0aGlzLnNpZ25hdHVyZV9zaXplPXNpZ25hdHVyZV9zaXplO1xuXHRcdHRoaXMuZnJlZT1mcmVlO1xuXHRcdGlmIChodG1sNWZzKSB7XG5cdFx0XHR2YXIgZm49cGF0aDtcblx0XHRcdGlmIChwYXRoLmluZGV4T2YoXCJmaWxlc3lzdGVtOlwiKT09MCkgZm49cGF0aC5zdWJzdHIocGF0aC5sYXN0SW5kZXhPZihcIi9cIikpO1xuXHRcdFx0ZnMuZnMucm9vdC5nZXRGaWxlKGZuLHt9LGZ1bmN0aW9uKGVudHJ5KXtcblx0XHRcdCAgZW50cnkuZ2V0TWV0YWRhdGEoZnVuY3Rpb24obWV0YWRhdGEpIHsgXG5cdFx0XHRcdHRoYXQuc2l6ZT1tZXRhZGF0YS5zaXplO1xuXHRcdFx0XHRpZiAoY2IpIHNldFRpbWVvdXQoY2IuYmluZCh0aGF0KSwwKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dmFyIHN0YXQ9ZnMuZnN0YXRTeW5jKHRoaXMuaGFuZGxlKTtcblx0XHRcdHRoaXMuc3RhdD1zdGF0O1xuXHRcdFx0dGhpcy5zaXplPXN0YXQuc2l6ZTtcdFx0XG5cdFx0XHRpZiAoY2IpXHRzZXRUaW1lb3V0KGNiLmJpbmQodGhpcywwKSwwKTtcdFxuXHRcdH1cblx0fVxuXG5cdHZhciB0aGF0PXRoaXM7XG5cdGlmIChodG1sNWZzKSB7XG5cdFx0ZnMub3BlbihwYXRoLGZ1bmN0aW9uKGgpe1xuXHRcdFx0aWYgKCFoKSB7XG5cdFx0XHRcdGlmIChjYilcdHNldFRpbWVvdXQoY2IuYmluZChudWxsLFwiZmlsZSBub3QgZm91bmQ6XCIrcGF0aCksMCk7XHRcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoYXQuaGFuZGxlPWg7XG5cdFx0XHRcdHRoYXQuaHRtbDVmcz10cnVlO1xuXHRcdFx0XHRzZXR1cGFwaS5jYWxsKHRoYXQpO1xuXHRcdFx0XHR0aGF0Lm9wZW5lZD10cnVlO1x0XHRcdFx0XG5cdFx0XHR9XG5cdFx0fSlcblx0fSBlbHNlIHtcblx0XHRpZiAoZnMuZXhpc3RzU3luYyhwYXRoKSl7XG5cdFx0XHR0aGlzLmhhbmRsZT1mcy5vcGVuU3luYyhwYXRoLCdyJyk7Ly8sZnVuY3Rpb24oZXJyLGhhbmRsZSl7XG5cdFx0XHR0aGlzLm9wZW5lZD10cnVlO1xuXHRcdFx0c2V0dXBhcGkuY2FsbCh0aGlzKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYgKGNiKVx0c2V0VGltZW91dChjYi5iaW5kKG51bGwsXCJmaWxlIG5vdCBmb3VuZDpcIitwYXRoKSwwKTtcdFxuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXHR9XG5cdHJldHVybiB0aGlzO1xufVxubW9kdWxlLmV4cG9ydHM9T3BlbjsiLCIvKlxuICBKQVZBIGNhbiBvbmx5IHJldHVybiBOdW1iZXIgYW5kIFN0cmluZ1xuXHRhcnJheSBhbmQgYnVmZmVyIHJldHVybiBpbiBzdHJpbmcgZm9ybWF0XG5cdG5lZWQgSlNPTi5wYXJzZVxuKi9cbnZhciB2ZXJib3NlPTA7XG5cbnZhciByZWFkU2lnbmF0dXJlPWZ1bmN0aW9uKHBvcyxjYikge1xuXHRpZiAodmVyYm9zZSkgY29uc29sZS5kZWJ1ZyhcInJlYWQgc2lnbmF0dXJlXCIpO1xuXHR2YXIgc2lnbmF0dXJlPWtmcy5yZWFkVVRGOFN0cmluZyh0aGlzLmhhbmRsZSxwb3MsMSk7XG5cdGlmICh2ZXJib3NlKSBjb25zb2xlLmRlYnVnKHNpZ25hdHVyZSxzaWduYXR1cmUuY2hhckNvZGVBdCgwKSk7XG5cdGNiLmFwcGx5KHRoaXMsW3NpZ25hdHVyZV0pO1xufVxudmFyIHJlYWRJMzI9ZnVuY3Rpb24ocG9zLGNiKSB7XG5cdGlmICh2ZXJib3NlKSBjb25zb2xlLmRlYnVnKFwicmVhZCBpMzIgYXQgXCIrcG9zKTtcblx0dmFyIGkzMj1rZnMucmVhZEludDMyKHRoaXMuaGFuZGxlLHBvcyk7XG5cdGlmICh2ZXJib3NlKSBjb25zb2xlLmRlYnVnKGkzMik7XG5cdGNiLmFwcGx5KHRoaXMsW2kzMl0pO1x0XG59XG52YXIgcmVhZFVJMzI9ZnVuY3Rpb24ocG9zLGNiKSB7XG5cdGlmICh2ZXJib3NlKSBjb25zb2xlLmRlYnVnKFwicmVhZCB1aTMyIGF0IFwiK3Bvcyk7XG5cdHZhciB1aTMyPWtmcy5yZWFkVUludDMyKHRoaXMuaGFuZGxlLHBvcyk7XG5cdGlmICh2ZXJib3NlKSBjb25zb2xlLmRlYnVnKHVpMzIpO1xuXHRjYi5hcHBseSh0aGlzLFt1aTMyXSk7XG59XG52YXIgcmVhZFVJOD1mdW5jdGlvbihwb3MsY2IpIHtcblx0aWYgKHZlcmJvc2UpIGNvbnNvbGUuZGVidWcoXCJyZWFkIHVpOCBhdCBcIitwb3MpOyBcblx0dmFyIHVpOD1rZnMucmVhZFVJbnQ4KHRoaXMuaGFuZGxlLHBvcyk7XG5cdGlmICh2ZXJib3NlKSBjb25zb2xlLmRlYnVnKHVpOCk7XG5cdGNiLmFwcGx5KHRoaXMsW3VpOF0pO1xufVxudmFyIHJlYWRCdWY9ZnVuY3Rpb24ocG9zLGJsb2Nrc2l6ZSxjYikge1xuXHRpZiAodmVyYm9zZSkgY29uc29sZS5kZWJ1ZyhcInJlYWQgYnVmZmVyIGF0IFwiK3BvcysgXCIgYmxvY2tzaXplIFwiK2Jsb2Nrc2l6ZSk7XG5cdHZhciBidWY9a2ZzLnJlYWRCdWYodGhpcy5oYW5kbGUscG9zLGJsb2Nrc2l6ZSk7XG5cdHZhciBidWZmPUpTT04ucGFyc2UoYnVmKTtcblx0aWYgKHZlcmJvc2UpIGNvbnNvbGUuZGVidWcoXCJidWZmZXIgbGVuZ3RoXCIrYnVmZi5sZW5ndGgpO1xuXHRjYi5hcHBseSh0aGlzLFtidWZmXSk7XHRcbn1cbnZhciByZWFkQnVmX3BhY2tlZGludD1mdW5jdGlvbihwb3MsYmxvY2tzaXplLGNvdW50LHJlc2V0LGNiKSB7XG5cdGlmICh2ZXJib3NlKSBjb25zb2xlLmRlYnVnKFwicmVhZCBwYWNrZWQgaW50IGF0IFwiK3BvcytcIiBibG9ja3NpemUgXCIrYmxvY2tzaXplK1wiIGNvdW50IFwiK2NvdW50KTtcblx0dmFyIGJ1Zj1rZnMucmVhZEJ1Zl9wYWNrZWRpbnQodGhpcy5oYW5kbGUscG9zLGJsb2Nrc2l6ZSxjb3VudCxyZXNldCk7XG5cdHZhciBhZHY9cGFyc2VJbnQoYnVmKTtcblx0dmFyIGJ1ZmY9SlNPTi5wYXJzZShidWYuc3Vic3RyKGJ1Zi5pbmRleE9mKFwiW1wiKSkpO1xuXHRpZiAodmVyYm9zZSkgY29uc29sZS5kZWJ1ZyhcInBhY2tlZEludCBsZW5ndGggXCIrYnVmZi5sZW5ndGgrXCIgZmlyc3QgaXRlbT1cIitidWZmWzBdKTtcblx0Y2IuYXBwbHkodGhpcyxbe2RhdGE6YnVmZixhZHY6YWR2fV0pO1x0XG59XG5cblxudmFyIHJlYWRTdHJpbmc9IGZ1bmN0aW9uKHBvcyxibG9ja3NpemUsZW5jb2RpbmcsY2IpIHtcblx0aWYgKHZlcmJvc2UpIGNvbnNvbGUuZGVidWcoXCJyZWFkc3RyaW5nIGF0IFwiK3BvcytcIiBibG9ja3NpemUgXCIgK2Jsb2Nrc2l6ZStcIiBlbmM6XCIrZW5jb2RpbmcpO1xuXHRpZiAoZW5jb2Rpbmc9PVwidWNzMlwiKSB7XG5cdFx0dmFyIHN0cj1rZnMucmVhZFVMRTE2U3RyaW5nKHRoaXMuaGFuZGxlLHBvcyxibG9ja3NpemUpO1xuXHR9IGVsc2Uge1xuXHRcdHZhciBzdHI9a2ZzLnJlYWRVVEY4U3RyaW5nKHRoaXMuaGFuZGxlLHBvcyxibG9ja3NpemUpO1x0XG5cdH1cdCBcblx0aWYgKHZlcmJvc2UpIGNvbnNvbGUuZGVidWcoc3RyKTtcblx0Y2IuYXBwbHkodGhpcyxbc3RyXSk7XHRcbn1cblxudmFyIHJlYWRGaXhlZEFycmF5ID0gZnVuY3Rpb24ocG9zICxjb3VudCwgdW5pdHNpemUsY2IpIHtcblx0aWYgKHZlcmJvc2UpIGNvbnNvbGUuZGVidWcoXCJyZWFkIGZpeGVkIGFycmF5IGF0IFwiK3BvcytcIiBjb3VudCBcIitjb3VudCtcIiB1bml0c2l6ZSBcIit1bml0c2l6ZSk7IFxuXHR2YXIgYnVmPWtmcy5yZWFkRml4ZWRBcnJheSh0aGlzLmhhbmRsZSxwb3MsY291bnQsdW5pdHNpemUpO1xuXHR2YXIgYnVmZj1KU09OLnBhcnNlKGJ1Zik7XG5cdGlmICh2ZXJib3NlKSBjb25zb2xlLmRlYnVnKFwiYXJyYXkgbGVuZ3RoXCIrYnVmZi5sZW5ndGgpO1xuXHRjYi5hcHBseSh0aGlzLFtidWZmXSk7XHRcbn1cbnZhciByZWFkU3RyaW5nQXJyYXkgPSBmdW5jdGlvbihwb3MsYmxvY2tzaXplLGVuY29kaW5nLGNiKSB7XG5cdGlmICh2ZXJib3NlKSBjb25zb2xlLmxvZyhcInJlYWQgU3RyaW5nIGFycmF5IGF0IFwiK3BvcytcIiBibG9ja3NpemUgXCIrYmxvY2tzaXplICtcIiBlbmMgXCIrZW5jb2RpbmcpOyBcblx0ZW5jb2RpbmcgPSBlbmNvZGluZ3x8XCJ1dGY4XCI7XG5cdHZhciBidWY9a2ZzLnJlYWRTdHJpbmdBcnJheSh0aGlzLmhhbmRsZSxwb3MsYmxvY2tzaXplLGVuY29kaW5nKTtcblx0Ly92YXIgYnVmZj1KU09OLnBhcnNlKGJ1Zik7XG5cdGlmICh2ZXJib3NlKSBjb25zb2xlLmRlYnVnKFwicmVhZCBzdHJpbmcgYXJyYXlcIik7XG5cdHZhciBidWZmPWJ1Zi5zcGxpdChcIlxcdWZmZmZcIik7IC8vY2Fubm90IHJldHVybiBzdHJpbmcgd2l0aCAwXG5cdGlmICh2ZXJib3NlKSBjb25zb2xlLmRlYnVnKFwiYXJyYXkgbGVuZ3RoXCIrYnVmZi5sZW5ndGgpO1xuXHRjYi5hcHBseSh0aGlzLFtidWZmXSk7XHRcbn1cbnZhciBtZXJnZVBvc3RpbmdzPWZ1bmN0aW9uKHBvc2l0aW9ucyxjYikge1xuXHR2YXIgYnVmPWtmcy5tZXJnZVBvc3RpbmdzKHRoaXMuaGFuZGxlLEpTT04uc3RyaW5naWZ5KHBvc2l0aW9ucykpO1xuXHRpZiAoIWJ1ZiB8fCBidWYubGVuZ3RoPT0wKSByZXR1cm4gW107XG5cdGVsc2UgcmV0dXJuIEpTT04ucGFyc2UoYnVmKTtcbn1cblxudmFyIGZyZWU9ZnVuY3Rpb24oKSB7XG5cdC8vY29uc29sZS5sb2coJ2Nsb3NpbmcgJyxoYW5kbGUpO1xuXHRrZnMuY2xvc2UodGhpcy5oYW5kbGUpO1xufVxudmFyIE9wZW49ZnVuY3Rpb24ocGF0aCxvcHRzLGNiKSB7XG5cdG9wdHM9b3B0c3x8e307XG5cdHZhciBzaWduYXR1cmVfc2l6ZT0xO1xuXHR2YXIgc2V0dXBhcGk9ZnVuY3Rpb24oKSB7IFxuXHRcdHRoaXMucmVhZFNpZ25hdHVyZT1yZWFkU2lnbmF0dXJlO1xuXHRcdHRoaXMucmVhZEkzMj1yZWFkSTMyO1xuXHRcdHRoaXMucmVhZFVJMzI9cmVhZFVJMzI7XG5cdFx0dGhpcy5yZWFkVUk4PXJlYWRVSTg7XG5cdFx0dGhpcy5yZWFkQnVmPXJlYWRCdWY7XG5cdFx0dGhpcy5yZWFkQnVmX3BhY2tlZGludD1yZWFkQnVmX3BhY2tlZGludDtcblx0XHR0aGlzLnJlYWRGaXhlZEFycmF5PXJlYWRGaXhlZEFycmF5O1xuXHRcdHRoaXMucmVhZFN0cmluZz1yZWFkU3RyaW5nO1xuXHRcdHRoaXMucmVhZFN0cmluZ0FycmF5PXJlYWRTdHJpbmdBcnJheTtcblx0XHR0aGlzLnNpZ25hdHVyZV9zaXplPXNpZ25hdHVyZV9zaXplO1xuXHRcdHRoaXMubWVyZ2VQb3N0aW5ncz1tZXJnZVBvc3RpbmdzO1xuXHRcdHRoaXMuZnJlZT1mcmVlO1xuXHRcdHRoaXMuc2l6ZT1rZnMuZ2V0RmlsZVNpemUodGhpcy5oYW5kbGUpO1xuXHRcdGlmICh2ZXJib3NlKSBjb25zb2xlLmxvZyhcImZpbGVzaXplICBcIit0aGlzLnNpemUpO1xuXHRcdGlmIChjYilcdGNiLmNhbGwodGhpcyk7XG5cdH1cblxuXHR0aGlzLmhhbmRsZT1rZnMub3BlbihwYXRoKTtcblx0dGhpcy5vcGVuZWQ9dHJ1ZTtcblx0c2V0dXBhcGkuY2FsbCh0aGlzKTtcblx0cmV0dXJuIHRoaXM7XG59XG5cbm1vZHVsZS5leHBvcnRzPU9wZW47IiwiLypcbiAgSlNDb250ZXh0IGNhbiByZXR1cm4gYWxsIEphdmFzY3JpcHQgdHlwZXMuXG4qL1xudmFyIHZlcmJvc2U9MTtcblxudmFyIHJlYWRTaWduYXR1cmU9ZnVuY3Rpb24ocG9zLGNiKSB7XG5cdGlmICh2ZXJib3NlKSAga3NhbmFnYXAubG9nKFwicmVhZCBzaWduYXR1cmUgYXQgXCIrcG9zKTtcblx0dmFyIHNpZ25hdHVyZT1rZnMucmVhZFVURjhTdHJpbmcodGhpcy5oYW5kbGUscG9zLDEpO1xuXHRpZiAodmVyYm9zZSkgIGtzYW5hZ2FwLmxvZyhzaWduYXR1cmUrXCIgXCIrc2lnbmF0dXJlLmNoYXJDb2RlQXQoMCkpO1xuXHRjYi5hcHBseSh0aGlzLFtzaWduYXR1cmVdKTtcbn1cbnZhciByZWFkSTMyPWZ1bmN0aW9uKHBvcyxjYikge1xuXHRpZiAodmVyYm9zZSkgIGtzYW5hZ2FwLmxvZyhcInJlYWQgaTMyIGF0IFwiK3Bvcyk7XG5cdHZhciBpMzI9a2ZzLnJlYWRJbnQzMih0aGlzLmhhbmRsZSxwb3MpO1xuXHRpZiAodmVyYm9zZSkgIGtzYW5hZ2FwLmxvZyhpMzIpO1xuXHRjYi5hcHBseSh0aGlzLFtpMzJdKTtcdFxufVxudmFyIHJlYWRVSTMyPWZ1bmN0aW9uKHBvcyxjYikge1xuXHRpZiAodmVyYm9zZSkgIGtzYW5hZ2FwLmxvZyhcInJlYWQgdWkzMiBhdCBcIitwb3MpO1xuXHR2YXIgdWkzMj1rZnMucmVhZFVJbnQzMih0aGlzLmhhbmRsZSxwb3MpO1xuXHRpZiAodmVyYm9zZSkgIGtzYW5hZ2FwLmxvZyh1aTMyKTtcblx0Y2IuYXBwbHkodGhpcyxbdWkzMl0pO1xufVxudmFyIHJlYWRVSTg9ZnVuY3Rpb24ocG9zLGNiKSB7XG5cdGlmICh2ZXJib3NlKSAga3NhbmFnYXAubG9nKFwicmVhZCB1aTggYXQgXCIrcG9zKTsgXG5cdHZhciB1aTg9a2ZzLnJlYWRVSW50OCh0aGlzLmhhbmRsZSxwb3MpO1xuXHRpZiAodmVyYm9zZSkgIGtzYW5hZ2FwLmxvZyh1aTgpO1xuXHRjYi5hcHBseSh0aGlzLFt1aThdKTtcbn1cbnZhciByZWFkQnVmPWZ1bmN0aW9uKHBvcyxibG9ja3NpemUsY2IpIHtcblx0aWYgKHZlcmJvc2UpICBrc2FuYWdhcC5sb2coXCJyZWFkIGJ1ZmZlciBhdCBcIitwb3MpO1xuXHR2YXIgYnVmPWtmcy5yZWFkQnVmKHRoaXMuaGFuZGxlLHBvcyxibG9ja3NpemUpO1xuXHRpZiAodmVyYm9zZSkgIGtzYW5hZ2FwLmxvZyhcImJ1ZmZlciBsZW5ndGhcIitidWYubGVuZ3RoKTtcblx0Y2IuYXBwbHkodGhpcyxbYnVmXSk7XHRcbn1cbnZhciByZWFkQnVmX3BhY2tlZGludD1mdW5jdGlvbihwb3MsYmxvY2tzaXplLGNvdW50LHJlc2V0LGNiKSB7XG5cdGlmICh2ZXJib3NlKSAga3NhbmFnYXAubG9nKFwicmVhZCBwYWNrZWQgaW50IGZhc3QsIGJsb2Nrc2l6ZSBcIitibG9ja3NpemUrXCIgYXQgXCIrcG9zKTt2YXIgdD1uZXcgRGF0ZSgpO1xuXHR2YXIgYnVmPWtmcy5yZWFkQnVmX3BhY2tlZGludCh0aGlzLmhhbmRsZSxwb3MsYmxvY2tzaXplLGNvdW50LHJlc2V0KTtcblx0aWYgKHZlcmJvc2UpICBrc2FuYWdhcC5sb2coXCJyZXR1cm4gZnJvbSBwYWNrZWRpbnQsIHRpbWVcIiArIChuZXcgRGF0ZSgpLXQpKTtcblx0aWYgKHR5cGVvZiBidWYuZGF0YT09XCJzdHJpbmdcIikge1xuXHRcdGJ1Zi5kYXRhPWV2YWwoXCJbXCIrYnVmLmRhdGEuc3Vic3RyKDAsYnVmLmRhdGEubGVuZ3RoLTEpK1wiXVwiKTtcblx0fVxuXHRpZiAodmVyYm9zZSkgIGtzYW5hZ2FwLmxvZyhcInVucGFja2VkIGxlbmd0aFwiK2J1Zi5kYXRhLmxlbmd0aCtcIiB0aW1lXCIgKyAobmV3IERhdGUoKS10KSApO1xuXHRjYi5hcHBseSh0aGlzLFtidWZdKTtcbn1cblxuXG52YXIgcmVhZFN0cmluZz0gZnVuY3Rpb24ocG9zLGJsb2Nrc2l6ZSxlbmNvZGluZyxjYikge1xuXG5cdGlmICh2ZXJib3NlKSAga3NhbmFnYXAubG9nKFwicmVhZHN0cmluZyBhdCBcIitwb3MrXCIgYmxvY2tzaXplIFwiK2Jsb2Nrc2l6ZStcIiBcIitlbmNvZGluZyk7dmFyIHQ9bmV3IERhdGUoKTtcblx0aWYgKGVuY29kaW5nPT1cInVjczJcIikge1xuXHRcdHZhciBzdHI9a2ZzLnJlYWRVTEUxNlN0cmluZyh0aGlzLmhhbmRsZSxwb3MsYmxvY2tzaXplKTtcblx0fSBlbHNlIHtcblx0XHR2YXIgc3RyPWtmcy5yZWFkVVRGOFN0cmluZyh0aGlzLmhhbmRsZSxwb3MsYmxvY2tzaXplKTtcdFxuXHR9XG5cdGlmICh2ZXJib3NlKSAga3NhbmFnYXAubG9nKHN0citcIiB0aW1lXCIrKG5ldyBEYXRlKCktdCkpO1xuXHRjYi5hcHBseSh0aGlzLFtzdHJdKTtcdFxufVxuXG52YXIgcmVhZEZpeGVkQXJyYXkgPSBmdW5jdGlvbihwb3MgLGNvdW50LCB1bml0c2l6ZSxjYikge1xuXHRpZiAodmVyYm9zZSkgIGtzYW5hZ2FwLmxvZyhcInJlYWQgZml4ZWQgYXJyYXkgYXQgXCIrcG9zKTsgdmFyIHQ9bmV3IERhdGUoKTtcblx0dmFyIGJ1Zj1rZnMucmVhZEZpeGVkQXJyYXkodGhpcy5oYW5kbGUscG9zLGNvdW50LHVuaXRzaXplKTtcblx0aWYgKHZlcmJvc2UpICBrc2FuYWdhcC5sb2coXCJhcnJheSBsZW5ndGggXCIrYnVmLmxlbmd0aCtcIiB0aW1lXCIrKG5ldyBEYXRlKCktdCkpO1xuXHRjYi5hcHBseSh0aGlzLFtidWZdKTtcdFxufVxudmFyIHJlYWRTdHJpbmdBcnJheSA9IGZ1bmN0aW9uKHBvcyxibG9ja3NpemUsZW5jb2RpbmcsY2IpIHtcblx0Ly9pZiAodmVyYm9zZSkgIGtzYW5hZ2FwLmxvZyhcInJlYWQgU3RyaW5nIGFycmF5IFwiK2Jsb2Nrc2l6ZSArXCIgXCIrZW5jb2RpbmcpOyBcblx0ZW5jb2RpbmcgPSBlbmNvZGluZ3x8XCJ1dGY4XCI7XG5cdGlmICh2ZXJib3NlKSAga3NhbmFnYXAubG9nKFwicmVhZCBzdHJpbmcgYXJyYXkgYXQgXCIrcG9zKTt2YXIgdD1uZXcgRGF0ZSgpO1xuXHR2YXIgYnVmPWtmcy5yZWFkU3RyaW5nQXJyYXkodGhpcy5oYW5kbGUscG9zLGJsb2Nrc2l6ZSxlbmNvZGluZyk7XG5cdGlmICh0eXBlb2YgYnVmPT1cInN0cmluZ1wiKSBidWY9YnVmLnNwbGl0KFwiXFwwXCIpO1xuXHQvL3ZhciBidWZmPUpTT04ucGFyc2UoYnVmKTtcblx0Ly92YXIgYnVmZj1idWYuc3BsaXQoXCJcXHVmZmZmXCIpOyAvL2Nhbm5vdCByZXR1cm4gc3RyaW5nIHdpdGggMFxuXHRpZiAodmVyYm9zZSkgIGtzYW5hZ2FwLmxvZyhcInN0cmluZyBhcnJheSBsZW5ndGhcIitidWYubGVuZ3RoK1wiIHRpbWVcIisobmV3IERhdGUoKS10KSk7XG5cdGNiLmFwcGx5KHRoaXMsW2J1Zl0pO1xufVxuXG52YXIgbWVyZ2VQb3N0aW5ncz1mdW5jdGlvbihwb3NpdGlvbnMpIHtcblx0dmFyIGJ1Zj1rZnMubWVyZ2VQb3N0aW5ncyh0aGlzLmhhbmRsZSxwb3NpdGlvbnMpO1xuXHRpZiAodHlwZW9mIGJ1Zj09XCJzdHJpbmdcIikge1xuXHRcdGJ1Zj1ldmFsKFwiW1wiK2J1Zi5zdWJzdHIoMCxidWYubGVuZ3RoLTEpK1wiXVwiKTtcblx0fVxuXHRyZXR1cm4gYnVmO1xufVxudmFyIGZyZWU9ZnVuY3Rpb24oKSB7XG5cdC8vLy9pZiAodmVyYm9zZSkgIGtzYW5hZ2FwLmxvZygnY2xvc2luZyAnLGhhbmRsZSk7XG5cdGtmcy5jbG9zZSh0aGlzLmhhbmRsZSk7XG59XG52YXIgT3Blbj1mdW5jdGlvbihwYXRoLG9wdHMsY2IpIHtcblx0b3B0cz1vcHRzfHx7fTtcblx0dmFyIHNpZ25hdHVyZV9zaXplPTE7XG5cdHZhciBzZXR1cGFwaT1mdW5jdGlvbigpIHsgXG5cdFx0dGhpcy5yZWFkU2lnbmF0dXJlPXJlYWRTaWduYXR1cmU7XG5cdFx0dGhpcy5yZWFkSTMyPXJlYWRJMzI7XG5cdFx0dGhpcy5yZWFkVUkzMj1yZWFkVUkzMjtcblx0XHR0aGlzLnJlYWRVSTg9cmVhZFVJODtcblx0XHR0aGlzLnJlYWRCdWY9cmVhZEJ1Zjtcblx0XHR0aGlzLnJlYWRCdWZfcGFja2VkaW50PXJlYWRCdWZfcGFja2VkaW50O1xuXHRcdHRoaXMucmVhZEZpeGVkQXJyYXk9cmVhZEZpeGVkQXJyYXk7XG5cdFx0dGhpcy5yZWFkU3RyaW5nPXJlYWRTdHJpbmc7XG5cdFx0dGhpcy5yZWFkU3RyaW5nQXJyYXk9cmVhZFN0cmluZ0FycmF5O1xuXHRcdHRoaXMuc2lnbmF0dXJlX3NpemU9c2lnbmF0dXJlX3NpemU7XG5cdFx0dGhpcy5tZXJnZVBvc3RpbmdzPW1lcmdlUG9zdGluZ3M7XG5cdFx0dGhpcy5mcmVlPWZyZWU7XG5cdFx0dGhpcy5zaXplPWtmcy5nZXRGaWxlU2l6ZSh0aGlzLmhhbmRsZSk7XG5cdFx0aWYgKHZlcmJvc2UpICBrc2FuYWdhcC5sb2coXCJmaWxlc2l6ZSAgXCIrdGhpcy5zaXplKTtcblx0XHRpZiAoY2IpXHRjYi5jYWxsKHRoaXMpO1xuXHR9XG5cblx0dGhpcy5oYW5kbGU9a2ZzLm9wZW4ocGF0aCk7XG5cdHRoaXMub3BlbmVkPXRydWU7XG5cdHNldHVwYXBpLmNhbGwodGhpcyk7XG5cdHJldHVybiB0aGlzO1xufVxuXG5tb2R1bGUuZXhwb3J0cz1PcGVuOyIsIi8qXG4gIGNvbnZlcnQgYW55IGpzb24gaW50byBhIGJpbmFyeSBidWZmZXJcbiAgdGhlIGJ1ZmZlciBjYW4gYmUgc2F2ZWQgd2l0aCBhIHNpbmdsZSBsaW5lIG9mIGZzLndyaXRlRmlsZVxuKi9cblxudmFyIERUPXtcblx0dWludDg6JzEnLCAvL3Vuc2lnbmVkIDEgYnl0ZSBpbnRlZ2VyXG5cdGludDMyOic0JywgLy8gc2lnbmVkIDQgYnl0ZXMgaW50ZWdlclxuXHR1dGY4Oic4JywgIFxuXHR1Y3MyOicyJyxcblx0Ym9vbDonXicsIFxuXHRibG9iOicmJyxcblx0dXRmOGFycjonKicsIC8vc2hpZnQgb2YgOFxuXHR1Y3MyYXJyOidAJywgLy9zaGlmdCBvZiAyXG5cdHVpbnQ4YXJyOichJywgLy9zaGlmdCBvZiAxXG5cdGludDMyYXJyOickJywgLy9zaGlmdCBvZiA0XG5cdHZpbnQ6J2AnLFxuXHRwaW50Oid+JyxcdFxuXG5cdGFycmF5OidcXHUwMDFiJyxcblx0b2JqZWN0OidcXHUwMDFhJyBcblx0Ly95ZGIgc3RhcnQgd2l0aCBvYmplY3Qgc2lnbmF0dXJlLFxuXHQvL3R5cGUgYSB5ZGIgaW4gY29tbWFuZCBwcm9tcHQgc2hvd3Mgbm90aGluZ1xufVxudmFyIGtleV93cml0aW5nPVwiXCI7Ly9mb3IgZGVidWdnaW5nXG52YXIgcGFja19pbnQgPSBmdW5jdGlvbiAoYXIsIHNhdmVkZWx0YSkgeyAvLyBwYWNrIGFyIGludG9cbiAgaWYgKCFhciB8fCBhci5sZW5ndGggPT09IDApIHJldHVybiBbXTsgLy8gZW1wdHkgYXJyYXlcbiAgdmFyIHIgPSBbXSxcbiAgaSA9IDAsXG4gIGogPSAwLFxuICBkZWx0YSA9IDAsXG4gIHByZXYgPSAwO1xuICBcbiAgZG8ge1xuXHRkZWx0YSA9IGFyW2ldO1xuXHRpZiAoc2F2ZWRlbHRhKSB7XG5cdFx0ZGVsdGEgLT0gcHJldjtcblx0fVxuXHRpZiAoZGVsdGEgPCAwKSB7XG5cdCAgY29uc29sZS50cmFjZSgnbmVnYXRpdmUnLHByZXYsYXJbaV0pXG5cdCAgdGhyb3cgJ25lZ2V0aXZlJztcblx0ICBicmVhaztcblx0fVxuXHRcblx0cltqKytdID0gZGVsdGEgJiAweDdmO1xuXHRkZWx0YSA+Pj0gNztcblx0d2hpbGUgKGRlbHRhID4gMCkge1xuXHQgIHJbaisrXSA9IChkZWx0YSAmIDB4N2YpIHwgMHg4MDtcblx0ICBkZWx0YSA+Pj0gNztcblx0fVxuXHRwcmV2ID0gYXJbaV07XG5cdGkrKztcbiAgfSB3aGlsZSAoaSA8IGFyLmxlbmd0aCk7XG4gIHJldHVybiByO1xufVxudmFyIEtmcz1mdW5jdGlvbihwYXRoLG9wdHMpIHtcblx0XG5cdHZhciBoYW5kbGU9bnVsbDtcblx0b3B0cz1vcHRzfHx7fTtcblx0b3B0cy5zaXplPW9wdHMuc2l6ZXx8NjU1MzYqMjA0ODsgXG5cdGNvbnNvbGUubG9nKCdrZGIgZXN0aW1hdGUgc2l6ZTonLG9wdHMuc2l6ZSk7XG5cdHZhciBkYnVmPW5ldyBCdWZmZXIob3B0cy5zaXplKTtcblx0dmFyIGN1cj0wOy8vZGJ1ZiBjdXJzb3Jcblx0XG5cdHZhciB3cml0ZVNpZ25hdHVyZT1mdW5jdGlvbih2YWx1ZSxwb3MpIHtcblx0XHRkYnVmLndyaXRlKHZhbHVlLHBvcyx2YWx1ZS5sZW5ndGgsJ3V0ZjgnKTtcblx0XHRpZiAocG9zK3ZhbHVlLmxlbmd0aD5jdXIpIGN1cj1wb3MrdmFsdWUubGVuZ3RoO1xuXHRcdHJldHVybiB2YWx1ZS5sZW5ndGg7XG5cdH1cblx0dmFyIHdyaXRlT2Zmc2V0PWZ1bmN0aW9uKHZhbHVlLHBvcykge1xuXHRcdGRidWYud3JpdGVVSW50OChNYXRoLmZsb29yKHZhbHVlIC8gKDY1NTM2KjY1NTM2KSkscG9zKTtcblx0XHRkYnVmLndyaXRlVUludDMyQkUoIHZhbHVlICYgMHhGRkZGRkZGRixwb3MrMSk7XG5cdFx0aWYgKHBvcys1PmN1cikgY3VyPXBvcys1O1xuXHRcdHJldHVybiA1O1xuXHR9XG5cdHZhciB3cml0ZVN0cmluZz0gZnVuY3Rpb24odmFsdWUscG9zLGVuY29kaW5nKSB7XG5cdFx0ZW5jb2Rpbmc9ZW5jb2Rpbmd8fCd1Y3MyJztcblx0XHRpZiAodmFsdWU9PVwiXCIpIHRocm93IFwiY2Fubm90IHdyaXRlIG51bGwgc3RyaW5nXCI7XG5cdFx0aWYgKGVuY29kaW5nPT09J3V0ZjgnKWRidWYud3JpdGUoRFQudXRmOCxwb3MsMSwndXRmOCcpO1xuXHRcdGVsc2UgaWYgKGVuY29kaW5nPT09J3VjczInKWRidWYud3JpdGUoRFQudWNzMixwb3MsMSwndXRmOCcpO1xuXHRcdGVsc2UgdGhyb3cgJ3Vuc3VwcG9ydGVkIGVuY29kaW5nICcrZW5jb2Rpbmc7XG5cdFx0XHRcblx0XHR2YXIgbGVuPUJ1ZmZlci5ieXRlTGVuZ3RoKHZhbHVlLCBlbmNvZGluZyk7XG5cdFx0ZGJ1Zi53cml0ZSh2YWx1ZSxwb3MrMSxsZW4sZW5jb2RpbmcpO1xuXHRcdFxuXHRcdGlmIChwb3MrbGVuKzE+Y3VyKSBjdXI9cG9zK2xlbisxO1xuXHRcdHJldHVybiBsZW4rMTsgLy8gc2lnbmF0dXJlXG5cdH1cblx0dmFyIHdyaXRlU3RyaW5nQXJyYXkgPSBmdW5jdGlvbih2YWx1ZSxwb3MsZW5jb2RpbmcpIHtcblx0XHRlbmNvZGluZz1lbmNvZGluZ3x8J3VjczInO1xuXHRcdGlmIChlbmNvZGluZz09PSd1dGY4JykgZGJ1Zi53cml0ZShEVC51dGY4YXJyLHBvcywxLCd1dGY4Jyk7XG5cdFx0ZWxzZSBpZiAoZW5jb2Rpbmc9PT0ndWNzMicpZGJ1Zi53cml0ZShEVC51Y3MyYXJyLHBvcywxLCd1dGY4Jyk7XG5cdFx0ZWxzZSB0aHJvdyAndW5zdXBwb3J0ZWQgZW5jb2RpbmcgJytlbmNvZGluZztcblx0XHRcblx0XHR2YXIgdj12YWx1ZS5qb2luKCdcXDAnKTtcblx0XHR2YXIgbGVuPUJ1ZmZlci5ieXRlTGVuZ3RoKHYsIGVuY29kaW5nKTtcblx0XHRpZiAoMD09PWxlbikge1xuXHRcdFx0dGhyb3cgXCJlbXB0eSBzdHJpbmcgYXJyYXkgXCIgKyBrZXlfd3JpdGluZztcblx0XHR9XG5cdFx0ZGJ1Zi53cml0ZSh2LHBvcysxLGxlbixlbmNvZGluZyk7XG5cdFx0aWYgKHBvcytsZW4rMT5jdXIpIGN1cj1wb3MrbGVuKzE7XG5cdFx0cmV0dXJuIGxlbisxO1xuXHR9XG5cdHZhciB3cml0ZUkzMj1mdW5jdGlvbih2YWx1ZSxwb3MpIHtcblx0XHRkYnVmLndyaXRlKERULmludDMyLHBvcywxLCd1dGY4Jyk7XG5cdFx0ZGJ1Zi53cml0ZUludDMyQkUodmFsdWUscG9zKzEpO1xuXHRcdGlmIChwb3MrNT5jdXIpIGN1cj1wb3MrNTtcblx0XHRyZXR1cm4gNTtcblx0fVxuXHR2YXIgd3JpdGVVSTg9ZnVuY3Rpb24odmFsdWUscG9zKSB7XG5cdFx0ZGJ1Zi53cml0ZShEVC51aW50OCxwb3MsMSwndXRmOCcpO1xuXHRcdGRidWYud3JpdGVVSW50OCh2YWx1ZSxwb3MrMSk7XG5cdFx0aWYgKHBvcysyPmN1cikgY3VyPXBvcysyO1xuXHRcdHJldHVybiAyO1xuXHR9XG5cdHZhciB3cml0ZUJvb2w9ZnVuY3Rpb24odmFsdWUscG9zKSB7XG5cdFx0ZGJ1Zi53cml0ZShEVC5ib29sLHBvcywxLCd1dGY4Jyk7XG5cdFx0ZGJ1Zi53cml0ZVVJbnQ4KE51bWJlcih2YWx1ZSkscG9zKzEpO1xuXHRcdGlmIChwb3MrMj5jdXIpIGN1cj1wb3MrMjtcblx0XHRyZXR1cm4gMjtcblx0fVx0XHRcblx0dmFyIHdyaXRlQmxvYj1mdW5jdGlvbih2YWx1ZSxwb3MpIHtcblx0XHRkYnVmLndyaXRlKERULmJsb2IscG9zLDEsJ3V0ZjgnKTtcblx0XHR2YWx1ZS5jb3B5KGRidWYsIHBvcysxKTtcblx0XHR2YXIgd3JpdHRlbj12YWx1ZS5sZW5ndGgrMTtcblx0XHRpZiAocG9zK3dyaXR0ZW4+Y3VyKSBjdXI9cG9zK3dyaXR0ZW47XG5cdFx0cmV0dXJuIHdyaXR0ZW47XG5cdH1cdFx0XG5cdC8qIG5vIHNpZ25hdHVyZSAqL1xuXHR2YXIgd3JpdGVGaXhlZEFycmF5ID0gZnVuY3Rpb24odmFsdWUscG9zLHVuaXRzaXplKSB7XG5cdFx0Ly9jb25zb2xlLmxvZygndi5sZW4nLHZhbHVlLmxlbmd0aCxpdGVtcy5sZW5ndGgsdW5pdHNpemUpO1xuXHRcdGlmICh1bml0c2l6ZT09PTEpIHZhciBmdW5jPWRidWYud3JpdGVVSW50ODtcblx0XHRlbHNlIGlmICh1bml0c2l6ZT09PTQpdmFyIGZ1bmM9ZGJ1Zi53cml0ZUludDMyQkU7XG5cdFx0ZWxzZSB0aHJvdyAndW5zdXBwb3J0ZWQgaW50ZWdlciBzaXplJztcblx0XHRpZiAoIXZhbHVlLmxlbmd0aCkge1xuXHRcdFx0dGhyb3cgXCJlbXB0eSBmaXhlZCBhcnJheSBcIitrZXlfd3JpdGluZztcblx0XHR9XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB2YWx1ZS5sZW5ndGggOyBpKyspIHtcblx0XHRcdGZ1bmMuYXBwbHkoZGJ1ZixbdmFsdWVbaV0saSp1bml0c2l6ZStwb3NdKVxuXHRcdH1cblx0XHR2YXIgbGVuPXVuaXRzaXplKnZhbHVlLmxlbmd0aDtcblx0XHRpZiAocG9zK2xlbj5jdXIpIGN1cj1wb3MrbGVuO1xuXHRcdHJldHVybiBsZW47XG5cdH1cblxuXHR0aGlzLndyaXRlSTMyPXdyaXRlSTMyO1xuXHR0aGlzLndyaXRlQm9vbD13cml0ZUJvb2w7XG5cdHRoaXMud3JpdGVCbG9iPXdyaXRlQmxvYjtcblx0dGhpcy53cml0ZVVJOD13cml0ZVVJODtcblx0dGhpcy53cml0ZVN0cmluZz13cml0ZVN0cmluZztcblx0dGhpcy53cml0ZVNpZ25hdHVyZT13cml0ZVNpZ25hdHVyZTtcblx0dGhpcy53cml0ZU9mZnNldD13cml0ZU9mZnNldDsgLy81IGJ5dGVzIG9mZnNldFxuXHR0aGlzLndyaXRlU3RyaW5nQXJyYXk9d3JpdGVTdHJpbmdBcnJheTtcblx0dGhpcy53cml0ZUZpeGVkQXJyYXk9d3JpdGVGaXhlZEFycmF5O1xuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgXCJidWZcIiwge2dldCA6IGZ1bmN0aW9uKCl7IHJldHVybiBkYnVmOyB9fSk7XG5cdFxuXHRyZXR1cm4gdGhpcztcbn1cblxudmFyIENyZWF0ZT1mdW5jdGlvbihwYXRoLG9wdHMpIHtcblx0b3B0cz1vcHRzfHx7fTtcblx0dmFyIGtmcz1uZXcgS2ZzKHBhdGgsb3B0cyk7XG5cdHZhciBjdXI9MDtcblxuXHR2YXIgaGFuZGxlPXt9O1xuXHRcblx0Ly9ubyBzaWduYXR1cmVcblx0dmFyIHdyaXRlVkludCA9ZnVuY3Rpb24oYXJyKSB7XG5cdFx0dmFyIG89cGFja19pbnQoYXJyLGZhbHNlKTtcblx0XHRrZnMud3JpdGVGaXhlZEFycmF5KG8sY3VyLDEpO1xuXHRcdGN1cis9by5sZW5ndGg7XG5cdH1cblx0dmFyIHdyaXRlVkludDE9ZnVuY3Rpb24odmFsdWUpIHtcblx0XHR3cml0ZVZJbnQoW3ZhbHVlXSk7XG5cdH1cblx0Ly9mb3IgcG9zdGluZ3Ncblx0dmFyIHdyaXRlUEludCA9ZnVuY3Rpb24oYXJyKSB7XG5cdFx0dmFyIG89cGFja19pbnQoYXJyLHRydWUpO1xuXHRcdGtmcy53cml0ZUZpeGVkQXJyYXkobyxjdXIsMSk7XG5cdFx0Y3VyKz1vLmxlbmd0aDtcblx0fVxuXHRcblx0dmFyIHNhdmVWSW50ID0gZnVuY3Rpb24oYXJyLGtleSkge1xuXHRcdHZhciBzdGFydD1jdXI7XG5cdFx0a2V5X3dyaXRpbmc9a2V5O1xuXHRcdGN1cis9a2ZzLndyaXRlU2lnbmF0dXJlKERULnZpbnQsY3VyKTtcblx0XHR3cml0ZVZJbnQoYXJyKTtcblx0XHR2YXIgd3JpdHRlbiA9IGN1ci1zdGFydDtcblx0XHRwdXNoaXRlbShrZXksd3JpdHRlbik7XG5cdFx0cmV0dXJuIHdyaXR0ZW47XHRcdFxuXHR9XG5cdHZhciBzYXZlUEludCA9IGZ1bmN0aW9uKGFycixrZXkpIHtcblx0XHR2YXIgc3RhcnQ9Y3VyO1xuXHRcdGtleV93cml0aW5nPWtleTtcblx0XHRjdXIrPWtmcy53cml0ZVNpZ25hdHVyZShEVC5waW50LGN1cik7XG5cdFx0d3JpdGVQSW50KGFycik7XG5cdFx0dmFyIHdyaXR0ZW4gPSBjdXItc3RhcnQ7XG5cdFx0cHVzaGl0ZW0oa2V5LHdyaXR0ZW4pO1xuXHRcdHJldHVybiB3cml0dGVuO1x0XG5cdH1cblxuXHRcblx0dmFyIHNhdmVVSTggPSBmdW5jdGlvbih2YWx1ZSxrZXkpIHtcblx0XHR2YXIgd3JpdHRlbj1rZnMud3JpdGVVSTgodmFsdWUsY3VyKTtcblx0XHRjdXIrPXdyaXR0ZW47XG5cdFx0cHVzaGl0ZW0oa2V5LHdyaXR0ZW4pO1xuXHRcdHJldHVybiB3cml0dGVuO1xuXHR9XG5cdHZhciBzYXZlQm9vbD1mdW5jdGlvbih2YWx1ZSxrZXkpIHtcblx0XHR2YXIgd3JpdHRlbj1rZnMud3JpdGVCb29sKHZhbHVlLGN1cik7XG5cdFx0Y3VyKz13cml0dGVuO1xuXHRcdHB1c2hpdGVtKGtleSx3cml0dGVuKTtcblx0XHRyZXR1cm4gd3JpdHRlbjtcblx0fVxuXHR2YXIgc2F2ZUkzMiA9IGZ1bmN0aW9uKHZhbHVlLGtleSkge1xuXHRcdHZhciB3cml0dGVuPWtmcy53cml0ZUkzMih2YWx1ZSxjdXIpO1xuXHRcdGN1cis9d3JpdHRlbjtcblx0XHRwdXNoaXRlbShrZXksd3JpdHRlbik7XG5cdFx0cmV0dXJuIHdyaXR0ZW47XG5cdH1cdFxuXHR2YXIgc2F2ZVN0cmluZyA9IGZ1bmN0aW9uKHZhbHVlLGtleSxlbmNvZGluZykge1xuXHRcdGVuY29kaW5nPWVuY29kaW5nfHxzdHJpbmdlbmNvZGluZztcblx0XHRrZXlfd3JpdGluZz1rZXk7XG5cdFx0dmFyIHdyaXR0ZW49a2ZzLndyaXRlU3RyaW5nKHZhbHVlLGN1cixlbmNvZGluZyk7XG5cdFx0Y3VyKz13cml0dGVuO1xuXHRcdHB1c2hpdGVtKGtleSx3cml0dGVuKTtcblx0XHRyZXR1cm4gd3JpdHRlbjtcblx0fVxuXHR2YXIgc2F2ZVN0cmluZ0FycmF5ID0gZnVuY3Rpb24oYXJyLGtleSxlbmNvZGluZykge1xuXHRcdGVuY29kaW5nPWVuY29kaW5nfHxzdHJpbmdlbmNvZGluZztcblx0XHRrZXlfd3JpdGluZz1rZXk7XG5cdFx0dHJ5IHtcblx0XHRcdHZhciB3cml0dGVuPWtmcy53cml0ZVN0cmluZ0FycmF5KGFycixjdXIsZW5jb2RpbmcpO1xuXHRcdH0gY2F0Y2goZSkge1xuXHRcdFx0dGhyb3cgZTtcblx0XHR9XG5cdFx0Y3VyKz13cml0dGVuO1xuXHRcdHB1c2hpdGVtKGtleSx3cml0dGVuKTtcblx0XHRyZXR1cm4gd3JpdHRlbjtcblx0fVxuXHRcblx0dmFyIHNhdmVCbG9iID0gZnVuY3Rpb24odmFsdWUsa2V5KSB7XG5cdFx0a2V5X3dyaXRpbmc9a2V5O1xuXHRcdHZhciB3cml0dGVuPWtmcy53cml0ZUJsb2IodmFsdWUsY3VyKTtcblx0XHRjdXIrPXdyaXR0ZW47XG5cdFx0cHVzaGl0ZW0oa2V5LHdyaXR0ZW4pO1xuXHRcdHJldHVybiB3cml0dGVuO1xuXHR9XG5cblx0dmFyIGZvbGRlcnM9W107XG5cdHZhciBwdXNoaXRlbT1mdW5jdGlvbihrZXksd3JpdHRlbikge1xuXHRcdHZhciBmb2xkZXI9Zm9sZGVyc1tmb2xkZXJzLmxlbmd0aC0xXTtcdFxuXHRcdGlmICghZm9sZGVyKSByZXR1cm4gO1xuXHRcdGZvbGRlci5pdGVtc2xlbmd0aC5wdXNoKHdyaXR0ZW4pO1xuXHRcdGlmIChrZXkpIHtcblx0XHRcdGlmICghZm9sZGVyLmtleXMpIHRocm93ICdjYW5ub3QgaGF2ZSBrZXkgaW4gYXJyYXknO1xuXHRcdFx0Zm9sZGVyLmtleXMucHVzaChrZXkpO1xuXHRcdH1cblx0fVx0XG5cdHZhciBvcGVuID0gZnVuY3Rpb24ob3B0KSB7XG5cdFx0dmFyIHN0YXJ0PWN1cjtcblx0XHR2YXIga2V5PW9wdC5rZXkgfHwgbnVsbDtcblx0XHR2YXIgdHlwZT1vcHQudHlwZXx8RFQuYXJyYXk7XG5cdFx0Y3VyKz1rZnMud3JpdGVTaWduYXR1cmUodHlwZSxjdXIpO1xuXHRcdGN1cis9a2ZzLndyaXRlT2Zmc2V0KDB4MCxjdXIpOyAvLyBwcmUtYWxsb2Mgc3BhY2UgZm9yIG9mZnNldFxuXHRcdHZhciBmb2xkZXI9e1xuXHRcdFx0dHlwZTp0eXBlLCBrZXk6a2V5LFxuXHRcdFx0c3RhcnQ6c3RhcnQsZGF0YXN0YXJ0OmN1cixcblx0XHRcdGl0ZW1zbGVuZ3RoOltdIH07XG5cdFx0aWYgKHR5cGU9PT1EVC5vYmplY3QpIGZvbGRlci5rZXlzPVtdO1xuXHRcdGZvbGRlcnMucHVzaChmb2xkZXIpO1xuXHR9XG5cdHZhciBvcGVuT2JqZWN0ID0gZnVuY3Rpb24oa2V5KSB7XG5cdFx0b3Blbih7dHlwZTpEVC5vYmplY3Qsa2V5OmtleX0pO1xuXHR9XG5cdHZhciBvcGVuQXJyYXkgPSBmdW5jdGlvbihrZXkpIHtcblx0XHRvcGVuKHt0eXBlOkRULmFycmF5LGtleTprZXl9KTtcblx0fVxuXHR2YXIgc2F2ZUludHM9ZnVuY3Rpb24oYXJyLGtleSxmdW5jKSB7XG5cdFx0ZnVuYy5hcHBseShoYW5kbGUsW2FycixrZXldKTtcblx0fVxuXHR2YXIgY2xvc2UgPSBmdW5jdGlvbihvcHQpIHtcblx0XHRpZiAoIWZvbGRlcnMubGVuZ3RoKSB0aHJvdyAnZW1wdHkgc3RhY2snO1xuXHRcdHZhciBmb2xkZXI9Zm9sZGVycy5wb3AoKTtcblx0XHQvL2p1bXAgdG8gbGVuZ3RocyBhbmQga2V5c1xuXHRcdGtmcy53cml0ZU9mZnNldCggY3VyLWZvbGRlci5kYXRhc3RhcnQsIGZvbGRlci5kYXRhc3RhcnQtNSk7XG5cdFx0dmFyIGl0ZW1jb3VudD1mb2xkZXIuaXRlbXNsZW5ndGgubGVuZ3RoO1xuXHRcdC8vc2F2ZSBsZW5ndGhzXG5cdFx0d3JpdGVWSW50MShpdGVtY291bnQpO1xuXHRcdHdyaXRlVkludChmb2xkZXIuaXRlbXNsZW5ndGgpO1xuXHRcdFxuXHRcdGlmIChmb2xkZXIudHlwZT09PURULm9iamVjdCkge1xuXHRcdFx0Ly91c2UgdXRmOCBmb3Iga2V5c1xuXHRcdFx0Y3VyKz1rZnMud3JpdGVTdHJpbmdBcnJheShmb2xkZXIua2V5cyxjdXIsJ3V0ZjgnKTtcblx0XHR9XG5cdFx0d3JpdHRlbj1jdXItZm9sZGVyLnN0YXJ0O1xuXHRcdHB1c2hpdGVtKGZvbGRlci5rZXksd3JpdHRlbik7XG5cdFx0cmV0dXJuIHdyaXR0ZW47XG5cdH1cblx0XG5cdFxuXHR2YXIgc3RyaW5nZW5jb2Rpbmc9J3VjczInO1xuXHR2YXIgc3RyaW5nRW5jb2Rpbmc9ZnVuY3Rpb24obmV3ZW5jb2RpbmcpIHtcblx0XHRpZiAobmV3ZW5jb2RpbmcpIHN0cmluZ2VuY29kaW5nPW5ld2VuY29kaW5nO1xuXHRcdGVsc2UgcmV0dXJuIHN0cmluZ2VuY29kaW5nO1xuXHR9XG5cdFxuXHR2YXIgYWxsbnVtYmVyX2Zhc3Q9ZnVuY3Rpb24oYXJyKSB7XG5cdFx0aWYgKGFyci5sZW5ndGg8NSkgcmV0dXJuIGFsbG51bWJlcihhcnIpO1xuXHRcdGlmICh0eXBlb2YgYXJyWzBdPT0nbnVtYmVyJ1xuXHRcdCAgICAmJiBNYXRoLnJvdW5kKGFyclswXSk9PWFyclswXSAmJiBhcnJbMF0+PTApXG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblx0dmFyIGFsbHN0cmluZ19mYXN0PWZ1bmN0aW9uKGFycikge1xuXHRcdGlmIChhcnIubGVuZ3RoPDUpIHJldHVybiBhbGxzdHJpbmcoYXJyKTtcblx0XHRpZiAodHlwZW9mIGFyclswXT09J3N0cmluZycpIHJldHVybiB0cnVlO1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVx0XG5cdHZhciBhbGxudW1iZXI9ZnVuY3Rpb24oYXJyKSB7XG5cdFx0Zm9yICh2YXIgaT0wO2k8YXJyLmxlbmd0aDtpKyspIHtcblx0XHRcdGlmICh0eXBlb2YgYXJyW2ldIT09J251bWJlcicpIHJldHVybiBmYWxzZTtcblx0XHR9XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblx0dmFyIGFsbHN0cmluZz1mdW5jdGlvbihhcnIpIHtcblx0XHRmb3IgKHZhciBpPTA7aTxhcnIubGVuZ3RoO2krKykge1xuXHRcdFx0aWYgKHR5cGVvZiBhcnJbaV0hPT0nc3RyaW5nJykgcmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXHR2YXIgZ2V0RW5jb2Rpbmc9ZnVuY3Rpb24oa2V5LGVuY3MpIHtcblx0XHR2YXIgZW5jPWVuY3Nba2V5XTtcblx0XHRpZiAoIWVuYykgcmV0dXJuIG51bGw7XG5cdFx0aWYgKGVuYz09J2RlbHRhJyB8fCBlbmM9PSdwb3N0aW5nJykge1xuXHRcdFx0cmV0dXJuIHNhdmVQSW50O1xuXHRcdH0gZWxzZSBpZiAoZW5jPT1cInZhcmlhYmxlXCIpIHtcblx0XHRcdHJldHVybiBzYXZlVkludDtcblx0XHR9XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblx0dmFyIHNhdmU9ZnVuY3Rpb24oSixrZXksb3B0cykge1xuXHRcdG9wdHM9b3B0c3x8e307XG5cdFx0XG5cdFx0aWYgKHR5cGVvZiBKPT1cIm51bGxcIiB8fCB0eXBlb2YgSj09XCJ1bmRlZmluZWRcIikge1xuXHRcdFx0dGhyb3cgJ2Nhbm5vdCBzYXZlIG51bGwgdmFsdWUgb2YgWycra2V5KyddIGZvbGRlcnMnK0pTT04uc3RyaW5naWZ5KGZvbGRlcnMpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHR2YXIgdHlwZT1KLmNvbnN0cnVjdG9yLm5hbWU7XG5cdFx0aWYgKHR5cGU9PT0nT2JqZWN0Jykge1xuXHRcdFx0b3Blbk9iamVjdChrZXkpO1xuXHRcdFx0Zm9yICh2YXIgaSBpbiBKKSB7XG5cdFx0XHRcdHNhdmUoSltpXSxpLG9wdHMpO1xuXHRcdFx0XHRpZiAob3B0cy5hdXRvZGVsZXRlKSBkZWxldGUgSltpXTtcblx0XHRcdH1cblx0XHRcdGNsb3NlKCk7XG5cdFx0fSBlbHNlIGlmICh0eXBlPT09J0FycmF5Jykge1xuXHRcdFx0aWYgKGFsbG51bWJlcl9mYXN0KEopKSB7XG5cdFx0XHRcdGlmIChKLnNvcnRlZCkgeyAvL251bWJlciBhcnJheSBpcyBzb3J0ZWRcblx0XHRcdFx0XHRzYXZlSW50cyhKLGtleSxzYXZlUEludCk7XHQvL3Bvc3RpbmcgZGVsdGEgZm9ybWF0XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0c2F2ZUludHMoSixrZXksc2F2ZVZJbnQpO1x0XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSBpZiAoYWxsc3RyaW5nX2Zhc3QoSikpIHtcblx0XHRcdFx0c2F2ZVN0cmluZ0FycmF5KEosa2V5KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdG9wZW5BcnJheShrZXkpO1xuXHRcdFx0XHRmb3IgKHZhciBpPTA7aTxKLmxlbmd0aDtpKyspIHtcblx0XHRcdFx0XHRzYXZlKEpbaV0sbnVsbCxvcHRzKTtcblx0XHRcdFx0XHRpZiAob3B0cy5hdXRvZGVsZXRlKSBkZWxldGUgSltpXTtcblx0XHRcdFx0fVxuXHRcdFx0XHRjbG9zZSgpO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAodHlwZT09PSdTdHJpbmcnKSB7XG5cdFx0XHRzYXZlU3RyaW5nKEosa2V5KTtcblx0XHR9IGVsc2UgaWYgKHR5cGU9PT0nTnVtYmVyJykge1xuXHRcdFx0aWYgKEo+PTAmJko8MjU2KSBzYXZlVUk4KEosa2V5KTtcblx0XHRcdGVsc2Ugc2F2ZUkzMihKLGtleSk7XG5cdFx0fSBlbHNlIGlmICh0eXBlPT09J0Jvb2xlYW4nKSB7XG5cdFx0XHRzYXZlQm9vbChKLGtleSk7XG5cdFx0fSBlbHNlIGlmICh0eXBlPT09J0J1ZmZlcicpIHtcblx0XHRcdHNhdmVCbG9iKEosa2V5KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhyb3cgJ3Vuc3VwcG9ydGVkIHR5cGUgJyt0eXBlO1xuXHRcdH1cblx0fVxuXHRcblx0dmFyIGZyZWU9ZnVuY3Rpb24oKSB7XG5cdFx0d2hpbGUgKGZvbGRlcnMubGVuZ3RoKSBjbG9zZSgpO1xuXHRcdGtmcy5mcmVlKCk7XG5cdH1cblx0dmFyIGN1cnJlbnRzaXplPWZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiBjdXI7XG5cdH1cblxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoaGFuZGxlLCBcInNpemVcIiwge2dldCA6IGZ1bmN0aW9uKCl7IHJldHVybiBjdXI7IH19KTtcblxuXHR2YXIgd3JpdGVGaWxlPWZ1bmN0aW9uKGZuLG9wdHMsY2IpIHtcblx0XHRpZiAodHlwZW9mIGZzPT1cInVuZGVmaW5lZFwiKSB7XG5cdFx0XHR2YXIgZnM9b3B0cy5mc3x8cmVxdWlyZSgnZnMnKTtcdFxuXHRcdH1cblx0XHR2YXIgdG90YWxieXRlPWhhbmRsZS5jdXJyZW50c2l6ZSgpO1xuXHRcdHZhciB3cml0dGVuPTAsYmF0Y2g9MDtcblx0XHRcblx0XHRpZiAodHlwZW9mIGNiPT1cInVuZGVmaW5lZFwiIHx8IHR5cGVvZiBvcHRzPT1cImZ1bmN0aW9uXCIpIHtcblx0XHRcdGNiPW9wdHM7XG5cdFx0fVxuXHRcdG9wdHM9b3B0c3x8e307XG5cdFx0YmF0Y2hzaXplPW9wdHMuYmF0Y2hzaXplfHwxMDI0KjEwMjQqMTY7IC8vMTYgTUJcblxuXHRcdGlmIChmcy5leGlzdHNTeW5jKGZuKSkgZnMudW5saW5rU3luYyhmbik7XG5cblx0XHR2YXIgd3JpdGVDYj1mdW5jdGlvbih0b3RhbCx3cml0dGVuLGNiLG5leHQpIHtcblx0XHRcdHJldHVybiBmdW5jdGlvbihlcnIpIHtcblx0XHRcdFx0aWYgKGVycikgdGhyb3cgXCJ3cml0ZSBlcnJvclwiK2Vycjtcblx0XHRcdFx0Y2IodG90YWwsd3JpdHRlbik7XG5cdFx0XHRcdGJhdGNoKys7XG5cdFx0XHRcdG5leHQoKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHR2YXIgbmV4dD1mdW5jdGlvbigpIHtcblx0XHRcdGlmIChiYXRjaDxiYXRjaGVzKSB7XG5cdFx0XHRcdHZhciBidWZzdGFydD1iYXRjaHNpemUqYmF0Y2g7XG5cdFx0XHRcdHZhciBidWZlbmQ9YnVmc3RhcnQrYmF0Y2hzaXplO1xuXHRcdFx0XHRpZiAoYnVmZW5kPnRvdGFsYnl0ZSkgYnVmZW5kPXRvdGFsYnl0ZTtcblx0XHRcdFx0dmFyIHNsaWNlZD1rZnMuYnVmLnNsaWNlKGJ1ZnN0YXJ0LGJ1ZmVuZCk7XG5cdFx0XHRcdHdyaXR0ZW4rPXNsaWNlZC5sZW5ndGg7XG5cdFx0XHRcdGZzLmFwcGVuZEZpbGUoZm4sc2xpY2VkLHdyaXRlQ2IodG90YWxieXRlLHdyaXR0ZW4sIGNiLG5leHQpKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0dmFyIGJhdGNoZXM9MStNYXRoLmZsb29yKGhhbmRsZS5zaXplL2JhdGNoc2l6ZSk7XG5cdFx0bmV4dCgpO1xuXHR9XG5cdGhhbmRsZS5mcmVlPWZyZWU7XG5cdGhhbmRsZS5zYXZlSTMyPXNhdmVJMzI7XG5cdGhhbmRsZS5zYXZlVUk4PXNhdmVVSTg7XG5cdGhhbmRsZS5zYXZlQm9vbD1zYXZlQm9vbDtcblx0aGFuZGxlLnNhdmVTdHJpbmc9c2F2ZVN0cmluZztcblx0aGFuZGxlLnNhdmVWSW50PXNhdmVWSW50O1xuXHRoYW5kbGUuc2F2ZVBJbnQ9c2F2ZVBJbnQ7XG5cdGhhbmRsZS5zYXZlSW50cz1zYXZlSW50cztcblx0aGFuZGxlLnNhdmVCbG9iPXNhdmVCbG9iO1xuXHRoYW5kbGUuc2F2ZT1zYXZlO1xuXHRoYW5kbGUub3BlbkFycmF5PW9wZW5BcnJheTtcblx0aGFuZGxlLm9wZW5PYmplY3Q9b3Blbk9iamVjdDtcblx0aGFuZGxlLnN0cmluZ0VuY29kaW5nPXN0cmluZ0VuY29kaW5nO1xuXHQvL3RoaXMuaW50ZWdlckVuY29kaW5nPWludGVnZXJFbmNvZGluZztcblx0aGFuZGxlLmNsb3NlPWNsb3NlO1xuXHRoYW5kbGUud3JpdGVGaWxlPXdyaXRlRmlsZTtcblx0aGFuZGxlLmN1cnJlbnRzaXplPWN1cnJlbnRzaXplO1xuXHRyZXR1cm4gaGFuZGxlO1xufVxuXG5tb2R1bGUuZXhwb3J0cz1DcmVhdGU7IiwiLypcbiAgVE9ET1xuICBhbmQgbm90XG5cbiovXG5cbi8vIGh0dHA6Ly9qc2ZpZGRsZS5uZXQvbmVvc3dmL2FYeld3L1xudmFyIHBsaXN0PXJlcXVpcmUoJy4vcGxpc3QnKTtcbmZ1bmN0aW9uIGludGVyc2VjdChJLCBKKSB7XG4gIHZhciBpID0gaiA9IDA7XG4gIHZhciByZXN1bHQgPSBbXTtcblxuICB3aGlsZSggaSA8IEkubGVuZ3RoICYmIGogPCBKLmxlbmd0aCApe1xuICAgICBpZiAgICAgIChJW2ldIDwgSltqXSkgaSsrOyBcbiAgICAgZWxzZSBpZiAoSVtpXSA+IEpbal0pIGorKzsgXG4gICAgIGVsc2Uge1xuICAgICAgIHJlc3VsdFtyZXN1bHQubGVuZ3RoXT1sW2ldO1xuICAgICAgIGkrKztqKys7XG4gICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKiByZXR1cm4gYWxsIGl0ZW1zIGluIEkgYnV0IG5vdCBpbiBKICovXG5mdW5jdGlvbiBzdWJ0cmFjdChJLCBKKSB7XG4gIHZhciBpID0gaiA9IDA7XG4gIHZhciByZXN1bHQgPSBbXTtcblxuICB3aGlsZSggaSA8IEkubGVuZ3RoICYmIGogPCBKLmxlbmd0aCApe1xuICAgIGlmIChJW2ldPT1KW2pdKSB7XG4gICAgICBpKys7aisrO1xuICAgIH0gZWxzZSBpZiAoSVtpXTxKW2pdKSB7XG4gICAgICB3aGlsZSAoSVtpXTxKW2pdKSByZXN1bHRbcmVzdWx0Lmxlbmd0aF09IElbaSsrXTtcbiAgICB9IGVsc2Uge1xuICAgICAgd2hpbGUoSltqXTxJW2ldKSBqKys7XG4gICAgfVxuICB9XG5cbiAgaWYgKGo9PUoubGVuZ3RoKSB7XG4gICAgd2hpbGUgKGk8SS5sZW5ndGgpIHJlc3VsdFtyZXN1bHQubGVuZ3RoXT1JW2krK107XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufVxuXG52YXIgdW5pb249ZnVuY3Rpb24oYSxiKSB7XG5cdGlmICghYSB8fCAhYS5sZW5ndGgpIHJldHVybiBiO1xuXHRpZiAoIWIgfHwgIWIubGVuZ3RoKSByZXR1cm4gYTtcbiAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgdmFyIGFpID0gMDtcbiAgICB2YXIgYmkgPSAwO1xuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgIGlmICggYWkgPCBhLmxlbmd0aCAmJiBiaSA8IGIubGVuZ3RoKSB7XG4gICAgICAgICAgICBpZiAoYVthaV0gPCBiW2JpXSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdFtyZXN1bHQubGVuZ3RoXT1hW2FpXTtcbiAgICAgICAgICAgICAgICBhaSsrO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChhW2FpXSA+IGJbYmldKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0W3Jlc3VsdC5sZW5ndGhdPWJbYmldO1xuICAgICAgICAgICAgICAgIGJpKys7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlc3VsdFtyZXN1bHQubGVuZ3RoXT1hW2FpXTtcbiAgICAgICAgICAgICAgICByZXN1bHRbcmVzdWx0Lmxlbmd0aF09YltiaV07XG4gICAgICAgICAgICAgICAgYWkrKztcbiAgICAgICAgICAgICAgICBiaSsrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGFpIDwgYS5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoLmFwcGx5KHJlc3VsdCwgYS5zbGljZShhaSwgYS5sZW5ndGgpKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9IGVsc2UgaWYgKGJpIDwgYi5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoLmFwcGx5KHJlc3VsdCwgYi5zbGljZShiaSwgYi5sZW5ndGgpKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cbnZhciBPUEVSQVRJT049eydpbmNsdWRlJzppbnRlcnNlY3QsICd1bmlvbic6dW5pb24sICdleGNsdWRlJzpzdWJ0cmFjdH07XG5cbnZhciBib29sU2VhcmNoPWZ1bmN0aW9uKG9wdHMpIHtcbiAgb3B0cz1vcHRzfHx7fTtcbiAgb3BzPW9wdHMub3B8fHRoaXMub3B0cy5vcDtcbiAgdGhpcy5kb2NzPVtdO1xuXHRpZiAoIXRoaXMucGhyYXNlcy5sZW5ndGgpIHJldHVybjtcblx0dmFyIHI9dGhpcy5waHJhc2VzWzBdLmRvY3M7XG4gIC8qIGlnbm9yZSBvcGVyYXRvciBvZiBmaXJzdCBwaHJhc2UgKi9cblx0Zm9yICh2YXIgaT0xO2k8dGhpcy5waHJhc2VzLmxlbmd0aDtpKyspIHtcblx0XHR2YXIgb3A9IG9wc1tpXSB8fCAndW5pb24nO1xuXHRcdHI9T1BFUkFUSU9OW29wXShyLHRoaXMucGhyYXNlc1tpXS5kb2NzKTtcblx0fVxuXHR0aGlzLmRvY3M9cGxpc3QudW5pcXVlKHIpO1xuXHRyZXR1cm4gdGhpcztcbn1cbm1vZHVsZS5leHBvcnRzPXtzZWFyY2g6Ym9vbFNlYXJjaH0iLCJ2YXIgaW5kZXhPZlNvcnRlZCA9IGZ1bmN0aW9uIChhcnJheSwgb2JqLCBuZWFyKSB7IFxuICB2YXIgbG93ID0gMCxcbiAgaGlnaCA9IGFycmF5Lmxlbmd0aDtcbiAgd2hpbGUgKGxvdyA8IGhpZ2gpIHtcbiAgICB2YXIgbWlkID0gKGxvdyArIGhpZ2gpID4+IDE7XG4gICAgaWYgKGFycmF5W21pZF09PW9iaikgcmV0dXJuIG1pZDtcbiAgICBhcnJheVttaWRdIDwgb2JqID8gbG93ID0gbWlkICsgMSA6IGhpZ2ggPSBtaWQ7XG4gIH1cbiAgaWYgKG5lYXIpIHJldHVybiBsb3c7XG4gIGVsc2UgaWYgKGFycmF5W2xvd109PW9iaikgcmV0dXJuIGxvdztlbHNlIHJldHVybiAtMTtcbn07XG52YXIgaW5kZXhPZlNvcnRlZF9zdHIgPSBmdW5jdGlvbiAoYXJyYXksIG9iaiwgbmVhcikgeyBcbiAgdmFyIGxvdyA9IDAsXG4gIGhpZ2ggPSBhcnJheS5sZW5ndGg7XG4gIHdoaWxlIChsb3cgPCBoaWdoKSB7XG4gICAgdmFyIG1pZCA9IChsb3cgKyBoaWdoKSA+PiAxO1xuICAgIGlmIChhcnJheVttaWRdPT1vYmopIHJldHVybiBtaWQ7XG4gICAgKGFycmF5W21pZF0ubG9jYWxlQ29tcGFyZShvYmopPDApID8gbG93ID0gbWlkICsgMSA6IGhpZ2ggPSBtaWQ7XG4gIH1cbiAgaWYgKG5lYXIpIHJldHVybiBsb3c7XG4gIGVsc2UgaWYgKGFycmF5W2xvd109PW9iaikgcmV0dXJuIGxvdztlbHNlIHJldHVybiAtMTtcbn07XG5cblxudmFyIGJzZWFyY2g9ZnVuY3Rpb24oYXJyYXksdmFsdWUsbmVhcikge1xuXHR2YXIgZnVuYz1pbmRleE9mU29ydGVkO1xuXHRpZiAodHlwZW9mIGFycmF5WzBdPT1cInN0cmluZ1wiKSBmdW5jPWluZGV4T2ZTb3J0ZWRfc3RyO1xuXHRyZXR1cm4gZnVuYyhhcnJheSx2YWx1ZSxuZWFyKTtcbn1cbnZhciBic2VhcmNoTmVhcj1mdW5jdGlvbihhcnJheSx2YWx1ZSkge1xuXHRyZXR1cm4gYnNlYXJjaChhcnJheSx2YWx1ZSx0cnVlKTtcbn1cblxubW9kdWxlLmV4cG9ydHM9YnNlYXJjaDsvL3tic2VhcmNoTmVhcjpic2VhcmNoTmVhcixic2VhcmNoOmJzZWFyY2h9OyIsInZhciBwbGlzdD1yZXF1aXJlKFwiLi9wbGlzdFwiKTtcblxudmFyIGdldFBocmFzZVdpZHRocz1mdW5jdGlvbiAoUSxwaHJhc2VpZCx2cG9zcykge1xuXHR2YXIgcmVzPVtdO1xuXHRmb3IgKHZhciBpIGluIHZwb3NzKSB7XG5cdFx0cmVzLnB1c2goZ2V0UGhyYXNlV2lkdGgoUSxwaHJhc2VpZCx2cG9zc1tpXSkpO1xuXHR9XG5cdHJldHVybiByZXM7XG59XG52YXIgZ2V0UGhyYXNlV2lkdGg9ZnVuY3Rpb24gKFEscGhyYXNlaWQsdnBvcykge1xuXHR2YXIgUD1RLnBocmFzZXNbcGhyYXNlaWRdO1xuXHR2YXIgd2lkdGg9MCx2YXJ3aWR0aD1mYWxzZTtcblx0aWYgKFAud2lkdGgpIHJldHVybiBQLndpZHRoOyAvLyBubyB3aWxkY2FyZFxuXHRpZiAoUC50ZXJtaWQubGVuZ3RoPDIpIHJldHVybiBQLnRlcm1sZW5ndGhbMF07XG5cdHZhciBsYXN0dGVybXBvc3Rpbmc9US50ZXJtc1tQLnRlcm1pZFtQLnRlcm1pZC5sZW5ndGgtMV1dLnBvc3Rpbmc7XG5cblx0Zm9yICh2YXIgaSBpbiBQLnRlcm1pZCkge1xuXHRcdHZhciBUPVEudGVybXNbUC50ZXJtaWRbaV1dO1xuXHRcdGlmIChULm9wPT0nd2lsZGNhcmQnKSB7XG5cdFx0XHR3aWR0aCs9VC53aWR0aDtcblx0XHRcdGlmIChULndpbGRjYXJkPT0nKicpIHZhcndpZHRoPXRydWU7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHdpZHRoKz1QLnRlcm1sZW5ndGhbaV07XG5cdFx0fVxuXHR9XG5cdGlmICh2YXJ3aWR0aCkgeyAvL3dpZHRoIG1pZ2h0IGJlIHNtYWxsZXIgZHVlIHRvICogd2lsZGNhcmRcblx0XHR2YXIgYXQ9cGxpc3QuaW5kZXhPZlNvcnRlZChsYXN0dGVybXBvc3RpbmcsdnBvcyk7XG5cdFx0dmFyIGVuZHBvcz1sYXN0dGVybXBvc3RpbmdbYXRdO1xuXHRcdGlmIChlbmRwb3MtdnBvczx3aWR0aCkgd2lkdGg9ZW5kcG9zLXZwb3MrMTtcblx0fVxuXG5cdHJldHVybiB3aWR0aDtcbn1cbi8qIHJldHVybiBbdnBvcywgcGhyYXNlaWQsIHBocmFzZXdpZHRoLCBvcHRpb25hbF90YWduYW1lXSBieSBzbG90IHJhbmdlKi9cbnZhciBoaXRJblJhbmdlPWZ1bmN0aW9uKFEsc3RhcnR2cG9zLGVuZHZwb3MpIHtcblx0dmFyIHJlcz1bXTtcblx0aWYgKCFRIHx8ICFRLnJhd3Jlc3VsdCB8fCAhUS5yYXdyZXN1bHQubGVuZ3RoKSByZXR1cm4gcmVzO1xuXHRmb3IgKHZhciBpPTA7aTxRLnBocmFzZXMubGVuZ3RoO2krKykge1xuXHRcdHZhciBQPVEucGhyYXNlc1tpXTtcblx0XHRpZiAoIVAucG9zdGluZykgY29udGludWU7XG5cdFx0dmFyIHM9cGxpc3QuaW5kZXhPZlNvcnRlZChQLnBvc3Rpbmcsc3RhcnR2cG9zKTtcblx0XHR2YXIgZT1wbGlzdC5pbmRleE9mU29ydGVkKFAucG9zdGluZyxlbmR2cG9zKTtcblx0XHR2YXIgcj1QLnBvc3Rpbmcuc2xpY2UocyxlKzEpO1xuXHRcdHZhciB3aWR0aD1nZXRQaHJhc2VXaWR0aHMoUSxpLHIpO1xuXG5cdFx0cmVzPXJlcy5jb25jYXQoci5tYXAoZnVuY3Rpb24odnBvcyxpZHgpeyByZXR1cm4gW3Zwb3Msd2lkdGhbaWR4XSxpXSB9KSk7XG5cdH1cblx0Ly8gb3JkZXIgYnkgdnBvcywgaWYgdnBvcyBpcyB0aGUgc2FtZSwgbGFyZ2VyIHdpZHRoIGNvbWUgZmlyc3QuXG5cdC8vIHNvIHRoZSBvdXRwdXQgd2lsbCBiZVxuXHQvLyA8dGFnMT48dGFnMj5vbmU8L3RhZzI+dHdvPC90YWcxPlxuXHQvL1RPRE8sIG1pZ2h0IGNhdXNlIG92ZXJsYXAgaWYgc2FtZSB2cG9zIGFuZCBzYW1lIHdpZHRoXG5cdC8vbmVlZCB0byBjaGVjayB0YWcgbmFtZVxuXHRyZXMuc29ydChmdW5jdGlvbihhLGIpe3JldHVybiBhWzBdPT1iWzBdPyBiWzFdLWFbMV0gOmFbMF0tYlswXX0pO1xuXG5cdHJldHVybiByZXM7XG59XG5cbnZhciB0YWdzSW5SYW5nZT1mdW5jdGlvbihRLHJlbmRlclRhZ3Msc3RhcnR2cG9zLGVuZHZwb3MpIHtcblx0dmFyIHJlcz1bXTtcblx0aWYgKHR5cGVvZiByZW5kZXJUYWdzPT1cInN0cmluZ1wiKSByZW5kZXJUYWdzPVtyZW5kZXJUYWdzXTtcblxuXHRyZW5kZXJUYWdzLm1hcChmdW5jdGlvbih0YWcpe1xuXHRcdHZhciBzdGFydHM9US5lbmdpbmUuZ2V0KFtcImZpZWxkc1wiLHRhZytcIl9zdGFydFwiXSk7XG5cdFx0dmFyIGVuZHM9US5lbmdpbmUuZ2V0KFtcImZpZWxkc1wiLHRhZytcIl9lbmRcIl0pO1xuXHRcdGlmICghc3RhcnRzKSByZXR1cm47XG5cblx0XHR2YXIgcz1wbGlzdC5pbmRleE9mU29ydGVkKHN0YXJ0cyxzdGFydHZwb3MpO1xuXHRcdHZhciBlPXM7XG5cdFx0d2hpbGUgKGU8c3RhcnRzLmxlbmd0aCAmJiBzdGFydHNbZV08ZW5kdnBvcykgZSsrO1xuXHRcdHZhciBvcGVudGFncz1zdGFydHMuc2xpY2UocyxlKTtcblxuXHRcdHM9cGxpc3QuaW5kZXhPZlNvcnRlZChlbmRzLHN0YXJ0dnBvcyk7XG5cdFx0ZT1zO1xuXHRcdHdoaWxlIChlPGVuZHMubGVuZ3RoICYmIGVuZHNbZV08ZW5kdnBvcykgZSsrO1xuXHRcdHZhciBjbG9zZXRhZ3M9ZW5kcy5zbGljZShzLGUpO1xuXG5cdFx0b3BlbnRhZ3MubWFwKGZ1bmN0aW9uKHN0YXJ0LGlkeCkge1xuXHRcdFx0cmVzLnB1c2goW3N0YXJ0LGNsb3NldGFnc1tpZHhdLXN0YXJ0LHRhZ10pO1xuXHRcdH0pXG5cdH0pO1xuXHQvLyBvcmRlciBieSB2cG9zLCBpZiB2cG9zIGlzIHRoZSBzYW1lLCBsYXJnZXIgd2lkdGggY29tZSBmaXJzdC5cblx0cmVzLnNvcnQoZnVuY3Rpb24oYSxiKXtyZXR1cm4gYVswXT09YlswXT8gYlsxXS1hWzFdIDphWzBdLWJbMF19KTtcblxuXHRyZXR1cm4gcmVzO1xufVxuXG4vKlxuZ2l2ZW4gYSB2cG9zIHJhbmdlIHN0YXJ0LCBmaWxlLCBjb252ZXJ0IHRvIGZpbGVzdGFydCwgZmlsZWVuZFxuICAgZmlsZXN0YXJ0IDogc3RhcnRpbmcgZmlsZVxuICAgc3RhcnQgICA6IHZwb3Mgc3RhcnRcbiAgIHNob3dmaWxlOiBob3cgbWFueSBmaWxlcyB0byBkaXNwbGF5XG4gICBzaG93cGFnZTogaG93IG1hbnkgcGFnZXMgdG8gZGlzcGxheVxuXG5vdXRwdXQ6XG4gICBhcnJheSBvZiBmaWxlaWQgd2l0aCBoaXRzXG4qL1xudmFyIGdldEZpbGVXaXRoSGl0cz1mdW5jdGlvbihlbmdpbmUsUSxyYW5nZSkge1xuXHR2YXIgZmlsZU9mZnNldHM9ZW5naW5lLmdldChcImZpbGVvZmZzZXRzXCIpO1xuXHR2YXIgb3V0PVtdLGZpbGVjb3VudD0xMDA7XG5cdHZhciBzdGFydD0wICwgZW5kPVEuYnlGaWxlLmxlbmd0aDtcblx0US5leGNlcnB0T3ZlcmZsb3c9ZmFsc2U7XG5cdGlmIChyYW5nZS5zdGFydCkge1xuXHRcdHZhciBmaXJzdD1yYW5nZS5zdGFydCA7XG5cdFx0dmFyIGxhc3Q9cmFuZ2UuZW5kO1xuXHRcdGlmICghbGFzdCkgbGFzdD1OdW1iZXIuTUFYX1NBRkVfSU5URUdFUjtcblx0XHRmb3IgKHZhciBpPTA7aTxmaWxlT2Zmc2V0cy5sZW5ndGg7aSsrKSB7XG5cdFx0XHQvL2lmIChmaWxlT2Zmc2V0c1tpXT5maXJzdCkgYnJlYWs7XG5cdFx0XHRpZiAoZmlsZU9mZnNldHNbaV0+bGFzdCkge1xuXHRcdFx0XHRlbmQ9aTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0XHRpZiAoZmlsZU9mZnNldHNbaV08Zmlyc3QpIHN0YXJ0PWk7XG5cdFx0fVx0XHRcblx0fSBlbHNlIHtcblx0XHRzdGFydD1yYW5nZS5maWxlc3RhcnQgfHwgMDtcblx0XHRpZiAocmFuZ2UubWF4ZmlsZSkge1xuXHRcdFx0ZmlsZWNvdW50PXJhbmdlLm1heGZpbGU7XG5cdFx0fSBlbHNlIGlmIChyYW5nZS5zaG93c2VnKSB7XG5cdFx0XHR0aHJvdyBcIm5vdCBpbXBsZW1lbnQgeWV0XCJcblx0XHR9XG5cdH1cblxuXHR2YXIgZmlsZVdpdGhIaXRzPVtdLHRvdGFsaGl0PTA7XG5cdHJhbmdlLm1heGhpdD1yYW5nZS5tYXhoaXR8fDEwMDA7XG5cblx0Zm9yICh2YXIgaT1zdGFydDtpPGVuZDtpKyspIHtcblx0XHRpZihRLmJ5RmlsZVtpXS5sZW5ndGg+MCkge1xuXHRcdFx0dG90YWxoaXQrPVEuYnlGaWxlW2ldLmxlbmd0aDtcblx0XHRcdGZpbGVXaXRoSGl0cy5wdXNoKGkpO1xuXHRcdFx0cmFuZ2UubmV4dEZpbGVTdGFydD1pO1xuXHRcdFx0aWYgKGZpbGVXaXRoSGl0cy5sZW5ndGg+PWZpbGVjb3VudCkge1xuXHRcdFx0XHRRLmV4Y2VycHRPdmVyZmxvdz10cnVlO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHRcdGlmICh0b3RhbGhpdD5yYW5nZS5tYXhoaXQpIHtcblx0XHRcdFx0US5leGNlcnB0T3ZlcmZsb3c9dHJ1ZTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdGlmIChpPj1lbmQpIHsgLy9ubyBtb3JlIGZpbGVcblx0XHRRLmV4Y2VycHRTdG9wPXRydWU7XG5cdH1cblx0cmV0dXJuIGZpbGVXaXRoSGl0cztcbn1cbnZhciByZXN1bHRsaXN0PWZ1bmN0aW9uKGVuZ2luZSxRLG9wdHMsY2IpIHtcblx0dmFyIG91dHB1dD1bXTtcblx0aWYgKCFRLnJhd3Jlc3VsdCB8fCAhUS5yYXdyZXN1bHQubGVuZ3RoKSB7XG5cdFx0Y2Iob3V0cHV0KTtcblx0XHRyZXR1cm47XG5cdH1cblxuXHRpZiAob3B0cy5yYW5nZSkge1xuXHRcdGlmIChvcHRzLnJhbmdlLm1heGhpdCAmJiAhb3B0cy5yYW5nZS5tYXhmaWxlKSB7XG5cdFx0XHRvcHRzLnJhbmdlLm1heGZpbGU9b3B0cy5yYW5nZS5tYXhoaXQ7XG5cdFx0XHRvcHRzLnJhbmdlLm1heHNlZz1vcHRzLnJhbmdlLm1heGhpdDtcblx0XHR9XG5cdFx0aWYgKCFvcHRzLnJhbmdlLm1heHNlZykgb3B0cy5yYW5nZS5tYXhzZWc9MTAwO1xuXHRcdGlmICghb3B0cy5yYW5nZS5lbmQpIHtcblx0XHRcdG9wdHMucmFuZ2UuZW5kPU51bWJlci5NQVhfU0FGRV9JTlRFR0VSO1xuXHRcdH1cblx0fVxuXHR2YXIgZmlsZVdpdGhIaXRzPWdldEZpbGVXaXRoSGl0cyhlbmdpbmUsUSxvcHRzLnJhbmdlKTtcblx0aWYgKCFmaWxlV2l0aEhpdHMubGVuZ3RoKSB7XG5cdFx0Y2Iob3V0cHV0KTtcblx0XHRyZXR1cm47XG5cdH1cblxuXHR2YXIgb3V0cHV0PVtdLGZpbGVzPVtdOy8vdGVtcG9yYXJ5IGhvbGRlciBmb3Igc2VnbmFtZXNcblx0Zm9yICh2YXIgaT0wO2k8ZmlsZVdpdGhIaXRzLmxlbmd0aDtpKyspIHtcblx0XHR2YXIgbmZpbGU9ZmlsZVdpdGhIaXRzW2ldO1xuXHRcdHZhciBzZWdvZmZzZXRzPWVuZ2luZS5nZXRGaWxlU2VnT2Zmc2V0cyhuZmlsZSk7XG5cdFx0dmFyIHNlZ25hbWVzPWVuZ2luZS5nZXRGaWxlU2VnTmFtZXMobmZpbGUpO1xuXHRcdGZpbGVzW25maWxlXT17c2Vnb2Zmc2V0czpzZWdvZmZzZXRzfTtcblx0XHR2YXIgc2Vnd2l0aGhpdD1wbGlzdC5ncm91cGJ5cG9zdGluZzIoUS5ieUZpbGVbIG5maWxlIF0sICBzZWdvZmZzZXRzKTtcblx0XHQvL2lmIChzZWdvZmZzZXRzWzBdPT0xKVxuXHRcdC8vc2Vnd2l0aGhpdC5zaGlmdCgpOyAvL3RoZSBmaXJzdCBpdGVtIGlzIG5vdCB1c2VkICgwflEuYnlGaWxlWzBdIClcblxuXHRcdGZvciAodmFyIGo9MDsgajxzZWd3aXRoaGl0Lmxlbmd0aDtqKyspIHtcblx0XHRcdGlmICghc2Vnd2l0aGhpdFtqXS5sZW5ndGgpIGNvbnRpbnVlO1xuXHRcdFx0Ly92YXIgb2Zmc2V0cz1zZWd3aXRoaGl0W2pdLm1hcChmdW5jdGlvbihwKXtyZXR1cm4gcC0gZmlsZU9mZnNldHNbaV19KTtcblx0XHRcdGlmIChzZWdvZmZzZXRzW2pdPm9wdHMucmFuZ2UuZW5kKSBicmVhaztcblx0XHRcdG91dHB1dC5wdXNoKCAge2ZpbGU6IG5maWxlLCBzZWc6aiwgIHNlZ25hbWU6c2VnbmFtZXNbal19KTtcblx0XHRcdGlmIChvdXRwdXQubGVuZ3RoPm9wdHMucmFuZ2UubWF4c2VnKSBicmVhaztcblx0XHR9XG5cdH1cblxuXHR2YXIgc2VncGF0aHM9b3V0cHV0Lm1hcChmdW5jdGlvbihwKXtcblx0XHRyZXR1cm4gW1wiZmlsZWNvbnRlbnRzXCIscC5maWxlLHAuc2VnXTtcblx0fSk7XG5cdC8vcHJlcGFyZSB0aGUgdGV4dFxuXHRlbmdpbmUuZ2V0KHNlZ3BhdGhzLGZ1bmN0aW9uKHNlZ3Mpe1xuXHRcdHZhciBzZXE9MDtcblx0XHRpZiAoc2VncykgZm9yICh2YXIgaT0wO2k8c2Vncy5sZW5ndGg7aSsrKSB7XG5cdFx0XHR2YXIgc3RhcnR2cG9zPWZpbGVzW291dHB1dFtpXS5maWxlXS5zZWdvZmZzZXRzW291dHB1dFtpXS5zZWctMV0gfHwwO1xuXHRcdFx0dmFyIGVuZHZwb3M9ZmlsZXNbb3V0cHV0W2ldLmZpbGVdLnNlZ29mZnNldHNbb3V0cHV0W2ldLnNlZ107XG5cdFx0XHR2YXIgaGw9e307XG5cblx0XHRcdGlmIChvcHRzLnJhbmdlICYmIG9wdHMucmFuZ2Uuc3RhcnQgICkge1xuXHRcdFx0XHRpZiAoIHN0YXJ0dnBvczxvcHRzLnJhbmdlLnN0YXJ0KSBzdGFydHZwb3M9b3B0cy5yYW5nZS5zdGFydDtcblx0XHRcdC8vXHRpZiAoZW5kdnBvcz5vcHRzLnJhbmdlLmVuZCkgZW5kdnBvcz1vcHRzLnJhbmdlLmVuZDtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0aWYgKG9wdHMubm9oaWdobGlnaHQpIHtcblx0XHRcdFx0aGwudGV4dD1zZWdzW2ldO1xuXHRcdFx0XHRobC5oaXRzPWhpdEluUmFuZ2UoUSxzdGFydHZwb3MsZW5kdnBvcyk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR2YXIgbz17bm9jcmxmOnRydWUsbm9zcGFuOnRydWUsXG5cdFx0XHRcdFx0dGV4dDpzZWdzW2ldLHN0YXJ0dnBvczpzdGFydHZwb3MsIGVuZHZwb3M6IGVuZHZwb3MsIFxuXHRcdFx0XHRcdFE6USxmdWxsdGV4dDpvcHRzLmZ1bGx0ZXh0fTtcblx0XHRcdFx0aGw9aGlnaGxpZ2h0KFEsbyk7XG5cdFx0XHR9XG5cdFx0XHRpZiAoaGwudGV4dCkge1xuXHRcdFx0XHRvdXRwdXRbaV0udGV4dD1obC50ZXh0O1xuXHRcdFx0XHRvdXRwdXRbaV0uaGl0cz1obC5oaXRzO1xuXHRcdFx0XHRvdXRwdXRbaV0uc2VxPXNlcTtcblx0XHRcdFx0c2VxKz1obC5oaXRzLmxlbmd0aDtcblxuXHRcdFx0XHRvdXRwdXRbaV0uc3RhcnQ9c3RhcnR2cG9zO1x0XHRcdFx0XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRvdXRwdXRbaV09bnVsbDsgLy9yZW1vdmUgaXRlbSB2cG9zIGxlc3MgdGhhbiBvcHRzLnJhbmdlLnN0YXJ0XG5cdFx0XHR9XG5cdFx0fSBcblx0XHRvdXRwdXQ9b3V0cHV0LmZpbHRlcihmdW5jdGlvbihvKXtyZXR1cm4gbyE9bnVsbH0pO1xuXHRcdGNiKG91dHB1dCk7XG5cdH0pO1xufVxudmFyIGluamVjdFRhZz1mdW5jdGlvbihRLG9wdHMpe1xuXHR2YXIgaGl0cz1vcHRzLmhpdHM7XG5cdHZhciB0YWdzPW9wdHMudGFncztcblx0aWYgKCF0YWdzKSB0YWdzPVtdO1xuXHR2YXIgaGl0Y2xhc3M9b3B0cy5oaXRjbGFzc3x8J2hsJztcblx0dmFyIG91dHB1dD0nJyxPPVtdLGo9MCxrPTA7XG5cdHZhciBzdXJyb3VuZD1vcHRzLnN1cnJvdW5kfHw1O1xuXG5cdHZhciB0b2tlbnM9US50b2tlbml6ZShvcHRzLnRleHQpLnRva2Vucztcblx0dmFyIHZwb3M9b3B0cy52cG9zO1xuXHR2YXIgaT0wLHByZXZpbnJhbmdlPSEhb3B0cy5mdWxsdGV4dCAsaW5yYW5nZT0hIW9wdHMuZnVsbHRleHQ7XG5cdHZhciBoaXRzdGFydD0wLGhpdGVuZD0wLHRhZ3N0YXJ0PTAsdGFnZW5kPTAsdGFnY2xhc3M9XCJcIjtcblx0d2hpbGUgKGk8dG9rZW5zLmxlbmd0aCkge1xuXHRcdHZhciBza2lwPVEuaXNTa2lwKHRva2Vuc1tpXSk7XG5cdFx0dmFyIGhhc2hpdD1mYWxzZTtcblx0XHRpbnJhbmdlPW9wdHMuZnVsbHRleHQgfHwgKGo8aGl0cy5sZW5ndGggJiYgdnBvcytzdXJyb3VuZD49aGl0c1tqXVswXSB8fFxuXHRcdFx0XHQoaj4wICYmIGo8PWhpdHMubGVuZ3RoICYmICBoaXRzW2otMV1bMF0rc3Vycm91bmQqMj49dnBvcykpO1x0XG5cblx0XHRpZiAocHJldmlucmFuZ2UhPWlucmFuZ2UpIHtcblx0XHRcdG91dHB1dCs9b3B0cy5hYnJpZGdlfHxcIi4uLlwiO1xuXHRcdH1cblx0XHRwcmV2aW5yYW5nZT1pbnJhbmdlO1xuXHRcdHZhciB0b2tlbj10b2tlbnNbaV07XG5cdFx0aWYgKG9wdHMubm9jcmxmICYmIHRva2VuPT1cIlxcblwiKSB0b2tlbj1cIlwiO1xuXG5cdFx0aWYgKGlucmFuZ2UgJiYgaTx0b2tlbnMubGVuZ3RoKSB7XG5cdFx0XHRpZiAoc2tpcCkge1xuXHRcdFx0XHRvdXRwdXQrPXRva2VuO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dmFyIGNsYXNzZXM9XCJcIjtcdFxuXG5cdFx0XHRcdC8vY2hlY2sgaGl0XG5cdFx0XHRcdGlmIChqPGhpdHMubGVuZ3RoICYmIHZwb3M9PWhpdHNbal1bMF0pIHtcblx0XHRcdFx0XHR2YXIgbnBocmFzZT1oaXRzW2pdWzJdICUgMTAsIHdpZHRoPWhpdHNbal1bMV07XG5cdFx0XHRcdFx0aGl0c3RhcnQ9aGl0c1tqXVswXTtcblx0XHRcdFx0XHRoaXRlbmQ9aGl0c3RhcnQrd2lkdGg7XG5cdFx0XHRcdFx0aisrO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly9jaGVjayB0YWdcblx0XHRcdFx0aWYgKGs8dGFncy5sZW5ndGggJiYgdnBvcz09dGFnc1trXVswXSkge1xuXHRcdFx0XHRcdHZhciB3aWR0aD10YWdzW2tdWzFdO1xuXHRcdFx0XHRcdHRhZ3N0YXJ0PXRhZ3Nba11bMF07XG5cdFx0XHRcdFx0dGFnZW5kPXRhZ3N0YXJ0K3dpZHRoO1xuXHRcdFx0XHRcdHRhZ2NsYXNzPXRhZ3Nba11bMl07XG5cdFx0XHRcdFx0aysrO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKHZwb3M+PWhpdHN0YXJ0ICYmIHZwb3M8aGl0ZW5kKSBjbGFzc2VzPWhpdGNsYXNzK1wiIFwiK2hpdGNsYXNzK25waHJhc2U7XG5cdFx0XHRcdGlmICh2cG9zPj10YWdzdGFydCAmJiB2cG9zPHRhZ2VuZCkgY2xhc3Nlcys9XCIgXCIrdGFnY2xhc3M7XG5cblx0XHRcdFx0aWYgKGNsYXNzZXMgfHwgIW9wdHMubm9zcGFuKSB7XG5cdFx0XHRcdFx0b3V0cHV0Kz0nPHNwYW4gdnBvcz1cIicrdnBvcysnXCInO1xuXHRcdFx0XHRcdGlmIChjbGFzc2VzKSBjbGFzc2VzPScgY2xhc3M9XCInK2NsYXNzZXMrJ1wiJztcblx0XHRcdFx0XHRvdXRwdXQrPWNsYXNzZXMrJz4nO1xuXHRcdFx0XHRcdG91dHB1dCs9dG9rZW4rJzwvc3Bhbj4nO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdG91dHB1dCs9dG9rZW47XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKCFza2lwKSB2cG9zKys7XG5cdFx0aSsrOyBcblx0fVxuXG5cdE8ucHVzaChvdXRwdXQpO1xuXHRvdXRwdXQ9XCJcIjtcblxuXHRyZXR1cm4gTy5qb2luKFwiXCIpO1xufVxudmFyIGhpZ2hsaWdodD1mdW5jdGlvbihRLG9wdHMpIHtcblx0aWYgKCFvcHRzLnRleHQpIHJldHVybiB7dGV4dDpcIlwiLGhpdHM6W119O1xuXHR2YXIgb3B0PXt0ZXh0Om9wdHMudGV4dCxcblx0XHRoaXRzOm51bGwsYWJyaWRnZTpvcHRzLmFicmlkZ2UsdnBvczpvcHRzLnN0YXJ0dnBvcyxcblx0XHRmdWxsdGV4dDpvcHRzLmZ1bGx0ZXh0LHJlbmRlclRhZ3M6b3B0cy5yZW5kZXJUYWdzLG5vc3BhbjpvcHRzLm5vc3Bhbixub2NybGY6b3B0cy5ub2NybGYsXG5cdH07XG5cblx0b3B0LmhpdHM9aGl0SW5SYW5nZShvcHRzLlEsb3B0cy5zdGFydHZwb3Msb3B0cy5lbmR2cG9zKTtcblx0cmV0dXJuIHt0ZXh0OmluamVjdFRhZyhRLG9wdCksaGl0czpvcHQuaGl0c307XG59XG5cbnZhciBnZXRTZWc9ZnVuY3Rpb24oZW5naW5lLGZpbGVpZCxzZWdpZCxvcHRzLGNiLGNvbnRleHQpIHtcblx0aWYgKHR5cGVvZiBvcHRzPT1cImZ1bmN0aW9uXCIpIHtcblx0XHRjb250ZXh0PWNiO1xuXHRcdGNiPW9wdHM7XG5cdFx0b3B0cz17fTtcblx0fVxuXG5cdHZhciBmaWxlT2Zmc2V0cz1lbmdpbmUuZ2V0KFwiZmlsZW9mZnNldHNcIik7XG5cdHZhciBzZWdwYXRocz1bXCJmaWxlY29udGVudHNcIixmaWxlaWQsc2VnaWRdO1xuXHR2YXIgc2VnbmFtZXM9ZW5naW5lLmdldEZpbGVTZWdOYW1lcyhmaWxlaWQpO1xuXG5cdGVuZ2luZS5nZXQoc2VncGF0aHMsZnVuY3Rpb24odGV4dCl7XG5cdFx0Ly9pZiAob3B0cy5zcGFuKSB0ZXh0PWFkZHNwYW4uYXBwbHkoZW5naW5lLFt0ZXh0XSk7XG5cdFx0Y2IuYXBwbHkoY29udGV4dHx8ZW5naW5lLmNvbnRleHQsW3t0ZXh0OnRleHQsZmlsZTpmaWxlaWQsc2VnOnNlZ2lkLHNlZ25hbWU6c2VnbmFtZXNbc2VnaWRdfV0pO1xuXHR9KTtcbn1cblxudmFyIGdldFNlZ1N5bmM9ZnVuY3Rpb24oZW5naW5lLGZpbGVpZCxzZWdpZCkge1xuXHR2YXIgZmlsZU9mZnNldHM9ZW5naW5lLmdldChcImZpbGVvZmZzZXRzXCIpO1xuXHR2YXIgc2VncGF0aHM9W1wiZmlsZWNvbnRlbnRzXCIsZmlsZWlkLHNlZ2lkXTtcblx0dmFyIHNlZ25hbWVzPWVuZ2luZS5nZXRGaWxlU2VnTmFtZXMoZmlsZWlkKTtcblxuXHR2YXIgdGV4dD1lbmdpbmUuZ2V0KHNlZ3BhdGhzKTtcblx0cmV0dXJuIHt0ZXh0OnRleHQsZmlsZTpmaWxlaWQsc2VnOnNlZ2lkLHNlZ25hbWU6c2VnbmFtZXNbc2VnaWRdfTtcbn1cblxudmFyIGdldFJhbmdlPWZ1bmN0aW9uKGVuZ2luZSxzdGFydCxlbmQsY2IpIHtcblx0dmFyIGZpbGVvZmZzZXRzPWVuZ2luZS5nZXQoXCJmaWxlb2Zmc2V0c1wiKTtcblx0Ly92YXIgcGFnZXBhdGhzPVtcImZpbGVDb250ZW50c1wiLF07XG5cdC8vZmluZCBmaXJzdCBwYWdlIGFuZCBsYXN0IHBhZ2Vcblx0Ly9jcmVhdGUgZ2V0IHBhdGhzXG5cbn1cblxudmFyIGdldEZpbGU9ZnVuY3Rpb24oZW5naW5lLGZpbGVpZCxjYikge1xuXHR2YXIgZmlsZW5hbWU9ZW5naW5lLmdldChcImZpbGVuYW1lc1wiKVtmaWxlaWRdO1xuXHR2YXIgc2VnbmFtZXM9ZW5naW5lLmdldEZpbGVTZWdOYW1lcyhmaWxlaWQpO1xuXHR2YXIgZmlsZXN0YXJ0PWVuZ2luZS5nZXQoXCJmaWxlb2Zmc2V0c1wiKVtmaWxlaWRdO1xuXHR2YXIgb2Zmc2V0cz1lbmdpbmUuZ2V0RmlsZVNlZ09mZnNldHMoZmlsZWlkKTtcblx0dmFyIHBjPTA7XG5cdGVuZ2luZS5nZXQoW1wiZmlsZUNvbnRlbnRzXCIsZmlsZWlkXSx0cnVlLGZ1bmN0aW9uKGRhdGEpe1xuXHRcdHZhciB0ZXh0PWRhdGEubWFwKGZ1bmN0aW9uKHQsaWR4KSB7XG5cdFx0XHRpZiAoaWR4PT0wKSByZXR1cm4gXCJcIjsgXG5cdFx0XHR2YXIgcGI9JzxwYiBuPVwiJytzZWduYW1lc1tpZHhdKydcIj48L3BiPic7XG5cdFx0XHRyZXR1cm4gcGIrdDtcblx0XHR9KTtcblx0XHRjYih7dGV4dHM6ZGF0YSx0ZXh0OnRleHQuam9pbihcIlwiKSxzZWduYW1lczpzZWduYW1lcyxmaWxlc3RhcnQ6ZmlsZXN0YXJ0LG9mZnNldHM6b2Zmc2V0cyxmaWxlOmZpbGVpZCxmaWxlbmFtZTpmaWxlbmFtZX0pOyAvL2ZvcmNlIGRpZmZlcmVudCB0b2tlblxuXHR9KTtcbn1cblxudmFyIGhpZ2hsaWdodFJhbmdlPWZ1bmN0aW9uKFEsc3RhcnR2cG9zLGVuZHZwb3Msb3B0cyxjYil7XG5cdC8vbm90IGltcGxlbWVudCB5ZXRcbn1cblxudmFyIGhpZ2hsaWdodEZpbGU9ZnVuY3Rpb24oUSxmaWxlaWQsb3B0cyxjYikge1xuXHRpZiAodHlwZW9mIG9wdHM9PVwiZnVuY3Rpb25cIikge1xuXHRcdGNiPW9wdHM7XG5cdH1cblxuXHRpZiAoIVEgfHwgIVEuZW5naW5lKSByZXR1cm4gY2IobnVsbCk7XG5cblx0dmFyIHNlZ29mZnNldHM9US5lbmdpbmUuZ2V0RmlsZVNlZ09mZnNldHMoZmlsZWlkKTtcblx0dmFyIG91dHB1dD1bXTtcdFxuXHQvL2NvbnNvbGUubG9nKHN0YXJ0dnBvcyxlbmR2cG9zKVxuXHRRLmVuZ2luZS5nZXQoW1wiZmlsZUNvbnRlbnRzXCIsZmlsZWlkXSx0cnVlLGZ1bmN0aW9uKGRhdGEpe1xuXHRcdGlmICghZGF0YSkge1xuXHRcdFx0Y29uc29sZS5lcnJvcihcIndyb25nIGZpbGUgaWRcIixmaWxlaWQpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRmb3IgKHZhciBpPTA7aTxkYXRhLmxlbmd0aC0xO2krKyApe1xuXHRcdFx0XHR2YXIgc3RhcnR2cG9zPXNlZ29mZnNldHNbaV07XG5cdFx0XHRcdHZhciBlbmR2cG9zPXNlZ29mZnNldHNbaSsxXTtcblx0XHRcdFx0dmFyIHNlZ25hbWVzPVEuZW5naW5lLmdldEZpbGVTZWdOYW1lcyhmaWxlaWQpO1xuXHRcdFx0XHR2YXIgc2VnPWdldFNlZ1N5bmMoUS5lbmdpbmUsIGZpbGVpZCxpKzEpO1xuXHRcdFx0XHRcdHZhciBvcHQ9e3RleHQ6c2VnLnRleHQsaGl0czpudWxsLHRhZzonaGwnLHZwb3M6c3RhcnR2cG9zLFxuXHRcdFx0XHRcdGZ1bGx0ZXh0OnRydWUsbm9zcGFuOm9wdHMubm9zcGFuLG5vY3JsZjpvcHRzLm5vY3JsZn07XG5cdFx0XHRcdHZhciBzZWduYW1lPXNlZ25hbWVzW2krMV07XG5cdFx0XHRcdG9wdC5oaXRzPWhpdEluUmFuZ2UoUSxzdGFydHZwb3MsZW5kdnBvcyk7XG5cdFx0XHRcdHZhciBwYj0nPHBiIG49XCInK3NlZ25hbWUrJ1wiPjwvcGI+Jztcblx0XHRcdFx0dmFyIHdpdGh0YWc9aW5qZWN0VGFnKFEsb3B0KTtcblx0XHRcdFx0b3V0cHV0LnB1c2gocGIrd2l0aHRhZyk7XG5cdFx0XHR9XHRcdFx0XG5cdFx0fVxuXG5cdFx0Y2IuYXBwbHkoUS5lbmdpbmUuY29udGV4dCxbe3RleHQ6b3V0cHV0LmpvaW4oXCJcIiksZmlsZTpmaWxlaWR9XSk7XG5cdH0pXG59XG52YXIgaGlnaGxpZ2h0U2VnPWZ1bmN0aW9uKFEsZmlsZWlkLHNlZ2lkLG9wdHMsY2IsY29udGV4dCkge1xuXHRpZiAodHlwZW9mIG9wdHM9PVwiZnVuY3Rpb25cIikge1xuXHRcdGNiPW9wdHM7XG5cdH1cblxuXHRpZiAoIVEgfHwgIVEuZW5naW5lKSByZXR1cm4gY2IuYXBwbHkoY29udGV4dCxbbnVsbF0pO1xuXHR2YXIgc2Vnb2Zmc2V0cz1RLmVuZ2luZS5nZXRGaWxlU2VnT2Zmc2V0cyhmaWxlaWQpO1xuXHR2YXIgc3RhcnR2cG9zPXNlZ29mZnNldHNbc2VnaWQtMV07XG5cdHZhciBlbmR2cG9zPXNlZ29mZnNldHNbc2VnaWRdO1xuXHR2YXIgc2VnbmFtZXM9US5lbmdpbmUuZ2V0RmlsZVNlZ05hbWVzKGZpbGVpZCk7XG5cblx0dGhpcy5nZXRTZWcoUS5lbmdpbmUsZmlsZWlkLHNlZ2lkLGZ1bmN0aW9uKHJlcyl7XG5cdFx0dmFyIG9wdD17dGV4dDpyZXMudGV4dCxoaXRzOm51bGwsdnBvczpzdGFydHZwb3MsZnVsbHRleHQ6dHJ1ZSxcblx0XHRcdG5vc3BhbjpvcHRzLm5vc3Bhbixub2NybGY6b3B0cy5ub2NybGZ9O1xuXHRcdG9wdC5oaXRzPWhpdEluUmFuZ2UoUSxzdGFydHZwb3MsZW5kdnBvcyk7XG5cdFx0aWYgKG9wdHMucmVuZGVyVGFncykge1xuXHRcdFx0b3B0LnRhZ3M9dGFnc0luUmFuZ2UoUSxvcHRzLnJlbmRlclRhZ3Msc3RhcnR2cG9zLGVuZHZwb3MpO1xuXHRcdH1cblxuXHRcdHZhciBzZWduYW1lPXNlZ25hbWVzW3NlZ2lkXTtcblx0XHRjYi5hcHBseShjb250ZXh0fHxRLmVuZ2luZS5jb250ZXh0LFt7dGV4dDppbmplY3RUYWcoUSxvcHQpLHNlZzpzZWdpZCxmaWxlOmZpbGVpZCxoaXRzOm9wdC5oaXRzLHNlZ25hbWU6c2VnbmFtZX1dKTtcblx0fSk7XG59XG5tb2R1bGUuZXhwb3J0cz17cmVzdWx0bGlzdDpyZXN1bHRsaXN0LCBcblx0aGl0SW5SYW5nZTpoaXRJblJhbmdlLCBcblx0aGlnaGxpZ2h0U2VnOmhpZ2hsaWdodFNlZyxcblx0Z2V0U2VnOmdldFNlZyxcblx0aGlnaGxpZ2h0RmlsZTpoaWdobGlnaHRGaWxlLFxuXHRnZXRGaWxlOmdldEZpbGVcblx0Ly9oaWdobGlnaHRSYW5nZTpoaWdobGlnaHRSYW5nZSxcbiAgLy9nZXRSYW5nZTpnZXRSYW5nZSxcbn07IiwiLypcbiAgS3NhbmEgU2VhcmNoIEVuZ2luZS5cblxuICBuZWVkIGEgS0RFIGluc3RhbmNlIHRvIGJlIGZ1bmN0aW9uYWxcbiAgXG4qL1xudmFyIGJzZWFyY2g9cmVxdWlyZShcIi4vYnNlYXJjaFwiKTtcbnZhciBkb3NlYXJjaD1yZXF1aXJlKFwiLi9zZWFyY2hcIik7XG5cbnZhciBwcmVwYXJlRW5naW5lRm9yU2VhcmNoPWZ1bmN0aW9uKGVuZ2luZSxjYil7XG5cdGlmIChlbmdpbmUuYW5hbHl6ZXIpIHtcblx0XHRjYigpO1xuXHRcdHJldHVybjtcblx0fVxuXHR2YXIgYW5hbHl6ZXI9cmVxdWlyZShcImtzYW5hLWFuYWx5emVyXCIpO1xuXHR2YXIgY29uZmlnPWVuZ2luZS5nZXQoXCJtZXRhXCIpLmNvbmZpZztcblx0ZW5naW5lLmFuYWx5emVyPWFuYWx5emVyLmdldEFQSShjb25maWcpO1xuXHRlbmdpbmUuZ2V0KFtbXCJ0b2tlbnNcIl0sW1wicG9zdGluZ3NsZW5ndGhcIl1dLGZ1bmN0aW9uKCl7XG5cdFx0Y2IoKTtcblx0fSk7XG59XG5cbnZhciBfc2VhcmNoPWZ1bmN0aW9uKGVuZ2luZSxxLG9wdHMsY2IsY29udGV4dCkge1xuXHRpZiAodHlwZW9mIGVuZ2luZT09XCJzdHJpbmdcIikgey8vYnJvd3NlciBvbmx5XG5cdFx0dmFyIGtkZT1yZXF1aXJlKFwia3NhbmEtZGF0YWJhc2VcIik7XG5cdFx0aWYgKHR5cGVvZiBvcHRzPT1cImZ1bmN0aW9uXCIpIHsgLy91c2VyIGRpZG4ndCBzdXBwbHkgb3B0aW9uc1xuXHRcdFx0aWYgKHR5cGVvZiBjYj09XCJvYmplY3RcIiljb250ZXh0PWNiO1xuXHRcdFx0Y2I9b3B0cztcblx0XHRcdG9wdHM9e307XG5cdFx0fVxuXHRcdG9wdHMucT1xO1xuXHRcdG9wdHMuZGJpZD1lbmdpbmU7XG5cdFx0a2RlLm9wZW4ob3B0cy5kYmlkLGZ1bmN0aW9uKGVycixkYil7XG5cdFx0XHRpZiAoZXJyKSB7XG5cdFx0XHRcdGNiKGVycik7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdGNvbnNvbGUubG9nKFwib3BlbmVkXCIsb3B0cy5kYmlkKVxuXHRcdFx0cHJlcGFyZUVuZ2luZUZvclNlYXJjaChkYixmdW5jdGlvbigpe1xuXHRcdFx0XHRyZXR1cm4gZG9zZWFyY2goZGIscSxvcHRzLGNiKTtcdFxuXHRcdFx0fSk7XG5cdFx0fSxjb250ZXh0KTtcblx0fSBlbHNlIHtcblx0XHRwcmVwYXJlRW5naW5lRm9yU2VhcmNoKGVuZ2luZSxmdW5jdGlvbigpe1xuXHRcdFx0cmV0dXJuIGRvc2VhcmNoKGVuZ2luZSxxLG9wdHMsY2IpO1x0XG5cdFx0fSk7XG5cdH1cbn1cblxudmFyIF9oaWdobGlnaHRTZWc9ZnVuY3Rpb24oZW5naW5lLGZpbGVpZCxzZWdpZCxvcHRzLGNiLGNvbnRleHQpe1xuXHRpZiAoIW9wdHMucSkge1xuXHRcdGFwaS5leGNlcnB0LmdldFNlZyhlbmdpbmUsZmlsZWlkLHNlZ2lkLG9wdHMsY2IsY29udGV4dCk7XG5cdH0gZWxzZSB7XG5cdFx0X3NlYXJjaChlbmdpbmUsb3B0cy5xLG9wdHMsZnVuY3Rpb24oZXJyLFEpe1xuXHRcdFx0YXBpLmV4Y2VycHQuaGlnaGxpZ2h0U2VnKFEsZmlsZWlkLHNlZ2lkLG9wdHMsY2IsY29udGV4dCk7XG5cdFx0fSk7XHRcdFx0XG5cdH1cbn1cbnZhciBfaGlnaGxpZ2h0UmFuZ2U9ZnVuY3Rpb24oZW5naW5lLHN0YXJ0LGVuZCxvcHRzLGNiLGNvbnRleHQpe1xuXG5cdGlmIChvcHRzLnEpIHtcblx0XHRfc2VhcmNoKGVuZ2luZSxvcHRzLnEsb3B0cyxmdW5jdGlvbihRKXtcblx0XHRcdGFwaS5leGNlcnB0LmhpZ2hsaWdodFJhbmdlKFEsc3RhcnQsZW5kLG9wdHMsY2IsY29udGV4dCk7XG5cdFx0fSk7XG5cdH0gZWxzZSB7XG5cdFx0cHJlcGFyZUVuZ2luZUZvclNlYXJjaChlbmdpbmUsZnVuY3Rpb24oKXtcblx0XHRcdGFwaS5leGNlcnB0LmdldFJhbmdlKGVuZ2luZSxzdGFydCxlbmQsY2IsY29udGV4dCk7XG5cdFx0fSk7XG5cdH1cbn1cbnZhciBfaGlnaGxpZ2h0RmlsZT1mdW5jdGlvbihlbmdpbmUsZmlsZWlkLG9wdHMsY2Ipe1xuXHRpZiAoIW9wdHMucSkgb3B0cy5xPVwiXCI7IFxuXHRfc2VhcmNoKGVuZ2luZSxvcHRzLnEsb3B0cyxmdW5jdGlvbihRKXtcblx0XHRhcGkuZXhjZXJwdC5oaWdobGlnaHRGaWxlKFEsZmlsZWlkLG9wdHMsY2IpO1xuXHR9KTtcblx0Lypcblx0fSBlbHNlIHtcblx0XHRhcGkuZXhjZXJwdC5nZXRGaWxlKGVuZ2luZSxmaWxlaWQsZnVuY3Rpb24oZGF0YSkge1xuXHRcdFx0Y2IuYXBwbHkoZW5naW5lLmNvbnRleHQsW2RhdGFdKTtcblx0XHR9KTtcblx0fVxuXHQqL1xufVxuXG52YXIgdnBvczJmaWxlc2VnPWZ1bmN0aW9uKGVuZ2luZSx2cG9zKSB7XG4gICAgdmFyIHNlZ29mZnNldHM9ZW5naW5lLmdldChcInNlZ29mZnNldHNcIik7XG4gICAgdmFyIGZpbGVvZmZzZXRzPWVuZ2luZS5nZXQoW1wiZmlsZW9mZnNldHNcIl0pO1xuICAgIHZhciBzZWduYW1lcz1lbmdpbmUuZ2V0KFwic2VnbmFtZXNcIik7XG4gICAgdmFyIGZpbGVpZD1ic2VhcmNoKGZpbGVvZmZzZXRzLHZwb3MrMSx0cnVlKTtcbiAgICBmaWxlaWQtLTtcbiAgICB2YXIgc2VnaWQ9YnNlYXJjaChzZWdvZmZzZXRzLHZwb3MrMSx0cnVlKTtcblx0dmFyIHJhbmdlPWVuZ2luZS5nZXRGaWxlUmFuZ2UoZmlsZWlkKTtcblx0c2VnaWQtPXJhbmdlLnN0YXJ0O1xuICAgIHJldHVybiB7ZmlsZTpmaWxlaWQsc2VnOnNlZ2lkfTtcbn1cbnZhciBhcGk9e1xuXHRzZWFyY2g6X3NlYXJjaFxuLy9cdCxjb25jb3JkYW5jZTpyZXF1aXJlKFwiLi9jb25jb3JkYW5jZVwiKVxuLy9cdCxyZWdleDpyZXF1aXJlKFwiLi9yZWdleFwiKVxuXHQsaGlnaGxpZ2h0U2VnOl9oaWdobGlnaHRTZWdcblx0LGhpZ2hsaWdodEZpbGU6X2hpZ2hsaWdodEZpbGVcbi8vXHQsaGlnaGxpZ2h0UmFuZ2U6X2hpZ2hsaWdodFJhbmdlXG5cdCxleGNlcnB0OnJlcXVpcmUoXCIuL2V4Y2VycHRcIilcblx0LHZwb3MyZmlsZXNlZzp2cG9zMmZpbGVzZWdcbn1cbm1vZHVsZS5leHBvcnRzPWFwaTsiLCJcbnZhciB1bnBhY2sgPSBmdW5jdGlvbiAoYXIpIHsgLy8gdW5wYWNrIHZhcmlhYmxlIGxlbmd0aCBpbnRlZ2VyIGxpc3RcbiAgdmFyIHIgPSBbXSxcbiAgaSA9IDAsXG4gIHYgPSAwO1xuICBkbyB7XG5cdHZhciBzaGlmdCA9IDA7XG5cdGRvIHtcblx0ICB2ICs9ICgoYXJbaV0gJiAweDdGKSA8PCBzaGlmdCk7XG5cdCAgc2hpZnQgKz0gNztcblx0fSB3aGlsZSAoYXJbKytpXSAmIDB4ODApO1xuXHRyW3IubGVuZ3RoXT12O1xuICB9IHdoaWxlIChpIDwgYXIubGVuZ3RoKTtcbiAgcmV0dXJuIHI7XG59XG5cbi8qXG4gICBhcnI6ICBbMSwxLDEsMSwxLDEsMSwxLDFdXG4gICBsZXZlbHM6IFswLDEsMSwyLDIsMCwxLDJdXG4gICBvdXRwdXQ6IFs1LDEsMywxLDEsMywxLDFdXG4qL1xuXG52YXIgZ3JvdXBzdW09ZnVuY3Rpb24oYXJyLGxldmVscykge1xuICBpZiAoYXJyLmxlbmd0aCE9bGV2ZWxzLmxlbmd0aCsxKSByZXR1cm4gbnVsbDtcbiAgdmFyIHN0YWNrPVtdO1xuICB2YXIgb3V0cHV0PW5ldyBBcnJheShsZXZlbHMubGVuZ3RoKTtcbiAgZm9yICh2YXIgaT0wO2k8bGV2ZWxzLmxlbmd0aDtpKyspIG91dHB1dFtpXT0wO1xuICBmb3IgKHZhciBpPTE7aTxhcnIubGVuZ3RoO2krKykgeyAvL2ZpcnN0IG9uZSBvdXQgb2YgdG9jIHNjb3BlLCBpZ25vcmVkXG4gICAgaWYgKHN0YWNrLmxlbmd0aD5sZXZlbHNbaS0xXSkge1xuICAgICAgd2hpbGUgKHN0YWNrLmxlbmd0aD5sZXZlbHNbaS0xXSkgc3RhY2sucG9wKCk7XG4gICAgfVxuICAgIHN0YWNrLnB1c2goaS0xKTtcbiAgICBmb3IgKHZhciBqPTA7ajxzdGFjay5sZW5ndGg7aisrKSB7XG4gICAgICBvdXRwdXRbc3RhY2tbal1dKz1hcnJbaV07XG4gICAgfVxuICB9XG4gIHJldHVybiBvdXRwdXQ7XG59XG4vKiBhcnI9IDEgLCAyICwgMyAsNCAsNSw2LDcgLy90b2tlbiBwb3N0aW5nXG4gIHBvc3Rpbmc9IDMgLCA1ICAvL3RhZyBwb3N0aW5nXG4gIG91dCA9IDMgLCAyLCAyXG4qL1xudmFyIGNvdW50Ynlwb3N0aW5nID0gZnVuY3Rpb24gKGFyciwgcG9zdGluZykge1xuICBpZiAoIXBvc3RpbmcubGVuZ3RoKSByZXR1cm4gW2Fyci5sZW5ndGhdO1xuICB2YXIgb3V0PVtdO1xuICBmb3IgKHZhciBpPTA7aTxwb3N0aW5nLmxlbmd0aDtpKyspIG91dFtpXT0wO1xuICBvdXRbcG9zdGluZy5sZW5ndGhdPTA7XG4gIHZhciBwPTAsaT0wLGxhc3RpPTA7XG4gIHdoaWxlIChpPGFyci5sZW5ndGggJiYgcDxwb3N0aW5nLmxlbmd0aCkge1xuICAgIGlmIChhcnJbaV08PXBvc3RpbmdbcF0pIHtcbiAgICAgIHdoaWxlIChwPHBvc3RpbmcubGVuZ3RoICYmIGk8YXJyLmxlbmd0aCAmJiBhcnJbaV08PXBvc3RpbmdbcF0pIHtcbiAgICAgICAgb3V0W3BdKys7XG4gICAgICAgIGkrKztcbiAgICAgIH0gICAgICBcbiAgICB9IFxuICAgIHArKztcbiAgfVxuICBvdXRbcG9zdGluZy5sZW5ndGhdID0gYXJyLmxlbmd0aC1pOyAvL3JlbWFpbmluZ1xuICByZXR1cm4gb3V0O1xufVxuXG52YXIgZ3JvdXBieXBvc3Rpbmc9ZnVuY3Rpb24oYXJyLGdwb3N0aW5nKSB7IC8vcmVsYXRpdmUgdnBvc1xuICBpZiAoIWdwb3N0aW5nLmxlbmd0aCkgcmV0dXJuIFthcnIubGVuZ3RoXTtcbiAgdmFyIG91dD1bXTtcbiAgZm9yICh2YXIgaT0wO2k8PWdwb3N0aW5nLmxlbmd0aDtpKyspIG91dFtpXT1bXTtcbiAgXG4gIHZhciBwPTAsaT0wLGxhc3RpPTA7XG4gIHdoaWxlIChpPGFyci5sZW5ndGggJiYgcDxncG9zdGluZy5sZW5ndGgpIHtcbiAgICBpZiAoYXJyW2ldPGdwb3N0aW5nW3BdKSB7XG4gICAgICB3aGlsZSAocDxncG9zdGluZy5sZW5ndGggJiYgaTxhcnIubGVuZ3RoICYmIGFycltpXTxncG9zdGluZ1twXSkge1xuICAgICAgICB2YXIgc3RhcnQ9MDtcbiAgICAgICAgaWYgKHA+MCkgc3RhcnQ9Z3Bvc3RpbmdbcC0xXTtcbiAgICAgICAgb3V0W3BdLnB1c2goYXJyW2krK10tc3RhcnQpOyAgLy8gcmVsYXRpdmVcbiAgICAgIH0gICAgICBcbiAgICB9IFxuICAgIHArKztcbiAgfVxuICAvL3JlbWFpbmluZ1xuICB3aGlsZShpPGFyci5sZW5ndGgpIG91dFtvdXQubGVuZ3RoLTFdLnB1c2goYXJyW2krK10tZ3Bvc3RpbmdbZ3Bvc3RpbmcubGVuZ3RoLTFdKTtcbiAgcmV0dXJuIG91dDtcbn1cbnZhciBncm91cGJ5cG9zdGluZzI9ZnVuY3Rpb24oYXJyLGdwb3N0aW5nKSB7IC8vYWJzb2x1dGUgdnBvc1xuICBpZiAoIWFyciB8fCAhYXJyLmxlbmd0aCkgcmV0dXJuIFtdO1xuICBpZiAoIWdwb3N0aW5nLmxlbmd0aCkgcmV0dXJuIFthcnIubGVuZ3RoXTtcbiAgdmFyIG91dD1bXTtcbiAgZm9yICh2YXIgaT0wO2k8PWdwb3N0aW5nLmxlbmd0aDtpKyspIG91dFtpXT1bXTtcbiAgXG4gIHZhciBwPTAsaT0wLGxhc3RpPTA7XG4gIHdoaWxlIChpPGFyci5sZW5ndGggJiYgcDxncG9zdGluZy5sZW5ndGgpIHtcbiAgICBpZiAoYXJyW2ldPGdwb3N0aW5nW3BdKSB7XG4gICAgICB3aGlsZSAocDxncG9zdGluZy5sZW5ndGggJiYgaTxhcnIubGVuZ3RoICYmIGFycltpXTxncG9zdGluZ1twXSkge1xuICAgICAgICB2YXIgc3RhcnQ9MDtcbiAgICAgICAgaWYgKHA+MCkgc3RhcnQ9Z3Bvc3RpbmdbcC0xXTsgLy9hYnNvbHV0ZVxuICAgICAgICBvdXRbcF0ucHVzaChhcnJbaSsrXSk7XG4gICAgICB9ICAgICAgXG4gICAgfSBcbiAgICBwKys7XG4gIH1cbiAgLy9yZW1haW5pbmdcbiAgd2hpbGUoaTxhcnIubGVuZ3RoKSBvdXRbb3V0Lmxlbmd0aC0xXS5wdXNoKGFycltpKytdLWdwb3N0aW5nW2dwb3N0aW5nLmxlbmd0aC0xXSk7XG4gIHJldHVybiBvdXQ7XG59XG52YXIgZ3JvdXBieWJsb2NrMiA9IGZ1bmN0aW9uKGFyLCBudG9rZW4sc2xvdHNoaWZ0LG9wdHMpIHtcbiAgaWYgKCFhci5sZW5ndGgpIHJldHVybiBbe30se31dO1xuICBcbiAgc2xvdHNoaWZ0ID0gc2xvdHNoaWZ0IHx8IDE2O1xuICB2YXIgZyA9IE1hdGgucG93KDIsc2xvdHNoaWZ0KTtcbiAgdmFyIGkgPSAwO1xuICB2YXIgciA9IHt9LCBudG9rZW5zPXt9O1xuICB2YXIgZ3JvdXBjb3VudD0wO1xuICBkbyB7XG4gICAgdmFyIGdyb3VwID0gTWF0aC5mbG9vcihhcltpXSAvIGcpIDtcbiAgICBpZiAoIXJbZ3JvdXBdKSB7XG4gICAgICByW2dyb3VwXSA9IFtdO1xuICAgICAgbnRva2Vuc1tncm91cF09W107XG4gICAgICBncm91cGNvdW50Kys7XG4gICAgfVxuICAgIHJbZ3JvdXBdLnB1c2goYXJbaV0gJSBnKTtcbiAgICBudG9rZW5zW2dyb3VwXS5wdXNoKG50b2tlbltpXSk7XG4gICAgaSsrO1xuICB9IHdoaWxlIChpIDwgYXIubGVuZ3RoKTtcbiAgaWYgKG9wdHMpIG9wdHMuZ3JvdXBjb3VudD1ncm91cGNvdW50O1xuICByZXR1cm4gW3IsbnRva2Vuc107XG59XG52YXIgZ3JvdXBieXNsb3QgPSBmdW5jdGlvbiAoYXIsIHNsb3RzaGlmdCwgb3B0cykge1xuICBpZiAoIWFyLmxlbmd0aClcblx0cmV0dXJuIHt9O1xuICBcbiAgc2xvdHNoaWZ0ID0gc2xvdHNoaWZ0IHx8IDE2O1xuICB2YXIgZyA9IE1hdGgucG93KDIsc2xvdHNoaWZ0KTtcbiAgdmFyIGkgPSAwO1xuICB2YXIgciA9IHt9O1xuICB2YXIgZ3JvdXBjb3VudD0wO1xuICBkbyB7XG5cdHZhciBncm91cCA9IE1hdGguZmxvb3IoYXJbaV0gLyBnKSA7XG5cdGlmICghcltncm91cF0pIHtcblx0ICByW2dyb3VwXSA9IFtdO1xuXHQgIGdyb3VwY291bnQrKztcblx0fVxuXHRyW2dyb3VwXS5wdXNoKGFyW2ldICUgZyk7XG5cdGkrKztcbiAgfSB3aGlsZSAoaSA8IGFyLmxlbmd0aCk7XG4gIGlmIChvcHRzKSBvcHRzLmdyb3VwY291bnQ9Z3JvdXBjb3VudDtcbiAgcmV0dXJuIHI7XG59XG4vKlxudmFyIGlkZW50aXR5ID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZTtcbn07XG52YXIgc29ydGVkSW5kZXggPSBmdW5jdGlvbiAoYXJyYXksIG9iaiwgaXRlcmF0b3IpIHsgLy90YWtlbiBmcm9tIHVuZGVyc2NvcmVcbiAgaXRlcmF0b3IgfHwgKGl0ZXJhdG9yID0gaWRlbnRpdHkpO1xuICB2YXIgbG93ID0gMCxcbiAgaGlnaCA9IGFycmF5Lmxlbmd0aDtcbiAgd2hpbGUgKGxvdyA8IGhpZ2gpIHtcblx0dmFyIG1pZCA9IChsb3cgKyBoaWdoKSA+PiAxO1xuXHRpdGVyYXRvcihhcnJheVttaWRdKSA8IGl0ZXJhdG9yKG9iaikgPyBsb3cgPSBtaWQgKyAxIDogaGlnaCA9IG1pZDtcbiAgfVxuICByZXR1cm4gbG93O1xufTsqL1xuXG52YXIgaW5kZXhPZlNvcnRlZCA9IGZ1bmN0aW9uIChhcnJheSwgb2JqKSB7IFxuICB2YXIgbG93ID0gMCxcbiAgaGlnaCA9IGFycmF5Lmxlbmd0aC0xO1xuICB3aGlsZSAobG93IDwgaGlnaCkge1xuICAgIHZhciBtaWQgPSAobG93ICsgaGlnaCkgPj4gMTtcbiAgICBhcnJheVttaWRdIDwgb2JqID8gbG93ID0gbWlkICsgMSA6IGhpZ2ggPSBtaWQ7XG4gIH1cbiAgcmV0dXJuIGxvdztcbn07XG52YXIgcGxoZWFkPWZ1bmN0aW9uKHBsLCBwbHRhZywgb3B0cykge1xuICBvcHRzPW9wdHN8fHt9O1xuICBvcHRzLm1heD1vcHRzLm1heHx8MTtcbiAgdmFyIG91dD1bXTtcbiAgaWYgKHBsdGFnLmxlbmd0aDxwbC5sZW5ndGgpIHtcbiAgICBmb3IgKHZhciBpPTA7aTxwbHRhZy5sZW5ndGg7aSsrKSB7XG4gICAgICAgayA9IGluZGV4T2ZTb3J0ZWQocGwsIHBsdGFnW2ldKTtcbiAgICAgICBpZiAoaz4tMSAmJiBrPHBsLmxlbmd0aCkge1xuICAgICAgICBpZiAocGxba109PXBsdGFnW2ldKSB7XG4gICAgICAgICAgb3V0W291dC5sZW5ndGhdPXBsdGFnW2ldO1xuICAgICAgICAgIGlmIChvdXQubGVuZ3RoPj1vcHRzLm1heCkgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgZm9yICh2YXIgaT0wO2k8cGwubGVuZ3RoO2krKykge1xuICAgICAgIGsgPSBpbmRleE9mU29ydGVkKHBsdGFnLCBwbFtpXSk7XG4gICAgICAgaWYgKGs+LTEgJiYgazxwbHRhZy5sZW5ndGgpIHtcbiAgICAgICAgaWYgKHBsdGFnW2tdPT1wbFtpXSkge1xuICAgICAgICAgIG91dFtvdXQubGVuZ3RoXT1wbHRhZ1trXTtcbiAgICAgICAgICBpZiAob3V0Lmxlbmd0aD49b3B0cy5tYXgpIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBvdXQ7XG59XG4vKlxuIHBsMiBvY2N1ciBhZnRlciBwbDEsIFxuIHBsMj49cGwxK21pbmRpc1xuIHBsMjw9cGwxK21heGRpc1xuKi9cbnZhciBwbGZvbGxvdzIgPSBmdW5jdGlvbiAocGwxLCBwbDIsIG1pbmRpcywgbWF4ZGlzKSB7XG4gIHZhciByID0gW10saT0wO1xuICB2YXIgc3dhcCA9IDA7XG4gIFxuICB3aGlsZSAoaTxwbDEubGVuZ3RoKXtcbiAgICB2YXIgayA9IGluZGV4T2ZTb3J0ZWQocGwyLCBwbDFbaV0gKyBtaW5kaXMpO1xuICAgIHZhciB0ID0gKHBsMltrXSA+PSAocGwxW2ldICttaW5kaXMpICYmIHBsMltrXTw9KHBsMVtpXSttYXhkaXMpKSA/IGsgOiAtMTtcbiAgICBpZiAodCA+IC0xKSB7XG4gICAgICByW3IubGVuZ3RoXT1wbDFbaV07XG4gICAgICBpKys7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChrPj1wbDIubGVuZ3RoKSBicmVhaztcbiAgICAgIHZhciBrMj1pbmRleE9mU29ydGVkIChwbDEscGwyW2tdLW1heGRpcyk7XG4gICAgICBpZiAoazI+aSkge1xuICAgICAgICB2YXIgdCA9IChwbDJba10gPj0gKHBsMVtpXSArbWluZGlzKSAmJiBwbDJba108PShwbDFbaV0rbWF4ZGlzKSkgPyBrIDogLTE7XG4gICAgICAgIGlmICh0Pi0xKSByW3IubGVuZ3RoXT1wbDFbazJdO1xuICAgICAgICBpPWsyO1xuICAgICAgfSBlbHNlIGJyZWFrO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcjtcbn1cblxudmFyIHBsbm90Zm9sbG93MiA9IGZ1bmN0aW9uIChwbDEsIHBsMiwgbWluZGlzLCBtYXhkaXMpIHtcbiAgdmFyIHIgPSBbXSxpPTA7XG4gIFxuICB3aGlsZSAoaTxwbDEubGVuZ3RoKXtcbiAgICB2YXIgayA9IGluZGV4T2ZTb3J0ZWQocGwyLCBwbDFbaV0gKyBtaW5kaXMpO1xuICAgIHZhciB0ID0gKHBsMltrXSA+PSAocGwxW2ldICttaW5kaXMpICYmIHBsMltrXTw9KHBsMVtpXSttYXhkaXMpKSA/IGsgOiAtMTtcbiAgICBpZiAodCA+IC0xKSB7XG4gICAgICBpKys7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChrPj1wbDIubGVuZ3RoKSB7XG4gICAgICAgIHI9ci5jb25jYXQocGwxLnNsaWNlKGkpKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgazI9aW5kZXhPZlNvcnRlZCAocGwxLHBsMltrXS1tYXhkaXMpO1xuICAgICAgICBpZiAoazI+aSkge1xuICAgICAgICAgIHI9ci5jb25jYXQocGwxLnNsaWNlKGksazIpKTtcbiAgICAgICAgICBpPWsyO1xuICAgICAgICB9IGVsc2UgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiByO1xufVxuLyogdGhpcyBpcyBpbmNvcnJlY3QgKi9cbnZhciBwbGZvbGxvdyA9IGZ1bmN0aW9uIChwbDEsIHBsMiwgZGlzdGFuY2UpIHtcbiAgdmFyIHIgPSBbXSxpPTA7XG5cbiAgd2hpbGUgKGk8cGwxLmxlbmd0aCl7XG4gICAgdmFyIGsgPSBpbmRleE9mU29ydGVkKHBsMiwgcGwxW2ldICsgZGlzdGFuY2UpO1xuICAgIHZhciB0ID0gKHBsMltrXSA9PT0gKHBsMVtpXSArIGRpc3RhbmNlKSkgPyBrIDogLTE7XG4gICAgaWYgKHQgPiAtMSkge1xuICAgICAgci5wdXNoKHBsMVtpXSk7XG4gICAgICBpKys7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChrPj1wbDIubGVuZ3RoKSBicmVhaztcbiAgICAgIHZhciBrMj1pbmRleE9mU29ydGVkIChwbDEscGwyW2tdLWRpc3RhbmNlKTtcbiAgICAgIGlmIChrMj5pKSB7XG4gICAgICAgIHQgPSAocGwyW2tdID09PSAocGwxW2syXSArIGRpc3RhbmNlKSkgPyBrIDogLTE7XG4gICAgICAgIGlmICh0Pi0xKSB7XG4gICAgICAgICAgIHIucHVzaChwbDFbazJdKTtcbiAgICAgICAgICAgazIrKztcbiAgICAgICAgfVxuICAgICAgICBpPWsyO1xuICAgICAgfSBlbHNlIGJyZWFrO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcjtcbn1cbnZhciBwbG5vdGZvbGxvdyA9IGZ1bmN0aW9uIChwbDEsIHBsMiwgZGlzdGFuY2UpIHtcbiAgdmFyIHIgPSBbXTtcbiAgdmFyIHIgPSBbXSxpPTA7XG4gIHZhciBzd2FwID0gMDtcbiAgXG4gIHdoaWxlIChpPHBsMS5sZW5ndGgpe1xuICAgIHZhciBrID0gaW5kZXhPZlNvcnRlZChwbDIsIHBsMVtpXSArIGRpc3RhbmNlKTtcbiAgICB2YXIgdCA9IChwbDJba10gPT09IChwbDFbaV0gKyBkaXN0YW5jZSkpID8gayA6IC0xO1xuICAgIGlmICh0ID4gLTEpIHsgXG4gICAgICBpKys7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChrPj1wbDIubGVuZ3RoKSB7XG4gICAgICAgIHI9ci5jb25jYXQocGwxLnNsaWNlKGkpKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgazI9aW5kZXhPZlNvcnRlZCAocGwxLHBsMltrXS1kaXN0YW5jZSk7XG4gICAgICAgIGlmIChrMj5pKSB7XG4gICAgICAgICAgcj1yLmNvbmNhdChwbDEuc2xpY2UoaSxrMikpO1xuICAgICAgICAgIGk9azI7XG4gICAgICAgIH0gZWxzZSBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHI7XG59XG52YXIgcGxhbmQgPSBmdW5jdGlvbiAocGwxLCBwbDIsIGRpc3RhbmNlKSB7XG4gIHZhciByID0gW107XG4gIHZhciBzd2FwID0gMDtcbiAgXG4gIGlmIChwbDEubGVuZ3RoID4gcGwyLmxlbmd0aCkgeyAvL3N3YXAgZm9yIGZhc3RlciBjb21wYXJlXG4gICAgdmFyIHQgPSBwbDI7XG4gICAgcGwyID0gcGwxO1xuICAgIHBsMSA9IHQ7XG4gICAgc3dhcCA9IGRpc3RhbmNlO1xuICAgIGRpc3RhbmNlID0gLWRpc3RhbmNlO1xuICB9XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgcGwxLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGsgPSBpbmRleE9mU29ydGVkKHBsMiwgcGwxW2ldICsgZGlzdGFuY2UpO1xuICAgIHZhciB0ID0gKHBsMltrXSA9PT0gKHBsMVtpXSArIGRpc3RhbmNlKSkgPyBrIDogLTE7XG4gICAgaWYgKHQgPiAtMSkge1xuICAgICAgci5wdXNoKHBsMVtpXSAtIHN3YXApO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcjtcbn1cbnZhciBjb21iaW5lPWZ1bmN0aW9uIChwb3N0aW5ncykge1xuICB2YXIgb3V0PVtdO1xuICBmb3IgKHZhciBpIGluIHBvc3RpbmdzKSB7XG4gICAgb3V0PW91dC5jb25jYXQocG9zdGluZ3NbaV0pO1xuICB9XG4gIG91dC5zb3J0KGZ1bmN0aW9uKGEsYil7cmV0dXJuIGEtYn0pO1xuICByZXR1cm4gb3V0O1xufVxuXG52YXIgdW5pcXVlID0gZnVuY3Rpb24oYXIpe1xuICAgaWYgKCFhciB8fCAhYXIubGVuZ3RoKSByZXR1cm4gW107XG4gICB2YXIgdSA9IHt9LCBhID0gW107XG4gICBmb3IodmFyIGkgPSAwLCBsID0gYXIubGVuZ3RoOyBpIDwgbDsgKytpKXtcbiAgICBpZih1Lmhhc093blByb3BlcnR5KGFyW2ldKSkgY29udGludWU7XG4gICAgYS5wdXNoKGFyW2ldKTtcbiAgICB1W2FyW2ldXSA9IDE7XG4gICB9XG4gICByZXR1cm4gYTtcbn1cblxuXG5cbnZhciBwbHBocmFzZSA9IGZ1bmN0aW9uIChwb3N0aW5ncyxvcHMpIHtcbiAgdmFyIHIgPSBbXTtcbiAgZm9yICh2YXIgaT0wO2k8cG9zdGluZ3MubGVuZ3RoO2krKykge1xuICBcdGlmICghcG9zdGluZ3NbaV0pICByZXR1cm4gW107XG4gIFx0aWYgKDAgPT09IGkpIHtcbiAgXHQgIHIgPSBwb3N0aW5nc1swXTtcbiAgXHR9IGVsc2Uge1xuICAgICAgaWYgKG9wc1tpXT09J2FuZG5vdCcpIHtcbiAgICAgICAgciA9IHBsbm90Zm9sbG93KHIsIHBvc3RpbmdzW2ldLCBpKTsgIFxuICAgICAgfWVsc2Uge1xuICAgICAgICByID0gcGxhbmQociwgcG9zdGluZ3NbaV0sIGkpOyAgXG4gICAgICB9XG4gIFx0fVxuICB9XG4gIFxuICByZXR1cm4gcjtcbn1cbi8vcmV0dXJuIGFuIGFycmF5IG9mIGdyb3VwIGhhdmluZyBhbnkgb2YgcGwgaXRlbVxudmFyIG1hdGNoUG9zdGluZz1mdW5jdGlvbihwbCxndXBsLHN0YXJ0LGVuZCkge1xuICBzdGFydD1zdGFydHx8MDtcbiAgZW5kPWVuZHx8LTE7XG4gIGlmIChlbmQ9PS0xKSBlbmQ9TWF0aC5wb3coMiwgNTMpOyAvLyBtYXggaW50ZWdlciB2YWx1ZVxuXG4gIHZhciBjb3VudD0wLCBpID0gaj0gMCwgIHJlc3VsdCA9IFtdICx2PTA7XG4gIHZhciBkb2NzPVtdLCBmcmVxPVtdO1xuICBpZiAoIXBsKSByZXR1cm4ge2RvY3M6W10sZnJlcTpbXX07XG4gIHdoaWxlKCBpIDwgcGwubGVuZ3RoICYmIGogPCBndXBsLmxlbmd0aCApe1xuICAgICBpZiAocGxbaV0gPCBndXBsW2pdICl7IFxuICAgICAgIGNvdW50Kys7XG4gICAgICAgdj1wbFtpXTtcbiAgICAgICBpKys7IFxuICAgICB9IGVsc2Uge1xuICAgICAgIGlmIChjb3VudCkge1xuICAgICAgICBpZiAodj49c3RhcnQgJiYgdjxlbmQpIHtcbiAgICAgICAgICBkb2NzLnB1c2goaik7XG4gICAgICAgICAgZnJlcS5wdXNoKGNvdW50KTsgICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICB9XG4gICAgICAgaisrO1xuICAgICAgIGNvdW50PTA7XG4gICAgIH1cbiAgfVxuICBpZiAoY291bnQgJiYgajxndXBsLmxlbmd0aCAmJiB2Pj1zdGFydCAmJiB2PGVuZCkge1xuICAgIGRvY3MucHVzaChqKTtcbiAgICBmcmVxLnB1c2goY291bnQpO1xuICAgIGNvdW50PTA7XG4gIH1cbiAgZWxzZSB7XG4gICAgd2hpbGUgKGo9PWd1cGwubGVuZ3RoICYmIGk8cGwubGVuZ3RoICYmIHBsW2ldID49IGd1cGxbZ3VwbC5sZW5ndGgtMV0pIHtcbiAgICAgIGkrKztcbiAgICAgIGNvdW50Kys7XG4gICAgfVxuICAgIGlmICh2Pj1zdGFydCAmJiB2PGVuZCkge1xuICAgICAgZG9jcy5wdXNoKGopO1xuICAgICAgZnJlcS5wdXNoKGNvdW50KTsgICAgICBcbiAgICB9XG4gIH0gXG4gIHJldHVybiB7ZG9jczpkb2NzLGZyZXE6ZnJlcX07XG59XG5cbnZhciB0cmltPWZ1bmN0aW9uKGFycixzdGFydCxlbmQpIHtcbiAgdmFyIHM9aW5kZXhPZlNvcnRlZChhcnIsc3RhcnQpO1xuICB2YXIgZT1pbmRleE9mU29ydGVkKGFycixlbmQpO1xuICByZXR1cm4gYXJyLnNsaWNlKHMsZSsxKTtcbn1cbnZhciBwbGlzdD17fTtcbnBsaXN0LnVucGFjaz11bnBhY2s7XG5wbGlzdC5wbHBocmFzZT1wbHBocmFzZTtcbnBsaXN0LnBsaGVhZD1wbGhlYWQ7XG5wbGlzdC5wbGZvbGxvdzI9cGxmb2xsb3cyO1xucGxpc3QucGxub3Rmb2xsb3cyPXBsbm90Zm9sbG93MjtcbnBsaXN0LnBsZm9sbG93PXBsZm9sbG93O1xucGxpc3QucGxub3Rmb2xsb3c9cGxub3Rmb2xsb3c7XG5wbGlzdC51bmlxdWU9dW5pcXVlO1xucGxpc3QuaW5kZXhPZlNvcnRlZD1pbmRleE9mU29ydGVkO1xucGxpc3QubWF0Y2hQb3N0aW5nPW1hdGNoUG9zdGluZztcbnBsaXN0LnRyaW09dHJpbTtcblxucGxpc3QuZ3JvdXBieXNsb3Q9Z3JvdXBieXNsb3Q7XG5wbGlzdC5ncm91cGJ5YmxvY2syPWdyb3VwYnlibG9jazI7XG5wbGlzdC5jb3VudGJ5cG9zdGluZz1jb3VudGJ5cG9zdGluZztcbnBsaXN0Lmdyb3VwYnlwb3N0aW5nPWdyb3VwYnlwb3N0aW5nO1xucGxpc3QuZ3JvdXBieXBvc3RpbmcyPWdyb3VwYnlwb3N0aW5nMjtcbnBsaXN0Lmdyb3Vwc3VtPWdyb3Vwc3VtO1xucGxpc3QuY29tYmluZT1jb21iaW5lO1xubW9kdWxlLmV4cG9ydHM9cGxpc3Q7IiwiLypcbnZhciBkb3NlYXJjaDI9ZnVuY3Rpb24oZW5naW5lLG9wdHMsY2IsY29udGV4dCkge1xuXHRvcHRzXG5cdFx0bmZpbGUsbnBhZ2UgIC8vcmV0dXJuIGEgaGlnaGxpZ2h0ZWQgcGFnZVxuXHRcdG5maWxlLFtwYWdlc10gLy9yZXR1cm4gaGlnaGxpZ2h0ZWQgcGFnZXMgXG5cdFx0bmZpbGUgICAgICAgIC8vcmV0dXJuIGVudGlyZSBoaWdobGlnaHRlZCBmaWxlXG5cdFx0YWJzX25wYWdlXG5cdFx0W2Fic19wYWdlc10gIC8vcmV0dXJuIHNldCBvZiBoaWdobGlnaHRlZCBwYWdlcyAobWF5IGNyb3NzIGZpbGUpXG5cblx0XHRmaWxlbmFtZSwgcGFnZW5hbWVcblx0XHRmaWxlbmFtZSxbcGFnZW5hbWVzXVxuXG5cdFx0ZXhjZXJwdCAgICAgIC8vXG5cdCAgICBzb3J0QnkgICAgICAgLy9kZWZhdWx0IG5hdHVyYWwsIHNvcnRieSBieSB2c20gcmFua2luZ1xuXG5cdC8vcmV0dXJuIGVycixhcnJheV9vZl9zdHJpbmcgLFEgIChRIGNvbnRhaW5zIGxvdyBsZXZlbCBzZWFyY2ggcmVzdWx0KVxufVxuXG4qL1xuLyogVE9ETyBzb3J0ZWQgdG9rZW5zICovXG52YXIgcGxpc3Q9cmVxdWlyZShcIi4vcGxpc3RcIik7XG52YXIgYm9vbHNlYXJjaD1yZXF1aXJlKFwiLi9ib29sc2VhcmNoXCIpO1xudmFyIGV4Y2VycHQ9cmVxdWlyZShcIi4vZXhjZXJwdFwiKTtcbnZhciBwYXJzZVRlcm0gPSBmdW5jdGlvbihlbmdpbmUscmF3LG9wdHMpIHtcblx0aWYgKCFyYXcpIHJldHVybjtcblx0dmFyIHJlcz17cmF3OnJhdyx2YXJpYW50czpbXSx0ZXJtOicnLG9wOicnfTtcblx0dmFyIHRlcm09cmF3LCBvcD0wO1xuXHR2YXIgZmlyc3RjaGFyPXRlcm1bMF07XG5cdHZhciB0ZXJtcmVnZXg9XCJcIjtcblx0aWYgKGZpcnN0Y2hhcj09Jy0nKSB7XG5cdFx0dGVybT10ZXJtLnN1YnN0cmluZygxKTtcblx0XHRmaXJzdGNoYXI9dGVybVswXTtcblx0XHRyZXMuZXhjbHVkZT10cnVlOyAvL2V4Y2x1ZGVcblx0fVxuXHR0ZXJtPXRlcm0udHJpbSgpO1xuXHR2YXIgbGFzdGNoYXI9dGVybVt0ZXJtLmxlbmd0aC0xXTtcblx0dGVybT1lbmdpbmUuYW5hbHl6ZXIubm9ybWFsaXplKHRlcm0pO1xuXHRcblx0aWYgKHRlcm0uaW5kZXhPZihcIiVcIik+LTEpIHtcblx0XHR2YXIgdGVybXJlZ2V4PVwiXlwiK3Rlcm0ucmVwbGFjZSgvJSsvZyxcIi4rXCIpK1wiJFwiO1xuXHRcdGlmIChmaXJzdGNoYXI9PVwiJVwiKSBcdHRlcm1yZWdleD1cIi4rXCIrdGVybXJlZ2V4LnN1YnN0cigxKTtcblx0XHRpZiAobGFzdGNoYXI9PVwiJVwiKSBcdHRlcm1yZWdleD10ZXJtcmVnZXguc3Vic3RyKDAsdGVybXJlZ2V4Lmxlbmd0aC0xKStcIi4rXCI7XG5cdH1cblxuXHRpZiAodGVybXJlZ2V4KSB7XG5cdFx0cmVzLnZhcmlhbnRzPWV4cGFuZFRlcm0oZW5naW5lLHRlcm1yZWdleCk7XG5cdH1cblxuXHRyZXMua2V5PXRlcm07XG5cdHJldHVybiByZXM7XG59XG52YXIgZXhwYW5kVGVybT1mdW5jdGlvbihlbmdpbmUscmVnZXgpIHtcblx0dmFyIHI9bmV3IFJlZ0V4cChyZWdleCk7XG5cdHZhciB0b2tlbnM9ZW5naW5lLmdldChcInRva2Vuc1wiKTtcblx0dmFyIHBvc3RpbmdzTGVuZ3RoPWVuZ2luZS5nZXQoXCJwb3N0aW5nc2xlbmd0aFwiKTtcblx0aWYgKCFwb3N0aW5nc0xlbmd0aCkgcG9zdGluZ3NMZW5ndGg9W107XG5cdHZhciBvdXQ9W107XG5cdGZvciAodmFyIGk9MDtpPHRva2Vucy5sZW5ndGg7aSsrKSB7XG5cdFx0dmFyIG09dG9rZW5zW2ldLm1hdGNoKHIpO1xuXHRcdGlmIChtKSB7XG5cdFx0XHRvdXQucHVzaChbbVswXSxwb3N0aW5nc0xlbmd0aFtpXXx8MV0pO1xuXHRcdH1cblx0fVxuXHRvdXQuc29ydChmdW5jdGlvbihhLGIpe3JldHVybiBiWzFdLWFbMV19KTtcblx0cmV0dXJuIG91dDtcbn1cbnZhciBpc1dpbGRjYXJkPWZ1bmN0aW9uKHJhdykge1xuXHRyZXR1cm4gISFyYXcubWF0Y2goL1tcXCpcXD9dLyk7XG59XG5cbnZhciBpc09yVGVybT1mdW5jdGlvbih0ZXJtKSB7XG5cdHRlcm09dGVybS50cmltKCk7XG5cdHJldHVybiAodGVybVt0ZXJtLmxlbmd0aC0xXT09PScsJyk7XG59XG52YXIgb3J0ZXJtPWZ1bmN0aW9uKGVuZ2luZSx0ZXJtLGtleSkge1xuXHRcdHZhciB0PXt0ZXh0OmtleX07XG5cdFx0aWYgKGVuZ2luZS5hbmFseXplci5zaW1wbGlmaWVkVG9rZW4pIHtcblx0XHRcdHQuc2ltcGxpZmllZD1lbmdpbmUuYW5hbHl6ZXIuc2ltcGxpZmllZFRva2VuKGtleSk7XG5cdFx0fVxuXHRcdHRlcm0udmFyaWFudHMucHVzaCh0KTtcbn1cbnZhciBvclRlcm1zPWZ1bmN0aW9uKGVuZ2luZSx0b2tlbnMsbm93KSB7XG5cdHZhciByYXc9dG9rZW5zW25vd107XG5cdHZhciB0ZXJtPXBhcnNlVGVybShlbmdpbmUscmF3KTtcblx0aWYgKCF0ZXJtKSByZXR1cm47XG5cdG9ydGVybShlbmdpbmUsdGVybSx0ZXJtLmtleSk7XG5cdHdoaWxlIChpc09yVGVybShyYXcpKSAge1xuXHRcdHJhdz10b2tlbnNbKytub3ddO1xuXHRcdHZhciB0ZXJtMj1wYXJzZVRlcm0oZW5naW5lLHJhdyk7XG5cdFx0b3J0ZXJtKGVuZ2luZSx0ZXJtLHRlcm0yLmtleSk7XG5cdFx0Zm9yICh2YXIgaSBpbiB0ZXJtMi52YXJpYW50cyl7XG5cdFx0XHR0ZXJtLnZhcmlhbnRzW2ldPXRlcm0yLnZhcmlhbnRzW2ldO1xuXHRcdH1cblx0XHR0ZXJtLmtleSs9JywnK3Rlcm0yLmtleTtcblx0fVxuXHRyZXR1cm4gdGVybTtcbn1cblxudmFyIGdldE9wZXJhdG9yPWZ1bmN0aW9uKHJhdykge1xuXHR2YXIgb3A9Jyc7XG5cdGlmIChyYXdbMF09PScrJykgb3A9J2luY2x1ZGUnO1xuXHRpZiAocmF3WzBdPT0nLScpIG9wPSdleGNsdWRlJztcblx0cmV0dXJuIG9wO1xufVxudmFyIHBhcnNlUGhyYXNlPWZ1bmN0aW9uKHEpIHtcblx0dmFyIG1hdGNoPXEubWF0Y2goLyhcIi4rP1wifCcuKz8nfFxcUyspL2cpXG5cdG1hdGNoPW1hdGNoLm1hcChmdW5jdGlvbihzdHIpe1xuXHRcdHZhciBuPXN0ci5sZW5ndGgsIGg9c3RyLmNoYXJBdCgwKSwgdD1zdHIuY2hhckF0KG4tMSlcblx0XHRpZiAoaD09PXQmJihoPT09J1wiJ3xoPT09XCInXCIpKSBzdHI9c3RyLnN1YnN0cigxLG4tMilcblx0XHRyZXR1cm4gc3RyO1xuXHR9KVxuXHRyZXR1cm4gbWF0Y2g7XG59XG52YXIgdGliZXRhbk51bWJlcj17XG5cdFwiXFx1MGYyMFwiOlwiMFwiLFwiXFx1MGYyMVwiOlwiMVwiLFwiXFx1MGYyMlwiOlwiMlwiLFx0XCJcXHUwZjIzXCI6XCIzXCIsXHRcIlxcdTBmMjRcIjpcIjRcIixcblx0XCJcXHUwZjI1XCI6XCI1XCIsXCJcXHUwZjI2XCI6XCI2XCIsXCJcXHUwZjI3XCI6XCI3XCIsXCJcXHUwZjI4XCI6XCI4XCIsXCJcXHUwZjI5XCI6XCI5XCJcbn1cbnZhciBwYXJzZU51bWJlcj1mdW5jdGlvbihyYXcpIHtcblx0dmFyIG49cGFyc2VJbnQocmF3LDEwKTtcblx0aWYgKGlzTmFOKG4pKXtcblx0XHR2YXIgY29udmVydGVkPVtdO1xuXHRcdGZvciAodmFyIGk9MDtpPHJhdy5sZW5ndGg7aSsrKSB7XG5cdFx0XHR2YXIgbm49dGliZXRhbk51bWJlcltyYXdbaV1dO1xuXHRcdFx0aWYgKHR5cGVvZiBubiAhPVwidW5kZWZpbmVkXCIpIGNvbnZlcnRlZFtpXT1ubjtcblx0XHRcdGVsc2UgYnJlYWs7XG5cdFx0fVxuXHRcdHJldHVybiBwYXJzZUludChjb252ZXJ0ZWQsMTApO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBuO1xuXHR9XG59XG52YXIgcGFyc2VXaWxkY2FyZD1mdW5jdGlvbihyYXcpIHtcblx0dmFyIG49cGFyc2VOdW1iZXIocmF3KSB8fCAxO1xuXHR2YXIgcWNvdW50PXJhdy5zcGxpdCgnPycpLmxlbmd0aC0xO1xuXHR2YXIgc2NvdW50PXJhdy5zcGxpdCgnKicpLmxlbmd0aC0xO1xuXHR2YXIgdHlwZT0nJztcblx0aWYgKHFjb3VudCkgdHlwZT0nPyc7XG5cdGVsc2UgaWYgKHNjb3VudCkgdHlwZT0nKic7XG5cdHJldHVybiB7d2lsZGNhcmQ6dHlwZSwgd2lkdGg6IG4gLCBvcDond2lsZGNhcmQnfTtcbn1cblxudmFyIG5ld1BocmFzZT1mdW5jdGlvbigpIHtcblx0cmV0dXJuIHt0ZXJtaWQ6W10scG9zdGluZzpbXSxyYXc6JycsdGVybWxlbmd0aDpbXX07XG59IFxudmFyIHBhcnNlUXVlcnk9ZnVuY3Rpb24ocSxzZXApIHtcblx0aWYgKHNlcCAmJiBxLmluZGV4T2Yoc2VwKT4tMSkge1xuXHRcdHZhciBtYXRjaD1xLnNwbGl0KHNlcCk7XG5cdH0gZWxzZSB7XG5cdFx0dmFyIG1hdGNoPXEubWF0Y2goLyhcIi4rP1wifCcuKz8nfFxcUyspL2cpXG5cdFx0bWF0Y2g9bWF0Y2gubWFwKGZ1bmN0aW9uKHN0cil7XG5cdFx0XHR2YXIgbj1zdHIubGVuZ3RoLCBoPXN0ci5jaGFyQXQoMCksIHQ9c3RyLmNoYXJBdChuLTEpXG5cdFx0XHRpZiAoaD09PXQmJihoPT09J1wiJ3xoPT09XCInXCIpKSBzdHI9c3RyLnN1YnN0cigxLG4tMilcblx0XHRcdHJldHVybiBzdHJcblx0XHR9KVxuXHRcdC8vY29uc29sZS5sb2coaW5wdXQsJz09PicsbWF0Y2gpXHRcdFxuXHR9XG5cdHJldHVybiBtYXRjaDtcbn1cbnZhciBsb2FkUGhyYXNlPWZ1bmN0aW9uKHBocmFzZSkge1xuXHQvKiByZW1vdmUgbGVhZGluZyBhbmQgZW5kaW5nIHdpbGRjYXJkICovXG5cdHZhciBRPXRoaXM7XG5cdHZhciBjYWNoZT1RLmVuZ2luZS5wb3N0aW5nQ2FjaGU7XG5cdGlmIChjYWNoZVtwaHJhc2Uua2V5XSkge1xuXHRcdHBocmFzZS5wb3N0aW5nPWNhY2hlW3BocmFzZS5rZXldO1xuXHRcdHJldHVybiBRO1xuXHR9XG5cdGlmIChwaHJhc2UudGVybWlkLmxlbmd0aD09MSkge1xuXHRcdGlmICghUS50ZXJtcy5sZW5ndGgpe1xuXHRcdFx0cGhyYXNlLnBvc3Rpbmc9W107XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNhY2hlW3BocmFzZS5rZXldPXBocmFzZS5wb3N0aW5nPVEudGVybXNbcGhyYXNlLnRlcm1pZFswXV0ucG9zdGluZztcdFxuXHRcdH1cblx0XHRyZXR1cm4gUTtcblx0fVxuXG5cdHZhciBpPTAsIHI9W10sZGlzPTA7XG5cdHdoaWxlKGk8cGhyYXNlLnRlcm1pZC5sZW5ndGgpIHtcblx0ICB2YXIgVD1RLnRlcm1zW3BocmFzZS50ZXJtaWRbaV1dO1xuXHRcdGlmICgwID09PSBpKSB7XG5cdFx0XHRyID0gVC5wb3N0aW5nO1xuXHRcdH0gZWxzZSB7XG5cdFx0ICAgIGlmIChULm9wPT0nd2lsZGNhcmQnKSB7XG5cdFx0ICAgIFx0VD1RLnRlcm1zW3BocmFzZS50ZXJtaWRbaSsrXV07XG5cdFx0ICAgIFx0dmFyIHdpZHRoPVQud2lkdGg7XG5cdFx0ICAgIFx0dmFyIHdpbGRjYXJkPVQud2lsZGNhcmQ7XG5cdFx0ICAgIFx0VD1RLnRlcm1zW3BocmFzZS50ZXJtaWRbaV1dO1xuXHRcdCAgICBcdHZhciBtaW5kaXM9ZGlzO1xuXHRcdCAgICBcdGlmICh3aWxkY2FyZD09Jz8nKSBtaW5kaXM9ZGlzK3dpZHRoO1xuXHRcdCAgICBcdGlmIChULmV4Y2x1ZGUpIHIgPSBwbGlzdC5wbG5vdGZvbGxvdzIociwgVC5wb3N0aW5nLCBtaW5kaXMsIGRpcyt3aWR0aCk7XG5cdFx0ICAgIFx0ZWxzZSByID0gcGxpc3QucGxmb2xsb3cyKHIsIFQucG9zdGluZywgbWluZGlzLCBkaXMrd2lkdGgpO1x0XHQgICAgXHRcblx0XHQgICAgXHRkaXMrPSh3aWR0aC0xKTtcblx0XHQgICAgfWVsc2Uge1xuXHRcdCAgICBcdGlmIChULnBvc3RpbmcpIHtcblx0XHQgICAgXHRcdGlmIChULmV4Y2x1ZGUpIHIgPSBwbGlzdC5wbG5vdGZvbGxvdyhyLCBULnBvc3RpbmcsIGRpcyk7XG5cdFx0ICAgIFx0XHRlbHNlIHIgPSBwbGlzdC5wbGZvbGxvdyhyLCBULnBvc3RpbmcsIGRpcyk7XG5cdFx0ICAgIFx0fVxuXHRcdCAgICB9XG5cdFx0fVxuXHRcdGRpcyArPSBwaHJhc2UudGVybWxlbmd0aFtpXTtcblx0XHRpKys7XG5cdFx0aWYgKCFyKSByZXR1cm4gUTtcbiAgfVxuICBwaHJhc2UucG9zdGluZz1yO1xuICBjYWNoZVtwaHJhc2Uua2V5XT1yO1xuICByZXR1cm4gUTtcbn1cbnZhciB0cmltU3BhY2U9ZnVuY3Rpb24oZW5naW5lLHF1ZXJ5KSB7XG5cdGlmICghcXVlcnkpIHJldHVybiBcIlwiO1xuXHR2YXIgaT0wO1xuXHR2YXIgaXNTa2lwPWVuZ2luZS5hbmFseXplci5pc1NraXA7XG5cdHdoaWxlIChpPHF1ZXJ5Lmxlbmd0aCAmJiBpc1NraXAocXVlcnlbaV0pKSBpKys7XG5cdHJldHVybiBxdWVyeS5zdWJzdHJpbmcoaSk7XG59XG52YXIgZ2V0U2VnV2l0aEhpdD1mdW5jdGlvbihmaWxlaWQsb2Zmc2V0cykge1xuXHR2YXIgUT10aGlzLGVuZ2luZT1RLmVuZ2luZTtcblx0dmFyIHNlZ1dpdGhIaXQ9cGxpc3QuZ3JvdXBieXBvc3RpbmcyKFEuYnlGaWxlW2ZpbGVpZCBdLCBvZmZzZXRzKTtcblx0aWYgKHNlZ1dpdGhIaXQubGVuZ3RoKSBzZWdXaXRoSGl0LnNoaWZ0KCk7IC8vdGhlIGZpcnN0IGl0ZW0gaXMgbm90IHVzZWQgKDB+US5ieUZpbGVbMF0gKVxuXHR2YXIgb3V0PVtdO1xuXHRzZWdXaXRoSGl0Lm1hcChmdW5jdGlvbihwLGlkeCl7aWYgKHAubGVuZ3RoKSBvdXQucHVzaChpZHgpfSk7XG5cdHJldHVybiBvdXQ7XG59XG52YXIgc2VnV2l0aEhpdD1mdW5jdGlvbihmaWxlaWQpIHtcblx0dmFyIFE9dGhpcyxlbmdpbmU9US5lbmdpbmU7XG5cdHZhciBvZmZzZXRzPWVuZ2luZS5nZXRGaWxlU2VnT2Zmc2V0cyhmaWxlaWQpO1xuXHRyZXR1cm4gZ2V0U2VnV2l0aEhpdC5hcHBseSh0aGlzLFtmaWxlaWQsb2Zmc2V0c10pO1xufVxudmFyIGlzU2ltcGxlUGhyYXNlPWZ1bmN0aW9uKHBocmFzZSkge1xuXHR2YXIgbT1waHJhc2UubWF0Y2goL1tcXD8lXl0vKTtcblx0cmV0dXJuICFtO1xufVxuXG4vLyDnmbzoj6nmj5Dlv4MgICA9PT4g55m86I+pICDmj5Dlv4MgICAgICAgMiAyICAgXG4vLyDoj6nmj5Dlv4MgICAgID09PiDoj6nmj5AgIOaPkOW/gyAgICAgICAxIDJcbi8vIOWKq+WKqyAgICAgICA9PT4g5YqrICAgIOWKqyAgICAgICAgIDEgMSAgIC8vIGludmFsaWRcbi8vIOWboOe3o+aJgOeUn+mBkyAgPT0+IOWboOe3oyAg5omA55SfICAg6YGTICAgMiAyIDFcbnZhciBzcGxpdFBocmFzZT1mdW5jdGlvbihlbmdpbmUsc2ltcGxlcGhyYXNlLGJpZ3JhbSkge1xuXHR2YXIgYmlncmFtPWJpZ3JhbXx8ZW5naW5lLmdldChcIm1ldGFcIikuYmlncmFtfHxbXTtcblx0dmFyIHRva2Vucz1lbmdpbmUuYW5hbHl6ZXIudG9rZW5pemUoc2ltcGxlcGhyYXNlKS50b2tlbnM7XG5cdHZhciBsb2FkdG9rZW5zPVtdLGxlbmd0aHM9W10saj0wLGxhc3RiaWdyYW1wb3M9LTE7XG5cdHdoaWxlIChqKzE8dG9rZW5zLmxlbmd0aCkge1xuXHRcdHZhciB0b2tlbj1lbmdpbmUuYW5hbHl6ZXIubm9ybWFsaXplKHRva2Vuc1tqXSk7XG5cdFx0dmFyIG5leHR0b2tlbj1lbmdpbmUuYW5hbHl6ZXIubm9ybWFsaXplKHRva2Vuc1tqKzFdKTtcblx0XHR2YXIgYmk9dG9rZW4rbmV4dHRva2VuO1xuXHRcdHZhciBpPXBsaXN0LmluZGV4T2ZTb3J0ZWQoYmlncmFtLGJpKTtcblx0XHRpZiAoYmlncmFtW2ldPT1iaSkge1xuXHRcdFx0bG9hZHRva2Vucy5wdXNoKGJpKTtcblx0XHRcdGlmIChqKzM8dG9rZW5zLmxlbmd0aCkge1xuXHRcdFx0XHRsYXN0YmlncmFtcG9zPWo7XG5cdFx0XHRcdGorKztcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGlmIChqKzI9PXRva2Vucy5sZW5ndGgpeyBcblx0XHRcdFx0XHRpZiAobGFzdGJpZ3JhbXBvcysxPT1qICkge1xuXHRcdFx0XHRcdFx0bGVuZ3Roc1tsZW5ndGhzLmxlbmd0aC0xXS0tO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRsYXN0YmlncmFtcG9zPWo7XG5cdFx0XHRcdFx0aisrO1xuXHRcdFx0XHR9ZWxzZSB7XG5cdFx0XHRcdFx0bGFzdGJpZ3JhbXBvcz1qO1x0XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGxlbmd0aHMucHVzaCgyKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYgKCFiaWdyYW0gfHwgbGFzdGJpZ3JhbXBvcz09LTEgfHwgbGFzdGJpZ3JhbXBvcysxIT1qKSB7XG5cdFx0XHRcdGxvYWR0b2tlbnMucHVzaCh0b2tlbik7XG5cdFx0XHRcdGxlbmd0aHMucHVzaCgxKTtcdFx0XHRcdFxuXHRcdFx0fVxuXHRcdH1cblx0XHRqKys7XG5cdH1cblxuXHR3aGlsZSAoajx0b2tlbnMubGVuZ3RoKSB7XG5cdFx0dmFyIHRva2VuPWVuZ2luZS5hbmFseXplci5ub3JtYWxpemUodG9rZW5zW2pdKTtcblx0XHRsb2FkdG9rZW5zLnB1c2godG9rZW4pO1xuXHRcdGxlbmd0aHMucHVzaCgxKTtcblx0XHRqKys7XG5cdH1cblxuXHRyZXR1cm4ge3Rva2Vuczpsb2FkdG9rZW5zLCBsZW5ndGhzOiBsZW5ndGhzICwgdG9rZW5sZW5ndGg6IHRva2Vucy5sZW5ndGh9O1xufVxuLyogaG9zdCBoYXMgZmFzdCBuYXRpdmUgZnVuY3Rpb24gKi9cbnZhciBmYXN0UGhyYXNlPWZ1bmN0aW9uKGVuZ2luZSxwaHJhc2UpIHtcblx0dmFyIHBocmFzZV90ZXJtPW5ld1BocmFzZSgpO1xuXHQvL3ZhciB0b2tlbnM9ZW5naW5lLmFuYWx5emVyLnRva2VuaXplKHBocmFzZSkudG9rZW5zO1xuXHR2YXIgc3BsaXR0ZWQ9c3BsaXRQaHJhc2UoZW5naW5lLHBocmFzZSk7XG5cblx0dmFyIHBhdGhzPXBvc3RpbmdQYXRoRnJvbVRva2VucyhlbmdpbmUsc3BsaXR0ZWQudG9rZW5zKTtcbi8vY3JlYXRlIHdpbGRjYXJkXG5cblx0cGhyYXNlX3Rlcm0ud2lkdGg9c3BsaXR0ZWQudG9rZW5sZW5ndGg7IC8vZm9yIGV4Y2VycHQuanMgdG8gZ2V0UGhyYXNlV2lkdGhcblxuXHRlbmdpbmUuZ2V0KHBhdGhzLHthZGRyZXNzOnRydWV9LGZ1bmN0aW9uKHBvc3RpbmdBZGRyZXNzKXsgLy90aGlzIGlzIHN5bmNcblx0XHRwaHJhc2VfdGVybS5rZXk9cGhyYXNlO1xuXHRcdHZhciBwb3N0aW5nQWRkcmVzc1dpdGhXaWxkY2FyZD1bXTtcblx0XHRmb3IgKHZhciBpPTA7aTxwb3N0aW5nQWRkcmVzcy5sZW5ndGg7aSsrKSB7XG5cdFx0XHRwb3N0aW5nQWRkcmVzc1dpdGhXaWxkY2FyZC5wdXNoKHBvc3RpbmdBZGRyZXNzW2ldKTtcblx0XHRcdGlmIChzcGxpdHRlZC5sZW5ndGhzW2ldPjEpIHtcblx0XHRcdFx0cG9zdGluZ0FkZHJlc3NXaXRoV2lsZGNhcmQucHVzaChbc3BsaXR0ZWQubGVuZ3Roc1tpXSwwXSk7IC8vd2lsZGNhcmQgaGFzIGJsb2Nrc2l6ZT09MCBcblx0XHRcdH1cblx0XHR9XG5cdFx0ZW5naW5lLnBvc3RpbmdDYWNoZVtwaHJhc2VdPWVuZ2luZS5tZXJnZVBvc3RpbmdzKHBvc3RpbmdBZGRyZXNzV2l0aFdpbGRjYXJkKTtcblx0fSk7XG5cdHJldHVybiBwaHJhc2VfdGVybTtcblx0Ly8gcHV0IHBvc3RpbmcgaW50byBjYWNoZVtwaHJhc2Uua2V5XVxufVxudmFyIHNsb3dQaHJhc2U9ZnVuY3Rpb24oZW5naW5lLHRlcm1zLHBocmFzZSkge1xuXHR2YXIgaj0wLHRva2Vucz1lbmdpbmUuYW5hbHl6ZXIudG9rZW5pemUocGhyYXNlKS50b2tlbnM7XG5cdHZhciBwaHJhc2VfdGVybT1uZXdQaHJhc2UoKTtcblx0dmFyIHRlcm1pZD0wO1xuXHR3aGlsZSAoajx0b2tlbnMubGVuZ3RoKSB7XG5cdFx0dmFyIHJhdz10b2tlbnNbal0sIHRlcm1sZW5ndGg9MTtcblx0XHRpZiAoaXNXaWxkY2FyZChyYXcpKSB7XG5cdFx0XHRpZiAocGhyYXNlX3Rlcm0udGVybWlkLmxlbmd0aD09MCkgIHsgLy9za2lwIGxlYWRpbmcgd2lsZCBjYXJkXG5cdFx0XHRcdGorK1xuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblx0XHRcdHRlcm1zLnB1c2gocGFyc2VXaWxkY2FyZChyYXcpKTtcblx0XHRcdHRlcm1pZD10ZXJtcy5sZW5ndGgtMTtcblx0XHRcdHBocmFzZV90ZXJtLnRlcm1pZC5wdXNoKHRlcm1pZCk7XG5cdFx0XHRwaHJhc2VfdGVybS50ZXJtbGVuZ3RoLnB1c2godGVybWxlbmd0aCk7XG5cdFx0fSBlbHNlIGlmIChpc09yVGVybShyYXcpKXtcblx0XHRcdHZhciB0ZXJtPW9yVGVybXMuYXBwbHkodGhpcyxbdG9rZW5zLGpdKTtcblx0XHRcdGlmICh0ZXJtKSB7XG5cdFx0XHRcdHRlcm1zLnB1c2godGVybSk7XG5cdFx0XHRcdHRlcm1pZD10ZXJtcy5sZW5ndGgtMTtcblx0XHRcdFx0ais9dGVybS5rZXkuc3BsaXQoJywnKS5sZW5ndGgtMTtcdFx0XHRcdFx0XG5cdFx0XHR9XG5cdFx0XHRqKys7XG5cdFx0XHRwaHJhc2VfdGVybS50ZXJtaWQucHVzaCh0ZXJtaWQpO1xuXHRcdFx0cGhyYXNlX3Rlcm0udGVybWxlbmd0aC5wdXNoKHRlcm1sZW5ndGgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR2YXIgcGhyYXNlPVwiXCI7XG5cdFx0XHR3aGlsZSAoajx0b2tlbnMubGVuZ3RoKSB7XG5cdFx0XHRcdGlmICghKGlzV2lsZGNhcmQodG9rZW5zW2pdKSB8fCBpc09yVGVybSh0b2tlbnNbal0pKSkge1xuXHRcdFx0XHRcdHBocmFzZSs9dG9rZW5zW2pdO1xuXHRcdFx0XHRcdGorKztcblx0XHRcdFx0fSBlbHNlIGJyZWFrO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgc3BsaXR0ZWQ9c3BsaXRQaHJhc2UoZW5naW5lLHBocmFzZSk7XG5cdFx0XHRmb3IgKHZhciBpPTA7aTxzcGxpdHRlZC50b2tlbnMubGVuZ3RoO2krKykge1xuXG5cdFx0XHRcdHZhciB0ZXJtPXBhcnNlVGVybShlbmdpbmUsc3BsaXR0ZWQudG9rZW5zW2ldKTtcblx0XHRcdFx0dmFyIHRlcm1pZHg9dGVybXMubWFwKGZ1bmN0aW9uKGEpe3JldHVybiBhLmtleX0pLmluZGV4T2YodGVybS5rZXkpO1xuXHRcdFx0XHRpZiAodGVybWlkeD09LTEpIHtcblx0XHRcdFx0XHR0ZXJtcy5wdXNoKHRlcm0pO1xuXHRcdFx0XHRcdHRlcm1pZD10ZXJtcy5sZW5ndGgtMTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR0ZXJtaWQ9dGVybWlkeDtcblx0XHRcdFx0fVx0XHRcdFx0XG5cdFx0XHRcdHBocmFzZV90ZXJtLnRlcm1pZC5wdXNoKHRlcm1pZCk7XG5cdFx0XHRcdHBocmFzZV90ZXJtLnRlcm1sZW5ndGgucHVzaChzcGxpdHRlZC5sZW5ndGhzW2ldKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0aisrO1xuXHR9XG5cdHBocmFzZV90ZXJtLmtleT1waHJhc2U7XG5cdC8vcmVtb3ZlIGVuZGluZyB3aWxkY2FyZFxuXHR2YXIgUD1waHJhc2VfdGVybSAsIFQ9bnVsbDtcblx0ZG8ge1xuXHRcdFQ9dGVybXNbUC50ZXJtaWRbUC50ZXJtaWQubGVuZ3RoLTFdXTtcblx0XHRpZiAoIVQpIGJyZWFrO1xuXHRcdGlmIChULndpbGRjYXJkKSBQLnRlcm1pZC5wb3AoKTsgZWxzZSBicmVhaztcblx0fSB3aGlsZShUKTtcdFx0XG5cdHJldHVybiBwaHJhc2VfdGVybTtcbn1cbnZhciBuZXdRdWVyeSA9ZnVuY3Rpb24oZW5naW5lLHF1ZXJ5LG9wdHMpIHtcblx0Ly9pZiAoIXF1ZXJ5KSByZXR1cm47XG5cdG9wdHM9b3B0c3x8e307XG5cdHF1ZXJ5PXRyaW1TcGFjZShlbmdpbmUscXVlcnkpO1xuXG5cdHZhciBwaHJhc2VzPXF1ZXJ5LHBocmFzZXM9W107XG5cdGlmICh0eXBlb2YgcXVlcnk9PSdzdHJpbmcnICYmIHF1ZXJ5KSB7XG5cdFx0cGhyYXNlcz1wYXJzZVF1ZXJ5KHF1ZXJ5LG9wdHMucGhyYXNlX3NlcCB8fCBcIlwiKTtcblx0fVxuXHRcblx0dmFyIHBocmFzZV90ZXJtcz1bXSwgdGVybXM9W10sdmFyaWFudHM9W10sb3BlcmF0b3JzPVtdO1xuXHR2YXIgcGM9MDsvL3BocmFzZSBjb3VudFxuXHRmb3IgICh2YXIgaT0wO2k8cGhyYXNlcy5sZW5ndGg7aSsrKSB7XG5cdFx0dmFyIG9wPWdldE9wZXJhdG9yKHBocmFzZXNbcGNdKTtcblx0XHRpZiAob3ApIHBocmFzZXNbcGNdPXBocmFzZXNbcGNdLnN1YnN0cmluZygxKTtcblxuXHRcdC8qIGF1dG8gYWRkICsgZm9yIG5hdHVyYWwgb3JkZXIgPyovXG5cdFx0Ly9pZiAoIW9wdHMucmFuayAmJiBvcCE9J2V4Y2x1ZGUnICYmaSkgb3A9J2luY2x1ZGUnO1xuXHRcdG9wZXJhdG9ycy5wdXNoKG9wKTtcblxuXHRcdGlmIChpc1NpbXBsZVBocmFzZShwaHJhc2VzW3BjXSkgJiYgZW5naW5lLm1lcmdlUG9zdGluZ3MgKSB7XG5cdFx0XHR2YXIgcGhyYXNlX3Rlcm09ZmFzdFBocmFzZShlbmdpbmUscGhyYXNlc1twY10pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR2YXIgcGhyYXNlX3Rlcm09c2xvd1BocmFzZShlbmdpbmUsdGVybXMscGhyYXNlc1twY10pO1xuXHRcdH1cblx0XHRwaHJhc2VfdGVybXMucHVzaChwaHJhc2VfdGVybSk7XG5cblx0XHRpZiAoIWVuZ2luZS5tZXJnZVBvc3RpbmdzICYmIHBocmFzZV90ZXJtc1twY10udGVybWlkLmxlbmd0aD09MCkge1xuXHRcdFx0cGhyYXNlX3Rlcm1zLnBvcCgpO1xuXHRcdH0gZWxzZSBwYysrO1xuXHR9XG5cdG9wdHMub3A9b3BlcmF0b3JzO1xuXG5cdHZhciBRPXtkYm5hbWU6ZW5naW5lLmRibmFtZSxlbmdpbmU6ZW5naW5lLG9wdHM6b3B0cyxxdWVyeTpxdWVyeSxcblx0XHRwaHJhc2VzOnBocmFzZV90ZXJtcyx0ZXJtczp0ZXJtc1xuXHR9O1xuXHRRLnRva2VuaXplPWZ1bmN0aW9uKCkge3JldHVybiBlbmdpbmUuYW5hbHl6ZXIudG9rZW5pemUuYXBwbHkoZW5naW5lLGFyZ3VtZW50cyk7fVxuXHRRLmlzU2tpcD1mdW5jdGlvbigpIHtyZXR1cm4gZW5naW5lLmFuYWx5emVyLmlzU2tpcC5hcHBseShlbmdpbmUsYXJndW1lbnRzKTt9XG5cdFEubm9ybWFsaXplPWZ1bmN0aW9uKCkge3JldHVybiBlbmdpbmUuYW5hbHl6ZXIubm9ybWFsaXplLmFwcGx5KGVuZ2luZSxhcmd1bWVudHMpO31cblx0US5zZWdXaXRoSGl0PXNlZ1dpdGhIaXQ7XG5cblx0Ly9RLmdldFJhbmdlPWZ1bmN0aW9uKCkge3JldHVybiB0aGF0LmdldFJhbmdlLmFwcGx5KHRoYXQsYXJndW1lbnRzKX07XG5cdC8vQVBJLnF1ZXJ5aWQ9J1EnKyhNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkqMTAwMDAwMDApKS50b1N0cmluZygxNik7XG5cdHJldHVybiBRO1xufVxudmFyIHBvc3RpbmdQYXRoRnJvbVRva2Vucz1mdW5jdGlvbihlbmdpbmUsdG9rZW5zKSB7XG5cdHZhciBhbGx0b2tlbnM9ZW5naW5lLmdldChcInRva2Vuc1wiKTtcblxuXHR2YXIgdG9rZW5JZHM9dG9rZW5zLm1hcChmdW5jdGlvbih0KXsgcmV0dXJuIDErYWxsdG9rZW5zLmluZGV4T2YodCl9KTtcblx0dmFyIHBvc3RpbmdpZD1bXTtcblx0Zm9yICh2YXIgaT0wO2k8dG9rZW5JZHMubGVuZ3RoO2krKykge1xuXHRcdHBvc3RpbmdpZC5wdXNoKCB0b2tlbklkc1tpXSk7IC8vIHRva2VuSWQ9PTAgLCBlbXB0eSB0b2tlblxuXHR9XG5cdHJldHVybiBwb3N0aW5naWQubWFwKGZ1bmN0aW9uKHQpe3JldHVybiBbXCJwb3N0aW5nc1wiLHRdfSk7XG59XG52YXIgbG9hZFBvc3RpbmdzPWZ1bmN0aW9uKGVuZ2luZSx0b2tlbnMsY2IpIHtcblx0dmFyIHRvbG9hZHRva2Vucz10b2tlbnMuZmlsdGVyKGZ1bmN0aW9uKHQpe1xuXHRcdHJldHVybiAhZW5naW5lLnBvc3RpbmdDYWNoZVt0LmtleV07IC8vYWxyZWFkeSBpbiBjYWNoZVxuXHR9KTtcblx0aWYgKHRvbG9hZHRva2Vucy5sZW5ndGg9PTApIHtcblx0XHRjYigpO1xuXHRcdHJldHVybjtcblx0fVxuXHR2YXIgcG9zdGluZ1BhdGhzPXBvc3RpbmdQYXRoRnJvbVRva2VucyhlbmdpbmUsdG9rZW5zLm1hcChmdW5jdGlvbih0KXtyZXR1cm4gdC5rZXl9KSk7XG5cdGVuZ2luZS5nZXQocG9zdGluZ1BhdGhzLGZ1bmN0aW9uKHBvc3RpbmdzKXtcblx0XHRwb3N0aW5ncy5tYXAoZnVuY3Rpb24ocCxpKSB7IHRva2Vuc1tpXS5wb3N0aW5nPXAgfSk7XG5cdFx0aWYgKGNiKSBjYigpO1xuXHR9KTtcbn1cbnZhciBncm91cEJ5PWZ1bmN0aW9uKFEscG9zdGluZykge1xuXHRwaHJhc2VzLmZvckVhY2goZnVuY3Rpb24oUCl7XG5cdFx0dmFyIGtleT1QLmtleTtcblx0XHR2YXIgZG9jZnJlcT1kb2NmcmVxY2FjaGVba2V5XTtcblx0XHRpZiAoIWRvY2ZyZXEpIGRvY2ZyZXE9ZG9jZnJlcWNhY2hlW2tleV09e307XG5cdFx0aWYgKCFkb2NmcmVxW3RoYXQuZ3JvdXB1bml0XSkge1xuXHRcdFx0ZG9jZnJlcVt0aGF0Lmdyb3VwdW5pdF09e2RvY2xpc3Q6bnVsbCxmcmVxOm51bGx9O1xuXHRcdH1cdFx0XG5cdFx0aWYgKFAucG9zdGluZykge1xuXHRcdFx0dmFyIHJlcz1tYXRjaFBvc3RpbmcoZW5naW5lLFAucG9zdGluZyk7XG5cdFx0XHRQLmZyZXE9cmVzLmZyZXE7XG5cdFx0XHRQLmRvY3M9cmVzLmRvY3M7XG5cdFx0fSBlbHNlIHtcblx0XHRcdFAuZG9jcz1bXTtcblx0XHRcdFAuZnJlcT1bXTtcblx0XHR9XG5cdFx0ZG9jZnJlcVt0aGF0Lmdyb3VwdW5pdF09e2RvY2xpc3Q6UC5kb2NzLGZyZXE6UC5mcmVxfTtcblx0fSk7XG5cdHJldHVybiB0aGlzO1xufVxudmFyIGdyb3VwQnlGb2xkZXI9ZnVuY3Rpb24oZW5naW5lLGZpbGVoaXRzKSB7XG5cdHZhciBmaWxlcz1lbmdpbmUuZ2V0KFwiZmlsZW5hbWVzXCIpO1xuXHR2YXIgcHJldmZvbGRlcj1cIlwiLGhpdHM9MCxvdXQ9W107XG5cdGZvciAodmFyIGk9MDtpPGZpbGVoaXRzLmxlbmd0aDtpKyspIHtcblx0XHR2YXIgZm49ZmlsZXNbaV07XG5cdFx0dmFyIGZvbGRlcj1mbi5zdWJzdHJpbmcoMCxmbi5pbmRleE9mKCcvJykpO1xuXHRcdGlmIChwcmV2Zm9sZGVyICYmIHByZXZmb2xkZXIhPWZvbGRlcikge1xuXHRcdFx0b3V0LnB1c2goaGl0cyk7XG5cdFx0XHRoaXRzPTA7XG5cdFx0fVxuXHRcdGhpdHMrPWZpbGVoaXRzW2ldLmxlbmd0aDtcblx0XHRwcmV2Zm9sZGVyPWZvbGRlcjtcblx0fVxuXHRvdXQucHVzaChoaXRzKTtcblx0cmV0dXJuIG91dDtcbn1cbnZhciBwaHJhc2VfaW50ZXJzZWN0PWZ1bmN0aW9uKGVuZ2luZSxRKSB7XG5cdHZhciBpbnRlcnNlY3RlZD1udWxsO1xuXHR2YXIgZmlsZW9mZnNldHM9US5lbmdpbmUuZ2V0KFwiZmlsZW9mZnNldHNcIik7XG5cdHZhciBlbXB0eT1bXSxlbXB0eWNvdW50PTAsaGFzaGl0PTA7XG5cdGZvciAodmFyIGk9MDtpPFEucGhyYXNlcy5sZW5ndGg7aSsrKSB7XG5cdFx0dmFyIGJ5ZmlsZT1wbGlzdC5ncm91cGJ5cG9zdGluZzIoUS5waHJhc2VzW2ldLnBvc3RpbmcsZmlsZW9mZnNldHMpO1xuXHRcdGlmIChieWZpbGUubGVuZ3RoKSBieWZpbGUuc2hpZnQoKTtcblx0XHRpZiAoYnlmaWxlLmxlbmd0aCkgYnlmaWxlLnBvcCgpO1xuXHRcdGJ5ZmlsZS5wb3AoKTtcblx0XHRpZiAoaW50ZXJzZWN0ZWQ9PW51bGwpIHtcblx0XHRcdGludGVyc2VjdGVkPWJ5ZmlsZTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Zm9yICh2YXIgaj0wO2o8YnlmaWxlLmxlbmd0aDtqKyspIHtcblx0XHRcdFx0aWYgKCEoYnlmaWxlW2pdLmxlbmd0aCAmJiBpbnRlcnNlY3RlZFtqXS5sZW5ndGgpKSB7XG5cdFx0XHRcdFx0aW50ZXJzZWN0ZWRbal09ZW1wdHk7IC8vcmV1c2UgZW1wdHkgYXJyYXlcblx0XHRcdFx0XHRlbXB0eWNvdW50Kys7XG5cdFx0XHRcdH0gZWxzZSBoYXNoaXQrKztcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRRLmJ5RmlsZT1pbnRlcnNlY3RlZDtcblx0US5ieUZvbGRlcj1ncm91cEJ5Rm9sZGVyKGVuZ2luZSxRLmJ5RmlsZSk7XG5cdHZhciBvdXQ9W107XG5cdC8vY2FsY3VsYXRlIG5ldyByYXdwb3N0aW5nXG5cdGZvciAodmFyIGk9MDtpPFEuYnlGaWxlLmxlbmd0aDtpKyspIHtcblx0XHRpZiAoUS5ieUZpbGVbaV0ubGVuZ3RoKSBvdXQ9b3V0LmNvbmNhdChRLmJ5RmlsZVtpXSk7XG5cdH1cblx0US5yYXdyZXN1bHQ9b3V0O1xuXHRjb3VudEZvbGRlckZpbGUoUSk7XG59XG52YXIgY291bnRGb2xkZXJGaWxlPWZ1bmN0aW9uKFEpIHtcblx0US5maWxlV2l0aEhpdENvdW50PTA7XG5cdFEuYnlGaWxlLm1hcChmdW5jdGlvbihmKXtpZiAoZi5sZW5ndGgpIFEuZmlsZVdpdGhIaXRDb3VudCsrfSk7XG5cdFx0XHRcblx0US5mb2xkZXJXaXRoSGl0Q291bnQ9MDtcblx0US5ieUZvbGRlci5tYXAoZnVuY3Rpb24oZil7aWYgKGYpIFEuZm9sZGVyV2l0aEhpdENvdW50Kyt9KTtcbn1cblxudmFyIG1haW49ZnVuY3Rpb24oZW5naW5lLHEsb3B0cyxjYil7XG5cdHZhciBzdGFydHRpbWU9bmV3IERhdGUoKTtcblx0dmFyIG1ldGE9ZW5naW5lLmdldChcIm1ldGFcIik7XG5cdGlmIChtZXRhLm5vcm1hbGl6ZSAmJiBlbmdpbmUuYW5hbHl6ZXIuc2V0Tm9ybWFsaXplVGFibGUpIHtcblx0XHRtZXRhLm5vcm1hbGl6ZU9iaj1lbmdpbmUuYW5hbHl6ZXIuc2V0Tm9ybWFsaXplVGFibGUobWV0YS5ub3JtYWxpemUsbWV0YS5ub3JtYWxpemVPYmopO1xuXHR9XG5cdGlmICh0eXBlb2Ygb3B0cz09XCJmdW5jdGlvblwiKSBjYj1vcHRzO1xuXHRvcHRzPW9wdHN8fHt9O1xuXHR2YXIgUT1lbmdpbmUucXVlcnlDYWNoZVtxXTtcblx0aWYgKCFRKSBRPW5ld1F1ZXJ5KGVuZ2luZSxxLG9wdHMpOyBcblx0aWYgKCFRKSB7XG5cdFx0ZW5naW5lLnNlYXJjaHRpbWU9bmV3IERhdGUoKS1zdGFydHRpbWU7XG5cdFx0ZW5naW5lLnRvdGFsdGltZT1lbmdpbmUuc2VhcmNodGltZTtcblx0XHRpZiAoZW5naW5lLmNvbnRleHQpIGNiLmFwcGx5KGVuZ2luZS5jb250ZXh0LFtcImVtcHR5IHJlc3VsdFwiLHtyYXdyZXN1bHQ6W119XSk7XG5cdFx0ZWxzZSBjYihcImVtcHR5IHJlc3VsdFwiLHtyYXdyZXN1bHQ6W119KTtcblx0XHRyZXR1cm47XG5cdH07XG5cdGVuZ2luZS5xdWVyeUNhY2hlW3FdPVE7XG5cdGlmIChRLnBocmFzZXMubGVuZ3RoKSB7XG5cdFx0bG9hZFBvc3RpbmdzKGVuZ2luZSxRLnRlcm1zLGZ1bmN0aW9uKCl7XG5cdFx0XHRpZiAoIVEucGhyYXNlc1swXS5wb3N0aW5nKSB7XG5cdFx0XHRcdGVuZ2luZS5zZWFyY2h0aW1lPW5ldyBEYXRlKCktc3RhcnR0aW1lO1xuXHRcdFx0XHRlbmdpbmUudG90YWx0aW1lPWVuZ2luZS5zZWFyY2h0aW1lXG5cblx0XHRcdFx0Y2IuYXBwbHkoZW5naW5lLmNvbnRleHQsW1wibm8gc3VjaCBwb3N0aW5nXCIse3Jhd3Jlc3VsdDpbXX1dKTtcblx0XHRcdFx0cmV0dXJuO1x0XHRcdFxuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHRpZiAoIVEucGhyYXNlc1swXS5wb3N0aW5nLmxlbmd0aCkgeyAvL1xuXHRcdFx0XHRRLnBocmFzZXMuZm9yRWFjaChsb2FkUGhyYXNlLmJpbmQoUSkpO1xuXHRcdFx0fVxuXHRcdFx0aWYgKFEucGhyYXNlcy5sZW5ndGg9PTEpIHtcblx0XHRcdFx0US5yYXdyZXN1bHQ9US5waHJhc2VzWzBdLnBvc3Rpbmc7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRwaHJhc2VfaW50ZXJzZWN0KGVuZ2luZSxRKTtcblx0XHRcdH1cblx0XHRcdHZhciBmaWxlb2Zmc2V0cz1RLmVuZ2luZS5nZXQoXCJmaWxlb2Zmc2V0c1wiKTtcblx0XHRcdC8vY29uc29sZS5sb2coXCJzZWFyY2ggb3B0cyBcIitKU09OLnN0cmluZ2lmeShvcHRzKSk7XG5cblx0XHRcdGlmICghUS5ieUZpbGUgJiYgUS5yYXdyZXN1bHQgJiYgIW9wdHMubm9ncm91cCkge1xuXHRcdFx0XHRRLmJ5RmlsZT1wbGlzdC5ncm91cGJ5cG9zdGluZzIoUS5yYXdyZXN1bHQsIGZpbGVvZmZzZXRzKTtcblx0XHRcdFx0US5ieUZpbGUuc2hpZnQoKTtRLmJ5RmlsZS5wb3AoKTtcblx0XHRcdFx0US5ieUZvbGRlcj1ncm91cEJ5Rm9sZGVyKGVuZ2luZSxRLmJ5RmlsZSk7XG5cblx0XHRcdFx0Y291bnRGb2xkZXJGaWxlKFEpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAob3B0cy5yYW5nZSkge1xuXHRcdFx0XHRlbmdpbmUuc2VhcmNodGltZT1uZXcgRGF0ZSgpLXN0YXJ0dGltZTtcblx0XHRcdFx0ZXhjZXJwdC5yZXN1bHRsaXN0KGVuZ2luZSxRLG9wdHMsZnVuY3Rpb24oZGF0YSkgeyBcblx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKFwiZXhjZXJwdCBva1wiKTtcblx0XHRcdFx0XHRRLmV4Y2VycHQ9ZGF0YTtcblx0XHRcdFx0XHRlbmdpbmUudG90YWx0aW1lPW5ldyBEYXRlKCktc3RhcnR0aW1lO1xuXHRcdFx0XHRcdGNiLmFwcGx5KGVuZ2luZS5jb250ZXh0LFswLFFdKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRlbmdpbmUuc2VhcmNodGltZT1uZXcgRGF0ZSgpLXN0YXJ0dGltZTtcblx0XHRcdFx0ZW5naW5lLnRvdGFsdGltZT1uZXcgRGF0ZSgpLXN0YXJ0dGltZTtcblx0XHRcdFx0Y2IuYXBwbHkoZW5naW5lLmNvbnRleHQsWzAsUV0pO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9IGVsc2UgeyAvL2VtcHR5IHNlYXJjaFxuXHRcdGVuZ2luZS5zZWFyY2h0aW1lPW5ldyBEYXRlKCktc3RhcnR0aW1lO1xuXHRcdGVuZ2luZS50b3RhbHRpbWU9bmV3IERhdGUoKS1zdGFydHRpbWU7XG5cdFx0Y2IuYXBwbHkoZW5naW5lLmNvbnRleHQsWzAsUV0pO1xuXHR9O1xufVxuXG5tYWluLnNwbGl0UGhyYXNlPXNwbGl0UGhyYXNlOyAvL2p1c3QgZm9yIGRlYnVnXG5tb2R1bGUuZXhwb3J0cz1tYWluOyIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuLypcbmNvbnZlcnQgdG8gcHVyZSBqc1xuc2F2ZSAtZyByZWFjdGlmeVxuKi9cbnZhciBFPVJlYWN0LmNyZWF0ZUVsZW1lbnQ7XG5cbnZhciBoYXNrc2FuYWdhcD0odHlwZW9mIGtzYW5hZ2FwIT1cInVuZGVmaW5lZFwiKTtcbmlmIChoYXNrc2FuYWdhcCAmJiAodHlwZW9mIGNvbnNvbGU9PVwidW5kZWZpbmVkXCIgfHwgdHlwZW9mIGNvbnNvbGUubG9nPT1cInVuZGVmaW5lZFwiKSkge1xuXHRcdHdpbmRvdy5jb25zb2xlPXtsb2c6a3NhbmFnYXAubG9nLGVycm9yOmtzYW5hZ2FwLmVycm9yLGRlYnVnOmtzYW5hZ2FwLmRlYnVnLHdhcm46a3NhbmFnYXAud2Fybn07XG5cdFx0Y29uc29sZS5sb2coXCJpbnN0YWxsIGNvbnNvbGUgb3V0cHV0IGZ1bmNpdG9uXCIpO1xufVxuXG52YXIgY2hlY2tmcz1mdW5jdGlvbigpIHtcblx0cmV0dXJuIChuYXZpZ2F0b3IgJiYgbmF2aWdhdG9yLndlYmtpdFBlcnNpc3RlbnRTdG9yYWdlKSB8fCBoYXNrc2FuYWdhcDtcbn1cbnZhciBmZWF0dXJlY2hlY2tzPXtcblx0XCJmc1wiOmNoZWNrZnNcbn1cbnZhciBjaGVja2Jyb3dzZXIgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cdGdldEluaXRpYWxTdGF0ZTpmdW5jdGlvbigpIHtcblxuXHRcdHZhciBtaXNzaW5nRmVhdHVyZXM9dGhpcy5nZXRNaXNzaW5nRmVhdHVyZXMoKTtcblx0XHRyZXR1cm4ge3JlYWR5OmZhbHNlLCBtaXNzaW5nOm1pc3NpbmdGZWF0dXJlc307XG5cdH0sXG5cdGdldE1pc3NpbmdGZWF0dXJlczpmdW5jdGlvbigpIHtcblx0XHR2YXIgZmVhdHVyZT10aGlzLnByb3BzLmZlYXR1cmUuc3BsaXQoXCIsXCIpO1xuXHRcdHZhciBzdGF0dXM9W107XG5cdFx0ZmVhdHVyZS5tYXAoZnVuY3Rpb24oZil7XG5cdFx0XHR2YXIgY2hlY2tlcj1mZWF0dXJlY2hlY2tzW2ZdO1xuXHRcdFx0aWYgKGNoZWNrZXIpIGNoZWNrZXI9Y2hlY2tlcigpO1xuXHRcdFx0c3RhdHVzLnB1c2goW2YsY2hlY2tlcl0pO1xuXHRcdH0pO1xuXHRcdHJldHVybiBzdGF0dXMuZmlsdGVyKGZ1bmN0aW9uKGYpe3JldHVybiAhZlsxXX0pO1xuXHR9LFxuXHRkb3dubG9hZGJyb3dzZXI6ZnVuY3Rpb24oKSB7XG5cdFx0d2luZG93LmxvY2F0aW9uPVwiaHR0cHM6Ly93d3cuZ29vZ2xlLmNvbS9jaHJvbWUvXCJcblx0fSxcblx0cmVuZGVyTWlzc2luZzpmdW5jdGlvbigpIHtcblx0XHR2YXIgc2hvd01pc3Npbmc9ZnVuY3Rpb24obSkge1xuXHRcdFx0cmV0dXJuIEUoXCJkaXZcIiwgbnVsbCwgbSk7XG5cdFx0fVxuXHRcdHJldHVybiAoXG5cdFx0IEUoXCJkaXZcIiwge3JlZjogXCJkaWFsb2cxXCIsIGNsYXNzTmFtZTogXCJtb2RhbCBmYWRlXCIsIFwiZGF0YS1iYWNrZHJvcFwiOiBcInN0YXRpY1wifSwgXG5cdFx0ICAgIEUoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJtb2RhbC1kaWFsb2dcIn0sIFxuXHRcdCAgICAgIEUoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJtb2RhbC1jb250ZW50XCJ9LCBcblx0XHQgICAgICAgIEUoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJtb2RhbC1oZWFkZXJcIn0sIFxuXHRcdCAgICAgICAgICBFKFwiYnV0dG9uXCIsIHt0eXBlOiBcImJ1dHRvblwiLCBjbGFzc05hbWU6IFwiY2xvc2VcIiwgXCJkYXRhLWRpc21pc3NcIjogXCJtb2RhbFwiLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwifSwgXCLDl1wiKSwgXG5cdFx0ICAgICAgICAgIEUoXCJoNFwiLCB7Y2xhc3NOYW1lOiBcIm1vZGFsLXRpdGxlXCJ9LCBcIkJyb3dzZXIgQ2hlY2tcIilcblx0XHQgICAgICAgICksIFxuXHRcdCAgICAgICAgRShcImRpdlwiLCB7Y2xhc3NOYW1lOiBcIm1vZGFsLWJvZHlcIn0sIFxuXHRcdCAgICAgICAgICBFKFwicFwiLCBudWxsLCBcIlNvcnJ5IGJ1dCB0aGUgZm9sbG93aW5nIGZlYXR1cmUgaXMgbWlzc2luZ1wiKSwgXG5cdFx0ICAgICAgICAgIHRoaXMuc3RhdGUubWlzc2luZy5tYXAoc2hvd01pc3NpbmcpXG5cdFx0ICAgICAgICApLCBcblx0XHQgICAgICAgIEUoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJtb2RhbC1mb290ZXJcIn0sIFxuXHRcdCAgICAgICAgICBFKFwiYnV0dG9uXCIsIHtvbkNsaWNrOiB0aGlzLmRvd25sb2FkYnJvd3NlciwgdHlwZTogXCJidXR0b25cIiwgY2xhc3NOYW1lOiBcImJ0biBidG4tcHJpbWFyeVwifSwgXCJEb3dubG9hZCBHb29nbGUgQ2hyb21lXCIpXG5cdFx0ICAgICAgICApXG5cdFx0ICAgICAgKVxuXHRcdCAgICApXG5cdFx0ICApXG5cdFx0ICk7XG5cdH0sXG5cdHJlbmRlclJlYWR5OmZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiBFKFwic3BhblwiLCBudWxsLCBcImJyb3dzZXIgb2tcIilcblx0fSxcblx0cmVuZGVyOmZ1bmN0aW9uKCl7XG5cdFx0cmV0dXJuICAodGhpcy5zdGF0ZS5taXNzaW5nLmxlbmd0aCk/dGhpcy5yZW5kZXJNaXNzaW5nKCk6dGhpcy5yZW5kZXJSZWFkeSgpO1xuXHR9LFxuXHRjb21wb25lbnREaWRNb3VudDpmdW5jdGlvbigpIHtcblx0XHRpZiAoIXRoaXMuc3RhdGUubWlzc2luZy5sZW5ndGgpIHtcblx0XHRcdHRoaXMucHJvcHMub25SZWFkeSgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQkKHRoaXMucmVmcy5kaWFsb2cxLmdldERPTU5vZGUoKSkubW9kYWwoJ3Nob3cnKTtcblx0XHR9XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cz1jaGVja2Jyb3dzZXI7IiwiXG52YXIgdXNlckNhbmNlbD1mYWxzZTtcbnZhciBmaWxlcz1bXTtcbnZhciB0b3RhbERvd25sb2FkQnl0ZT0wO1xudmFyIHRhcmdldFBhdGg9XCJcIjtcbnZhciB0ZW1wUGF0aD1cIlwiO1xudmFyIG5maWxlPTA7XG52YXIgYmFzZXVybD1cIlwiO1xudmFyIHJlc3VsdD1cIlwiO1xudmFyIGRvd25sb2FkaW5nPWZhbHNlO1xudmFyIHN0YXJ0RG93bmxvYWQ9ZnVuY3Rpb24oZGJpZCxfYmFzZXVybCxfZmlsZXMpIHsgLy9yZXR1cm4gZG93bmxvYWQgaWRcblx0dmFyIGZzICAgICA9IHJlcXVpcmUoXCJmc1wiKTtcblx0dmFyIHBhdGggICA9IHJlcXVpcmUoXCJwYXRoXCIpO1xuXG5cdFxuXHRmaWxlcz1fZmlsZXMuc3BsaXQoXCJcXHVmZmZmXCIpO1xuXHRpZiAoZG93bmxvYWRpbmcpIHJldHVybiBmYWxzZTsgLy9vbmx5IG9uZSBzZXNzaW9uXG5cdHVzZXJDYW5jZWw9ZmFsc2U7XG5cdHRvdGFsRG93bmxvYWRCeXRlPTA7XG5cdG5leHRGaWxlKCk7XG5cdGRvd25sb2FkaW5nPXRydWU7XG5cdGJhc2V1cmw9X2Jhc2V1cmw7XG5cdGlmIChiYXNldXJsW2Jhc2V1cmwubGVuZ3RoLTFdIT0nLycpYmFzZXVybCs9Jy8nO1xuXHR0YXJnZXRQYXRoPWtzYW5hZ2FwLnJvb3RQYXRoK2RiaWQrJy8nO1xuXHR0ZW1wUGF0aD1rc2FuYWdhcC5yb290UGF0aCtcIi50bXAvXCI7XG5cdHJlc3VsdD1cIlwiO1xuXHRyZXR1cm4gdHJ1ZTtcbn1cblxudmFyIG5leHRGaWxlPWZ1bmN0aW9uKCkge1xuXHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG5cdFx0aWYgKG5maWxlPT1maWxlcy5sZW5ndGgpIHtcblx0XHRcdG5maWxlKys7XG5cdFx0XHRlbmREb3dubG9hZCgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRkb3dubG9hZEZpbGUobmZpbGUrKyk7XHRcblx0XHR9XG5cdH0sMTAwKTtcbn1cblxudmFyIGRvd25sb2FkRmlsZT1mdW5jdGlvbihuZmlsZSkge1xuXHR2YXIgdXJsPWJhc2V1cmwrZmlsZXNbbmZpbGVdO1xuXHR2YXIgdG1wZmlsZW5hbWU9dGVtcFBhdGgrZmlsZXNbbmZpbGVdO1xuXHR2YXIgbWtkaXJwID0gcmVxdWlyZShcIi4vbWtkaXJwXCIpO1xuXHR2YXIgZnMgICAgID0gcmVxdWlyZShcImZzXCIpO1xuXHR2YXIgaHR0cCAgID0gcmVxdWlyZShcImh0dHBcIik7XG5cblx0bWtkaXJwLnN5bmMocGF0aC5kaXJuYW1lKHRtcGZpbGVuYW1lKSk7XG5cdHZhciB3cml0ZVN0cmVhbSA9IGZzLmNyZWF0ZVdyaXRlU3RyZWFtKHRtcGZpbGVuYW1lKTtcblx0dmFyIGRhdGFsZW5ndGg9MDtcblx0dmFyIHJlcXVlc3QgPSBodHRwLmdldCh1cmwsIGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0cmVzcG9uc2Uub24oJ2RhdGEnLGZ1bmN0aW9uKGNodW5rKXtcblx0XHRcdHdyaXRlU3RyZWFtLndyaXRlKGNodW5rKTtcblx0XHRcdHRvdGFsRG93bmxvYWRCeXRlKz1jaHVuay5sZW5ndGg7XG5cdFx0XHRpZiAodXNlckNhbmNlbCkge1xuXHRcdFx0XHR3cml0ZVN0cmVhbS5lbmQoKTtcblx0XHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpe25leHRGaWxlKCk7fSwxMDApO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdHJlc3BvbnNlLm9uKFwiZW5kXCIsZnVuY3Rpb24oKSB7XG5cdFx0XHR3cml0ZVN0cmVhbS5lbmQoKTtcblx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKXtuZXh0RmlsZSgpO30sMTAwKTtcblx0XHR9KTtcblx0fSk7XG59XG5cbnZhciBjYW5jZWxEb3dubG9hZD1mdW5jdGlvbigpIHtcblx0dXNlckNhbmNlbD10cnVlO1xuXHRlbmREb3dubG9hZCgpO1xufVxudmFyIHZlcmlmeT1mdW5jdGlvbigpIHtcblx0cmV0dXJuIHRydWU7XG59XG52YXIgZW5kRG93bmxvYWQ9ZnVuY3Rpb24oKSB7XG5cdG5maWxlPWZpbGVzLmxlbmd0aCsxOy8vc3RvcFxuXHRyZXN1bHQ9XCJjYW5jZWxsZWRcIjtcblx0ZG93bmxvYWRpbmc9ZmFsc2U7XG5cdGlmICh1c2VyQ2FuY2VsKSByZXR1cm47XG5cdHZhciBmcyAgICAgPSByZXF1aXJlKFwiZnNcIik7XG5cdHZhciBta2RpcnAgPSByZXF1aXJlKFwiLi9ta2RpcnBcIik7XG5cblx0Zm9yICh2YXIgaT0wO2k8ZmlsZXMubGVuZ3RoO2krKykge1xuXHRcdHZhciB0YXJnZXRmaWxlbmFtZT10YXJnZXRQYXRoK2ZpbGVzW2ldO1xuXHRcdHZhciB0bXBmaWxlbmFtZSAgID10ZW1wUGF0aCtmaWxlc1tpXTtcblx0XHRta2RpcnAuc3luYyhwYXRoLmRpcm5hbWUodGFyZ2V0ZmlsZW5hbWUpKTtcblx0XHRmcy5yZW5hbWVTeW5jKHRtcGZpbGVuYW1lLHRhcmdldGZpbGVuYW1lKTtcblx0fVxuXHRpZiAodmVyaWZ5KCkpIHtcblx0XHRyZXN1bHQ9XCJzdWNjZXNzXCI7XG5cdH0gZWxzZSB7XG5cdFx0cmVzdWx0PVwiZXJyb3JcIjtcblx0fVxufVxuXG52YXIgZG93bmxvYWRlZEJ5dGU9ZnVuY3Rpb24oKSB7XG5cdHJldHVybiB0b3RhbERvd25sb2FkQnl0ZTtcbn1cbnZhciBkb25lRG93bmxvYWQ9ZnVuY3Rpb24oKSB7XG5cdGlmIChuZmlsZT5maWxlcy5sZW5ndGgpIHJldHVybiByZXN1bHQ7XG5cdGVsc2UgcmV0dXJuIFwiXCI7XG59XG52YXIgZG93bmxvYWRpbmdGaWxlPWZ1bmN0aW9uKCkge1xuXHRyZXR1cm4gbmZpbGUtMTtcbn1cblxudmFyIGRvd25sb2FkZXI9e3N0YXJ0RG93bmxvYWQ6c3RhcnREb3dubG9hZCwgZG93bmxvYWRlZEJ5dGU6ZG93bmxvYWRlZEJ5dGUsXG5cdGRvd25sb2FkaW5nRmlsZTpkb3dubG9hZGluZ0ZpbGUsIGNhbmNlbERvd25sb2FkOmNhbmNlbERvd25sb2FkLGRvbmVEb3dubG9hZDpkb25lRG93bmxvYWR9O1xubW9kdWxlLmV4cG9ydHM9ZG93bmxvYWRlcjsiLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cblxuLyogdG9kbyAsIG9wdGlvbmFsIGtkYiAqL1xuXG52YXIgSHRtbEZTPXJlcXVpcmUoXCIuL2h0bWxmc1wiKTtcbnZhciBodG1sNWZzPXJlcXVpcmUoXCIuL2h0bWw1ZnNcIik7XG52YXIgQ2hlY2tCcm93c2VyPXJlcXVpcmUoXCIuL2NoZWNrYnJvd3NlclwiKTtcbnZhciBFPVJlYWN0LmNyZWF0ZUVsZW1lbnQ7XG4gIFxuXG52YXIgRmlsZUxpc3QgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cdGdldEluaXRpYWxTdGF0ZTpmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4ge2Rvd25sb2FkaW5nOmZhbHNlLHByb2dyZXNzOjB9O1xuXHR9LFxuXHR1cGRhdGFibGU6ZnVuY3Rpb24oZikge1xuICAgICAgICB2YXIgY2xhc3Nlcz1cImJ0biBidG4td2FybmluZ1wiO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5kb3dubG9hZGluZykgY2xhc3Nlcys9XCIgZGlzYWJsZWRcIjtcblx0XHRpZiAoZi5oYXNVcGRhdGUpIHJldHVybiAgIEUoXCJidXR0b25cIiwge2NsYXNzTmFtZTogY2xhc3NlcywgXG5cdFx0XHRcImRhdGEtZmlsZW5hbWVcIjogZi5maWxlbmFtZSwgXCJkYXRhLXVybFwiOiBmLnVybCwgXG5cdCAgICAgICAgICAgIG9uQ2xpY2s6IHRoaXMuZG93bmxvYWRcblx0ICAgICAgIH0sIFwiVXBkYXRlXCIpXG5cdFx0ZWxzZSByZXR1cm4gbnVsbDtcblx0fSxcblx0c2hvd0xvY2FsOmZ1bmN0aW9uKGYpIHtcbiAgICAgICAgdmFyIGNsYXNzZXM9XCJidG4gYnRuLWRhbmdlclwiO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5kb3dubG9hZGluZykgY2xhc3Nlcys9XCIgZGlzYWJsZWRcIjtcblx0ICByZXR1cm4gRShcInRyXCIsIG51bGwsIEUoXCJ0ZFwiLCBudWxsLCBmLmZpbGVuYW1lKSwgXG5cdCAgICAgIEUoXCJ0ZFwiLCBudWxsKSwgXG5cdCAgICAgIEUoXCJ0ZFwiLCB7Y2xhc3NOYW1lOiBcInB1bGwtcmlnaHRcIn0sIFxuXHQgICAgICB0aGlzLnVwZGF0YWJsZShmKSwgRShcImJ1dHRvblwiLCB7Y2xhc3NOYW1lOiBjbGFzc2VzLCBcblx0ICAgICAgICAgICAgICAgb25DbGljazogdGhpcy5kZWxldGVGaWxlLCBcImRhdGEtZmlsZW5hbWVcIjogZi5maWxlbmFtZX0sIFwiRGVsZXRlXCIpXG5cdCAgICAgICAgXG5cdCAgICAgIClcblx0ICApXG5cdH0sICBcblx0c2hvd1JlbW90ZTpmdW5jdGlvbihmKSB7IFxuXHQgIHZhciBjbGFzc2VzPVwiYnRuIGJ0bi13YXJuaW5nXCI7XG5cdCAgaWYgKHRoaXMuc3RhdGUuZG93bmxvYWRpbmcpIGNsYXNzZXMrPVwiIGRpc2FibGVkXCI7XG5cdCAgcmV0dXJuIChFKFwidHJcIiwge1wiZGF0YS1pZFwiOiBmLmZpbGVuYW1lfSwgRShcInRkXCIsIG51bGwsIFxuXHQgICAgICBmLmZpbGVuYW1lKSwgXG5cdCAgICAgIEUoXCJ0ZFwiLCBudWxsLCBmLmRlc2MpLCBcblx0ICAgICAgRShcInRkXCIsIG51bGwsIFxuXHQgICAgICBFKFwic3BhblwiLCB7XCJkYXRhLWZpbGVuYW1lXCI6IGYuZmlsZW5hbWUsIFwiZGF0YS11cmxcIjogZi51cmwsIFxuXHQgICAgICAgICAgICBjbGFzc05hbWU6IGNsYXNzZXMsIFxuXHQgICAgICAgICAgICBvbkNsaWNrOiB0aGlzLmRvd25sb2FkfSwgXCJEb3dubG9hZFwiKVxuXHQgICAgICApXG5cdCAgKSk7XG5cdH0sXG5cdHNob3dGaWxlOmZ1bmN0aW9uKGYpIHtcblx0Ly9cdHJldHVybiA8c3BhbiBkYXRhLWlkPXtmLmZpbGVuYW1lfT57Zi51cmx9PC9zcGFuPlxuXHRcdHJldHVybiAoZi5yZWFkeSk/dGhpcy5zaG93TG9jYWwoZik6dGhpcy5zaG93UmVtb3RlKGYpO1xuXHR9LFxuXHRyZWxvYWREaXI6ZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5wcm9wcy5hY3Rpb24oXCJyZWxvYWRcIik7XG5cdH0sXG5cdGRvd25sb2FkOmZ1bmN0aW9uKGUpIHtcblx0XHR2YXIgdXJsPWUudGFyZ2V0LmRhdGFzZXRbXCJ1cmxcIl07XG5cdFx0dmFyIGZpbGVuYW1lPWUudGFyZ2V0LmRhdGFzZXRbXCJmaWxlbmFtZVwiXTtcblx0XHR0aGlzLnNldFN0YXRlKHtkb3dubG9hZGluZzp0cnVlLHByb2dyZXNzOjAsdXJsOnVybH0pO1xuXHRcdHRoaXMudXNlcmJyZWFrPWZhbHNlO1xuXHRcdGh0bWw1ZnMuZG93bmxvYWQodXJsLGZpbGVuYW1lLGZ1bmN0aW9uKCl7XG5cdFx0XHR0aGlzLnJlbG9hZERpcigpO1xuXHRcdFx0dGhpcy5zZXRTdGF0ZSh7ZG93bmxvYWRpbmc6ZmFsc2UscHJvZ3Jlc3M6MX0pO1xuXHRcdFx0fSxmdW5jdGlvbihwcm9ncmVzcyx0b3RhbCl7XG5cdFx0XHRcdGlmIChwcm9ncmVzcz09MCkge1xuXHRcdFx0XHRcdHRoaXMuc2V0U3RhdGUoe21lc3NhZ2U6XCJ0b3RhbCBcIit0b3RhbH0pXG5cdFx0XHQgXHR9XG5cdFx0XHQgXHR0aGlzLnNldFN0YXRlKHtwcm9ncmVzczpwcm9ncmVzc30pO1xuXHRcdFx0IFx0Ly9pZiB1c2VyIHByZXNzIGFib3J0IHJldHVybiB0cnVlXG5cdFx0XHQgXHRyZXR1cm4gdGhpcy51c2VyYnJlYWs7XG5cdFx0XHR9XG5cdFx0LHRoaXMpO1xuXHR9LFxuXHRkZWxldGVGaWxlOmZ1bmN0aW9uKCBlKSB7XG5cdFx0dmFyIGZpbGVuYW1lPWUudGFyZ2V0LmF0dHJpYnV0ZXNbXCJkYXRhLWZpbGVuYW1lXCJdLnZhbHVlO1xuXHRcdHRoaXMucHJvcHMuYWN0aW9uKFwiZGVsZXRlXCIsZmlsZW5hbWUpO1xuXHR9LFxuXHRhbGxGaWxlc1JlYWR5OmZ1bmN0aW9uKGUpIHtcblx0XHRyZXR1cm4gdGhpcy5wcm9wcy5maWxlcy5ldmVyeShmdW5jdGlvbihmKXsgcmV0dXJuIGYucmVhZHl9KTtcblx0fSxcblx0ZGlzbWlzczpmdW5jdGlvbigpIHtcblx0XHQkKHRoaXMucmVmcy5kaWFsb2cxLmdldERPTU5vZGUoKSkubW9kYWwoJ2hpZGUnKTtcblx0XHR0aGlzLnByb3BzLmFjdGlvbihcImRpc21pc3NcIik7XG5cdH0sXG5cdGFib3J0ZG93bmxvYWQ6ZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy51c2VyYnJlYWs9dHJ1ZTtcblx0fSxcblx0c2hvd1Byb2dyZXNzOmZ1bmN0aW9uKCkge1xuXHQgICAgIGlmICh0aGlzLnN0YXRlLmRvd25sb2FkaW5nKSB7XG5cdCAgICAgIHZhciBwcm9ncmVzcz1NYXRoLnJvdW5kKHRoaXMuc3RhdGUucHJvZ3Jlc3MqMTAwKTtcblx0ICAgICAgcmV0dXJuIChcblx0ICAgICAgXHRFKFwiZGl2XCIsIG51bGwsIFxuXHQgICAgICBcdFwiRG93bmxvYWRpbmcgZnJvbSBcIiwgdGhpcy5zdGF0ZS51cmwsIFxuXHQgICAgICBFKFwiZGl2XCIsIHtrZXk6IFwicHJvZ3Jlc3NcIiwgY2xhc3NOYW1lOiBcInByb2dyZXNzIGNvbC1tZC04XCJ9LCBcblx0ICAgICAgICAgIEUoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJwcm9ncmVzcy1iYXJcIiwgcm9sZTogXCJwcm9ncmVzc2JhclwiLCBcblx0ICAgICAgICAgICAgICBcImFyaWEtdmFsdWVub3dcIjogcHJvZ3Jlc3MsIFwiYXJpYS12YWx1ZW1pblwiOiBcIjBcIiwgXG5cdCAgICAgICAgICAgICAgXCJhcmlhLXZhbHVlbWF4XCI6IFwiMTAwXCIsIHN0eWxlOiB7d2lkdGg6IHByb2dyZXNzK1wiJVwifX0sIFxuXHQgICAgICAgICAgICBwcm9ncmVzcywgXCIlXCJcblx0ICAgICAgICAgIClcblx0ICAgICAgICApLCBcblx0ICAgICAgICBFKFwiYnV0dG9uXCIsIHtvbkNsaWNrOiB0aGlzLmFib3J0ZG93bmxvYWQsIFxuXHQgICAgICAgIFx0Y2xhc3NOYW1lOiBcImJ0biBidG4tZGFuZ2VyIGNvbC1tZC00XCJ9LCBcIkFib3J0XCIpXG5cdCAgICAgICAgKVxuXHQgICAgICAgICk7XG5cdCAgICAgIH0gZWxzZSB7XG5cdCAgICAgIFx0XHRpZiAoIHRoaXMuYWxsRmlsZXNSZWFkeSgpICkge1xuXHQgICAgICBcdFx0XHRyZXR1cm4gRShcImJ1dHRvblwiLCB7b25DbGljazogdGhpcy5kaXNtaXNzLCBjbGFzc05hbWU6IFwiYnRuIGJ0bi1zdWNjZXNzXCJ9LCBcIk9rXCIpXG5cdCAgICAgIFx0XHR9IGVsc2UgcmV0dXJuIG51bGw7XG5cdCAgICAgIFx0XHRcblx0ICAgICAgfVxuXHR9LFxuXHRzaG93VXNhZ2U6ZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHBlcmNlbnQ9dGhpcy5wcm9wcy5yZW1haW5QZXJjZW50O1xuICAgICAgICAgICByZXR1cm4gKEUoXCJkaXZcIiwgbnVsbCwgRShcInNwYW5cIiwge2NsYXNzTmFtZTogXCJwdWxsLWxlZnRcIn0sIFwiVXNhZ2U6XCIpLCBFKFwiZGl2XCIsIHtjbGFzc05hbWU6IFwicHJvZ3Jlc3NcIn0sIFxuXHRcdCAgRShcImRpdlwiLCB7Y2xhc3NOYW1lOiBcInByb2dyZXNzLWJhciBwcm9ncmVzcy1iYXItc3VjY2VzcyBwcm9ncmVzcy1iYXItc3RyaXBlZFwiLCByb2xlOiBcInByb2dyZXNzYmFyXCIsIHN0eWxlOiB7d2lkdGg6IHBlcmNlbnQrXCIlXCJ9fSwgXG5cdFx0ICAgIFx0cGVyY2VudCtcIiVcIlxuXHRcdCAgKVxuXHRcdCkpKTtcblx0fSxcblx0cmVuZGVyOmZ1bmN0aW9uKCkge1xuXHQgIFx0cmV0dXJuIChcblx0XHRFKFwiZGl2XCIsIHtyZWY6IFwiZGlhbG9nMVwiLCBjbGFzc05hbWU6IFwibW9kYWwgZmFkZVwiLCBcImRhdGEtYmFja2Ryb3BcIjogXCJzdGF0aWNcIn0sIFxuXHRcdCAgICBFKFwiZGl2XCIsIHtjbGFzc05hbWU6IFwibW9kYWwtZGlhbG9nXCJ9LCBcblx0XHQgICAgICBFKFwiZGl2XCIsIHtjbGFzc05hbWU6IFwibW9kYWwtY29udGVudFwifSwgXG5cdFx0ICAgICAgICBFKFwiZGl2XCIsIHtjbGFzc05hbWU6IFwibW9kYWwtaGVhZGVyXCJ9LCBcblx0XHQgICAgICAgICAgRShcImg0XCIsIHtjbGFzc05hbWU6IFwibW9kYWwtdGl0bGVcIn0sIFwiRmlsZSBJbnN0YWxsZXJcIilcblx0XHQgICAgICAgICksIFxuXHRcdCAgICAgICAgRShcImRpdlwiLCB7Y2xhc3NOYW1lOiBcIm1vZGFsLWJvZHlcIn0sIFxuXHRcdCAgICAgICAgXHRFKFwidGFibGVcIiwge2NsYXNzTmFtZTogXCJ0YWJsZVwifSwgXG5cdFx0ICAgICAgICBcdEUoXCJ0Ym9keVwiLCBudWxsLCBcblx0XHQgICAgICAgICAgXHR0aGlzLnByb3BzLmZpbGVzLm1hcCh0aGlzLnNob3dGaWxlKVxuXHRcdCAgICAgICAgICBcdClcblx0XHQgICAgICAgICAgKVxuXHRcdCAgICAgICAgKSwgXG5cdFx0ICAgICAgICBFKFwiZGl2XCIsIHtjbGFzc05hbWU6IFwibW9kYWwtZm9vdGVyXCJ9LCBcblx0XHQgICAgICAgIFx0dGhpcy5zaG93VXNhZ2UoKSwgXG5cdFx0ICAgICAgICAgICB0aGlzLnNob3dQcm9ncmVzcygpXG5cdFx0ICAgICAgICApXG5cdFx0ICAgICAgKVxuXHRcdCAgICApXG5cdFx0ICApXG5cdFx0KTtcblx0fSxcdFxuXHRjb21wb25lbnREaWRNb3VudDpmdW5jdGlvbigpIHtcblx0XHQkKHRoaXMucmVmcy5kaWFsb2cxLmdldERPTU5vZGUoKSkubW9kYWwoJ3Nob3cnKTtcblx0fVxufSk7XG4vKlRPRE8ga2RiIGNoZWNrIHZlcnNpb24qL1xudmFyIEZpbGVtYW5hZ2VyID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRnZXRJbml0aWFsU3RhdGU6ZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHF1b3RhPXRoaXMuZ2V0UXVvdGEoKTtcblx0XHRyZXR1cm4ge2Jyb3dzZXJSZWFkeTpmYWxzZSxub3VwZGF0ZTp0cnVlLFx0cmVxdWVzdFF1b3RhOnF1b3RhLHJlbWFpbjowfTtcblx0fSxcblx0Z2V0UXVvdGE6ZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHE9dGhpcy5wcm9wcy5xdW90YXx8XCIxMjhNXCI7XG5cdFx0dmFyIHVuaXQ9cVtxLmxlbmd0aC0xXTtcblx0XHR2YXIgdGltZXM9MTtcblx0XHRpZiAodW5pdD09XCJNXCIpIHRpbWVzPTEwMjQqMTAyNDtcblx0XHRlbHNlIGlmICh1bml0PVwiS1wiKSB0aW1lcz0xMDI0O1xuXHRcdHJldHVybiBwYXJzZUludChxKSAqIHRpbWVzO1xuXHR9LFxuXHRtaXNzaW5nS2RiOmZ1bmN0aW9uKCkge1xuXHRcdGlmIChrc2FuYWdhcC5wbGF0Zm9ybSE9XCJjaHJvbWVcIikgcmV0dXJuIFtdO1xuXHRcdHZhciBtaXNzaW5nPXRoaXMucHJvcHMubmVlZGVkLmZpbHRlcihmdW5jdGlvbihrZGIpe1xuXHRcdFx0Zm9yICh2YXIgaSBpbiBodG1sNWZzLmZpbGVzKSB7XG5cdFx0XHRcdGlmIChodG1sNWZzLmZpbGVzW2ldWzBdPT1rZGIuZmlsZW5hbWUpIHJldHVybiBmYWxzZTtcblx0XHRcdH1cblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH0sdGhpcyk7XG5cdFx0cmV0dXJuIG1pc3Npbmc7XG5cdH0sXG5cdGdldFJlbW90ZVVybDpmdW5jdGlvbihmbikge1xuXHRcdHZhciBmPXRoaXMucHJvcHMubmVlZGVkLmZpbHRlcihmdW5jdGlvbihmKXtyZXR1cm4gZi5maWxlbmFtZT09Zm59KTtcblx0XHRpZiAoZi5sZW5ndGggKSByZXR1cm4gZlswXS51cmw7XG5cdH0sXG5cdGdlbkZpbGVMaXN0OmZ1bmN0aW9uKGV4aXN0aW5nLG1pc3Npbmcpe1xuXHRcdHZhciBvdXQ9W107XG5cdFx0Zm9yICh2YXIgaSBpbiBleGlzdGluZykge1xuXHRcdFx0dmFyIHVybD10aGlzLmdldFJlbW90ZVVybChleGlzdGluZ1tpXVswXSk7XG5cdFx0XHRvdXQucHVzaCh7ZmlsZW5hbWU6ZXhpc3RpbmdbaV1bMF0sIHVybCA6dXJsLCByZWFkeTp0cnVlIH0pO1xuXHRcdH1cblx0XHRmb3IgKHZhciBpIGluIG1pc3NpbmcpIHtcblx0XHRcdG91dC5wdXNoKG1pc3NpbmdbaV0pO1xuXHRcdH1cblx0XHRyZXR1cm4gb3V0O1xuXHR9LFxuXHRyZWxvYWQ6ZnVuY3Rpb24oKSB7XG5cdFx0aHRtbDVmcy5yZWFkZGlyKGZ1bmN0aW9uKGZpbGVzKXtcbiAgXHRcdFx0dGhpcy5zZXRTdGF0ZSh7ZmlsZXM6dGhpcy5nZW5GaWxlTGlzdChmaWxlcyx0aGlzLm1pc3NpbmdLZGIoKSl9KTtcbiAgXHRcdH0sdGhpcyk7XG5cdCB9LFxuXHRkZWxldGVGaWxlOmZ1bmN0aW9uKGZuKSB7XG5cdCAgaHRtbDVmcy5ybShmbixmdW5jdGlvbigpe1xuXHQgIFx0dGhpcy5yZWxvYWQoKTtcblx0ICB9LHRoaXMpO1xuXHR9LFxuXHRvblF1b3RlT2s6ZnVuY3Rpb24ocXVvdGEsdXNhZ2UpIHtcblx0XHRpZiAoa3NhbmFnYXAucGxhdGZvcm0hPVwiY2hyb21lXCIpIHtcblx0XHRcdC8vY29uc29sZS5sb2coXCJvbnF1b3Rlb2tcIik7XG5cdFx0XHR0aGlzLnNldFN0YXRlKHtub3VwZGF0ZTp0cnVlLG1pc3Npbmc6W10sZmlsZXM6W10sYXV0b2Nsb3NlOnRydWVcblx0XHRcdFx0LHF1b3RhOnF1b3RhLHJlbWFpbjpxdW90YS11c2FnZSx1c2FnZTp1c2FnZX0pO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHQvL2NvbnNvbGUubG9nKFwicXVvdGUgb2tcIik7XG5cdFx0dmFyIGZpbGVzPXRoaXMuZ2VuRmlsZUxpc3QoaHRtbDVmcy5maWxlcyx0aGlzLm1pc3NpbmdLZGIoKSk7XG5cdFx0dmFyIHRoYXQ9dGhpcztcblx0XHR0aGF0LmNoZWNrSWZVcGRhdGUoZmlsZXMsZnVuY3Rpb24oaGFzdXBkYXRlKSB7XG5cdFx0XHR2YXIgbWlzc2luZz10aGlzLm1pc3NpbmdLZGIoKTtcblx0XHRcdHZhciBhdXRvY2xvc2U9dGhpcy5wcm9wcy5hdXRvY2xvc2U7XG5cdFx0XHRpZiAobWlzc2luZy5sZW5ndGgpIGF1dG9jbG9zZT1mYWxzZTtcblx0XHRcdHRoYXQuc2V0U3RhdGUoe2F1dG9jbG9zZTphdXRvY2xvc2UsXG5cdFx0XHRcdHF1b3RhOnF1b3RhLHVzYWdlOnVzYWdlLGZpbGVzOmZpbGVzLFxuXHRcdFx0XHRtaXNzaW5nOm1pc3NpbmcsXG5cdFx0XHRcdG5vdXBkYXRlOiFoYXN1cGRhdGUsXG5cdFx0XHRcdHJlbWFpbjpxdW90YS11c2FnZX0pO1xuXHRcdH0pO1xuXHR9LCAgXG5cdG9uQnJvd3Nlck9rOmZ1bmN0aW9uKCkge1xuXHQgIHRoaXMudG90YWxEb3dubG9hZFNpemUoKTtcblx0fSwgXG5cdGRpc21pc3M6ZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5wcm9wcy5vblJlYWR5KHRoaXMuc3RhdGUudXNhZ2UsdGhpcy5zdGF0ZS5xdW90YSk7XG5cdFx0c2V0VGltZW91dChmdW5jdGlvbigpe1xuXHRcdFx0dmFyIG1vZGFsaW49JChcIi5tb2RhbC5pblwiKTtcblx0XHRcdGlmIChtb2RhbGluLm1vZGFsKSBtb2RhbGluLm1vZGFsKCdoaWRlJyk7XG5cdFx0fSw1MDApO1xuXHR9LCBcblx0dG90YWxEb3dubG9hZFNpemU6ZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGZpbGVzPXRoaXMubWlzc2luZ0tkYigpO1xuXHRcdHZhciB0YXNrcXVldWU9W10sdG90YWxzaXplPTA7XG5cdFx0Zm9yICh2YXIgaT0wO2k8ZmlsZXMubGVuZ3RoO2krKykge1xuXHRcdFx0dGFza3F1ZXVlLnB1c2goXG5cdFx0XHRcdChmdW5jdGlvbihpZHgpe1xuXHRcdFx0XHRcdHJldHVybiAoZnVuY3Rpb24oZGF0YSl7XG5cdFx0XHRcdFx0XHRpZiAoISh0eXBlb2YgZGF0YT09J29iamVjdCcgJiYgZGF0YS5fX2VtcHR5KSkgdG90YWxzaXplKz1kYXRhO1xuXHRcdFx0XHRcdFx0aHRtbDVmcy5nZXREb3dubG9hZFNpemUoZmlsZXNbaWR4XS51cmwsdGFza3F1ZXVlLnNoaWZ0KCkpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9KShpKVxuXHRcdFx0KTtcblx0XHR9XG5cdFx0dmFyIHRoYXQ9dGhpcztcblx0XHR0YXNrcXVldWUucHVzaChmdW5jdGlvbihkYXRhKXtcdFxuXHRcdFx0dG90YWxzaXplKz1kYXRhO1xuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpe3RoYXQuc2V0U3RhdGUoe3JlcXVpcmVTcGFjZTp0b3RhbHNpemUsYnJvd3NlclJlYWR5OnRydWV9KX0sMCk7XG5cdFx0fSk7XG5cdFx0dGFza3F1ZXVlLnNoaWZ0KCkoe19fZW1wdHk6dHJ1ZX0pO1xuXHR9LFxuXHRjaGVja0lmVXBkYXRlOmZ1bmN0aW9uKGZpbGVzLGNiKSB7XG5cdFx0dmFyIHRhc2txdWV1ZT1bXTtcblx0XHRmb3IgKHZhciBpPTA7aTxmaWxlcy5sZW5ndGg7aSsrKSB7XG5cdFx0XHR0YXNrcXVldWUucHVzaChcblx0XHRcdFx0KGZ1bmN0aW9uKGlkeCl7XG5cdFx0XHRcdFx0cmV0dXJuIChmdW5jdGlvbihkYXRhKXtcblx0XHRcdFx0XHRcdGlmICghKHR5cGVvZiBkYXRhPT0nb2JqZWN0JyAmJiBkYXRhLl9fZW1wdHkpKSBmaWxlc1tpZHgtMV0uaGFzVXBkYXRlPWRhdGE7XG5cdFx0XHRcdFx0XHRodG1sNWZzLmNoZWNrVXBkYXRlKGZpbGVzW2lkeF0udXJsLGZpbGVzW2lkeF0uZmlsZW5hbWUsdGFza3F1ZXVlLnNoaWZ0KCkpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9KShpKVxuXHRcdFx0KTtcblx0XHR9XG5cdFx0dmFyIHRoYXQ9dGhpcztcblx0XHR0YXNrcXVldWUucHVzaChmdW5jdGlvbihkYXRhKXtcdFxuXHRcdFx0ZmlsZXNbZmlsZXMubGVuZ3RoLTFdLmhhc1VwZGF0ZT1kYXRhO1xuXHRcdFx0dmFyIGhhc3VwZGF0ZT1maWxlcy5zb21lKGZ1bmN0aW9uKGYpe3JldHVybiBmLmhhc1VwZGF0ZX0pO1xuXHRcdFx0aWYgKGNiKSBjYi5hcHBseSh0aGF0LFtoYXN1cGRhdGVdKTtcblx0XHR9KTtcblx0XHR0YXNrcXVldWUuc2hpZnQoKSh7X19lbXB0eTp0cnVlfSk7XG5cdH0sXG5cdHJlbmRlcjpmdW5jdGlvbigpe1xuICAgIFx0XHRpZiAoIXRoaXMuc3RhdGUuYnJvd3NlclJlYWR5KSB7ICAgXG4gICAgICBcdFx0XHRyZXR1cm4gRShDaGVja0Jyb3dzZXIsIHtmZWF0dXJlOiBcImZzXCIsIG9uUmVhZHk6IHRoaXMub25Ccm93c2VyT2t9KVxuICAgIFx0XHR9IGlmICghdGhpcy5zdGF0ZS5xdW90YSB8fCB0aGlzLnN0YXRlLnJlbWFpbjx0aGlzLnN0YXRlLnJlcXVpcmVTcGFjZSkgeyAgXG4gICAgXHRcdFx0dmFyIHF1b3RhPXRoaXMuc3RhdGUucmVxdWVzdFF1b3RhO1xuICAgIFx0XHRcdGlmICh0aGlzLnN0YXRlLnVzYWdlK3RoaXMuc3RhdGUucmVxdWlyZVNwYWNlPnF1b3RhKSB7XG4gICAgXHRcdFx0XHRxdW90YT0odGhpcy5zdGF0ZS51c2FnZSt0aGlzLnN0YXRlLnJlcXVpcmVTcGFjZSkqMS41O1xuICAgIFx0XHRcdH1cbiAgICAgIFx0XHRcdHJldHVybiBFKEh0bWxGUywge3F1b3RhOiBxdW90YSwgYXV0b2Nsb3NlOiBcInRydWVcIiwgb25SZWFkeTogdGhpcy5vblF1b3RlT2t9KVxuICAgICAgXHRcdH0gZWxzZSB7XG5cdFx0XHRpZiAoIXRoaXMuc3RhdGUubm91cGRhdGUgfHwgdGhpcy5taXNzaW5nS2RiKCkubGVuZ3RoIHx8ICF0aGlzLnN0YXRlLmF1dG9jbG9zZSkge1xuXHRcdFx0XHR2YXIgcmVtYWluPU1hdGgucm91bmQoKHRoaXMuc3RhdGUudXNhZ2UvdGhpcy5zdGF0ZS5xdW90YSkqMTAwKTtcdFx0XHRcdFxuXHRcdFx0XHRyZXR1cm4gRShGaWxlTGlzdCwge2FjdGlvbjogdGhpcy5hY3Rpb24sIGZpbGVzOiB0aGlzLnN0YXRlLmZpbGVzLCByZW1haW5QZXJjZW50OiByZW1haW59KVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0c2V0VGltZW91dCggdGhpcy5kaXNtaXNzICwwKTtcblx0XHRcdFx0cmV0dXJuIEUoXCJzcGFuXCIsIG51bGwsIFwiU3VjY2Vzc1wiKTtcblx0XHRcdH1cbiAgICAgIFx0XHR9XG5cdH0sXG5cdGFjdGlvbjpmdW5jdGlvbigpIHtcblx0ICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XG5cdCAgdmFyIHR5cGU9YXJncy5zaGlmdCgpO1xuXHQgIHZhciByZXM9bnVsbCwgdGhhdD10aGlzO1xuXHQgIGlmICh0eXBlPT1cImRlbGV0ZVwiKSB7XG5cdCAgICB0aGlzLmRlbGV0ZUZpbGUoYXJnc1swXSk7XG5cdCAgfSAgZWxzZSBpZiAodHlwZT09XCJyZWxvYWRcIikge1xuXHQgIFx0dGhpcy5yZWxvYWQoKTtcblx0ICB9IGVsc2UgaWYgKHR5cGU9PVwiZGlzbWlzc1wiKSB7XG5cdCAgXHR0aGlzLmRpc21pc3MoKTtcblx0ICB9XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cz1GaWxlbWFuYWdlcjsiLCIvKiBlbXVsYXRlIGZpbGVzeXN0ZW0gb24gaHRtbDUgYnJvd3NlciAqL1xudmFyIGdldF9oZWFkPWZ1bmN0aW9uKHVybCxmaWVsZCxjYil7XG5cdHZhciB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblx0eGhyLm9wZW4oXCJIRUFEXCIsIHVybCwgdHJ1ZSk7XG5cdHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpIHtcblx0XHRcdGlmICh0aGlzLnJlYWR5U3RhdGUgPT0gdGhpcy5ET05FKSB7XG5cdFx0XHRcdGNiKHhoci5nZXRSZXNwb25zZUhlYWRlcihmaWVsZCkpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0aWYgKHRoaXMuc3RhdHVzIT09MjAwJiZ0aGlzLnN0YXR1cyE9PTIwNikge1xuXHRcdFx0XHRcdGNiKFwiXCIpO1xuXHRcdFx0XHR9XG5cdFx0XHR9IFxuXHR9O1xuXHR4aHIuc2VuZCgpO1x0XG59XG52YXIgZ2V0X2RhdGU9ZnVuY3Rpb24odXJsLGNiKSB7XG5cdGdldF9oZWFkKHVybCxcIkxhc3QtTW9kaWZpZWRcIixmdW5jdGlvbih2YWx1ZSl7XG5cdFx0Y2IodmFsdWUpO1xuXHR9KTtcbn1cbnZhciBnZXRfc2l6ZT1mdW5jdGlvbih1cmwsIGNiKSB7XG5cdGdldF9oZWFkKHVybCxcIkNvbnRlbnQtTGVuZ3RoXCIsZnVuY3Rpb24odmFsdWUpe1xuXHRcdGNiKHBhcnNlSW50KHZhbHVlKSk7XG5cdH0pO1xufTtcbnZhciBjaGVja1VwZGF0ZT1mdW5jdGlvbih1cmwsZm4sY2IpIHtcblx0aWYgKCF1cmwpIHtcblx0XHRjYihmYWxzZSk7XG5cdFx0cmV0dXJuO1xuXHR9XG5cdGdldF9kYXRlKHVybCxmdW5jdGlvbihkKXtcblx0XHRBUEkuZnMucm9vdC5nZXRGaWxlKGZuLCB7Y3JlYXRlOiBmYWxzZSwgZXhjbHVzaXZlOiBmYWxzZX0sIGZ1bmN0aW9uKGZpbGVFbnRyeSkge1xuXHRcdFx0ZmlsZUVudHJ5LmdldE1ldGFkYXRhKGZ1bmN0aW9uKG1ldGFkYXRhKXtcblx0XHRcdFx0dmFyIGxvY2FsRGF0ZT1EYXRlLnBhcnNlKG1ldGFkYXRhLm1vZGlmaWNhdGlvblRpbWUpO1xuXHRcdFx0XHR2YXIgdXJsRGF0ZT1EYXRlLnBhcnNlKGQpO1xuXHRcdFx0XHRjYih1cmxEYXRlPmxvY2FsRGF0ZSk7XG5cdFx0XHR9KTtcblx0XHR9LGZ1bmN0aW9uKCl7XG5cdFx0XHRjYihmYWxzZSk7XG5cdFx0fSk7XG5cdH0pO1xufVxudmFyIGRvd25sb2FkPWZ1bmN0aW9uKHVybCxmbixjYixzdGF0dXNjYixjb250ZXh0KSB7XG5cdCB2YXIgdG90YWxzaXplPTAsYmF0Y2hlcz1udWxsLHdyaXR0ZW49MDtcblx0IHZhciBmaWxlRW50cnk9MCwgZmlsZVdyaXRlcj0wO1xuXHQgdmFyIGNyZWF0ZUJhdGNoZXM9ZnVuY3Rpb24oc2l6ZSkge1xuXHRcdHZhciBieXRlcz0xMDI0KjEwMjQsIG91dD1bXTtcblx0XHR2YXIgYj1NYXRoLmZsb29yKHNpemUgLyBieXRlcyk7XG5cdFx0dmFyIGxhc3Q9c2l6ZSAlYnl0ZXM7XG5cdFx0Zm9yICh2YXIgaT0wO2k8PWI7aSsrKSB7XG5cdFx0XHRvdXQucHVzaChpKmJ5dGVzKTtcblx0XHR9XG5cdFx0b3V0LnB1c2goYipieXRlcytsYXN0KTtcblx0XHRyZXR1cm4gb3V0O1xuXHQgfVxuXHQgdmFyIGZpbmlzaD1mdW5jdGlvbigpIHtcblx0XHQgcm0oZm4sZnVuY3Rpb24oKXtcblx0XHRcdFx0ZmlsZUVudHJ5Lm1vdmVUbyhmaWxlRW50cnkuZmlsZXN5c3RlbS5yb290LCBmbixmdW5jdGlvbigpe1xuXHRcdFx0XHRcdHNldFRpbWVvdXQoIGNiLmJpbmQoY29udGV4dCxmYWxzZSkgLCAwKSA7IFxuXHRcdFx0XHR9LGZ1bmN0aW9uKGUpe1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKFwiZmFpbGVkXCIsZSlcblx0XHRcdFx0fSk7XG5cdFx0IH0sdGhpcyk7IFxuXHQgfTtcblx0XHR2YXIgdGVtcGZuPVwidGVtcC5rZGJcIjtcblx0XHR2YXIgYmF0Y2g9ZnVuY3Rpb24oYikge1xuXHRcdHZhciBhYm9ydD1mYWxzZTtcblx0XHR2YXIgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cdFx0dmFyIHJlcXVlc3R1cmw9dXJsK1wiP1wiK01hdGgucmFuZG9tKCk7XG5cdFx0eGhyLm9wZW4oJ2dldCcsIHJlcXVlc3R1cmwsIHRydWUpO1xuXHRcdHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdSYW5nZScsICdieXRlcz0nK2JhdGNoZXNbYl0rJy0nKyhiYXRjaGVzW2IrMV0tMSkpO1xuXHRcdHhoci5yZXNwb25zZVR5cGUgPSAnYmxvYic7ICAgIFxuXHRcdHhoci5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgYmxvYj10aGlzLnJlc3BvbnNlO1xuXHRcdFx0ZmlsZUVudHJ5LmNyZWF0ZVdyaXRlcihmdW5jdGlvbihmaWxlV3JpdGVyKSB7XG5cdFx0XHRcdGZpbGVXcml0ZXIuc2VlayhmaWxlV3JpdGVyLmxlbmd0aCk7XG5cdFx0XHRcdGZpbGVXcml0ZXIud3JpdGUoYmxvYik7XG5cdFx0XHRcdHdyaXR0ZW4rPWJsb2Iuc2l6ZTtcblx0XHRcdFx0ZmlsZVdyaXRlci5vbndyaXRlZW5kID0gZnVuY3Rpb24oZSkge1xuXHRcdFx0XHRcdGlmIChzdGF0dXNjYikge1xuXHRcdFx0XHRcdFx0YWJvcnQ9c3RhdHVzY2IuYXBwbHkoY29udGV4dCxbIGZpbGVXcml0ZXIubGVuZ3RoIC8gdG90YWxzaXplLHRvdGFsc2l6ZSBdKTtcblx0XHRcdFx0XHRcdGlmIChhYm9ydCkgc2V0VGltZW91dCggY2IuYmluZChjb250ZXh0LGZhbHNlKSAsIDApIDtcblx0XHRcdFx0IFx0fVxuXHRcdFx0XHRcdGIrKztcblx0XHRcdFx0XHRpZiAoIWFib3J0KSB7XG5cdFx0XHRcdFx0XHRpZiAoYjxiYXRjaGVzLmxlbmd0aC0xKSBzZXRUaW1lb3V0KGJhdGNoLmJpbmQoY29udGV4dCxiKSwwKTtcblx0XHRcdFx0XHRcdGVsc2UgICAgICAgICAgICAgICAgICAgIGZpbmlzaCgpO1xuXHRcdFx0XHQgXHR9XG5cdFx0XHQgXHR9O1xuXHRcdFx0fSwgY29uc29sZS5lcnJvcik7XG5cdFx0fSxmYWxzZSk7XG5cdFx0eGhyLnNlbmQoKTtcblx0fVxuXG5cdGdldF9zaXplKHVybCxmdW5jdGlvbihzaXplKXtcblx0XHR0b3RhbHNpemU9c2l6ZTtcblx0XHRpZiAoIXNpemUpIHtcblx0XHRcdGlmIChjYikgY2IuYXBwbHkoY29udGV4dCxbZmFsc2VdKTtcblx0XHR9IGVsc2Ugey8vcmVhZHkgdG8gZG93bmxvYWRcblx0XHRcdHJtKHRlbXBmbixmdW5jdGlvbigpe1xuXHRcdFx0XHQgYmF0Y2hlcz1jcmVhdGVCYXRjaGVzKHNpemUpO1xuXHRcdFx0XHQgaWYgKHN0YXR1c2NiKSBzdGF0dXNjYi5hcHBseShjb250ZXh0LFsgMCwgdG90YWxzaXplIF0pO1xuXHRcdFx0XHQgQVBJLmZzLnJvb3QuZ2V0RmlsZSh0ZW1wZm4sIHtjcmVhdGU6IDEsIGV4Y2x1c2l2ZTogZmFsc2V9LCBmdW5jdGlvbihfZmlsZUVudHJ5KSB7XG5cdFx0XHRcdFx0XHRcdGZpbGVFbnRyeT1fZmlsZUVudHJ5O1xuXHRcdFx0XHRcdFx0YmF0Y2goMCk7XG5cdFx0XHRcdCB9KTtcblx0XHRcdH0sdGhpcyk7XG5cdFx0fVxuXHR9KTtcbn1cblxudmFyIHJlYWRGaWxlPWZ1bmN0aW9uKGZpbGVuYW1lLGNiLGNvbnRleHQpIHtcblx0QVBJLmZzLnJvb3QuZ2V0RmlsZShmaWxlbmFtZSwgZnVuY3Rpb24oZmlsZUVudHJ5KSB7XG5cdFx0XHR2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcblx0XHRcdHJlYWRlci5vbmxvYWRlbmQgPSBmdW5jdGlvbihlKSB7XG5cdFx0XHRcdFx0aWYgKGNiKSBjYi5hcHBseShjYixbdGhpcy5yZXN1bHRdKTtcblx0XHRcdFx0fTsgICAgICAgICAgICBcblx0fSwgY29uc29sZS5lcnJvcik7XG59XG52YXIgd3JpdGVGaWxlPWZ1bmN0aW9uKGZpbGVuYW1lLGJ1ZixjYixjb250ZXh0KXtcblx0QVBJLmZzLnJvb3QuZ2V0RmlsZShmaWxlbmFtZSwge2NyZWF0ZTogdHJ1ZSwgZXhjbHVzaXZlOiB0cnVlfSwgZnVuY3Rpb24oZmlsZUVudHJ5KSB7XG5cdFx0XHRmaWxlRW50cnkuY3JlYXRlV3JpdGVyKGZ1bmN0aW9uKGZpbGVXcml0ZXIpIHtcblx0XHRcdFx0ZmlsZVdyaXRlci53cml0ZShidWYpO1xuXHRcdFx0XHRmaWxlV3JpdGVyLm9ud3JpdGVlbmQgPSBmdW5jdGlvbihlKSB7XG5cdFx0XHRcdFx0aWYgKGNiKSBjYi5hcHBseShjYixbYnVmLmJ5dGVMZW5ndGhdKTtcblx0XHRcdFx0fTsgICAgICAgICAgICBcblx0XHRcdH0sIGNvbnNvbGUuZXJyb3IpO1xuXHR9LCBjb25zb2xlLmVycm9yKTtcbn1cblxudmFyIHJlYWRkaXI9ZnVuY3Rpb24oY2IsY29udGV4dCkge1xuXHR2YXIgZGlyUmVhZGVyID0gQVBJLmZzLnJvb3QuY3JlYXRlUmVhZGVyKCk7XG5cdHZhciBvdXQ9W10sdGhhdD10aGlzO1xuXHRkaXJSZWFkZXIucmVhZEVudHJpZXMoZnVuY3Rpb24oZW50cmllcykge1xuXHRcdGlmIChlbnRyaWVzLmxlbmd0aCkge1xuXHRcdFx0Zm9yICh2YXIgaSA9IDAsIGVudHJ5OyBlbnRyeSA9IGVudHJpZXNbaV07ICsraSkge1xuXHRcdFx0XHRpZiAoZW50cnkuaXNGaWxlKSB7XG5cdFx0XHRcdFx0b3V0LnB1c2goW2VudHJ5Lm5hbWUsZW50cnkudG9VUkwgPyBlbnRyeS50b1VSTCgpIDogZW50cnkudG9VUkkoKV0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdEFQSS5maWxlcz1vdXQ7XG5cdFx0aWYgKGNiKSBjYi5hcHBseShjb250ZXh0LFtvdXRdKTtcblx0fSwgZnVuY3Rpb24oKXtcblx0XHRpZiAoY2IpIGNiLmFwcGx5KGNvbnRleHQsW251bGxdKTtcblx0fSk7XG59XG52YXIgZ2V0RmlsZVVSTD1mdW5jdGlvbihmaWxlbmFtZSkge1xuXHRpZiAoIUFQSS5maWxlcyApIHJldHVybiBudWxsO1xuXHR2YXIgZmlsZT0gQVBJLmZpbGVzLmZpbHRlcihmdW5jdGlvbihmKXtyZXR1cm4gZlswXT09ZmlsZW5hbWV9KTtcblx0aWYgKGZpbGUubGVuZ3RoKSByZXR1cm4gZmlsZVswXVsxXTtcbn1cbnZhciBybT1mdW5jdGlvbihmaWxlbmFtZSxjYixjb250ZXh0KSB7XG5cdHZhciB1cmw9Z2V0RmlsZVVSTChmaWxlbmFtZSk7XG5cdGlmICh1cmwpIHJtVVJMKHVybCxjYixjb250ZXh0KTtcblx0ZWxzZSBpZiAoY2IpIGNiLmFwcGx5KGNvbnRleHQsW2ZhbHNlXSk7XG59XG5cbnZhciBybVVSTD1mdW5jdGlvbihmaWxlbmFtZSxjYixjb250ZXh0KSB7XG5cdHdlYmtpdFJlc29sdmVMb2NhbEZpbGVTeXN0ZW1VUkwoZmlsZW5hbWUsIGZ1bmN0aW9uKGZpbGVFbnRyeSkge1xuXHRcdGZpbGVFbnRyeS5yZW1vdmUoZnVuY3Rpb24oKSB7XG5cdFx0XHRpZiAoY2IpIGNiLmFwcGx5KGNvbnRleHQsW3RydWVdKTtcblx0XHR9LCBjb25zb2xlLmVycm9yKTtcblx0fSwgIGZ1bmN0aW9uKGUpe1xuXHRcdGlmIChjYikgY2IuYXBwbHkoY29udGV4dCxbZmFsc2VdKTsvL25vIHN1Y2ggZmlsZVxuXHR9KTtcbn1cbmZ1bmN0aW9uIGVycm9ySGFuZGxlcihlKSB7XG5cdGNvbnNvbGUuZXJyb3IoJ0Vycm9yOiAnICtlLm5hbWUrIFwiIFwiK2UubWVzc2FnZSk7XG59XG52YXIgaW5pdGZzPWZ1bmN0aW9uKGdyYW50ZWRCeXRlcyxjYixjb250ZXh0KSB7XG5cdHdlYmtpdFJlcXVlc3RGaWxlU3lzdGVtKFBFUlNJU1RFTlQsIGdyYW50ZWRCeXRlcywgIGZ1bmN0aW9uKGZzKSB7XG5cdFx0QVBJLmZzPWZzO1xuXHRcdEFQSS5xdW90YT1ncmFudGVkQnl0ZXM7XG5cdFx0cmVhZGRpcihmdW5jdGlvbigpe1xuXHRcdFx0QVBJLmluaXRpYWxpemVkPXRydWU7XG5cdFx0XHRjYi5hcHBseShjb250ZXh0LFtncmFudGVkQnl0ZXMsZnNdKTtcblx0XHR9LGNvbnRleHQpO1xuXHR9LCBlcnJvckhhbmRsZXIpO1xufVxudmFyIGluaXQ9ZnVuY3Rpb24ocXVvdGEsY2IsY29udGV4dCkge1xuXHRuYXZpZ2F0b3Iud2Via2l0UGVyc2lzdGVudFN0b3JhZ2UucmVxdWVzdFF1b3RhKHF1b3RhLCBcblx0XHRcdGZ1bmN0aW9uKGdyYW50ZWRCeXRlcykge1xuXHRcdFx0XHRpbml0ZnMoZ3JhbnRlZEJ5dGVzLGNiLGNvbnRleHQpO1xuXHRcdH0sIGVycm9ySGFuZGxlclxuXHQpO1xufVxudmFyIHF1ZXJ5UXVvdGE9ZnVuY3Rpb24oY2IsY29udGV4dCkge1xuXHR2YXIgdGhhdD10aGlzO1xuXHRuYXZpZ2F0b3Iud2Via2l0UGVyc2lzdGVudFN0b3JhZ2UucXVlcnlVc2FnZUFuZFF1b3RhKCBcblx0IGZ1bmN0aW9uKHVzYWdlLHF1b3RhKXtcblx0XHRcdGluaXRmcyhxdW90YSxmdW5jdGlvbigpe1xuXHRcdFx0XHRjYi5hcHBseShjb250ZXh0LFt1c2FnZSxxdW90YV0pO1xuXHRcdFx0fSxjb250ZXh0KTtcblx0fSk7XG59XG52YXIgQVBJPXtcblx0aW5pdDppbml0XG5cdCxyZWFkZGlyOnJlYWRkaXJcblx0LGNoZWNrVXBkYXRlOmNoZWNrVXBkYXRlXG5cdCxybTpybVxuXHQscm1VUkw6cm1VUkxcblx0LGdldEZpbGVVUkw6Z2V0RmlsZVVSTFxuXHQsd3JpdGVGaWxlOndyaXRlRmlsZVxuXHQscmVhZEZpbGU6cmVhZEZpbGVcblx0LGRvd25sb2FkOmRvd25sb2FkXG5cdCxnZXRfaGVhZDpnZXRfaGVhZFxuXHQsZ2V0X2RhdGU6Z2V0X2RhdGVcblx0LGdldF9zaXplOmdldF9zaXplXG5cdCxnZXREb3dubG9hZFNpemU6Z2V0X3NpemVcblx0LHF1ZXJ5UXVvdGE6cXVlcnlRdW90YVxufVxubW9kdWxlLmV4cG9ydHM9QVBJOyIsInZhciBodG1sNWZzPXJlcXVpcmUoXCIuL2h0bWw1ZnNcIik7XG52YXIgRT1SZWFjdC5jcmVhdGVFbGVtZW50O1xuXG52YXIgaHRtbGZzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRnZXRJbml0aWFsU3RhdGU6ZnVuY3Rpb24oKSB7IFxuXHRcdHJldHVybiB7cmVhZHk6ZmFsc2UsIHF1b3RhOjAsdXNhZ2U6MCxJbml0aWFsaXplZDpmYWxzZSxhdXRvY2xvc2U6dGhpcy5wcm9wcy5hdXRvY2xvc2V9O1xuXHR9LFxuXHRpbml0RmlsZXN5c3RlbTpmdW5jdGlvbigpIHtcblx0XHR2YXIgcXVvdGE9dGhpcy5wcm9wcy5xdW90YXx8MTAyNCoxMDI0KjEyODsgLy8gZGVmYXVsdCAxMjhNQlxuXHRcdHF1b3RhPXBhcnNlSW50KHF1b3RhKTtcblx0XHRodG1sNWZzLmluaXQocXVvdGEsZnVuY3Rpb24ocSl7XG5cdFx0XHR0aGlzLmRpYWxvZz1mYWxzZTtcblx0XHRcdCQodGhpcy5yZWZzLmRpYWxvZzEuZ2V0RE9NTm9kZSgpKS5tb2RhbCgnaGlkZScpO1xuXHRcdFx0dGhpcy5zZXRTdGF0ZSh7cXVvdGE6cSxhdXRvY2xvc2U6dHJ1ZX0pO1xuXHRcdH0sdGhpcyk7XG5cdH0sXG5cdHdlbGNvbWU6ZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIChcblx0XHRFKFwiZGl2XCIsIHtyZWY6IFwiZGlhbG9nMVwiLCBjbGFzc05hbWU6IFwibW9kYWwgZmFkZVwiLCBpZDogXCJteU1vZGFsXCIsIFwiZGF0YS1iYWNrZHJvcFwiOiBcInN0YXRpY1wifSwgXG5cdFx0ICAgIEUoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJtb2RhbC1kaWFsb2dcIn0sIFxuXHRcdCAgICAgIEUoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJtb2RhbC1jb250ZW50XCJ9LCBcblx0XHQgICAgICAgIEUoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJtb2RhbC1oZWFkZXJcIn0sIFxuXHRcdCAgICAgICAgICBFKFwiaDRcIiwge2NsYXNzTmFtZTogXCJtb2RhbC10aXRsZVwifSwgXCJXZWxjb21lXCIpXG5cdFx0ICAgICAgICApLCBcblx0XHQgICAgICAgIEUoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJtb2RhbC1ib2R5XCJ9LCBcblx0XHQgICAgICAgICAgXCJCcm93c2VyIHdpbGwgYXNrIGZvciB5b3VyIGNvbmZpcm1hdGlvbi5cIlxuXHRcdCAgICAgICAgKSwgXG5cdFx0ICAgICAgICBFKFwiZGl2XCIsIHtjbGFzc05hbWU6IFwibW9kYWwtZm9vdGVyXCJ9LCBcblx0XHQgICAgICAgICAgRShcImJ1dHRvblwiLCB7b25DbGljazogdGhpcy5pbml0RmlsZXN5c3RlbSwgdHlwZTogXCJidXR0b25cIiwgXG5cdFx0ICAgICAgICAgICAgY2xhc3NOYW1lOiBcImJ0biBidG4tcHJpbWFyeVwifSwgXCJJbml0aWFsaXplIEZpbGUgU3lzdGVtXCIpXG5cdFx0ICAgICAgICApXG5cdFx0ICAgICAgKVxuXHRcdCAgICApXG5cdFx0ICApXG5cdFx0ICk7XG5cdH0sXG5cdHJlbmRlckRlZmF1bHQ6ZnVuY3Rpb24oKXtcblx0XHR2YXIgdXNlZD1NYXRoLmZsb29yKHRoaXMuc3RhdGUudXNhZ2UvdGhpcy5zdGF0ZS5xdW90YSAqMTAwKTtcblx0XHR2YXIgbW9yZT1mdW5jdGlvbigpIHtcblx0XHRcdGlmICh1c2VkPjUwKSByZXR1cm4gRShcImJ1dHRvblwiLCB7dHlwZTogXCJidXR0b25cIiwgY2xhc3NOYW1lOiBcImJ0biBidG4tcHJpbWFyeVwifSwgXCJBbGxvY2F0ZSBNb3JlXCIpO1xuXHRcdFx0ZWxzZSBudWxsO1xuXHRcdH1cblx0XHRyZXR1cm4gKFxuXHRcdEUoXCJkaXZcIiwge3JlZjogXCJkaWFsb2cxXCIsIGNsYXNzTmFtZTogXCJtb2RhbCBmYWRlXCIsIGlkOiBcIm15TW9kYWxcIiwgXCJkYXRhLWJhY2tkcm9wXCI6IFwic3RhdGljXCJ9LCBcblx0XHQgICAgRShcImRpdlwiLCB7Y2xhc3NOYW1lOiBcIm1vZGFsLWRpYWxvZ1wifSwgXG5cdFx0ICAgICAgRShcImRpdlwiLCB7Y2xhc3NOYW1lOiBcIm1vZGFsLWNvbnRlbnRcIn0sIFxuXHRcdCAgICAgICAgRShcImRpdlwiLCB7Y2xhc3NOYW1lOiBcIm1vZGFsLWhlYWRlclwifSwgXG5cdFx0ICAgICAgICAgIEUoXCJoNFwiLCB7Y2xhc3NOYW1lOiBcIm1vZGFsLXRpdGxlXCJ9LCBcIlNhbmRib3ggRmlsZSBTeXN0ZW1cIilcblx0XHQgICAgICAgICksIFxuXHRcdCAgICAgICAgRShcImRpdlwiLCB7Y2xhc3NOYW1lOiBcIm1vZGFsLWJvZHlcIn0sIFxuXHRcdCAgICAgICAgICBFKFwiZGl2XCIsIHtjbGFzc05hbWU6IFwicHJvZ3Jlc3NcIn0sIFxuXHRcdCAgICAgICAgICAgIEUoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJwcm9ncmVzcy1iYXJcIiwgcm9sZTogXCJwcm9ncmVzc2JhclwiLCBzdHlsZToge3dpZHRoOiB1c2VkK1wiJVwifX0sIFxuXHRcdCAgICAgICAgICAgICAgIHVzZWQsIFwiJVwiXG5cdFx0ICAgICAgICAgICAgKVxuXHRcdCAgICAgICAgICApLCBcblx0XHQgICAgICAgICAgRShcInNwYW5cIiwgbnVsbCwgdGhpcy5zdGF0ZS5xdW90YSwgXCIgdG90YWwgLCBcIiwgdGhpcy5zdGF0ZS51c2FnZSwgXCIgaW4gdXNlZFwiKVxuXHRcdCAgICAgICAgKSwgXG5cdFx0ICAgICAgICBFKFwiZGl2XCIsIHtjbGFzc05hbWU6IFwibW9kYWwtZm9vdGVyXCJ9LCBcblx0XHQgICAgICAgICAgRShcImJ1dHRvblwiLCB7b25DbGljazogdGhpcy5kaXNtaXNzLCB0eXBlOiBcImJ1dHRvblwiLCBjbGFzc05hbWU6IFwiYnRuIGJ0bi1kZWZhdWx0XCIsIFwiZGF0YS1kaXNtaXNzXCI6IFwibW9kYWxcIn0sIFwiQ2xvc2VcIiksIFxuXHRcdCAgICAgICAgICBtb3JlKClcblx0XHQgICAgICAgIClcblx0XHQgICAgICApXG5cdFx0ICAgIClcblx0XHQgIClcblx0XHQgICk7XG5cdH0sXG5cdGRpc21pc3M6ZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHRoYXQ9dGhpcztcblx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG5cdFx0XHR0aGF0LnByb3BzLm9uUmVhZHkodGhhdC5zdGF0ZS5xdW90YSx0aGF0LnN0YXRlLnVzYWdlKTtcdFxuXHRcdH0sMCk7XG5cdH0sXG5cdHF1ZXJ5UXVvdGE6ZnVuY3Rpb24oKSB7XG5cdFx0aWYgKGtzYW5hZ2FwLnBsYXRmb3JtPT1cImNocm9tZVwiKSB7XG5cdFx0XHRodG1sNWZzLnF1ZXJ5UXVvdGEoZnVuY3Rpb24odXNhZ2UscXVvdGEpe1xuXHRcdFx0XHR0aGlzLnNldFN0YXRlKHt1c2FnZTp1c2FnZSxxdW90YTpxdW90YSxpbml0aWFsaXplZDp0cnVlfSk7XG5cdFx0XHR9LHRoaXMpO1x0XHRcdFxuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLnNldFN0YXRlKHt1c2FnZTozMzMscXVvdGE6MTAwMCoxMDAwKjEwMjQsaW5pdGlhbGl6ZWQ6dHJ1ZSxhdXRvY2xvc2U6dHJ1ZX0pO1xuXHRcdH1cblx0fSxcblx0cmVuZGVyOmZ1bmN0aW9uKCkge1xuXHRcdHZhciB0aGF0PXRoaXM7XG5cdFx0aWYgKCF0aGlzLnN0YXRlLnF1b3RhIHx8IHRoaXMuc3RhdGUucXVvdGE8dGhpcy5wcm9wcy5xdW90YSkge1xuXHRcdFx0aWYgKHRoaXMuc3RhdGUuaW5pdGlhbGl6ZWQpIHtcblx0XHRcdFx0dGhpcy5kaWFsb2c9dHJ1ZTtcblx0XHRcdFx0cmV0dXJuIHRoaXMud2VsY29tZSgpO1x0XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gRShcInNwYW5cIiwgbnVsbCwgXCJjaGVja2luZyBxdW90YVwiKTtcblx0XHRcdH1cdFx0XHRcblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYgKCF0aGlzLnN0YXRlLmF1dG9jbG9zZSkge1xuXHRcdFx0XHR0aGlzLmRpYWxvZz10cnVlO1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5yZW5kZXJEZWZhdWx0KCk7IFxuXHRcdFx0fVxuXHRcdFx0dGhpcy5kaXNtaXNzKCk7XG5cdFx0XHR0aGlzLmRpYWxvZz1mYWxzZTtcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cblx0fSxcblx0Y29tcG9uZW50RGlkTW91bnQ6ZnVuY3Rpb24oKSB7XG5cdFx0aWYgKCF0aGlzLnN0YXRlLnF1b3RhKSB7XG5cdFx0XHR0aGlzLnF1ZXJ5UXVvdGEoKTtcblxuXHRcdH07XG5cdH0sXG5cdGNvbXBvbmVudERpZFVwZGF0ZTpmdW5jdGlvbigpIHtcblx0XHRpZiAodGhpcy5kaWFsb2cpICQodGhpcy5yZWZzLmRpYWxvZzEuZ2V0RE9NTm9kZSgpKS5tb2RhbCgnc2hvdycpO1xuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHM9aHRtbGZzOyIsInZhciBrc2FuYT17XCJwbGF0Zm9ybVwiOlwicmVtb3RlXCJ9O1xuaWYgKHR5cGVvZiB3aW5kb3chPVwidW5kZWZpbmVkXCIpIHtcblx0d2luZG93LmtzYW5hPWtzYW5hO1xuXHRpZiAodHlwZW9mIGtzYW5hZ2FwPT1cInVuZGVmaW5lZFwiKSB7XG5cdFx0d2luZG93LmtzYW5hZ2FwPXJlcXVpcmUoXCIuL2tzYW5hZ2FwXCIpOyAvL2NvbXBhdGlibGUgbGF5ZXIgd2l0aCBtb2JpbGVcblx0fVxufVxuaWYgKHR5cGVvZiBwcm9jZXNzICE9XCJ1bmRlZmluZWRcIikge1xuXHRpZiAocHJvY2Vzcy52ZXJzaW9ucyAmJiBwcm9jZXNzLnZlcnNpb25zW1wibm9kZS13ZWJraXRcIl0pIHtcbiAgXHRcdGlmICh0eXBlb2Ygbm9kZVJlcXVpcmUhPVwidW5kZWZpbmVkXCIpIGtzYW5hLnJlcXVpcmU9bm9kZVJlcXVpcmU7XG4gIFx0XHRrc2FuYS5wbGF0Zm9ybT1cIm5vZGUtd2Via2l0XCI7XG4gIFx0XHR3aW5kb3cua3NhbmFnYXAucGxhdGZvcm09XCJub2RlLXdlYmtpdFwiO1xuXHRcdHZhciBrc2FuYWpzPXJlcXVpcmUoXCJmc1wiKS5yZWFkRmlsZVN5bmMoXCJrc2FuYS5qc1wiLFwidXRmOFwiKS50cmltKCk7XG5cdFx0a3NhbmEuanM9SlNPTi5wYXJzZShrc2FuYWpzLnN1YnN0cmluZygxNCxrc2FuYWpzLmxlbmd0aC0xKSk7XG5cdFx0d2luZG93Lmtmcz1yZXF1aXJlKFwiLi9rZnNcIik7XG4gIFx0fVxufSBlbHNlIGlmICh0eXBlb2YgY2hyb21lIT1cInVuZGVmaW5lZFwiKXsvL30gJiYgY2hyb21lLmZpbGVTeXN0ZW0pe1xuLy9cdHdpbmRvdy5rc2FuYWdhcD1yZXF1aXJlKFwiLi9rc2FuYWdhcFwiKTsgLy9jb21wYXRpYmxlIGxheWVyIHdpdGggbW9iaWxlXG5cdHdpbmRvdy5rc2FuYWdhcC5wbGF0Zm9ybT1cImNocm9tZVwiO1xuXHR3aW5kb3cua2ZzPXJlcXVpcmUoXCIuL2tmc19odG1sNVwiKTtcblx0aWYod2luZG93LmxvY2F0aW9uLm9yaWdpbi5pbmRleE9mKFwiLy8xMjcuMC4wLjFcIik+LTEpIHtcblx0XHRyZXF1aXJlKFwiLi9saXZlcmVsb2FkXCIpKCk7XG5cdH1cblx0a3NhbmEucGxhdGZvcm09XCJjaHJvbWVcIjtcbn0gZWxzZSB7XG5cdGlmICh0eXBlb2Yga3NhbmFnYXAhPVwidW5kZWZpbmVkXCIgJiYgdHlwZW9mIGZzIT1cInVuZGVmaW5lZFwiKSB7Ly9tb2JpbGVcblx0XHR2YXIga3NhbmFqcz1mcy5yZWFkRmlsZVN5bmMoXCJrc2FuYS5qc1wiLFwidXRmOFwiKS50cmltKCk7IC8vYW5kcm9pZCBleHRyYSBcXG4gYXQgdGhlIGVuZFxuXHRcdGtzYW5hLmpzPUpTT04ucGFyc2Uoa3NhbmFqcy5zdWJzdHJpbmcoMTQsa3NhbmFqcy5sZW5ndGgtMSkpO1xuXHRcdGtzYW5hLnBsYXRmb3JtPWtzYW5hZ2FwLnBsYXRmb3JtO1xuXHRcdGlmICh0eXBlb2Yga3NhbmFnYXAuYW5kcm9pZCAhPVwidW5kZWZpbmVkXCIpIHtcblx0XHRcdGtzYW5hLnBsYXRmb3JtPVwiYW5kcm9pZFwiO1xuXHRcdH1cblx0fVxufVxudmFyIHRpbWVyPW51bGw7XG52YXIgYm9vdD1mdW5jdGlvbihhcHBJZCxjYikge1xuXHRrc2FuYS5hcHBJZD1hcHBJZDtcblx0aWYgKGtzYW5hZ2FwLnBsYXRmb3JtPT1cImNocm9tZVwiKSB7IC8vbmVlZCB0byB3YWl0IGZvciBqc29ucCBrc2FuYS5qc1xuXHRcdHRpbWVyPXNldEludGVydmFsKGZ1bmN0aW9uKCl7XG5cdFx0XHRpZiAoa3NhbmEucmVhZHkpe1xuXHRcdFx0XHRjbGVhckludGVydmFsKHRpbWVyKTtcblx0XHRcdFx0aWYgKGtzYW5hLmpzICYmIGtzYW5hLmpzLmZpbGVzICYmIGtzYW5hLmpzLmZpbGVzLmxlbmd0aCkge1xuXHRcdFx0XHRcdHJlcXVpcmUoXCIuL2luc3RhbGxrZGJcIikoa3NhbmEuanMsY2IpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGNiKCk7XHRcdFxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSwzMDApO1xuXHR9IGVsc2Uge1xuXHRcdGNiKCk7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHM9e2Jvb3Q6Ym9vdFxuXHQsaHRtbGZzOnJlcXVpcmUoXCIuL2h0bWxmc1wiKVxuXHQsaHRtbDVmczpyZXF1aXJlKFwiLi9odG1sNWZzXCIpXG5cdCxsaXZldXBkYXRlOnJlcXVpcmUoXCIuL2xpdmV1cGRhdGVcIilcblx0LGZpbGVpbnN0YWxsZXI6cmVxdWlyZShcIi4vZmlsZWluc3RhbGxlclwiKVxuXHQsZG93bmxvYWRlcjpyZXF1aXJlKFwiLi9kb3dubG9hZGVyXCIpXG5cdCxpbnN0YWxsa2RiOnJlcXVpcmUoXCIuL2luc3RhbGxrZGJcIilcbn07IiwidmFyIEZpbGVpbnN0YWxsZXI9cmVxdWlyZShcIi4vZmlsZWluc3RhbGxlclwiKTtcblxudmFyIGdldFJlcXVpcmVfa2RiPWZ1bmN0aW9uKCkge1xuICAgIHZhciByZXF1aXJlZD1bXTtcbiAgICBrc2FuYS5qcy5maWxlcy5tYXAoZnVuY3Rpb24oZil7XG4gICAgICBpZiAoZi5pbmRleE9mKFwiLmtkYlwiKT09Zi5sZW5ndGgtNCkge1xuICAgICAgICB2YXIgc2xhc2g9Zi5sYXN0SW5kZXhPZihcIi9cIik7XG4gICAgICAgIGlmIChzbGFzaD4tMSkge1xuICAgICAgICAgIHZhciBkYmlkPWYuc3Vic3RyaW5nKHNsYXNoKzEsZi5sZW5ndGgtNCk7XG4gICAgICAgICAgcmVxdWlyZWQucHVzaCh7dXJsOmYsZGJpZDpkYmlkLGZpbGVuYW1lOmRiaWQrXCIua2RiXCJ9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YXIgZGJpZD1mLnN1YnN0cmluZygwLGYubGVuZ3RoLTQpO1xuICAgICAgICAgIHJlcXVpcmVkLnB1c2goe3VybDprc2FuYS5qcy5iYXNldXJsK2YsZGJpZDpkYmlkLGZpbGVuYW1lOmZ9KTtcbiAgICAgICAgfSAgICAgICAgXG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlcXVpcmVkO1xufVxudmFyIGNhbGxiYWNrPW51bGw7XG52YXIgb25SZWFkeT1mdW5jdGlvbigpIHtcblx0Y2FsbGJhY2soKTtcbn1cbnZhciBvcGVuRmlsZWluc3RhbGxlcj1mdW5jdGlvbihrZWVwKSB7XG5cdHZhciByZXF1aXJlX2tkYj1nZXRSZXF1aXJlX2tkYigpLm1hcChmdW5jdGlvbihkYil7XG5cdCAgcmV0dXJuIHtcblx0ICAgIHVybDp3aW5kb3cubG9jYXRpb24ub3JpZ2luK3dpbmRvdy5sb2NhdGlvbi5wYXRobmFtZStkYi5kYmlkK1wiLmtkYlwiLFxuXHQgICAgZGJkYjpkYi5kYmlkLFxuXHQgICAgZmlsZW5hbWU6ZGIuZmlsZW5hbWVcblx0ICB9XG5cdH0pXG5cdHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KEZpbGVpbnN0YWxsZXIsIHtxdW90YTogXCI1MTJNXCIsIGF1dG9jbG9zZTogIWtlZXAsIG5lZWRlZDogcmVxdWlyZV9rZGIsIFxuXHQgICAgICAgICAgICAgICAgIG9uUmVhZHk6IG9uUmVhZHl9KTtcbn1cbnZhciBpbnN0YWxsa2RiPWZ1bmN0aW9uKGtzYW5hanMsY2IsY29udGV4dCkge1xuXHRSZWFjdC5yZW5kZXIob3BlbkZpbGVpbnN0YWxsZXIoKSxkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1haW5cIikpO1xuXHRjYWxsYmFjaz1jYjtcbn1cbm1vZHVsZS5leHBvcnRzPWluc3RhbGxrZGI7IiwiLy9TaW11bGF0ZSBmZWF0dXJlIGluIGtzYW5hZ2FwXG4vKiBcbiAgcnVucyBvbiBub2RlLXdlYmtpdCBvbmx5XG4qL1xuXG52YXIgcmVhZERpcj1mdW5jdGlvbihwYXRoKSB7IC8vc2ltdWxhdGUgS3NhbmFnYXAgZnVuY3Rpb25cblx0dmFyIGZzPW5vZGVSZXF1aXJlKFwiZnNcIik7XG5cdHBhdGg9cGF0aHx8XCIuLlwiO1xuXHR2YXIgZGlycz1bXTtcblx0aWYgKHBhdGhbMF09PVwiLlwiKSB7XG5cdFx0aWYgKHBhdGg9PVwiLlwiKSBkaXJzPWZzLnJlYWRkaXJTeW5jKFwiLlwiKTtcblx0XHRlbHNlIHtcblx0XHRcdGRpcnM9ZnMucmVhZGRpclN5bmMoXCIuLlwiKTtcblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0ZGlycz1mcy5yZWFkZGlyU3luYyhwYXRoKTtcblx0fVxuXG5cdHJldHVybiBkaXJzLmpvaW4oXCJcXHVmZmZmXCIpO1xufVxudmFyIGxpc3RBcHBzPWZ1bmN0aW9uKCkge1xuXHR2YXIgZnM9bm9kZVJlcXVpcmUoXCJmc1wiKTtcblx0dmFyIGtzYW5hanNmaWxlPWZ1bmN0aW9uKGQpIHtyZXR1cm4gXCIuLi9cIitkK1wiL2tzYW5hLmpzXCJ9O1xuXHR2YXIgZGlycz1mcy5yZWFkZGlyU3luYyhcIi4uXCIpLmZpbHRlcihmdW5jdGlvbihkKXtcblx0XHRcdFx0cmV0dXJuIGZzLnN0YXRTeW5jKFwiLi4vXCIrZCkuaXNEaXJlY3RvcnkoKSAmJiBkWzBdIT1cIi5cIlxuXHRcdFx0XHQgICAmJiBmcy5leGlzdHNTeW5jKGtzYW5hanNmaWxlKGQpKTtcblx0fSk7XG5cdFxuXHR2YXIgb3V0PWRpcnMubWFwKGZ1bmN0aW9uKGQpe1xuXHRcdHZhciBjb250ZW50PWZzLnJlYWRGaWxlU3luYyhrc2FuYWpzZmlsZShkKSxcInV0ZjhcIik7XG4gIFx0Y29udGVudD1jb250ZW50LnJlcGxhY2UoXCJ9KVwiLFwifVwiKTtcbiAgXHRjb250ZW50PWNvbnRlbnQucmVwbGFjZShcImpzb25wX2hhbmRsZXIoXCIsXCJcIik7XG5cdFx0dmFyIG9iaj0gSlNPTi5wYXJzZShjb250ZW50KTtcblx0XHRvYmouZGJpZD1kO1xuXHRcdG9iai5wYXRoPWQ7XG5cdFx0cmV0dXJuIG9iajtcblx0fSlcblx0cmV0dXJuIEpTT04uc3RyaW5naWZ5KG91dCk7XG59XG5cblxuXG52YXIga2ZzPXtyZWFkRGlyOnJlYWREaXIsbGlzdEFwcHM6bGlzdEFwcHN9O1xuXG5tb2R1bGUuZXhwb3J0cz1rZnM7IiwidmFyIHJlYWREaXI9ZnVuY3Rpb24oKXtcblx0cmV0dXJuIFtdO1xufVxudmFyIGxpc3RBcHBzPWZ1bmN0aW9uKCl7XG5cdHJldHVybiBbXTtcbn1cbm1vZHVsZS5leHBvcnRzPXtyZWFkRGlyOnJlYWREaXIsbGlzdEFwcHM6bGlzdEFwcHN9OyIsInZhciBhcHBuYW1lPVwiaW5zdGFsbGVyXCI7XG52YXIgc3dpdGNoQXBwPWZ1bmN0aW9uKHBhdGgpIHtcblx0dmFyIGZzPXJlcXVpcmUoXCJmc1wiKTtcblx0cGF0aD1cIi4uL1wiK3BhdGg7XG5cdGFwcG5hbWU9cGF0aDtcblx0ZG9jdW1lbnQubG9jYXRpb24uaHJlZj0gcGF0aCtcIi9pbmRleC5odG1sXCI7IFxuXHRwcm9jZXNzLmNoZGlyKHBhdGgpO1xufVxudmFyIGRvd25sb2FkZXI9e307XG52YXIgcm9vdFBhdGg9XCJcIjtcblxudmFyIGRlbGV0ZUFwcD1mdW5jdGlvbihhcHApIHtcblx0Y29uc29sZS5lcnJvcihcIm5vdCBhbGxvdyBvbiBQQywgZG8gaXQgaW4gRmlsZSBFeHBsb3Jlci8gRmluZGVyXCIpO1xufVxudmFyIHVzZXJuYW1lPWZ1bmN0aW9uKCkge1xuXHRyZXR1cm4gXCJcIjtcbn1cbnZhciB1c2VyZW1haWw9ZnVuY3Rpb24oKSB7XG5cdHJldHVybiBcIlwiXG59XG52YXIgcnVudGltZV92ZXJzaW9uPWZ1bmN0aW9uKCkge1xuXHRyZXR1cm4gXCIxLjRcIjtcbn1cblxuLy9jb3B5IGZyb20gbGl2ZXVwZGF0ZVxudmFyIGpzb25wPWZ1bmN0aW9uKHVybCxkYmlkLGNhbGxiYWNrLGNvbnRleHQpIHtcbiAgdmFyIHNjcmlwdD1kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImpzb25wMlwiKTtcbiAgaWYgKHNjcmlwdCkge1xuICAgIHNjcmlwdC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHNjcmlwdCk7XG4gIH1cbiAgd2luZG93Lmpzb25wX2hhbmRsZXI9ZnVuY3Rpb24oZGF0YSkge1xuICAgIGlmICh0eXBlb2YgZGF0YT09XCJvYmplY3RcIikge1xuICAgICAgZGF0YS5kYmlkPWRiaWQ7XG4gICAgICBjYWxsYmFjay5hcHBseShjb250ZXh0LFtkYXRhXSk7ICAgIFxuICAgIH0gIFxuICB9XG4gIHdpbmRvdy5qc29ucF9lcnJvcl9oYW5kbGVyPWZ1bmN0aW9uKCkge1xuICAgIGNvbnNvbGUuZXJyb3IoXCJ1cmwgdW5yZWFjaGFibGVcIix1cmwpO1xuICAgIGNhbGxiYWNrLmFwcGx5KGNvbnRleHQsW251bGxdKTtcbiAgfVxuICBzY3JpcHQ9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XG4gIHNjcmlwdC5zZXRBdHRyaWJ1dGUoJ2lkJywgXCJqc29ucDJcIik7XG4gIHNjcmlwdC5zZXRBdHRyaWJ1dGUoJ29uZXJyb3InLCBcImpzb25wX2Vycm9yX2hhbmRsZXIoKVwiKTtcbiAgdXJsPXVybCsnPycrKG5ldyBEYXRlKCkuZ2V0VGltZSgpKTtcbiAgc2NyaXB0LnNldEF0dHJpYnV0ZSgnc3JjJywgdXJsKTtcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXS5hcHBlbmRDaGlsZChzY3JpcHQpOyBcbn1cblxudmFyIGtzYW5hZ2FwPXtcblx0cGxhdGZvcm06XCJub2RlLXdlYmtpdFwiLFxuXHRzdGFydERvd25sb2FkOmRvd25sb2FkZXIuc3RhcnREb3dubG9hZCxcblx0ZG93bmxvYWRlZEJ5dGU6ZG93bmxvYWRlci5kb3dubG9hZGVkQnl0ZSxcblx0ZG93bmxvYWRpbmdGaWxlOmRvd25sb2FkZXIuZG93bmxvYWRpbmdGaWxlLFxuXHRjYW5jZWxEb3dubG9hZDpkb3dubG9hZGVyLmNhbmNlbERvd25sb2FkLFxuXHRkb25lRG93bmxvYWQ6ZG93bmxvYWRlci5kb25lRG93bmxvYWQsXG5cdHN3aXRjaEFwcDpzd2l0Y2hBcHAsXG5cdHJvb3RQYXRoOnJvb3RQYXRoLFxuXHRkZWxldGVBcHA6IGRlbGV0ZUFwcCxcblx0dXNlcm5hbWU6dXNlcm5hbWUsIC8vbm90IHN1cHBvcnQgb24gUENcblx0dXNlcmVtYWlsOnVzZXJuYW1lLFxuXHRydW50aW1lX3ZlcnNpb246cnVudGltZV92ZXJzaW9uLFxuXHRcbn1cblxuaWYgKHR5cGVvZiBwcm9jZXNzIT1cInVuZGVmaW5lZFwiICYmICFwcm9jZXNzLmJyb3dzZXIpIHtcblx0dmFyIGtzYW5hanM9cmVxdWlyZShcImZzXCIpLnJlYWRGaWxlU3luYyhcIi4va3NhbmEuanNcIixcInV0ZjhcIikudHJpbSgpO1xuXHRkb3dubG9hZGVyPXJlcXVpcmUoXCIuL2Rvd25sb2FkZXJcIik7XG5cdGNvbnNvbGUubG9nKGtzYW5hanMpO1xuXHQvL2tzYW5hLmpzPUpTT04ucGFyc2Uoa3NhbmFqcy5zdWJzdHJpbmcoMTQsa3NhbmFqcy5sZW5ndGgtMSkpO1xuXHRyb290UGF0aD1wcm9jZXNzLmN3ZCgpO1xuXHRyb290UGF0aD1yZXF1aXJlKFwicGF0aFwiKS5yZXNvbHZlKHJvb3RQYXRoLFwiLi5cIikucmVwbGFjZSgvXFxcXC9nLFwiL1wiKSsnLyc7XG5cdGtzYW5hLnJlYWR5PXRydWU7XG59IGVsc2V7XG5cdHZhciB1cmw9d2luZG93LmxvY2F0aW9uLm9yaWdpbit3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUucmVwbGFjZShcImluZGV4Lmh0bWxcIixcIlwiKStcImtzYW5hLmpzXCI7XG5cdGpzb25wKHVybCxhcHBuYW1lLGZ1bmN0aW9uKGRhdGEpe1xuXHRcdGtzYW5hLmpzPWRhdGE7XG5cdFx0a3NhbmEucmVhZHk9dHJ1ZTtcblx0fSk7XG59XG5tb2R1bGUuZXhwb3J0cz1rc2FuYWdhcDsiLCJ2YXIgc3RhcnRlZD1mYWxzZTtcbnZhciB0aW1lcj1udWxsO1xudmFyIGJ1bmRsZWRhdGU9bnVsbDtcbnZhciBnZXRfZGF0ZT1yZXF1aXJlKFwiLi9odG1sNWZzXCIpLmdldF9kYXRlO1xudmFyIGNoZWNrSWZCdW5kbGVVcGRhdGVkPWZ1bmN0aW9uKCkge1xuXHRnZXRfZGF0ZShcImJ1bmRsZS5qc1wiLGZ1bmN0aW9uKGRhdGUpe1xuXHRcdGlmIChidW5kbGVkYXRlICYmYnVuZGxlZGF0ZSE9ZGF0ZSl7XG5cdFx0XHRsb2NhdGlvbi5yZWxvYWQoKTtcblx0XHR9XG5cdFx0YnVuZGxlZGF0ZT1kYXRlO1xuXHR9KTtcbn1cbnZhciBsaXZlcmVsb2FkPWZ1bmN0aW9uKCkge1xuXHRpZiAoc3RhcnRlZCkgcmV0dXJuO1xuXG5cdHRpbWVyMT1zZXRJbnRlcnZhbChmdW5jdGlvbigpe1xuXHRcdGNoZWNrSWZCdW5kbGVVcGRhdGVkKCk7XG5cdH0sMjAwMCk7XG5cdHN0YXJ0ZWQ9dHJ1ZTtcbn1cblxubW9kdWxlLmV4cG9ydHM9bGl2ZXJlbG9hZDsiLCJcbnZhciBqc29ucD1mdW5jdGlvbih1cmwsZGJpZCxjYWxsYmFjayxjb250ZXh0KSB7XG4gIHZhciBzY3JpcHQ9ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJqc29ucFwiKTtcbiAgaWYgKHNjcmlwdCkge1xuICAgIHNjcmlwdC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHNjcmlwdCk7XG4gIH1cbiAgd2luZG93Lmpzb25wX2hhbmRsZXI9ZnVuY3Rpb24oZGF0YSkge1xuICAgIC8vY29uc29sZS5sb2coXCJyZWNlaXZlIGZyb20ga3NhbmEuanNcIixkYXRhKTtcbiAgICBpZiAodHlwZW9mIGRhdGE9PVwib2JqZWN0XCIpIHtcbiAgICAgIGlmICh0eXBlb2YgZGF0YS5kYmlkPT1cInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIGRhdGEuZGJpZD1kYmlkO1xuICAgICAgfVxuICAgICAgY2FsbGJhY2suYXBwbHkoY29udGV4dCxbZGF0YV0pO1xuICAgIH0gIFxuICB9XG5cbiAgd2luZG93Lmpzb25wX2Vycm9yX2hhbmRsZXI9ZnVuY3Rpb24oKSB7XG4gICAgY29uc29sZS5lcnJvcihcInVybCB1bnJlYWNoYWJsZVwiLHVybCk7XG4gICAgY2FsbGJhY2suYXBwbHkoY29udGV4dCxbbnVsbF0pO1xuICB9XG5cbiAgc2NyaXB0PWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuICBzY3JpcHQuc2V0QXR0cmlidXRlKCdpZCcsIFwianNvbnBcIik7XG4gIHNjcmlwdC5zZXRBdHRyaWJ1dGUoJ29uZXJyb3InLCBcImpzb25wX2Vycm9yX2hhbmRsZXIoKVwiKTtcbiAgdXJsPXVybCsnPycrKG5ldyBEYXRlKCkuZ2V0VGltZSgpKTtcbiAgc2NyaXB0LnNldEF0dHJpYnV0ZSgnc3JjJywgdXJsKTtcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXS5hcHBlbmRDaGlsZChzY3JpcHQpOyBcbn1cbnZhciBydW50aW1lX3ZlcnNpb25fb2s9ZnVuY3Rpb24obWlucnVudGltZSkge1xuICBpZiAoIW1pbnJ1bnRpbWUpIHJldHVybiB0cnVlOy8vbm90IG1lbnRpb25lZC5cbiAgdmFyIG1pbj1wYXJzZUZsb2F0KG1pbnJ1bnRpbWUpO1xuICB2YXIgcnVudGltZT1wYXJzZUZsb2F0KCBrc2FuYWdhcC5ydW50aW1lX3ZlcnNpb24oKXx8XCIxLjBcIik7XG4gIGlmIChtaW4+cnVudGltZSkgcmV0dXJuIGZhbHNlO1xuICByZXR1cm4gdHJ1ZTtcbn1cblxudmFyIG5lZWRUb1VwZGF0ZT1mdW5jdGlvbihmcm9tanNvbix0b2pzb24pIHtcbiAgdmFyIG5lZWRVcGRhdGVzPVtdO1xuICBmb3IgKHZhciBpPTA7aTxmcm9tanNvbi5sZW5ndGg7aSsrKSB7IFxuICAgIHZhciB0bz10b2pzb25baV07XG4gICAgdmFyIGZyb209ZnJvbWpzb25baV07XG4gICAgdmFyIG5ld2ZpbGVzPVtdLG5ld2ZpbGVzaXplcz1bXSxyZW1vdmVkPVtdO1xuICAgIFxuICAgIGlmICghdG8pIGNvbnRpbnVlOyAvL2Nhbm5vdCByZWFjaCBob3N0XG4gICAgaWYgKCFydW50aW1lX3ZlcnNpb25fb2sodG8ubWlucnVudGltZSkpIHtcbiAgICAgIGNvbnNvbGUud2FybihcInJ1bnRpbWUgdG9vIG9sZCwgbmVlZCBcIit0by5taW5ydW50aW1lKTtcbiAgICAgIGNvbnRpbnVlOyBcbiAgICB9XG4gICAgaWYgKCFmcm9tLmZpbGVkYXRlcykge1xuICAgICAgY29uc29sZS53YXJuKFwibWlzc2luZyBmaWxlZGF0ZXMgaW4ga3NhbmEuanMgb2YgXCIrZnJvbS5kYmlkKTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICBmcm9tLmZpbGVkYXRlcy5tYXAoZnVuY3Rpb24oZixpZHgpe1xuICAgICAgdmFyIG5ld2lkeD10by5maWxlcy5pbmRleE9mKCBmcm9tLmZpbGVzW2lkeF0pO1xuICAgICAgaWYgKG5ld2lkeD09LTEpIHtcbiAgICAgICAgLy9maWxlIHJlbW92ZWQgaW4gbmV3IHZlcnNpb25cbiAgICAgICAgcmVtb3ZlZC5wdXNoKGZyb20uZmlsZXNbaWR4XSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgZnJvbWRhdGU9RGF0ZS5wYXJzZShmKTtcbiAgICAgICAgdmFyIHRvZGF0ZT1EYXRlLnBhcnNlKHRvLmZpbGVkYXRlc1tuZXdpZHhdKTtcbiAgICAgICAgaWYgKGZyb21kYXRlPHRvZGF0ZSkge1xuICAgICAgICAgIG5ld2ZpbGVzLnB1c2goIHRvLmZpbGVzW25ld2lkeF0gKTtcbiAgICAgICAgICBuZXdmaWxlc2l6ZXMucHVzaCh0by5maWxlc2l6ZXNbbmV3aWR4XSk7XG4gICAgICAgIH0gICAgICAgIFxuICAgICAgfVxuICAgIH0pO1xuICAgIGlmIChuZXdmaWxlcy5sZW5ndGgpIHtcbiAgICAgIGZyb20ubmV3ZmlsZXM9bmV3ZmlsZXM7XG4gICAgICBmcm9tLm5ld2ZpbGVzaXplcz1uZXdmaWxlc2l6ZXM7XG4gICAgICBmcm9tLnJlbW92ZWQ9cmVtb3ZlZDtcbiAgICAgIG5lZWRVcGRhdGVzLnB1c2goZnJvbSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBuZWVkVXBkYXRlcztcbn1cbnZhciBnZXRVcGRhdGFibGVzPWZ1bmN0aW9uKGFwcHMsY2IsY29udGV4dCkge1xuICBnZXRSZW1vdGVKc29uKGFwcHMsZnVuY3Rpb24oanNvbnMpe1xuICAgIHZhciBoYXNVcGRhdGVzPW5lZWRUb1VwZGF0ZShhcHBzLGpzb25zKTtcbiAgICBjYi5hcHBseShjb250ZXh0LFtoYXNVcGRhdGVzXSk7XG4gIH0sY29udGV4dCk7XG59XG52YXIgZ2V0UmVtb3RlSnNvbj1mdW5jdGlvbihhcHBzLGNiLGNvbnRleHQpIHtcbiAgdmFyIHRhc2txdWV1ZT1bXSxvdXRwdXQ9W107XG4gIHZhciBtYWtlY2I9ZnVuY3Rpb24oYXBwKXtcbiAgICByZXR1cm4gZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgIGlmICghKGRhdGEgJiYgdHlwZW9mIGRhdGEgPT0nb2JqZWN0JyAmJiBkYXRhLl9fZW1wdHkpKSBvdXRwdXQucHVzaChkYXRhKTtcbiAgICAgICAgaWYgKCFhcHAuYmFzZXVybCkge1xuICAgICAgICAgIHRhc2txdWV1ZS5zaGlmdCh7X19lbXB0eTp0cnVlfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFyIHVybD1hcHAuYmFzZXVybCtcIi9rc2FuYS5qc1wiOyAgICBcbiAgICAgICAgICBjb25zb2xlLmxvZyh1cmwpO1xuICAgICAgICAgIGpzb25wKCB1cmwgLGFwcC5kYmlkLHRhc2txdWV1ZS5zaGlmdCgpLCBjb250ZXh0KTsgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgfTtcbiAgfTtcbiAgYXBwcy5mb3JFYWNoKGZ1bmN0aW9uKGFwcCl7dGFza3F1ZXVlLnB1c2gobWFrZWNiKGFwcCkpfSk7XG5cbiAgdGFza3F1ZXVlLnB1c2goZnVuY3Rpb24oZGF0YSl7XG4gICAgb3V0cHV0LnB1c2goZGF0YSk7XG4gICAgY2IuYXBwbHkoY29udGV4dCxbb3V0cHV0XSk7XG4gIH0pO1xuXG4gIHRhc2txdWV1ZS5zaGlmdCgpKHtfX2VtcHR5OnRydWV9KTsgLy9ydW4gdGhlIHRhc2tcbn1cbnZhciBodW1hbkZpbGVTaXplPWZ1bmN0aW9uKGJ5dGVzLCBzaSkge1xuICAgIHZhciB0aHJlc2ggPSBzaSA/IDEwMDAgOiAxMDI0O1xuICAgIGlmKGJ5dGVzIDwgdGhyZXNoKSByZXR1cm4gYnl0ZXMgKyAnIEInO1xuICAgIHZhciB1bml0cyA9IHNpID8gWydrQicsJ01CJywnR0InLCdUQicsJ1BCJywnRUInLCdaQicsJ1lCJ10gOiBbJ0tpQicsJ01pQicsJ0dpQicsJ1RpQicsJ1BpQicsJ0VpQicsJ1ppQicsJ1lpQiddO1xuICAgIHZhciB1ID0gLTE7XG4gICAgZG8ge1xuICAgICAgICBieXRlcyAvPSB0aHJlc2g7XG4gICAgICAgICsrdTtcbiAgICB9IHdoaWxlKGJ5dGVzID49IHRocmVzaCk7XG4gICAgcmV0dXJuIGJ5dGVzLnRvRml4ZWQoMSkrJyAnK3VuaXRzW3VdO1xufTtcblxudmFyIHN0YXJ0PWZ1bmN0aW9uKGtzYW5hanMsY2IsY29udGV4dCl7XG4gIHZhciBmaWxlcz1rc2FuYWpzLm5ld2ZpbGVzfHxrc2FuYWpzLmZpbGVzO1xuICB2YXIgYmFzZXVybD1rc2FuYWpzLmJhc2V1cmx8fCBcImh0dHA6Ly8xMjcuMC4wLjE6ODA4MC9cIitrc2FuYWpzLmRiaWQrXCIvXCI7XG4gIHZhciBzdGFydGVkPWtzYW5hZ2FwLnN0YXJ0RG93bmxvYWQoa3NhbmFqcy5kYmlkLGJhc2V1cmwsZmlsZXMuam9pbihcIlxcdWZmZmZcIikpO1xuICBjYi5hcHBseShjb250ZXh0LFtzdGFydGVkXSk7XG59XG52YXIgc3RhdHVzPWZ1bmN0aW9uKCl7XG4gIHZhciBuZmlsZT1rc2FuYWdhcC5kb3dubG9hZGluZ0ZpbGUoKTtcbiAgdmFyIGRvd25sb2FkZWRCeXRlPWtzYW5hZ2FwLmRvd25sb2FkZWRCeXRlKCk7XG4gIHZhciBkb25lPWtzYW5hZ2FwLmRvbmVEb3dubG9hZCgpO1xuICByZXR1cm4ge25maWxlOm5maWxlLGRvd25sb2FkZWRCeXRlOmRvd25sb2FkZWRCeXRlLCBkb25lOmRvbmV9O1xufVxuXG52YXIgY2FuY2VsPWZ1bmN0aW9uKCl7XG4gIHJldHVybiBrc2FuYWdhcC5jYW5jZWxEb3dubG9hZCgpO1xufVxuXG52YXIgbGl2ZXVwZGF0ZT17IGh1bWFuRmlsZVNpemU6IGh1bWFuRmlsZVNpemUsIFxuICBuZWVkVG9VcGRhdGU6IG5lZWRUb1VwZGF0ZSAsIGpzb25wOmpzb25wLCBcbiAgZ2V0VXBkYXRhYmxlczpnZXRVcGRhdGFibGVzLFxuICBzdGFydDpzdGFydCxcbiAgY2FuY2VsOmNhbmNlbCxcbiAgc3RhdHVzOnN0YXR1c1xuICB9O1xubW9kdWxlLmV4cG9ydHM9bGl2ZXVwZGF0ZTsiLCJmdW5jdGlvbiBta2RpclAgKHAsIG1vZGUsIGYsIG1hZGUpIHtcbiAgICAgdmFyIHBhdGggPSBub2RlUmVxdWlyZSgncGF0aCcpO1xuICAgICB2YXIgZnMgPSBub2RlUmVxdWlyZSgnZnMnKTtcblx0XG4gICAgaWYgKHR5cGVvZiBtb2RlID09PSAnZnVuY3Rpb24nIHx8IG1vZGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBmID0gbW9kZTtcbiAgICAgICAgbW9kZSA9IDB4MUZGICYgKH5wcm9jZXNzLnVtYXNrKCkpO1xuICAgIH1cbiAgICBpZiAoIW1hZGUpIG1hZGUgPSBudWxsO1xuXG4gICAgdmFyIGNiID0gZiB8fCBmdW5jdGlvbiAoKSB7fTtcbiAgICBpZiAodHlwZW9mIG1vZGUgPT09ICdzdHJpbmcnKSBtb2RlID0gcGFyc2VJbnQobW9kZSwgOCk7XG4gICAgcCA9IHBhdGgucmVzb2x2ZShwKTtcblxuICAgIGZzLm1rZGlyKHAsIG1vZGUsIGZ1bmN0aW9uIChlcikge1xuICAgICAgICBpZiAoIWVyKSB7XG4gICAgICAgICAgICBtYWRlID0gbWFkZSB8fCBwO1xuICAgICAgICAgICAgcmV0dXJuIGNiKG51bGwsIG1hZGUpO1xuICAgICAgICB9XG4gICAgICAgIHN3aXRjaCAoZXIuY29kZSkge1xuICAgICAgICAgICAgY2FzZSAnRU5PRU5UJzpcbiAgICAgICAgICAgICAgICBta2RpclAocGF0aC5kaXJuYW1lKHApLCBtb2RlLCBmdW5jdGlvbiAoZXIsIG1hZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVyKSBjYihlciwgbWFkZSk7XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgbWtkaXJQKHAsIG1vZGUsIGNiLCBtYWRlKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgLy8gSW4gdGhlIGNhc2Ugb2YgYW55IG90aGVyIGVycm9yLCBqdXN0IHNlZSBpZiB0aGVyZSdzIGEgZGlyXG4gICAgICAgICAgICAvLyB0aGVyZSBhbHJlYWR5LiAgSWYgc28sIHRoZW4gaG9vcmF5ISAgSWYgbm90LCB0aGVuIHNvbWV0aGluZ1xuICAgICAgICAgICAgLy8gaXMgYm9ya2VkLlxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBmcy5zdGF0KHAsIGZ1bmN0aW9uIChlcjIsIHN0YXQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gaWYgdGhlIHN0YXQgZmFpbHMsIHRoZW4gdGhhdCdzIHN1cGVyIHdlaXJkLlxuICAgICAgICAgICAgICAgICAgICAvLyBsZXQgdGhlIG9yaWdpbmFsIGVycm9yIGJlIHRoZSBmYWlsdXJlIHJlYXNvbi5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGVyMiB8fCAhc3RhdC5pc0RpcmVjdG9yeSgpKSBjYihlciwgbWFkZSlcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBjYihudWxsLCBtYWRlKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG5ta2RpclAuc3luYyA9IGZ1bmN0aW9uIHN5bmMgKHAsIG1vZGUsIG1hZGUpIHtcbiAgICB2YXIgcGF0aCA9IG5vZGVSZXF1aXJlKCdwYXRoJyk7XG4gICAgdmFyIGZzID0gbm9kZVJlcXVpcmUoJ2ZzJyk7XG4gICAgaWYgKG1vZGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBtb2RlID0gMHgxRkYgJiAofnByb2Nlc3MudW1hc2soKSk7XG4gICAgfVxuICAgIGlmICghbWFkZSkgbWFkZSA9IG51bGw7XG5cbiAgICBpZiAodHlwZW9mIG1vZGUgPT09ICdzdHJpbmcnKSBtb2RlID0gcGFyc2VJbnQobW9kZSwgOCk7XG4gICAgcCA9IHBhdGgucmVzb2x2ZShwKTtcblxuICAgIHRyeSB7XG4gICAgICAgIGZzLm1rZGlyU3luYyhwLCBtb2RlKTtcbiAgICAgICAgbWFkZSA9IG1hZGUgfHwgcDtcbiAgICB9XG4gICAgY2F0Y2ggKGVycjApIHtcbiAgICAgICAgc3dpdGNoIChlcnIwLmNvZGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ0VOT0VOVCcgOlxuICAgICAgICAgICAgICAgIG1hZGUgPSBzeW5jKHBhdGguZGlybmFtZShwKSwgbW9kZSwgbWFkZSk7XG4gICAgICAgICAgICAgICAgc3luYyhwLCBtb2RlLCBtYWRlKTtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgLy8gSW4gdGhlIGNhc2Ugb2YgYW55IG90aGVyIGVycm9yLCBqdXN0IHNlZSBpZiB0aGVyZSdzIGEgZGlyXG4gICAgICAgICAgICAvLyB0aGVyZSBhbHJlYWR5LiAgSWYgc28sIHRoZW4gaG9vcmF5ISAgSWYgbm90LCB0aGVuIHNvbWV0aGluZ1xuICAgICAgICAgICAgLy8gaXMgYm9ya2VkLlxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB2YXIgc3RhdDtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBzdGF0ID0gZnMuc3RhdFN5bmMocCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhdGNoIChlcnIxKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IGVycjA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICghc3RhdC5pc0RpcmVjdG9yeSgpKSB0aHJvdyBlcnIwO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG1hZGU7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IG1rZGlyUC5ta2RpcnAgPSBta2RpclAubWtkaXJQID0gbWtkaXJQO1xuIl19
