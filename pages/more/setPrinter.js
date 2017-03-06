var setPrintPage = {
	init: function() {
		this.vue = E.vue(this.vueObj)
	},
	vueObj: {
		el: '#setPrint',
		data: {
			items: [],
		},
		methods: {

			addPrint: function() {
				var phoneType = plus.os.name.toLowerCase();
				if (phoneType == "android") {
					if (E.getStorage("mac")) {
						mui.confirm('确认更换打印机？', '', ['是', '否'], function(e) {
							if (e.index == 0) {
								mui.prompt('添加打印机：', '请输入打印机的终端ID', '', ['确定', '取消'], function(e) {
									if (e.index == 0) {
										if (!e.value) {
											E.alert("请输入ID")
											return
										}
										E.alert("保存成功")
										E.setStorage("mac", e.value)
									}
								})
							}
						})
					} else {
						mui.prompt('添加打印机：', '请输入打印机的终端ID', '', ['确定', '取消'], function(e) {
							if (e.index == 0) {
								if (!e.value) {
									E.alert("请输入ID")
									return
								}
								E.alert("保存成功")
								E.setStorage("mac", e.value)
							}
						})
					}
				} else if (phoneType == "ios") {
//					plus.pluginprinter.PluginPrinterFunction("Html5", "Plus", "AsyncFunction", "MultiArgument!", function(result) {}, function(result) {});
				}
			},
			deletePrint: function() {
				if (E.getStorage("mac")) {
					mui.confirm('确认删除绑定的打印机？', '', ['是', '否'], function(e) {
						if (e.index == 0) {
							plus.storage.removeItem("mac");
							E.alert("打印机已删除！")
						}
					})
				} else {
					E.alert("打印机尚未设置！")
				}
			}
		}
	}
}
setPrintPage.init()