<script setup>
import { ref, onMounted } from "vue";
const props = defineProps({
  item: {
    type: Object,
  },
});
</script>
<template>
  <div>
    <div class="discount-container" v-if="item.saveType === 0">
      <div>优惠劵</div>
      <span class="discount-num">{{ item.discount / 10 }}</span>
      <span class="discount-text">折</span>
    </div>
    <div class="discount-container" v-if="item.saveType === 1">
      <div>代金劵</div>
      <span class="discount-text">￥</span>
      <span class="discount-num">{{ item.cashQuota }}</span>
    </div>
    <div class="discount-container" v-if="item.saveType === 2">
      <div>免费</div>
    </div>
    <div class="discount-container" v-if="item.saveType === 3">
      <div>满减</div>
    </div>
    <div class="discount-container" v-if="item.saveType === 4">
      <div>没有优惠</div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.discount-container {
  div {
    font-style: normal;
    font-weight: 600;
    font-size: 0.12rem;
    line-height: 0.18rem;
    text-align: center;
    color: #955500;
    margin-top: 0.26rem;
  }
  span {
    font-weight: 600;
    font-size: 0.32rem;
    line-height: 0.32rem;
    text-align: center;
    color: #955500;
  }
  .discount-text {
    font-size: 0.12rem;
  }
}
</style>