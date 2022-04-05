<template>
  <div class="login_container">
    <div class="login_box">
      <el-form ref="setPasswordFormRef" :model="setPasswordForm" :rules="setPasswordFormRules" class="login_form" label-width="0px" v-show="$store.state.isShow">
        <el-form-item style="margin-bottom: 0">
          <h3 style="color: rgba(0,0,0,0.8);font-weight: 500;font-size: 24px">更换密码</h3>
        </el-form-item>

        <el-form-item><el-divider></el-divider></el-form-item>

        <el-form-item prop="newPassword">
          <div>新密码</div>
          <el-input placeholder="新密码" v-model="setPasswordForm.newPassword" type="password"/>
        </el-form-item>

        <el-form-item prop="repeatPassword">
          <div>新密码 (重复)</div>
          <el-input placeholder="新密码 (重复)" v-model="setPasswordForm.repeatPassword" type="password"/>
        </el-form-item>

        <el-form-item prop="" style="margin-top: 32px; text-align: center">
          <el-button type="primary" @click="replacePwd">更换密码</el-button>
        </el-form-item>
      </el-form>

      <el-form class="login_form" label-width="0px" v-show="!$store.state.isShow">
        <el-form-item style="margin-bottom: 0">
          <h3 style="color: rgba(0,0,0,0.8);font-weight: 500;font-size: 24px">无效字符</h3>
        </el-form-item>

        <el-form-item><el-divider></el-divider></el-form-item>

        <el-form-item prop="newPassword">
          <span>此密码重置链接无效，假如需要修改密码，请<el-button type="text" @click="requestResetPwd">重新请求</el-button>密码重置。</span>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
  import http from '../../network/api'
  import {encrypt} from '../../common/js/encrypt'
  export default {
    name: "setPassword",
    data() {
      return {
        setPasswordForm: {
          newPassword: '',
          repeatPassword: ''
        },
        setPasswordFormRules: {
          newPassword: [
            { required: true, message: '请填写此字段', trigger: 'change' },
            { pattern: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/, message: '密码必须包含大小写字母和数字的组合，可以使用特殊字符，长度在6-20之间', trigger: 'blur' }
          ],
          repeatPassword: [
            { required: true, message: '请填写此字段', trigger: 'change' },
            { pattern: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/, message: '密码必须包含大小写字母和数字的组合，可以使用特殊字符，长度在6-20之间', trigger: 'blur' }
          ]
        },
      }
    },
    methods: {
      replacePwd() {
        let params = {
          uniqueSignal: this.$route.path.split('/account/password/reset/key/')[1],
          newPassword:  encrypt(this.setPasswordForm.newPassword),
          repeatPassword: encrypt(this.setPasswordForm.repeatPassword),
        };
        this.$refs.setPasswordFormRef.validate(valid => {
          if(valid) {
            if(this.setPasswordForm.newPassword === this.setPasswordForm.repeatPassword) {
              http.changePassword(params).then(res => {
                if(res.status === 200 && res.data.code === 200) {
                  this.$router.push('/account/login');
                }else{
                  this.$message({message: res.data.message, center: true, type: 'error'});
                }
              });
            }else{
              this.$message.error('每次输入的密码必须相同');
            }
          }
        })
      },
      requestResetPwd() {
        this.$router.push('/account/password/reset');
      }
    }
  }
</script>

<style lang="less" scoped>
  .login_container .login_form {
    padding-bottom: 30px !important;
    /deep/ .el-form-item:nth-child(2) {
      margin-bottom: 0;
      .el-form-item__content {
        line-height: normal;
        .el-divider--horizontal {
          margin: 12px 0;
        }
      }
    }
  }
</style>
