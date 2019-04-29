/**
 * Layout
 * @author Donny
 */
import {Component} from 'react';
import { Layout} from 'antd';
import DocHeader from '@/components/Header';

const { Header } = Layout;

 class IndexLayoutPage extends Component {
  constructor(props){
    super(props);
    this.state = {
    }
  }
  render() {
    return (
      <Layout>
        <Header className="header">
          <DocHeader/>
        </Header>
        <Layout>
          {this.props.children}
        </Layout>
      </Layout>
    );
  }


}
export default IndexLayoutPage;