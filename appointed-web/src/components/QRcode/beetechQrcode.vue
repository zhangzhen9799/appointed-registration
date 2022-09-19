<script setup>
import { ref, computed } from "vue";
import useLongPress from "@/utils/longPress.js";
import QRcode from "./index.vue";
/**
 * 当前组件区分是否为图片资源，如果为图片资源显示图片，否则使用qrcode显示二维码
 */

const props = defineProps({
  url: {
    type: String,
    default: "",
  },
  width: {
    type: Number,
    default: 150,
  },
  height: {
    type: Number,
    default: 150,
  },
  longpressParams: {
    type: Object,
  },
});

const vLongpress = useLongPress();

const validateImg = computed(() => {
  const reg = /(png|jpg|jpeg|bmp|gif|webp|psd|svg|tiff)/;
  if (reg.exec(props.url)) {
    return true;
  } else {
    return false;
  }
});
</script>
<template>
  <!--  -->
  <QRcode
    v-if="!validateImg"
    :url="url"
    :width="width"
    :height="height"
    v-longpress="longpressParams"
  ></QRcode>
  <van-image v-else :width="width" :height="height" :src="url" />
</template>
<style lang="less" scoped>
</style>