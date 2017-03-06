var mapPage = {
	init: function() {
		this.vue = E.vue(this.vueObj), this.initConfig()
	},
	initConfig: function() {
		var self = this;
		mui.init({});
		mui.plusReady(function() {
			var ws = plus.webview.currentWebview();
			self.openr = ws.opener();
			mui("#orderList").on('tap', "li", function() {
				var address = this.getAttribute("address")
				self.vue.postAddress(address)
			})
			E.initDataurl("preHref", function(url) {
				E.openPreWindow(url)
			})
			self.locMap = mui.preload({
				id: 'locationMap.html',
				url: 'locationMap.html',
			});
		})
	},
	vueObj: {
		el: '#mapPage',
		data: {
			loadLete: false,
			items: [],
			address: ""
		},
		methods: {
			loadAddress: function(a) {
				this.address = a;
				mui(".mui-icon-reload")[0].classList.remove("amt")
			},
			loadItems: function(b) {
				this.loadLete = true
				b = b.split("@")
				this.items = b.length > 5 ? b.slice(0, 5) : b
			},
			refreshAddress: function() {
				this.loadLete = false
				mui(".mui-icon-reload")[0].classList.add("amt");
				mapPage.locMap.evalJS("mapPage.mapInit()")
			},
			postAddress: function(c) {
				if (c) {
					mapPage.openr.evalJS("Page.vue.reloadStore('" + c + "')")
					mui.back()
				}

			}
		}
	}
}
mapPage.init()