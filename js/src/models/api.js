/**
 * 
 */
import {
  queryApiTree,
  queryGlobalParams,
  queryApiList,
  queryApiDetail,
  queryErrorCodeList,
  apiRequest,
  clearCache,
} from '@/apiService.js';
import { forEach } from 'lodash';
function getDetailNav(item, url, detailNavs=[]) {
  if (item.children) {
    item.children.map(childItem => {
      getDetailNav(childItem, url, detailNavs);
      for (var childKey in childItem.apis) {
        if (childKey === url) {
          detailNavs.push(item);
          detailNavs.push(childItem);
          break;
        }
      }
      return detailNavs;
    });
  } else {
    for (var key in item.apis) {
      if (key === url) {
        detailNavs.push(item);
      }
    }
  }
}

export default {
  namespace: 'apiData',

  state: {
    apiModules: [],
    globalParams: [],
    globalParamsLoading: false,
    selectedModuleIndex: '0',
    apiNavs: [],
    //详情页导航
    detailNav: [],
    //当前api的url
    apiCurUrl: '',
    apiModuleDetail: {
      id:'',
      name: '',
      summary: '',
      apis: {},
    },
    apiDetail: {
      id:'',
      name: '',
      accessLevel: 0,
      request: [],
      response: {},
      responseSample: {},
    },
    errorCodeList: [],
    //API执行结果
    apiRequestResult: null,
    //右上角的设置
    setting: {
      host: '',
      appKey: '',
      appSecret: '',
      consoleToken: '',
      memberToken: '',
    },
    clearing: false,
  },

  subscriptions: {
    //列出所有api模块
    setup({ dispatch }, done) {
      dispatch({
        type: 'listApiModules',
        payload: { firstLoad: true },
      });
    },
  },

  effects: {
    /**
     * 取得errorCode列表
     * @param {*} param0
     * @param {*} param1
     */
    *listErrorCodeList({ payload }, { call, put }) {
      const responseData = yield call(queryErrorCodeList, payload);
      yield put({
        type: 'saveErrorCode',
        payload: responseData,
      });
    },
    *clearCache({ payload }, { call, put }) {
      yield put({
        type: 'clearing',
        payload: true,
      });
      yield call(clearCache, payload);
      yield put({
        type: 'clearing',
        payload: false,
      });
    },
    /**
     * 取得某个指定API详情
     * payload是api的url
     */
    *getApiDetail({ payload }, { call, put }) {
      const responseData = yield call(queryApiDetail, payload);
      const { property, sample } = responseData;
      yield put({
        type: 'saveApiDetail',
        payload: {
          id: payload,
          request: property.request,
          name: property.name,
          description: property.description,
          accessLevel: property.accessLevel,
          response: property.response,
          responseSample: sample,
        },
      });
    },
    /**
     * 获取指定模块的API模块详情及包含的API列表
     */
    *getApiModuleDetail({ payload }, { call, put }) {
      const responseData = yield call(queryApiList, payload);
      yield put({
        type: 'saveApiModuleDetail',
        payload: responseData,
      });
    },
    /**
     * API 公共请求参数
     */
    *listGlobalParams({ payload }, { call, put }) {
      yield put({
        type: 'changeGlobalParamsLoading',
        payload: true,
      });
      const responseData = yield call(queryGlobalParams, payload);
      let globalParams = Object.assign([], responseData);
      globalParams.push({
        param: 'access_token',
        default: '',
        type: 'String',
        required: false,
        description: 'AccessToken',
      });
      yield put({ type: 'saveParams', payload: globalParams });
      yield put({
        type: 'changeGlobalParamsLoading',
        payload: false,
      });
    },
    /**
     *
     * 请求Api Module tree
     */
    *listApiModules({ payload }, { call, put }) {
      // eslint-disable-line

      const responseData = yield call(queryApiTree, payload);
      let tree = [];
      forEach(responseData, (value, key) => {
        tree.push(value);
      });
      yield put({ type: 'save', payload: tree });

      //默认选中第1个api module
      const [firstModule] = tree;
      let moduleIndex = '0';

      if (firstModule.children) {
        moduleIndex = '0.0';
        //moduleDetail = firstModule.children[0];
      } else {
        moduleIndex = '0';
        //moduleDetail = firstModule;
      }
      yield put({
        type: 'selectApiModule',
        payload: moduleIndex,
      });
      // yield put({
      //   type:'saveApiModuleDetail',
      //   payload:moduleDetail
      // });
    },

    //执行API请求
    *doApiRequest({ payload }, { call, put }) {
      //先清空
      yield put({
        type: 'saveApiResonseData',
        payload: null,
      });
      const responseData = yield call(apiRequest, payload);
      yield put({
        type: 'saveApiResonseData',
        payload: responseData,
      });
    },
    *saveSetting({ payload }, { put }) {
      yield put({
        type: 'saveSettingToStorage',
        payload,
      });
    },
    *getSetting(_, { put }) {
      let payload = sessionStorage.getItem('setting');
      try {
        payload = JSON.parse(payload);
      } catch (e) {
        console.log(e);
      }
      if (!payload) {
        payload = {
          appKey: '',
          appSecret: '',
          consoleToken: '',
        };
      }
      yield put({
        type: 'saveSettingToStorage',
        payload,
      });
    },
  },

  reducers: {
    save(state, action) {
      return { ...state, apiModules: action.payload };
    },

    //保存API执行结果
    saveApiResonseData(state, action) {
      return {
        ...state,
        apiRequestResult: action.payload,
      };
    },
    saveSettingToStorage(state, action) {
      if (sessionStorage) {
        sessionStorage.setItem('setting', JSON.stringify(action.payload));
      }
      return {
        ...state,
        setting: action.payload,
      };
    },
    changeGlobalParamsLoading(state, action) {
      return {
        ...state,
        globalParamsLoading: action.payload,
      };
    },
    /**
     * globalParams存储
     * @param {*} state
     * @param {*} action
     */
    saveParams(state, action) {
      return {
        ...state,
        globalParams: action.payload,
      };
    },
    /**
     * 选左边Api Module
     */
    selectApiModule(state, action) {
      let navs = [];
      if (action.payload.indexOf('.') === -1) {
        navs.push(state.apiModules[action.payload]);
      } else {
        //const [parentId,childId] = action.payload.split('.').filter(x=>x!=='.');
        //navs.push(state.apiModules[parentId]);
        //navs.push(state.apiModules[parentId]['children'][childId]);

        const navIds = action.payload.split('.').filter(x => x !== '.');
        let nextNode = [];
        let nextIndex = 0;
        for (let index in navIds) {
          let nid = navIds[index];
          if (nextIndex === 0) {
            nextNode = state.apiModules;
          } else {
            nextNode = nextNode['children'];
          }
          navs.push(nextNode[nid]);
          nextNode = nextNode[nid];
          nextIndex++;
        }
      }
      return {
        ...state,
        apiNavs: navs,
        selectedModuleIndex: action.payload,
      };
    },
    /**
     * apiDetail数据存储
     * @param {*} state
     * @param {*} action
     */
    saveApiDetail(state, action) {
      //根据这个id定位到所在的api module
      const { id } = action.payload;
      let detailNavs = [];
      state.apiModules.map(item => {
        return getDetailNav(item, id, detailNavs);
      });

      // state.apiModules.map(item=>{
      //   if(item.children){
      //     item.children.map(childItem=>{
      //       for(var childKey in childItem.apis){
      //         if(childKey==id){
      //           detailNavs.push(item);
      //           detailNavs.push(childItem);
      //           break;
      //         }
      //       }
      //     })
      //   }else{
      //     for(var key in item.apis){
      //       if(key==id){
      //         detailNavs.push(item);
      //         break;
      //       }
      //     }
      //   }
      // });
      return {
        ...state,
        detailNav: detailNavs,
        apiDetail: action.payload,
        apiCurUrl: action.payload.id,
      };
    },
    /**
     * errorCodeList数据存储
     * @param {*} state
     * @param {*} action
     */
    saveErrorCode(state, action) {
      return {
        ...state,
        errorCodeList: action.payload,
      };
    },
  },
};
