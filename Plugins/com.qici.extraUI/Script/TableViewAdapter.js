/**
 * @author chenqx
 * copyright 2015 Qcplay All Rights Reserved.
 */
/**
 * TableView的适配器，用于提供表格数据信息。
 * 使用时，继承此类，并实现相关接口
 */
var TableViewAdapter = qc.defineBehaviour('com.qici.extraUI.TableViewAdapter', qc.Behaviour, function() {
	var self = this;

	/**
	 * @property {qc.Signal} onDataChange - 当表格数据发生变化时的通知事件
	 */
	self.onDataChange = new qc.Signal();
}, {
	
});

Object.defineProperties(TableViewAdapter.prototype,{

});

/**
 * 通知TableView表格变化
 */
TableViewAdapter.prototype.dispatchDataChange = function() {
	this.onDataChange.dispatch();

};

/**
 * 获取表格大小，x、y同时只能有一个为Infinity
 * @return {{x: number|Infinity, y: number| Infinity}}
 */
TableViewAdapter.prototype.getTableSize = function() {
	return { x: 1, y: Infinity};
};

/**
 * 根据在Table中的点返回对应的单元格
 * @param  {number} x - x轴坐标
 * @param  {number} y - y轴坐标
 * @return {{x: number, y: number}}} 返回点所在的单元格信息
 */
TableViewAdapter.prototype.findCellWithPos = function(x, y) {
	return { 
		x: Math.floor(x / 100),
		y: Math.floor(y / 100)
	};
};

/**
 * 获取节点的显示位置
 */
TableViewAdapter.prototype.getCellRect = function(col, row) {
	return new qc.Rectangle(col * 100, row * 100, 100, 100);
};

/**
 * 节点处于不可见时，回收节点，
 * @param  {qc.Node} cell - 节点
 * @param  {number} col - 所在列
 * @param  {number} row - 所在行
 */
TableViewAdapter.prototype.revokeCell = function(cell, col, row) {

};

/**
 * 节点处于可见时，创建节点，
 * @param  {qc.Node} cell - 节点
 * @param  {number} col - 所在列
 * @param  {number} row - 所在行
 */
TableViewAdapter.prototype.createCell = function(cell, col, row) {

};