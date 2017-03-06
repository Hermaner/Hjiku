
var Page = {
	subpages: E.subpages,
	activeTab: E.subpages[0],
	login: 0,
	init: function() {
		this.vue = E.vue(this.vueObj), this.initConfig(), this.muiEvent()
	},
	initConfig: function() {
		var self = this;
		mui.init({});
		mui.plusReady(function() {
			var ws = plus.webview.currentWebview();
			for(var i = 0, len = self.subpages.length; i < len; i++) {
				(function(arg) {
					var subBottom = {
						top: '0px',
						bottom: '50px'
					}
					if(E.getStorage("vendor") == 0) {
						subBottom = {
							top: '0px',
							bottom: '70px'
						}
					}
					var sub = plus.webview.create(self.subpages[arg], self.subpages[arg], subBottom);
					switch(arg) {
						case 0:
							self.homePage = sub;
							break;
						case 1:
							self.goodsPage = sub;
							sub.hide();
							break;
						case 2:
							self.orderPage = sub;
							sub.hide();
							break;
						case 3:
							self.morePage = sub;
							sub.hide();
							break;
						default:

					}
					ws.append(sub);
				})(i);
			};
			var old_back = mui.back;
			mui.back = function() {
				if(confirm("确定退出吗？")) {
					plus.runtime.quit();
				}
			};
			plus.push.addEventListener("click", function(msg) {
				var payload = msg.payload;
				if(payload.payload) {
					return
				}
				E.confirm('有新订单，是否立即跳转？', function() {
					self.goToDetail(payload)
				})
			}, false);
			plus.push.addEventListener("receive", function(msg) {
				var payload = msg.payload;
				if(payload.payload) {
					return
				}
				E.confirm('有新订单，是否立即跳转？', function() {
					self.goToDetail(payload)
				})
			}, false);
			document.addEventListener("resume", function() {
				if(self.login == 1) {
					self.resumeEvent();
					E.getStorage("vendor") == 0 && (self.loadWidgetConfig())

				}
			}, false);
		});
	},
	loadChild: function(c) {
		this.login = 1;
		this.homePage.evalJS("Page.vue.loadData()");
		mui.preload({
			id: 'orderDetail',
			url: '../order/orderDetail.html',
		})
		mui.preload({
			id: 'pushSet',
			url: '../more/pushSet.html',
		})
		mui.preload({
			id: 'createVip',
			url: '../createVip/createVip.html',
		})
		mui.preload({
			id: 'createAddress.html',
			url: '../createVip/createAddress.html',
		})
		mui.preload({
			id: 'caserIn',
			url: '../caserIn/index.html',
		})
		E.getWebview(E.preloadPages[1]).evalJS("pushPage.loadData()");
		c && c != 0 && (this.loadWidgetConfig(c))
	},
	resumeEvent: function() {
		plus.runtime.setBadgeNumber(0);
		var topUrl = plus.webview.getTopWebview().getURL();
		if(topUrl.indexOf('tab/tab.html') > 0) {
			var url = mui(".mui-active")[0].getAttribute('data-href');
			this.loadEvent(url)
		}
	},
	muiEvent: function() {
		var self = this
		mui("[data-href]").each(function() {
			this.addEventListener("tap", function() {
				var url = this.getAttribute("data-href");
				if(url == self.activeTab) return;
				self.loadEvent(url)
				E.showWebview(url), E.hideWebview(self.activeTab), self.activeTab = url;
			})
		})
	},
	loadEvent: function(c) {
		E.showLoading();
		switch(c) {
			case this.subpages[0]:
				this.homePage.evalJS("Page.vue.loadData()")
				break;
			case this.subpages[1]:
				this.goodsPage.evalJS("Page.vue.loadData('',1)")
				break;
			case this.subpages[2]:
				this.orderPage.evalJS("Page.vue.loadData('','',1)")
				break;
			default:
				E.closeLoading()
				break;
		}
	},
	goToDetail: function(c) {
		E.fireData(E.preloadPages[0], 'detailShow', {
			orderNumber: c
		})
	},
	addNavIcon: function(c) {
		this.vue.hasCount = c
	},
	orderBack: function(c) {
		E.showLoading()
		this.orderPage.evalJS("Page.vue.loadData('" + c + "','',1)");
		mui("a")[0].classList.remove("mui-active")
		mui("a")[2].classList.add("mui-active")
		this.activeTab = this.subpages[2];
	},
	moreBack: function() {
		mui("a")[3].classList.remove("mui-active")
		mui("a")[0].classList.add("mui-active")
		E.showWebview(this.subpages[0]), E.hideWebview(this.subpages[3])
		this.activeTab = this.subpages[0];
	},
	vueObj: {
		el: '#vue',
		data: {
			hasCount: false
		}
	},
	loadWidgetConfig: function(c) {
		// 获取类的静态常量属性
		var config = plus.android.newObject("io.dcloud.widget.WidgetTurnConifg");
		var pageType = c || plus.android.getAttribute(config, "type");
		//根据type类型来加载不同的页面
		//启动页面 1：首页，2：优惠券管理，3：面对面发券，4：快捷收款，5：会员管理
		var htmlName, type = '';
		plus.android.setAttribute(config, "type", 0);
		if(pageType == 1) {} else if(pageType == 2) {
			if(plus.webview.getTopWebview().getURL().indexOf('discount') > 0) {
				return
			}
			htmlName = "../discount/index.html";
		} else if(pageType == 3) {
			if(plus.webview.getTopWebview().getURL().indexOf('sendcoupon') > 0) {
				return
			}
			htmlName = "../sendcoupon/index.html";
		} else if(pageType == 4) {
			if(plus.webview.getTopWebview().getURL().indexOf('caserIn') > 0) {
				return
			}
			htmlName = "../caserIn/index.html";
		} else if(pageType == 5) {

			if(plus.webview.getTopWebview().getURL().indexOf('memberlibrary') > 0) {
				return
			}
			htmlName = "../memberlibrary/index.html";
		}
		if(pageType && pageType != 0 && htmlName) {
			E.openWindow(htmlName)
			setTimeout(function() {
				if(E.getWebview('../discount/index.html') && pageType != 2) {
					E.hideWebview("../discount/index.html")
					E.getWebview('../discount/index.html').evalJS("mui.mack()")
				} else if(E.getWebview('../sendcoupon/index.html') && pageType != 3) {
					E.hideWebview("../sendcoupon/index.html")
					E.getWebview('../sendcoupon/index.html').evalJS("mui.mack()")
				} else if(E.getWebview('../caserIn/index.html') && pageType != 4) {
					E.hideWebview("../caserIn/index.html")
					E.getWebview('../caserIn/index.html').evalJS("mui.mack()")
				} else if(E.getWebview('../memberlibrary/index.html') && pageType != 5) {
					E.hideWebview("../memberlibrary/index.html")
					E.getWebview('../memberlibrary/index.html').evalJS("mui.mack()")
				}
			}, 1000)

		}

	}
};

Page.init()