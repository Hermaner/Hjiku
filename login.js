var Page = {
	init: function() {
		this.vue = E.vue(this.vueObj), this.initConfig()
	},
	initConfig: function() {
		var self = this;
		mui.init({
			preloadPages: [{
				"id": "home",
				"url": "pages/home/home.html",
			}]
		});
		mui.plusReady(function() {
			self.ws = plus.webview.currentWebview();
			if(E.getStorage("store")) {
				self.vue.store = E.getStorage("store")
				self.vue.userName = E.getStorage("userName")
				self.vue.password = E.getStorage("password")
			}
		});
	},
	vueObj: {
		el: '#vue',
		data: {
			store: '',
			userName: '',
			password: '',
			showguide: false,
		},
		methods: {
			loginEvent: function() {
				if(!this.store || !this.userName || !this.password) {
					E.toast("信息不全！");
					return
				}
				var params = E.paramFn("V5.mobile.user.login")
				params = mui.extend(params, {
					orgCode: this.orgCode,
					store: this.store,
					userName: this.userName,
					password: this.password,
					phoneType: Page.phoneType,
					appId: plus.runtime.appid,
					cid: cid
				})
				E.showLoading();
				var self = this;
				E.getData('userLogin', params, function(data) {
					if(!data.isSuccess) {
						E.alert(data.map.errorMsg), E.closeLoading()
						return
					}
					E.setStorage("store", self.store);
					E.setStorage("userName", self.userName);
					E.setStorage("password", self.password);
					E.setStorage("op", data.op);
					E.openWindow(E.preloadPages[2])
					E.getWebview(E.preloadPages[2]).evalJS("Page.loadChild('" + pageType + "')")
				}, "get", this.errorFN())
			}
		}
	}
}
Page.init();