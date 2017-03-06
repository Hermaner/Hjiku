var Page = {
	init: function() {
		this.vue = E.vue(this.vueObj), this.initConfig()
	},
	initConfig: function() {
		var self = this;
		mui.plusReady(function() {
            self.openr=plus.webview.currentWebview().opener()
            self.vue.store = E.getStorage('store')
		});
	},
	vueObj: {
		el: '#vue',
		data: {
			couponCode: ''
		},
		methods: {
			loadCoupon: function(c) {
				if(!this.couponCode){
					E.alert('请输入优惠码')
					return
				}
				var self = this;
				var params = E.systemParam("V5.mobile.order.coupon.get");
				params = mui.extend(params, {
					couponCode: this.couponCode
				})
				E.showLoading()
				E.getData('couponGet', params, function(data) {
					console.log(data)
					E.closeLoading()
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
					if(termination < nowing) {
						E.alert('优惠劵已失效！')
						return
					}
					if(beginning > nowing){
						E.alert('优惠劵未开始！')
						return
					}
					switch(data.couponType) {
						case "1": //满减
							var denomination = data.denomination
							if(conditions != '' && conditions > 0 && conditions > self.totalPrice) {
								E.alert('订单金额没有达到赠送条件')
								return
							}
							if(self.storeJoinCount(data.channelCouponStores)) {
								//成功赠送
								//赠送金额为denomination
								Page.openr.evalJS('Page.vue.checkBack("'+denomination+'","'+self.couponCode+'",1)')
								self.couponCode=''
								mui.back()
							} else {
								E.alert('优惠劵在当前门店不可用')
								return
							}
							break;
						case "2": //折扣
							var discount = data.discount
							if(conditions != '' && conditions > 0 && conditions > self.totalPrice) {
								E.alert('订单金额没有达到赠送条件')
								return
							}
							if(self.storeJoinCount(data.channelCouponStores)) {
								//成功赠送
								//赠送折扣为discount
								Page.openr.evalJS('Page.vue.checkBack("'+discount+'","'+self.couponCode+'",2)')
								self.couponCode=''
								mui.back()
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
				}, "get")
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
			}
		}
	}

}
Page.init()