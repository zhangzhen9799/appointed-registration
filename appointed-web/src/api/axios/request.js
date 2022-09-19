import axios from 'axios';
import router from '@/router';

axios.defaults.headers['Content-Type'] = 'application/json;charset=utf-8';
// 创建axios实例 axios.create([config])
const service = axios.create({
  // axios中请求配置有baseURL选项，表示请求URL公共部分
  baseURL: '',
  // 超时
  timeout: 30000
});
// request拦截器
service.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    token && (config.headers.Authorization = 'Bearer ' + token);
    // 这一步操作是将写请求方法里面的参数 优先级最高
    if (config.data && config.data.header) {
      config.headers = {
        ...config.headers,
        ...config.data.header
      };
    }
    return config;
  },
  (error) => {
    console.log(error);
    Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (res) => {
    // 未设置状态码则默认成功状态
    console.log('============res.data', res);
    //  const code = res.data.code || 200;
    // 获取错误信息
    return res.data;
  },
  (error) => {
    console.log('err', error);
    let { message } = error;
    console.log('======message', message);
    if (message == 'Network Error') {
      message = '后端接口连接异常';
    } else if (message.includes('timeout')) {
      message = '系统接口请求超时';
    } else if (
      message.includes('Request failed with status code') &&
      message.includes('400')
    ) {
      // message = '系统接口' + message.substr(message.length - 3) + '异常';
    }
    router.push({ name: 'Login' });
    return Promise.reject(error);
  }
);
export default service;
