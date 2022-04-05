const jwt = require('jsonwebtoken');
const core = require('@alicloud/pop-core');
const nodemailer = require('nodemailer');

const config = require('../config');


// 解码
exports.decode = function(code) {
  let firstBuff = Buffer.from(code, 'base64');
  let firstStr = firstBuff.toString('utf-8');
  firstStr = firstStr.split("").reverse().join("");

  let againBuff = Buffer.from(firstStr, 'base64');
  let againStr = againBuff.toString('utf-8');
  return againStr;
};

// 生成 accessToken 和 refreshToken 的字符串
exports.createAuth = function() {
  const user = {
    phone: '',
    email: '',
    password: '',
    user_pic: '',
    phone_code_create: '',
    email_code_create: '',
    birthday: '',
    createTime: '',
    updateTime: ''
  };
  const accessToken = jwt.sign(user, config.accessToken_jwtSecretKey, {expiresIn: config.accessToken_expiresIn});
  const refreshToken = jwt.sign(user, config.refreshToken_jwtSecretKey, {expiresIn: config.refreshToken_expiresIn});
  return {accessToken, refreshToken}
};

// 格式化日期
exports.formatDate = function() {
  let date = new Date();
  let y = date.getFullYear();
  let MM = date.getMonth() + 1;
  MM = MM < 10 ? ('0' + MM) : MM;
  let d = date.getDate();
  d = d < 10 ? ('0' + d) : d;
  let h = date.getHours();
  h = h < 10 ? ('0' + h) : h;
  let m = date.getMinutes();
  m = m < 10 ? ('0' + m) : m;
  let s = date.getSeconds();
  s = s < 10 ? ('0' + s) : s;
  return y + '-' + MM + '-' + d + ' ' + h + ':' + m + ':' + s;
};

// 发送手机验证码短信所需的配置信息
exports.textingConfig = function(phone) {
  let code = Math.random().toString().slice(-6);
  let client = new core({
    accessKeyId: 'xxxxxxxxxxxx',
    accessKeySecret: 'xxxxxxxxxxxx',
    // securityToken: '<your-sts-token>', // use STS Token
    endpoint: 'https://dysmsapi.aliyuncs.com',
    apiVersion: '2017-05-25'
  });

  let params = {
    "SignName": "阿里云短信测试",
    "TemplateCode": "xxxxxxxxxxxx",
    "PhoneNumbers": phone,
    "TemplateParam": JSON.stringify({code})
  };

  let requestOption = {
    method: 'POST'
  };

  return {params, requestOption, client, code};
};

// 发送邮件
exports.sendEmailConfig = async function (email) {
  let code = Math.random().toString().slice(-6);
  try{
    let transporter = await nodemailer.createTransport({
      host: 'smtp.qq.com',
      secure: false,  // true for 465, false for other ports
      port: 25,
      auth: {
        user: 'xxxxxxxxxxxx',
        pass: 'xxxxxxxxxxxx'
      }
    });
    // 配置相关参数
    let option = {
      from: 'xxxxxxxxxx',
      to: email,
      subject: '[Serendipity] 重设密码用的电子邮箱',
      html: `<div>
              <span>这封邮件是您的密码重置请求。</span><br>
              <span>验证码：
                <span style="color: #409EFF">${code}</span>
              </span><br><br>
              <span>此验证码3分钟内有效，假如您没有请求过密码重置，请无视此电子邮件内容</span>
            </div>`
    };
    return {transporter, option, code}
  }catch (e) {
    console.log(e)
  }
};