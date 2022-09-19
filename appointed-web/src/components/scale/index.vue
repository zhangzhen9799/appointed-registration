
<script setup>
import { ref, onMounted, nextTick, watch } from "vue";

import Scale from "./scale";

const props = defineProps({
  options: {
    type: Object,
    default: () => {
      return {};
    },
  },
});

const emits = defineEmits(["changeRules"]);

const rulerRef = ref(null);

function changeRulerHandle(value) {
  emits("changeRules", value);
}
// const baseOpt = {
//   target: rulerRef.value,
//   width: 300, //画布宽
//   height: 80, //画布高
//   start: 0, //最小值
//   end: 300, //最大值
//   capacity: 1, //每个刻度代表值
//   value: 170, //当前值
//   unit: 10, //刻度距离
//   scaleplate: {
//     color: "#9e9e9e",
//     fontcolor: "#000",
//   },
//   linecolor: "#1E8EB3",
//   callback: changeRulerHandle,
// };

onMounted(() => {
  new Scale(
    Object.assign(
      {
        target: rulerRef.value,
        callback: changeRulerHandle,
        width: 300, //画布宽
        height: 80, //画布高
        start: 0, //最小值
        end: 300, //最大值
        capacity: 1, //每个刻度代表值
        value: 120, //当前值
        unit: 10, //刻度距离
        scaleplate: {
          color: "#242424",
          fontcolor: "#000",
        },
        linecolor: "#1E8EB3",
      },
      props.options
    )
  );
});
</script>

<template>
  <div>
    <canvas ref="rulerRef"></canvas>
  </div>
</template>

<style lang="less"></style>