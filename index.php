<?php
include_once 'config.php';
$parser = new ApiParser(API_ROOT_DIR);
$modules= $parser->getApiModule();
$errorCodeList = $parser->getErrCodeList();
$phpSelf = $_SERVER['PHP_SELF'];
$urlInfo = parse_url($phpSelf);
$baseUrl  = $_SERVER['HTTP_HOST'].dirname($urlInfo['path']);
if($_SERVER['SERVER_PORT']!=80){
    $baseUrl = 'https://'.$baseUrl.'/';
}else{
    $baseUrl = 'http://'.$baseUrl.'/';
}
$baseUrl = preg_replace('/\/{1,}$/','/', $baseUrl);
?>
<html>
<head>
<title>API文档说明</title>
<meta charset="utf-8">
<link href="https://cdn.bootcss.com/bootstrap/3.3.7/css/bootstrap.min.css" rel="stylesheet"/>
<link href="https://cdn.bootcss.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet"/>
<link href="asset/default.css?v=0.4" rel="stylesheet"/>
    <style>
        dl.sample{
            margin:2px 0px;
        }
        dl.sample dt{
            display:inline-block;
            width:100px;

        }
        dl.sample dd{
            display:inline-block;
        }
        dl.sample dd:after{
            clear:both;
            display:block;
            content:" ";
        }
    </style>
</head>
<body>
<div class="container">
    <div class="row">
        <h1 class="apidoc-subject">API说明<a id="anchor"></a></h1>
    </div>
    <div class="row">
        <div class="col-sm-3">

        <ul >
            <?php
            if(!empty($modules)){
                foreach($modules as $apiCatalog=>$detail){
                    echo '<li class="api-catalog"><h3 >'.$apiCatalog.'</h3><ul class="apilist">';
                    foreach($detail['apis'] as $apiId=>$apiName){
                        echo '<li data-method="'.$apiId.'"><a data-method="'.$apiId.'" href="#'.$apiId.'"><span>'.$apiId.'</span><p>'.$apiName.'</p></a></li>';
                    }
                    echo '</ul></li>';
                }
            }
            ?>
        </ul>
            <div class="errorcode-panel">
             <h2 class="apilist-error"><div>错误代码说明</div></h2>
             <ul class="errorcode">
                <?php
                if(!empty($errorCodeList)){
                    foreach($errorCodeList as $error){
                        echo '<li ><span>'.$error['code'].'</span>'.$error['message'].'</li>';
                    }
                }
                ?>
            </ul>
            </div>


        </div>
        <div class="col-sm-9 api-detail-panel">
            <h1 id="api_name_doctitle"></h1>
            <p id="api_description"></p>
            <h2>请求网关</h2>
            <div class="well">
            <p>请求格式：JSON格式请求</p>
            <p>响应格式：JSON格式</p>
            <p>请求方式：POST</p>
                <?php
                if(API_GATEWAY) {
                    ?>
                    <p>API网关地址：<?php echo API_GATEWAY?></p>
                    <?php
                }
                if(APIMOCK_URL){
                    ?>
                    <p>mock地址：<a target="_blank"  data-api-base="<?php echo $baseUrl?>read.php?mock=1&api=" class="api_mock"><?php echo $baseUrl?>read.php?mock=1&api=<span data-api-id="">/接口方法</span></a></p>
                        <?php
                    }
                ?>
            <p>公共参数 <a href="javascript:;" id="btn-public-params-collapse">显示</a></p>
            <table id="tb-public-params" class="table table-bordered table-striped collapse">
            <thead>
            <tr>
            <td>名称</td>
            <td>类型</td>
            <td>是否必须</td>
            <td>描述</td>
            </tr>
            </thead>
            <tbody >
                <tr>
                    <td>sign</td>
                    <td>String</td>
                    <td>true</td>
                    <td>加密签名字串，sign的生成规则：
                        <p>
                             将所有参数按字母a-z顺序排序，以Key+Value的形式串起来，头尾再加上appSecret值，例现在有这些参数：

                            <dl class="sample">
                                <dt>Key</dt>
                                <dd>Value</dd>
                        </dl><dl class="sample">
                                <dt>method</dt>
                                <dd>member.register</dd>
                        </dl><dl class="sample">
                                <dt>appkey</dt>
                                <dd>1001</dd>
                        </dl><dl class="sample">
                                <dt>access_token</dt>
                                <dd>12345</dd>
                        </dl><dl class="sample">
                                <dt>appsecret</dt>
                                <dd>xxxxx</dd>
                            </dl>
                            按Key升序，将Key+Value的顺序排序来串，头尾加上appsecret的值就是：
                            <br/>
                            xxxxxaccess_token12345appkey1001methodmember.registerxxxxx
                        <br/>
                            然后将上面这个字串进行md5加密，再转为大写，就是sign的值
                        </p>
                    </td>
                </tr>
                <tr>
                    <td>appkey</td>
                    <td>String</td>
                    <td>true</td>
                    <td>如1001</td>
                </tr><tr >
                    <td>method</td>
                    <td>String</td>
                    <td>true</td>
                    <td>接口名称，<strong><span data-api-id=""></span></strong></td>
                </tr>

                <tr>
                    <td>access_token</td>
                    <td>String</td>
                    <td id="api_auth"></td>
                    <td>用户token</td>
                </tr>
                <tr>
                    <td>locale</td>
                    <td>String</td>
                    <td>false</td>
                    <td>服务端响应的语种，目前支持zh_CN, en_US两种，不指定或指定错时全默认zh_CN</td>
                </tr>
                <tr>
                    <td>version</td>
                    <td>String</td>
                    <td>false/td>
                    <td>如：0.1.0。版本号，三段式，每段最大值254，即最大版本号254.254.254，最小0.0.1</td>
                </tr>
            </tbody>
            </table>
            </div>
            <div id="api_detail_section" class="hide">
                <h2>业务级请求参数</h2>
                <table class="table table-bordered table-striped">
                <thead>
                <tr>
                <td>参数</td>
                <td>类型</td>
                <td>是否必须</td>
                <td>默认值</td>
                <td>描述</td>
                </tr>
                </thead>
                <tbody  id="request_params">
                </tbody>
                </table>
                <h2>响应结果</h2>
                <table class="table  table-striped api-response-table">
                <thead>
                <tr>
                <td>名称</td>
                <td>类型</td>
                <td>示例值</td>
                <td>描述</td>
                </tr>
                </thead>
                <tbody  id="response_result">
                <tr>
                    <td>status</td>
                    <td>Integer</td>
                    <td>0</td>
                    <td>状态码</td>
                </tr>
                </tbody>
                </table>
                <h2>响应示例</h2>
                <pre rows="50" id="response_sample"></pre>
                <h2>异常示例(通用格式，非针对当前接口)</h2>
                <pre id="error_response_sample"></pre>
            </div>
        </div>
    </div>

</div>
<script type="text/javascript" src="https://cdn.bootcss.com/jquery/3.2.1/jquery.min.js"></script>
<script type="text/javascript" src="https://cdn.bootcss.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
<script type="text/javascript" src="https://cdn.bootcss.com/lodash.js/4.17.4/lodash.min.js"></script>
<script type="text/javascript" src="asset/parser.js?v=0.31"></script>

</body>
</html>
