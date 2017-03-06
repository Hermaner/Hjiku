var Page = {
	init: function() {
		this.vue = E.vue(this.vueObj), this.initConfig(), this.muiEvent()
	},
	initConfig: function() {
		var self = this;
		mui.init();
		mui.plusReady(function() {
			mui('.mui-scroll-wrapper').scroll();
			self.orderListPage = E.getWebview(E.subpages[2]);
			window.addEventListener('detailShow', function(event) {
				self.vue.items = event.detail.data;
				self.vue.$set('store', E.getStorage("store"))
				self.vue.$set('op', E.getStorage("op"))
				self.vue.$set('thisData', (new Date()).Format("yyyy-MM-dd hh:mm:ss"))
				self.vue.loadpayType();
				E.delscroll()
			})
			E.getStorage("vendor") == 0 && (self.vue.registerCashierReceiver())
		})
		var old_back = mui.back;
		mui.back = function() {
			plus.webview.currentWebview().hide("pop-out")
			self.vue.configInit();
			self.vue.payments = [];
			self.vue.coupon = 0;
			self.vue.fee = 0;
			self.vue.denomination = 0;
			self.vue.entryCoupon = 0;
			self.vue.entryPrice = 0;
			self.vue.coudisPrice = 0;
			self.vue.memdisPrice = 0;
			self.vue.allPrice = 0;
			self.vue.discount = 10;
			self.vue.giveGoods = false;
			self.vue.showCardpay = false;
			self.vue.giveGoodsContent = [];
			self.vue.giveUrl = "";
			self.vue.erpMemo = "";
			self.vue.memberMsg = null;
			self.vue.memberDiscount = 1;
			self.vue.paymentType = "";
			self.vue.showPersonpay = false;
			self.vue.payimg ="";
			mui('#dispatchPopover').popover('hide');
			mui('#payPopover').popover('hide');
			mui('#discountPopover').popover('hide');
			mui('#dismore').popover('hide');
		}
	},
	muiEvent: function() {
		var self = this
		E.initDataurl("sendId", function(sendId) {
			mui('#dispatchPopover').popover('hide');
			mui("#dispatchPopover")[0].removeAttribute("style")
			if(sendId == "SINCE") {
				self.vue.fee = 0;
				self.vue.sendType = sendId;
				self.vue.addressObj = null
			} else if(sendId == "STORE_DELIVER") {
				E.openWindow("getAddress.html", {
					sendId: sendId,
					tel: self.vue.memberMsg ? self.vue.memberMsg.mobilePhone : ""
				})
			} else {
				E.openWindow("getAddress.html", {
					sendId: sendId,
					tel: self.vue.memberMsg ? self.vue.memberMsg.mobilePhone : ""
				})
			}

		})
		mui("#payPopover").on('tap', "li", function() {
			var pid = this.getAttribute("pid");
			mui("#payPopover")[0].removeAttribute("style")
			mui('#payPopover').popover('hide');
			self.vue.paymentName = this.innerText.trim();
			self.vue.paymentType = pid;
			self.vue.createOrder(pid)

		})
		mui("#dismore").on('tap', "li", function() {

			var pid = this.getAttribute("pid");
			mui("#dismore")[0].removeAttribute("style")
			mui('#dismore').popover('hide');
			if(pid == 'cp') {
				E.prompt('原订单金额：' + self.vue.totalPrice, '请输入修改金额', function(c) {
					if(!c) {
						E.alert("请输入修改金额");
						return
					}
					var reNum = /^\d+(.\d{1,2})?$/;
					if(!reNum.test(c)) {
						E.alert('请输入正确金额')
						return
					}
					var price = parseFloat(self.vue.allPrice) - parseFloat(self.vue.coudisPrice) - parseFloat(self.vue.memdisPrice)
					self.vue.entryPrice = c;
					self.vue.entryCoupon = parseFloat(price) - parseFloat(c)
				})
			} else if(pid == 'vp') {
				self.vue.goVipinfo()
			}

		})

	},
	getFee: function(c) {
		var self = this
		var params = E.systemParam("V5.mobile.freight.get");
		params.type = c;
		E.getData('freightGet', params, function(data) {
			if(!data.isSuccess) {
				E.alert(data.map.errorMsg)
				return
			}
			self.vue.fee = (data.freight).freightFee
		}, "get")
	},
	getCoupon: function(c) {
		var self = this
		var params = E.systemParam("V5.mobile.freight.get");
		params.type = c;
		E.getData('freightGet', params, function(data) {
			if(!data.isSuccess) {
				E.alert(data.map.errorMsg)
				return
			}
			self.vue.fee = (data.freight).freightFee
		}, "get")
	},
	vueObj: {
		el: '#cashrDetail',
		data: {
			items: [],
			fee: 0,
			sendType: "SINCE",
			couponName: "",
			orderNumber: "",
			coupon: 0,
			coupons: 0,
			denomination: 0,
			discount: 10,
			giveGoods: false,
			giveGoodsContent: [],
			cardType: '',
			giveUrl: "",
			oldcoupon: 0,
			entryCoupon: 0,
			entryPrice: 0,
			coudisPrice: 0,
			memdisPrice: 0,
			allPrice: 0,
			couponCode: "",
			erpMemo: "",
			addressObj: null,
			memberMsg: false,
			showCardpay: false,
			payPopoverShow: false,
			memberCardNumber: "",
			password: "",
			memberDiscount: 1,
			fullRoleName: "",
			fullRoleshow: false,
			fullRoles: [{
				"full": "100",
				"cut": "20"
			}, {
				"full": "200",
				"cut": "40"
			}, {
				"full": "300",
				"cut": "60"
			}, {
				"full": "400",
				"cut": "80"
			}],
			payments: [],
			paymentName: "",
			paymentType:"",
			showPersonpay: false,
			payimg: ""
		},
		methods: {
			loadpayType: function() {
				var self = this;
				var params = E.systemParam("V5.mobile.paymentType.search");
				E.showLoading()
				E.getData('paymentTypeSearch', params, function(data) {
					console.log(JSON.stringify(data))
					E.closeLoading()
					if(!data.isSuccess) {
						E.alert(data.map.errorMsg)
						return
					}
					self.payments = data.payments;
				}, "get")
			},

			configInit: function() {
				this.fee = 0, this.sendType = "SINCE", this.couponName = "", this.coupon = 0, this.fullRoleName = "", this.addressObj = null
			},
			closeMask: function() {
				this.fullRoleshow = false
			},
			closeCardpay: function() {
				this.showCardpay = false
			},
			gocardScan: function(){
				E.openWindow("../barcode/orderScan.html", {
					type: "cashcard"
				})
			},
			getCardNumber: function(c){
				this.memberCardNumber=c;
			},
			createOrder: function(c) {
				var self = this;
				var products = [];
				for(var i = 0; i < this.items.length; i++) {
					products.push({
						barcode: this.items[i].productItemId,
						stock: this.items[i].count
					})
				}
				var giftProducts = []
				for(var i = 0; i < this.giveGoodsContent.length; i++) {
					giftProducts.push({
						gifted: this.giveGoodsContent[i].promotionId,
						freeCount: this.giveGoodsContent[i].freeCount,
						productItemId: this.giveGoodsContent[i].productItemId
					})
				}
				var orderData = {
					postFee: this.fee,
					couponCode: this.couponCode,
					actualAmount: this.totalPrice,
					salesOrderAgioMoney: this.coupons,
					erpMemo: this.erpMemo,
					buyer: {
						consignee: this.addressObj ? this.addressObj.consignee : "",
						mobile: this.addressObj ? this.addressObj.mobilePhone : "",
						address: this.addressObj ? this.addressObj.address : ""
					},
					products: products,
					giftProducts: giftProducts,
					discount: this.memberDiscount
				}
				var params = E.systemParam('V5.mobile.order.create');
				params = mui.extend(params, {
					orderData: JSON.stringify(orderData),
					uniqueCode: E.uniqueCode(),
					type: this.sendType,
				});

				E.showLoading()
				E.getData('orderCreate', params, function(data) {
					console.log(JSON.stringify(data))
					E.closeLoading()
					if(!data.isSuccess) {

						E.alert(data.map.errorMsg)
						return
					}
					self.orderNumber = data.orderNumber;
					self.paySwitch(c)
				})
			},
			paySwitch: function(c) {
				mui('#payPopover').popover('hide');
				if(this.paymentType == "19" || this.paymentType == "20") {
					this.openPersonpay()
					return
				}
				switch(c) {
					case "6":
						this.barcodePay(c)
						break;
					case "14":
						if(E.getStorage("vendor") == 0) {
							this.doPosCashier(c);
						} else {
							this.payMent(c)
						}
						break;
					case "15":
						this.barcodePay(c)
						break;
					case "17":
						this.mixPay()
						break;
					case "16":
						this.cardMethod()
						break;
					default:
						this.payMent(c)
						break;
				}
			},
			barcodePay: function(c) {
				E.openWindow("../barcode/payment.html", {
					orderNumber: this.orderNumber,
					pid: c,
					amount: this.totalPrice
				})
			},
			openPersonpay: function() {
				this.showPersonpay = true;
				this.payimg = this.paymentType == "19" ? E.getStorage("perzfb") : E.getStorage("perwx")
			},
			closePersonpay: function() {
				this.showPersonpay = false
			},
			personPay: function() {
				this.payMent()
			},
			mixPay: function() {
				E.openWindow("mixPay.html", {
					orderNumber: this.orderNumber,
					totalPrice: this.totalPrice,
					memberCardNumber: this.memberMsg ? this.memberMsg.memberCardNumber : null
				})
			},
			cardMethod: function() {
				E.closeLoading()
				var self = this;
				if(this.memberMsg && this.memberMsg.memberCardNumber) {
					E.prompt('输入会员卡密码：', '输入会员卡密码', function(c) {
						if(!c) {
							E.toast("请输入");
							return
						}
						self.password = c;
						self.memberCardNumber = self.memberMsg.memberCardNumber;
						self.cardPay()
					})
				} else {
					this.showCardpay = true;
					setTimeout(function() {
						E.showLayer(0)
					}, 100)
				}

			},
			cardPay: function() {
				var self = this;
				if(!this.password || !this.memberCardNumber) {
					E.toast("信息不全");
					return
				}
				var params = E.systemParam("V5.mobile.order.alipay");
				params = mui.extend(params, {
					orderNumber: this.orderNumber,
					authCode: '',
					password: this.password,
					memberCardNumber: this.memberCardNumber,
					paymentType: 16
				})
				E.showLoading()
				E.getData('orderAlipay', params, function(data) {
					console.log(JSON.stringify(data))
					E.closeLoading()
					if(!data.isSuccess) {
						E.alert(data.map.errorMsg);
						return
					}
					self.payPrinter()
					self.completePay("支付成功")
				}, "get")
			},
			payMent: function(c) {
				var self = this
				var params = E.systemParam("V5.mobile.order.alipay");
				params = mui.extend(params, {
					orderNumber: this.orderNumber,
					authCode: '',
					password: "",
					memberCardNumber: "",
					paymentType: this.paymentType
				})
				E.showLoading()
				E.getData('orderAlipay', params, function(data) {
					E.closeLoading()
					if(!data.isSuccess) {
						E.alert(data.map.errorMsg);
						return
					}
					self.payPrinter()
					self.completePay("支付成功")
				}, "get")
			},
			saveRoles: function() {
				var full, cut;
				mui(".supplierDiv").each(function() {
					if(this.querySelector("[type=radio]").checked) {
						full = this.querySelector("[type=radio]").getAttribute("full");
						cut = this.querySelector("[type=radio]").getAttribute("full");
					}
				})
				if(full) {
					if(parseFloat(this.mprice) < parseFloat(full)) {
						E.alert("该优惠码未满足优惠条件！");
						return
					}
					this.fullRoleName = "满" + full + "减" + cut;
					this.coupon = parseInt(this.coupon) + parseInt(cut);
					this.fullRoleshow = false
				}

			},
			loadFullRoles: function() {
				mui('#discountPopover').popover('hide');
				mui("#discountPopover")[0].removeAttribute("style")
				this.fullRoleshow = true;
				setTimeout(function() {
					E.showLayer(0)
				}, 0)

			},
			enterCoupon: function() {
				mui('#discountPopover').popover('hide');
				mui("#discountPopover")[0].removeAttribute("style")
				var self = this;
				E.prompt('输入优惠码：', '请输入优惠码', function(c) {
					if(!c) {
						E.alert("请输入优惠码");
						return
					}
					self.loadCoupon(c)
				})

			},
			scanCoupon: function() {
				mui('#discountPopover').popover('hide');
				mui("#discountPopover")[0].removeAttribute("style")
				var self = this;
				E.openWindow("../barcode/orderScan.html", {
					type: "coupon",
					mprice: self.totalPrice
				})

			},
			loadCoupon: function(c) {
				var self = this;
				var params = E.systemParam("V5.mobile.order.coupon.get");
				params = mui.extend(params, {
					couponCode: c
				})
				E.getData('couponGet', params, function(data) {
					console.log(data)
					console.log(JSON.stringify(data))
					if(!data.isSuccess) {
						E.alert(data.map.errorMsg)
						return
					}
					data = data.coupon
					var conditions = data.conditions;
					var beginning = data.beginning
					var termination = data.termination
					var nowing = new Date()
					beginning = new Date(beginning.replace(/-/g, "/"));
					termination = new Date(termination.replace(/-/g, "/"));
					self.denomination = 0;
					self.discount = 10;
					self.memberDiscount = 1;
					self.giveUrl = ''
					self.giveGoods = false
					self.couponCode = '';
					self.giveGoodsContent = []
					if(termination < nowing) {
						E.alert('优惠劵已失效！')
						return
					}
					if(beginning > nowing) {
						E.alert('优惠劵未开始！')
						return
					}
					switch(data.couponType) {
						case "1": //满减
							var denomination = data.denomination
							if(conditions != '' && parseFloat(conditions) > 0 && parseFloat(conditions) > parseFloat(self.totalPrice)) {
								E.alert('没有达到优惠劵的使用条件')
								return
							}
							if(self.storeJoinCount(data.channelCouponStores)) {
								//成功赠送
								//赠送金额为denomination
								self.denomination = denomination
							} else {
								E.alert('优惠劵在当前门店不可用')
								return
							}
							break;
						case "2": //折扣
							var discount = data.discount
							if(conditions != '' && parseFloat(conditions) > 0 && parseFloat(conditions) > parseFloat(self.totalPrice)) {
								E.alert('没有达到优惠劵的使用条件')
								return
							}
							if(self.storeJoinCount(data.channelCouponStores)) {
								//成功赠送
								//赠送折扣为discount
								self.discount = discount
							} else {
								E.alert('优惠劵在当前门店不可用')
								return
							}
							break;
						case "3": //赠品
							var productTypeId = data.productTypeId
							var storeTypeId = data.storeTypeId
							var premiumsSetting = data.premiumsSetting //是否倍增
							var promotionFreeSkus = data.promotionFreeSkus //赠品集合
							conditions = data.buyAmount
							switch(data.useType) {
								case "1": //订单满指定金额
									if(conditions != '' && parseFloat(conditions) > 0 && parseFloat(conditions) > parseFloat(self.totalPrice)) {
										E.alert('没有达到优惠劵的使用条件')
										return
									}
									if((storeTypeId == '1' && self.storeJoinCount(data.channelCouponStores)) || (storeTypeId == '0' && !self.storeJoinCount(data.channelCouponStores))) {
										if(premiumsSetting == 1) {
											var multiple = conditions != '' && conditions > 0 ? parseInt(self.totalPrice / conditions) : 1;
											if(multiple == 0) {
												E.alert('商品数量不足优惠劵无效')
												return
											}
											promotionFreeSkus.forEach(function(promotionFreeSku) {
												promotionFreeSku.freeCount = promotionFreeSku.freeCount * multiple;
											})
										}
										self.giveUrl = data.url
										self.giveGoods = true
										self.giveGoodsContent = promotionFreeSkus
									} else {
										E.alert('优惠劵在当前门店不可用')
										return
									}
									break;
								case "2": //满商品总件数送
									var buyCount = data.buyCount //件数
									if((storeTypeId == '1' && self.storeJoinCount(data.channelCouponStores)) || (storeTypeId == '0' && !self.storeJoinCount(data.channelCouponStores))) {
										var JoinCount = productTypeId == '0' ? self.goodsunJoinCount(data.promotionProducts) : self.goodsJoinCount(data.promotionProducts)
										if(JoinCount >= buyCount) {
											//成功赠送
											//赠品为promotionFreeSkus
											var multiple = parseInt(JoinCount / buyCount);
											if(multiple == 0) {
												E.alert('商品数量不足优惠劵无效')
												return
											}
											if(premiumsSetting == 1) {
												promotionFreeSkus.forEach(function(promotionFreeSku) {
													promotionFreeSku.freeCount = promotionFreeSku.freeCount * multiple;
												})
											}
											self.giveUrl = data.url
											self.giveGoods = true
											self.giveGoodsContent = promotionFreeSkus
										} else if(JoinCount == 0) {
											E.alert('订单无可使用优惠的商品')
											return
										} else {
											E.alert('商品数量没达到使用要求')
											return
										}
									} else {
										E.alert('优惠劵在当前门店不可用')
										return
									}
									break;
								case "3": //买商品送
									if((storeTypeId == '1' && self.storeJoinCount(data.channelCouponStores)) || (storeTypeId == '0' && !self.storeJoinCount(data.channelCouponStores))) {
										var JoinCount = self.goodsJoinCount(data.promotionProducts)
										if(JoinCount > 0) {
											var multiple = parseInt(self.goodskuCount(data.promotionProducts));
											console.log(multiple)
											if(multiple == 0) {
												E.alert('商品数量不足优惠劵无效')
												return
											}
											if(premiumsSetting == 1) {
												promotionFreeSkus.forEach(function(promotionFreeSku) {
													promotionFreeSku.freeCount = promotionFreeSku.freeCount * multiple;
												})
											}
											//成功赠送
											//赠品为promotionFreeSkus
											self.giveGoods = true
											self.giveUrl = data.url
											self.giveGoodsContent = promotionFreeSkus
										} else {
											E.alert('订单无可使用优惠的商品')
											return
										}
									} else {
										E.alert('优惠劵在当前门店不可用')
										return
									}
									break;
								default:
									break;
							}
							break;
						default:
							break;
					}
					self.entryCoupon = 0
					self.couponCode = c;
				}, "get")
			},
			goodsJoinCount: function(products) {
				var count = 0
				for(var i in this.items) {
					for(var j in products) {
						if(this.items[i].productItemId == products[j].productItemId) {
							count += Math.floor(parseInt(this.items[i].count))

						}
					}
				}
				return count
			},
			goodsunJoinCount: function(products) {
				var count = 0
				for(var i in this.items) {
					var exit = 0
					for(var j in products) {
						if(this.items[i].productItemId == products[j].productItemId) {
							exit = 1
						}
					}
					if(exit == 0) {
						count += Math.floor(parseInt(this.items[i].count))
					}
				}
				return count
			},
			goodskuCount: function(products) {
				var count = 0
				for(var i in this.items) {
					for(var j in products) {
						if(this.items[i].productItemId == products[j].productItemId) {
							var skuCount = parseInt(products[j].skuCount);
							var itemCount = parseInt(this.items[i].count)
							console.log(skuCount)
							console.log(itemCount)
							count += Math.floor(parseInt(itemCount / skuCount))
						}
					}
				}
				return count
			},
			storeJoinCount: function(stores) {
				var status = false
				var self = this;
				self.store = E.getStorage('store')
				for(var i in stores) {
					if(self.store == stores[i].name) {
						status = true
					}
				}
				return status
			},
			getAddress: function(c, d) {
				this.addressObj = JSON.parse(c);
				this.loadFee(d)
			},
			getMember: function(c) {
				console.log(c)
				this.memberMsg = JSON.parse(c);
				this.memberDiscount = parseFloat(this.memberMsg.memberDiscount) || 1
				this.entryCoupon = 0
			},
			loadFee: function(a) {
				this.sendType = a;
				if(a == "STORE_DELIVER") {
					Page.getFee("STORE")
				} else {
					Page.getFee("ONLINE")
				}

			},
			goVipinfo: function() {
				E.openWindow('vipInfo.html')
			},
			registerCashierReceiver: function() {
				var self = this;
				var main = plus.android.runtimeMainActivity(); //获取activity
				//创建自定义广播实例
				var receiver = plus.android.implements(
					'io.dcloud.feature.internal.reflect.BroadcastReceiver', {
						onReceive: function(context, intent) { //实现onReceiver回调函数
							plus.android.importClass(intent); //通过intent实例引入intent类，方便以后的‘.’操作
							var isSuccess = intent.getExtra("isSuccess");
							var msg = intent.getExtra("msg");
							if(isSuccess || 'msg' == '支付成功') {
								self.payMent('14')
							} else {
								alert(msg);
							}

						}
					});

				var IntentFilter = plus.android
					.importClass('android.content.IntentFilter');
				var filter = new IntentFilter();

				filter.addAction("io.dcloud.pospay.cashiercallback"); //监听收银结果回调，自定义字符串

				main.registerReceiver(receiver, filter); //注册监听
			},
			doPosCashier: function(c) {
				this.cardType = c;
				var main_act = plus.android.runtimeMainActivity();
				var Intent = plus.android.importClass('android.content.Intent');
				var intent = new Intent();
				intent.setClassName(main_act, "io.dcloud.pospay.CashierService");

				var tradeNo = this.createTradeNoString();
				var seqNo = this.createSeqNoString();
				intent.putExtra("tradeNo", this.orderNumber); //商户订单号
				intent.putExtra("body", "这个是测试商品信息"); //订单描述
				intent.putExtra("attach", "这里是附加信息"); //附加数据,原样返回
				intent.putExtra("seqNo", seqNo); //订单序列号
				intent.putExtra("totalFee", (this.totalPrice * 100).toString()); //订单金额，单位为分
				//intent.putExtra("pay_type", "1001");//付款方式 收银apk暂时不支持，等待开放, 1001	现金,1003	微信支付,1004	支付宝,1005	百度钱包,1006	银行卡,1007	易付宝,1008	点评闪惠,1009	京东钱包

				main_act.startService(intent);

			},
			createTradeNoString: function() {
				var d = new Date();
				return d.getHours() + d.getMinutes() + d.getSeconds() +
					d.getMilliseconds() + "";
			},
			createSeqNoString: function() {
				var d = new Date();
				return d.getHours() + d.getMinutes() + d.getSeconds() +
					d.getMilliseconds() + "";
			},
			payPrinter: function() {
				if(E.getStorage("vendor") == 0) {
					var pageDetail = E.getWebview(E.preloadPages[0]);
					var printAr0 = "收款编号:" + this.orderNumber;
					var printAr = [];
					for(i in this.items) {
						printAr.push("商品名称：" + this.items[i].productName);
						printAr.push("商品数量：" + this.items[i].count);
						printAr.push("商品单价：" + this.items[i].price);
						printAr.push("商品规格：" + this.items[i].skuName);
					}
					var printAr1 = ["应付金额：￥" + this.allPrice, "让利金额：￥" + this.coupons, "运费金额：￥" + this.fee, "实收金额：￥" + this.totalPrice, "付款方式：" + this.paymentName, "本次消费赠送积分：--", "会员卡余额：--", "会员可用/累计积分:--/--"];
					if(this.addressObj) {
						printAr1 = ["应付金额：￥" + this.allPrice, "让利金额：￥" + this.coupons, "运费金额：￥" + this.fee, "实收金额：￥" + this.totalPrice, "付款方式：" + this.paymentName, "收货姓名：" + this.addressObj.consignee, "收货电话：" + this.addressObj.mobilePhone, "收货地址：" + this.addressObj.address, "本次消费赠送积分：--", "会员卡余额：--", "会员可用/累计积分:--/--"];

					}
					printAr1 = printAr.concat(printAr1)
					printAr1 = printAr1.join(",");
					var printAr2 = ["收款时间：" + (new Date()).Format("yyyy-MM-dd hh:mm:ss"), "操作人  ：" + E.getStorage("op"), "门店地址：" + E.getStorage("address"), "门店电话：" + E.getStorage("tel")];
					printAr2 = printAr2.join(",");
					pageDetail.evalJS("Page.vue.printerAll('" + E.getStorage("storeName") + "','" + printAr0 + "','" + printAr1 + "','" + printAr2 + "')");
				}
			},
			completePay: function(c) {
				var self = this;
				E.alert(c, function() {
					E.fireData(E.preloadPages[0], "detailShow", {
						orderNumber: Page.vue.orderNumber
					})
					setTimeout(function() {
						self.payments = [];
						self.memberMsg = null;
						var curw = plus.webview.currentWebview()
//						plus.webview.hide(curw.opener(), 'none', 0)
//						plus.webview.hide(curw, 'none', 0)
						setTimeout(function() {
							plus.webview.close(curw.opener(), 'none', 0)
							plus.webview.close(curw, 'none', 0)
						}, 1000)

					}, 1000)
				})

			}
		},
		computed: {
			mprice: function() {
				var mprice = 0;
				for(var i = 0; i < this.items.length; i++) {
					mprice += (this.items[i].price) * (this.items[i].count)
				}
				return mprice
			},
			totalPrice: function() {
				var fees = this.fee ? parseFloat(this.fee) : 0
				var tprice = (parseFloat(this.mprice) + parseFloat(fees)).toFixed(2);
				this.allPrice = tprice
				var dprice = (this.discount * 100 * tprice) / 1000 - parseFloat(this.denomination) //优惠折扣后的订单总价
				console.log(dprice)
				var dprice1 = (this.memberDiscount * 1000 * dprice) / 1000; //会员折扣后的订单总价
				console.log(dprice1)
				var dprice2 = tprice - dprice //优惠劵折扣的优惠
				console.log(dprice2)
				this.coudisPrice = dprice2
				var dprice3 = dprice - dprice1 //会员折扣的优惠
				console.log(dprice3)
				this.memdisPrice = dprice3
				var coupons = parseFloat(dprice3) + parseFloat(dprice2) + parseFloat(this.entryCoupon)
				this.coupons = coupons > tprice ? tprice : coupons.toFixed(2)
				var price = (tprice - parseFloat(this.coupons)).toFixed(2);
				return price >= 0 ? price : 0
			}
		},

	}
}
Page.init()