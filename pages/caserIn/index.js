var Page = {
	init: function() {
		this.vue = E.vue(this.vueObj), this.initConfig()
	},
	initConfig: function() {
		var self = this;
		mui.init({
			preloadPages: [{
				"id": "enterCoupon",
				"url": "enterCoupon.html",
			}, {
				"id": "caserInnode",
				"url": "caserInnode.html",
			}, {
				"id": "caserIndetail",
				"url": "caserIndetail.html",
			}, {
				"id": "caserInpay",
				"url": "caserInpay.html",
			}]
		})
		mui.plusReady(function() {
			self.vue.store = E.getStorage('store')
//			self.vue.openSoftKeyboard()
			plus.webview.currentWebview().addEventListener("show", function(e) {
				setTimeout(function() { //自动打开软键盘，搜索框获取焦点
					self.vue.openSoftKeyboard2()
					document.getElementById("amount").focus();
				}, 300);
			})

		});
		var oldBack = mui.back;
		mui.back = function() {
			oldBack()
			document.activeElement.blur()
			setTimeout(function() {
				self.vue.resetData()
			})

		}
	},
	vueObj: {
		el: '#vue',
		data: {
			amount: '',
			memo: '',
			coupon: '0',
			denomination: 0,
			discount: 10,
			couponCode: '',
			store: '',
			actual: "0",
			orderNumber: '',
			memoStatus: false

		},
		methods: {
			loadData: function(c) {
				console.log(c)
			},
			writeScan: function() {
				var reNum = /^\d+(.\d{1,2})?$/;
				if(!reNum.test(this.amount)) {
					mui.toast('请输入正确金额')
					return
				}
				E.openWindow('../barcode/orderScan.html', {
					type: 'caserIn'
				})
			},
			gocaserNode: function() {
				E.fireData('caserInnode', 'detailShow')
			},
			loadCoupon: function(c) {
				var self = this;
				var params = E.systemParam("V5.mobile.order.coupon.get");
				params = mui.extend(params, {
					couponCode: c
				})
				E.getData('couponGet', params, function(data) {
					console.log(data)
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
							console.log(data.denomination)
							if(!self.amount) {
								E.alert('请输入正确金额')
								return
							}
							if(conditions != '' && conditions > 0 && parseFloat(conditions) > parseFloat(self.amount)) {
								E.alert('订单金额没有达到赠送条件')
								return
							}
							console.log(data.channelCouponStores)
							if(self.storeJoinCount(data.channelCouponStores)) {
								//成功赠送
								//赠送金额为denomination
								console.log(denomination)
								self.denomination = denomination
							} else {
								E.alert('优惠劵在当前门店不可用')
								return
							}
							break;
						case "2": //折扣
							var discount = data.discount
							if(!self.amount) {
								E.alert('请输入正确金额')
								return
							}

							if(conditions != '' && conditions > 0 && parseFloat(conditions) > parseFloat(self.amount)) {
								E.alert('订单金额没有达到赠送条件')
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
							E.alert('此优惠劵不能使用')
							break;
						default:
							break;
					}
					self.couponCode = c
				}, "get")
			},
			amountBlur: function() {
				var reNum = /^\d+(.\d{1,2})?$/;
				if(!reNum.test(this.amount)) {
					mui.toast('金额输入错误')
					return
				}
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
			checkBack: function(c, e, d) {
				this.couponCode = e;
				if(d == 1) {
					this.denomination = c;
				} else {
					this.discount = c
				}

			},
			openSoftKeyboard2: function() {
				if(mui.os.ios) {
					var webView = plus.webview.currentWebview().nativeInstanceObject();
					webView.plusCallMethod({
						"setKeyboardDisplayRequiresUserAction": false
					});
				} else {
					var webview = plus.android.currentWebview();
					plus.android.importClass(webview);
					webview.requestFocus();
					var Context = plus.android.importClass("android.content.Context");
					var InputMethodManager = plus.android.importClass("android.view.inputmethod.InputMethodManager");
					var main = plus.android.runtimeMainActivity();
					var imm = main.getSystemService(Context.INPUT_METHOD_SERVICE);
					imm.toggleSoftInput(0, InputMethodManager.SHOW_FORCED);

				}
			},
			goPay: function() {
				if(!this.actual||this.actual=="0"){
					return
				}
				E.fireData("caserInpay", "", {
					data: {
						amount: this.amount,
						orderNumber: this.orderNumber,
						coupon: this.coupon,
						actual: this.actual,
						memo: this.memo,
						couponCode: this.couponCode
					}
				})
			},
			resetData: function() {
				this.amount = '';
				this.memo = '';
				this.coupon = '0';
				this.denomination = 0;
				this.discount = 10;
				this.couponCode = '';
				this.orderNumber = '';
				this.memoStatus = false
			}
		},
		watch: {
			amount: function() {
				this.couponCode = '';
				this.denomination = 0;
				this.discount = 10;
			}
		},
		computed: {
			actual: function() {
				var reNum = /^\d+(.\d{1,2})?$/;
				if(!reNum.test(this.amount)) {
					return 0
				}
				var value = parseFloat(this.amount || 0) * this.discount / 10 - parseFloat(this.denomination || 0);
				console.log(value)
				value = value < 0 ? 0 : value.toFixed(2)
				console.log(value)
				this.coupon = (parseFloat(this.amount || 0) - value).toFixed(2)
				return value
			}
		}
	},

}
Page.init()