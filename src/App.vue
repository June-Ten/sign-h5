<template>
  <div class="page-container">

    <div class="pdfBox" ref="pdfBox"></div>
    
    <div class="bottom-btn-box"  v-if="!showPopup">

      <div
        class="anywhere-btn"
        @click="show"
        v-if="!showPopup && dragPositionList.length === 0"
      >
        任意位置盖章
      </div>

      <div
        class="anywhere-btn"
        @click="submitSign"
        v-if="!showPopup && dragPositionList.length > 0"
      >
        提交签署
      </div>

    </div>

    <div
      style="position: fixed;top:50%;left:50%;"
      @click="getSealPositions"
    >
      获取印章的位置
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
            v-for="item in sealList"
            :key="item.id"
            @click="addSeal(item, 'P')"
          >
            <img :src="`data:image/png;base64,${item.sealImageBase64}`" alt="" class="person"/>
          </div>
        </div>
      </div>
    </van-popup>

    <Teleport to=".viewerContainer" v-if="dragPositionList.length">
      <Vue3DraggableResizable
          v-for="item in dragPositionList"
          :key="item.id"
          :initW="item.initW || 120"
          :initH="item.initH || 120"
          :resizable="false"
          v-model:x="item.x"
          v-model:y="item.y"
          :draggable="true"
          @drag-end="onDragEnd($event, item)"
          :ref="item.id"
        >
          <div class="drag-seal-item">
            <img
              v-if="item.type === 'P'"
              :src="`data:image/png;base64,${item.sealImg}`"
              alt="个人印章"
              :style="`width: ${item.initW}px; height: ${item.initH}px`"
            >
          </div>
        </Vue3DraggableResizable>
    </Teleport>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import Pdfh5 from 'pdfh5'

import request from './utils/request'
import { setAuthToken } from './utils/auth'
import { ApiPaths } from './api/endPoints'


const pdfBox = ref<HTMLElement>()

const totalPage = ref<number>(0)

const route = useRoute()
const router = useRouter()

onMounted(async () => {
  const script = document.createElement('script')
  script.setAttribute('src', './uniBridge.js')
  document.head.appendChild(script)

  document.addEventListener('UniAppJSBridgeReady', () => {
    postMsgToUniApp({ result: 'ok' })
    // uni.navigateBack()
  })

  getUrlQuery()
  return
 
})

const sealList = reactive<any>([])

async function getUrlQuery() {
  await router.isReady()

  setAuthToken(route.query.token)

  try{
    const pdfRes: any = await request.get(`${ApiPaths.GetContract}/${route.query.contractId}`)
  
    let pdfh5 = new Pdfh5(pdfBox.value, {
      // pdfurl: "./123.pdf",
      data: atob(pdfRes.urlBase64),
      backTop: false,
      scale: 1.0,
      zoomEnable: false
    })
  
    pdfh5.on("complete", function (status: string, msg: string, time: string) {
      console.log("状态：" + status + "，信息：" + msg + "，耗时：" + time + "毫秒，总页数：", pdfh5)
      totalPage.value = pdfh5.totalNum
  
      getFileIntrinsicSize()
      getRenderSize()
      getRatio()
      getWrapperMargin()
    })
  
    const sealListRes: any = await request.get(ApiPaths.SealList)
    sealList.splice(0, sealList.length, ...sealListRes)
  } catch (e) {
    console.log('onMounted-error', e)
  }
}

const renderSize = reactive({
  width: 0,
  height: 0
})

function getRenderSize() {
  const pageContainer = document.querySelector('.pageContainer')! as HTMLElement
  renderSize.width = pageContainer.clientWidth
  renderSize.height = pageContainer.clientHeight
}

const fileIntrinsicSize = reactive({
  width: 0,
  height: 0
})

function getFileIntrinsicSize() {
  const pageContainer = document.querySelector('.pageContainer')! as HTMLElement
  fileIntrinsicSize.width = parseFloat(pageContainer.style.maxWidth)
  fileIntrinsicSize.height = parseFloat(pageContainer.style.maxHeight)
}

const ratio = reactive({
  wRatio: 0,
  hRatio: 0
})

function getRatio() {
  ratio.wRatio = renderSize.width / fileIntrinsicSize.width
  ratio.hRatio = renderSize.height / fileIntrinsicSize.height
}

const wrapperMargin = reactive({
  pdfViewer: {
    top: 10,
    left: 10
  },
  pageContainer: {
    marginBottom: 10
  }
})

function getWrapperMargin() {
  const pdfViewer = document.querySelector('.pdfViewer')! as HTMLElement
  const pageContainer = document.querySelector('.pageContainer')! as HTMLElement
  wrapperMargin.pdfViewer.top = parseFloat(window.getComputedStyle(pdfViewer).paddingTop)
  wrapperMargin.pdfViewer.left = parseFloat(window.getComputedStyle(pdfViewer).paddingLeft)
  wrapperMargin.pageContainer.marginBottom = parseFloat(window.getComputedStyle(pageContainer).marginBottom)
}

const showPopup = ref<boolean>(false)

function show() {
  showPopup.value = true
}

type Position = {
  x: number
  y: number
  id: string
  initW: number
  initH: number
  type: string
  sealImg: string
}
const dragPositionList = reactive<Position[]>([])

const windowWidth = window.innerWidth
const windowHeight = window.innerHeight

function onDragEnd(e: any, item: Position) {
  if (e.x < wrapperMargin.pdfViewer.left) {
    item.x = wrapperMargin.pdfViewer.left
  }
  if (e.x > windowWidth - wrapperMargin.pdfViewer.left - item.initW) {
    item.x = windowWidth - wrapperMargin.pdfViewer.left - item.initW
  }
  if (e.y < wrapperMargin.pdfViewer.top) {
    item.y = wrapperMargin.pdfViewer.top
  }
  if (e.y > document.querySelector('.viewerContainer')!.scrollTop + 
            windowHeight - wrapperMargin.pdfViewer.top - item.initH - item.initH / 2) {
    item.y = document.querySelector('.viewerContainer')!.scrollTop + 
            windowHeight - wrapperMargin.pdfViewer.top - item.initH - item.initH / 2
  }
}

function addSeal(item: any, type: string) {
  showPopup.value = false
  generateSeal(getWindowCenterPosition(), type, item.sealImageBase64)
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

function generateSeal({ x, y }: { x: number; y: number; }, type: string, sealImg: string): void {
  const container = document.querySelector('.viewerContainer')!

  if (type === 'P') {
    dragPositionList.push({
      x,
      y: container.scrollTop + y,
      id: `seal-${dragPositionList.length + 1}`,
      initW: 50 * ratio.wRatio,
      initH: 50 * ratio.hRatio,
      type: 'P',
      sealImg
    })
  }
}

function getSealPositions() {
  const eachPageHeight = document.querySelector('.pageContainer')!.clientHeight
  const resultList: any[] = []
  dragPositionList.forEach(item => {
      console.log('eachPageHeight', eachPageHeight)

      const currentPage = Math.floor(item.y / eachPageHeight) + 1
      resultList.push({
        ...item,
        page: currentPage,
        X: (item.x - wrapperMargin.pdfViewer.left) / ratio.wRatio,
        Y: getRawY(item, currentPage, eachPageHeight)
      })
  })
  console.log('resultList', resultList)
  return resultList[0]
}

function getRawY(item: Position, currentPage: number, eachPageHeight: number) {
  console.log('eachPageHeight', eachPageHeight)
  const currentY = eachPageHeight -
  (item.y - wrapperMargin.pdfViewer.top - ((currentPage - 1) * eachPageHeight)
    - wrapperMargin.pageContainer.marginBottom * (currentPage - 1) + item.initH)
  return currentY / ratio.hRatio
}

function postMsgToUniApp(obj: any) {
  uni.postMessage({
    data: {
      action: 'postMessage',
      data: obj
    }
  })
}

async function submitSign() {
  const sealInfo = getSealPositions()

  const res = await request.post(ApiPaths.SignContract, {
    contractId: route.query.contractId,
    sealId: sealList.at(Number(sealInfo.id.split('seal-')[1]) - 1).id,
    type: sealInfo.type === 'P' ? 0 : 1,
    pageNum: sealInfo.page,
    x: sealInfo.X,
    y: sealInfo.Y,
    width: 50,
    height: 50
  })
  console.log('res', res)
}

</script>

<style scoped lang="less">
* {
  box-sizing: border-box;
}
::-webkit-scrollbar {
  display: none;
}
.page-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  .pdfBox {
    width: 100%;
    height: 100%;
    padding-bottom: 50px;
  }
  .bottom-btn-box {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 60px;
    background-color: #fbfcfe;
    z-index: 9999;
    display: flex;
    justify-content: center;
    align-items: center;
    .anywhere-btn {
      width: 60%;
      height: 40px;
      line-height: 40px;
      text-align: center;
      color: #fff;
      background-color: #409eff;
      border-radius: 10px;
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
      padding-top: 15px;
      .seal-item {
        width: 48%;
        margin-bottom: 10px;
        flex-shrink: 0;
        .person {
          width: 50px;
          height: 50px;
        }
      }
    }
  }
  .drag-seal-item {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
  }
}
</style>
