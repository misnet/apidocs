/**
 * 测试工具
 * @author Donny
 */
import { connect } from 'dva';
import { Component } from 'react';
import { Card,Input,  Button, Select, Form, message,notification } from 'antd';
import { forEach } from 'lodash';
const TextArea = Input.TextArea;
@connect(state => ({
  apiData: state.apiData,
}))
@Form.create()
class TestTool extends Component {
  constructor(props){
    super(props);
    this.state = {
      accessTokenType :'',
      executeTime:''
    }
    this.props.dispatch({
      type:'apiData/getSetting'
    });
  }
  submitApiData=(e)=>{
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const setting = this.props.apiData.setting;
        if(!setting.host){
          notification.error({message:'提示',description:'请点右上角设置图标，设置好API网关地址'});
          return;
        }
        let jd={};
        try{
          jd = JSON.parse(values['jsonData']);
        }catch(e){
          jd = {};
        }
        this.props.dispatch({
          type:'apiData/doApiRequest',
          payload:{
            params:jd,
            setting:setting,
            accessLevel:this.props.accessLevel
          }
        })
      }else{
        forEach(err,(x,i)=>{
          message.error(x.errors[0]['message']);
        })
      }
      let t = new Date();
      this.setState({
        executeTime:parseInt(t.getMonth()+1)+'月'+t.getDate()+'日 '+t.getHours()+':'+t.getMinutes()+':'+t.getSeconds()
      })
    });

  }
  buildFormItem=(record)=>{
    const {getFieldDecorator} = this.props.form;
    if (record.type === 'formItem') {
      return getFieldDecorator(record.param, {
        initialValue: (record.param!=='sign' && record.param!=='accessToken' && record.value)?record.value:record.default,

        rules: [
          {
            required: record.required,
            message: '参数 '+record.param+' 需要填写',
          },
        ],
      })(
        <Input.TextArea disabled={(record.param==='sign'||record.param==='accessToken')?true:false}/>
      );
    }
  }
  render () {
    const {globalParams, privateParams,apiData:{apiRequestResult}} = this.props;
    const {accessTokenType,executeTime} = this.state;
    const {getFieldDecorator} = this.props.form;
    let jsonData = {};
    globalParams.forEach((x) => {
      if(x['param']!=='sign' && x['param']!=='appkey'&& x['param']!=='access_token') {
        jsonData[x['param']] = x['default']
      }
    });
    jsonData['method'] = this.props.method;
    function getPrivateParams(node,parent){
      node.forEach((x) => {
        if(!x['requestItem'])
          parent[x['param']] = x['default']?x['default']:"";
        else {
          const childNode = {};
          const v = getPrivateParams(x['requestItem'], childNode);
          if(x['type'].toLowerCase() ==='array'){
            parent[x['param']] = [v];
          }else{
            parent[x['param']] = v;
          }
        }
      });
      return parent;
    }
    getPrivateParams(privateParams,jsonData);
    return (

        <div>

          {getFieldDecorator('accessTokenType', {
            initialValue: accessTokenType,
          })(<Select style={{marginRight:'10px'}}>
            <Select.Option value="">不设置AccessToken</Select.Option>
            <Select.Option value="console">AccessToken1</Select.Option>
            <Select.Option value="member">AccessToken2</Select.Option>
          </Select>)}
          <p>参数：</p>
          <div>
            {getFieldDecorator('jsonData', {
              initialValue: JSON.stringify(jsonData,null,4),
            })(<TextArea rows={20}></TextArea>)}
          </div>
          <p>说明</p>
          <ul>
            <li>appkey:系统会自动读取右上角的appkey，您不需要填写该参数</li>
            <li>sign：签名参数由系统自动计算，也无需填写</li>
            <li>access_token：根据您的选择，自动读取右上角的设置</li>
          </ul>
          <Button type={'primary'} style={{margin:'10px 0'}} onClick={this.submitApiData}>开始测试</Button>
          <Card title={"API执行结果"+(executeTime?'（'+executeTime+'）':'')} style={{display:apiRequestResult?'block':'none'}}>
          <pre>
          {JSON.stringify(apiRequestResult, null, 4)}
          </pre>
          </Card>
        </div>

    );
  }
};
export default TestTool;