<script setup>
import { computed } from "vue";


/**
 * 进度条
 * progress 参数值 0 - 100
 */
const props = defineProps({
  progress: {
    type: Number,
    default: 0,
  },
});
const progressFilter = computed(() => {
  if (props.progress > 100) {
    return 100;
  } else if (props.progress < 0) {
    return 0;
  } else {
    return props.progress;
  }
});
// // 滚动条里的小方块 颜色
// const progressBarThumbColor = "#1E8EB3";
// // 滚动条背景颜色
// const progressBarBgColor = "#FFF";
// // 滚动条边框颜色
// const progressBarBorderColor = "#FFF";
// const progressBarPadding = "0.03rem";
</script>

<template>
  <div class="progress-bar">
    <div class="progress-bar-inner">
      <div
        class="progress-bar-thumb"
        :style="{ transform: `translateX(${progressFilter - 100}%)` }"
      ></div>
    </div>
  </div>
</template>

<style lang="less"  scoped>
.progress-bar {
  width: 4rem;
  height: 0.12rem;
  background: #ffffff;
  padding: .04rem;
  border-radius: 0.1rem;
  box-shadow: 0rem 0.01rem 0.01rem rgba(113, 113, 113, 0.158627),
    0rem 0.02rem 0.03rem rgba(193, 193, 193, 0.454026);
  overflow: hidden;
}
.progress-bar-inner,
.progress-bar-thumb {
  height: 100%;
  border-radius: 0.06rem;
}

.progress-bar-inner {
  width: 100%;
  overflow: hidden;
}
.progress-bar-thumb {
  background: #1e8eb3;
  transition: all ease 0.2s;
  transform-origin: left top;
  transform: translateX(-100%);
}
</style>

