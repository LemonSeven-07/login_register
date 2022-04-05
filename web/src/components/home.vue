<template>
  <el-card>
    <el-descriptions title="用户信息">
      <el-descriptions-item label="手机号">{{userInfo.phoneBound}}</el-descriptions-item>
      <el-descriptions-item label="邮箱">{{userInfo.email}}</el-descriptions-item>
      <el-descriptions-item label="昵称">{{userInfo.nickname}}</el-descriptions-item>
      <el-descriptions-item label="性别">{{userInfo.sex}}</el-descriptions-item>
      <el-descriptions-item label="出生年月">{{formatDate(userInfo.birthday)}}</el-descriptions-item>
    </el-descriptions>
  </el-card>
</template>

<script>
  import http from "../network/api";

  export default {
    name: "Welcome",
    data() {
      return {
        userInfo: {}
      }
    },
    mounted() {
      this.getDataListFn();
    },
    methods: {
      getDataListFn() {
        let params = {id: localStorage.getItem('userId')};
        http.getUserInfo(params).then(res => {
          if(res.status === 200 && res.data.code === 200) {
            this.userInfo = res.data.data || {};
          }else{
            this.$notify.error({title: '失败', message: res.data.message});
          }
        })
      },
      formatDate(val) {
        let date = new Date(val);
        let y = date.getFullYear();
        let MM = date.getMonth() + 1;
        MM = MM < 10 ? ('0' + MM) : MM;
        let d = date.getDate();
        d = d < 10 ? ('0' + d) : d;
        return y + '-' + MM + '-' + d;
      }
    },
    beforeRouteLeave(to, from, next){
      if(to.path ==='/account/login/registerInfo' ){
        next('/account/login');
      }else {
        next();
      }
    },
  }
</script>
<style lang="less" scoped>
  .el-card {
    width: 800px;
    height: 200px;
    margin: 0 auto;
    position: relative;
    top: 20%;
    box-shadow: 0 1px 1px rgba(0, 0, 0, .1) ;
  }
</style>

