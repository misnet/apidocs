/**
 * 指定的API模块详情组件
 * @author Donny
 */
import {Component} from 'react';
import PropTypes from 'prop-types'
import { Card, Table } from 'antd';
import {Link} from 'dva/router';
class ApiModuleDetail extends Component{
    render(){
        const {title,apiList} = this.props;
        const columns = [{
            title:'API列表',
            key:'id',
            dataIndex:'id',
        render:(text,record,index)=>{
            return <Link to={"/detail/"+record.id}>{record.id}</Link>
        }
        },{
            title:'描述',
            key:'name',
            dataIndex:'name'
        }];
        return (
            <Card title={title} bordered={false}>
                <Table
                columns={columns} 
                pagination={false}
                rowKey={record=>record.id}
                dataSource={apiList} 
                />
            </Card>
    
        )
    }
    
}
ApiModuleDetail.propType={
    name:PropTypes.string,
    description:PropTypes.string,
    apiList:PropTypes.array
}
export default ApiModuleDetail;