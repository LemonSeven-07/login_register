const express = require('express');
const router = express.Router();
const expressJoi = require('@escook/express-joi');

const { schema } = require('../../schema/index');
const home_handler = require('./handle');


// 设置个人信息
router.post('/setUserInfo', expressJoi(schema.reg_setUserInfo_schema), home_handler.setUserInfo);

// 获取个人信息
router.get('/getUserInfo', expressJoi(schema.reg_getUserInfo_schema), home_handler.getUserInfo);

module.exports = router;