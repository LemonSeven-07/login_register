<template>
  <div>
    <el-form ref="accountLoginFormRef" :model="accountLoginForm" :rules="accountLoginFormRules" label-width="0px">
      <el-form-item>帐号密码登录</el-form-item>
      <!--用户名-->
      <el-form-item prop="account">
        <el-input
          prefix-icon="iconfont icon-user"
          placeholder="手机 / 邮箱"
          :validate-event="false"
          @input="inputFn('account', $event)"
          v-model="accountLoginForm.account">
        </el-input>
      </el-form-item>

      <!--密码-->
      <el-form-item prop="password">
        <el-input
          prefix-icon="iconfont icon-3702mima"
          placeholder="输入密码"
          :validate-event="false"
          @input="inputFn('password', $event)"
          v-model="accountLoginForm.password"
          type="password">
        </el-input>
      </el-form-item>

      <!--按钮区域-->
      <el-form-item style="margin-top: 28px; margin-bottom: 0">
        <el-button type="primary" style="width: 100%" @click="login">登录</el-button>
      </el-form-item>

      <el-form-item prop="" style="margin-bottom: 5px">
        <div style="display: flex; justify-content: space-between;">
          <el-button type="text" style="font-size: 12px" @click="quickLogin">验证码登录</el-button>
          <el-button type="text" style="font-size: 12px" @click="forgotPwd">忘记密码</el-button>
        </div>
      </el-form-item>

      <el-form-item prop="" style="margin-top: 25px; padding-bottom: 2px">
        <div style="font-size: 12px; text-align: center; color: rgba(60,60,67,0.6)">登录注册即代表同意《用户协议》和《隐私协议》</div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
  import http from '../../network/api'
  import {encrypt} from '../../common/js/encrypt'
  export default {
    name: "accountLogin",
    data() {
      return {
        accountLoginForm: {
          account: '',
          password: ''
        },
        accountLoginFormRules: {
          account: [
            { required: true,  message: '请输入手机号或邮箱', trigger: 'change' }
          ],
          password: [
            { required: true, message: '请输入密码', trigger: 'change' }
          ]
        }
      }
    },
    methods: {
      inputFn(str, e) {
        str === 'account' ? this.$refs.accountLoginFormRef.clearValidate('account') : this.$refs.accountLoginFormRef.clearValidate('password')
      },

      login() {
        let params = {
          account: this.accountLoginForm.account,
          password: encrypt(this.accountLoginForm.password)
        };
        this.$refs.accountLoginFormRef.validate(valid => {
          if(valid) {
            http.accountLoginAuth(params).then(res => {
              if(res.status === 200 && res.data.code === 200) {
                if(res.headers.accesstoken && res.headers.refreshtoken) {
                  localStorage.setItem('accessToken', res.headers.accesstoken);
                  localStorage.setItem('refreshToken', res.headers.refreshtoken);
                }
                localStorage.setItem('userId', res.data.id);
                localStorage.setItem('isLogin', true);
                this.$router.push('/account/home');
              }else{
                this.$message({message: res.data.message, center: true, type: 'error'});
              }
            })
          }
        })
      },

      quickLogin() {
        this.$emit('switchLogin', 'quickLogin');
      },

      forgotPwd() {
        this.$router.push('/account/password/reset');
      }
    },
  }
</script>

<style lang="less" scoped>
  .el-form {
    .el-form-item {
      margin-bottom: 16px;
    }
    .el-form-item:first-child {
      margin-top: -30px;
      /deep/.el-form-item__content {
        font-size: 20px;
      }
    }
  }
</style>
