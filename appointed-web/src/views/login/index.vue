<script setup>
import { reactive } from "vue";
import { useRouter } from "vue-router";

import { loginAPI } from "@/api/common.js";

const router = useRouter();

const loginParams = reactive({ email: "", password: "" });
const loginHandle = async () => {
  const {
    data: { token },
  } = await loginAPI(loginParams);
  if (token) {
    localStorage.setItem("token", token);
    ElMessage({
      message: "login success",
      type: "success",
    });
    router.push({
      name: "Home",
    });
  } else {
    ElMessage.error("账号密码错误，请确认后重试");
  }
};
</script>
  
<template>
  <div class="login-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>114预约挂号监控</span>
        </div>
      </template>
      <el-form label-position="left" label-width="100px" :model="loginParams">
        <el-form-item label="Email">
          <el-input v-model="loginParams.email" />
        </el-form-item>
        <el-form-item label="Password">
          <el-input v-model="loginParams.password" type="password" />
        </el-form-item>
      </el-form>
      <el-button type="primary" @click="loginHandle" class="login-box">
        Login
      </el-button>
    </el-card>
  </div>
</template>
  
<style lang="less">
.login-container {
  height: 100%;
  background-color: #f2f2f2;
  position: relative;
}

.box-card {
  width: 500px;
  height: 400px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.login-box {
  display: block;
  width: 180px;
  margin: 0 auto;
}
</style>
  