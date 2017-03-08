var Page = {
	init: function() {
		this.vue = E.vue(this.vueObj), this.initConfig()
	},
	initConfig: function() {
		var self = this;
		mui.init({
			preloadLimit: 10,
			preloadPages: [{
				"id": "home",
				"url": "pages/home/home.html",
			}, {
				"id": "orderTop",
				"url": "pages/order/orderTop.html",
			}, {
				"id": "rentTop",
				"url": "pages/order/rentTop.html",
			}, {
				"id": "listDetail",
				"url": "pages/order/listDetail.html",
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
			store: '上海乐名旅游专营店',
			userName: 'admin',
			password: 'admin',
		},
		methods: {
			loginEvent: function() {
				if(!this.store || !this.userName || !this.password) {
					E.toast("信息不全！");
					return
				}
				var params = E.paramFn("V5.mobile.project.jiku.user.login")
				params = mui.extend(params, {
					store: this.store,
					userName: this.userName,
					password: this.password,
					orgCode: 'jiku-devel',
				})
				E.showLoading();
				var self = this;
				E.getData('jikuUserLogin', params, function(data) {
					if(!data.isSuccess) {
						E.alert(data.map.errorMsg), E.closeLoading()
						return
					}
					E.setStorage("store", self.store);
					E.setStorage("userName", self.userName);
					E.setStorage("password", self.password);
					E.setStorage("op", self.userName);
					E.fireData("home")
				}, "", function() {
					E.closeLoading()
				})
			}
		}
	}
}
Page.init();