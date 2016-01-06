<?php
/**
 * 公众号的信息检索接口
 */
class AppInfo {
    // 所有的公众号配置在此变量中
    private static $apps = array(
        // 测试用公众号
        "wxf9d9397986xxxxxx" => array(
            "name" => "测试而已",
            "AppID" => "wxf9d9397986xxxxxx",
            "AppSecret" => "26147c2a936feebxxxxxxx"
        )
    );

    // 根据appid获取配置的信息，包含appsecret、回调等
    public static function query($appid) {
        return AppInfo::$apps[$appid];
    }
}
?>
