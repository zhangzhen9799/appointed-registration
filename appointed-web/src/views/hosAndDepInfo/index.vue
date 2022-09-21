<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

const hosInfo = reactive({});
const depInfo = reactive({});

const breadcrumbList = computed(() => {});

const selectHosHandle = (_hosInfo) => {
  console.log("_hosInfo", _hosInfo);
  Object.assign(hosInfo, _hosInfo);
};

const selectDepHandle = (_depInfo) => {
  Object.assign(depInfo, _depInfo);
};

const selectDateHandle = () => {};

const routeList = [
  {
    name: "SelectHos",
    query: {},
  },
  {
    name: "SelectDep",
  },
  {
    name: "SelectDate",
  },
];
const routeIdx = computed(() =>
  routeList.findIndex((item) => route.name === item.name)
);

const prevBtnHandle = () => {
  if (routeIdx.value > 0) {
    console.log("routeIdx==>", routeIdx.value);
    router.push(routeList[routeIdx.value - 1]);
  }
};
const nextBtnHandle = () => {
  if (routeIdx.value < routeList.length - 1) {
    console.log("routeIdx==>", routeIdx.value);
    router.push(routeList[routeIdx.value + 1]);
  }
};
</script>
  
<template>
  <div class="create-appointed-container">
    <div class="title">创建预约监控单</div>
    <div class="content-box">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item
          :to="{ path: '/dashboad/hos-depart/select-hos' }"
          v-if="hosInfo.name"
          >{{ hosInfo.name }}</el-breadcrumb-item
        >
        <el-breadcrumb-item
          :to="{ path: '/dashboad/hos-depart/select-dep' }"
          v-if="depInfo.name"
          >{{ depInfo.name }}</el-breadcrumb-item
        >
        <el-breadcrumb-item
          :to="{ path: '/dashboad/hos-depart/select-date' }"
          v-if="depInfo.date"
          >{{ depInfo.date }}</el-breadcrumb-item
        >
      </el-breadcrumb>
      <transition>
        <router-view
          @selectHos="selectHosHandle"
          @selectDep="selectDepHandle"
          @selectDate="selectDateHandle"
          :hosInfo="hosInfo"
          :depInfo="depInfo"
        ></router-view>
      </transition>
      <!-- <el-button-group>
        <el-button
          type="primary"
          :disabled="routeIdx <= 0"
          @click="prevBtnHandle"
        >
          上一步
        </el-button>
        <el-button
          type="primary"
          :disabled="routeIdx >= routeList.length - 1"
          @click="nextBtnHandle"
        >
          下一步
        </el-button>
      </el-button-group> -->
    </div>
  </div>
</template>
  
<style lang="less" scoped>
.container {
  height: 100%;
  background-color: #f2f2f2;
  position: relative;
}
.goback {
  position: fixed;
  z-index: 999;
  top: 0.28rem;
  right: 0.25rem;
}
.el-breadcrumb {
  margin: 20px;
}
</style>
  