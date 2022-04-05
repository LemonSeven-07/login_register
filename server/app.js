const express = require('express');
const bodyParser = require('body-parser');
const joi = require('joi');
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 8084;


const config = require('./config');
const portalRouter = require('./router/portal/index');
const homeRouter = require('./router/home/index');
const {schema} = require('./schema/index');
const {redis} = require('./db/redis');
const {createAuth} = require('./common/index');

redis.on("error", (err) => {
  return console.log("redis-connection-err: " + err);
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.urlencoded({ extended: true }));

app.use(function(req, res, next) {
  res.cc = function (data) {
    if(data.code === 200) {
      res.send({code: 200, data: null, state: 'success', ...data});
    }else if(data.code === 400) {
      res.send({code: 400, data: null, state: 'error', ...data});
    }else{
      res.send({...data});
    }
  };
  next()
});

app.use('/portal', portalRouter);

app.use(async function (req, res, next) {
  if(req.url.split('/')[1] === 'portal') {
    next();
  }else{
    const {accesstoken, refreshtoken} = req.headers;
    try {
      await schema.reg_token_schema.validateAsync({accessToken: accesstoken, refreshToken: refreshtoken});
      await jwt.verify(accesstoken, config.accessToken_jwtSecretKey, (err, decoded) => {
        if (err) {
          jwt.verify(refreshtoken, config.refreshToken_jwtSecretKey, (err, decoded) => {
            if(err) {
              return next('authFailure');
            }
            res.set({'Content-Type': 'application/json;charset=utf-8', ...createAuth()});
            next();
          })
        }
        next();
      });
    }catch (err) {
      return res.cc({code: 200, message: err.message});
    }
  }
});

app.use('/home', homeRouter);

// 定义错误级别的中间件
app.use((err, req, res, next) => {
  if(err === 'authFailure') return res.cc({code: 403, message: "身份认证过期，请重新登录"});
  // 验证失败导致的错误
  if(err instanceof joi.ValidationError) return res.cc({code: 400, data: null, message: err.message, state: 'error'});
  return res.cc({code: 400, data: null, message: '未知的错误', state: 'error'});
});

// 启动服务器
app.listen(port, () => {
  console.log(`login_register server running at http://xxx.xxx.xxx.xxx:${port}`)
});