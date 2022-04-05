const bcrypt = require('bcryptjs');


const query = require('../../db/mysql');
const {checkPermission, redis} = require('../../db/redis');
const {decode, createAuth, formatDate, textingConfig, sendEmailConfig} = require('../../common/index');
const {schema} = require('../../schema/index');



// 获取手机验证码
exports.getPhoneCode = async (req, res) => {
  try {
    const { phone, phoneBound } = req.query;

    await schema.reg_getCode_schema.validateAsync({phone, phoneBound});

    const queryPhoneSql = 'select * from users where phone=?';
    const queryPhoneBoundSql = 'select * from users where phoneBound=?';
    const updateSql = 'update users set phoneCode_createTime=? where phone=?';
    const updateNewUserSql = 'update users set isRegister=? where phone=?';
    const insertSql = 'insert into users set ?';

    let queryData;
    if(phoneBound) {
      queryData = await query(queryPhoneBoundSql, phoneBound);
      if(!queryData.length) return res.cc({code: 400, message: '此手机号未分配给任何用户账号'});
    }else{
      queryData = await query(queryPhoneSql, phone);
      if(!queryData.length) {
        await query(insertSql, {phone});
        await query(updateNewUserSql, [true, phone]);
        queryData = await query(queryPhoneSql, phone);
      }
    }

    // 判断用户是否恶意获取手机验证码(条件：两次获取验证码的间隔时间小于60秒、同ip下连续获取)
    if((new Date).getTime() - ((queryData[0].phoneCode_createTime || 0) * 1) >= 60 * 1000) {
      const BLOCK_SUFFIX = '_phoneCode-blocked';
      // 限制同一个 IP 地址的频繁请求
      if (!await checkPermission(req.ip, BLOCK_SUFFIX)) {
        return res.cc({code: 400, message: '请求频繁，请稍后再试'});
      }

      // 发送手机验证码参数配置信息
      if(phoneBound) {
        var {params, requestOption, client, code} = textingConfig(phoneBound);
      }else{
        var {params, requestOption, client, code} = textingConfig(phone);
      }
      client.request('SendSms', params, requestOption).then((result) => {
        query(updateSql, [(new Date).getTime(), phone]).then(resolve => {
          if(phoneBound) {
            if(queryData[0].phone === queryData[0].phoneBound) {
              redis.setex(phoneBound +'_phoneCode', 180, bcrypt.hashSync(code, 12));
            }else{
              redis.setex(phoneBound +'_phoneBoundCode', 180, bcrypt.hashSync(code, 12));
            }
          }else{
            redis.setex(phone +'_phoneCode', 180, bcrypt.hashSync(code, 12));
          }
          return res.cc({code: 200, message: '短信发送成功'});
        })
      }, (ex) => {
        console.log(ex);
        return res.cc({code: 400, message: '短信发送失败'});
      });
    }else{
      return res.cc({code: 400, message: '请求频繁，请稍后再试'});
    }
  }catch (err) {
    return res.cc({code: 400, message: err.message});
  }
};


// 手机验证码登录 / 注册
exports.quickLogin = async (req, res) => {
  const { phone, code} = req.body;

  const bcryptPhoneCode = await redis.get(phone + '_phoneCode');
  if(!bcryptPhoneCode) return res.cc({code: 400, message: '验证码错误，请重新验证'});

  const queryPhoneSql = 'select * from users where phone=?';
  const updateNewUserSql = 'update users set nickname=?,createTime=?,updateTime=?,isRegister=?,loginStatus=? where phone=?';
  const updateSql = 'update users set updateTime=? where phone=?';

  let queryData = await query(queryPhoneSql, phone);
  const compareResult = bcrypt.compareSync(code, bcryptPhoneCode);
  if(compareResult) {
    let isRegister = queryData[0].isRegister;
    await redis.del(phone + '_phoneCode');
    if(queryData[0].isRegister) {   // 注册用户
      await query(updateNewUserSql, ['用户'+ (new Date).getTime(), formatDate(), formatDate(), false, true, phone]);
    }else{  // 登录用户
      await query(updateSql, [formatDate(), phone]);
    }

    let userInfo = await query(queryPhoneSql, phone);
    res.set({'Content-Type': 'application/json;charset=utf-8', ...createAuth()});
    return res.end(JSON.stringify({code: 200, message: '登录成功', isRegister: JSON.parse(isRegister), id: userInfo[0].id}));
  }else{
    return res.cc({code: 400, message: '验证码错误，请重新验证'});
  }
};


// 账号密码登录
exports.accountLogin = async (req, res) => {
  const {account, password} = req.body;

  const queryPhoneSql = 'select * from users where phoneBound=?';
  const queryIdSql = 'select * from users where id=?';
  const queryEmailSql = 'select * from users where email=?';

  let queryData, updateSql;
  if(account.indexOf('@') !== -1) {   // 邮箱账号登录
    updateSql = 'update users set updateTime=?,loginStatus=? where email=?';
    queryData = await query(queryEmailSql, account);
  }else{  // 手机号登录
    updateSql = 'update users set updateTime=?,loginStatus=? where phone=?';
    queryData = await query(queryPhoneSql, account);
  }

  if(queryData.length) {
    const compareResult = bcrypt.compareSync(decode(password), queryData[0].password);
    if(compareResult) {
      await query(updateSql, [formatDate(), true, account]);

      let userInfo = await query(queryIdSql, queryData[0].id);
      res.set({'Content-Type': 'application/json;charset=utf-8', ...createAuth()});
      return res.end(JSON.stringify({code: 200, message: '登录成功', id: userInfo[0].id}));
    }else{
      return res.cc({code: 400, message: '用户名或密码错误'});
    }
  }else{
    return res.cc({code: 400, message: '用户名或密码错误'});
  }
};


// 邮箱注册
exports.emailRegistration = async (req, res) => {
  try{
    const {email, password} = req.body;

    await schema.reg_emailRegistration_schema.validateAsync({email, password: decode(password)});

    const bcryptPassword = bcrypt.hashSync(decode(password), 12);

    const queryEmailSql = 'select * from users where email=?';
    const updateSql = 'update users set nickname=?,createTime=?,updateTime=?,loginStatus=? where email=?';
    const insertSql = 'insert into users set ?';

    const queryData = await query(queryEmailSql, email);
    if(queryData.length) {
      return res.cc({code: 400, message: '邮箱地址已存在'});
    }

    await query(insertSql, {email, password: bcryptPassword});
    await query(updateSql, ['用户'+ (new Date).getTime(), formatDate(), formatDate(), true, email]);

    let userInfo = await query(queryEmailSql, email);
    res.set({'Content-Type': 'application/json;charset=utf-8', ...createAuth()});
    return res.end(JSON.stringify({code: 200, message: '注册成功', id: userInfo[0].id}));
  }catch (err) {
    return res.cc({code: 400, message: err.message});
  }
};


// 获取邮箱验证码
exports.getEmailCode = async (req, res) => {
  const {email} = req.query;

  const queryEmailSql = 'select * from users where email=?';
  const updateSql = 'update users set emailCode_createTime=? where email=?';

  const queryData = await query(queryEmailSql, email);
  if(!queryData.length) return res.cc({code: 400, message: '此邮箱地址未分配给任何用户账号'});

  if((new Date).getTime() - ((queryData[0].emailCode_createTime || 0) * 1) >= 60 * 1000) {
    const BLOCK_SUFFIX = '_emailCode-blocked';    // 过期ip的后缀名
    if (!await checkPermission(req.ip, BLOCK_SUFFIX)) {
      return res.cc({code: 400, message: '请求频繁，请稍后再试'});
    }

    // 获取发送邮件的参数和配置
    let {transporter, option, code} = await sendEmailConfig(email);
    await transporter.sendMail(option, async function (err, msg) {
      if(err) {
        console.log(err);
      }else{
        await query(updateSql, [(new Date).getTime(), email]);
        await redis.setex(email +'_emailCode', 180, bcrypt.hashSync(code, 12));
        // 关闭 SMTP 连接
        transporter.close();
        return res.cc({code: 200, message: msg});
      }
    });
  }else{
    return res.cc({code: 400, message: '请求频繁，请稍后再试'});
  }
},


// 重置密码前的手机号认证
exports.resetPwdPhoneAuth = async (req, res) => {
  const {phoneBound, code} = req.body;

  const queryPhoneBoundSql = 'select * from users where phoneBound=?';
  let queryData = await query(queryPhoneBoundSql, phoneBound);
  if(!queryData.length) return res.cc({code: 400, message: '验证码错误，请重新验证'});
  let bcryptPhoneBoundCode;
  if(queryData[0].phone === queryData[0].phoneBound) {
    bcryptPhoneBoundCode = await redis.get(phoneBound + '_phoneCode');
    // 认证成功后移除手机验证码，保证认证后验证码的唯一性
    await redis.del(phoneBound + '_phoneCode');
  }else{
    bcryptPhoneBoundCode = await redis.get(phoneBound + '_phoneBoundCode');
    await redis.del(phoneBound + '_phoneBoundCode');
  }

  if(!bcryptPhoneBoundCode) return res.cc({code: 400, message: '验证码错误，请重新验证'});

  const compareResult = bcrypt.compareSync(code, bcryptPhoneBoundCode);
  if(compareResult) {
    // 将用户id和手机验证码进行绑定，生成唯一标识并存储(防止恶意用户手动输入地址直接进入页面更改密码)
    await redis.set('uniqueSignal', queryData[0].id + code);
    return res.cc({code: 200, id: queryData[0].id});
  }
  return res.cc({code: 400, message: '验证码错误，请重新验证'});
};


// 重置密码前的邮箱地址认证
exports.resetPwdEmailAuth = async (req, res) => {
  const {email, code} = req.body;

  const querySql = 'select * from users where email=?';
  let queryData = await query(querySql, email);
  if(!queryData.length) return res.cc({code: 400, message: '验证码错误，请重新验证'});

  const bcryptEmailCode = await redis.get(email + '_emailCode');
  if(!bcryptEmailCode) return res.cc({code: 400, message: '验证码错误，请重新验证'});

  const compareResult = bcrypt.compareSync(code, bcryptEmailCode);
  if(compareResult) {
    await redis.del(email +'_emailCode');
    await redis.set('uniqueSignal', queryData[0].id + code);
    return res.cc({code: 200, id: queryData[0].id});
  }
  return res.cc({code: 400, message: '验证码错误，请重新验证'});
};


// 前端是否能绕开重置密码认证页面直接进入更改密码页面
exports.bypassResetPwdAuth = async (req, res) => {
  const {uniqueSignal} = req.body;
  // 防止唯一标识被伪造
  if(await redis.get('uniqueSignal') === uniqueSignal) return res.cc({code: 200});
  return res.cc({code: 400});
};


// 更改密码
exports.changePassword = async (req, res) => {
  try{
    const {uniqueSignal, newPassword, repeatPassword} = req.body;

    await schema.reg_changePassword_schema.validateAsync({uniqueSignal, newPassword: decode(newPassword), repeatPassword: decode(repeatPassword)});
    if(newPassword !== repeatPassword) return res.cc({code: 400, message: '每次输入的密码必须相同'});

    if(await redis.get('uniqueSignal') === uniqueSignal) {
      const id = uniqueSignal.slice(0, -6);
      const updateSql = 'update users set password=? where id=?';
      const bcryptPwd = bcrypt.hashSync(decode(newPassword), 12);
      await query(updateSql, [bcryptPwd, id]);
      await redis.del('uniqueSignal');
      return res.cc({code: 200, message: '更改成功'});
    }
    return res.cc({code: 400, message: '更改失败'});
  }catch(err) {
    return res.cc({code: 400, message: err.message})
  }
};


