<?php
/**
 * 配置文件及API接口文件解析器
 * @author Donny
 * 
 */

$dir = realpath('api-jsons');

define('DS', DIRECTORY_SEPARATOR);
define('API_GATEWAY','http://api.kuga.wang/v3/gateway');
define('API_TESTURL','http://api.kuga.wang/apitest.html');
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
    public function __construct($rootDir)
    {
        $this->rootDir = $rootDir;
        $this->init();
    }
    private function init(){
        if (empty($this->apiList)) {
            $configFile = $this->rootDir.'/api.json';
            if (file_exists($configFile)) {
                $configContent = file_get_contents($configFile);
                $configArray = json_decode($configContent, true);
                foreach ($configArray as $configCategory) {
                    $this->apiModule[$configCategory['name']] = $configCategory;
                    if (isset($configCategory['apiFiles'])) {
                        foreach (glob($this->rootDir . DS . $configCategory['apiFiles']) as $filename) {
                            $tmp = file_get_contents($filename);
                            $filename    = basename($filename);
                            $jsonContent = json_decode($tmp, true);
                            if (!array_key_exists($jsonContent['id'], $this->apiList)) {
                                $this->apiList[$jsonContent['id']] = $jsonContent;
                                $this->apiModule[$configCategory['name']]['apis'][$jsonContent['id']] = $jsonContent['name'];
                            }
                        }
                    }
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
                $sampleFile = API_ROOT_DIR.DS.'sample/'.$apiId.'.json';
                if(file_exists($sampleFile)){
                    $sampleContent = file_get_contents($sampleFile);
                    $sampleData    = json_decode($sampleContent,true);
                }
            }else{
                //生成sample

                $response = $this->getSample($apiData['response']);
                $response['status'] = 0;
                $sampleData = $response;
            }
        }
        return $sampleData;
    }

    /**
     * 解析api json文件的response部分，生成sample
     * @return array [data,status]
     */
    private function getSample($response){
        $data = [];
        foreach ($response as $key=>$node ){
            if($node['item']){

                if(strtolower($node['type'])=='array'){
                    $data[$key] = [$this->getSample($node['item'])];
                }else{
                    $data[$key] = $this->getSample($node['item']);
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
        if($node['sample']){
            return $node['sample'];
        }else{
            return '';
        }
    }


}