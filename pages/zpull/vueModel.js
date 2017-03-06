var Page = {
	ItemId: null,
	init: function() {
		this.vue = E.vue(this.vueObj), this.initConfig()
	},
	initConfig: function() {
		var self = this;
		mui.plusReady(function() {
			window.addEventListener('detailShow', function(event) {
				self.dataId=event.detail.dataId
//				self.vue.loadData()
			})
			
		});
		var oldBack = mui.back;
		mui.back = function() {
			oldBack()
			self.vue.resetData()
		}
	},
	vueObj: {
		el: '#vue',
		data: {
			dataId:''
			showData: true,
			noData: false,
			items: ''
		},
		methods: {
			loadData: function() {
				var self = this;
				var params = E.systemParam('V5.mobile.user.get');
				params=mui.extend(params,{
					dataId:this.dataId
				})
				E.getData('userGet', params, function(data) {
					console.log(JSON.stringify(data))
					self.showData = false;
					if(!data.isSuccess) {
						E.alert(data.map.errorMsg)
						return
					}
					self.items = data.items
				}, "get")
			},
			resetData: function() {
				this.showData = true;
				this.noData = false;
				this.items = ''
				this.dataId=''
			}
		}
	}

}
Page.init()