const query = require('../../db/mysql');

// 设置个人信息
exports.setUserInfo = async (req, res) => {
  const {id, nickname, sex, birthday} = req.body;
  const querySql = 'select * from users where nickname=?';
  let queryData = await query(querySql, nickname);
  console.log(queryData)
  if(queryData.length) {
    return res.cc({code: 400, message: '该昵称已被占用'})
  }
  const updateSql = 'update users set nickname=?,sex=?,birthday=? where id=?';
  await query(updateSql, [nickname, sex, birthday, id]);
  return res.cc({code: 200})
};

// 获取个人信息
exports.getUserInfo = async (req, res) => {
  const {id} = req.query;
  const querySql = 'select * from users where id=?';
  const queryData = await query(querySql, id);
  const {phoneBound, email, nickname, sex, birthday} = queryData[0];
  const userInfo = {phoneBound, email, nickname, sex, birthday};
  return res.cc({code: 200, data: {...userInfo}});
};