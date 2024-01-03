<template>
  <div class="page-code">

    <div class="title">输入验证码</div>

    <div class="desc">验证码已发送至 +86 {{ 13712345678 }}</div>

    <van-password-input
      :value="value"
      :focused="showKeyboard"
      @focus="showKeyboard = true"
      :mask="false"
      style="margin-top: 50px;"
    />

    <van-number-keyboard
      v-model="value"
      :show="showKeyboard"
      @blur="showKeyboard = false"
    />

  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const value = ref<string>('')
const showKeyboard = ref<boolean>(false)

watch(value, (val) => {
  if (val.length === 6) {
    console.log('输入完毕')
  }
})
</script>

<style lang="less" scoped>
.page-code {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 50px;
  .title {
    font-size: 30px;
    font-weight: 500;
    opacity: 0.8;
  }
  .desc {
    font-size: 14px;
    opacity: 0.5;
    margin-top: 10px;
  }
}
</style>