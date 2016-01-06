<?php
/**
 * 刷新access_token
 */
header('Access-Control-Allow-Origin:*');

require_once('include/SnsNetwork.php');
require_once('include/log.php');
require_once('config.php');

session_start();
$token = $_SESSION['access_token'];
if (!$token) {
    echo json_encode(array(
        "error" => "会话已过期"
    ));
    die();
}

if ($token['expires'] > time()) {
    // 还没有实效，不需要刷新
    echo json_encode(array(
        "result" => true
    ));
    die();
}

// 需要刷新token了
$appid = APPID;
if ($_REQUEST['web'])
    $appid = APPID_PC;
$refresh_token = $token['refresh_token'];
$params = "appid=$appid&grant_type=refresh_token&refresh_token=$refresh_token";
$line = SnsNetwork::makeRequest('https://api.weixin.qq.com/sns/oauth2/refresh_token', $params, '', 'get', 'https');
if (!$line['result']) {
    // 访问失败了
    echo json_encode(array(
        "error" => "访问失败"
    ));
    die();
}

if ($line['errmsg']) {
    // 刷新token失败
    echo json_encode(array(
        "error" => $line['errmsg']
    ));
    die();
}

// 成功获取到了，记录到session中
$token = json_decode($line['msg'], true);
$token['expires'] = time() + $token['expires_in'] - 15 * 60;
$_SESSION['access_token'] = $token;
echo json_encode(array(
    "result" => true
));
?>