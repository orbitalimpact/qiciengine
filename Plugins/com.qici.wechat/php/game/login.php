<?php
/**
 * 微信登录的处理
 */
header('Access-Control-Allow-Origin:*');
require_once('include/SnsNetwork.php');
require_once('include/log.php');
require_once('config.php');

// 登录成功后的游戏逻辑处理，有的话请自行补充
function after_login() {
    // TODO：业务逻辑自行补充
}

// 以下处理code换取token的逻辑
$code = $_REQUEST['code'];
if (!$code) {
    echo json_encode(array(
        "error" => "请指定code"
    ));
    die();
}

$appid = APPID;
$secret = APP_SECRET;
if ($_REQUEST['web']) {
    $appid = APPID_PC;
    $secret = APP_SECRET_PC;
}
$params = "appid=$appid&secret=$secret&code=$code&grant_type=authorization_code";
$line = SnsNetwork::makeRequest('https://api.weixin.qq.com/sns/oauth2/access_token', $params, '', 'get', 'https');
if (!$line['result']) {
    // 访问失败了
    echo json_encode(array(
        "error" => "访问失败"
    ));
    die();
}

$token = json_decode($line['msg'], true);
if ($token['errmsg']) {
    // 换取code失败
    echo json_encode(array(
        "error" => $token['errmsg']
    ));
    die();
}

// 成功获取到了，记录到session中
session_start();
$token['expires'] = time() + $token['expires_in'] - 15 * 60;
$_SESSION['access_token'] = $token;

// 拉取用户信息
$access_token = $token['access_token'];
$openid = $token['openid'];
$params = "access_token=$access_token&openid=$openid&lang=zh_CN";
$line = SnsNetwork::makeRequest('https://api.weixin.qq.com/sns/userinfo', $params, '', 'get', 'https');

echo json_encode(array(
    "openid" => $token['openid'],
    "unionid" => $token['unionid'],
    "userinfo" => json_decode($line['msg'], true)
));

// 调用具体的业务逻辑处理
after_login();
?>