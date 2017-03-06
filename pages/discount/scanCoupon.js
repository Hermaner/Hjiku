var Page = {
	ItemId: null,
	init: function() {
		this.vue = E.vue(this.vueObj), this.initConfig()
	},
	initConfig: function() {
		var self = this;
		mui.plusReady(function() {
			window.addEventListener('detailShow', function(event) {
				if(event.detail.type == 'detail') {
					self.vue.couponId = event.detail.couponId;
					self.vue.loadData()
				} else if(event.detail.type == 'send') {
					self.vue.couponId = event.detail.couponId;
					self.vue.send =true
					self.vue.loadData()
				} else {
					self.vue.couponData = event.detail.couponData;
					self.vue.showData = false;
				}
				self.vue.logo = E.getStorage('logo')

			})
			var oldBack = mui.back;
			mui.back = function() {
				setTimeout(function() {
					self.vue.showData = true;
					self.vue.couponData = {}
					self.vue.logo = ''
					self.vue.couponId = ''
					self.vue.send=false
					self.vue.couponInfo = {}
				}, 250)
				oldBack()
			}
		});
	},
	vueObj: {
		el: '#vue',
		data: {
			couponId: '',
			couponData: {},
			showData: true,
			logo: '',
			send:false
		},
		methods: {
			loadData: function() {
				var self = this;
				var params = E.systemParam('V5.mobile.coupon.info.get');
				params = mui.extend(params, {
					couponNumber: this.couponId,
					openID: "",
					appID: this.couponId,
					operationType:"3"
				})
				console.log(params)
				E.getData('couponInfoGet', params, function(data) {
					console.log(JSON.stringify(data))
					self.showData = false;
					if(!data.isSuccess) {
						E.alert(data.map.errorMsg)
						return
					}
					self.couponData = data.couponInfo
				}, 'get')
			},
			save: function() {
				var self = this;
				var params = E.systemParam('V5.mobile.coupon.info.add');
				params.couponData = JSON.stringify(this.couponData);
				E.showLoading()
				E.getData('couponInfoAdd', params, function(data) {
					console.log(JSON.stringify(data))
					E.closeLoading()
					if(!data.isSuccess) {
						E.alert(data.map.errorMsg)
						return
					}
					E.alert('新增成功', function() {
						E.hideWebview('createDiscount', 'auto', 0)
						E.hideWebview('getStore', 'auto', 0)
						mui.back()
					})
				})
			},
			copyCoupon: function(c) {
				if(plus.os.name == "Android") {
					var Context = plus.android.importClass("android.content.Context");
					var main = plus.android.runtimeMainActivity();
					var clip = main.getSystemService(Context.CLIPBOARD_SERVICE);
					plus.android.invoke(clip, "setText", c);
				} else {
					var UIPasteboard = plus.ios.importClass("UIPasteboard");
					//这步会有异常因为UIPasteboard是不允许init的，init的问题会在新版中修改
					var generalPasteboard = UIPasteboard.generalPasteboard();
					// 设置/获取文本内容:
					generalPasteboard.setValueforPasteboardType(c, "public.utf8-plain-text");
					var value = generalPasteboard.valueForPasteboardType("public.utf8-plain-text");
				}
				E.toast("复制成功")
			},
			goback: function() {
				mui.back()
			},
			sendpage: function(c) {
				E.fireData('sendpage', '', {
					coupon: c
				})
			},
		}
	}

}
Page.init()