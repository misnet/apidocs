/**
 * 请求网关说明组件
 * @author Donny
 */
import {Component} from 'react';
import {Card} from 'antd';
import PropTypes from 'prop-types'

class RequestGateway extends Component{
    render(){
        return (
            <Card title="请求网关" bordered={false}>
            <p>请求格式：表单格式请求或JSON格式请求</p>
            <p>响应格式：JSON格式</p>
            <p>请求方式：POST</p>
            {this.props.gatewayUrl?
            <p>API网关地址：<strong>{this.props.gatewayUrl}</strong></p>
            :null}
            {this.props.mockUrl?
            <p>mock地址：<a target="_blank" rel="noopener noreferrer" href={this.props.mockUrl}>{this.props.mockUrl}</a></p>
            :null}
            </Card>
        )
    }
}
RequestGateway.propTypes = {
    gatewayUrl:PropTypes.string,
    mockUrl:PropTypes.string
};
export default RequestGateway;