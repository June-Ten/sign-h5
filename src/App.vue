<template>
  <div class="page-container">

    <div class="pdfBox" ref="pdfBox"></div>
    
    <div class="bottom-btn-box">
      <div class="anywhere-btn">
        任意位置盖章
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

import Pdfh5 from 'pdfh5'

const pdfBox = ref<any>()

onMounted(() => {
  let pdfh5 = new Pdfh5(pdfBox.value, {
    pdfurl: "./git.pdf",
    backTop: false
  })

  pdfh5.on("complete", function (status: string, msg: string, time: string) {
		console.log("状态：" + status + "，信息：" + msg + "，耗时：" + time + "毫秒，总页数：")
		//禁止手势缩放
	  })
})
</script>

<style scoped lang="less">
.page-container {
  width: 100%;
  height: 100%;
  .pdfBox {
    width: 100%;
    height: 100%;
  }
  .bottom-btn-box {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 50px;
    background-color: #fff;
    .anywhere-btn {
      width: 100%;
      height: 100%;
      line-height: 50px;
      text-align: center;
      color: #fff;
      background-color: #409eff;
    }
  }
}
</style>
