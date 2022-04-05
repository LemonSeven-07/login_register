import axios from 'axios';

export function request(config) {
  // 创建axios实例
  const instance = axios.create({
    baseURL: '/serendipity-web',
    timeout: 5000
  });

  // axios 请求拦截
  instance.interceptors.request.use(config => {
    if(config.url.split('/')[1] !== 'portal') {
      config.headers.accessToken = localStorage.getItem('accessToken');
      config.headers.refreshToken = localStorage.getItem('refreshToken');
    }
    return config;
  }, err => {
    console.log(err);
 });

  // axios 响应拦截
  instance.interceptors.response.use(res => {
    if(res.headers.accesstoken && res.headers.refreshtoken) {
      const isLogin = localStorage.getItem('isLogin');
      if(isLogin) {
        localStorage.setItem('accessToken', res.headers.accesstoken);
        localStorage.setItem('refreshToken', res.headers.refreshtoken);
      }
    }
    if(res.data.code === 403) {
      setTimeout(() => {
        localStorage.clear();
        window.location.href = '/';
      }, 500);
    }
    return res;
  }, err => {
    console.log(err);
  })

  return instance(config);
}
