var Page = {
	ItemId: null,
	init: function() {
		this.vue = E.vue(this.vueObj), this.initConfig()
	},
	initConfig: function() {
		var self = this;
		mui.init({});
		mui.plusReady(function() {
			mui('#tochange').on('tap', '.mui-checkbox', function() {
				var target = this.querySelector('input');
				var index = target.getAttribute('index')
				var status = target.checked
				self.vue.items[index].status = !status
				var count = 0;
				for(var i = 0; i < self.vue.items.length; i++) {
					if(self.vue.items[i].status) {
						count++
					}
				}
				self.vue.countNum=count;
				if(count == self.vue.items.length) {
					mui('.checkAll')[0].checked = true
				} else {
					mui('.checkAll')[0].checked = false
				}

			});
			window.addEventListener('detailShow', function(event) {
				self.vue.couponData = event.detail.couponData
				var stores = JSON.parse(E.getStorage('stores'))
				for(var i = 0; i < stores.length; i++) {
					stores[i].status = false
				}
				self.vue.items =stores
				self.vue.showData = false
			})
			var oldBack=mui.back;
			mui.back=function(){
				oldBack()
				mui('.checkAll')[0].checked = false
				self.vue.items = []
				self.vue.showData = true
				self.vue.noData = false
				self.vue.countNum = 0
			}
		});
	},
	vueObj: {
		el: '#vue',
		data: {
			items: [],
			couponData: {},
			noData:false,
			showData: true,
			countNum:0
		},
		methods: {
			goNext: function() {
				var store = []
				for(var i = 0; i < this.items.length; i++) {
					if(this.items[i].status) {
						store.push(this.items[i].storeCode)
					}
				}
				if(store.length == 0) {
					mui.toast('请选择门店')
					return
				}
				this.couponData.stores=store.join(',')
				E.fireData('scanCoupon', '', {
					couponData: this.couponData
				})
			},
			goback: function() {
				mui.back()
			},
			selectAll: function() {
				var status = mui('.checkAll')[0].checked
				for(var i = 0, len = this.items.length; i < len; i++) {
					mui('.mui-checkbox')[i].querySelector('input').checked = status
					this.items[i].status = status
				}
				if(status){
					this.countNum=this.items.length
				}
				else{
					this.countNum=0
				}
			},

		}
	}

}
Page.init()