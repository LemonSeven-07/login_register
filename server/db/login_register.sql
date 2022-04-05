/*
SQLyog Ultimate v10.00 Beta1
MySQL - 5.5.27 : Database - login_register
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`login_register` /*!40100 DEFAULT CHARACTER SET utf8 */;

USE `login_register`;

/*Table structure for table `users` */

DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '用户信息的唯一标识',
  `phone` char(11) DEFAULT NULL COMMENT '电话号码',
  `phoneBound` char(11) DEFAULT NULL COMMENT '绑定后的手机号',
  `email` varchar(64) DEFAULT NULL COMMENT '邮箱',
  `password` varchar(255) DEFAULT NULL COMMENT '登录密码',
  `nickname` varchar(16) DEFAULT NULL COMMENT '昵称',
  `sex` enum('男','女') DEFAULT NULL COMMENT '性别',
  `birthday` date DEFAULT NULL COMMENT '出生年月',
  `user_pic` varchar(255) DEFAULT NULL COMMENT '用户头像',
  `createTime` datetime DEFAULT NULL COMMENT '账号创建日期',
  `updateTime` datetime DEFAULT NULL COMMENT '最近一次的登录日期',
  `phoneCode_createTime` varchar(255) DEFAULT '0' COMMENT '手机验证码创建时间(毫秒)',
  `emailCode_createTime` varchar(255) DEFAULT '0' COMMENT '邮箱验证码创建时间(毫秒)',
  `isRegister` tinyint(1) DEFAULT '0' COMMENT '1: 手机号验证码注册并登录，0: 手机号验证码直接登录',
  `loginStatus` tinyint(1) DEFAULT '0' COMMENT '登录状态(1：在线；0：登出)',
  `accountType` tinyint(1) DEFAULT '0' COMMENT '账号类型(1：超管；0：普通用户)',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`) COMMENT 'id唯一',
  UNIQUE KEY `phone` (`phone`) USING BTREE COMMENT '用户注册的手机号码唯一',
  UNIQUE KEY `nickname` (`nickname`) COMMENT '昵称唯一',
  UNIQUE KEY `email` (`email`) COMMENT '邮箱唯一',
  UNIQUE KEY `phoneBound` (`phoneBound`)
) ENGINE=InnoDB AUTO_INCREMENT=90 DEFAULT CHARSET=utf8 COMMENT='用户信息表';

/*Data for the table `users` */

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
