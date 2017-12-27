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
        },error:function(e,t,p){
            alert('API说明加载失败');
        }
    });
}

function _parseRequestParamJsonString(param){
    var html = [];
    html.push('<table class="table table-bordered table-striped"><thead>');
    html.push('<tr><td colspan="5">JSON对象类型：'+param['requestItemType']+'</td></tr>');
    html.push('<tr><td>参数</td><td>类型</td><td>是否必填</td><td>默认值</td><td>描述</td></tr></thead><tbody>');
    for(var j in param['requestItem']){
        var p = param['requestItem'][j];
        html.push('<tr><td >'+p['param']+'</td>');
        html.push('<td>'+p['type']+'</td>');
        html.push('<td>'+p['required']+'</td>');
        html.push('<td>'+p['default']+'</td>');
        html.push('<td>'+p['description']+'</td></tr>');
    }
    html.push('</tbody></table>');
    return html.join('');
}
//加载请求参数说明
function _loadRequestParams(method,resp){
    $('#request_params').empty();
    if(typeof resp['request']!='undefined'){
        var params = resp['request'];
        for(var p in params){
            var html = [];
            var isJsonParams = false;
            if( params[p]['type'].toLowerCase()=='jsonstring'
                && params[p]['requestItem']
                && params[p]['requestItemType']){
                isJsonParams = true;
            }
            html.push('<tr><td '+(isJsonParams?' rowspan="2"':'')+'>'+params[p]['param']+'</td>');
            html.push('<td>'+params[p]['type']+'</td>');
            html.push('<td>'+params[p]['required']+'</td>');
            html.push('<td>'+params[p]['default']+'</td>');
            html.push('<td>'+params[p]['description']+'</td>');
            html.push('</tr>');
            if(params[p]['type'].toLowerCase()=='jsonstring'){
                html.push('<tr><td colspan="4">'+_parseRequestParamJsonString(params[p])+'</td></tr>');
            }
            $('#request_params').append(html.join(''));
        }
        if(params.length==0){
            var html = [];
            html.push('<tr><td colspan="5">无</td>');
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
    changeCollapse($('#tb-public-params'), $('#btn-public-params-collapse'), true);
}