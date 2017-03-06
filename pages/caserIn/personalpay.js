var Page = {
	init: function() {
		this.vue = E.vue(this.vueObj), this.initConfig()
	},
	initConfig: function() {
		var self = this;
		mui.plusReady(function() {
			window.addEventListener('detailShow', function(event) {
				self.vue.getData = event.detail.getData;
				self.vue.paymentType = event.detail.type;
				self.vue.img = self.vue.paymentType=="19"?E.getStorage("perzfb"):E.getStorage("perwx")
			})
			var oldBack = mui.back;
			mui.back = function() {
				oldBack()
				setTimeout(function() {
					self.vue.resetData()
				},250)

			}
		});
	},
	vueObj: {
		el: '#vue',
		data: {
			getData: null,
			img: "",
			paymentType: "",
			orderNumber:""
		},
		methods: {
			pay: function() {
				console.log(this.getData)
				var obj = {
					receiptAmount: this.getData.actual,
					discountFee: this.getData.coupon,
					paymentType: this.paymentType,
					memo: this.getData.memo,
					couponCode: this.getData.couponCode
				}
				obj = JSON.stringify(obj)
				var self = this;
				var params = E.systemParam('V5.mobile.receivables.history.add');
				params = mui.extend(params, {
					receivablesData: obj
				})
				E.showLoading()
				console.log(obj)
				E.getData('receivablesHistoryAdd', params, function(data) {
					console.log(JSON.stringify(data))

					if(!data.isSuccess) {
						E.closeLoading()
						E.alert(data.map.errorMsg)
						return
					}
					self.orderNumber = data.number;
					self.payMent()
				})
			},
			payMent: function() {
				var self = this
				var params = E.systemParam("V5.mobile.erp.pay");
				params = mui.extend(params, {
					number: this.orderNumber,
					authCode: '',
					memberCardNumber: "",
					password: "",
					paymentType: parseInt(this.paymentType),
					type: "pay"
				})
				E.showLoading()
				E.getData('erpPay', params, function(data) {
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
			payPrinter: function() {
				if(E.getStorage("vendor") == 0) {
					var pageDetail = E.getWebview(E.preloadPages[0]);
					var printAr0 = "收款编号:" + this.orderNumber;
					var printAr1 = ["应付金额：￥" + this.getData.amount, "让利金额：￥" + this.getData.coupon, "实收金额：￥" + this.getData.actual, "付款方式：" + this.paymentName, "本次消费赠送积分：--", "会员卡余额：--", "会员可用/累计积分:--/--"];
					printAr1 = printAr1.join(",");
					var printAr2 = ["收款时间：" + (new Date()).Format("yyyy-MM-dd hh:mm:ss"), "操作人  ：" + E.getStorage("op"), "门店地址：" + E.getStorage("address"), "门店电话：" + E.getStorage("tel")];
					printAr2 = printAr2.join(",");
					pageDetail.evalJS("Page.vue.printerAll('" + E.getStorage("storeName") + "','" + printAr0 + "','" + printAr1 + "','" + printAr2 + "')");
				}
			},
			completePay: function(c) {
				var self = this
				E.getWebview("caserIn").evalJS("Page.vue.resetData()")
				E.alert(c, function() {
					E.getWebview("caserInpay").evalJS("mui.back()")
					mui.back()
					self.resetData()
				})
			},
			resetData: function() {
				this.getData = null;
				this.img = "";
				this.paymentType = "";
				this.orderNumber=""
			}
		}

	},

}
Page.init()