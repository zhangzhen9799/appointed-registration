<script setup>
import { ref, reactive, onMounted, onUnmounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";

import imgModule from "@/utils/importAssetsImages.js";

const props = defineProps({
  title: {
    type: String,
    default: "癌症早筛优惠券",
  },
  titleTips: {
    type: String,
    default: "有效期剩余7天",
  },
  isReceived: {
    type: Boolean,
    default: false,
  },
  discount: {
    type: Number,
    default: 5.5,
  },
  disable: {
    type: Boolean,
    default: false,
  },
});

const emits = defineEmits(["couponBtnHandle"]);

const couponClickHandle = () => {
  emits("couponBtnHandle", props.isReceived);
};
</script>
<template>
  <div
    :class="['coupon', isReceived ? 'coupon-received' : '']"
    :style="{ 'background-image': `url(${imgModule.couponBgPng}` }"
  >
    <div class="left">
      <div
        class="coupon-img"
        :style="{ 'background-image': `url(${imgModule.couponSvg})` }"
      ></div>
      <div class="coupon-detail">
        <slot name="coupon-discount">
          <div>优惠劵</div>
          <span class="discount-num">{{ discount }}</span>
          <span class="discount-text">折</span>
        </slot>
      </div>
    </div>
    <div class="right">
      <div class="coupon-title">
        <div class="coupon-title-text">{{ title }}</div>
        <div class="coupon-title-tips">{{ titleTips }}</div>
      </div>
      <div
        :class="[
          'coupon-btn',
          isReceived ? 'coupon-btn-inactive' : 'coupon-btn-active',
          disable ? 'coupon-btn-disabled' : '',
        ]"
        @click="couponClickHandle"
      >
        {{ disable ? "联系健康管理师" : isReceived ? "去使用" : "领取" }}
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
div.coupon {
  padding: 0.2rem;
  border-radius: 0.24rem;
  background-size: cover;
  background-repeat: no-repeat;
  background-position: right top;
  display: flex;
  align-items: center;
  .left {
    width: 1.8rem;
    height: 1.8rem;
    border-radius: 0.14rem;
    position: relative;
    overflow: hidden;
    .coupon-img {
      width: 1.8rem;
      height: 1.8rem;
      border-radius: 0.14rem;

      background-size: contain;
      background-repeat: no-repeat;
    }
    .coupon-detail {
      font-size: 0;
      width: 1rem;
      height: 1rem;
      position: absolute;
      z-index: 99;
      right: -8%;
      bottom: -8%;
      border-radius: 50%;
      background: linear-gradient(130.44deg, #fefdf5 21.51%, #fde8ca 83.6%);
      border: 0.02rem solid #f3e5ca;
      text-align: center;
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
  }
  .right {
    height: 1.8rem;
    margin-left: 0.3rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    div.coupon-title {
      font-weight: 600;
      font-size: 0.32rem;
      line-height: 0.45rem;
      color: #313030;
    }

    div.coupon-title-tips {
      font-weight: 400;
      font-size: 0.22rem;
      line-height: 0.31rem;
      color: #ea590f;
    }

    div.coupon-btn {
      min-width: 1.6rem;
      height: 0.6rem;
      padding: 0 0.2rem;
      font-size: 0.28rem;
      border-radius: 0.56rem;
      line-height: 0.6rem;
      text-align: center;

      &-active {
        background: linear-gradient(90deg, #ff9762 0%, #ff5d63 100%);
        color: #fff;
      }

      &-inactive {
        background: #f9e4b7;
        color: #7d5f38;
      }
      &-disabled {
        background: #b6b6b6;
        color: #fff;
      }
    }
  }
  &-received {
    position: relative;
    &::after {
      content: "";
      display: block;
      width: 1.4rem;
      height: 1.4rem;
      position: absolute;
      right: 0;
      bottom: 0;
      z-index: 99;
      border-radius: 0.24rem;
      transform: translateZ(0);
      background-image: url(../../assets/images/coupon-received.svg);
      background-size: contain;
      background-repeat: no-repeat;
      background-position: right bottom;
    }
  }
}
</style>