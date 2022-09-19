<script setup>
import { ref, onMounted, watch } from "vue";
import QRCode from "qrcodejs2-fix";

const props = defineProps({
  url: {
    type: String,
    default: "",
  },
  width: {
    type: Number,
    default: 80,
  },
  height: {
    type: Number,
    default: 80,
  },
});
const qrcode = ref(null);
let QR;
onMounted(() => {
  QR = new QRCode(qrcode.value, {
    width: props.width, //宽度
    height: props.height, // 高度
    text: props.url, // 二维码内容--一般为后端传递过来的链接地址，当扫码二维码的时候，会进行相应的跳转
    render: "canvas", // 设置渲染方式（有两种方式 table和canvas，默认是canvas）
  });
});

watch(
  () => props.url,
  (newVal, oldVal) => {
    /* eslint-disable next-line */
    QR.makeCode(newVal);
  }
);
</script>

<template>
  <div
    class="scan-code-container"
    :style="{ width: props.width + 'px', height: props.height + 'px' }"
  >
    <div class="item-pic" ref="qrcode"></div>
  </div>
</template>

<style lang="less" scoped>
.scan-code-container {
  cursor: pointer;
}
</style>