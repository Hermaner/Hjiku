var Page = {
	init: function() {
		this.vue = E.vue(this.vueObj), this.initConfig()
	},
	initConfig: function() {
		var self = this;
		mui.plusReady(function() {
			mui('.mui-scroll-wrapper').scroll();
		})
		mui("#listPopover").on("tap", "li", function() {
			var pid = this.getAttribute("pid");
			self.vue.type = pid;
			switch(pid) {
				case "productName":
					self.vue.searchType = "商品名称";
					break;
				case "productNumber":
					self.vue.searchType = "商品编码";
					break;
				case "skuName":
					self.vue.searchType = "规格名称";
					break;
				case "skuNumber":
					self.vue.searchType = "规格编码";
					break;
				case "barcode":
					self.vue.searchType = "商品条码";
					break;
				case "ourPrice":
					self.vue.searchType = "销售价";
					break;
				case "productId":
					self.vue.searchType = "商品自增长ID";
					break;
				case "productSN":
					self.vue.searchType = "SN码";
					break;
				default:
					break;
			}
			mui('#listPopover').popover('hide');
		});
	},
	vueObj: {
		el: '#cashrCart',
		data: {
			items: [],
			snItems: [],
			unsnItems: [],
			type: "productName",
			searchType: "商品名称",
			searchtext: "",
			fuzzyData: [],
			snAr: []
		},
		methods: {
			loadData: function(val, d) {
				var self = this;
				if(self.type == 'productSN'||d) {
					for(var i = 0; i < self.snAr.length; i++) {
						if(val == self.snAr[i]) {
							E.alert('搜索的SN码商品已存在');
							E.closeLoading()
							return;
						}
					}
				}
				var params = E.systemParam('V5.mobile.project.jiku.items.get');
				params = mui.extend(params, {
					condition: val,
					type: d ? "productSN" : this.type
				})
				E.showLoading()
				E.getData('jikuItemsGet', params, function(data) {
					E.closeLoading()
					console.log(data)
					if(!data.isSuccess) {
						E.alert(data.map.errorMsg)
						return
					}
					var products = data.products;
					var exit = 0;
					var snItems = 0;
					var unsnItems = 0;
					if(products.length == 1) {
						var barcode = products[0].productItemId;
						if(self.type == 'productSN'||d) {
							for(var i = 0; i < self.unsnItems.length; i++) {
								if(barcode == self.unsnItems[i].productItemId) {
									E.alert("购物车中存在普通商品");
									return;
								}
							}
							products[0].sn = val;
							for(var i = 0; i < self.snItems.length; i++) {
								if(barcode == self.snItems[i].productItemId) {
									self.snItems[i].snAr.push(val)
									snItems = 1;
								}
							}
							if(snItems == 0) {
								products[0].snAr = [];
								products[0].snAr.push(val)
								self.snItems = self.snItems.concat(products[0])
							}
							self.snAr.push(val);
						} else {
							for(var i = 0; i < self.snItems.length; i++) {
								if(barcode == self.snItems[i].productItemId) {
									E.alert("该商品已经存在SN码录入");
									return;
								}
							}
							products[0].sn = false;
							for(var i = 0; i < self.items.length; i++) {
								var thisCode = self.items[i].productItemId;
								if(thisCode == barcode) {
									mui(".ListTag")[i].querySelector("[type='number']").value = parseInt(mui(".ListTag")[i].querySelector("[type='number']").value) + 1;
									exit = 1;
								}
							};
							!exit && (self.unsnItems = self.unsnItems.concat(products[0]));
						}!exit && (self.items = self.items.concat(products[0]));
					} else {
						self.fuzzyData = (products);
						setTimeout(function() {
							E.showLayer(0)
						}, 0)

					}
					setTimeout(function() {
						E.numBtn()
					}, 0)

				}, "get")

			},
			addItems: function() {
				var self = this;
				E.showLoading()
				var listitems = []
				mui(".fuzzyTag").each(function() {
					var index = this.getAttribute("dex");
					var barcode = this.getAttribute("barcode");
					var exit = 0;
					if(this.querySelector("[type=checkbox]").checked) {
						if(self.items.length > 0) {
							for(var i = 0; i < self.snItems.length; i++) {
								if(barcode == self.snItems[i].productItemId) {
									E.alert("该商品已经存在SN码录入不能添加");
									return;
								}
							}
							for(var i = 0; i < self.items.length; i++) {
								var thisCode = self.items[i].productItemId;
								if(thisCode == barcode) {
									mui(".ListTag")[i].querySelector("[type='number']").value = parseInt(mui(".ListTag")[i].querySelector("[type='number']").value) + 1;
									exit = 1;
								}
							}
							if(!exit) {
								listitems = listitems.concat(self.fuzzyData[index]);
							}
						} else {
							listitems = listitems.concat(self.fuzzyData[index]);
						}

					}
				})
				setTimeout(function() {
					self.items = self.items.concat(listitems);
					self.unsnItems = self.unsnItems.concat(listitems);
					E.closeLoading()
					self.fuzzyData = []
					setTimeout(function() {
						E.numBtn();
					}, 0)
				}, 0)

			},
			searchItem: function(c, d) {
				var val = c || this.searchtext;
				if(!val) {
					E.alert("请输入要查询的条件")
					return
				}
				this.searchtext = ""
				E.showLoading()
				this.loadData(val, d);
			},
			delete: function(c, item) {
				var self = this;
				E.confirm("是否删除该商品", function() {
					self.items.splice(c, 1);
					if(item.sn) {
						for(var i = 0; i < self.snItems.length; i++) {
							for(var j = 0; j < self.snItems[i].snAr.length; j++) {
								if(self.snItems[i].snAr[j] == item.sn) {
									self.snItems[i].snAr.splice(j, 1);
									if(self.snItems[i].snAr.length == 0) {
										self.snItems.splice(i, 1);
									}
									for(var t = 0; t < self.snAr.length; t++) {
										if(self.snAr[t] == item.sn) {
											self.snAr.splice(t, 1);
											return;
										}
									}

								}
							}
						}
					} else {
						for(var i = 0; i < self.unsnItems.length; i++) {
							if(self.unsnItems[i] == item) {
								self.unsnItems.splice(i, 1);
								return;
							}
						}
					}
				})

			},
			closeMask: function() {
				this.fuzzyData = []
			},
			scanItem: function() {
				E.openWindow("../barcode/orderScan.html", {
					type: "cart"
				})
			},
			readyPay: function() {
				var self = this;
				var unsnItems = [];
				if(self.items.length == 0) {
					E.alert("请选择商品")
					return
				}
				for(var i = 0, len = mui(".ListTag").length; i < len; i++) {
					if(!this.items[i].sn) {
						this.items[i].count = mui(".ListTag")[i].querySelector("[type='number']").value;
					}
				}
				for(var i = 0; i < this.items.length; i++) {
					if(!this.items[i].sn) {
						unsnItems.push(this.items[i])
					}
				}
				var snItems = this.snItems;
				var hasMainPd = false;
				var hasDepositPd = false;
				if(snItems.length > 0) {
					hasMainPd = true;
					unsnItems.forEach((item) => {
						hasDepositPd = hasDepositPd || item.isDeposits === '1';
					});
				} else {
					unsnItems.forEach((item) => {
						hasMainPd = hasMainPd || item.isDeposits === '0';
						hasDepositPd = hasDepositPd || item.isDeposits === '1';
					});
				}
				if(!hasMainPd) {
					E.toast('请选择wifi商品');
					return;
				}
				if(!hasDepositPd) {
					E.toast('请选择押金商品');
					return;
				}
				E.fireData("cartDetail", 'pageshow', {
					unsnItems: unsnItems,
					snItems: snItems
				})

			}
		}
	}
}
Page.init();