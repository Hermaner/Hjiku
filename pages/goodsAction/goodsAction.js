var Page = {
	init: function() {
		this.vue = E.vue(this.vueObj), this.initConfig()
	},
	initConfig: function() {
		var self = this;
		mui.init({
			swipeBack: false,
		});
		mui.plusReady(function() {
			E.getStorage("imei") == 1 && (self.vue.hasImei = true);
			var ws = plus.webview.currentWebview();
			self.vue.type = ws.type;
			if (ws.type == "storage") {
				self.vue.title = "商品入库"
			} else {
				self.vue.title = "商品盘点"
			}
			E.initDataurl("urlHref", function(url, e) {
				E.openWindow(url, {
					type: "itemAction"
				})
			})
		})
	},
	vueObj: {
		el: '#goodesAction',
		data: {
			items: [],
			type: "",
			title: "",
			searchtext: "",
			hasImei: false,
			suppliers: []
		},
		methods: {
			loadData: function(val) {
				console.log(val)
				var self = this;
				var params = E.systemParam('V5.mobile.cart.item.search');
				params = mui.extend(params, {
					condition: val,
					type: "infrared"
				})
				E.showLoading()
				console.log(JSON.stringify(params))
				E.getData('cartItemSearch', params, function(data) {
					console.log(JSON.stringify(data))
					E.closeLoading()
					if (!data.isSuccess) {
						E.alert(data.map.errorMsg)
						return
					}
					var products = data.productSkus;
					var listitems = []
					for (var j = 0; j < products.length; j++) {
						if (self.items.length > 0) {
							var exit = 0;
							for (var i = 0; i < self.items.length; i++) {
								var thisCode = self.items[i].barcode;
								if (thisCode == products[j].barcode) {
									mui(".ListTag")[i].querySelector("[type='number']").value = parseInt(mui(".ListTag")[i].querySelector("[type='number']").value) + 1;
									exit = 1;
								}
							}
							if (!exit) {
								listitems = listitems.concat(products[j]);
							}
						} else {
							listitems = listitems.concat(products[j]);
						}
					}
					self.items = self.items.concat(listitems);

					setTimeout(function() {
						E.numBtn()
					}, 0)
				}, "get")
			},
			searchItem: function(c) {
				var val = c || this.searchtext;
				if (!val) {
					E.alert("请输入要查询的条件")
					return
				}
				this.searchtext = ""
				E.showLoading()
				this.loadData(val);

			},
			actionSave: function() {
				if (this.type == "storage") {
					this.selectSupplier()
				} else {
					this.saveFn()
				}
			},
			saveFn: function() {
				var self = this;
				var params, urlPath;
				var product = [];
				for (var i = 0; i < mui(".ListTag").length; i++) {
					product.push({
						barcode: self.items[i].productItemId,
						stock: mui(".ListTag")[i].querySelector("[type=number]").value
					})
				}
				var products = {
					products: product
				}
				console.log(JSON.stringify(products))
				if (this.type == "storage") {
					var vid;
					mui(".supplierDiv").each(function() {
						if (this.querySelector("[type=radio]").checked) {
							vid = this.querySelector("[type=radio]").getAttribute("vid");
						}
					})
					if (!vid) {
						return
					}
					params = E.systemParam("V5.mobile.stock.incoming");
					urlPath = "stockIncoming";
					params = mui.extend(params, {
						incomingData: JSON.stringify(products),
						uniqueCode: E.uniqueCode(),
						supplierName: vid
					})
				} else {
					params = E.systemParam('V5.mobile.stock.check.confirm');
					urlPath = "stockCheckConfirm";
					params = mui.extend(params, {
						stockCheckData: JSON.stringify(products),
						uniqueCode: E.uniqueCode()
					})
				}
				E.showLoading()
				E.getData(urlPath, params, function(data) {
					E.closeLoading()
					if (!data.isSuccess) {
						E.alert(data.map.errorMsg)
						return
					}
					self.isSelect = false;
					E.alert("保存成功")
					self.closeMask()
					self.items = [];

				})

			},
			delete: function(c) {
				var self = this;
				E.confirm("是否删除所选商品？", function() {
					self.items.splice(c, 1)
				})
			},
			selectSupplier: function(callBack) {
				var self = this;
				var params = E.systemParam('V5.mobile.supplier.search');
				E.showLoading()
				E.getData('supplierSearch', params, function(data) {
					E.closeLoading()
					if (!data.isSuccess) {
						E.alert(data.map.errorMsg)
						return
					}
					self.suppliers = data.suppliers;
					setTimeout(function() {
						E.showLayer(0)
					}, 0)
				}, "get")
			},
			closeMask: function() {
				this.suppliers = []
			}
		}
	}
}
Page.init();