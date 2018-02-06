/**
 * 测试工具
 * @author Donny
 */
import { connect } from 'dva';
import { Component } from 'react';
import { Card,Input,  Button, Select, Table,Form, message } from 'antd';
import { forEach } from 'lodash';
@connect(state => ({
  apiData: state.apiData,
}))
@Form.create()
export default class TestTool extends Component {
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
        console.log(values);
        this.props.dispatch({
          type:'apiData/doApiRequest',
          payload:{
            host:this.props.gatewayHost,
            url:this.props.gatewayUrl,
            params:values,
            setting:this.props.apiData.setting,
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
    if (record.type == 'formItem') {
      return getFieldDecorator(record.param, {
        initialValue: (record.param!='sign' && record.param!='accessToken' && record.value)?record.value:record.default,

        rules: [
          {
            required: record.required,
            message: '参数 '+record.param+' 需要填写',
          },
        ],
      })(
        <Input.TextArea disabled={(record.param=='sign'||record.param=='accessToken')?true:false}/>
      );
    }
  }
  render () {
    const {accessLevel,globalParams, privateParams,gatewayUrl,apiData:{apiRequestResult,setting}} = this.props;
    const {accessTokenType,executeTime} = this.state;
    const {getFieldDecorator} = this.props.form;
    const columns = [
      {
        title: '参数',
        dataIndex: 'param',
        key: 'param'
      }, {
        title: '值',
        dataIndex: 'value',
        key: 'value',
        render: (text, record) => this.buildFormItem(record)
      }
    ];
    let dataSource = [];
    //公共参
    if (globalParams) {
      let globalData = [];
      globalParams.forEach((x) => {
        let d = {
          'param': x['param'],
          'value': '',
          'type': 'formItem',
          'default':x['default'],
          'required':x['required'],
          'key':x['param']+'_g'
        };
        if(d.param=='appkey'){
          d.value = setting.appKey;
        }else if(d.param=='accessToken'||d.param=='sign'){
          d.required = false;
        }
        globalData.push(d);
      });
      dataSource.push({
        'param': '公共参数',
        'children': globalData,
        'type': null,
        'key':'global'
      });
    }
    //业务参数
    if (privateParams && Array.isArray(privateParams) && privateParams.length>0) {
      let privateData = [];
      privateParams.forEach((x) => {
        privateData.push({
          'param': x['param'],
          'type': 'formItem',
          'value': '',
          'default':x['default'],
          'required':x['required'],
          'key':x['param']+'_p'
        });
      });
      dataSource.push({
        'param': '业务参数',
        'children': privateData,
        'type': null,
        'key':'private'
      });
    }
    return (

        <div>
          <Table
            defaultExpandedRowKeys={['global','private']}
            columns={columns}
            pagination={false}
            rowKey={record => record.key}
            dataSource={dataSource}
          />
          {getFieldDecorator('accessTokenType', {
            initialValue: accessTokenType,
          })(<Select style={{marginRight:'10px'}}>
            <Select.Option value="">不设置AccessToken</Select.Option>
            <Select.Option value="console">后台用户AccessToken</Select.Option>
            <Select.Option value="member">会员用户AccessToken</Select.Option>
          </Select>)}
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
