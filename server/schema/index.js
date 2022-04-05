const joi = require('joi')

// 验证规则
const accessToken = joi.string().required();
const refreshToken = joi.string().required();
const phone = joi.string().pattern(/^(0|86|17951)?(13[0-9]|15[0123456789]|17[678]|18[0-9]|14[57])[0-9]{8}$/);
const phoneBound = joi.string().pattern(/^(0|86|17951)?(13[0-9]|15[0123456789]|17[678]|18[0-9]|14[57])[0-9]{8}$/);
const phone_login = joi.string().required().pattern(/^(0|86|17951)?(13[0-9]|15[0123456789]|17[678]|18[0-9]|14[57])[0-9]{8}$/);
const phoneBound_auth = joi.string().required().pattern(/^(0|86|17951)?(13[0-9]|15[0123456789]|17[678]|18[0-9]|14[57])[0-9]{8}$/);
const phone_code = joi.string().required();
const email_code = joi.string().required();
const account = joi.string().required();
const password = joi.string().required().pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/);
const email = joi.string().required().pattern(/^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/);
const nickname = joi.string().required().pattern(/^[\u0391-\uFFE5A-Za-z0-9_-]{4,12}$/);
const sex = joi.string().required();
const birthday = joi.string().required();
const userId = joi.number().required();
const uniqueSignal = joi.string().required();


exports.schema = {
  // 身份认证参数规则
  reg_token_schema: joi.object({accessToken, refreshToken}),

  // 获取手机验证码参数规则(请求参数为 phone 或 phoneBound)
  reg_getCode_schema: joi.object({phone, phoneBound}).or('phone', 'phoneBound'),

  // 手机验证码登录 / 注册参数规则
  reg_quickLogin_schema: {
    body: {
      phone: phone_login,
      code: phone_code
    }
  },

  // 账号密码登录参数规则
  reg_accountLogin_schema: {
    body: {
      account,
      password,
    }
  },

  // 邮箱注册登录参数规则
  reg_emailRegistration_schema: joi.object({email, password}),

  // 获取邮箱验证码参数规则
  reg_getEmailCode_schema: {
    query: {
      email
    }
  },

  // 重置密码前的手机号认证参数规则
  reg_resetPwdPhoneAuth_schema: {
    body: {
      phoneBound: phoneBound_auth,
      code: phone_code
    }
  },

  // 重置密码前的邮箱地址认证参数规则
  reg_resetPwdEmailAuth_schema: {
    body: {
      email,
      code: email_code
    }
  },

  // 设置个人信息参数规则
  reg_setUserInfo_schema: {
    body: {
      id: userId,
      nickname,
      sex,
      birthday
    }
  },

  // 获取个人信息参数规则
  reg_getUserInfo_schema: {
    query: {
      id: userId,
    },
  },

  // 前端是否能绕开重置密码认证页面直接进入更改密码页面参数规则
  reg_bypassResetPwdAuth_schema: {
    body: {
      uniqueSignal
    },
  },

  // 更改密码参数规则
  reg_changePassword_schema: joi.object({uniqueSignal, newPassword: password, repeatPassword: password}),
}