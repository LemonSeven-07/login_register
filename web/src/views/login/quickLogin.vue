<template>
  <div>
    <el-form :model="quickLoginForm" ref="quickLoginFormRef" :rules="quickLoginFormRules" label-width="0px">
      <el-form-item prop="phone" style="margin-bottom: 16px">
        <el-input placeholder="输入手机号" v-model="quickLoginForm.phone" @blur="focusFn" @input="inputFn('phone', $event)" :validate-event="false">
          <el-select v-model="quickLoginForm.phonePrefix" slot="prefix">
            <el-option v-for="item in prefixList"
                       :key="item.id"
                       :label="item.areaCode"
                       :value="item.areaCode"
                       :disabled="item.disabled">
              <span>{{'(' + item.areaCode + ')' + item.area}}</span>
            </el-option>
          </el-select>
        </el-input>
      </el-form-item>

      <el-form-item prop="code" style="margin-bottom: 0">
        <el-input placeholder="验证码" v-model="quickLoginForm.code" @input="inputFn('code', $event)" :validate-event="false">
          <el-button type="text" slot="suffix" @click="checkPractice" :class="isGetCode && state === 0 ? 'getCode_active' : ''">
            <span>{{state === 0 ? '获取验证码' : (state === 1 ? '发送中' : countDown + ' 秒后可重发')}}</span>
            <i class="el-icon-loading" style="margin-left: 5px" v-if="state === 1"></i>
          </el-button>
        </el-input>
      </el-form-item>

      <el-form-item prop="" style="margin-top: 16px; margin-bottom: 0" v-if="isShow">
        <slide-verification @manualVerification="manualVerification"/>
      </el-form-item>

      <el-form-item prop="" style="margin-top: 28px; margin-bottom: 0">
        <el-button type="primary" @click="login" style="width: 100%">登录 / 注册</el-button>
      </el-form-item>

      <el-form-item prop="" style="margin-bottom: 5px">
        <div style="display: flex; justify-content: space-between;">
          <el-button type="text" style="font-size: 12px" @click="switchLogin('account')">账号密码登录</el-button>
          <el-button type="text" style="font-size: 12px" @click="switchLogin('email')">邮箱注册</el-button>
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
  import {prefixList} from '../../common/js/const'
  import accountLogin from "./accountLogin";
  import slideVerification from "../../components/slideVerification";
  export default {
    name: "quickLogin",
    components: {
      slideVerification
    },
    data() {
      var checkphone = (rule, value, cb) => {
        const regMobile = /^(0|86|17951)?(13[0-9]|15[0123456789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
        if (regMobile.test(value)) {
          return cb()
        } else {
          cb(new Error('请输入正确的手机号'))
        }
      };
      return {
        quickLoginForm: {
          phone: '',
          phonePrefix: '+86',
          code: ''
        },
        prefixList: prefixList,
        quickLoginFormRules: {
          phone: [
            {validator: checkphone, trigger: 'blur'}
          ],
          code: [
            {required: true, message: '请输入验证码', trigger: 'change'},
            {pattern: /^[0-9]*$/, message: '验证码格式有误', trigger: 'change'}
          ]
        },
        isGetCode: false,
        state: 0,
        countDown: 60,
        value1: 0,
        isPass: false,
        isShow: false
      }
    },
    created() {
      this.$store.getters.getPhoneCodeCount;
    },
    methods: {
      // 修改验证规则触发条件
      focusFn() {
        if(this.quickLoginForm.phone.length) {
          this.$refs.quickLoginFormRef.validateField('phone');
        }
      },
      inputFn(str, e) {
        if(str === 'phone') {
          this.$refs.quickLoginFormRef.clearValidate('phone');
          const pattern = /^(0|86|17951)?(13[0-9]|15[0123456789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;
          pattern.test(e) ? this.isGetCode = true : this.isGetCode = false;
        }else{
          e ? this.$refs.quickLoginFormRef.validateField('code') : this.$refs.quickLoginFormRef.clearValidate('code');
        }
      },
      manualVerification() {
        this.isPass = true;
        setTimeout(() => {
          this.checkPractice();
        }, 500)
      },

      // 获取手机验证码
      checkPractice() {
        if(this.$store.state.phoneCodeCount >= 3) {
          this.isShow = true;
          if(this.isPass) {
            this.isShow = false;
            this.isPass = false;
            this.getPhoneCode();
          }
        }else{
          this.getPhoneCode();
        }
      },
      getPhoneCode() {
        if(this.state === 0 && this.isGetCode) {
          let params = {
            phone: this.quickLoginForm.phone,
          };
          this.state = 1;
          http.getPhoneCode(params).then(res => {
            if(res.status === 200 && res.data.code === 200) {
              this.state = 2;
              this.$store.commit('add');
              let inter = setInterval(() => {
                this.countDown --;
                if(this.countDown <= 0) {
                  this.state = 0;
                  this.countDown = 60;
                  clearInterval(inter);
                }
              }, 1000);
            }else{
              this.state = 0;
              this.$message({message: res.data.message, center: true, type: 'error'});
            }
          })
        }
      },

      // 快捷登录
      login() {
        this.$refs.quickLoginFormRef.validate(valid => {
          if(valid) {
            http.quickLoginAuth(this.quickLoginForm).then(res => {
              if(res.status === 200 && res.data.code === 200) {
                if(res.headers.accesstoken && res.headers.refreshtoken) {
                  localStorage.setItem('accessToken', res.headers.accesstoken);
                  localStorage.setItem('refreshToken', res.headers.refreshtoken);
                }
                localStorage.setItem('isLogin', true);
                localStorage.setItem('userId', res.data.id);
                localStorage.removeItem('phoneCodeCount');
                this.$store.state.phoneCodeCount = 0;
                if(res.data.isRegister) {
                  this.$router.push('/account/login/registerInfo');
                }else{
                  this.$router.push('/account/home');
                }
              }else{
                this.$message({message: res.data.message, center: true, type: 'error'});
              }
            })
          }
        })
      },

      // 切换登录/注册方式
      switchLogin(method) {
        method === 'account' ? this.$emit('switchLogin','accountLogin') : this.$emit('switchLogin','emailRegistration');
      }
    }
  }
</script>

<style lang="less" scoped>
  .el-form {
    /deep/.el-form-item:first-child .el-input {
      >.el-input__inner {
        padding-left: 90px;
      }
      .el-input__prefix {
        width: 75px;
        left: 0;
        .el-select .el-input__inner {
          height: 16px;
          margin: 12px 2px;
          padding: 0 0 0 10px !important;
          border-radius: 0;
          border-left: none;
          border-top: none;
          border-bottom: none;
          border-right-width: 2px;
          border-right-color: #DCDFE6 !important;
        }
      }
    }
    /deep/.el-form-item:nth-child(2) .el-input {
      .el-input__inner {
        padding-right: 80px;
      }
      .el-button {
        color: rgba(60, 60, 67, 0.6);
        cursor: text;
      }
    }
  }
  .getCode_active {
    color: #409EFF !important;
    cursor: pointer !important;
  }
</style>
