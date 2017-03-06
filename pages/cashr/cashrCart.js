var hotGoods = [{
		"barcode": "77888",
		"price": "99.00",
		"productItemId": "11",
		"productName": "2016新款马克杯",
		"productNumber": "77888",
		"productPic": "https://img.yzcdn.cn/upload_files/2016/12/23/FkkDhliuPp_fd0Mt3RHmdFc8Oi2H.jpg",
		"skuName": "单品",
		"skuNumber": "77888",
		"stock": "999",
		"warnStock": "999"
	},{
		"barcode": "36107330",
		"price": "158.00",
		"productItemId": "12",
		"productName": "烘培咖啡豆",
		"productNumber": "321957193",
		"productPic": "https://img.yzcdn.cn/upload_files/2016/12/23/Fjp2Dq-VWyIbMiX3ON_4lFfEcjNc.jpg",
		"skuName": "重量:1000克",
		"skuNumber": "36107330",
		"stock": "999",
		"warnStock": "999"
	},{
		"barcode": "12223",
		"price": "88.00",
		"productItemId": "13",
		"productName": "波点马克杯",
		"productNumber": "12445",
		"productPic": "https://img.yzcdn.cn/upload_files/2016/12/23/Fn_l_HvgSVW7j5s3C1JH2nu6OfgT.jpg",
		"skuName": "颜色:白",
		"skuNumber": "12223",
		"stock": "999",
		"warnStock": "999"
	},{
		"barcode": "12224",
		"price": "1.00",
		"productItemId": "14",
		"productName": "随机赠品一份",
		"productNumber": "12224",
		"productPic": "https://img.yzcdn.cn/upload_files/2016/12/23/Fmy7-2O_ahg97x650Fqo0Gpj30fi.jpg",
		"skuName": "单品",
		"skuNumber": "12224",
		"stock": "999",
		"warnStock": "999"
	},{
		"barcode": "8900",
		"price": "199.00",
		"productItemId": "15",
		"productName": "超级英雄马克杯套装",
		"productNumber": "8900",
		"productPic": "https://img.yzcdn.cn/upload_files/2016/12/23/FiPkhAvKnToUypl7OId5R3Po7nlU.jpg",
		"skuName": "单品",
		"skuNumber": "8900",
		"stock": "999",
		"warnStock": "999"
	},{
		"barcode": "765",
		"price": "58.00",
		"productItemId": "16",
		"productName": "猫猫马克杯",
		"productNumber": "77888",
		"productPic": "https://img.yzcdn.cn/upload_files/2016/12/23/FkMhRJV4IQzeV_57HxaUKeoWFQnF.jpg",
		"skuName": "单品",
		"skuNumber": "765",
		"stock": "999",
		"warnStock": "999"
	},{
		"barcode": "521",
		"price": "0.18",
		"productItemId": "17",
		"productName": "白砂糖",
		"productNumber": "77888",
		"productPic": "https://img.yzcdn.cn/upload_files/2016/12/23/FvyjxPbD_g6FCZxecGgWBZm98ILa.jpg",
		"skuName": "单品",
		"skuNumber": "521",
		"stock": "999",
		"warnStock": "999"
	},{
		"barcode": "621",
		"price": "0.19",
		"productItemId": "18",
		"productName": "纯正优质金黄赤砂糖",
		"productNumber": "77888",
		"productPic": "https://img.yzcdn.cn/upload_files/2016/12/23/FoBeE4CeUbBMLq9nAY_Apo4E2KoL.jpg",
		"skuName": "单品",
		"skuNumber": "621",
		"stock": "999",
		"warnStock": "999"
	},{
		"barcode": "721",
		"price": "29.00",
		"productItemId": "19",
		"productName": "奶油球 植脂奶精球",
		"productNumber": "77888",
		"productPic": "https://img.yzcdn.cn/upload_files/2016/12/23/FrRliX-VfObrh8RIpz2tQGaeupFG.jpg",
		"skuName": "单品",
		"skuNumber": "721",
		"stock": "999",
		"warnStock": "999"
	}]


var goodsActionPage = {
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
			mui('.mui-scroll-wrapper').scroll();
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
					case "infrared":
						self.vue.searchType = "红外扫描";
						break;
					default:
						break;
				}
				mui('#listPopover').popover('hide');
			});
			if(E.getStorage("holdData")) {
				mui("#holdBtn")[0].innerText = "取消挂起"
			} else {
				mui("#holdBtn")[0].innerText = "挂起"
			}
			self.cashrChart = mui.preload({
				id: 'cashrDetail.html',
				url: 'cashrDetail.html',
			});
		})
	},
	vueObj: {
		el: '#cashrCart',
		data: {
			items: [],
			type: "productName",
			searchType: "商品名称",
			title: "",
			searchtext: "",
			hasImei: false,
			selectListData: {},
			fuzzyData: []
		},
		methods: {
			loadData: function(val, d) {
				var self = this;
				var params = E.systemParam('V5.mobile.cart.item.search');
				params = mui.extend(params, {
					condition: val,
					type: d ? "barcode" : this.type
				})
				E.showLoading()
				E.getData('cartItemSearch', params, function(data) {
					E.closeLoading()
					console.log(JSON.stringify(data))
					if(!data.isSuccess) {
						E.alert(data.map.errorMsg)
						return
					}
					var products = data.productSkus;
					var exit = 0;
					if(products.length == 1) {
						var barcode = products[0].productItemId;
						for(var i = 0; i < self.items.length; i++) {
							var thisCode = self.items[i].productItemId;
							if(thisCode == barcode) {
								mui(".ListTag")[i].querySelector("[type='number']").value = parseInt(mui(".ListTag")[i].querySelector("[type='number']").value) + 1;
								exit = 1;
							}
						};
						!exit && (self.items = self.items.concat(products[0]))
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
			delete: function(c) {
				var self = this;
				E.confirm("是否删除该商品", function() {
					self.items.splice(c, 1)
				})
			},
			closeMask: function() {
				this.fuzzyData = []
			},
			showHotgoods: function() {
				this.fuzzyData = hotGoods;
				setTimeout(function() {
					E.showLayer(0)
				}, 0)
			},
			holdAll: function() {
				var self = this;
				if(E.getStorage("holdData")) {
					if(this.items.length > 0) {
						E.confirm("是否取消挂起清空购物车", function() {
							self.items = JSON.parse(E.getStorage("holdData"))
							mui("#holdBtn")[0].innerText = "挂起";
							E.removeStorage("holdData")
							setTimeout(function() {
								E.numBtn()
							}, 0)
						})
					} else {
						self.items = JSON.parse(E.getStorage("holdData"))
						mui("#holdBtn")[0].innerText = "挂起";
						E.removeStorage("holdData")
						setTimeout(function() {
							E.numBtn()
						}, 0)
					}

				} else {
					if(this.items.length <= 0) {
						E.alert("请选择商品")
						return
					}
					for(var i = 0, len = mui(".ListTag").length; i < len; i++) {
						this.items[i].count = mui(".ListTag")[i].querySelector("[type='number']").value;
						console.log(mui(".ListTag")[i].querySelector("[type='number']").value)
					}
					E.setStorage("holdData", JSON.stringify(this.items))
					this.items = [];
					mui("#holdBtn")[0].innerText = "取消挂起"
				}

			},
			scanItem: function() {
				E.openWindow("../barcode/orderScan.html", {
					type: "cart"
				})
			},
			readyPay: function() {
				var self = this;
				var stock = []
				for(var i = 0, len = mui(".ListTag").length; i < len; i++) {
					this.items[i].count = mui(".ListTag")[i].querySelector("[type='number']").value;
				}
				for(var i = 0; i < this.items.length; i++) {
					if(parseInt(this.items[i].stock) < parseInt(this.items[i].count)) {
						stock.push(this.items[i].productName)
					}
				}
				if(stock.length > 0) {
					E.alert(stock.join(',') + "库存不足")
					return
				}
				if(self.items.length == 0) {
					E.alert("请选择商品")
					return
				}

				E.fireData("cashrDetail.html", 'detailShow', {
					data: self.items
				})

			}
		}
	}
}
goodsActionPage.init();