import { connect } from 'dva';
import {Component} from 'react';
import styles from '../common/style.less';
export default class Header extends Component{
    render(){
        return (
            <h1 className={styles.doctitle}>Kuga APIDoc</h1>
        )
    }
}