/**
 * API请求
 * @author Donny
 */
import request from '../utils/request';
import ApiConfig from '../common/config';

/**
 * API 类目树
 * @returns {Object}
 */
export function queryApiTree() {
  return request(ApiConfig.APIDOC_HOST + ApiConfig.APILIST.API_CATES);
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
