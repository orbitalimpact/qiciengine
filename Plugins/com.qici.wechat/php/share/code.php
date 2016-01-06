<?php
/**
 * 获取code的回调页，中转下跳转到游戏页面
 */
require_once('lib/SnsNetwork.php');
require_once('lib/SnsSigCheck.php');

require_once('config.php');
require_once('include/log.php');
require_once('include/app_info.php');
require_once('include/wx.php');

// 游戏页的网址
$state = $_REQUEST['state'];

// code值
$code = $_REQUEST['code'];

if ($code) {
    $state .= "?code=$code";
}
header("Location: $state");
?>