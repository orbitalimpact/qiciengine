<?php
header('Access-Control-Allow-Origin:*'); 

require_once('lib/SnsNetwork.php');
require_once('lib/SnsSigCheck.php');

require_once('include/log.php');
require_once('include/app_info.php');
require_once('include/wx.php');

$appid = $_REQUEST['appid'];
$cmd = $_REQUEST['cmd'];

if (!$appid) die('请指定AppID');
if (!AppInfo::query($appid)) die('AppID尚未配置');

$data = null;
switch ($cmd) {
    case 'sign':
        // 获取分享的签名信息
        $data = WX::get_sign($appid, $_REQUEST['url']); break;

    default: die("未知指令");
}

echo json_encode($data);
?>