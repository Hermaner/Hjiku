var Page = {
	init: function() {
		this.vue = E.vue(this.vueObj), this.initConfig()
	},
	initConfig: function() {
		var self = this;
		mui.init();
		mui.plusReady(function() {
			self.ws = plus.webview.currentWebview();
		})
	},
	vueObj: {
		el: '#vue',
		data: {
			searchtext: "",
			items: null
		},
		methods: {
			searchItem: function(c) {
				var searchtext=c||this.searchtext;
				if (!searchtext) {
					E.toast("请输入手机号码")
					return
				}
				var self = this;
				var params = E.systemParam('V5.mobile.channelMember.get');
				params.mobilePhone = searchtext;
				E.showLoading()
				E.getData('channelMemberGet', params, function(data) {
					console.log(JSON.stringify(data))
					E.closeLoading()
					if (!data.isSuccess) {
						E.alert(data.map.errorMsg)
						return
					}
					self.items = data.channelMember;
					self.items.mobilePhone = searchtext
				},"get")
			},
			gocardScan: function(){
				E.openWindow("../barcode/orderScan.html", {
					type: "vipinfo"
				})
			},
			save: function() {
				if (this.items) {
					Page.ws.opener().evalJS("Page.vue.getMember('" + JSON.stringify(this.items) + "')");
					mui.back()
				}
			}
		}
	}
}
Page.init()