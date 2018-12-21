import { Component } from 'react';
import {Icon,Modal,Form,Input,Row,Col} from 'antd';
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

    searchApi = (v)=>{
        v = v.replace(/(^\s+)|(\s+$)/g,'');
        const reg = new RegExp(/^http(|s):\/\/([a-zA-Z0-9\.\-]+)([^/:]+)(:\d*)?(\S+)/i);
        const reg2 = new RegExp(/^\/([a-zA-Z0-9\/\_\-]+)/i);
        const r = v.match(reg);
        const r2 = v.match(reg2);
        if(r && r[5]){
            const api = r[5];
            //console.log(api,'/detail/'+api.substring(1).replace(/\//g, '.'));
            //this.props.dispatch(routerRedux.push('/detail/'+api.substring(1).replace(/\//g, '.')));
            location.href='#/detail/'+api.substring(1).replace(/\//g, '.');
        }else{
            if(r2){
                const api = r2[0];
                location.href='#/detail/'+api.substring(1).replace(/\//g, '.');
            }else{
                notification.error({
                    message: '错误提示',
                    description: '请全入完整的API接口网址',
                });
            }

        }
        //this.props.dispatch(routerRedux.push(api));
    }
    clearCache = ()=>{
        this.props.dispatch({
            type:'apiData/clearCache'
        });

    }
  render () {
    const {setting:{appKey,appSecret,consoleToken,memberToken,host},clearing} = this.props.apiData;
    const {getFieldDecorator} = this.props.form;
    return (
      <div>
          <Row gutter={16}>
              <Col  span={11}><h1 className={styles.doctitle}><Link to="/">Kuga APIDoc</Link></h1></Col>
              <Col span={6} style={{display:"none"}}><Input.Search
                  placeholder="搜索接口，如https://apidoc.kity.me/common/captcha/getSms"
                  onSearch={(v)=>this.searchApi(v)}
                  enterButton
              /></Col>
              <Col span={7}>
                  <a onClick={()=>this.clearCache()}>{clearing?'清API缓存中...':'清API缓存'}</a>
                  <div onClick={this.showModal} className={styles.docSetting}><Icon type="setting"></Icon></div>
              </Col>
          </Row>
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
