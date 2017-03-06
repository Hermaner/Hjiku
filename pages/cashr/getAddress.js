var Page = {
	init: function() {
		this.vue = E.vue(this.vueObj), this.initConfig()
	},
	initConfig: function() {
		var self = this;
		mui.init();
		mui.plusReady(function() {
			self.ws = plus.webview.currentWebview();
			if (self.ws.tel) {
				self.vue.loadData()
			}
			mui("#addressList").on('tap', "li", function() {
				var p = this.parentNode.children;
				for (var i = 0, pl = p.length; i < pl; i++) {
					if (p[i].classList.contains("active")) {
						p[i].classList.remove("active")
					}
				}
				this.classList.add("active");
				self.vue.dex = parseInt(this.getAttribute("dex"))
			})
			var oldBack=mui.back;
			mui.back=function(){
				self.ws.close("pop-out")
			}
		})
	},
	vueObj: {
		el: '#vue',
		data: {
			items: [],
			dex: null
		},
		methods: {
			loadData: function() {
				var self = this;
				var params = E.systemParam('V5.mobile.channelMember.get');
				params.mobilePhone = Page.ws.tel;
				E.showLoading()
				E.getData('channelMemberGet', params, function(data) {
					console.log(JSON.stringify(data))
					E.closeLoading()
					if (!data.isSuccess) {
						E.alert(data.map.errorMsg)
						return
					}
					self.items = data.channelMember.memberAddress;
				},"get")
			},
			saveAddress: function() {
				if (this.dex == null) {
					E.toast("请选择地址")
					return
				}
				Page.ws.opener().evalJS("Page.vue.getAddress('" + JSON.stringify(this.items[this.dex]) + "','" + Page.ws.sendId + "')");
				Page.ws.close("pop-out")
			},
			createAddress: function() {
				E.openWindow('createAddresser.html')
			},
			getAddress: function(c) {
				this.items.push(JSON.parse(c))
			}
		}
	}
}
Page.init()