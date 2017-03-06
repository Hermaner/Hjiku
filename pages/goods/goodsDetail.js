var Page = {
	init: function() {
		this.vue = E.vue(this.vueObj), this.initConfig()
	},
	initConfig: function() {
		var self = this;
		mui.init();
		mui.plusReady(function() {
			var ws = plus.webview.currentWebview()
			self.vue.items = ws.items
			console.log(JSON.stringify(ws.items))
		})
	},
	vueObj: {
		el: '#vue',
		data: {
			items: []
		},
		methods: {}
	}
}
Page.init()