<script setup>
import { ref, reactive, onMounted, watch } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const elMenuActive = ref("0");

const menuList = [
  {
    label: "平台信息",
    index: "0",
    route: { name: "Home" },
  },
  {
    label: "预约",
    index: "1",
    route: { name: "SelectHos" },
  },
  {
    label: "我的预约订单",
    index: "2",
    route: { name: "AppointmentList" },
  },
];


</script>
  
<template>
  <h1 class="title">监控平台</h1>
  <div class="dashboad-container">
    <el-menu router :default-active="elMenuActive">
      <el-menu-item
        v-for="item in menuList"
        :index="item.index"
        :key="item.index"
        :route="item.route"
      >
        <span>{{ item.label }}</span>
      </el-menu-item>
    </el-menu>
    <div class="router-box">
      <router-view></router-view>
    </div>
  </div>
</template>
  
<style lang="less" scoped>
.title {
  margin: 10px;
  font-size: 26px;
}
.dashboad-container {
  height: 100%;
  display: flex;
  .el-menu {
    width: 200px;
  }
}

.router-box {
  margin: 10px 20px;
  overflow: hidden;
  width: 90%;
}
</style>
  