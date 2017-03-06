var Page = {
	skuId: 0,
	init: function() {
		this.vue = E.vue(this.vueObj), this.initConfig()
	},
	initConfig: function() {
		var self = this
		mui.init();
		mui.plusReady(function() {
			self.ws = plus.webview.currentWebview();
			self.vue.type = self.ws.type;
			self.vue.orderNumber = self.ws.orderNumber;
			var wsItems = self.ws.items;
			var newItem = [];
			console.log(JSON.stringify(wsItems))
			for (var i = 0; i < wsItems.length; i++) {
				wsItems[i].count = parseInt(wsItems[i].count) - parseInt(wsItems[i].returnCount || 0);
				if (wsItems[i].count != 0) {
					newItem.push(wsItems[i]);
				}
			}
			self.wsItems = newItem;
			self.vue.items = newItem;
			if(self.vue.type=="ex"){
				self.initSku(newItem)
			}
			self.vue.$set("store", E.getStorage("store"));
			setTimeout(function() {
				E.numBtn()
			}, 0)
			var oldBack = mui.back;
			mui.back = function() {
				E.alert("操作尚未完成，是否确认退出？",function(){
					oldBack()
				})
			}
		})
	},
	initSku: function(c) {
		this.vue.loadSku(c[Page.skuId].productId, function(d) {
			if (Page.skuId < c.length) {
				Page.vue.skuDatas.push(d);
				Page.initSku(c);
			}
			Page.skuId++;

		})
	},
	vueObj: {
		el: '#vue',
		data: {
			orderNumber: "",
			skuDatas: [],
			type: "",
			items: [],
			extype: "STORE_SINCE",
		},
		methods: {
			loadSku: function(c, d) {
				var params = E.systemParam('V5.mobile.cart.item.search');
				console.log(c) 
				params = mui.extend(params, {
					condition: c,
					type: "productId"
				})
				E.getData('cartItemSearch', params, function(data) {
					console.log(JSON.stringify(data))
					E.closeLoading()
					if (!data.isSuccess) {
						E.alert(data.map.errorMsg)
						return
					}
					var productSkus = data.productSkus
					d(productSkus)
				}, "get")
			},
			deleteItem: function(c) {
				this.items.splice(c, 1)
			},
			returnGoods: function() {
				var self = this
				var goods = []
				for (var i = 0; i < this.items.length; i++) {
					goods.push({
						returnBarcode: this.items[i].productItemId,
						count: parseInt(this.items[i].count)
					})
				}
				if(goods.length<=0){
					E.alert("请选择退货商品")
					return
				}
				var returnData = {
					goods: goods
				}
				var params = E.systemParam('V5.mobile.return.goods');
				params = mui.extend(params, {
					orderNumber: this.orderNumber,
					returnData: JSON.stringify(returnData)
				})
			   
				E.showLoading()
				E.getData('returnGoods', params, function(data) {
					console.log(JSON.stringify(data))
					E.closeLoading()
					if (!data.isSuccess) {
						E.alert(data.map.errorMsg)
						return
					}
					self.completePay("退货成功,系统将在3个工作日内为顾客退款")
				})
			},
			exchangeGoods: function() {
				var self = this
				var goods = []
				for (var i = 0; i < this.items.length; i++) {
					var barcode = mui("#tolistdetail")[0].querySelectorAll("select")[i].value
					if (!barcode) {
						E.alert("请选择规格名称");
						return
					}
					goods.push({
						returnBarcode: this.items[i].productItemId,
						swapBarcode: barcode,
						count: parseInt(this.items[i].count)
					})
				}
				if(goods.length<=0){
					E.alert("请选择换货商品")
					return
				}
				var swapData = {
					goods: goods
				}
				E.showLoading()
				var params = E.systemParam('V5.mobile.swap.goods');
				params = mui.extend(params, {
					orderNumber: this.orderNumber,
					swapData: JSON.stringify(swapData),
					type: this.extype
				})
//				console.log(JSON.stringify(params))
//				return
				E.getData('swapGoods', params, function(data) {
					console.log(JSON.stringify(data))
					E.closeLoading()
					if (!data.isSuccess) {
						E.alert(data.map.errorMsg)
						return
					}
					self.completePay("换货成功")
				})
			},
			cexType: function(c) {
				this.extype = c;
				if (c == "STORE_SINCE") {
					if (mui("button")[0].classList.contains("active")) {
						return
					}
					mui("button")[0].classList.add("active")
					mui("button")[1].classList.remove("active")
				} else {
					if (mui("button")[1].classList.contains("active")) {
						return
					}
					mui("button")[1].classList.add("active")
					mui("button")[0].classList.remove("active")
				}

			},
			completePay: function(c) {
				var self=this;
				E.alert(c, function() {
					Page.ws.opener().evalJS("Page.vue.loadData('" + self.orderNumber + "')");
					Page.ws.hide('pop-out')
				})
			},
		}
	}
}
Page.init()