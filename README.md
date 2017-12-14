# kuga/apidocs

## 背景
目前有一些APIDoc生成工具(Apidoc、Swagger），原理是将Api的接口请求与响应格式写在PHP源程序的注释中，然后借助工具读取这些注释生成json文件，然后再解析json文件生成可视化的APIDoc，同时提供相应的API测试工具。这种方式好处是直观，在API编码时，顺便将接口要求写了，坏处是源程序将会被大量的这种注释占据，个人是比较不习惯的，所以有了kuga/apidocs项目。

## 功能
- 读取定义好的api json文件，生成apidoc
- 根据api json文件定义的sample数据，提供mock数据服务
- 提供api测试功能【TODO】
- 服务端对接口参数验证（不在本项目中）。服务端可以利用json中的request、method的部分，对前端传递的参数做验证，可以扩展一些验证规则，包括是否必填、合法性等，然后再将有效的参数传给接口，这样可以将对参数的验证可以统一独立出来，不需要每个API接口单独处理。

## 项目运行方式
查看apidoc的方式 http://localhost/apidocs/index.php

mock服务 http://localhost/apidocs/read.php?mock=1&api=接口的ID


## api-jsons目录说明
api-jsons

 -- sample mock数据

 -- api.json api根文件

 -- errcode.json 错误代码说明文件

 -- system 示例api接口

 -- user 示例api接口

## api.json示例文件说明
```
[
    {
        "name":"后台用户API",
        "summary":"提供了后台用户的相关API",
        "apiFiles":"user/*.json"
    },
    {
        "name":"系统API",
        "summary":"提供了系统级的相关API",
        "apiFiles":"system/*.json"
    }
]
```


字段说明：
- name：api的分类名称
- summary：api分类的简短摘要描述
- apiFiles：本分类下的api文件存放路径，支持*方式模式匹配，路径相关于api.json文件而言

## api接口示例文件
```
{
    "id":"console.user.create",
    "name":"创建用户",
    "description":"创建后台用户账号",
    "namespace":"Kuga\\Service\\ApiV3\\Console",
    "path":"./ApiV3/Console",
    "method":"user.create",
    "accessLevel": 1,
    "request":[
        {
            "param":"username",
            "required":true,
            "default":"",
            "name":"用户名",
            "type":"String",
            "description":"描述"
        },
        {
            "param":"password",
            "required":true,
            "default":"",
            "type":"String",
            "description":"密码",
            "name":"密码"
        },
        {
            "param":"mobile",
            "required":true,
            "default":"",
            "type":"String",
            "description":"手机号",
            "name":"手机号"
        }
    ],
    "response":{
        "data":{
            "type":"Boolean",
            "sample":true,
            "description":"成功返回true，失败返回false"
        }
    }
}
```

说明：

- id：是唯一标识，也是api接口要传的method内容
- name: 接口名称
- description: 接口描述
- namespace: 服务端PHP要用到，即接口所在命名空间名称
- path: namespace对应的映射路径
- method: 服务端PHP实际要调用的类和接口，采用类名.方法名方式
- accessLevel：表示accessToken的需求等级，
值=0表示服务端对api没有accessToken的验证要求；
值=1表示api必须传递accessToken字串
值=2表示服务端对accessToken无必须要求
- request: 请求参数数组
- response: 请求返回的数据内容对象，每一个内容对象具有type、description、
sample、responseItem属性，如果是response/data这个对象还可能有hasSampleFile属性


### request节点属性说明
- request节点是一个数组，表示要对API传递的业务参数
- 每一个业务参数具有param、required、default、type、description这几个属性
- param: 表示要传的参数名称
- description: 参数的描述
- default: 参数不传值时，服务端给了这个参数的默认值
- required: true或false，表示是否必填项
- type:参数类型，值有String，Integer，Float，Boolean四种

### 每一个response节点的属性说明
- type：有Boolean、Object、Array、String、Integer
- description: 描述
- sample: mock（示例）数据
- hasSampleFile: 是否有mock示例数据，true为有，false为无，具适用于response/data这个节点
- responseItem: 节点的子节点，每一个responseItem和
节点一样，具有type、description、sample、responseItem等属性
