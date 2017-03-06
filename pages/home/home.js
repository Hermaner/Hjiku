var Page = {
	subpages: E.subpages,
	preloadPages: E.preloadPages,
	init: function() {
		this.vue = E.vue(this.vueObj), this.initConfig(), this.muiEvent()
	},
	initConfig: function() {
		var self = this;
		mui.init({
			swipeBack: true,
			keyEventBind: {
				backbutton: false
			}
		});
		mui.plusReady(function() {
			E.delscroll()
			self.ws = plus.webview.currentWebview();
			self = mui.extend(self, {
				loginPage: E.getWebview(self.subpages[4]),
				openr: self.ws.opener()
			})

		});
	},
	muiEvent: function() {
		var self = this;
		E.initDataurl("uid", function(uid) {
			E.showWebview(self.subpages[2]), E.hideWebview(self.subpages[0])
			self.openr.evalJS("Page.orderBack('" + uid + "')")
		});
	},
	vueObj: {
		el: '#home',
		data: {
			homeData: {},
			accAr: [],
			op: "",
			wxTips: false,
			wxName: "",
			hasClick: false,
			showAc: false,
			moreList: [],
			gongzhong: '',
			exit1: '',
			exit2: '',
			exit4: '',
			exit5: '',
			exit7: '',
			exit8: '',
			exit9: '',
			exit10: '',
			exit11: '',
			exit12: '',
			exit13: '',
			exit14: '',
			exit15: '',
			exit16: '',
			exit20: '',
			exit25: '',
			exit26: '',
			exit27: '',
			exit28: '',
			exit29: ''
		},
		methods: {
			loadData: function() {
				var self = this;
				mui.plusReady(function() {
					var params = E.systemParam("V5.mobile.order.status.count");
					E.getData('orderStatusCount', params, function(data) {
						console.log(JSON.stringify(data))
						if(!data.isSuccess) {
							E.closeLoading()
							E.alert(data.map.errorMsg)
							return
						}
						self.homeData = data;
						self.op = E.getStorage("op");
						E.setStorage("address", data.address);
						(data.unAccpetCount > 0 || data.acceptCount > 0) ? (Page.openr.evalJS("Page.addNavIcon(true)")) : (Page.openr.evalJS("Page.addNavIcon(false)"))

					}, "get");
					self.loadList()
					self.loadGongzhong()
					self.calcAc()
				})
			},
			loadGongzhong: function() {
				var self = this
				var params = E.systemParam("V5.mobile.gongzhong.get")
				E.getData('gongzhongGet', params, function(data) {
					console.log(data)
					console.log(JSON.stringify(data))
					E.closeLoading()
					if(!data.isSuccess) {
						E.alert(data.map.errorMsg)
						return
					}
					data.gongzhong.logo = 'http://open.weixin.qq.com/qr/code/?username=' + data.gongzhong.appid;
					self.gongzhong = data.gongzhong;
					E.setStorage('logo', data.gongzhong.image)
					E.setStorage('perzfb', data.gongzhong.zfbImageUrl)
					E.setStorage('perwx', data.gongzhong.wxImageUrl)
				}, "get");
			},
			loadList: function() {
				var self = this
				var params = E.systemParam("V5.mobile.permission.function.search")
				E.getData('permissionFunctionSearch', params, function(data) {
					console.log(data)
					E.closeLoading()
					if(!data.isSuccess) {
						E.alert(data.map.errorMsg)
						return
					}

					var functionData = JSON.parse(data.functionData)
					console.log(functionData)
					var moreList = []
					for(var i = 0; i < functionData.length; i++) {
						if(functionData[i].moduleStatus != 1) {
							moreList.push(functionData[i].moduleId)
						}
						switch(functionData[i].moduleId) {
							case '1':
								self.exit1 = functionData[i].moduleStatus
								break;
							case '2':
								self.exit2 = functionData[i].moduleStatus
								break;
							case '4':
								self.exit4 = functionData[i].moduleStatus
								break;
							case '5':
								self.exit5 = functionData[i].moduleStatus
								break;
							case '7':
								self.exit7 = functionData[i].moduleStatus
								break;
							case '8':
								self.exit8 = functionData[i].moduleStatus
								break;
							case '9':
								self.exit9 = functionData[i].moduleStatus
								break;
							case '10':
								self.exit10 = functionData[i].moduleStatus
								break;
							case '11':
								self.exit11 = functionData[i].moduleStatus
								break;
							case '12':
								self.exit12 = functionData[i].moduleStatus
								break;
							case '13':
								self.exit13 = functionData[i].moduleStatus
								break;
							case '14':
								self.exit14 = functionData[i].moduleStatus
								break;
							case '15':
								self.exit15 = functionData[i].moduleStatus
								break;
							case '16':
								self.exit16 = functionData[i].moduleStatus
								break;
							case '20':
								self.exit20 = functionData[i].moduleStatus
								break;
							case '25':
								self.exit25 = functionData[i].moduleStatus
								break;
							case '26':
								self.exit26 = functionData[i].moduleStatus
								break;
							case '27':
								self.exit27 = functionData[i].moduleStatus
								break;
							case '28':
								self.exit28 = functionData[i].moduleStatus
								break;
							case '29':
								self.exit29 = functionData[i].moduleStatus
								break;
							default:
								break
						}
					}
					self.moreList = moreList

				}, "get");
			},
			goPage: function(url, type) {
				switch(url) {
					case '../createVip/createVip.html':
						E.openPreWindow('createVip')
						break;
					case 'caserIn':
						E.openPreWindow('caserIn')
						break;
					case 'moreList.html':
						E.openWindow('moreList.html', {
							moreList: this.moreList
						})
						break;
					default:
						E.openWindow(url, {
							type: type ? type : ''
						})
						break;
				}
			},
			exitLogin: function() {
				Page.openr.hide("pop-out");
				this.showAc = false;
			},
			showWx: function() {
				this.hasClick = true;
			},
			closeWx: function() {
				this.hasClick = false;
			},
			showWxtips: function(c) {
				this.wxTips = true;
				this.wxName = c == 0 ? "微商城" : "公众号";
			},
			showAcTab: function() {
				this.showAc = true;
			},
			closeAcTab: function() {
				this.showAc = false;
			},
			changeAc: function(c) {
				E.setStorage("op", c);
				this.loadData()
				this.showAc = false;
				this.calcAc();
			},
			openDataM: function(){
				plus.webview.create( "http://wx.hwops.cn/addons/hongplus_api/template/dataMonitor/index.html" ).show();
			},
			calcAc: function() {
				var accAr = JSON.parse(E.getStorage("tabAccount")) || [];
				this.accAr=[]
				for(var i = 0; i < accAr.length; i++) {
					console.log(accAr[i].userName)
					console.log(E.getStorage("op"))
					if(accAr[i].userName != E.getStorage("op")) {
						this.accAr.push(accAr[i])
					}
				}
				console.log(this.accAr)
			},
			delAc: function(c) {
				var self = this;
				E.alert("确定删除此账号？", function() {
					var allAc = JSON.parse(E.getStorage("tabAccount"));
					for(var i = 0; i < allAc.length; i++) {
						if(allAc[i].userName == c) {
							allAc.splice(i);
						}
					}
					self.accAr.splice(c);
					E.setStorage("tabAccount", JSON.stringify(allAc))
				})

			},
			closeWxtips: function(c) {
				if(c == 1) {
					if(this.wxName == "微商城") {
						this.goPage('../wxsame/wshop.html')
					} else {
						this.goPage('../wxsame/home.html')
					}
				}
				this.wxTips = false;
			},
			goToloc: function() {
				E.openWindow("../map/location.html")
			},
			reloadStore: function(c) {
				var self = this
				E.confirm("是否修改门店地址", function() {
					var params = E.systemParam("V5.mobile.store.update");
					params = mui.extend(params, {
						warehouseId: self.homeData.warehouseId,
						address: c
					})
					E.showLoading()
					E.getData('storeUpdate', params, function(data) {
						E.closeLoading()
						if(!data.isSuccess) {
							var mapmsg = data.map.errorMsg;
							E.alert(data.map.errorMsg)
							return
						}
						self.homeData.address = c
					}, "get")
				})
			}
		}
	}

}
Page.init()