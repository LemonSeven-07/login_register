import {request} from "./request";

const apis = {
  // 获取手机验证码
  getPhoneCode(params) {
    return request({url: '/portal/getPhoneCode', params})
  },

  // 手机号快捷登录
  quickLoginAuth(params) {
    return request({url: '/portal/quickLogin', method: 'post', data: {...params}})
  },

  // 账号密码登录
  accountLoginAuth(params) {
    return request({url: '/portal/accountLogin', method: 'post', data: {...params}})
  },

  // 邮箱地址注册
  emailRegistrationAuth(params) {
    return request({url: '/portal/emailRegistration', method: 'post', data: {...params}})
  },

  // 获取邮箱验证码
  getEmailCode(params) {
    return request({url: '/portal/getEmailCode', params})
  },
  // 重置密码前的手机号认证
  resetPwdPhoneAuth(params) {
    return request({url: '/portal/resetPwdPhoneAuth', method: 'post', data: {...params}})
  },

  // 重置密码前的邮箱地址认证
  resetPwdEmailAuth(params) {
    return request({url: '/portal/resetPwdEmailAuth', method: 'post', data: {...params}})
  },

  // 是否能绕开重置密码认证页面直接进入更改密码页面
  bypassResetPwdAuth(params) {
    return request({url: '/portal/bypassResetPwdAuth', method: 'post', data: {...params}})
  },

  // 更改密码
  changePassword(params) {
    return request({url: '/portal/changePassword', method: 'put', data: {...params}})
  },

  // 设置用户基本信息信息
  setUserInfo(params) {
    return request({url: '/home/setUserInfo', method: 'post', data: {...params}})
  },

  // 获取用户基本信息
  getUserInfo(params) {
    return request({url: '/home/getUserInfo', params})
  },
};
export default apis
