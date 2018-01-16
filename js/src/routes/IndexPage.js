/**
 * 首页
 * @author Donny
 */
import {connect} from 'dva';
import {Component} from 'react';
import {forEach} from 'lodash';
import { Card, Layout, Menu, Breadcrumb, Icon } from 'antd';
import GlobalParameters from '../components/GlobalParameters';
import RequestGateway from '../components/RequestGateway';
import ApiModuleDetail from '../components/ApiModuleDetail';
import DocHeader from '../components/Header';

const { SubMenu } = Menu;
const { Header, Content, Sider } = Layout;


@connect(state=>({
  apiData:state.apiData
}))
export default class IndexPage extends Component {
  constructor(props){
    super(props);
    this.state = {
      mockUrl:''
    }
  }
  componentDidMount(){
    // this.props.dispatch({
    //   type:'apiData/listApiModules',
    //   payload:{firstLoad:true}
    // });


  }
  componentWillReceiveProps(nextProps){

  }
  fetchApiModuleDetail=()=>{
    this.props.dispatch({
      type:'apiData/getApiModuleDetail',
      payload:this.props.apiData.selectedModuleIndex
    })
  }

  showApiModule=(item,key,keyPath)=>{
    const {apiData:{apiModules},dispatch} = this.props;
    let navs = [];
    if(item.key.indexOf('.')==-1){
      dispatch({
        type:'apiData/selectApiModule',
        payload:item.key
      });
    }else{
      const [parentId,childId] = item.key.split('.').filter(x=>x!=='.');
      dispatch({
        type:'apiData/selectApiModule',
        payload:parentId + '.' + childId
      });
    }
  }
  render() {
    const {apiData:{apiModules,globalParams,globalParamsLoading, selectedModuleIndex,apiNavs}} = this.props;
    const apiModuleDetail = apiNavs.length>0?apiNavs[apiNavs.length-1]:{apis:{},name:'',summary:''};
    let index = 0;
    let apiList = [];

    apiList = Object.values(apiModuleDetail.apis);
    return (
      <Layout>
        <Header className="header">
          <DocHeader/>
        </Header>
        <Layout>
          <Sider width={200} style={{ background: '#fff' }}>
            <Menu
              mode="inline"
              style={{ height: '100%', borderRight: 0 }}
              onClick={this.showApiModule.bind(this)}
              selectedKeys={[selectedModuleIndex]}
              defaultOpenKeys={['0']}
            >
            {
              apiModules.map((value,key)=>{
                if(Array.isArray(value.children) && value.children.length>0){
                  return (
                    <SubMenu key={key} title={<span><Icon type="right-square"/>{value.name}</span>}>
                    {value.children.map((childValue,childKey)=>(
                      <Menu.Item key={key+'.'+childKey} >{childValue.name}</Menu.Item>
                    ))}
                    </SubMenu>
                  )
                }else{
                  return <Menu.Item key={key} ><span><Icon type="right-square"/>{value.name}</span></Menu.Item>
                }
              })
            }
            </Menu>
          </Sider>
          <Layout style={{ padding: '0 24px 24px' }}>
            <Breadcrumb style={{ margin: '16px 0' }}>
              <Breadcrumb.Item>首页</Breadcrumb.Item>
              {
                apiNavs.map((item,index)=>(
                  <Breadcrumb.Item key={index}>{item.name}</Breadcrumb.Item>
                ))
              }
            </Breadcrumb>
            <Content style={{ background: '#fff', padding: 24, margin: 0, minHeight: 280 }}>
              {apiModuleDetail.name?<ApiModuleDetail
                title={apiModuleDetail.name}
                description={apiModuleDetail.summary}
                apiList={apiList}
              />:null}

            </Content>
          </Layout>
        </Layout>
      </Layout>
    );
  }


}
