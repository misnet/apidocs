<?php
/**
 * 取得mock数据示例：
 * http://localhost/apidocs/read.php?api=console.user.list&mock=1
 */
include_once 'config.php';

function checkPublicRequest()
{
    $array = [];
    $sign = "";
    foreach ($_POST as $key => $value) {
        if ($key == 'sign') {
            $sign = $value;
            continue;
        }
        $array[$key] = $value;
    }

    $appkey = isset($array['appkey']) ? $array['appkey'] : '';
    $method = isset($array['method']) ? $array['method'] : '';
    $access_token = isset($array['access_token']) ? $array['access_token'] : '';
    $locale = isset($array['locale']) ? $array['locale'] : '';
    $version = isset($array['version']) ? $array['version'] : '';

    if ($appkey && $sign && $method) {
        $secret = 'IsuZLMPJDVnwYp8XYp/Pf4HH6e5PY28c8oQy8akF5vWxMjvvSNORdPvDu6HK9eOAGcVmDk1jLRYIkAcGu7tgUQ==';
        ksort($array);

        $r = strtoupper(md5($secret . join('', array_map(function ($key) use ($array) {
            return $key . $array[$key];
        }, array_keys($array))) . $secret));
        if ($r != $sign) {
            return [
                "status" => 99001,
                "data" => '无效签名',
            ];
        }
        return 0;
    } else {
        return [
            "status" => 99003,
            "data" => '参数缺失',
        ];
    }
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    $detail['status'] = 99999;
    $detail['data'] = '必须是POST请求';
} else {
    if (empty($_POST)) {
        $detail = [
            "status" => 99003,
            "data" => '参数缺失',
        ];
    } else {
        $r = checkPublicRequest();
        if ($r) {
            $detail = $r;
        } else {
            $apiId = $_POST['method'];
            if (isset($_GET['api']) && $_GET['api'] !== $apiId) {
                header('Content-Type: application/json');
                echo json_encode([
                    "status" => 99999,
                    "data" => 'GET参数和POST参数不匹配',
                    'GET' => $_GET,
                    'POST' => $_POST,
                ]);
                exit;
            }
            $parser = new ApiParser(API_ROOT_DIR);
            $detail = $parser->getApiDetail($apiId);
            $requestParams = $detail['property']['request'];
            $mustPassRequest = array_filter($requestParams, function ($item) {
                return $item['required'] === true;
            });
            if (count($requestParams) == 0
                && count($mustPassRequest) == 0) {
                $detail = $detail['sample'];
            } else {
                $pp = count(array_filter($mustPassRequest, function ($item) {
                    if (isset($_POST[$item['param']])) {
                        return true;
                    } else {
                        return false;
                    }
                }));

                if ($pp != count($mustPassRequest)) {
                    $detail = [
                        "status" => 99003,
                        "data" => '参数缺失',
                    ];
                } else {
                    $detail = $detail['sample'];
                }
            }
        }
    }
}
header('Content-Type: application/json');
echo json_encode($detail);
