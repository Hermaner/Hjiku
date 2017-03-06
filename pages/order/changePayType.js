var Page = {
	init: function() {
		this.vue = E.vue(this.vueObj), this.initConfig()
	},
	initConfig: function() {
		var self = this;
		mui.init();
		mui.plusReady(function() {
			self.ws = plus.webview.currentWebview();
			self.vue.orderNumber = self.ws.orderNumber;
			self.vue.initialTotalAmount = self.ws.initialTotalAmount;
			self.vue.payAmout = self.ws.initialTotalAmount;
			self.vue.loadPaytype()
			self.vue.loadmixPays(self.vue.orderNumber)
		})
	},
	vueObj: {
		el: '#vue',
		data: {
			initialTotalAmount: 0,
			autoAmount: 0,
			orderNumber: "",
			payments: [],
			payAmout: 0,
			unpayAmout: 0,
			items: [{
				c: 1
			}]
		},
		methods: {
			loadPaytype: function() {
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
			loadmixPays: function(c) {
				var self = this;
				var params = E.systemParam("V5.mobile.order.mixture.pay.get");
				params.orderNumber = c;
				E.getData('orderMixturePayGet', params, function(data) {
					if(!data.isSuccess) {
						E.alert(data.map.errorMsg);
						console.log(data.map.errorMsg)
						return
					}
					self.items = data.mixturePays;
					console.log(JSON.stringify(self.items))
				}, "get")
			},
			save: function() {
				var self = this;
				var typeAr = [];
				var pays = [];
				var thisAmount = 0;
				mui(".Paylist").each(function() {
					var paymentType = this.querySelector("select").value;
					var paymentName;
					for(var i = 0; i < self.payments.length; i++) {
						if(self.payments[i].paymentType == paymentType) {
							paymentName = self.payments[i].paymentName
						}
					}
					var payAmount = this.querySelector("[type='number']").value;
					if(parseFloat(payAmount) > 0) {
						thisAmount = parseFloat(thisAmount) + parseFloat(payAmount)
						var status = 0

						pays.push({
							paymentName: paymentName,
							amount: payAmount,
							paymentType: paymentType,
						})
						for(var i = 0; i < typeAr.length; i++) {
							if(typeAr[i] == paymentType) {
								status = 1
							}
						}
						if(!status && paymentType) {
							typeAr.push(paymentType)
						}
						if(!paymentType) {
							E.toast("请选择支付方式")
							return false
						}
						if(!payAmount) {
							E.toast("请输入金额")
							return false
						}

					} else {
						E.toast("请填写正确金额")
						return false
					}

				})
				if(typeAr.length && typeAr.length != mui(".Paylist").length) {
					E.toast("不能选择相同的支付方式")
					return
				}
				console.log(thisAmount + ";" + this.initialTotalAmount)
				if(thisAmount != this.initialTotalAmount) {
					E.toast("提交总金额应等于订单总金额")
					return
				}
				var mixturePayData = {
					pays: pays
				}

				var params = E.systemParam("V5.mobile.order.mixture.pay.add");
				params = mui.extend(params, {
					mixturePayData: JSON.stringify(mixturePayData),
					orderNumber: this.orderNumber
				})
				E.showLoading()
				E.getData('orderMixturePayAdd', params, function(data) {
					E.closeLoading()
					if(!data.isSuccess) {
						E.alert(data.map.errorMsg)
						return
					}
					console.log(JSON.stringify(data))
					E.alert("修改成功", function() {
						Page.ws.opener().evalJS("Page.vue.loadData('" + self.orderNumber + "')")
						mui.back()
					})
				})
			},
			delete: function() {
				var self = this;
				var deleteAr = []
				for(var i = 0; i < mui(".Paylist").length; i++) {
					if(mui(".Paylist")[i].querySelector("[type=checkbox]").checked) {
						deleteAr.push(mui(".Paylist")[i].getAttribute("index"))
					}
				}
				if(deleteAr.length <= 0) {
					E.alert("请选择要删除的对象")
					return
				}
				var newItem = [];
				for(var i = 0; i < this.items.length; i++) {
					var s = 0;
					for(var j = 0; j < deleteAr.length; j++) {
						if(i == deleteAr[j]) {
							s = 1
						}
					}
					if(!s) {
						newItem.push(this.items[i])
					}
				}
				E.confirm("是否删除选中", function() {
					self.items = newItem;
					self.computedAmount()
				})

			},
			add: function() {
				this.items.push({
					c: 1
				})
			},
			computedAmount: function() {
				var self = this;
				this.payAmout = 0
				mui(".Paylist").each(function() {
					var amount = this.querySelector("[type='number']").value;
					if(amount.length) {
						E.IsNumer(amount, function() {
							self.payAmout = self.payAmout + parseInt(amount)
						})
					}
				})
				this.unpayAmout = this.initialTotalAmount-this.payAmout<0?0:this.initialTotalAmount-this.payAmout
			}

		}
	}
}
Page.init()