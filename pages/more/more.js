var morePage={
	init:function(){
	this.muiEvent(),this.initConfig()	
	},
	initConfig: function() {
		var self = this;
		mui.init();
		mui.plusReady(function() {
			self.ws = plus.webview.currentWebview();
		})
	},
	muiEvent:function(){
		E.initDataurl("data-url", function(url) {
			if(url=="openPreWindow"){
				E.openPreWindow(url)
			}else{
				E.openWindow(url)
			}
			
		});
	},
	exit:function(){
		E.confirm("是否退出？",function(){
			morePage.ws.opener().hide("pop-out");
			E.getWebview("pages/tab/tab.html").evalJS("Page.moreBack()")
		})

	}
	
}
morePage.init()
