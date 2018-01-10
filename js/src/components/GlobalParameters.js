/**
 * 公共参数显示组件
 * @author Donny
 */
import {Component} from 'react';
import PropTypes from 'prop-types'
import { Table, Icon, Divider } from 'antd';

class GlobalParameters extends Component{
    render(){
        const columns = [{
            title: '名称',
            dataIndex: 'param',
            key: 'param',
            render: (text,record) => <strong>{record.param}</strong>,
          }, {
            title: '类型',
            dataIndex: 'type',
            key: 'type',
          }, {
            title: '是否必填',
            dataIndex: 'required',
            key: 'required',
            render:(text,record)=>{
                if(record.param=='accessToken')
                    return this.props.accessTokenRequired?'是':'否';
                else
                    return record.required?'是':'否';
            }
          },{
              title:'描述',
              dataIndex:'description',
              key:'description'
          }];
        return (
            <Table
                columns={columns} 
                pagination={false}
                loading={this.props.loading}
                rowKey={record=>record.param}
                dataSource={this.props.dataSource} 
            />
        )
    }
}
GlobalParameters.propTypes ={
    dataSource:PropTypes.array,
    loading:PropTypes.bool,
    accessTokenRequired:PropTypes.bool
};
export default GlobalParameters;