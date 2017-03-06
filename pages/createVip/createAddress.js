var createPage = {
	init: function() {
		this.vue = E.vue(this.vueObj), this.initConfig()
	},
	initConfig: function() {
		var self = this;
		mui.init();
		mui.plusReady(function() {
			self.ws = plus.webview.currentWebview();
			window.addEventListener('addShow', function(event) {
				self.vue.tel = event.detail.tel;
			})
			var phtml = '<option value="">请选择省份</option>'
			for (var i = 0; i < pData.length; i++) {
				phtml += '<option value="' + pData[i] + '">' + pData[i] + '</option>'
			}
			var oldBack=mui.back;
			mui.back=function(){
				oldBack()
				self.vue.resetData()
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
			resetData:function(){
				this.tel='';
				this.name='';
				this.province='';
				this.city='';
				this.cityarea='';
				this.address='';
			},
			saveAddress: function() {
				var self = this
				if (!this.name || !this.province || !this.address || !this.city || !this.cityarea) {
					E.toast("信息不全")
					return
				}
				var msg = {
					consignee:this.name,
					province:this.province,
					city:this.city,
					cityarea:this.cityarea,
					address:this.address
				}
				msg=JSON.stringify(msg)
				var createOpenr=plus.webview.getWebviewById('createVip')
				createOpenr.evalJS("Page.vue.getAddress('" + msg + "')")
				mui.back()
			}
		}
	}
}

function changeProvince(e) {
	var pindex = e.selectedIndex;
	createPage.vue.cData = cData[pindex - 1]
	createPage.vue.caData = []
	createPage.vue.city = ""
	createPage.vue.cityarea = ""
	createPage.vue.address = ""
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
		createPage.vue.caData.push(e.value)
	} else {
		createPage.vue.caData = caData
	}
	createPage.vue.cityarea = ""
	createPage.vue.address = ""
}

function changeaddress() {
	setTimeout(function() {
		createPage.vue.address = createPage.vue.province + createPage.vue.city + createPage.vue.cityarea;
	}, 0)
}
createPage.init()