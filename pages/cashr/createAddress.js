var Page = {
	init: function() {
		this.vue = E.vue(this.vueObj), this.initConfig()
	},
	initConfig: function() {
		var self = this;
		mui.init();
		mui.plusReady(function() {
			self.ws = plus.webview.currentWebview();
			var phtml = '<option value="">请选择省份</option>'
			for (var i = 0; i < pData.length; i++) {
				phtml += '<option value="' + pData[i] + '">' + pData[i] + '</option>'
			}
		})
	},
	vueObj: {
		el: '#createAddress',
		data: {
			tel: "",
			name: "",
			province: "",
			city: "",
			cityarea: "",
			address: "",
			pData: pData,
			cData: [],
			caData: []
		},
		methods: {
			saveAddress: function() {
				var self = this
				if (!this.name || !this.tel || !this.province || !this.address || !this.city || !this.cityarea) {
					E.toast("信息不全")
					return
				}
				var telReg = !!(this.tel).match(/^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/);
				if (telReg == false) {
					E.toast("请输入正确的手机号")
					this.tel = ""
					return
				}
				var msg = {
					mobilePhone: this.tel,
					consignee: this.name,
					provinceName: this.province,
					cityName: this.city,
					areaName: this.cityarea,
					address: this.address
				}
				msg = JSON.stringify(msg)
				Page.ws.opener().evalJS("Page.vue.getAddress('" + msg + "')")
				mui.back()
			}
		}
	}
}

function changeProvince(e) {
	var pindex = e.selectedIndex;
	Page.vue.cData = cData[pindex - 1]
	Page.vue.caData = []
	Page.vue.city = ""
	Page.vue.cityarea = ""
	Page.vue.address = ""
}

function changeCity(e) {
	var psex = mui("#province")[0].selectedIndex - 1;
	var psexcount = 0;
	for (var i = 0; i < psex; i++) {
		psexcount += cData[i].length;
	}
	var pindex = psexcount + e.selectedIndex;
	var caData = cyData[pindex - 1]
	if (!caData.length && e.value) {
		Page.vue.caData.push(e.value)
	} else {
		Page.vue.caData = caData
	}
	Page.vue.cityarea = ""
	Page.vue.address = ""
}

function changeaddress() {
	setTimeout(function() {
		Page.vue.address = Page.vue.province + Page.vue.city + Page.vue.cityarea;
	}, 0)
}
Page.init()