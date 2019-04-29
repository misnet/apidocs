/**
 * API详情页面
 * @author Donny
 */
import {connect} from 'dva';
import {Component} from 'react';
import {keys} from 'lodash';
import { Card, Layout, Menu, Breadcrumb, Table,Button } from 'antd';
import GlobalParameters from '@/components/GlobalParameters';
import RequestGateway from '@/components/RequestGateway';
import ApiDetail from '@/components/ApiDetail';
import TestTool from '@/components/TestTool';
import Config from '@/config';
import {Link} from 'dva/router';
const { Content, Sider } = Layout;


@connect(state=>({
  apiData:state.apiData
}))
class DetailPage extends Component {
  constructor(props){
    super(props);
    this.state = {
      apiTestToolVisible:false
    }
  }
  componentDidMount(){
    const {match:{params}}=this.props;
    const id = params.id;
    this.props.dispatch({
      type:'apiData/getApiDetail',
      payload:id
    });
    this.props.dispatch({
      type:'apiData/listGlobalParams',
      payload:{}
    });
    this.props.dispatch({
      type:'apiData/listErrorCodeList',
      payload:{}
    });
  }
  componentWillReceiveProps(nextProps){
    if(typeof nextProps.match.params.id!=='undefined' && nextProps.match.params.id!==this.props.match.params.id){
      this.props.dispatch({
        type:'apiData/getApiDetail',
        payload:nextProps.match.params.id
      });
    }
  }
  

  showDetail=(item,key,keyPath,tt)=>{
    this.props.dispatch({
      type:'apiData/getApiDetail',
      payload:item.key
    });
  }

  toggleApiTestTool=()=>{
    this.setState({
      apiTestToolVisible:!this.state.apiTestToolVisible
    });
  }
  render() {
    const {apiData:{apiCurUrl,detailNav, apiDetail,globalParams,globalParamsLoading,errorCodeList,setting}} = this.props;
    const errorColumns = [
      {
        title:'错误码',
        key:'code',
        dataIndex:'code'
      },
      {
        title:'描述',
        key:'message',
        dataIndex:'message'
      }
    ];
    const apiModuleDetail = detailNav.length>0?detailNav[detailNav.length-1]:{apis:{},name:'',summary:''};
    let apiList = [];
    if(keys(apiModuleDetail.apis).length>0){
      for (let key in apiModuleDetail.apis){
        apiList.push(apiModuleDetail.apis[key]);
      }
    }
    let apiHost = Config.API_HOST;
    if(setting.host){
      apiHost = setting.host;
    }
    console.log('apiModuleDetail',apiModuleDetail);
    return (
      
        <>
          <Sider width={250} style={{ background: '#fff' }}>
            {
              apiList.length>0?<div style={{height:"48px",borderBottom:"1px solid #e6e6e6",lineHeight:"48px","paddingLeft":"20px","fontSize":"16px"}}> {apiModuleDetail.name}</div>:null
            }
            <Menu
              mode="inline"
              style={{ height: '100%', borderRight: 0 }}
              onClick={this.showDetail}
              selectedKeys={[apiCurUrl]}
            >
            {
              apiList.map((item,index)=>(
                <Menu.Item key={item.id} style={{lineHeight:"20px",height:"50px",padding:"5px 0px"}} >{item.id}<br/>{item.name}</Menu.Item>
              ))
            }
            </Menu>
          </Sider>
          <Layout style={{ padding: '0 24px 24px' }}>
            <Breadcrumb style={{ margin: '16px 0' }}>
              <Breadcrumb.Item><Link to="/">首页</Link></Breadcrumb.Item>
              {
                detailNav.map((item,index)=>(
                  <Breadcrumb.Item key={index}>{item.name}</Breadcrumb.Item>
                ))
              }
            </Breadcrumb>
            <Content style={{ background: '#fff', padding: 24, margin: 0, minHeight: 280 }}>
              <Card title={apiDetail.id + '(' + apiDetail.name + ')'} bordered={false}>
              <p>{apiDetail.description}</p>
              </Card>
              <RequestGateway
               gatewayUrl={apiDetail.id?apiHost:''}
                mockUrl={apiDetail.id?Config.MOCK_HOST + apiDetail.id:''}
              />
              <p><Button type="primary" onClick={this.toggleApiTestTool}>API测试工具</Button></p>
              <Card title="API测试工具"  style={{margin:'10px 0',display:this.state.apiTestToolVisible?'block':'none'}}>
                <TestTool
                  globalParams={globalParams}
                  privateParams={apiDetail.request}
                  accessLevel={apiDetail.accessLevel}
                  gatewayHost={apiHost}
                  method={apiDetail.id}
                />

              </Card>
              <Card title="公共参数">
                <GlobalParameters 
                accessTokenRequired={apiDetail.accessLevel>0}
                dataSource={globalParams}
                loading={globalParamsLoading}
                />
              </Card>
              <ApiDetail
                request={apiDetail.request}
                response={apiDetail.response}
                responseSample={apiDetail.responseSample}
              />

                <Card title="错误码说明" style={{marginTop:"20px"}}>
                    <Table
                    columns={errorColumns} 
                    pagination={false}
                    rowKey={record=>record.code}
                    dataSource={errorCodeList} 
                    />
                </Card>
            </Content>
          </Layout>
        </>
    );
  }


}
export default DetailPage;