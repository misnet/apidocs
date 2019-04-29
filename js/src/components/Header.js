import { Component } from 'react';
import { Icon, Modal, Form, Input, Row, Col } from 'antd';
import styles from '@/common/style.less';
import { connect } from 'dva';
import { routerRedux, Link } from 'dva/router';
const FormItem = Form.Item;
const TextArea = Input.TextArea;
@connect(state => ({
    apiData: state.apiData,
}))
@Form.create()
class Header extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modalVisible: false,
        };
        this.props.dispatch({
            type: 'apiData/getSetting',
        });
    }
    showModal = () => {
        this.setState({ modalVisible: true });
    };
    onSaveSetting = e => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.props.dispatch({
                    type: `apiData/saveSetting`,
                    payload: values,
                });
                this.setState({ modalVisible: false });
            }
        });
    };
    onCancelSetting = () => {
        this.setState({ modalVisible: false });
    };

    searchApi = v => {
        //location.href='#/detail/'+v;
        console.log('#/detail/' + v);
        this.props.dispatch(routerRedux.push('/detail/' + v));
    };
    clearCache = () => {
        this.props.dispatch({
            type: 'apiData/clearCache',
        });
    };
    render() {
        const {
            setting: { appKey, appSecret, consoleToken, memberToken, host },
            clearing,
        } = this.props.apiData;
        const { getFieldDecorator } = this.props.form;
        return (
            <div>
                <Row gutter={16}>
                    <Col span={5}>
                        <h1 className={styles.doctitle}>
                            <Link to="/">Kuga APIDoc</Link>
                        </h1>
                    </Col>
                    <Col span={12}>
                        <Input.Search
                            placeholder="搜索接口，如acc.user.create"
                            onSearch={v => this.searchApi(v)}
                            enterButton
                            style={{padding:"12px 0px"}}
                        />
                    </Col>
                    <Col span={7}>
                        <a href="###" onClick={this.clearCache}>{clearing ? '清API缓存中...' : '清API缓存'}</a>
                        <div onClick={this.showModal} className={styles.docSetting}>
                            <Icon type="setting" />
                        </div>
                    </Col>
                </Row>
                <Modal
                    width={600}
                    visible={this.state.modalVisible}
                    title="设置"
                    onOk={this.onSaveSetting}
                    onCancel={this.onCancelSetting}
                >
                    <p>提示：以下信息主要用于测试工具。</p>
                    <FormItem labelCol={{ span: 6 }} wrapperCol={{ span: 18 }} label="API网关">
                        {getFieldDecorator('host', {
                            initialValue: host,
                            rules: [
                                {
                                    required: true,
                                    message: '请输入网关地址',
                                },
                            ],
                        })(<Input placeholder="请输入" maxLength={100} />)}
                    </FormItem>

                    <FormItem labelCol={{ span: 6 }} wrapperCol={{ span: 18 }} label="APPKey">
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
                        })(<Input placeholder="请输入" maxLength={10} />)}
                    </FormItem>

                    <FormItem labelCol={{ span: 6 }} wrapperCol={{ span: 18 }} label="APPSecret">
                        {getFieldDecorator('appSecret', {
                            initialValue: appSecret,
                            rules: [
                                {
                                    required: true,
                                    message: 'APP Secret',
                                },
                            ],
                        })(<TextArea placeholder="请输入" />)}
                    </FormItem>

                    <FormItem labelCol={{ span: 6 }} wrapperCol={{ span: 18 }} label="AccessToken1">
                        {getFieldDecorator('consoleToken', {
                            initialValue: consoleToken,
                        })(<TextArea placeholder="请输入" />)}
                    </FormItem>
                    <FormItem labelCol={{ span: 6 }} wrapperCol={{ span: 18 }} label="AccessToken2">
                        {getFieldDecorator('memberToken', {
                            initialValue: memberToken,
                        })(<TextArea placeholder="请输入" />)}
                    </FormItem>
                </Modal>
            </div>
        );
    }
}
export default Header;
