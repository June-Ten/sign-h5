<template>
  <div class="page-container" v-if="current === 0">
    <van-loading
      size="24px"
      vertical
      style="position: fixed;top:50%;left:50%;transform: translate(-50%, 50%);"
      v-if="initLoading"
    >
      加载中...
    </van-loading>

    <div class="pdfBox" ref="pdfBox" v-show="!isPaging"></div>
    
    <div class="bottom-btn-box"  v-if="!showPopup">

      <div
        class="anywhere-btn"
        @click="show"
        v-if="!showPopup && dragPositionList.length === 0 && pagingSealList.length === 0"
      >
        任意位置盖章
      </div>

      <div
        class="continue-stamp-btn"
        @click="show"
        v-if="!showPopup && (dragPositionList.length > 0 || pagingSealList.length > 0)"
      >
        <img src="./assets/stamp.svg" alt="">
        继续盖章
      </div>
      <div
        class="anywhere-btn"
        @click="submitSign"
        v-if="!showPopup && (dragPositionList.length > 0 || pagingSealList.length > 0)"
      >
        提交签署
      </div>

    </div>

    <div
      style="position: fixed;top:50%;left:50%;"
      @click="getSealPositions"
      v-if="false"
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
        v-model:w="item.initW"
        v-model:h="item.initH"
        :draggable="true"
        @drag-end="onDragEnd($event, item)"
        @drag-start="showPopover = false"
        :ref="item.id"
      >
        <van-popover
          v-model:show="showPopover"
          theme="dark"
        >
          <div
            class="popover-slot-txt"
            @click="dragPositionList.splice(dragPositionList.findIndex(i => i.id === item.id), 1)"
          >
            删除
          </div>
          <template #reference>
            <div class="drag-seal-item">
              <img
                v-if="item.type === 'P'"
                :src="`data:image/png;base64,${item.sealImg}`"
                alt="个人印章"
                :style="`width: ${item.w}px; height: ${item.h}px`"
              >
            </div>
          </template>
        </van-popover>
      </Vue3DraggableResizable>
    </Teleport>

    <div class="fixed-center-btn">
      <div class="paging-seal" v-show="!isPaging" @click="handlePaging">
        盖骑缝章
      </div>
      <div class="paging-seal" v-show="isPaging" @click="pagingSuccess">
        完成
      </div>
    </div>

    <div
      v-show="isPaging"
      class="paging-box"
      :style="{ width: `${renderSize.width}px`, height: `${renderSize.height}px`,
                left: `${wrapperMargin.pdfViewer.left}px`, top: `${wrapperMargin.pdfViewer.top}px` }"
    >
      <div
        class="img-box"
        :style="{ width: `${renderSize.width - 100}px`, height: `${renderSize.height}px` }"
      >
        <img :src="homeImg">
      </div>
      <div class="paging-canvas">

        <template
          v-for="(_, index) in totalPage"
          :key="index"
        >
          <div
            class="paper-line"
            v-if="index < 7"
          ></div>
        </template>
        
        <Vue3DraggableResizable
          v-for="item in pagingSealList"
          :initW="item.initW || 120"
          :initH="item.initH || 120"
          :resizable="false"
          v-model:x="item.x"
          v-model:y="item.y"
          v-model:w="item.initW"
          v-model:h="item.initH"
          :draggable="true"
          @drag-start="showPopover = false"
          :ref="`${item.id}-paging}`"
          disabledX
          :parent="true"
          style="z-index: 99;"
        >
          <van-popover
            v-model:show="showPopover"
            theme="dark"
          >
            <div
              class="popover-slot-txt"
              @click="onPopverSelect"
            >
              删除
            </div>
            <template #reference>
              <div class="drag-seal-item">
                <img
                  v-if="item.type === 'P'"
                  :src="`data:image/png;base64,${item.sealImg}`"
                  alt="个人印章"
                  :style="`width: ${item.w}px; height: ${item.h}px`"
                >
              </div>
            </template>
          </van-popover>
        </Vue3DraggableResizable>
          

        <div class="paging-txt">签名区</div>
      </div>
    </div>

  </div>

  <div class="page-container" v-if="current === 1">
    <Auth  @change-current="current = 2"/>
  </div>

  <div class="page-container" v-if="current === 2">
    <Code  @change-current="(e) => submitSign(e)"></Code>
  </div>

  <div class="page-container" v-if="current === 3">
    <Success @change-current="backHomePage"/>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import Pdfh5 from 'pdfh5'
import { showLoadingToast, showSuccessToast, showFailToast } from 'vant'

import Auth from './components/Auth.vue'
import Code from './components/Code.vue'
import Success from './components/Success.vue'
import request from './utils/request'
import { setAuthToken } from './utils/auth'
import { ApiPaths } from './api/endPoints'

const current = ref<number>(0)

const initLoading = ref<boolean>(true)

const isPaging =ref<boolean>(false)

const pdfBox = ref<HTMLElement>()

const totalPage = ref<number>(0)

const personSeal = {
  initW: 50,
  initH: 50
}

const eachPageHeight = ref<number>(500)

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

const pagingSealList = reactive<any[]>([])

async function getUrlQuery() {
  await router.isReady()

  setAuthToken(route.query.token as string)

  try{
    const pdfRes: any = await request.get(`${ApiPaths.GetContract}/${route.query.contractId}`)
  
    let pdfh5 = new Pdfh5(pdfBox.value, {
      // pdfurl: "./456.pdf",
      data: atob(pdfRes),
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
    eachPageHeight.value = document.querySelector('.pageContainer')!.clientHeight
  } catch (e) {
    console.log('onMounted-error', e)
  } finally {
    initLoading.value = false
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
    bottom: 10,
    left: 10
  },
  pageContainer: {
    marginBottom: 8
  }
})

function getWrapperMargin() {
  const pdfViewer = document.querySelector('.pdfViewer')! as HTMLElement
  const pageContainer = document.querySelector('.pageContainer')! as HTMLElement
  wrapperMargin.pdfViewer.top = parseFloat(window.getComputedStyle(pdfViewer).paddingTop)
  wrapperMargin.pdfViewer.bottom = parseFloat(window.getComputedStyle(pdfViewer).paddingBottom)
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
  w: number
  h: number
  type: string
  sealImg: string
}
const dragPositionList = reactive<Position[]>([])

const windowWidth = window.innerWidth
// const windowHeight = window.innerHeight

function onDragEnd(e: any, item: Position) {
  if (!isPaging.value) {
    if (e.x < wrapperMargin.pdfViewer.left) {
      item.x = wrapperMargin.pdfViewer.left
    }
    if (e.x > windowWidth - wrapperMargin.pdfViewer.left - item.w) {
      item.x = windowWidth - wrapperMargin.pdfViewer.left - item.w
    }
    if (e.y < wrapperMargin.pdfViewer.top) {
      item.y = wrapperMargin.pdfViewer.top
    }
    if (e.y + item.h > document.querySelector('.pdfViewer')!.clientHeight -
        (wrapperMargin.pdfViewer.bottom + wrapperMargin.pageContainer.marginBottom)) {
      item.y = document.querySelector('.pdfViewer')!.clientHeight -
      (item.h + wrapperMargin.pdfViewer.bottom + wrapperMargin.pageContainer.marginBottom)
    }
  }
}

function addSeal(item: any, type: string) {
  showPopup.value = false
  generateSeal(getWindowCenterPosition(), type, item)
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

function generateSeal({ x, y }: { x: number; y: number; }, type: string, item: any): void {
  const container = document.querySelector('.viewerContainer')!

  if (!isPaging.value) {
    if (type === 'P') {
      dragPositionList.splice(0, dragPositionList.length)
      dragPositionList.push({
        x,
        y: container.scrollTop + y,
        id: item.id,
        initW: personSeal.initW * ratio.wRatio,
        initH: personSeal.initH * ratio.hRatio,
        w: personSeal.initW * ratio.wRatio,
        h: personSeal.initH * ratio.hRatio,
        type: 'P',
        sealImg: item.sealImageBase64
      })
    }
  }

  if (isPaging.value) {
    pagingSealList.splice(0, pagingSealList.length)
    pagingSealList.push({
      x: 40,
      y: 10,
      id: item.id,
      initW: personSeal.initW * ratio.wRatio,
      initH: personSeal.initH * ratio.hRatio,
      w: personSeal.initW * ratio.wRatio,
      h: personSeal.initH * ratio.hRatio,
      type: 'P',
      sealImg: item.sealImageBase64
    })
  }
}

function getSealPositions() {
  const resultList: any[] = []
  dragPositionList.forEach(item => {
      const currentPage = Math.floor((item.y - wrapperMargin.pdfViewer.top) /
      (eachPageHeight.value + wrapperMargin.pageContainer.marginBottom)) + 1
      resultList.push({
        ...item,
        page: currentPage,
        X: (item.x - wrapperMargin.pdfViewer.left) / ratio.wRatio,
        Y: getRawY(item, currentPage, eachPageHeight.value)
      })
  })

  const pagingResList: any[] = []
  pagingSealList.forEach(item => {
    pagingResList.push({
      ...item,
      X: fileIntrinsicSize.width - (item.w / ratio.wRatio / totalPage.value),
      Y: (eachPageHeight.value - item.y - item.h) / ratio.hRatio
    })
  })
  
  return { 
    stamp: resultList[0],
    paging: pagingResList[0]
  }
}

function getRawY(item: Position, currentPage: number, eachPageHeight: number) {
  const currentY = eachPageHeight -
  (item.y  + item.h - wrapperMargin.pdfViewer.top - 
  ((currentPage - 1) * (eachPageHeight + wrapperMargin.pageContainer.marginBottom)))
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

async function submitSign(code?: string) {
  if (current.value === 0 ) {
    current.value = 1
    return
  }

  if (current.value === 2 && code?.length === 6) {
    showLoadingToast({
      message: '签署中...',
      forbidClick: true,
      duration: 0
    })

    try {
      const sealInfo = getSealPositions()
    
      let res = false
      if (sealInfo?.stamp) {
          res = await request.post(ApiPaths.SignContract, {
          contractId: route.query.contractId,
          sealId: sealInfo.stamp.id,
          type: sealInfo.stamp.type === 'P' ? 0 : 1,
          pageNum: sealInfo.stamp.page,
          x: sealInfo.stamp.X,
          y: sealInfo.stamp.Y,
          width: personSeal.initW,
          height: personSeal.initH,
          code
        })
      }
    
      let pagingRes = false
      if (sealInfo?.paging) {
          pagingRes = await request.post(ApiPaths.SignPaging, {
          contractId: route.query.contractId,
          sealId: sealInfo.paging.id,
          type: sealInfo.paging.type === 'P' ? 0 : 1,
          pageNum: totalPage.value,
          x: sealInfo.paging.X,
          y: sealInfo.paging.Y,
          width: personSeal.initW,
          height: personSeal.initH,
          code
        })
      }

      showSuccessToast('签署成功')
      current.value = 3
      console.log('res', res, pagingRes)
    } catch (error) {
      showFailToast('签署失败')
      console.log('submitSign-error', error)
    }
  }

}

function handlePaging() {
  isPaging.value = true
  homeImg.value = getCroppedImageBase64()
}

function pagingSuccess() {
  isPaging.value = false
}

const homeImg = ref<string>('')

function getCroppedImageBase64() {
  const originalImageElement = document.querySelector('.pageContainer1 img') as HTMLElement

  const croppedCanvas = document.createElement('canvas')
  croppedCanvas.width = fileIntrinsicSize.width
  croppedCanvas.height = fileIntrinsicSize.height
  const ctx = croppedCanvas.getContext('2d')!

  ctx.clearRect(0, 0, croppedCanvas.width, croppedCanvas.height)
  ctx.drawImage(
    originalImageElement as CanvasImageSource,
    100 / ratio.wRatio,
    0,

    fileIntrinsicSize.width - (100 / ratio.wRatio),
    fileIntrinsicSize.height,

    0,
    0,

    fileIntrinsicSize.width,
    fileIntrinsicSize.height
  )

  return croppedCanvas.toDataURL('image/png')
}

const showPopover = ref<boolean>(false)

const onPopverSelect = () => {
    showPopover.value = false
    pagingSealList.splice(0, pagingSealList.length)
}

function backHomePage() {
  uni.navigateBack()
}

</script>

<style scoped lang="less">
* {
  box-sizing: border-box;
}
::-webkit-scrollbar {
  display: none;
}
.popover-slot-txt {
  width: 40px;
  height: 20px;
  font-size: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
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
    .continue-stamp-btn {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      font-weight: 600;
      margin-right: 20px;
      img {
        width: 15px;
        height: 15px;
      }
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
  .fixed-center-btn {
    position: fixed;
    right: 0;
    top: 50%;
    writing-mode: vertical-rl;
    text-orientation: upright;
    color: #409EFF;
    background-color: #fff;
    font-size: 12px;
    display: flex;
    width: 30px;
    height: 70px;
    border-top-left-radius: 10px;
    border-bottom-left-radius: 10px;
    box-shadow: 1px 0px 3px #808080;
    overflow: hidden;
    letter-spacing: 2px;
    z-index: 999;
    .paging-seal {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
  .paging-box {
    position: fixed;
    display: flex;
    box-shadow: darkgrey 0px 1px 3px 0px;
    .img-box {
      img {
        width: 100%;
        height: 100%;
      }
    }
    .paging-canvas {
      width: 100px;
      height: 100%;
      border: 1px dashed #409EFF;
      display: flex;
      position: relative;
      .paper-line {
        flex: 1;
        background-color: #fff;
        // box-shadow: darkgrey 0px 1px 3px 0px;
        box-shadow: inset #f0f0f0 2px -1px 3px 0px;;
      }
      .paging-txt {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        writing-mode: vertical-rl;
        text-orientation: upright;
        color: #ccc;
        font-size: 20px;
        letter-spacing: 5px;
      }
    }
  }
}
</style>
