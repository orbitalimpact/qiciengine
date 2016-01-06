/**
 * @author wudm
 * copyright 2015 Qcplay All Rights Reserved.
 *
 * Excel 文件打包规则
 */

M.PACK_RULE.excel = {
    type : G.ASSET_TYPE.ASSET_EXCEL,
    require : [
        [ '.xls', '.xlsx' ]
    ],
    parser : parseExcel,
    serialize : 'JSON'
};

/**
 * 解析excel的列名数据
 * @param sheet {[]} - 表格数据
 * @param rowIndex {Number} - 列名所在行
 * @param range {{}} - 表格有效数据范围
 * @returns {[String]} - 列名数组
 */
function parseExcelCols(sheet, rowIndex, range) {
    var cols = [];
    var validCol = 0;
    for (var i = range.s.c; i < range.e.c; i++) {
        var cellAddress = getColumnTitle(i) + rowIndex;
        var cell = sheet[cellAddress];
        var colName;
        if (!cell || cell.w.length === 0) {
            colName = getColumnTitle(i);
        }
        else {
            validCol++;
            colName = cell.w;
        }
        cols.push(colName);
    }
    if (validCol > 0)
        return cols;
    else
        return undefined;
}

/**
 * 解析Excel表一行的数据
 * @param sheet {[]} - 表格数据
 * @param cols {[String]} - 列名
 * @param rowIndex {Number} - 需要解析的行
 * @param range {{}} - 表格有效数据范围
 * @returns {{}}
 */
function parseExcelRow(sheet, cols, rowIndex, range) {
    var row = {};
    var validCol = 0;
    for (var i = range.s.c; i < range.e.c; i++) {
        var colsIdx = i - range.s.c;
        var cell = getColumnTitle(i) + rowIndex;
        if (!cell) {
            row[cols[colsIdx]] = undefined;
            continue;
        }
        var data = sheet[cell];
        if (!data) {
            row[cols[colsIdx]] = undefined;
        }
        else if (data.t === 'e') {
            // 错误也算有值
            validCol++;
            row[cols[colsIdx]] = undefined;
        } else {
            validCol++;
            row[cols[colsIdx]] = data.v;
        }
    }
    if (validCol)
        return row;
    else
        return null;
}

/**
 * 根据所在列的名称计算int型编号，从0开始
 * @param title {string} - 列名，如A,AB
 * @returns {number}
 */
function calcColumn(title) {
    var base = 'A'.charCodeAt(0) - 1;
    var value = 0;
    var len = title.length;
    for (var i = 0; i < len; i++) {
        value = value * 26 + title.charCodeAt(i) - base;
    }
    return value - 1;
}

/**
 * 根据列的数值编号计算列名
 * @param number {number} - 列编号，从0开始
 * @returns {string}
 */
function getColumnTitle(number) {
    var base = 'A'.charCodeAt(0) - 1;
    var title = [];
    var tmp;
    number = number + 1;
    do {
        tmp = number % 26;
        number = Math.floor(number / 26);
        if (tmp === 0) {
            title.push('Z');
            number--;
        }
        else
            title.push(String.fromCharCode(base + tmp));

    } while (number > 0);
    title.reverse();
    return title.join('');
}

/**
 * 计算excel表的有效区域
 * @param sheet {{}} - 表数据
 * @returns {*}
 */
function calcExcelRange(sheet) {
    if (sheet['!range'])
        return sheet['!range'];
    var ref = sheet['!ref'];
    if (!ref) {
        return {
            s : {
                r : 0,
                c : 0
            },
            e : {
                r : 0,
                c : 0
            }
        };
    }
    var ret = ref.match(/^([A-Z]+)([0-9]+):([A-Z]+)([0-9]+)$/);
    if (!ret) {
        return {
            s : {
                r : 0,
                c : 0
            },
            e : {
                r : 0,
                c : 0
            }
        };
    }
    return {
        s : {
            r : parseInt(ret[2]) - 1,
            c : calcColumn(ret[1])
        },
        e : {
            r : parseInt(ret[4]),
            c : calcColumn(ret[3]) + 1
        }
    };
}

/**
 * 解析excel文件
 * @param path {string} - 文件路径
 * @param meta {object} - meta信息
 */
function parseExcel(path, meta) {
    var xlsx = require('xlsx');
    var workbook = xlsx.readFile(path);
    var data = {};
    for (var sheetName in workbook.Sheets) {
        var sheet = workbook.Sheets[sheetName];
        var range = calcExcelRange(sheet);
        if (!range) {
            continue;
        }

        var rows = [];
        var cols = null;
        for (var i = range.s.r; i < range.e.r; i++) {
            var r = i + 1;
            var cell = sheet[getColumnTitle(range.s.c) + r];

            // 是否是注释行
            if (cell && cell.w.match(/^\s*#/)) {
                continue;
            }
            if (!cols) {
                // 获取列名
                cols = parseExcelCols(sheet, r, range);
            }
            else {
                var row = parseExcelRow(sheet, cols, r, range);
                if (row) {
                    rows.push(row);
                }
            }
        }
        data[sheetName] = {
            rows : rows,
            cols : cols || []
        };
    }
    return JSON.stringify(data);
};