import axios from "axios";
import env from './config'
// import qs from 'qs'
import {message, notification} from 'ant-design-vue';
import {ref} from 'vue';
import router from '../router';
import i18n from "@/i18n";
const codeMessage = {
  200: i18n.global.t("axios_return_200"),
  201: i18n.global.t("axios_return_201"),
  202: i18n.global.t("axios_return_202"),
  204: i18n.global.t("axios_return_204"),
  400: i18n.global.t("axios_return_400"),
  401: i18n.global.t("axios_return_401"),
  403: i18n.global.t("axios_return_403"),
  404: i18n.global.t("axios_return_404"),
  406: i18n.global.t("axios_return_406"),
  410: i18n.global.t("axios_return_410"),
  422: i18n.global.t("axios_return_422"),
  500: i18n.global.t("axios_return_500"),
  502: i18n.global.t("axios_return_502"),
  503: i18n.global.t("axios_return_503"),
  504: i18n.global.t("axios_return_504"),
};

axios.defaults = {
  baseURL: env.BaseURL,
  method: "POST",
  timeout: 120*1000, //毫秒数,
  withCredentials: true,
  responseType: "json",
  responseEncoding: "utf8",
  headers: {'Content-Type': 'application/json; charset=utf-8'}
}

/**
 * 数据转换
 * @param data
 * @returns {string}
 */
const transformRequest = (data, config) => {
  if(! data) {
    return data
  }

  const contentType = config && config.headers  && config.headers['Content-Type']
    ? config.headers['Content-Type'] : axios.defaults.headers['Content-Type'];


  if (contentType === 'application/json') {
    return JSON.stringify(data)
  } else {
    //一般所有数据都通过JSON传输，但只有文件上传等是FormData, 这种直接原样传输
    // return qs.stringify(data);
    return  data;
  }
}

/**
 * 设置Token头
 */
axios.interceptors.request.use(config => {

  // const {getToken} = useSession()

  //写入请求Token
  // config.headers[env.TokenHeader] = getToken()

  // return config
})

/**
 * 发送前的其它设置
 * @param url
 * @param data
 * @returns {{}}
 */
function setDefaultAxiosConfig(url, data, config) {
  if(! config) {
    config = {}
  }
  if(! config.headers) {
    config.headers = {}
  }
  if(data instanceof FormData) {
    config.headers['Content-Type'] = 'application/x-www-form-urlencoded'
  }
  if(! config.timeout) {
    config.timeout = 300000;
  }
  return config
}

/**
 * 检查执行结果
 */
function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }

  const errortext = codeMessage[response.status] || response.statusText;
  const error = new Error(errortext);
  error.name = response.status;
  error.response = response;
  throw error;
}

const setLoadingTrue = (loading) => {
  if(loading) {
    loading.value = true;
  }
}

const setLoadingFalse = (loading) => {
  if(loading) {
    loading.value = false;
  }
}

function logerror(url, param, response) {
  if(! response || response.success !== true || response.code !== "0") {
    console.error("RequstURL Error: ", url, param, response)
  }
}

/**
 *
 * @param url
 * @param data
 * @param parseResponse  对返回的数据{code: } ， 通知code码是否做做错误判断和错误提示
 * @param method
 * @returns {Promise<postcss.Result|any|undefined>}
 */
async function request(url, data, parseResponse = true, method, loading, config) {
  url = env.ApiPrefix + url
  const requestConfig = config ||{}
  setDefaultAxiosConfig(url, data, requestConfig);

  //不用拦截器，因为拦载器拿不到自定义config
  const requestData = transformRequest(data)
  //设置loading状态
  setLoadingTrue(loading)

  return axios[method](url, requestData, requestConfig)
    .then(checkStatus)
    //具有正确执行结果时
    .then(resp => {
      const respData = resp.data

      logerror(url, data, respData);

      if(! parseResponse) {
        return respData
      }

      if(! respData.success && !requestData.redirect) {
        showError({message: `${i18n.global.t("axios_error_message_operate_fail")}: ${respData.message}`}, 'message');
      }

      return respData;
    })
    .catch((e) => {
      console.error("RequstURL Error: ", url, e, e.response)
      const errResp = (code, message) => {return {code, message, success: false}}

      //登录页面不再跳转
      if (window.location.href.indexOf("/login") >= 0) {
        let err = ""
        //错误提示
        if(e.response) {
          err = codeMessage[e.response.status] || i18n.global.t("axios_error_message_request_abnormal")
        } else {
          err = i18n.global.t("axios_error_message_request_abnormal")
        }
        showError({
          message: i18n.global.t("axios_error_message_request_abnormal"),
          description: err
        })
        return errResp(e.name, err);
      }

      if(e.response) {
        const status = e.response.status;
        const keys = "token-keys";
        if (status === 401) {  //没有登录
          if(keys){
            showError({
              message: i18n.global.t("axios_error_message_session_expiration"),
              description: i18n.global.t("axios_error_message_operate_session")
            })
          }
          router.push("/login")
          return errResp(status, i18n.global.t("axios_error_message_operate_session"))
        }
        if (status === 403) {  //已登录，但没有权限
          // router.push("/error/403")
          showError({
            message: i18n.global.t("axios_error_message_permission_error"),
            description: i18n.global.t("axios_error_message_no_permission")
          })
          if(url.indexOf("/menus") > 0) {
            router.push("/login");
          }
          return errResp(status, i18n.global.t("axios_error_message_no_permission"));
        }
        if (status >= 404 && status < 422) { //页面没找到
          showError({
            message: i18n.global.t("axios_error_message_request_error"),
            description: i18n.global.t("axios_error_message_request_no_exist"),
          });
          return errResp(status, e.name);
        }
      }

      if (e.name === "TypeError") { // 在出现OPTIONS请求CORS错误时会返回该名字
        showError({
          message: i18n.global.t("axios_error_message_request_error"),
          description: i18n.global.t("axios_error_message_server_error"),
        });
        return errResp(e.name, i18n.global.t("axios_error_message_server_error"));
      }

      if(e.message === 'Network Error'){
        showError({
          message: i18n.global.t("axios_error_message_request_error"),
          description: i18n.global.t("axios_error_message_network_error"),
        });
        return errResp(e.name, i18n.global.t("axios_error_message_network_error"));
      }

      //default
      // router.push("/error/500")
      showError({
        message: i18n.global.t("axios_error_message_server_deal_fail"),
        description: i18n.global.t("axios_error_message_later_retry"),
      });

      return errResp(e.name, i18n.global.t("axios_error_message_later_retry"));
    }).finally(() => {
      //设置loading为fals
      setLoadingFalse(loading)
    })

}

const errorStatus = ref(false);
const showError = (info, type) => {
  if(errorStatus.value)return;
  if(type === 'message'){
    message.error(info.message);
  }else{
    notification.error({
      message: info.message,
      description: info.description,
    });
  }
  errorStatus.value = true;
  setTimeout(()=>{
    errorStatus.value = false;
  }, 1000 * 15)
}

export  default class Http {
  /**
   *
   * @param url
   * @param data
   * @returns {Promise<*>}
   */
  static post(url, data, loading, config) {
    return request(url, data, true, 'post', loading, config)
  }
  static get(url, data, loading, config) {
    return request(url, data, true, 'get', loading, config)
  }
  static postOrig(url, data, loading, config) {
    return request(url, data, false, 'post', loading, config)
  }
  static getOrig(url, data, loading, config) {
    return request(url, data, false, 'get', loading, config)
  }

}
