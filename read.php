<?php
/**
 * 取得mock数据示例：
 * http://localhost/apidocs/read.php?api=console.user.list&mock=1
 */
include_once 'config.php';
$parser = new ApiParser(API_ROOT_DIR);
$apiId  = isset($_GET['api'])?$_GET['api']:'';
$hasMock   = isset($_GET['mock'])?$_GET['mock']:'';
if($apiId){
    $detail = $parser->getApiDetail($apiId);
    if($hasMock){
        $detail = [
            "status" => 99999,
            "data" => '请使用mock.php！'
        ];
    }
}else{
    $detail['status'] = 99999;
    $detail['data'] = '出错信息';
}
echo json_encode($detail);
?>
