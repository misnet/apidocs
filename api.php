<?php

include_once 'config.php';
header('Access-Control-Allow-Origin:*');
header('Access-Control-Allow-Methods:POST, GET, OPTIONS, DELETE, PUT');
header("Access-Control-Allow-Headers:Content-Type");
header('Access-Control-Allow-Credentials:true');
$parser = new ApiParser(API_ROOT_DIR);
$method  = isset($_GET['method'])?$_GET['method']:'';
switch($method){
    case 'clearcache':
        $detail['status'] = 0;
        $detail['data'] = $parser->clearCache();
        break;
    case 'global':
        $detail['status'] = 0;
        $detail['data'] = $parser->getGlobalParameter();
        break;
    case 'detail':
        $id = $_REQUEST['id'];
        $detail['status'] = 0;
        $detail['data'] = $parser->getApiDetail($id);
        break;
    case 'list':
        $detail['status'] = 0;
        $apiModules  = $parser->getApiModule();
        if(sizeof($apiModules)==0){
            $detail['status'] = -1;
            $detail['data'] = '未找到API模块';
        }else{
            $moduleIndex = $_REQUEST['mid'];
            $parentId = 0;
            $childId  = -1;
            if(preg_match('/^(\d+)$/is',$moduleIndex)){
                $parentId= $moduleIndex;
            }elseif(preg_match('/^(\d+).(\d+)$/is',$moduleIndex,$match)){
                $parentId = $match[1];
                $childId  = $match[2];
            }
            if($parentId<sizeof($apiModules)){
                $module = $apiModules[$parentId];
            }
            if($childId>=0
                && $module
                && isset($module['children'])
                && sizeof($module['children'])>0
                && sizeof($module['children'])>$childId){
                $module = $module['children'][$childId];
            }
            if(!$module){
                $detail['status'] = -1;
                $detail['data'] = 'API模块不存在';
            }else{
                $detail['status'] = 0;
                $detail['data'] = $module;
            }
        }
        break;
    case 'errcode':
        $detail['status'] = 0;
        $detail['data'] = $parser->getErrCodeList();
        break;
    default:
        $detail['status'] = 0;
        $detail['data'] = $parser->getApiModule();
}
echo json_encode($detail);
?>
