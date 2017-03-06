var Page = {
	init: function() {
		this.vue = E.vue(this.vueObj), this.initConfig()
	},
	widgetInfo: {
		version: "1.0.3"
	},
	initConfig: function() {
		var self = this;
		mui.init({
			"statusBarBackground": "#7a1c26",
			preloadPages: [{
				"id": "pages/tab/tab.html",
				"url": "pages/tab/tab.html",
			}, {
				"id": "trial",
				"url": "pages/trial/index.html",
			}]
		});
		mui.plusReady(function() {
			self.phoneType = plus.os.name.toLowerCase(),
				self.ws = plus.webview.currentWebview();
			self.indexPage = E.getWebview(E.preloadPages[2])

			plus.device.vendor != 'CipherLab' ? E.setStorage("imei", "1") : E.setStorage("imei", "0");
			plus.device.vendor != 'basewin' ? E.setStorage("vendor", "1") : E.setStorage("vendor", "0");
			var rh = plus.screen.resolutionHeight
			var toGuide = document.getElementsByClassName("toGuide")[0]
			toGuide.style.top = (rh - 70) + "px";
			if(E.getStorage("orgCode")) {
				self.vue.orgCode = E.getStorage("orgCode")
				self.vue.store = E.getStorage("store")
				self.vue.userName = E.getStorage("userName")
				self.vue.password = E.getStorage("password")
			}
			plus.runtime.setBadgeNumber(0);
			self.vue.getVersion()
		});
	},
	vueObj: {
		el: '#vue',
		data: {
			orgCode: '',
			store: '',
			userName: '',
			password: '',
			showguide: false,
		},
		methods: {
			loginEvent: function() {
				if(!this.orgCode || !this.store || !this.userName || !this.password) {
					E.toast("信息不全！");
					return
				}
				var cid = Page.phoneType == "ios" ? encodeURIComponent(plus.push.getClientInfo().token) : encodeURIComponent(plus.push.getClientInfo().clientid)
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
					if(E.getStorage("orgCode")&&E.getStorage("orgCode")!=self.orgCode){
						E.removeStorage("tabAccount")
					}
					E.setStorage("orgCode", self.orgCode);
					E.setStorage("store", self.store);
					var accAr=[],hasAcc=false;
					if(E.getStorage("tabAccount")){
					  accAr=JSON.parse(E.getStorage("tabAccount"));
					}
					for(var i =0;i<accAr.length;i++){
						if(accAr[i].userName==self.userName){
							hasAcc=true;
						}
					}
					if(!hasAcc){
						accAr.push({'userName':self.userName,'password':self.password})
					}
					E.setStorage("tabAccount", JSON.stringify(accAr));
					console.log(E.getStorage("tabAccount"))
					E.setStorage("userName", self.userName);
					E.setStorage("password", self.password);
					E.setStorage("op", data.op);
					self.getStoreList(function() {
						var pageType = 0
						if(E.getStorage("vendor") == 0) {
							var config = plus.android.newObject("io.dcloud.widget.WidgetTurnConifg");
							pageType = plus.android.getAttribute(config, "type");
						}
						plus.navigator.setStatusBarBackground("#d9002f");
						E.openWindow(E.preloadPages[2])
						E.getWebview(E.preloadPages[2]).evalJS("Page.loadChild('" + pageType + "')")
					})
				}, "get", this.errorFN())
			},
			getStoreList: function(callback) {
				var params = E.systemParam("V5.mobile.allocate.warehouse.search");
				var self = this;
				E.getData('warehouseSearch', params, function(data) {
					console.log(data)
					if(!data.isSuccess) {
						E.alert(data.map.errorMsg), E.closeLoading()
						return
					}

					data = data.stores;
					var status = 0;
					E.setStorage('stores', JSON.stringify(data))
					for(var i = 0; i < data.length; i++) {
						if(data[i].storeName == self.store) {
							E.setStorage("myAddress", data[i].address);
							E.setStorage("storeName", data[i].storeName);
							E.setStorage("tel", data[i].mobile || data[i].iphone);
							E.setStorage("isReturns", data[i].isReturns || '1');
							callback()
							status = 1;
							break;
						}
					}
					if(!status) {
						E.alert("门店列表中不存在此门店");
						E.closeLoading()
					}
				}, 'get')
			},
			errorFN: function() {

			},
			showTrial: function() {
				E.openPreWindow('trial')
			},
			gudeClose: function() {
				this.showguide = false
			},
			gudeOpen: function() {
				this.showguide = false
			},
			getVersion: function() {
				var self = this;
				var params = E.paramFn("V5.mobile.version.get");
				params = mui.extend(params, {
					orgCode: "zko2o"
				})
				E.getData('versionGet', params, function(data) {
					console.log(data)
					plus.runtime.getProperty(plus.runtime.appid, function(inf) {
						var myVersion = inf.version;
						if(myVersion.charAt(0) != 1) {
							myVersion = myVersion.substr(1, myVersion.length - 2)
						}
						var newVersion = data.version;
						//						alert(newVersion + ":" + myVersion)
						console.log(newVersion + ":" + myVersion)
						if(newVersion && myVersion != newVersion) {
							plus.nativeUI.confirm("发现新资源，是否更新？", function(event) {
								if(0 == event.index) {
									self.downWgt()
								}
							}, "", ["立即更新", "取　　消"]);
						}
					});

				}, 'get')
			},
			downWgt: function() {
				var self = this;
				plus.nativeUI.showWaiting("准备资源，请稍后...");
				var dtask = plus.downloader.createDownload("http://www.hongware.com/app/hongplus.wgt", {
					filename: "_doc/update/"
				}, function(d, status) {
					if(status == 200) {
						self.installWgt(d.filename); // 安装wgt包
					} else {
						plus.nativeUI.alert("下载失败！");
					}

				})
				dtask.addEventListener("statechanged", function(task, status) {
					switch(task.state) {
						case 1: // 开始
							break;
						case 2: // 已连接到服务器
							plus.nativeUI.closeWaiting();
							document.getElementsByClassName("progressBg")[0].style.display = "block"
							break;
						case 3: // 已接收到数据
							var progressSpan = document.getElementById("progressSpan")
							var percent = parseFloat(task.downloadedSize / task.totalSize);
							var progressPx = (percent > 1 ? 1 : percent) * 280 + "px";
							progressSpan.style.width = progressPx;
							break;
						case 4: // 下载完成
							break;
					}
				});
				setTimeout(function() {
					dtask.start();
				}, 500)
			},
			installWgt: function(path) {
				plus.runtime.install(path, '', function() {
					plus.nativeUI.closeWaiting();
					if(Page.phoneType == 'ios') {
						E.alert("更新成功！ 请双击home键退出应用后重新进入。")
					} else {
						plus.nativeUI.alert("应用资源更新完成！", function() {
							plus.runtime.restart();
						});
					}

				}, function(e) {
					plus.nativeUI.closeWaiting();
					plus.nativeUI.alert("安装失败[" + e.code + "]：" + e.message);
				});
			}

		}
	}
}
Page.init();