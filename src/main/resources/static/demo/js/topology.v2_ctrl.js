// 基于准备好的dom，初始化echarts实例
var myChart = echarts.init(document.getElementById('EChartsDom'));

var icon1 = 'image:///images/demo/xchange_72.png';
var icon2 = 'image:///images/demo/Home_Server_96.png';
var icon3 = 'image:///images/demo/Hardware-My-Computer-3-icon.png';
var icon4 = 'image:///images/demo/48_monitor.png';

// 指定图表的配置项和数据
option = {
	backgroundColor: new echarts.graphic.RadialGradient(0.3, 0.3, 0.8, [{
		offset: 0,
		color: '#f5f5f5'
	}, {
		offset: 1,
		color: '#f5f5f5'
	}]),
	title: {
		text: "系统拓扑结构图"
	},
	tooltip: {
		formatter : function(params) {
				//console.log(params)
				if (params.dataType == "node") {
					//console.log(params)
					var res = params.data.ip + "<br/>"
					+ "类型" + ' : ' + params.data.category
					return res;
				} else if (params.dataType == "edge") {
					//console.log(params)
					var res = params.name + "<br/>"
					+ "source" + ' : ' + params.data.source + "<br/>"
					+ "target" + ' : ' + params.data.target + "<br/>";
					return res;
				}
			}
	},
	legend: [{
		formatter: function(name) {
			return echarts.format.truncateText(name, 40, '14px Microsoft Yahei', '…');
		},
		tooltip: {
			show: true
		},
		selectedMode: 'false',
		top: 0,
		bottom: '5%',
		itemWidth:40,  
		itemHeight:30, 
		data:[
			{  
				name:'标签服务',  
				textStyle:{  
					fontSize:12,  
					fontWeight:'bolder'
				},  
				icon: icon1,  
			},  
			{  
				name:'查杀服务',  
				textStyle:{  
					fontSize:12,  
					fontWeight:'bolder'
				},  
				icon: icon2  
			},
			{  
				name:'防泄漏服务',  
				textStyle:{  
					fontSize:12,  
					fontWeight:'bolder'
				},  
				icon: icon3  
			},
			{  
				name:'单向设备',  
				textStyle:{  
					fontSize:12,  
					fontWeight:'bolder'
				},  
				icon: icon4  
			} 
		]  
	}],
	toolbox: {
		show: true,
		feature: {
			restore: {
				show: true,
				title: '重置'
			}
		}
	},
	animationDuration: 3000,
	animationEasingUpdate: 'quinticInOut',
	series: [{
		type : 'graph',
		layout: 'force',
		symbolSize : 45,
		force: {
			//initLayout : 'circular',
			repulsion: 400,
			gravity: 0.15
		},
		data : [],
		links : [],

		focusNodeAdjacency: true,
		roam: true,
		label: {
			normal: {
				show: true,
				position: 'top',

			}
		},
		lineStyle: {
			normal: {
				color: {
					type: 'linear',
					x: 0,
					y: 0,
					x2: 0,
					y2: 1,
					colorStops: [{
						offset: 0, color: 'red' // 0% 处的颜色
					}, {
						offset: 1, color: 'blue' // 100% 处的颜色
					}],
					globalCoord: false // 缺省为 false
				},
				curveness: 0,
				type: "solid"
			}
		}
	}]
};

// 显示loading动画
myChart.showLoading();

$.ajax({
	url : "data_ctrl.json",//json文件位置
	type : "GET",//请求方式为get
	dataType : "json", //返回数据格式为json
	success : function(data) {//请求成功完成后要执行的方法 
		// 用于echarts的data数组
		var echartsData = new Array();
		// 用于echarts的link数组
		var echartsLink = new Array();
		
		// 类型列表
		var typeList = data.typeList;
		if(typeof(typeList)!="undefined"){ 
			for (var i = 0; i < typeList.length; i++) {
				var tmp = typeList[i];
				// 获取类型，用户判断图标
				var category = tmp.category;
				if('标签服务' == category){
					symbol = icon1;
				}else if('查杀服务' == category){
					symbol = icon2;
				}else if('防泄漏服务' == category){
					symbol = icon3;
				}else if('单向设备' == category){
					symbol = icon4;
				}
				
				var obj = {
						name: tmp.ip,
						category : category,
						symbol : symbol,
						symbolSize : 70,
						ip: tmp.ip,
						label: {
							normal:{
								show: true
							}
						},
						fixed : false,
						draggable: true
				};
				//console.log("obj > " + obj);
				//var json = JSON.stringify(exchangeList[i]); 
				echartsData.push(obj);
			}
		}
		
		// 标签服务
		var list1 = data.list1;
		if(typeof(list1)!="undefined"){ 
			for (var i = 0; i < list1.length; i++) {
				var tmp = list1[i];
				var obj = {
						name: tmp.ip,
						category : tmp.category,
						symbol : icon1,
						ip: tmp.ip,
						draggable: true
				};
				//console.log("obj > " + obj);
				//var json = JSON.stringify(exchangeList[i]); 
				echartsData.push(obj);
			}
		}
		
		// 查杀服务
		var list2 = data.list2;
		if(typeof(list2)!="undefined"){ 
			for (var i = 0; i < list2.length; i++) {
				var tmp = list2[i];
				var obj = {
						name: tmp.ip,
						category : tmp.category,
						symbol : icon2,
						ip: tmp.ip,
						draggable: true
				};
				//console.log("obj > " + obj);
				//var json = JSON.stringify(exchangeList[i]); 
				echartsData.push(obj);
			}
		}
		
		// 防泄漏服务
		var list3 = data.list3;
		if(typeof(list3)!="undefined"){ 
			for (var i = 0; i < list3.length; i++) {
				var tmp = list3[i];
				var obj = {
						name: tmp.ip,
						category : tmp.category,
						symbol : icon3,
						ip: tmp.ip,
						draggable: true
				};
				//console.log("obj > " + obj);
				//var json = JSON.stringify(exchangeList[i]); 
				echartsData.push(obj);
			}
		}
		
		// 单向设备
		var list4 = data.list4;
		if(typeof(list4)!="undefined"){ 
			for (var i = 0; i < list4.length; i++) {
				var tmp = list4[i];
				var obj = {
						name: tmp.ip,
						category : tmp.category,
						symbol : icon4,
						ip: tmp.ip,
						draggable: true
				};
				//console.log("obj > " + obj);
				//var json = JSON.stringify(exchangeList[i]); 
				echartsData.push(obj);
			}
		}

		// 连接线处理
		var linkList = data.linkList;
		if(typeof(linkList)!="undefined"){ 
			for (var i = 0; i < linkList.length; i++) {
				var tmp = linkList[i];
				
				var color = 'green';
				if(-1 == tmp.status){
					color = 'red';
				}
				
				var lineType = 'dashed';
				var lineWidth = 2;
				if(9 == tmp.status){
					lineType = 'solid';
					lineWidth = 4;
				}
				
				var obj = {
						source : tmp.source,
						target: tmp.target,
						status: tmp.status,
						lineStyle: {
							normal:{
								type : lineType,
								width: lineWidth
							}
						}
				};
				
				//console.log("obj > " + obj);
				echartsLink.push(obj);
			}
		}
									
		//each循环 使用$.each方法遍历返回的数据date
		//$.each(data.relation, function(i, item) {
			//console.log(item);
		//})
		
		fetchData(function(data) {
			// 隐藏loading动画
			myChart.hideLoading();
		});
		
		// 指定图表的配置项和数据
		option = {
			series : [ {
				data : echartsData,
				links : echartsLink,
				categories: [{
					'name': '标签服务'
				}, {
					'name': '查杀服务'
				}, {
					'name': '防泄漏服务'
				}, {
					'name': '单向设备'
				}]
			} ]
		};

		myChart.setOption(option);
	}
})

// 使用刚指定的配置项和数据显示图表。
myChart.setOption(option);