<template>
  <div>
    <el-form ref="emailRegistrationFormRef" :model="emailRegistrationForm" :rules="emailRegistrationFormRules" label-width="0px">
      <el-form-item>邮箱注册</el-form-item>

      <el-form-item prop="address" style="margin-bottom: 16px">
        <el-input
          prefix-icon="iconfont icon-youxiang"
          placeholder="输入邮箱"
          :validate-event="false"
          @blur="focusFn"
          @input="inputFn('address', $event)"
          v-model="emailRegistrationForm.address">px
        </el-input>
      </el-form-item>

      <el-form-item prop="password">
        <el-input
          prefix-icon="iconfont icon-3702mima"
          placeholder="输入密码"
          :validate-event="false"
          @input="inputFn('password', $event)"
          v-model="emailRegistrationForm.password"
          type="password">
        </el-input>
      </el-form-item>

      <el-form-item style="margin-top: 28px;margin-bottom: 0">
        <el-button type="primary" style="width: 100%" @click="registration">注册</el-button>
      </el-form-item>

      <el-form-item style="margin-top: 0; margin-bottom: 0">
        <el-button type="text" style="width: 100%" @click="codeLogin">验证码登录</el-button>
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
    name: "emailRegistration",
    data() {
      var checkAddress = (rule, value, cb) => {
        const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/;
        if (regEmail.test(value)) {
          return cb();
        } else {
          cb(new Error('邮箱地址不合法'))
        }
      };
      return {
        emailRegistrationForm: {
          address: '',
          password: ''
        },
        emailRegistrationFormRules: {
          address: [
            {required: true, message: '请输入邮箱', trigger: 'blur'},
            // 自定义规则校验
            {validator: checkAddress, trigger: 'change'}
          ],
          password: [
            { required: true, message: '请输入密码', trigger: 'change' },
            { pattern: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/, message: '密码必须包含大小写字母和数字的组合，可以使用特殊字符，长度在6-20之间', trigger: 'blur' }
          ]
        }
      }
    },
    methods: {
      focusFn() {
        if(this.emailRegistrationForm.address.length) {
          this.$refs.emailRegistrationFormRef.validateField('address')
        }
      },
      inputFn(str, e) {
        str === 'address' ? this.$refs.emailRegistrationFormRef.clearValidate('address') : this.$refs.emailRegistrationFormRef.clearValidate('password')
      },
      registration() {
        let params = {
          email: this.emailRegistrationForm.address,
          password: encrypt(this.emailRegistrationForm.password)
        };
        this.$refs.emailRegistrationFormRef.validate(valid => {
          if(valid) {
            http.emailRegistrationAuth(params).then(res => {
              if(res.status === 200 && res.data.code === 200) {
                if(res.headers.accesstoken && res.headers.refreshtoken) {
                  localStorage.setItem('accessToken', res.headers.accesstoken);
                  localStorage.setItem('refreshToken', res.headers.refreshtoken);
                }
                localStorage.setItem('userId', res.data.id);
                localStorage.setItem('isLogin', true);
                this.$router.push('/account/login/registerInfo');
              }else{
                this.$message({message: res.data.message, center: true, type: 'error'});
              }
            })
          }
        })
      },
      codeLogin() {
        this.$emit('switchLogin', 'quickLogin')
      }
    }
  }
</script>

<style lang="less" scoped>
  .el-form {
    .el-form-item:first-child {
      margin-top: -30px;

      /deep/ .el-form-item__content {
        font-size: 20px;
      }
    }
  }
</style>
