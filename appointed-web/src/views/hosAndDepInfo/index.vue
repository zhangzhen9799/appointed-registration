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

      <router-view v-slot="{ Component }">
        <transition name="fade-transform" mode="out-in">
          <component
            :is="Component"
            @selectHos="selectHosHandle"
            @selectDep="selectDepHandle"
            @selectDate="selectDateHandle"
            :hosInfo="hosInfo"
            :depInfo="depInfo"
            class="transition-com"
          />
        </transition>
      </router-view>
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

.content-box {
  position: relative;
  .transition-com {
    position: absolute;
  }
}
.fade-transform-leave-active,
.fade-transform-enter-active {
  transition: all 0.5s;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
  