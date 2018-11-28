/**
 * @author		Chengjuan
 * @date		2017-11-15
 * @describe	three.js建模  模型库封装
 */


/**
 * @describe	three.js建模 常用模型库，使用时取需要的建模类型即可
 * 				可参考网址：http://techbrood.com/threejs/docs/#参考手册/几何模型(Geometries)
 * 				进行在线建模查看效果
 * 
 * 示例：			以正方体为例，调用方法创建模型对象时，参数封装为json，
 * 				所有必填参数封装成名为“baseParams”的数组，且不带参数名，按下方指定顺序填写数值即可，
 * 				可选参数中，颜色需给出16进制颜色码，格式如：
 * 				{	"baseParams":[3,3,3], 
 * 					"color": "0xf0f0f0", 
 * 					"textUrl": "../static/images/abc.jpg",
 * 					"position":{"X":10, "Y":10, "Z":20}
 * 				}
 * 				注意：1. 需要贴图的平面宽高比 应尽量与 要贴的图片宽高比相等
 * 					2. 目前只针对 立方体 与 平面 两种模型 提供贴图，即创建其他模型时，不给“textUrl”参数
 */
var model3DLib = {
		//所有可选参数(color【颜色】, textUrl【纹理贴图的路径】, position【模型中心点坐标】)

		cube : "BoxGeometry",			//立方体：必填参数(width【宽度】, height【高度】, depth【深度】)；	
		plane : "PlaneGeometry",		//平面：必填参数(width【沿x轴宽度】, height【沿y轴高度】)
		circle: "CircleGeometry",		//圆形：必填参数(radius【半径】, segments【分割面数量，最低值为3，值越大则越圆】)
		cone: "ConeGeometry",			//椎体：必填参数(radius【锥底半径】, height【椎体高度】, radiusSegments【围绕锥底周长的分割面数，最低值3，最大则锥底越圆】)
		cylinder: "CylinderGeometry",	//圆柱体：必填参数(radiusTop【圆柱体顶端半径】, radiusBottom【圆柱体底端半径】, height【高度】, radiusSegments【圆柱分割面数，最小为3，值越大则截面越圆】)
		ring: "RingGeometry",			//环：必填参数(innerRadius【内环半径】, outerRadius【外环半径】, thetaSegments【分割面数量，最小值为3，值越大则环越圆】)
		sphere: "SphereGeometry",		//球：必填参数(radius【半径】, widthSegments【水平分割面数量，最小值3】, heightSegments【垂直分割面数量，最小值2】)
			
}

// 根据参数模型类型type，对应获取指定类型模型对象的函数名称（当部件增加时，可扩展）
var typeFunction = {
	switchDevice : "getDevice",		// 交换机
	server:"getDevice",			// 服务器
	cb : "getCb",				// 板卡
	port : "getPort",			// 端口
	power : "getPowerSwitch",			// 电源
	light : "getLight"			// 指示灯
}


function model3D(){
	this.canvasId = "";			// 必需参数：画布id
	this.id = null;				// 必需参数：设备id
	this.type = "";				// 必需参数：设备类型（可选值：switchDevice, server等，可扩展）
	this.realWidth = 0;			// 必需参数：设备实际宽度
	this.virtualWidth = 0; 		// 必需参数：设备（缩小后）虚拟宽度(以包裹整个设备的最小立方体封闭空间为基准计算)
	this.virtualHeight = 0;		// 必需参数：设备（缩小后）虚拟高度(以包裹整个设备的最小立方体封闭空间为基准计算)
	this.virtualDepth = 0;		// 必需参数：设备（缩小后）虚拟深度(以包裹整个设备的最小立方体封闭空间为基准计算)
	this.virtualPositionX = 0;	// 必需参数：当前设备（缩小后）中心点离封闭空间左下角点的距离（x轴）
	this.virtualPositionY = 0;	// 必需参数：当前设备（缩小后）中心点离封闭空间左下角点的距离（y轴）
	this.virtualPositionZ = 0;	// 必需参数：当前设备（缩小后）中心点离封闭空间左下角点的距离（z轴）
	
	this.centerCoordinateX = 0;	// 非必需参数：当前设备绘制出来后的实际中心坐标按照设备尺寸同比缩放后离封闭空间左下角点的距离（x轴）默认为0（不传参则默认在画布中间）
	this.centerCoordinateY = 0;	// 非必需参数：当前设备绘制出来后的实际中心坐标按照设备尺寸同比缩放后离封闭空间左下角点的距离（y轴）默认为0（不传参则默认在画布中间）
	this.centerCoordinateZ = 0;	// 非必需参数：当前设备绘制出来后的实际中心坐标按照设备尺寸同比缩放后离封闭空间左下角点的距离（z轴）默认为0（不传参则默认在画布中间）
	this.color = 0x696969;		// 非必需参数：颜色（16进制值）
	this.deviceData = null;		// 非必需参数：业务数据(可选参数，调用方根据需要封装数据传入，建议封装为含有"name"及其他数据的json对象)
	this.texture = "";			// 非必需参数：当前部件贴图路径
	this.border = true;			// 非必需参数：是否绘制边框
	this.borderColor = 0xffffff;// 非必需参数：边框颜色

	this.idEventsMap = new Map();	// 非必需参数：保存所有键为id，值为map集合的事件
	this.typeEventsMap = new Map();	// 非必需参数：保存所有键为type，值为map集合的事件
	this.partsParamsArr = [];	// 非必需参数：存储部件参数对象的数组（可通过addParts函数添加对象）
	this.cameraX = null;		// 非必需参数：相机在X轴方向坐标
	this.cameraY = null;		// 非必需参数：相机在Y轴方向坐标
	this.cameraZ = null;		// 非必需参数：相机在Z轴方向坐标
	
	// 添加部件的方法，参数为partsParams对象
	this.addPart = function(partsParamsObj){
		
		if((partsParamsObj.constructor + '').match('partsParams') != null){
			this.partsParamsArr.push(partsParamsObj);
		}else{
			console.error('请传入partsParams对象');
		}
	};
	
	// 获取绘制前的组件参数对象方法————用于更改模型外观，如根据状态切换贴图，更改模型的各项绘制参数等
	this.getPartParamsById = function(id){
		var allPartsParamsObjects = this.partsParamsArr;
		
		if(allPartsParamsObjects.length == 0){
			console.error('还未添加部件，请在调用addPart()方法之后调用该方法');
			return;
		}else{
			for(var i in allPartsParamsObjects){
				if(allPartsParamsObjects[i].id == id){
					return allPartsParamsObjects[i];
				}
			}
			console.error('未找到id为："' + id + '"的部件参数对象');
		}
		
	}
	
	// 获取绘制前的组件参数对象方法————用于更改模型外观，如根据状态切换贴图，更改模型的各项绘制参数等
	this.getPartParamsByType = function(type){
		var allPartsParamsObjects = this.partsParamsArr;
		var returnArr = []; 
		
		if(allPartsParamsObjects.length == 0){
			console.error('还未添加部件，请在调用addPart()方法之后调用该方法');
			return;
		}else{
			for(var i in allPartsParamsObjects){
				if(allPartsParamsObjects[i].type == type){
					returnArr.push(allPartsParamsObjects[i]);
				}
			}
			if(returnArr.length != 0){
				return returnArr;
			}
			console.error('未找到type为："' + type + '"的部件参数对象');
			return;
		}
		
	}
	
	// 获取绘制前的组件参数对象方法————用于更改模型外观，如根据状态切换贴图，更改模型的各项绘制参数等
	this.getPartParamsByName = function(name){
		var allPartsParamsObjects = this.partsParamsArr;
		var returnArr = []; 
		
		if(allPartsParamsObjects.length == 0){
			console.error('还未添加部件，请在调用addPart()方法之后调用该方法');
			return;
		}else{
			for(var i in allPartsParamsObjects){
				if(allPartsParamsObjects[i].partData.name == name){
					returnArr.push(allPartsParamsObjects[i]);
				}
			}
			if(returnArr.length != 0){
				return returnArr;
			}
			console.error('未找到name为："' + name + '"的部件参数对象');
			return;
		}
		
	}
	
	// 给指定id的组件注册监听事件
	this.addEventById = function(id, eventType, func){
		var map = this.idEventsMap;
		// map中不存在该id键
		if(!map.has(id)){
			map.set(id, new Map());
		}
		// 给当前id组件注册该类型事件
		map.get(id).set(eventType, func);	
		
	}
	
	// 给指定type的组件添加监听事件
	this.addEventByType = function(type, eventType, func){
		var map = this.typeEventsMap;
		// map中不存在该type键
		if(!map.has(type)){
			map.set(type, new Map());
		}
		// 给类型为type的组件注册该类型事件
		map.get(type).set(eventType, func);	
		
	}
	
	/*// 获取所有绘制后部件模型的方法，参数为其id————用于保证模型外观不变的情况下，更改其业务属性值
	this.getPartById = function(id){
		var allObjects = this.objects;
		
		if(allObjects.length == 0){
			console.error('模型未绘制，请在调用draw()方法之后获取模型');
			return;
		}else{
			// 在存储所有模型的数组中获取指定id的部件模型
			for(var i in allObjects){
				if(allObjects[i].name == id){
					return allObjects[i];
				}
			}
			console.error('未找到id为："' + id + '"的模型部件');
		}
	}
	
	// 获取所有绘制后的type为指定值的模型对象，参数为模型type（封装在busData中）
	this.getPartsByType = function(type){
		var allObjects = this.objects;
		var arr = [];
		if(allObjects.length == 0){
			console.error('模型未绘制，请在调用draw()方法之后获取模型');
			return;
		}else{
			// 在存储所有模型的数组中获取指定id的部件模型
			for(var i in allObjects){
				if(allObjects[i].type == type){
					arr.push(allObjects[i]);
				}
			}
			if(arr.length != 0){
				return arr;
			}
			console.error('未找到type为："' + type + '"的模型部件');
		}
	}
	
	// 获取绘制后的指定name值的部件模型（name被封装在busData中）
	this.getPartsByName = function(name){
		var allObjects = this.objects;
		var arr = [];
		if(allObjects.length == 0){
			console.error('模型未绘制，请在调用draw()方法之后获取模型');
			return;
		}else{
			// 在存储所有模型的数组中获取指定id的部件模型
			for(var i in allObjects){
				if(allObjects[i].userData.name == name){
					arr.push(allObjects[i]);
				}
			}
			if(arr.length != 0){
				return arr;
			}
			console.error('未找到name为："' + name + '"的模型部件');
		}
	}*/
};

/**
 * 部件参数对象
 */
function partsParams(){
	this.id = null;				// 必需参数：设备id
	this.type = "";				// 必需参数：设备类型（可选值：switchDevice, server等，可扩展）
	this.color = 0x000000;
	this.virtualWidth = 0; 	// 部件（缩小后）虚拟宽度(以包裹整个设备的最小立方体封闭空间为基准计算)
	this.virtualHeight = 0;	// 部件（缩小后）虚拟高度(以包裹整个设备的最小立方体封闭空间为基准计算)
	this.virtualDepth = 0;	// 部件（缩小后）虚拟深度(以包裹整个设备的最小立方体封闭空间为基准计算)
	this.virtualPositionX = 0;	// 当前部件（缩小后）中心点离封闭空间左下角点的距离（x轴）
	this.virtualPositionY = 0;	// 当前部件（缩小后）中心点离封闭空间左下角点的距离（y轴）
	this.virtualPositionZ = 0;	// 当前部件（缩小后）中心点离封闭空间左下角点的距离（z轴）
	this.partData = null;		// 业务数据(可选参数，调用方根据需要封装数据传入，封装含有"name"以及其他数据的json对象)
	this.texture = "";			// 当前部件贴图
	this.rotateAxisX = 0;		// 绕X轴旋转度数以Math.PI计算（如：旋转90度，则为 Math.PI/2）
	this.rotateAxisY = 0;		// 绕Y轴旋转度数以Math.PI计算（如：旋转90度，则为 Math.PI/2）
	this.rotateAxisZ = 0;		// 绕Z轴旋转度数以Math.PI计算（如：旋转90度，则为 Math.PI/2）
	this.virtualRadius = null;	// 虚拟半径（模型为圆形时）
}


/**
 * 获取具有指定id键的事件map
 */
model3D.prototype.getIdEventsMap = function(id){
	var _this = this;
	
	if(_this.idEventsMap.has(id)){
		var map = _this.idEventsMap.get(id);
		return map;
	}
	return null;		
}

/**
 * 获取具有指定type键的事件map
 */
model3D.prototype.gettypeEventsMap = function(type){
	var _this = this;
	
	if(_this.typeEventsMap.has(type)){
		var map = _this.typeEventsMap.get(type);
		return map;
	}
	return null;		
}

/**
 * 模型公共事件
 */
model3D.prototype.modelCommonEvent = function(eventType){
	var _this = this;
	_this.renderer.domElement.addEventListener(eventType,function(event){
		var objArr = _this.getObjsSelected(event);
		if(objArr.length > 0){
			// 获取鼠标拾取到的物体（第一个）
			var objSelected = objArr[0].object;
			if(objSelected.name != null){
				
				var idMap = _this.getIdEventsMap(objSelected.name);
				if(idMap != null && idMap.has(eventType)){
					idMap.get(eventType)();
				}
				
			}
			
			if(objSelected.type.length != 0){
				var typeMap = _this.gettypeEventsMap(objSelected.type);
				if(typeMap != null && typeMap.has(eventType)){
					typeMap.get(eventType)();
				}
			}
		}
	},false);
}


/**
 * @describe		初始化各必要组件
 */
model3D.prototype.start = function(){
	var _this = this;
	_this.initThree();
	_this.initCamera(_this.cameraX, _this.cameraY, _this.cameraZ);
	_this.initControls();
	_this.initScene();
};

/**
 * 根据调用方传入的参数，绘制模型
 */
model3D.prototype.draw = function(){
	var _this = this;
	
	var type = _this.type;		// 获取当前绘制类型
	var typeFunc = eval("typeFunction." + type);	// 根据类型获取其对应函数
	var deviceObj = eval("_this." + typeFunc + "()");	// 绘制模型
	// 绑定数据
	_this.bindData(deviceObj, _this.deviceData);	
	deviceObj.name = _this.id;		// 由于three.js网格对象mesh的id属性无法更改，故将id值填入其name属性中，此处注意
	deviceObj.type = _this.type;
	_this.addObjToScene(deviceObj);	
	
	for(var i = 0; i < _this.partsParamsArr.length; i++){
		var part = _this.partsParamsArr[i];
		var type = part.type;		// 获取当前绘制类型
		var typeFunc = eval("typeFunction." + type);	// 根据类型获取其对应函数
		var partStr = JSON.stringify(part);		// 将对象转成json字符串
		var partObj = eval("_this." + typeFunc + "(" + partStr + ")");	// 绘制模型
		_this.bindData(partObj, part.partData);	// 绑定数据
		partObj.name = part.id;
		partObj.type = part.type;
		_this.addObjToScene(partObj);	
	}
	
	_this.modelCommonEvent('click');
	_this.modelCommonEvent('contextmenu');
	_this.modelCommonEvent('dblclick');
	_this.modelCommonEvent('mouseup');
	_this.modelCommonEvent('mouseover');
}

// 重绘对象，参数为partsParams对象，或者元素为partsParams对象的数组
model3D.prototype.redraw = function(partParams){
	var _this = this;
	
	// 传入参数为partsParams对象
	if(partParams instanceof partsParams){
		var type = partParams.type;
		var typeFunc = eval("typeFunction." + type);	// 根据类型获取其对应函数
		var partStr = JSON.stringify(partParams);		// 将对象转成json字符串
		var partObj = eval("_this." + typeFunc + "(" + partStr + ")");	// 绘制模型
		_this.bindData(partObj, partParams.partData);	// 绑定数据
		partObj.name = partParams.id;
		partObj.type = type;
		_this.addObjToScene(partObj);	
	}else{
		if(partParams instanceof Array && partParams.length != 0){
			for(var i = 0; i < partParams.length; i++){
				var part = partParams[i];
				var type = part.type;		// 获取当前绘制类型
				var typeFunc = eval("typeFunction." + type);	// 根据类型获取其对应函数
				var partStr = JSON.stringify(part);		// 将对象转成json字符串
				var partObj = eval("_this." + typeFunc + "(" + partStr + ")");	// 绘制模型
				_this.bindData(partObj, part.partData);	// 绑定数据
				partObj.name = part.id;
				partObj.type = type;
				_this.addObjToScene(partObj);	
			}
		}else{
			console.error('重绘参数为partsParams对象，或元素为partsParams对象的数组');
		}
	}
	
}

/**
 * @describe		定义属性
 * @params			_eId：字符串类型，画布元素id
 * 					_option：json数据类型，渲染器参数
 * 					示例：	_option = {
 * 								antialias:true/false,		//是否抗锯齿效果
 * 								clearColor:0xFFFFFF			//刷新色：16进制颜色码
 * 								showHelpGrid:true/false		//是否有网格线
 * 							}
 */
model3D.prototype.initParams3D = function(){
	
	//画布对象id
	this.container = document.getElementById(this.canvasId);
	this.width = null;			//保存画布原始宽度
	this.height = null;			//保存画布原始高度
	
	this.renderer = null;		//渲染器
	this.camera = null;			//相机
	this.scene = null;			//场景
	this.SELECTED = null;		//存入鼠标拾取单个物体
	this.objects = [];			//用来存入所有物体的数组
	this.mouse = new THREE.Vector2();			//鼠标对象
	this.raycaster = new THREE.Raycaster();		//辅助物体拾取的射线对象
	this.controls = null;						//鼠标控制器
	
	
}

/**
 * @describe		初始化渲染器
 */
model3D.prototype.initThree = function(){
	var _this = this;
	_this.renderer = new THREE.WebGLRenderer({antialias:true});
	_this.width = _this.container.clientWidth;
	_this.height = _this.container.clientHeight;
	_this.renderer.setSize(_this.width, _this.height);
	//_this.renderer.setClearColor(0x00ff00, 0.9);
	_this.container.appendChild(_this.renderer.domElement);
}

/**
 * @describe		初始化相机
 */
model3D.prototype.initCamera = function(cameraX, cameraY, cameraZ){
	var _this = this;
	var z = cameraZ || 700;
	var y = cameraY || 100;
	var x = cameraX || 0;
	_this.camera = new THREE.PerspectiveCamera(70, _this.width/_this.height, 0.1, 10000);
	_this.camera.position.set(x, y, z);
}

/**
 * @describe		初始化鼠标控制器
 */
model3D.prototype.initControls = function(){
	var _this = this;
	_this.controls = new THREE.OrbitControls(_this.camera, _this.renderer.domElement);
}

/**
 * @describe		初始化场景
 * @params			_bgColor：场景背景颜色，16进制颜色码
 */
model3D.prototype.initScene = function(_bgColor){
	var _this = this;
	var color = _bgColor || 0xf0f0f0;
	_this.scene = new THREE.Scene();
	_this.scene.background = new THREE.Color(color);
}

/**
 * @describe		绘制物体（需引入threeJsModelLib.js文件）
 * @return			创建的模型对象
 * @params			_objNameStr：字符串类型，要绘制的物体名称字符串，使用上述文件中的对象属性获得———— 如：model3DLib.cube
 * 					_objParams: json数据类型，绘制模型对象，必填参数为“baseParams”数组，其余参数可选。
 * 					参考threeJsModelLib.js文件。格式如：
 * 					_objParams = {	"baseParams":[{3},{3},{3}], 
 * 									"color": "0xf0f0f0", 
 * 									"textUrl": "../static/images/abc.jpg",
 * 									"position":{"X":10, "Y":10, "Z":20}
 *								}
 * @tips			此方法返回的对象，各面的纹理样式一样
 */
model3D.prototype.drawObjects = function(_objNameStr, _objParams){
	//绘制物体参数
	var _this = this;
	_this.objParams = new Object();
	_this.objParams.baseParams = _objParams.baseParams;		//获取基本必填参数的json数组
	_this.objParams.color = _objParams.color || 0x000000;		//默认白色
	_this.objParams.textUrl = _objParams.textUrl || '';		//默认不贴图
	_this.objParams.objX = _objParams.position.X || 0;		//中心点X坐标
	_this.objParams.objY = _objParams.position.Y || 0;		//中心点Y坐标
	_this.objParams.objZ = _objParams.position.Z || 0;		//中心点Z坐标
	var baseParamsStr = _this.objParams.baseParams.join(",");
	//创建几何体
	var obj = eval('new THREE.' + _objNameStr + '(' + baseParamsStr + ')');
	var material = new THREE.MeshBasicMaterial({
		color:_this.objParams.color,
		opacity:0.98,
		wireframe:false,
		side:THREE.DoubleSide
	});
	
	if(_this.objParams.textUrl){
		//纹理坐标由顶点的uv成员表示，uv被定义为一个二维向量THREE.Vector2()
		/*plane.vertices[0].uv = new THREE.Vector2(0, 0);
		plane.vertices[1].uv = new THREE.Vector2(1, 0);
		plane.vertices[2].uv = new THREE.Vector2(1, 1);
		plane.vertices[3].uv = new THREE.Vector2(0, 1);*/
		
		//var texture = THREE.ImageUtils.loadTexture(_this.objParams.textUrl, null, function(t){});
		material = new THREE.MeshBasicMaterial({
			side:THREE.DoubleSide,
			map:new THREE.TextureLoader().load(_this.objParams.textUrl)
		});
	}
	
	//加入网格
	var mesh = new THREE.Mesh(obj,material);
	//设置坐标
	mesh.position.set(_this.objParams.objX, _this.objParams.objY, _this.objParams.objZ);

	_this.objects.push(mesh);
	return mesh;
	
}

/**
 * @describe		用于给绘制的物体绑定数据
 * @return			返回绑定数据后的模型对象
 * @params			_objModel：欲绑定参数的模型对象
 * 					_data：要绑定的数据
 */
model3D.prototype.bindData = function(_objModel, _data){
	_objModel.userData = _data;
	return _objModel;
}

/**
 * @describe		设置物体的中心点坐标
 * @params			_objMesh：要设置的物体对象
 * 					_objX：中心点X坐标
 * 					_objY：中心点Y坐标
 * 					_objZ：中心点Z坐标
 */
model3D.prototype.setPosition = function(_objMesh, _objX, _objY, _objZ){
	objX = _objX || 0;
	objY = _objY || 0;
	objZ = _objZ || 0;
	_objMesh.position.set(objX, objY, objZ);
}

/**
 * @describe	设置所有部件的坐标（保证位置关系不变的整体平移）
 * @params		_objArr：保存所有部件的数组
 * 				_objX：整体平移x坐标长度
 * 				_objY：整体平移y坐标长度
 * 				_objZ:整体平移z坐标长度
 */
/*model3D.prototype.setAllPosition = function(_objArr, _objX, _objY, _objZ){
	for(var i = 0; i < _objArr.length; i++){
		var obj = _objArr[i];
		var x = obj.position.x;
		var y = obj.position.y;
		var z = obj.position.z;
		obj.position.set(x + _objX, y + _objY, z + _objZ);
	}
}*/

/**
 * @describe		绘制边框
 * @params			_objMesh：欲绘制边框的物体
 * 					_borderColor：边框颜色
 */
model3D.prototype.drawBorder = function(_objMesh, _borderColor){
	var _this = this;
	var color = _borderColor || 0xFFFFFF;
	var border = new THREE.BoxHelper(_objMesh, color);
	_this.scene.add(border);
}

/**
 * @describe		将物体添加进场景中
 * @params			_objMesh：欲添加的物体
 */
model3D.prototype.addObjToScene = function(_objMesh){
	var _this = this;
	_this.scene.add(_objMesh);
}

/**
 * @describe		获取监听事件中鼠标拾取到的物体，若要给绘制的物体添加监听事件，需先调用该方法获取到鼠标拾取到的物体数组
 * 					若数组长度大于1，则数组中的第一个元素，即 “所见到” 鼠标拾取到的对象
 * @return			拾取的物体数组
 * @params			event：监听事件对象
 * 					_objectsArr：所有需要被拾取的物体数组，即model3D对象的objects属性
 */
model3D.prototype.getObjsSelected = function(event, _objectsArr){
	event.preventDefault();
	var _this = this;
	var objectsArr = _objectsArr || _this.objects ;
	
	_this.mouse.x = ((event.clientX - _this.container.getBoundingClientRect().left) / _this.container.offsetWidth) * 2 - 1;
	_this.mouse.y = - ((event.clientY - _this.container.getBoundingClientRect().top) / _this.container.offsetHeight) * 2 + 1;
	
	_this.raycaster.setFromCamera( _this.mouse, _this.camera);
	
	var intersects = _this.raycaster.intersectObjects(objectsArr);
	return intersects;
}



/**
 * 获取板卡————模型对象为“平面”
 */
model3D.prototype.getCb = function(partParams){
	var _this = this;
	// 获得缩放比例
	var ratio = _this.realWidth/_this.virtualWidth;
	var realWidth = partParams.virtualWidth * ratio;
	var realHeight = partParams.virtualHeight * ratio;
	var realPositionX = -_this.virtualPositionX * ratio + partParams.virtualPositionX * ratio + _this.centerCoordinateX * ratio;
	var realPositionY = -_this.virtualPositionY * ratio + partParams.virtualPositionY * ratio + _this.centerCoordinateY * ratio;
	var realPositionZ = -_this.virtualPositionZ * ratio + partParams.virtualPositionZ * ratio + _this.centerCoordinateZ * ratio;
	
	var cbParams = {
			"baseParams":[realWidth, realHeight],		
			"color": partParams.color || 0xffffff,
			"textUrl":partParams.texture,
			"position":{"X":realPositionX, "Y":realPositionY += 1, "Z":realPositionZ}
	}
	var cbObj = _this.drawObjects(model3DLib.plane, cbParams);
	
	// 是否旋转
	if(partParams.rotateAxisX != 0 ){
		eval("cbObj.rotateX" + "(" + partParams.rotateAxisX + ")");
		//realPositionY += 1;
	}
	if(partParams.rotateAxisY != 0 ){
		eval("cbObj.rotateY" + "(" + partParams.rotateAxisY + ")");
		realPositionZ += 1;
	}
	if(partParams.rotateAxisZ != 0 ){
		eval("cbObj.rotateZ" + "(" + partParams.rotateAxisZ + ")");
		realPositionX += 1;
	}
	
	_this.setPosition(cbObj, realPositionX, realPositionY, realPositionZ);
	return cbObj;
	
}

/**
 * 获取交换机端口模型————模型对象为平面
 */
model3D.prototype.getPort = function(partsParams){
	var _this = this;
	// 获得缩放比例
	var ratio = _this.realWidth/_this.virtualWidth;
	var realWidth = partsParams.virtualWidth * ratio;
	var realHeight = partsParams.virtualHeight * ratio;
	var realPositionX = -_this.virtualPositionX * ratio + partsParams.virtualPositionX * ratio + _this.centerCoordinateX * ratio;
	var realPositionY = -_this.virtualPositionY * ratio + partsParams.virtualPositionY * ratio + _this.centerCoordinateY * ratio;
	var realPositionZ = -_this.virtualPositionZ * ratio + partsParams.virtualPositionZ * ratio + _this.centerCoordinateZ * ratio;
	
	var portParams = {
			"baseParams":[realWidth, realHeight],		
			"color": partsParams.color || 0xffffff,
			"textUrl":partsParams.texture,
			"position":{"X":realPositionX, "Y":realPositionY, "Z":realPositionZ += 1}
	}
	var portObj = _this.drawObjects(model3DLib.plane, portParams);
	
	if(partsParams.rotateAxisX != 0 ){
		eval("portObj.rotateX" + "(" + partsParams.rotateAxisX + ")");
		realPositionY += 1;
	}
	if(partsParams.rotateAxisY != 0 ){
		eval("portObj.rotateY" + "(" + partsParams.rotateAxisY + ")");
		//realPositionZ += 1;
	}
	if(partsParams.rotateAxisZ != 0 ){
		eval("portObj.rotateZ" + "(" + partsParams.rotateAxisZ + ")");
		realPositionX += 1;
	}
	
	_this.setPosition(portObj, realPositionX, realPositionY, realPositionZ);
	return portObj;
}

/**
 * 获取电源开关————模型对象为立方体
 */
model3D.prototype.getPowerSwitch = function(partsParams){
	var _this = this;
	// 获得缩放比例
	var ratio = _this.realWidth/_this.virtualWidth;
	var realWidth = partsParams.virtualWidth * ratio;
	var realHeight = partsParams.virtualHeight * ratio;
	var realDepth = partsParams.virtualDepth * ratio;
	var realPositionX = -_this.virtualPositionX * ratio + partsParams.virtualPositionX * ratio + _this.centerCoordinateX * ratio;
	var realPositionY = -_this.virtualPositionY * ratio + partsParams.virtualPositionY * ratio + _this.centerCoordinateY * ratio;
	var realPositionZ = -_this.virtualPositionZ * ratio + partsParams.virtualPositionZ * ratio + _this.centerCoordinateZ * ratio;
	
	var powerSwitchParams = {
			"baseParams":[realWidth, realHeight, realDepth],		
			"color": partsParams.color || 0xffffff,
			"textUrl":partsParams.texture,
			"position":{"X":realPositionX, "Y":realPositionY, "Z":realPositionZ}
	}
	var powerSwitchObj = _this.drawObjects(model3DLib.cube, powerSwitchParams);
	
	return powerSwitchObj;
	
}

/**
 * 获取指示灯————模型对象为圆形
 */
model3D.prototype.getLight = function(partsParams){
	var _this = this;
	// 获得缩放比例
	var ratio = _this.realWidth/_this.virtualWidth;
	var realRadius = partsParams.virtualRadius * ratio;
	var realPositionX = -_this.virtualPositionX * ratio + partsParams.virtualPositionX * ratio + _this.centerCoordinateX * ratio;
	var realPositionY = -_this.virtualPositionY * ratio + partsParams.virtualPositionY * ratio + _this.centerCoordinateY * ratio;
	var realPositionZ = -_this.virtualPositionZ * ratio + partsParams.virtualPositionZ * ratio + _this.centerCoordinateZ * ratio;
	
	var lightParams = {
			"baseParams":[realRadius, 30],		
			"color": partsParams.color || 0xffffff,
			"textUrl":partsParams.texture,
			"position":{"X":realPositionX, "Y":realPositionY, "Z":realPositionZ += 1}
	}
	var lightObj = _this.drawObjects(model3DLib.circle, lightParams);
	
	if(partsParams.rotateAxisX != 0 ){
		eval("lightObj.rotateX" + "(" + partsParams.rotateAxisX + ")");
		realPositionY += 1;
	}
	if(partsParams.rotateAxisY != 0 ){
		eval("lightObj.rotateY" + "(" + partsParams.rotateAxisY + ")");
		//realPositionZ += 1;
	}
	if(partsParams.rotateAxisZ != 0 ){
		eval("lightObj.rotateZ" + "(" + partsParams.rotateAxisZ + ")");
		realPositionX += 1;
	}
	
	_this.setPosition(lightObj, realPositionX, realPositionY, realPositionZ);
	return lightObj;
	
}

/**
 * 获取设备外框————模型对象为立方体
 */
model3D.prototype.getDevice = function(){
	var _this = this;
	// 获得缩放比例
	var ratio = _this.realWidth/_this.virtualWidth;
	var realWidth = _this.virtualWidth * ratio;
	var realHeight = _this.virtualHeight * ratio;
	var realDepth = _this.virtualDepth * ratio;
	var realPositionX = -_this.virtualPositionX * ratio + _this.virtualPositionX * ratio + _this.centerCoordinateX * ratio;
	var realPositionY = -_this.virtualPositionY * ratio + _this.virtualPositionY * ratio + _this.centerCoordinateY * ratio;
	var realPositionZ = -_this.virtualPositionZ * ratio + _this.virtualPositionZ * ratio + _this.centerCoordinateZ * ratio;
	
	var deviceParams = {
			"baseParams":[realWidth, realHeight, realDepth],		
			"color": _this.color || 0xffffff,
			"textUrl":_this.texture,
			"position":{"X":realPositionX, "Y":realPositionY, "Z":realPositionZ}
	}
	var deviceObj = _this.drawObjects(model3DLib.cube, deviceParams);
	if(_this.border){
		_this.drawBorder(deviceObj, _this.borderColor);
	}
	return deviceObj;
}

/**
 * @describe		layer弹出层显示信息，页面需引入layer.js文件
 * @params			_align：文字对齐方式，接收"left","right","center"字符串，默认为"left"
 * 					_data：要显示的数据，需封装成json格式，格式如：
 * 					_data = {	"title": "端口信息",
 * 								"info":[
 * 									{"name":"端口名称", "value":"端口01"},
 * 									{"name":"端口ip", "value":"192.168.0.1"},
 * 									{"name":"端口状态", "value":"正常"}
 * 								]
 * 							}			
 * 
 */	
model3D.prototype.showLayerMsg = function(_data, _align){
	var align = _align || 'left';
	
	var strHead = '<div>';
	var strTitle = '';	//判断是否有传入标题信息
	if(column.title && column.title.length != 0){
		strTitle = '<div style="text-align:center;">' + column.title + '<div/>';
	}
	
	var strBody = '';
	switch (align){
		case 'left':	
			strBody = '<div style="text-align:left">';
			break;
		case 'center':
			strBody = '<div style="text-align:center">';
			break;
		case 'right':
			strBody = '<div style="text-align:right">';
			break;
		default:
			strBody = '<div style="text-align:left">';
	}	
	var strTail = '';
	for(var i = 0; i < column.info.length; i++){
		strTail += column.info[i].name;
		strTail += ':';
		strTail += column.info[i].value;
		strTail += '<br/>';
	}
				
	layer.msg(
			strHead + strTitle + strBody +strTail
			,{
				offset:[event.clientY + 1 + 'px', event.clientX + 1 + 'px'],
				time:0
			});
}

/**
 * @describe		移除layer提示框
 */
model3D.prototype.removeLayerMsg = function(){
	$(".layui-layer").remove();
}

/**
 * @describe		渲染循环
 */
model3D.prototype.animate = function(){
	mobj = this;
	render();
}

var mobj = null;
/**
 * @describe		渲染
 */
function render(){
	mobj.camera.lookAt(mobj.scene.position);
	mobj.renderer.render(mobj.scene,mobj.camera);
	mobj.controls.update();
	requestAnimationFrame(render);
}