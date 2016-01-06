/**
 * 采用child_process的方式开启服务线程，由本脚本控制服务器运行
 */

var spawn = require('child_process').spawn;
var path = require('path');
var runService;

// 当服务器退出时，根据消息进行对应的处理
var onServiceExit = function(errcode, signal) {
	if (errcode === 100) {
		// 更新完成
		var startArgv = ['--notOpenProjectPage'];
		// 启动服务器
		runService = startNodeService(startArgv);
        console.log('Service has restarted.')
		return;
	}

	// 正常退出，需要关闭外部维护线程
	process.exit();
	return;
};

// 带参数的启动服务
var startNodeService = function(config) {
	// 组合参数
	var startArgv = [path.join(__dirname, 'Start.js')];
	if (config && config.length) {
		Array.prototype.push.apply(startArgv, config);
	}

	// 启动服务
	var service = spawn(process.execPath, startArgv, {
			detached : false,
			stdio : ['pipe', process.stdout, process.stderr]
		});

	// 监听服务的结束
	service.on('exit', onServiceExit);
	return service;
};

// 启动服务
runService = startNodeService();
