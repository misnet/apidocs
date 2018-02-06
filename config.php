<?php
/**
 * 配置文件及API接口文件解析器
 * @author Donny
 *
 */

$dir = realpath('api-jsons');

define('DS', DIRECTORY_SEPARATOR);
define('API_GATEWAY','http://api.kuga.wang/v3/gateway');
define('APIMOCK_URL','http://api.kuga.wang/apidocs');
define('API_ROOT_DIR', $dir);


/**
 * API文件解析器
 * Class ApiParser
 */
class ApiParser
{
    private $rootDir;
    private $samplePath;
    private $apiList = [];
    private $apiModule = [];
    private $globalParameter=[];
    public function __construct($rootDir)
    {
        $this->rootDir = $rootDir;
        $this->init();
    }
    /**
     * 解析某个目录
     * @param $moduleName
     * @param $dirName
     */
    private function _parseJsonDir(&$module,$dirName){
        foreach (glob($dirName.DS.'*') as $filename) {
            if(is_dir($filename)){
                $this->_parseJsonDir($module,$filename);
            }else{
                $this->_parseJsonFile($module,$filename);
            }
        }
    }

    /**
     * 解析单个json文件
     * @param $moduleName
     * @param $filename
     */
    private function _parseJsonFile(&$module,$filename){
        $tmp = file_get_contents($filename);
        $jsonContent = json_decode($tmp, true);
        if (!array_key_exists($jsonContent['id'], $this->apiList)) {
            $this->apiList[$jsonContent['id']] = $jsonContent;
            $module['apis'][$jsonContent['id']] = [
                'name'=>$jsonContent['name'],
                'id'=>$jsonContent['id']
            ];
        }

    }

    /**
     * 取得花
     * @return array|mixed
     */
    public function getGlobalParameter(){
        $configFile = $this->rootDir.DS.'global.json';
        $configContent = file_get_contents($configFile);
        $configArray = json_decode($configContent, true);
        return $configArray?$configArray:[];
    }
    private function _parseApiModule(&$module){
        if(isset($module['children'])){
            $j = 0;
            foreach($module['children'] as &$childModule){
                $this->_parseApiModule($childModule);
                $j++;
            }
        }else{
            if (isset($module['apiFiles'])) {

                foreach (glob($this->rootDir . DS . $module['apiFiles']) as $filename) {
                    if(is_dir($filename)){
                        $this->_parseJsonDir($module,$filename);
                    }else{
                        $this->_parseJsonFile($module,$filename);
                    }
                }
            }
        }
    }
    private function init(){
        if (empty($this->apiList)) {
            $configFile = $this->rootDir.'/api.json';
            if (file_exists($configFile)) {
                $configContent = file_get_contents($configFile);
                $configArray = json_decode($configContent, true);
                $index = 0;
                foreach ($configArray as $configCategory) {
                    $this->apiModule[$index] = $configCategory;
                    $this->apiModule[$index]['id'] = $index;
                    $this->_parseApiModule($this->apiModule[$index]);
                    $index++;
                }
            }
        }
    }

    /**
     * 取得API模块列表
     * @return array
     */
    public function getApiModule(){
        return $this->apiModule;
    }

    /**
     * 取得错误代码列表
     * @return mixed
     */
    public function getErrCodeList(){
        $codeContent = file_get_contents($this->rootDir.DS.'errcode.json');
        return json_decode($codeContent,true);
    }
    /**
     * 解析api json文件的内容，生成property和sample两部分
     *  property是api json文件的内容
     *  sample是生成的mock数据
     * @param $apiId
     * @return array [property,sample]
     */
    public function getApiDetail($apiId){
        $d = [];
        if(isset($this->apiList[$apiId])){
            $d = $this->apiList[$apiId];
        }
        $sample = $this->parseResponseMock($apiId,$d);
        return ['property'=>$d,'sample'=>$sample];
    }

    /**
     * 解析出Mock内容
     * @param $apiId
     * @param array $apiData
     */
    private function parseResponseMock($apiId,$apiData){
        $sampleData = [];
        if(isset($apiData['response']['data'])){
            $data = $apiData['response']['data'];

            //sample目录下有例子文件，且hasSampleFile为true
            if(isset($data['hasSampleFile']) && $data['hasSampleFile']){
                $key = $apiId;
                $key = ltrim($key,'/');
                $sampleFile = API_ROOT_DIR.DS.'sample/'.$key.'.json';

                if(file_exists($sampleFile)){
                    $sampleContent = file_get_contents($sampleFile);
                    $sampleData    = json_decode($sampleContent,true);
                }
            }else{
                //生成sample

                $response = $this->getSample($apiData['response']);
                $response['code'] = 0;
                $sampleData = $response;
            }
        }
        return $sampleData;
    }

    /**
     * 解析api json文件的response部分，生成sample
     * @return array [data,code]
     */
    private function getSample($response){
        $data = [];
        foreach ($response as $key=>$node ){
            if(isset($node['responseItem'])){
                if(strtolower($node['type'])=='array'){
                    $data[$key] = [$this->getSample($node['responseItem'])];
                }else{
                    $data[$key] = $this->getSample($node['responseItem']);
                }
            }else{
                $data[$key] = $this->parseSampleNode($node);
            }
        }
        return $data;
    }

    /**
     * 解析sample属性
     * @param $node
     * @return string
     */
    private function parseSampleNode($node){
        if($node['sample']!==null){
            return $node['sample'];
        }else{
            return '';
        }
    }


}
