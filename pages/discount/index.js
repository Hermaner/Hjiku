var Page = {
	ItemId: null,
	init: function() {
		this.vue = E.vue(this.vueObj), this.initConfig()
	},
	initConfig: function() {
		var self = this;
		mui.init({
			pullRefresh: {
				container: '#tochange',
				down: {
					contentrefresh: '下拉刷新中...',
					callback: self.pullRefreshDown
				},
				up: {
					contentdown: '上拉加载更多',
					contentrefresh: '正在刷新中...',
					callback: self.pullRefreshUp
				}
			}
		});
		mui.plusReady(function() {
			mui("#itemList").on('tap', ".couponList", function() {
				var pid = this.getAttribute("pid")
				self.vue.goDetail(pid)
			})
			mui.preload({
				id: 'getStore',
				url: 'getStore.html',
			})
			mui.preload({
				id: 'scanCoupon',
				url: 'scanCoupon.html',
			})
			self.vue.loadData()
		});
	},
	pullRefreshUp: function() {
		Page.vue.loadData()
	},
	pullRefreshDown: function() {
		mui('#tochange').pullRefresh().endPulldownToRefresh();
		Page.vue.loadData(1)
	},
	vueObj: {
		el: '#vue',
		data: {
			showData: true,
			noData: false,
			items: [],
			tabtype: 0
		},
		methods: {
			loadData: function(d) {
				var self = this;
				if(d) {
					this.showData=true
					this.noData = false
					Page.ItemId = null;
					this.items = []
				}
				var params = E.systemParam('V5.mobile.coupon.info.search');
				console.log(this.tabtype)
				params = mui.extend(params, {
					orderId: Page.ItemId || "",
					pageSize: 15,
					optype: "up",
					couponStatus: this.tabtype
				})
				console.log(params)
				E.getData('couponInfoSearch', params, function(data) {
					self.showData = false
					console.log(JSON.stringify(data))
					if(!data.isSuccess) {
						mui('#tochange').pullRefresh().endPullupToRefresh(true);
						if(data.map.errorMsg == '没有更多的数据') {
							mui('#tochange').pullRefresh().disablePullupToRefresh()
							if(d) {
								self.noData = true
							} else {
								E.alert(data.map.errorMsg)
							}
						}
						else{
							E.alert(data.map.errorMsg)
						}
						return
					}
					d && (plus.os.name == "Android" ? (window.scrollTo(0, 0)) : (mui('#tochange').pullRefresh().scrollTo(0, 0)));
					var coupons = data.coupons;
					self.items = self.items.concat(coupons);
					Page.ItemId = coupons[coupons.length - 1].orderId;
					mui('#tochange').pullRefresh().endPullupToRefresh(false);
					if(coupons.length < 15) {
						mui('#tochange').pullRefresh().endPullupToRefresh(true)
//						mui('#tochange').pullRefresh().disablePullupToRefresh()
					}
				}, "get")
			},
			checkItem: function(c) {
				if(mui("button")[c].classList.contains('cur')) {
					return
				} else {
					mui("button.cur")[0].classList.remove("cur")
					mui("button")[c].classList.add("cur")
				}
				this.tabtype = c;
				this.loadData(1)
				mui('#tochange').pullRefresh().endPullupToRefresh(false);
				mui("#tochange").pullRefresh().refresh(true);
				this.noData = false
				this.showData = true
			},
			copyCoupon: function(c) {
				if(plus.os.name == "Android") {
					var Context = plus.android.importClass("android.content.Context");
					var main = plus.android.runtimeMainActivity();
					var clip = main.getSystemService(Context.CLIPBOARD_SERVICE);
					plus.android.invoke(clip, "setText", c);
				} else {
					var UIPasteboard = plus.ios.importClass("UIPasteboard");
					//这步会有异常因为UIPasteboard是不允许init的，init的问题会在新版中修改
					var generalPasteboard = UIPasteboard.generalPasteboard();
					// 设置/获取文本内容:
					generalPasteboard.setValueforPasteboardType(c, "public.utf8-plain-text");
					var value = generalPasteboard.valueForPasteboardType("public.utf8-plain-text");
				}
				E.toast("复制成功")
			},
			goDetail:function(c){
				E.fireData('scanCoupon','',{
					couponId:c,
					type:'detail'
				})
			}
		}
	}

}
Page.init()