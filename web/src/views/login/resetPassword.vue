<template>
  <div class="login_container">
    <div class="login_box">
      <el-form ref="resetPasswordFormRef" :model="resetPasswordForm" :rules="resetPasswordFormRules" class="login_form" label-width="0px">
        <el-form-item style="margin-bottom: 0"><h3 style="color: rgba(0,0,0,0.8);font-weight: 500;font-size: 24px">重新设置密码</h3></el-form-item>

        <el-form-item><el-divider></el-divider></el-form-item>

        <el-form-item style="margin-bottom: 16px">
          <div v-if="resetMode === 'phone'">忘记密码了？请输入您的11位手机号，我们会发送短信验证码到您手机。</div>
          <div v-if="resetMode === 'email'">忘记密码了？请输入您的电子邮箱，我们会发送邮箱验证码到您邮箱。</div>
        </el-form-item>

        <el-form-item style="margin-bottom: 16px">
          <el-radio-group v-model="resetMode" @change="switchCheck">
            <el-radio label="phone">用手机号重设</el-radio>
            <el-radio label="email">用邮箱重设</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item prop="phone" v-if="resetMode === 'phone'" style="margin-bottom: 16px">
          <el-input placeholder="手机号" v-model="resetPasswordForm.phone" @blur="focusFn('phone')" @input="inputFn('phone', $event)" :validate-event="false"/>
        </el-form-item>

        <el-form-item prop="email" v-if="resetMode === 'email'" style="margin-bottom: 16px">
          <el-input placeholder="电子邮件地址" v-model="resetPasswordForm.email" @blur="focusFn('email')" @input="inputFn('email', $event)" :validate-event="false"/>
        </el-form-item>

        <el-form-item prop="code" style="margin-bottom: 0">
          <el-input placeholder="输入验证码" v-model="resetPasswordForm.code" @blur="focusFn('code')" @input="inputFn('code', $event)" :validate-event="false">
            <el-button type="text" slot="suffix" @click="checkPractice(resetMode)" :class="isGetCode && state === 0 ? 'getCode_active' : ''">
              <span>{{state === 0 ? '获取验证码' : (state === 1 ? '发送中' : countDown + ' 秒后可重发')}}</span>
              <i class="el-icon-loading" style="margin-left: 5px" v-if="state === 1"></i>
            </el-button>
          </el-input>
        </el-form-item>

        <el-form-item prop="code" style="margin-bottom: 0; margin-top: 16px" v-if="isShow">
          <slide-verification @manualVerification="manualVerification"/>
        </el-form-item>

        <el-form-item prop="" style="margin-top: 28px">
          <el-button type="primary" @click="resetPwd(resetMode)" style="width: 100%">重设我的密码</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
  import slideVerification from "../../components/slideVerification";
  import http from "../../network/api";

  export default {
    name: "resetPassword",
    components: {
      slideVerification
    },
    data() {
      var checkPhone = (rule, value, cb) => {
        const regMobile = /^(0|86|17951)?(13[0-9]|15[0123456789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
        if (regMobile.test(value)) {
          return cb()
        } else {
          cb(new Error('手机号码无效'))
        }
      };
      var checkEmail = (rule, value, cb) => {
        const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
        if (regEmail.test(value)) {
          return cb();
        } else {
          cb(new Error('邮箱地址无效'))
        }
      };
      return {
        resetPasswordForm: {
          phone: '',
          email: '',
          code: ''
        },
        resetPasswordFormRules: {
          phone: [
            {required: true, message: '必填项', trigger: 'blur'},
            {validator: checkPhone, trigger: 'change'}
          ],
          email: [
            {required: true, message: '必填项', trigger: 'blur'},
            {validator: checkEmail, trigger: 'change'}
          ],
          code: [
            {required: true, message: '必填项', trigger: 'change'},
            {pattern: /^[0-9]*$/, message: '验证码格式有误', trigger: 'change'}
          ]
        },
        resetMode: 'phone',
        isGetCode: false,
        state: 0,
        countDown: 60,
        isPass: false,
        isShow: false,
        inter: ''
      }
    },
    mounted() {

    },
    methods: {
      switchCheck() {
        this.resetPasswordForm.phone = '';
        this.resetPasswordForm.email = '';
        this.resetPasswordForm.code = '';
        clearInterval(this.inter);
        this.isGetCode = false;
        this.state = 0;
        this.countDown = 60;
        this.$refs.resetPasswordFormRef.resetFields();
      },

      // 修改验证规则触发条件
      focusFn(str) {
        if(str === 'phone') {
          this.$refs.resetPasswordFormRef.validateField('phone');
        }else if(str === 'email') {
          this.$refs.resetPasswordFormRef.validateField('email');
        }else{
          this.$refs.resetPasswordFormRef.validateField('code');
        }
      },
      inputFn(str, e) {
        if(str === 'code') {
          e ? this.$refs.resetPasswordFormRef.validateField('code') : this.$refs.resetPasswordFormRef.clearValidate('code');
        }else if(str === 'phone') {
          this.$refs.resetPasswordFormRef.clearValidate('phone');
          const phonePattern = /^(0|86|17951)?(13[0-9]|15[0123456789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;
          phonePattern.test(e) ? this.isGetCode = true : this.isGetCode = false
        }else{
          this.$refs.resetPasswordFormRef.clearValidate('email');
          const emailPattern = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/;
          emailPattern.test(e) ? this.isGetCode = true : this.isGetCode = false;
        }
      },

      // 滑动验证
      manualVerification() {
        this.isPass = true;
        setTimeout(() => {
          this.checkPractice(this.resetMode);
        }, 500)
      },
      checkPractice(resetMode) {
        this.isShow = true;
        if(this.isPass) {
          this.isShow = false;
          this.isPass = false;
          this.getCode(resetMode);
        }
      },

      // 获取验证码
      getCode(resetMode) {
        if(this.state === 0 && this.isGetCode) {
          this.state = 1;
          let requestUrl, params;
          if(resetMode === 'phone') {
            requestUrl = 'getPhoneCode';
            params = {phoneBound: this.resetPasswordForm.phone};
          }else{
            requestUrl = 'getEmailCode';
            params = {email: this.resetPasswordForm.email};
          }
          http[requestUrl](params).then(res => {
            if(res.status === 200 && res.data.code === 200) {
              this.state = 2;
              this.inter = setInterval(() => {
                this.countDown --;
                if(this.countDown <= 0) {
                  this.state = 0;
                  this.countDown = 60;
                  clearInterval(this.inter);
                }
              }, 1000);
            }else{
              this.state = 0;
              this.$message({message: res.data.message, center: true, type: 'error'});
            }
          });
        }
      },

      resetPwd(resetMode) {
        this.$refs.resetPasswordFormRef.validate(valid => {
          if(valid) {
            let requestUrl, params;
            if(resetMode === 'phone') {
              requestUrl = 'resetPwdPhoneAuth';
              params = {
                phoneBound: this.resetPasswordForm.phone,
                code: this.resetPasswordForm.code
              };
            }else{
              requestUrl = 'resetPwdEmailAuth';
              params = {
                email: this.resetPasswordForm.email,
                code: this.resetPasswordForm.code
              };
            }
            http[requestUrl](params).then(res => {
              if(res.status === 200 && res.data.code === 200) {
                let id = res.data.id;
                let key = id + this.resetPasswordForm.code;
                this.$router.push(`/account/password/reset/key/${key}`);
              }else{
                this.$message({message: res.data.message, center: true, type: 'error'});
              }
            });
          }
        })
      },
    }
  }
</script>

<style lang="less" scoped>
  .login_container .login_form {
    padding-bottom: 30px !important;
    /deep/.el-form-item:nth-child(2) {
      margin-bottom: 0;
      .el-form-item__content {
        line-height: normal;
        .el-divider--horizontal {
          margin: 12px 0 24px 0;
        }
      }
    }
    /deep/.el-form-item:nth-child(3) {
      padding: 15px;
      border: 1px solid #e6db55;
      background-color: #ffffe0;
      border-radius: 5px;
      .el-form-item__content {
        line-height: 25px;
        color: rgba(0,0,0,0.65);
        font-size: 14px;
      }
    }
    /deep/.el-form-item:nth-child(6) .el-input {
      .el-input__inner {
        padding-right: 80px;
      }
      .el-button {
        color: rgba(60, 60, 67, 0.6);
        cursor: text;
      }
    }
  }
  .login_box {
    top: 10% !important;
  }
  .getCode_active {
    color: #409EFF !important;
    cursor: pointer !important;
  }
</style>
