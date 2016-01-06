<?php
/**
 * 微信的接口封装
 */
class WX {
    const TOKEN_URL = 'https://api.weixin.qq.com/cgi-bin/token';
    const TICKET_URL = 'https://api.weixin.qq.com/cgi-bin/ticket/getticket';
    const AUTH_URL = "https://open.weixin.qq.com/connect/oauth2/authorize";

    /**
     * 获取token
     */
    public static function refresh_access_token($appid) {
        $data = self::read_token_file($appid);
        if (!empty($data)) {
            if ($data['time'] + 1800 > time()) {
                // 尚未过期，直接返回token
                return $data['access_token'];
            }
        }

        Log::trace("$appid 过期了，重新获取token");
        $app_info = AppInfo::query($appid);
        $app_secret = $app_info['AppSecret'];
        $line = SnsNetwork::makeRequest(self::TOKEN_URL, "grant_type=client_credential&appid=$appid&secret=$app_secret", '',
            'get', 'https');
        if (!$line['result']) {
            Log::trace("调度失败了");
            return;
        }

        $r = json_decode($line['msg'], true);
        $token = $r["access_token"];
        if ($token) {
            Log::trace("$appid 取得token成功了");
            $r['time'] = time();
            self::write_token_file($appid, $r);
        }
        else {
            Log::trace("$appid 无法获取token：". $line['msg']);
        }
        return $token;
    }

    /**
     * 获取签名信息，在微信分享时需要
     */
    public static function get_sign($appid, $url) {
        $timestamp = time();
        $nonce = self::create_nonce();
        $ticket = self::get_ticket($appid);

        $string = "jsapi_ticket=$ticket&noncestr=$nonce&timestamp=$timestamp&url=$url";
        $sign = sha1($string);

        $package = array(
            "appId" => $appid,
            "nonceStr" => $nonce,
            "timestamp" => $timestamp,
            "url" => $url,
            "signature" => $sign,
            "rawString" => $string
        );
        return $package;
    }

    /**
     * 使用code换取access_token
     */
    public static function code_to_token($appid, $code) {
        $app_info = AppInfo::query($appid);
        $app_secret = $app_info['AppSecret'];

        $line = SnsNetwork::makeRequest("https://api.weixin.qq.com/sns/oauth2/access_token",
            "appid=$appid&secret=$app_secret&code=$code&grant_type=authorization_code", '',
            'get', 'https');
        if (!$line["result"]) {
            Log::trace("code换取token调度失败");
            return;
        }

        return json_decode($line['msg'], true);
    }

    /**
     * 刷新用户登录的token
     */
    public static function refresh_user_token($appid, $refresh_token) {
        $line = SnsNetwork::makeRequest("https://api.weixin.qq.com/sns/oauth2/refresh_token",
            "appid=$appid&grant_type=refresh_token&refresh_token=$refresh_token", '',
            'get', 'https');
        if (!$line["result"]) {
            Log::trace("code换取token调度失败");
            return;
        }

        return json_decode($line['msg'], true);
    }

    static function read_token_file($appid) {
        $dir = dirname(__FILE__). '/../data/'. $appid;
        $content = @file_get_contents($dir);
        if (!$content) return array();
        return json_decode($content, true);
    }

    static function write_token_file($appid, $info) {
        $dir = dirname(__FILE__). '/../data/'. $appid;
        file_put_contents($dir, json_encode($info));
    }

    static function create_nonce($length = 16)
    {
        $chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        $str = "";
        for ($i = 0; $i < $length; $i++)
        {
            $str .= substr($chars, mt_rand(0, strlen($chars) - 1), 1);
        }
        return $str;
    }

    static function get_ticket($appid)
    {
        $file_name = dirname(__FILE__). '/../data/'. $appid. '.ticket';
        $data = @file_get_contents($file_name);
        $data = @json_decode($data);
        $ticket = null;
        if (empty($data) || $data->expire_time < time()) {
            Log::trace('$appid Ticket过期了，重新获取');
            $token = self::refresh_access_token($appid);
            $line = SnsNetwork::makeRequest(self::TICKET_URL, "type=jsapi&access_token=$token", "", "get", "https");
            if (!$line['result']) {
                Log::trace("获取Ticket失败");
                return;
            }
            $r = json_decode($line['msg'], true);
            $ticket = $r['ticket'];
            if ($ticket) {
                Log::trace("获取Ticket成功，写入文件");
                $data = array(
                    "expire_time" => time() + 1800,
                    "ticket" => $ticket
                );
                file_put_contents($file_name, json_encode($data));
            } else {
                Log::trace("获取Ticket失败：" . $line['msg']);
            }
        }
        else {
            $ticket = $data->ticket;
        }
        return $ticket;
    }
}
?>
