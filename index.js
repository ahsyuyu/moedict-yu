var runtime=require("ksana2015-webruntime");
runtime.boot("moedict-yu",function(){
	var Main=React.createElement(require("./src/main.jsx"));
	ksana.mainComponent=React.render(Main,document.getElementById("main"));
});