import { Component } from 'react';
import {Icon,Modal,Form,Input} from 'antd';
import styles from '../common/style.less';
import { connect } from 'dva';
import { Link } from 'dva/router';
const FormItem = Form.Item;

@connect(state => ({
  apiData: state.apiData,
}))
@Form.create()
export default class Header extends Component {
  constructor(props){
    super(props);
    this.state = {
      modalVisible:false
    }
    this.props.dispatch({
      type:'apiData/getSetting'
    })
  }
  showModal =()=>{
    this.setState({modalVisible:true});
  }
  onSaveSetting = (e)=>{
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.props.dispatch({
          type: `apiData/saveSetting`,
          payload: values,
        });
        this.setState({modalVisible:false});
      }
    });
  }
  onCancelSetting = ()=>{
    this.setState({modalVisible:false});
  }
  render () {
    const {setting:{appKey,appSecret,consoleToken,memberToken,host}} = this.props.apiData;
    const {getFieldDecorator} = this.props.form;
    return (
      <div>
        <div onClick={this.showModal} className={styles.docSetting}><Icon type="setting"></Icon></div>
        <h1 className={styles.doctitle}><Link to="/">Kuga APIDoc</Link></h1>
        <Modal
          width={600}
          visible={this.state.modalVisible}
          title="设置"
          onOk={this.onSaveSetting} onCancel={this.onCancelSetting}>
          <p>提示：以下信息主要用于测试工具。</p>
          <FormItem
            labelCol={{span:6}}
            wrapperCol={{span:18}}
            label="API网关">
            {getFieldDecorator('host', {
              initialValue: host,
              rules: [
                {
                  required: true,
                  message: '请输入网关地址',
                }
              ],
            })(
              <Input placeholder="请输入" maxLength="100"/>,
            )}
          </FormItem>

          <FormItem
            labelCol={{span:6}}
            wrapperCol={{span:18}}
            label="APPKey">
            {getFieldDecorator('appKey', {
              initialValue: appKey,
              rules: [
                {
                  required: true,
                  message: '请输入APPKey',
                },
                {
                  pattern: /^([0-9]{4,10})$/,
                  message: '请输入正确APP KEY',
                },
              ],
            })(
              <Input placeholder="请输入" maxLength="10"/>,
            )}
          </FormItem>

          <FormItem
            labelCol={{span:6}}
            wrapperCol={{span:18}}
            label="APPSecret">
            {getFieldDecorator('appSecret', {
              initialValue: appSecret,
              rules: [
                {
                  required: true,
                  message: 'APP Secret',
                }
              ],
            })(
              <Input placeholder="请输入" maxLength="64"/>
            )}
          </FormItem>

          <FormItem
            labelCol={{span:6}}
            wrapperCol={{span:18}}
            label="后台用户AccessToken">
            {getFieldDecorator('consoleToken', {
              initialValue: consoleToken
            })(
              <Input placeholder="请输入" maxLength="64"/>
            )}
          </FormItem>
          <FormItem
            labelCol={{span:6}}
            wrapperCol={{span:18}}
            label="会员用户AccessToken">
            {getFieldDecorator('memberToken', {
              initialValue: memberToken
            })(
              <Input placeholder="请输入" maxLength="64"/>
            )}
          </FormItem>
        </Modal>
      </div>
    );
  }
}
