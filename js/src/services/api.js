/**
 * API请求
 * @author Donny
 */
import request from '../utils/request';
import ApiConfig from '../common/config';
import fetch from 'dva/fetch';
import _ from 'lodash';
import md5 from 'md5';
/**
 * API 类目树
 * @returns {Object}
 */
export function queryApiTree() {
  return request(ApiConfig.APIDOC_HOST + ApiConfig.APILIST.API_CATES);
}

export function clearCache () {
    return request(ApiConfig.APIDOC_HOST + ApiConfig.APILIST.CLEAR_CACHE);
}
/**
 * API 公共请求参数
 */
export function queryGlobalParams(){
  return request(ApiConfig.APIDOC_HOST + ApiConfig.APILIST.GLOBAL_PARAMS);
}
/**
 * 取得指定模块的API列表
 * @param {*} moduleId 
 */
export function queryApiList(moduleId){
  return request(ApiConfig.APIDOC_HOST + ApiConfig.APILIST.API_LIST,{mid:moduleId});
}
/**
 * API详情
 * @param {*} url 
 */
export function queryApiDetail(id){
  return request(ApiConfig.APIDOC_HOST + ApiConfig.APILIST.API_DETAIL,{id});
}
/**
 * 错误响应码列表
 */
export function queryErrorCodeList(){
  return request(ApiConfig.APIDOC_HOST + ApiConfig.APILIST.ERR_CODE);
}

/**
 *
 * @param option {url,params}
 */
export async function apiRequest (option) {
  let reqBody = {body: {}, headers: {}};
  const {url,host,setting,accessLevel,params} = option;
  if(!params['accessToken'] && accessLevel>=1){
    switch(params['accessTokenType']){
          case 'console':
            params['accessToken'] = setting['consoleToken']?setting['consoleToken']:null;
            break;
          default:
            params['accessToken'] = setting['memberToken']?setting['memberToken']:null;break;
        }
  }
  let sortedParams = sortKeysBy(params);
  let sign = '';
  let newParams = {};

  _.mapKeys(sortedParams, function (value, key) {
    if (value != undefined && key != 'sign' && key!='accessTokenType') {
      let t = value == null ? '' : value;
      if (_.isBoolean(t)) {
          t = t ? 1 : '';
      }
      sign += key + t;
      newParams[key] = t;
  }
  });
  sign = setting.appSecret + sign + setting.appSecret;
  sign = md5(sign).toUpperCase();
  newParams['sign'] = sign;
  reqBody.body = JSON.stringify(newParams);
  reqBody.method = 'POST';
  reqBody.headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json; charset=utf-8'
  };
  //console.log('reqBody',reqBody);
  return fetch(url, reqBody)
    .then((response) => response.json())
    .catch(err => ({err}));
}

function sortKeysBy (obj, comparator) {
  let keys = _.sortBy(_.keys(obj), function (key) {
    return comparator ? comparator(obj[key], key) : key;
  });
  let newObj = {};
  _.map(keys, function (key) {
    newObj[key] = obj[key];
  });
  return newObj;
}