<template>
  <div class="page-success">

    <div class="img-success-box">
      <img :src="successSvg" alt="">
    </div>

    <div class="txt">签署成功</div>

    <div class="btn" @click="emits('changeCurrent')">返回主界面</div>

  </div>
</template>

<script setup lang="ts">
import successSvg from '../assets/success.svg'

const emits = defineEmits(['changeCurrent'])

</script>

<style lang="less" scoped>
.page-success {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 50px;
  .img-success-box {
    width: 100%;
    display: flex;
    justify-content: center;
    img {
      width: 50px;
      height: 50px;
    }
  }
  .txt {
    font-weight: bold;
    width: 100%;
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }
  .btn {
    width: 100%;
    height: 40px;
    margin-top: 100px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #409eff;
    color: white;
    border-radius: 5px;
  }
}
</style>