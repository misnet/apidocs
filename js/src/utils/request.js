import fetch from 'dva/fetch';
import { notification } from 'antd';
function parseJSON(response) {
  return response.json();
}

function checkStatus(response) {
  if (response.status ==0) {
    return response.data;
  }
  notification.error({
      message: '错误提示',
      description: response.data,
  });
}

/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [params] The params we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */
export default function request(url, params) {
  let queryArray = [];
  for(let key in params){
    queryArray.push(key+'='+encodeURIComponent(params[key]));
  }
  let newUrl = url;
  if(url.indexOf('?')==-1){
    newUrl+='?'+queryArray.join('&');
  }else{
    newUrl+='&'+queryArray.join('&');
  }
  return fetch(newUrl)
    .then(parseJSON)
    .then(checkStatus)
    .catch(err => ({ err }));
}
