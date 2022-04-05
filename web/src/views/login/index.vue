<template>
  <div class="login_container">
    <div class="login_box">
      <div class="avatar_box">
        <img src="../../assets/images/logo.png" alt="">
      </div>
      <!--登录/注册表单区域-->
      <component :is="componentUrl" class="login_form" @switchLogin="switchLogin"/>
    </div>
  </div>
</template>

<script>
  import quickLogin from "./quickLogin";
  import accountLogin from "./accountLogin";
  import emailRegistration from "./emailRegistration";
  export default {
    components:{
      quickLogin,
      accountLogin,
      emailRegistration
    },
    name: "index",
    data() {
      return {
        componentUrl: 'quickLogin',
      }
    },
    methods: {
      switchLogin(method) {
        this.componentUrl = method;
      }
    }
  }
</script>

<style lang="less" scoped>

</style>
