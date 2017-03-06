var loginPage = {
	preloadPages: function() {
		var ar = []
		for (i in E.preloadPages) {
			ar.push({
				"id": E.preloadPages[i],
				"url": E.preloadPages[i]
			})
		}
		return ar;
	},
	init: function() {
		this.vue = E.vue(this.vueObj), this.initConfig()
	},
	initConfig: function() {
		var self = this;
		mui.init({
			"statusBarBackground": "#1F71B4"
		});
		mui.plusReady(function() {
			var phoneType = plus.os.name.toLowerCase(),
				cid;
			self.ws = plus.webview.currentWebview(), self.openr = self.ws.opener();
			cid = phoneType == "ios" ? encodeURIComponent(plus.push.getClientInfo().token) : encodeURIComponent(plus.push.getClientInfo().clientid)
			self.loginItem = {
				phoneType: phoneType,
				appId: plus.runtime.appid,
				cid: cid
			}
			plus.device.vendor != 'CipherLab' ? E.setStorage("imei", "1") : E.setStorage("imei", "0");
			var old_back = mui.back;
			mui.back = function() {
				if (confirm("确定退出吗？")) {
					plus.runtime.quit();
				}

			};
			plus.push.addEventListener("click", function(msg) {
				var payload = msg.payload;
				if (payload.payload) {
					return
				}
				mui.confirm("有新订单，是否立即跳转？", '', ['确定', '取消'], function(e) {
					if (e.index == 0) {
						self.goToDetail(payload)
					}
				})
			}, false), plus.push.addEventListener("receive", function(msg) {
				var payload = msg.payload;
				if (payload.payload) {
					return
				}
				mui.confirm("有新订单，是否立即跳转？", '', ['确定', '取消'], function(e) {
					if (e.index == 0) {
						self.goToDetail(payload)
					}
				})
			}, false)

		});
	},
	vueObj: {
		el: '#login',
		data: {
			orgCode: '8888',
			store: '上海仓库',
			userName: 'fsz',
			password: '123456'
		},
		methods: {
			loginEvent: function() {
				if (!this.orgCode || !this.store || !this.userName || !this.password) {
					E.toast("信息不全！");
					return
				}
				var param = E.paramFn("V5.mobile.user.login")
				var params = {
					orgCode: this.orgCode,
					store: this.store,
					userName: this.userName,
					password: this.password,
				}
				params = mui.extend(params, param, loginPage.loginItem);
				E.showLoading();
				var self = this;
				E.getData('userLogin', params, function(data) {
					if (!data.isSuccess) {
						E.alert(data.map.errorMsg), E.closeLoading()
						return
					}
					E.setStorage("orgCode", self.orgCode);
					E.setStorage("store", self.store);
					E.setStorage("op", data.op);
					self.getStoreList(function() {
						loginPage.openr.evalJS("indexEvent.loadChild()")
						loginPage.ws.hide()
						plus.navigator.setStatusBarBackground("#007aff");
						plus.webview.show('pages/home/home.html');
					})
				}, "get", this.errorFN())
			},
			getStoreList: function(callback) {
				var params = E.systemParam("V5.mobile.allocate.warehouse.search");
				var self = this;
				E.getData('warehouseSearch', params, function(data) {
					if (!data.isSuccess) {
						E.alert(data.map.errorMsg), E.closeLoading()
						return
					}
					data = data.stores;
					var status = 0
					for (var i = 0; i < data.length; i++) {
						if (data[i].storeName == self.store) {
							E.setStorage("myAddress", data[i].address);
							callback()
							status = 1;
							break;
						}
					}
					if (!status) {
						E.alert("门店列表中不存在此门店");
						E.closeLoading()
					}
				}, 'get')
			},
			errorFN: function() {

			}
		}
	}
}
loginPage.init();