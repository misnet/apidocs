/**
 * 指定的API详情组件
 * @author Donny
 */
import {Component} from 'react';
import PropTypes from 'prop-types'
import { Card, Table } from 'antd';
import styles from '../common/style.less';

const columns = [{
    title:'参数',
    key:'param',
    dataIndex:'param',
    className:styles.nobreak
},{
    title:'类型',
    key:'type',
    dataIndex:'type',
    className:styles.nobreak
},{
    title:'是否必填',
    key:'required',
    dataIndex:'required',
    className:styles.nobreak,
    render:(text,record)=>(record.required?'是':'否')
},{
    title:'默认值',
    key:'default',
    dataIndex:'default',
    className:styles.nobreak
},{
    title:'描述',
    key:'description',
    className:styles.autobreak,
    dataIndex:'description'
}];
const responseColumns = [{
    title:'名称',
    key:'name',
    className:styles.nobreak,
    dataIndex:'name'
},{
    title:'类型',
    key:'type',
    className:styles.nobreak,
    dataIndex:'type'
},{
    title:'示例',
    key:'sample',
    className:styles.autobreak,
    render:(text,record)=>{
        if(typeof record.sample=='object'){
            return JSON.stringify(record.sample);
        }else{
            return record.sample;
        }
    },
    dataIndex:'sample'
},{
    title:'描述',
    className:styles.autobreak,
    key:'description',
    dataIndex:'description'
}];

function getRequestItem(node,key,nodeId){
    let newNode = Object.assign({},node);
    newNode.key = key?key:node.param;
    newNode.id  = nodeId;
    if(newNode.type && newNode.requestItem){
        newNode.children = [];
        //newNode.type = newNode.requestItemType;
        for(let k in newNode.requestItem){
            newNode.children.push(getRequestItem(newNode.requestItem[k],key+'.'+k,nodeId+'_'+k));
        }
        delete(newNode.requestItem);
        delete(newNode.requestItemType);
    }
    return {
        ...newNode
    };
}

function getResponseItem(node,key,nodeId){
    //let itemData = {"name":key,"id":nodeId};
    let newNode = Object.assign({},node);
    newNode['id'] = nodeId;
    newNode['key'] = key;
    if(node.responseItem){
        newNode.children = [];
        for(let childKey in node.responseItem){
            newNode.children.push(getResponseItem(node.responseItem[childKey],childKey,nodeId+'_'+childKey));
        }
        delete(newNode.responseItem);
    }
    return {
        ...newNode,
        name:key
    }
}

class ApiDetail extends Component{
    renderRequestFooter=()=>{
        return <p>说明： 类型为<strong>Array或Object</strong>的业务参数：如果传参用的是form-data形式时，请用Json.stringify转为字符串再传给接口。如果传参用的是JSON形式，则不需要转换</p>
    }
    render(){
        const {request,response,responseSample} = this.props;
        const responseDataSource = [{
            id:'status',
            name:'status',
            type:'Integer',
            sample:0,
            description:'响应码，0为成功，非0为失败'
        }];
        for(let key in response){
            responseDataSource.push(getResponseItem(response[key],key,key));
        }
        let requestDataSource = [];
        for(let key in request){
            requestDataSource.push(getRequestItem(request[key],key,key));
        }
        //console.log('responseDataSource:',responseDataSource);
        return (
            <div>
                <Card title="业务参数" className={styles.card}>
                    <Table
                    columns={columns} 
                    pagination={false}
                    rowKey={record=>record.key}
                    dataSource={requestDataSource} 
                    footer={this.renderRequestFooter}
                    />
                </Card>
                <Card title="响应结果参数" className={styles.card}>
                <Table
                    columns={responseColumns} 
                    pagination={false}
                    rowKey={record=>record.id}
                    dataSource={responseDataSource} 
                    />
                </Card>
                <Card title="响应结果示例" className={styles.card}>
                    <pre>
                        {JSON.stringify(responseSample, null, 4)}
                    </pre>
                </Card>
            </div>
    
        )
    }
    
}
ApiDetail.propType={
    request:PropTypes.array,
    response:PropTypes.object,
    responseSample:PropTypes.object
}
export default ApiDetail;