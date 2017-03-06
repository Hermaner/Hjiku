var chartPage = {
	textAr: [
		["门店订单总数", "订单数", "trade"],
		["门店总销售额", "总销售额", "sale"],
		["门店配送订单", "订单数", "delivery"],
		["门店发货订单", "订单数", "send"],
		["门店自提订单", "订单数", "since"],
		["门店处理订单总数", "订单数", "process"],
		["申请协调订单", "订单数", "xietiao"],
		["门店分润金额", "总销售额", "fenrun"],
		["员工总销售额", "总销售额", "selfSale"],
		["个人绩效奖金", "绩效奖金", "selfBonus"]
	],
	init: function() {
		this.vue = E.vue(this.vueObj), this.plusEvent();
	},
	plusEvent: function() {
		var self = this;
		mui.plusReady(function() {
			var ws = plus.webview.currentWebview();
			var chartId = parseInt(ws.chartId);
			self.vue.chartId = chartId;
			console.log(chartId)
			self.vue.title = self.textAr[chartId][0];
			self.vue.name = self.textAr[chartId][1];
			self.vue.type = self.textAr[chartId][2];
			self.vue.loadData(self.vue.type, "yesterday");
			E.showLoading()
		})
	},
	vueObj: {
		el: '#chart',
		data: {
			items: [
				[],
				[],
				[],
				[]
			],
			datas: [],
			totals: [
				[]
			],
			totalCount: "",
			chartId: null,
			title: "",
			name: "",
			type: "",
			showpie: false,
			famount: null,
			tamount: null

		},
		methods: {
			loadData: function(type, day) {
				var self = this;
				var params = E.systemParam("V5.mobile.order.dataDetailCount");
				params.type = type;
				params.day = day;
				E.getData('dataDetailCount', params, function(data) {
					E.closeLoading()
					if(!data.isSuccess) {
						E.alert(data.map.errorMsg)
						return
					}
					var result = data;
					data = result.dataResult[0];
					if(day == "60day") {
						for(key in data) {
							chartData.allXdata.push(key.slice(5));
							chartData.allYdata.push(data[key])
							chartData.yeardata.push(key);
						}
						chartData.xCollection[1] = chartData.allXdata.slice(53, 60)
						chartData.xCollection[2] = chartData.allXdata.slice(30, 60)
						chartData.xCollection[3] = chartData.allXdata.slice(0, 60)
						chartData.yearCollection[1] = chartData.yeardata.slice(53, 60)
						chartData.yearCollection[2] = chartData.yeardata.slice(30, 60)
						chartData.yearCollection[3] = chartData.yeardata.slice(0, 60)
						chartData.yCollection[1] = chartData.allYdata.slice(53, 60)
						chartData.yCollection[2] = chartData.allYdata.slice(30, 60)
						chartData.yCollection[3] = chartData.allYdata.slice(0, 60)
						for(var j = 1; j < 4; j++) {
							var total = 0;
							for(var i = 0; i < chartData.yCollection[j].length; i++) {
								total += parseFloat(chartData.yCollection[j][i])
							}
							self.totals[j] = total
						}
						for(var j = 0; j < chartData.xCollection[1].length; j++) {
							chartData.xdataTip[1].push(chartData.xCollection[1][j])
							chartData.xdata[1].push(chartData.xCollection[1][j])
							chartData.ydata[1].push(chartData.yCollection[1][j])
							self.items[1].push([chartData.yearCollection[1][j], chartData.yCollection[1][j]]);
						}

						for(var i = 0; i < chartData.yearCollection[2].length; i++) {
							self.items[2].push([chartData.yearCollection[2][i], chartData.yCollection[2][i]])
						}
						for(var i = 0; i < chartData.yearCollection[3].length; i++) {
							self.items[3].push([chartData.yearCollection[3][i], chartData.yCollection[3][i]])
						}
						self.items[1] = self.items[1].reverse()
						self.items[2] = self.items[2].reverse()
						self.items[3] = self.items[3].reverse()
						for(var j = 0; j < chartData.xCollection[2].length; j += 4) {
							if(j == 0) {
								chartData.xdataTip[2].push(chartData.xCollection[2][j])
								chartData.xdata[2].push(chartData.xCollection[2][j])
								chartData.ydata[2].push(chartData.yCollection[2][j])
							}
							chartData.xdataTip[2].push(chartData.xCollection[2][j] + "至" + chartData.xCollection[2][j + 4])
							chartData.xdata[2].push(chartData.xCollection[2][j + 4])

							j++
						}
						for(var j = 0; j < chartData.xCollection[2].length; j += 5) {
							var count = 0;
							for(var m = j; m < j + 5; m++) {
								count += parseInt(chartData.yCollection[2][m])
								count = parseFloat(count).toFixed(2);
								count=count>Math.floor(count)?count:Math.floor(count)
							}
							chartData.ydata[2].push(count)

						}
						for(var j = 0; j < chartData.xCollection[3].length; j += 9) {
							if(j == 0) {
								chartData.xdataTip[3].push(chartData.xCollection[3][j])
								chartData.xdata[3].push(chartData.xCollection[3][j])
								chartData.ydata[3].push(chartData.yCollection[3][j])
							}
							chartData.xdataTip[3].push(chartData.xCollection[3][j] + "至" + chartData.xCollection[3][j + 9])
							chartData.xdata[3].push(chartData.xCollection[3][j + 9])
							j++
						}
						for(var j = 0; j < chartData.xCollection[3].length; j += 10) {
							var count = 0;
							for(var m = j; m < j + 10; m++) {
								count += parseInt(chartData.yCollection[3][m])
								count = parseFloat(count).toFixed(2);
								count=count>Math.floor(count)?count:Math.floor(count)
							}
							chartData.ydata[3].push(count)

						}
					}

					if(day == "yesterday") {
						if(type == "selfBonus") {
							var selfResult = result.selfResult[0];
							for(key in selfResult) {
								self.famount = key;
								self.tamount = selfResult[key]
							}
							self.showpie = true;
							document.getElementById("main").style.height = "300px"
							setTimeout(function() {
								chartData.init();
								chartData.roundPie(self.famount, self.tamount)
							}, 0)
							self.totals[0] = 0
						} else {
							var total = 0;
							for(key in data) {
								chartData.xCollection[0].push(key.slice(11) + ":00")
								chartData.yCollection[0].push(data[key])
								total += parseFloat(data[key])
							}
							self.totals[0] = total
							chartData.xCollection[0].push("24:00");
							chartData.yCollection[0].push(0)
							for(var j = 0; j < chartData.xCollection[0].length - 1; j += 4) {
								if(j == 0) {
									chartData.xdataTip[0].push(chartData.xCollection[0][j])
									chartData.xdata[0].push(chartData.xCollection[0][j])
									chartData.ydata[0].push(chartData.yCollection[0][j])
								}
								var count = 0;
								for(var m = j; m < j + 4; m++) {
									count = parseFloat(count + parseFloat(chartData.yCollection[0][m])).toFixed(2);
									count=count>Math.floor(count)?count:Math.floor(count)
								}
								chartData.xdataTip[0].push(chartData.xCollection[0][j] + "-" + chartData.xCollection[0][j + 4]);
								chartData.xdata[0].push(chartData.xCollection[0][j + 4]);
								chartData.ydata[0].push(count)
								self.items[0].push([chartData.xCollection[0][j] + "-" + chartData.xCollection[0][j + 4], count])
							}
							chartData.init();
							chartData.loadChart(0)
							self.datas = self.items[0].reverse();
							self.totalCount = self.totals[0].toFixed(2);
							E.closeLoading()
						}
						self.loadData(type, "60day")
					}

				}, "get")
			},
			changeDate: function(e) {
				var self = this;
				mui("button.mui-active")[0].classList.remove("mui-active")
				mui("button")[e].classList.add("mui-active")
				if(this.type == "selfBonus" && e == 0) {
					document.getElementById("main").innerHTML = "";
					document.getElementById("main").style.height = "300px"
					this.showpie = true;
					chartData.init()
					chartData.roundPie(self.famount, self.tamount);

				} else {
					document.getElementById("main").style.height = "200px"
					this.showpie = false;
					setTimeout(function() {
						chartData.init()
						chartData.loadChart(e);
						self.datas = self.items[e];
						self.totalCount = self.totals[e].toFixed(2);
					}, 0)
				}

			}

		}
	}
}
chartPage.init()
	/**
	 * 1:xdata 横坐标值
	 * 2:xdataTip 悬浮值
	 * 3:ydata 纵坐标值
	 * 4:allXdata 接口拿到的所有横坐标值
	 * 5:allYdata 接口拿到的所有纵坐标值
	 * 6:xdata 横坐标值
	 */
var chartData = {
	xdata: [
		[],
		[],
		[],
		[]
	],
	xdataTip: [
		[],
		[],
		[],
		[]
	],
	ydata: [
		[],
		[],
		[],
		[]
	],
	allXdata: [],
	allYdata: [],
	yeardata: [],
	yearCollection: [
		[]
	],
	xCollection: [
		[]
	],
	yCollection: [
		[]
	],
	init: function() {

		this.chart = echarts.init(document.getElementById('main'));

	},
	loadChart: function(e) {
		this.chart.setOption(this.getOption(e));
	},

	getOption: function(e) {
		return {
			tooltip: {
				trigger: 'axis',
				textStyle: {
					fontSize: 12,
				},
				formatter: function(params, ticket, callback) {
					var res = "";
					res = chartData.xdataTip[e][params[0].dataIndex] + '<br/>' + params[0].seriesName + ":" + chartData.ydata[e][params[0].dataIndex];
					setTimeout(function() {
						callback(ticket, res);
					}, 0)
					return 'loading';
				}

			},
			legend: {
				show: true,
				data: [chartPage.vue.name]
			},
			grid: {
				x: 60,
				x2: 10,
				y: 30,
				y2: 25
			},

			xAxis: [{
				type: 'category',
				data: this.xdata[e]
			}],
			yAxis: [{
				type: 'value'
			}],
			series: [{
				name: chartPage.vue.name,
				type: 'line',
				data: this.ydata[e]
			}]
		}

	},
	roundPie: function(e, d) {
		var op = E.getStorage("op")
		this.chart.setOption({
			legend: {
				x: '45%',
				y: '240px',
				orient: 'vertical',
				textStyle: {
					fontSize: 18,
				},
				data: [
					op, '其他'
				]
			},
			series: [{
					type: 'pie',
					center: ['55%', '45%'],
					radius: [90, 60],
					itemStyle: {
						normal: {
							label: {
								formatter: function(params) {
									return d == 0 ? 0 : (e / d).toFixed(2) * 100 + '%'
								},
								textStyle: {
									baseline: 'top',
									fontSize: 26,
									color: "#04ABF2"
								}
							}
						},
					},
					data: [{
						name: 'other',
						value: d == 0 ? 1 : d - e,
						itemStyle: {
							normal: {
								color: "#ccc",
								label: {
									show: true,
									textStyle: {
										fontSize: 26,
									},
									position: 'center'
								},
								labelLine: {
									show: false
								}
							},

						}
					}, {
						name: op,
						value: e,
						itemStyle: {
							normal: {
								label: {
									formatter: function(params) {
										return "￥" + e
									},
									show: true,
									position: 'center',
									textStyle: {
										baseline: 'bottom',

									}
								},
								labelLine: {
									show: false
								},
								color: "#04ABF2",

							}
						}
					}]
				}

			]

		});
	}
}