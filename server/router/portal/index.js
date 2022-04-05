const express = require('express');
const router = express.Router();

const portal_handler = require('./handle');

const expressJoi = require('@escook/express-joi');
const { schema } = require('../../schema/index');


// 获取手机验证码
router.get('/getPhoneCode', portal_handler.getPhoneCode);
// 手机验证码登录 / 注册
router.post('/quickLogin', expressJoi(schema.reg_quickLogin_schema), portal_handler.quickLogin);
// 账号密码登录
router.post('/accountLogin', expressJoi(schema.reg_accountLogin_schema), portal_handler.accountLogin);
// 邮箱注册
router.post('/emailRegistration', portal_handler.emailRegistration);
// 获取邮箱验证码
router.get('/getEmailCode', expressJoi(schema.reg_getEmailCode_schema), portal_handler.getEmailCode);
// 重置密码前的手机号认证
router.post('/resetPwdPhoneAuth', expressJoi(schema.reg_resetPwdPhoneAuth_schema), portal_handler.resetPwdPhoneAuth);
// 重置密码前的邮箱地址认证
router.post('/resetPwdEmailAuth', expressJoi(schema.reg_resetPwdEmailAuth_schema), portal_handler.resetPwdEmailAuth);
// 前端是否能绕开重置密码认证页面直接进入更改密码页面
router.post('/bypassResetPwdAuth', expressJoi(schema.reg_bypassResetPwdAuth_schema), portal_handler.bypassResetPwdAuth);
// 更改密码
router.put('/changePassword', portal_handler.changePassword);


module.exports = router;