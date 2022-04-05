<template>
  <div class="box" ref="verificationAreaRef" onselectstart="return false;">
    <div class="bgColor"></div>
    <div class="txt" >{{txt}}</div>
    <div class="slider" :class="isSuccess ? 'active' : ''"><i :class=icon style="font-size: 18px"></i></div>
  </div>
</template>

<script>
  export default {
    name: "slideVerification",
    data() {
      return {
        isSuccess: false,               //是否解锁成功的标志，默认不成功
        successMoveDistance: 0,         //验证通过需要滑动的距离
        downX: 0,                       //存放鼠标按下时的位置
        txt: '请按住滑块，拖动到最右边',
        icon: 'iconfont icon-youyou-',
      }
    },
    mounted() {
      this.$nextTick(() => {
        this.successMoveDistance = this.$refs.verificationAreaRef.offsetWidth - this.$refs.verificationAreaRef.children[2].offsetWidth;
        // 给滑块添加鼠标按下事件
        this.$refs.verificationAreaRef.children[2].onmousedown = this.mousedownHandler;
      })
    },
    methods: {
      mousedownHandler(e) {
        this.$refs.verificationAreaRef.children[0].style.transition = '';
        this.$refs.verificationAreaRef.children[2].style.transition = '';
        this.downX = e.clientX;

        document.onmousemove = this.mousemoveHandler;
        document.onmouseup = this.mouseupHandler;
      },
      mousemoveHandler(e) {
        let moveX = e.clientX;
        let offsetX = this.getOffsetX(moveX - this.downX,0, this.successMoveDistance);
        // 滑动开始给予背景色，避免在初始位置与滑块有颜色重叠
        if(offsetX > 0) {
          this.$refs.verificationAreaRef.children[0].style.backgroundColor = 'rgb(0,122,255)';
        }
        this.$refs.verificationAreaRef.children[0].style.width = (offsetX + 10) + "px";
        this.$refs.verificationAreaRef.children[0].style.zIndex = 1;
        this.$refs.verificationAreaRef.children[2].style.left = offsetX + "px";
        this.$refs.verificationAreaRef.children[2].style.zIndex = 2;
        if(offsetX == this.successMoveDistance){
          this.successFn();
        }
        e.preventDefault();
      },
      mouseupHandler(e) {
        if(!this.isSuccess){
          this.$refs.verificationAreaRef.children[0].style.width = 0 + "px";
          this.$refs.verificationAreaRef.children[2].style.left = 0 + "px";
          this.$refs.verificationAreaRef.children[0].style.transition = "width 0.8s linear";
          this.$refs.verificationAreaRef.children[2].style.transition = "left 0.8s linear";
        }
        document.onmousemove = null;
        document.onmouseup = null;
      },
      getOffsetX(offset,min,max) {
        if(offset < min){
          offset = min;
        }else if(offset > max){
          offset = max;
        }
        return offset;
      },
      // 验证通过
      successFn() {
        this.isSuccess = true;
        this.$refs.verificationAreaRef.children[0].style.backgroundColor = 'lightgreen';
        this.$refs.verificationAreaRef.children[0].style.zIndex = 0;
        // 取消滑动验证条向右闪过提示滑动效果
        this.$refs.verificationAreaRef.children[1].style.webkitTextFillColor = 'dimgray';
        this.$refs.verificationAreaRef.children[1].style.webkitAnimation = 'auto';
        this.txt = '验证通过';
        this.icon = 'el-icon-success';

        this.$refs.verificationAreaRef.children[2].onmousedown = null;
        document.onmousemove = null;
        this.$emit('manualVerification');
      }
    },
  }
</script>

<style lang="less" scoped>
  .box{
    position: relative;
    width: 300px;
    height: 38px;
    margin: 0 auto;
    background-color: rgba(247, 247,247);
    border: 1px solid #DCDFE6;
    border-left: none;
    border-radius: 4px;
  }
  .bgColor{
    position: absolute;
    left:0;
    top:0;
    width:40px;
    height: 40px;
    margin-top: -1.5px;
    border-radius: 4px;
  }
  .txt{
    position: absolute;
    width: 100%;
    height: 38px;
    line-height: 38px;
    font-size: 14px;
    color: rgba(38,38,38,0.25);
    text-align: center;

    background: -webkit-gradient(linear, left top, right top, color-stop(0, #4d4d4d), color-stop(.4, #4d4d4d), color-stop(.5, white), color-stop(.6, #4d4d4d), color-stop(1, #4d4d4d));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    -webkit-animation: animate 2.5s infinite;
  }
  @-webkit-keyframes animate {
    from {background-position: -150px;}
    to {background-position: 150px;}
  }
  @keyframes animate {
    from {background-position: -150px;}
    to {background-position: 150px;}
  }
  .slider{
    position: absolute;
    left:0;
    top:0;
    width: 50px;
    height: 41px;
    margin-top: -1.5px;
    color: #737383;
    background: #fff;
    text-align: center;
    border-radius: 4px;
    box-shadow: rgba(0, 0, 0, 0.06) 0px 1px 3px, rgba(0, 0, 0, 0.18) 0px 6px 16px;
    cursor: move;
    z-index: 2;
  }
  .slider>i{
    position: absolute;
    top:50%;
    left:50%;
    transform: translate(-50%,-50%);
  }
  .slider.active>i{
    color: green;
  }
</style>
