<?php
/**
 * 简单的日志系统
 */
class Log {
    // 日志等级
    const TRACE = 0;
    const INFO = 1;
    const WARNING = 2;
    const ERROR = 3;
    const DEBUG = 4;
    public static $level = -1;

    // 日志的路径
    private static $log_dir = '/../log/';

    public static function trace($data) {
        if (Log::$level < Log::TRACE) return;

        Log::write($data);
    }

    public static function info($data) {
        if (Log::$level < Log::INFO) return;

        Log::write($data);
    }

    public static function warning($data) {
        if (Log::$level < Log::WARNING) return;

        Log::write($data);
    }

    public static function error($data) {
        if (Log::$level < Log::ERROR) return;

        Log::write($data);
    }

    // 写入日志文件
    private static function write($data) {
        $dir = dirname(__FILE__). Log::$log_dir. date('y-m-d', time()). '.txt';
        file_put_contents($dir, $data. PHP_EOL, FILE_APPEND);
    }
};

if (DEBUG) {
    Log::$level = Log::DEBUG;
}
?>
