$('#response_result').on('click','tr[data-index]',function(){
    var currentIndex = $(this).data('index')+'.';
    var childNodes   = $('#response_result').find('tr[data-index^="'+currentIndex+'"]');
    if(childNodes.length>0){
        if($(this).hasClass('type-open')){
            $(this).removeClass('type-open').addClass('type-close');
        }else{
            $(this).removeClass('type-close').addClass('type-open');
        }
        //$(this).toggleClass('type-open','type-close');
        //console.log('childNodes',childNodes.length,$(this).attr('class'));
        if($(this).hasClass('type-open'))
            childNodes.hide();
        else
            childNodes.show();
    }

});
//显示某API的详情
$('.apilist li a[data-method]').on('click',function(){
    var method = $(this).data('method');
    loadApiMethod(method);
});

var blockList = ["页码", "页面总数", "记录总数", "分页大小"];
const commRequest = [{
        "param": "sign",
        "required": true,
        "default": "",
        "type": "String",
        "description": "加密签名字串，sign的生成规则：\n"+
        "将所有参数按字母a-z顺序排序，以Key+Value的形式串起来，头尾再加上appSecret值，例现在有这些参数：\n"+
        "Key Value\n"+
        "method member.register\n"+
        "appkey 1001\n"+
        "access_token 12345\n"+
        "appsecret xxxxx\n"+
        "按Key升序，将Key+Value的顺序排序来串，头尾加上appsecret的值就是： \n"+
        "xxxxxaccess_token12345appkey1001methodmember.registerxxxxx \n"+
        "然后将上面这个字串进行md5加密，再转为大写，就是sign的值"
    }, {
        "param": "appkey",
        "required": true,
        "default": "如1001",
        "type": "String",
        "description": "应用ID"
    }, {
        "param": "method",
        "required": true,
        "default": "console.user.list",
        "type": "String",
        "description": "接口名称"
    }, {
        "param": "access_token",
        "required": true,
        "default": "",
        "type": "String",
        "description": "用户token"
    }, {
        "param": "locale",
        "required": false,
        "default": "",
        "type": "String",
        "description": "服务端响应的语种，目前支持zh_CN, en_US两种，不指定或指定错时全默认zh_CN"
    }, {
        "param": "version",
        "required": false,
        "default": "1.0.0",
        "type": "String",
        "description": "版本号，三段式，每段最大值254，即最大版本号254.254.254，最小0.0.1"
    }];
function arrToObj(arr) {
    var obj = {};
    for (var i = 0; i < arr.length; i++) {
        obj[arr[i].param] = arr[i];
    }
    return {
        description: "输入参数",
        type: "Object",
        responseItem: obj
    };
}

function strFirstUpperCase(str){ return str.charAt(0).toUpperCase()+str.slice(1); }
function strFirstLowerCase(str){ return str.charAt(0).toLowerCase()+str.slice(1); }
/**
 * 解析 JSON 的数据结构 生成 代码
 * @param {JQuery} elList 
 * @param {string} strCode 代码说明
 * @param {*} data 结构数据
 * @param {string} topClassName 主类名称
 * @param {string} superClass 父类名称
 */
function parseLanguageCode(elList, strCode, data, topClassName, superClass){
    elList.each((index, el) => {
        let div = $(el);
        let language = div.data('lang');
        if(!language)return;
        div.html(`<pre class="line-numbers"><code class="language-${language}">` 
            + strCode 
            + ((data == null)
                ? '' 
                : getLanguageCode(language, data, topClassName, superClass) )
            + '</code></pre>'
        );
    });
}
function loadApiMethod(method){
    changeCollapse($('#tb-public-params'), $('#btn-public-params-collapse'), false);
    $('#api_detail_section').removeClass('hide');
    $('#anchor').attr('name',method);
    $('.apilist li.cur').removeClass('cur');
    $('.apilist li[data-method="'+method+'"]').addClass('cur');
    $('#api_name_doctitle').html(method);
    $.ajax({
        url:'read.php?rev='+Math.random(),
        data:{'api':method},
        dataType:'json',
        success:function(resp){
            var baseUrl = $('a.api_mock').attr('data-api-base');
            $('a.api_mock').attr('href',baseUrl+method);

            var apiProps = resp['property'];
            $('span[data-api-id]').html(method);
            if(!_.isUndefined(apiProps['accessLevel'])){
                var apiAuth = apiProps['accessLevel']==1?'true':'false';
                $('#api_auth').text(apiAuth);
            }else{
                $('#api_auth').text('');
            }
            $('#api_description').html(apiProps['description']);
            //加载请求参数说明
            _loadRequestParams(method,apiProps);
            //加载响应参数说明
            _loadResponseResult(method,resp);
            loadResponseSample(method,resp['sample']);
            
            parseLanguageCode($('.comm-request-struct .json-renderer'), '', arrToObj(commRequest), 'ApiResult', null);

            if(resp['property']['request'] && resp['property']['request'].length > 0){
                var requestObjName = `${apiProps.method.split('.').slice(1).map(str=>strFirstUpperCase(str)).join('')}Request`;// extends ApiResult
                parseLanguageCode($('.request-struct .json-renderer'), '// TODO: 注意：“公共参数”另外处理\r\n', arrToObj(apiProps.request), requestObjName, 'ApiResult');
            }else{
                parseLanguageCode($('.request-struct .json-renderer'), '// TODO: 注意：“公共参数”另外处理\r\n// 无请求参数', null, null);
            }
            if(resp['property']['response'] && resp['property']['response']['data']){
                var responseResult = {
                    responseItem:{
                        data:resp['property']['response'].data,
                        status:{
                            description: "状态码",
                            sample:0,
                            type: "Integer"
                        }
                    },
                    type: "Object"
                };
                parseLanguageCode($('.response-struct .json-renderer'), '', responseResult, 'Result');
            }else{
                parseLanguageCode($('.response-struct .json-renderer'), '// 无响应结果</code></pre>', null, null);
            }
            Prism.highlightAll();
        },error:function(e,t,p){
            alert('API说明加载失败');
        }
    });
}
//加载请求参数说明
function _loadRequestParams(method,resp){
    $('#request_params').empty();
    if(typeof resp['request']!='undefined'){
        var params = resp['request'];
        for(var p in params){
            var html = [];
            html.push('<tr><td>'+params[p]['param']+'</td>');
            html.push('<td>'+params[p]['type']+'</td>');
            html.push('<td>'+params[p]['required']+'</td>');
            html.push('<td>'+params[p]['default']+'</td>');
            html.push('<td>'+params[p]['description']+'</td>');
            html.push('</tr>');
            $('#request_params').append(html.join(''));
        }
    }
}
//响应参数说明显示
function _loadResponseResult(method,resp){
    $('#response_result').children('tr:first-child').siblings('tr').remove();
    var response = resp['property']['response'];
    _loadReslutObject(response,0,'');
}
//显示响应参数的每一行
function _createResponseRow(dataIndex,deep,itemKey,item,hasChild){
    var html = [];
    var cls ='padding-deep-'+deep;
    if(deep!=0){
        cls+= ' child-row';
    }
    if(hasChild){
        cls+=' type-close';
    }
    html.push('<tr data-index="'+dataIndex+'" class="'+cls+'" data-parent=""><td>'+itemKey+'</td>');
    html.push('<td>'+item['type']+'</td>');
    html.push('<td>'+(item['sample']?item['sample']:'')+'</td>');
    html.push('<td>'+(item['description']?item['description']:'')+'</td>');
    html.push('</tr>');
    return html.join('');
}
//解析每一个响应参数
function _loadReslutObject(result,deep,parentIndex){
    var j=1;
    for(var key in result){
        var dataIndex = parentIndex!=''?parentIndex+'.':'';
        dataIndex+=j;
        var html = [];
        if(result[key]['responseItem']){
            var html = _createResponseRow(dataIndex,deep,key,result[key],true);
            $('#response_result').append(html);

            for(var subKey in result[key]['responseItem']){
                var tmp = {[subKey]:result[key]['responseItem'][subKey]};

                _loadReslutObject(tmp,deep+1,dataIndex)
            }
        }else{
            var html = _createResponseRow(dataIndex,deep,key,result[key],false);
            $('#response_result').append(html);
        }
        j++;
    }
    return ;
}

//响应示例
function loadResponseSample(method,resp){
    $('#response_sample').html(JSON.stringify(resp, null, 4));
}
//加载异常响应示例
$.ajax({
    url:'read.php?rev='+Math.random(),
    dataType:'json',
    success:function(resp){
        $('#error_response_sample').html(JSON.stringify(resp, null, 4));
    },error:function(e,t,p){
        alert('异常响应示例加载失败');
    }
});
/**
 * 
 * @param {string} language 语言
 * @param {Object} data 数据
 * @param {string} className 主类名称
 * @param {string} superClass 父类名称 
 */
function getLanguageCode(language, data, className, superClass = null){
    const languageTpl = {
        'java':{
            'class':`/* 开始 {className} */\r\npublic class {className} implements Serializable{\r\n\r\n{decl}\r\n{init}}\r\n/* 结束 {className} */\r\n`,
            'classType':{
                "decl": (dataTypeName, dataValueName, data) => { 
                    return `/* See to ${dataTypeName} */\r\n\tprivate ${dataTypeName} ${dataValueName};`; },
                "init": (dataTypeName, dataValueName, publicValueName, data) => { 
                    return `/* ${dataTypeName} */\r\n\tpublic void set${publicValueName}(${dataTypeName} value){this.${dataValueName} = value;}\r\n` +
                            `\tpublic ${dataTypeName} get${publicValueName}(){return this.${dataValueName};}\r\n`; },
            },
            'arrayType':{
                "decl": (dataTypeName, dataValueName, data) => { 
                    return `/* See to ${dataTypeName} */\r\n\tprivate List&lt;${dataTypeName}&gt; ${dataValueName};`; },
                "init": (dataTypeName, dataValueName, publicValueName, data) => { 
                    return `/* ${dataTypeName} */\r\n\tpublic void set${publicValueName}(List&lt;${dataTypeName}&gt; value){this.${dataValueName} = value;}\r\n` +
                            `\tpublic List&lt;${dataTypeName}&gt; get${publicValueName}(){return this.${dataValueName};}\r\n`; },
            },
            'types':[{
                    'test': (typeName) => { return /(Int|Int32|Integer|Long)/g.test(typeName); },
                    'decl': (privateValueName, data) => { 
                        return `/** \r\n\t * ${data.description} \r\n\t * 默认值：${data.default||data.sample||'无'}\r\n\t */\r\n\tprivate int ${privateValueName};`; 
                    },
                    'init': (propName, privateValueName, data) => { 
                        return `/** \r\n\t * ${data.description} \r\n\t * 默认值：${data.default||data.sample||'无'}\r\n\t */\r\n\tpublic void set${propName}(int value){this.${privateValueName} = value;}\r\n` 
                            + `\tpublic int get${propName}(){return this.${privateValueName};}\r\n`; 
                    }
                },{
                    'test': (typeName) => { return /(Decimal|Float)/g.test(typeName); },
                    'decl': (privateValueName, data) => { 
                        return `/** \r\n\t * ${data.description} \r\n\t * 默认值：${data.default||data.sample||'无'}\r\n\t */\r\n\tprivate double ${privateValueName};`; },
                    'init': (propName, privateValueName, data) => { 
                        return `/** \r\n\t * ${data.description} \r\n\t * 默认值：${data.default||data.sample||'无'}\r\n\t */\r\n\tpublic void set${propName}(double value){this.${privateValueName} = value;}\r\n` +
                    `\tpublic double get${propName}(){return this.${privateValueName};}\r\n`; }
                },{
                    'test': (typeName) => { return /(String)/g.test(typeName); },
                    'decl': (privateValueName, data) => { 
                        return `/** \r\n\t * ${data.description} \r\n\t * 默认值：${data.default||data.sample||'无'}\r\n\t */\r\n\tprivate String ${privateValueName};`; },
                    'init': (propName, privateValueName, data) => { 
                        return `/** \r\n\t * ${data.description} \r\n\t * 默认值：${data.default||data.sample||'无'}\r\n\t */\r\n\tpublic void set${propName}(String value){this.${privateValueName} = value;}\r\n` +
                    `\tpublic String get${propName}(){return this.${privateValueName};}\r\n`; }
                },{
                    'test': (typeName) => { return /(Boolean)/g.test(typeName); },
                    'decl': (privateValueName, data) => { return `/** \r\n\t * ${data.description} \r\n\t * 默认值：${data.default||data.sample||'无'}\r\n\t */\r\n\tprivate boolean ${privateValueName};`; },
                    'init': (propName, privateValueName, data) => { 
                        return `/** \r\n\t * ${data.description} \r\n\t * 默认值：${data.default||data.sample||'无'}\r\n\t */\r\n\tpublic void set${propName}(boolean value){this.${privateValueName} = value;}\r\n` +
                    `\tpublic boolean get${propName}(){return this.${privateValueName};}\r\n`; }
                },{
                    'test': (typeName) => { return /(GUID)/g.test(typeName); },
                    'decl': (privateValueName, data) => { 
                        return `/* GUID ${data.description} */\r\n\tprivate String ${privateValueName};`; },
                    'init': (propName, privateValueName, data) => { 
                        return `/* GUID ${data.description} */\r\n\tpublic void set${propName}(String value){this.${privateValueName} = value;}\r\n` +
                    `\tpublic String get${propName}(){return this.${privateValueName};}\r\n`; }
                },{
                    'test': (typeName) => { return /(DateTime)/g.test(typeName); },
                    'decl': (privateValueName, data) => { 
                        return `/* DateTime ${data.description} */\r\n\tprivate String ${privateValueName};`; },
                    'init': (propName, privateValueName, data) => { 
                        return `/* DateTime ${data.description} */\r\n\tpublic void set${propName}(String value){this.${privateValueName} = value;}\r\n` +
                    `\tpublic String get${propName}(){return this.${privateValueName};}\r\n`; }
                },{
                    'test': (typeName) => { return /(List<string>)/g.test(typeName); },
                    'decl': (privateValueName, data) => { 
                        return `/* String Array ${data.description} */\r\n\tprivate List&lt;String&gt; ${privateValueName};`; },
                    'init': (propName, privateValueName, data) => { 
                        return `/* String Array ${data.description} */\r\n\tpublic void set${propName}(List&lt;String&gt; value){this.${privateValueName} = value;}\r\n` +
                    `\tpublic List&lt;String&gt; get${propName}(){return this.${privateValueName};}\r\n`; }
                },{
                    'test': (typeName) => { return /(List<Int>)/g.test(typeName); },
                    'decl': (privateValueName, data) => { 
                        return `/* Int Array ${data.description} */\r\n\tprivate List&lt;int&gt; ${privateValueName};`; },
                    'init': (propName, privateValueName, data) => { 
                        return `/* Int Array ${data.description} */\r\n\tpublic void set${propName}(List&lt;int&gt; value){this.${privateValueName} = value;}\r\n` +
                    `\tpublic List&lt;int&gt; get${propName}(){return this.${privateValueName};}\r\n`; }
                }
            ],
            'getClassName':(s, superClass = null)=> { return superClass ? `${s} extends ${superClass}` : s; },
            'getDataTypeName':(propName, parent) => { return `${parent}${strFirstUpperCase(propName)}`; },
            'getDataValueName':(propName, parent)=> { return `_${strFirstLowerCase(propName)}`; },
            'getPublicValueName':(propName, parent)=> { return `${strFirstUpperCase(propName)}`; },
        },
        'objectivec':{
            'class':`/* 开始 {className} */\r\n@interface {className} : NSObject{\r\n}\r\n{decl}\r\n@end\r\n\r\n@implementation {className}\r\n-(id)init{\r\n\tself = [super init];\r\n{init}\r\n\treturn self;\r\n}\r\n@end\r\n/* 结束 {className} */\r\n`,
            'classType':{
                "decl": (dataTypeName, dataValueName, data) => { 
                    return `/* See to ${dataTypeName} */\r\n\t@property (nonatomic, strong) ${dataTypeName}* ${dataValueName};`; },
                "init": (dataTypeName, dataValueName, publicValueName, data) => { 
                    return `/* See to ${dataTypeName} */\r\n\tself.${dataValueName} = [[${dataTypeName} alloc] init];`; },
            },
            'arrayType':{
                "decl": (dataTypeName, dataValueName, data) => { 
                    return `/* See to ${dataTypeName} */\r\n\t@property (nonatomic, strong) NSMutableArray* ${dataValueName};`; },
                "init": (dataTypeName, dataValueName, publicValueName, data) => { 
                    return `/* See to ${dataTypeName} */\r\n\tself.${dataValueName} = [[NSMutableArray alloc] init];`; },
            },
            'types':[{
                'test': (typeName) => { return /(Int|Int32|Integer|Long|Decimal|Boolean)/g.test(typeName); },
                "decl": (privateValueName, data) => { 
                    return `/** \r\n\t * ${data.description} \r\n\t * 默认值：${data.default||data.sample||'无'}\r\n\t */\r\n\t@property (nonatomic,strong ) NSMutableNumber* for${privateValueName};`; },
                "init": (propName, privateValueName, data) => { 
                    return `/** \r\n\t * ${data.description} \r\n\t * 默认值：${data.default||data.sample||'无'}\r\n\t */\r\n\tself.for${privateValueName} = [[NSMutableString alloc] init];`; },
            },{
                'test': (typeName) => { return /(String)/g.test(typeName); },
                'decl': (privateValueName, data) => { 
                    return `/** \r\n\t * ${data.description} \r\n\t * 默认值：${data.default||data.sample||'无'}\r\n\t */\r\n\t@property (nonatomic,strong ) NSMutableString* for${privateValueName};`; },
                'init': (propName, privateValueName, data) => { 
                    return `/** \r\n\t * ${data.description} \r\n\t * 默认值：${data.default||data.sample||'无'}\r\n\t */\r\n\tself.for${name} = [[NSMutableString alloc] init];`; }
            },{
                'test': (typeName) => { return /(GUID)/g.test(typeName); },
                'decl': (privateValueName, data) => { 
                    return `/* GUID ${data.description} */\r\n\t@property (nonatomic,strong ) NSMutableString* for${privateValueName};`; },
                'init': (propName, privateValueName, data) => { 
                    return `/* GUID ${data.description} */\r\n\tself.for${privateValueName} = [[NSMutableString alloc] init];`; }
            },{
                'test': (typeName) => { return /(DateTime)/g.test(typeName); },
                'decl': (privateValueName, data) => { 
                    return `/** \r\n\t * ${data.description} \r\n\t * 默认值：${data.default||data.sample||'无'}\r\n\t */\r\n\t@property (nonatomic,strong ) NSMutableString* for${privateValueName};`; },
                'init': (propName, privateValueName, data) => { 
                    return `/** \r\n\t * ${data.description} \r\n\t * 默认值：${data.default||data.sample||'无'}\r\n\t */\r\n\tself.for${privateValueName} = [[NSMutableString alloc] init];`; }
            },{
                'test': (typeName) => { return /(List<string>)/g.test(typeName); },
                'decl': (privateValueName, data) => { 
                    return `/* 字符串数组（String） ${data.description} */\r\n\t@property (nonatomic,strong ) NSMutableArray* for${privateValueName};`; },
                'init': (propName, privateValueName, data) => { 
                    return `/* 字符串数组（String） ${data.description} */\r\n\tself.for${privateValueName} = [[NSMutableArray alloc] init];`; }
            },{
                'test': (typeName) => { return /(List<Int>)/g.test(typeName); },
                'decl': (privateValueName, data) => { 
                    return `/* 整形数组（Int） ${data.description} */\r\n\t@property (nonatomic,strong ) NSMutableArray* for${privateValueName};`; },
                'init': (propName, privateValueName, data) => { 
                    return `/* 整形数组（Int） ${data.description} */\r\n\tself.for${privateValueName} = [[NSMutableArray alloc] init];`; }
            }],
            'getClassName':(s)=> { return `${s}Object`.replace(/(Object){1,}/g, 'Object'); },
            'getDataTypeName':(propName, parent) => { return `${propName}Object`.replace(/(Object){1,}/g, 'Object'); },
            'getDataValueName':(propName, parent)=> { return `for${propName}`; },
            'getPublicValueName':(propName, parent)=> { return propName; },
        },
        'TypeScript':{
            'class': `/* 开始 {className} */\r\ninterface {className} {\r\n{init}\r\n}\r\n/* 结束 {className} */\r\n`,
            'classType': {
                "decl": (dataTypeName, dataValueName, data) => { return ``; },
                "init": (dataTypeName, dataValueName, publicValueName, data) => { 
                    return `/**${data.description?`\r\n\t * ${data.description}`:''}\r\n\t * 默认值：${data.default||data.sample||'无'}\r\n\t */\r\n\t${dataValueName}:${dataTypeName}`; 
                },
            },
            'arrayType': {
                "decl": (dataTypeName, dataValueName, data) => { return dataValueName; },
                "init": (dataTypeName, dataValueName, publicValueName, data) => { 
                    return `/**${data.description?`\r\n\t * ${data.description}`:''}\r\n\t * 默认值：${data.default||data.sample||'无'}\r\n\t */\r\n\t${dataValueName}:${dataTypeName}[]`; 
                },
            },
            'types': [{
                'test': (typeName) => { return /(Int|Int32|Integer|Long|Decimal)/g.test(typeName); },
                "decl": (privateValueName, data) => { 
                    return ``; 
                },
                "init": (propName, privateValueName, data) => { 
                    return `/** \r\n\t * ${data.description} \r\n\t * 默认值：${data.default||data.sample||'无'}\r\n\t */\r\n\t${propName}:number;\r\n`; 
                }
            },{
                'test': (typeName) => { return /(String)/g.test(typeName); },
                'decl': (privateValueName, data) => { 
                    return ''; 
                },
                'init': (propName, privateValueName, data) => { 
                    return `/** \r\n\t * ${data.description} \r\n\t * 默认值：${data.default||data.sample||'无'}\r\n\t */\r\n\t${propName}:string;\r\n`; 
                }
            },{
                'test': (typeName) => { return /(Boolean)/g.test(typeName); },
                'decl': (privateValueName, data) => { 
                    return ''; 
                },
                'init': (propName, privateValueName, data) => { 
                    return `/** \r\n\t * ${data.description} \r\n\t * 默认值：${data.default||data.sample||'无'}\r\n\t */\r\n\t${propName}:boolean;\r\n`; 
                }
            }],
            'getClassName':(s, superClass = null)=> { return superClass ? `${s} extends ${superClass}` : s; },
            'getDataTypeName':(propName, parent) => { return `${parent}${strFirstUpperCase(propName)}`; },
            'getDataValueName':(propName, parent)=> { return `${propName}`; },
            'getPublicValueName':(propName, parent)=> { return propName; },
        }
    }
    
    const LangTpl = languageTpl[language];
    if(!LangTpl){
        return `暂时不支持：${language}`;
    }
    const hasChild = (data) => {
        return typeof (data) != "string" && data.hasOwnProperty('responseItem');
    }
    const isArray = (key, data) => {
        return key.indexOf('IList') > 0 || data.type == 'Array';
    }
    const createClass = (className, data, parentName, superClass = null) => {
        let begin = '';
        let code1 = '';
        let code2 = '';

        for (let propName in data.responseItem) {
            if (blockList.indexOf(propName) >= 0) continue;
            let item = data.responseItem[propName];

            let line = getType(item, propName, className);
            if (typeof (line) == "string") {
                begin += line;
                begin += "\r\n\r\n";
            } else {
                code1 += '\t' + line.decl;
                code1 += "\r\n";
                code2 += '\t' + line.init;
                code2 += "\r\n";
                if (line.classType) {
                    begin += line.classType;
                    begin += "\r\n\r\n";
                }
            }
        }
        return begin + '' + languageTpl[language]['class']
            .replace(/\{className\}/g, LangTpl.getClassName(className, superClass))
            .replace(/\{decl\}/g, code1)
            .replace(/\{init\}/g, code2);
    }
    const getType = (data, proName, parentName) => {
        let dataTypeName = LangTpl.getDataTypeName(proName, parentName);
        let dataValueName = LangTpl.getDataValueName(proName, parentName);
        let publicValueName = LangTpl.getPublicValueName(proName, parentName);

        if (isArray(proName, data)) {
            let arrayTypeTpl = LangTpl['arrayType'];
            return {
                "decl": arrayTypeTpl.decl(dataTypeName, dataValueName, data),
                "init": arrayTypeTpl.init(dataTypeName, dataValueName, publicValueName, data),
                "classType": createClass(dataTypeName, data, parentName)
            };
        } else if (hasChild(data)) {
            let classTypeTpl = LangTpl['classType'];
            return {
                "decl": classTypeTpl.decl(dataTypeName, dataValueName, data),
                "init": classTypeTpl.init(dataTypeName, dataValueName, publicValueName, data),
                "classType": createClass(dataTypeName, data)
            };
        } else {
            let code = null;
            let typeTpl = LangTpl['types'].filter(item=> item.test(data.type)).pop();
            if(typeTpl){
                code = {
                    "decl": typeTpl.decl(dataValueName, data),
                    "init": typeTpl.init(publicValueName, dataValueName, data),
                };
            }else{
                code = {
                    "decl": "未知情况：" + proName,
                    "init": "未知情况：" + proName
                };
            }
            return code;
        }
        return "";
    }
    return createClass(className, data, '', superClass);
}

function changeCollapse(el, btn, isClose){
    if(isClose){
        $(el).addClass('in');
        btn.text('隐藏');
    }else{
        $(el).removeClass('in');
        btn.text('显示');
    }
}
$('#btn-public-params-collapse').click(function(){
    var btn = $('#btn-public-params-collapse');
    if(btn.text() == '显示'){
        changeCollapse($('#tb-public-params'), btn, true);
    }else{
        changeCollapse($('#tb-public-params'), btn, false);
    }
});

if(location.hash){
    var hash = location.hash.substring(1);
    loadApiMethod(hash);
}else{
    parseLanguageCode($('.comm-request-struct .json-renderer'), '', arrToObj(commRequest), 'ApiResult', null);
    Prism.highlightAll();
    changeCollapse($('#tb-public-params'), $('#btn-public-params-collapse'), true);
}