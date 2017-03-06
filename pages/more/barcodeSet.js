var Page = {
	init: function() {
		this.vue = E.vue(this.vueObj), this.plusEvent()
	},
	plusEvent: function() {
		mui.plusReady(function() {
			var codeAr = {code:[]}
			if(E.getStorage('codeType')) {
				codeAr = JSON.parse(E.getStorage('codeType'));
				console.log(codeAr)
				for(var i = 0; i < codeAr.code.length; i++) {
					mui(".mui-table-view-cell")[codeAr.code[i]].classList.add("mui-selected")
				}
			}

			mui(".mui-table-view-noa").on("tap", ".mui-table-view-cell", function() {
				var index = this.getAttribute("index");
				var newAr = []
				if(this.classList.contains("mui-selected")) {
					this.classList.remove("mui-selected");
					for(var i = 0; i < codeAr.code.length; i++) {
						if(codeAr.code[i] != index) {
							newAr.push(codeAr.code[i])
						}
					}
					if(newAr.length>0){
						codeAr.code = newAr
					}else{
						E.removeStorage("codeType")
						return
					}
					
				} else {
					this.classList.add("mui-selected");
					codeAr.code.push(index)
				}
				E.setStorage('codeType', JSON.stringify(codeAr))
			})
		})

	},
	vueObj: {
		el: '#vue',
		data: {
			items: ['EAN13', 'EAN8', 'AZTEC', 'DATAMATRIX', 'UPCA', 'UPCE', 'CODABAR', 'CODE39', 'CODE93', 'CODE128', 'ITF', 'MAXICODE', 'PDF417', 'RSS14', 'RSSEXPANDED']
		},

		methods: {

		}
	}
}
Page.init()