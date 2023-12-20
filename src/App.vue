<template>
  <div class="page-container">

    <div class="pdfBox" ref="pdfBox"></div>
    
    <div class="bottom-btn-box">
      <div class="anywhere-btn" @click="show">
        任意位置盖章
      </div>
    </div>

    <van-popup
      v-model:show="showPopup"
      position="bottom"
      round
      :style="{ padding: '20px' }"
    >
      <div class="van-popup-body">
        <div class="title">个人章</div>
        <div class="content-box">
          <div
            class="seal-item"
            v-for="item in 9"
            @click="addSeal(item)"
          >
            <img src="./seal.png" alt="" />
          </div>
        </div>
      </div>
    </van-popup>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'

import Pdfh5 from 'pdfh5'


const showPopup = ref<boolean>(false)

const pdfBox = ref<any>()

onMounted(() => {
  let pdfh5 = new Pdfh5(pdfBox.value, {
    pdfurl: "./git.pdf",
    backTop: false,
    scale: 1.0,
    zoomEnable: false
  })

  pdfh5.on("complete", function (status: string, msg: string, time: string) {
		console.log("状态：" + status + "，信息：" + msg + "，耗时：" + time + "毫秒，总页数：", pdfh5)
		//禁止手势缩放
  })
})

function show() {
  showPopup.value = true
}

const sealList = reactive<HTMLElement[]>([])

function addSeal(item: any) {
  showPopup.value = false
  generateSeal(getWindowCenterPosition())
  console.log('addSeal', item)
}

function getWindowCenterPosition() {
  let windowWidth = window.innerWidth
  let windowHeight = window.innerHeight
  let centerPosition = {
    x: windowWidth / 2,
    y: windowHeight / 2
  }
  return centerPosition
}

function generateSeal({ x, y }: { x: number; y: number }): void {
  const container = document.querySelector('.viewerContainer')!

  let seal = document.createElement('div')
  seal.id = `seal-${sealList.length + 1}`
  seal.style.position = 'absolute'
  seal.style.left = `${x}px`
  seal.style.top = `${container.scrollTop + y}px`
  seal.style.width = '100px'
  seal.style.height = '100px'
  seal.style.backgroundColor = 'red'

  container.appendChild(seal)
  sealList.push(seal)
}


</script>

<style scoped lang="less">
.page-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
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
  .van-popup-body {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 200px;
    .title {
      width: 100%;
      height: 30px;
      display: flex;
      border-bottom: 1px solid #ccc;
    }
    .content-box {
      flex: 1;
      overflow-y: auto;
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      .seal-item {
        width: 48%;
        margin-bottom: 10px;
        flex-shrink: 0;
      }
    }
  }
}
</style>
