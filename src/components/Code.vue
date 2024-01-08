<template>
  <div class="page-code">

    <div class="title">输入验证码</div>

    <div class="desc">验证码已发送至 +86 {{ phone }}</div>

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
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'

import { showLoadingToast, showSuccessToast, showFailToast } from 'vant'

import request from '../utils/request'
import { ApiPaths } from '../api/endPoints'



const route = useRoute()

onMounted(async () => {
  phone.value = route.query.phone as string

  showLoadingToast({
    message: '发送验证码中...',
    forbidClick: true,
    duration: 0
  })

  try {
    const res = await request.get(`${ApiPaths.PhoneCode}/${phone.value}/verification-code/6`)
    console.log('发送验证码', res)
    showSuccessToast('发送验证码成功')
  } catch (error) {
    console.log('发送验证码失败', error)
    showFailToast('发送验证码失败')
  }
})

const emits = defineEmits(['changeCurrent'])

const value = ref<string>('')
const showKeyboard = ref<boolean>(false)

watch(value, (val) => {
  if (val.length === 6) {
    console.log('输入完毕')
    emits('changeCurrent', val)
  }
})

const phone = ref<string>('')
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