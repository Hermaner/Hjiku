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
				up: {
					contentdown: '上拉加载更多',
					contentrefresh: '正在刷新中...',
					callback: self.pullRefreshdown
				}
			}
		});
		mui.plusReady(function() {
			E.getStorage("imei") == 1 && (self.vue.hasImei = true);
			mui("#itemList").on('tap', "li", function() {
				var dex = parseInt(this.getAttribute("dex"))
				E.openWindow("goodsDetail.html", {
					items: self.vue.items[dex]
				})

			})
		})
	},
	pullRefreshdown: function() {
		Page.vue.loadData()
	},
	vueObj: {
		el: '#goods',
		data: {
			items: [],
			searchtext: '',
			searchtextShadow: '',
			hasImei: false
		},
		methods: {
			loadData: function(scrollBackToTop) {
				var self = this;
				var params = E.systemParam('V5.mobile.item.sku.search');
				var productItemId = '';
				if(self.items.length>0){
					productItemId = self.items[self.items.length-1].productItemId;
				}
				params = mui.extend(params, {
					condition: self.searchtext,
					productItemId: productItemId,
					pageSize: 15,
					optype: "up",
				})
				E.showLoading();
				E.getData('itemSkuSearch', params, function(data) {
					E.closeLoading();
					if (!data.isSuccess) {
						E.alert(data.map.errorMsg)
						mui('#tochange').pullRefresh().endPullupToRefresh(true)
						return
					}
					var products = data.productSkus;
					self.items = self.items.concat(products);
					if(scrollBackToTop) {
						plus.os.name == "Android" ? (window.scrollTo(0, 0)) : (mui('#tochange').pullRefresh().scrollTo(0, 0))
					}
					if(products.length < 15) {
						mui('#tochange').pullRefresh().endPullupToRefresh(true)
					}
					mui('#tochange').pullRefresh().endPullupToRefresh(false)
					// searchKeyWorld && (mui('#tochange').pullRefresh().disablePullupToRefresh())
				}, "get")
			},
			searchItem: function() {
				this.searchtext = this.searchtextShadow;
				this.items=[];
				mui("#tochange").pullRefresh().refresh(true);
				mui('#tochange').pullRefresh().enablePullupToRefresh();
				this.loadData(true);
			},
			goItemScan: function() {
				E.openWindow("../barcode/orderScan.html", {
					type: "item"
				})
			}
		}
	}
}
Page.init()
