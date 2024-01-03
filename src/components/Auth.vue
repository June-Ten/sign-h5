<template>
  <div class="page-auth">
    
    <div class="txt">认证方式</div>

    <div class="auth-methods">
      <div class="txt-msg-auth active-method">
        短信认证
        <div class="triangle"></div>
        <div class="check-mark">✓</div>
      </div>
    </div>

    <div class="privacy">
      <img
        :src="isAgree ? checkedSvg : unCheckSvg"
        @click="isAgree = !isAgree"
        style="margin-right: 5px;transform: scale(0.8);"
      />
      我已阅读并同意
      <span style="margin-left: 5px;color: #3277ff;">《服务协议》</span>
    </div>

    <div class="btn-agree" @click="handleAgree">
      同意并继续
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, defineEmits } from 'vue'

import { showFailToast } from 'vant'

import unCheckSvg from '../assets/uncheck.svg'
import checkedSvg from '../assets/checked.svg'

const emits = defineEmits(['changeCurrent'])

const isAgree = ref<boolean>(false)

const handleAgree = () => {
  if (!isAgree.value) {
    showFailToast('请先同意服务协议')
    return
  }

  emits('changeCurrent')
}
</script>

<style lang="less" scoped>
.page-auth {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 50px;
  .txt {
    width: 100%;
    display: flex;
    opacity: 0.5;
    font-size: 12px;
  }
  .auth-methods {
    width: 100%;
    display: flex;
    margin-top: 30px;
    .txt-msg-auth {
      width: 150px;
      height: 30px;
      display: flex;
      justify-content: center;
      align-items: center;
      border: 1px solid #f7f7f7;
      border-radius: 5px;
      font-size: 14px;
      position: relative;
      overflow: hidden;
      .triangle {
        width: 0;
        height: 0;
        border-left: 20px solid transparent;
        border-bottom: 20px solid transparent;
        border-top: 20px solid #409eff;
        position: absolute;
        right: 0;
        top: 0;
      }
      .check-mark  {
        position: absolute;
        right: 1px;
        top: 0;
        font-size: 10px;
        color: white;
      }
    }
    .active-method {
      border: 1px solid  #409eff;
      background-color: #fdfbfc;
    }
  }
  .privacy {
    width: 100%;
    display: flex;
    align-items: center;
    font-size: 12px;
    margin-top: 200px;
  }
  .btn-agree {
    width: 100%;
    height: 40px;
    margin-top: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #409eff;
    color: white;
    border-radius: 5px;
  }
}
</style>