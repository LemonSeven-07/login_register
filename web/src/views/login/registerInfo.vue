<template>
  <div class="login_container">
    <div class="login_box">
      <div class="avatar_box">
        <img src="../../assets/images/logo.png" alt="">
      </div>

      <el-form ref="registrationFormRef" :model="registrationForm" :rules="registrationFormRules" class="login_form" label-width="0px">
        <el-form-item style="margin-bottom: 0">设置个人信息</el-form-item>

        <el-form-item><el-divider></el-divider></el-form-item>

        <el-form-item prop="nickname" style="margin-bottom: 12px">
          <div>昵称</div>
          <el-input placeholder="请输入昵称" v-model="registrationForm.nickname"/>
        </el-form-item>

        <el-form-item style="margin-bottom: 12px">
          <div>性别</div>
          <div style="padding: 0 40px; display: flex; justify-content: space-around;">
            <el-tooltip class="item" effect="light" content="女" placement="top" popper-class="registerInfo_genderTips" :visible-arrow="false" :enterable="false">
              <el-button class="iconfont icon-nv" :class="isClick ? 'woman_active' : 'hover_active'" circle @click="sexFn('woman')"></el-button>
            </el-tooltip>

            <el-tooltip class="item" effect="light" content="男" placement="top" popper-class="registerInfo_genderTips" :visible-arrow="false" :enterable="false">
              <el-button class="iconfont icon-nan" :class="isClick ? '' : 'man_active'" circle @click="sexFn('man')"></el-button>
            </el-tooltip>
          </div>
        </el-form-item>

        <el-form-item prop="birthday" style="margin-bottom: 30px">
          <div>出生年月</div>
          <el-date-picker style="width: 100%"
                          v-model="registrationForm.birthday"
                          type="date"
                          :picker-options="pickerOptions"
                          placeholder="选择出生年月" value-format="yyyy-MM-dd"></el-date-picker>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" style="width: 100%" @click="enter">进入</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
  import http from '../../network/api'
  export default {
    name: "registerInfo",
    data() {
      return {
        registrationForm: {
          nickname: '',
          sex: '女',
          birthday: ''
        },
        registrationFormRules: {
          nickname: [
            { required: true, message: '请填写昵称', trigger: 'change' },
            { pattern: /^[\u0391-\uFFE5A-Za-z0-9_-]{4,12}$/,  message: '昵称由字母、数字、-、_和中文组成，长度在4-12之间', trigger: 'blur' }
          ],
          birthday: [
            { required: true, message: '请选择出生年月', trigger: 'change' },
          ]
        },
        pickerOptions: {
          disabledDate(time) {
            return time.getTime() > Date.now();
          },
        },
        isClick: true
      }
    },
    methods: {
      sexFn(str) {
        if(str === 'woman') {
          this.registrationForm.sex = '女';
          this.isClick = true;
        }else{
          this.registrationForm.sex = '男';
          this.isClick = false;
        }
      },
      enter() {
        let id = localStorage.getItem('userId');
        this.$refs.registrationFormRef.validate(valid => {
          if(valid) {
            http.setUserInfo({...this.registrationForm, id}).then(res => {
              if(res.status === 200 && res.data.code === 200) {
                this.$router.push('/account/home');
              }else{
                this.$message({message: res.data.message, center: true, type: 'error'});
              }
            })
          }
        })
      }
    },
    beforeRouteLeave(to, from, next){
      if(to.path ==='/account/login' ){
        next('/account/home');
      }else {
        next();
      }
    },
  }
</script>

<style lang="less" scoped>
  .login_box {
    top: 10% !important;
  }
  .login_container .login_form {
    padding-bottom: 30px !important;
    .el-form-item:first-child {
      margin-top: -15px;

      /deep/ .el-form-item__content {
        font-size: 20px;
      }
    }

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
  .woman_active {
    background-color: pink;
    border-color: pink;
    color: #ffffff;
  }
  .hover_active:hover {
    background-color: rgba(255,192,203,.1);
    border-color: rgba(255,192,203,.4);
    color: pink;
  }
  .man_active {
    background-color: #409EFF;
    border-color: #409EFF;
    color: #ffffff;
  }

</style>
<style>
  .registerInfo_genderTips {
    border: none !important;
    padding-bottom: 0 !important;
    color: rgba(96,98,102,.8) !important;
  }
</style>
