import Vue from 'vue';
import VueRouter from 'vue-router';

import http from '../network/api'
import store from '../store/index'


Vue.use(VueRouter);

const login = () => import('../views/login/index');
const resetPassword = () => import('../views/login/resetPassword');
const setPassword = () => import('../views/login/setPassword');
const registerInfo = () => import('../views/login/registerInfo');
const home = () => import('../components/home');


const routes = [{
  path: '/',
  redirect: '/account/login', //重定向到登录界面
  },
  {
    path: '/account/login',
    component: login,   // 登录页
  },
  {
    path: '/account/login/registerInfo',
    component: registerInfo   // 注册后的个人信息表单页
  },
  {
    path: '/account/password/reset',
    component: resetPassword  // 忘记密码
  },
  {
    path: '/account/password/reset/key/:key',
    component: setPassword   // 更改密码
  },
  {
    path: '/account/home',
    component: home
  }
];

const router = new VueRouter({
  routes,
  mode: 'hash',
  base: process.env.BASE_URL,
});


router.beforeEach( async (to, from, next) => {
  let noLoginPage = ['/', '/account/login', '/account/password/reset'];
  let index = noLoginPage.findIndex(item => item === to.path);
  if(index !== -1) {
    next();
  }else{
    let arr = to.path.split('/account/password/reset/key/');
    let accessToken = localStorage.getItem('accessToken');
    let refreshToken = localStorage.getItem('refreshToken');
    if(arr.length === 2 && arr[0].length === 0) {
      http.bypassResetPwdAuth({uniqueSignal: arr[1]}).then(res => {
        if(res.status === 200 && res.data.code === 200) {
          store.state.isShow = true;
        }else{
          store.state.isShow = false;
        }
        next();
      });
    }else{
      if(accessToken && refreshToken) {
        next();
      }else{
        next('/account/login');
      }
    }
  }
});

const originalReplace = VueRouter.prototype.replace;
VueRouter.prototype.replace = function replace(location) {
  return originalReplace.call(this, location).catch(err => err);
};

const originalPush = VueRouter.prototype.push;
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err);
};

export default router
