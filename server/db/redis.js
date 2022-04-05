const ioredis = require('ioredis');

const EXPIRE_SECOND = 120;
const LIMIT_RATE = 5;
const BLOCK_SECOND = 1800;

const redis = new ioredis({
  port: process.env.REDIS_PORT || 6379,
  host: 'xxx.xxx.xxx.xxx',
  password: "123456",
  family: 4, // 4 (IPv4) or 6 (IPv6)
  db: 0,
});


async function checkPermission(ip, BLOCK_SUFFIX) {
  if (await isBlocked(ip, BLOCK_SUFFIX)) {
    return false
  }

  if (await isOverLimit(ip)) {
    try {
      await doBlock(ip, BLOCK_SUFFIX);
    } catch (err) {
      throw err;
    }
    return false
  }
  return true
}

async function isBlocked(ip, BLOCK_SUFFIX) {
  return (await redis.get(ip + BLOCK_SUFFIX)) > 0;
}

async function isOverLimit(ip) {
  let res
  try {
    res = await redis.incr(ip)
  } catch (err) {
    throw err;
  }

  console.log(`${ip} has value: ${res}`);

  if (res > LIMIT_RATE) {
    return true
  }
  redis.expire(ip, EXPIRE_SECOND);
}

async function doBlock(ip, BLOCK_SUFFIX) {
  let res;
  try {
    res = await redis.set(ip + BLOCK_SUFFIX, 1, 'ex', BLOCK_SECOND);
  } catch (err) {
    throw err
  }

  console.log(`${ip} has bend blocked: ${res}`)
}


module.exports = {
  checkPermission,
  redis,
};
