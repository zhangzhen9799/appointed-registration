<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

import {
  postAppointmentRecordAPI,
  send114smsCodeAPI,
  login114ByPhoneAPI,
  getPatientInfoAPI,
} from "@/api/common.js";

const route = useRoute();
const router = useRouter();

const monitorSetting = reactive({
  timeInterval: 300,
  email: "",
  timeRange: [new Date(), new Date()],
  phone: "",
  code: "",
  patientInfo: {},
});

const formRules = {
  email: [
    {
      required: true,
      message: "请输入邮箱",
      trigger: "blur",
    },
    {
      type: "email",
      message: "请输入正确邮箱",
      trigger: ["blur", "change"],
    },
  ],
  timeInterval: [
    {
      required: true,
      message: "请输入时间间隔",
      trigger: "blur",
    },
  ],
  phone: [
    {
      required: true,
      message: "请输入114平台手机号",
      trigger: "blur",
    },
  ],
  code: [
    {
      required: true,
      message: "请输入验证码",
      trigger: "blur",
    },
  ],
};

// 发送验证码
const send114smsCode = async () => {
  const { data } = await send114smsCodeAPI({ phone: monitorSetting.phone });
  if (data.success === true) {
    ElMessage({
      message: "短信发送成功",
      type: "success",
    });
  } else {
    ElMessage({
      message: "短信发送失败，请稍候重试",
      type: "warning",
    });
  }
};

// 登录114
const login114Handle = async () => {
  const { data } = await login114ByPhoneAPI({
    phone: monitorSetting.phone,
    code: monitorSetting.code,
  });
  if (data.success === true) {
    ElMessage({
      message: "登录114成功",
      type: "success",
    });
    await getPatientInfo()
  } else {
    ElMessage({
      message: "登录114失败，请稍候重试",
      type: "warning",
    });
  }
};

// 获取就诊人信息
const getPatientInfo = async () => {
  const { data } = await getPatientInfoAPI();
  if (data.data.length > 0) {
    console.log(data.data);
    ElMessage({
      message: "查找就诊人信息成功",
      type: "success",
    });
  } else {
    ElMessage({
      message: "查找信息失败，请确认114平台是否已经实名！！！",
      type: "warning",
    });
  }
};

const createAppointment = async () => {
  const params = {
    starttime: monitorSetting.timeRange[0],
    endtime: monitorSetting.timeRange[1],
    hoscode: route.query.hoscode,
    firstcode: route.query.firstcode,
    secondcode: route.query.secondcode,
    receiveemail: monitorSetting.email,
    interval: monitorSetting.timeInterval,
  };

  const { data } = await postAppointmentRecordAPI(params);

  if (data.data === "success") {
    ElMessage({
      message: "创建成功",
      type: "success",
    });
    router.push({ name: "AppointmentList" });
  } else {
    ElMessage({
      message: "创建失败，请稍候重试",
      type: "warning",
    });
  }
};
</script>
        
<template>
  <div class="date-container">
    <div class="base-info">
      <el-form
        :model="monitorSetting"
        label-position="right"
        :rules="formRules"
      >
        <el-form-item label="时间范围:" prop="timeRange">
          <el-date-picker
            v-model="monitorSetting.timeRange"
            type="datetimerange"
            range-separator="To"
            start-placeholder="Start date"
            end-placeholder="End date"
          />
        </el-form-item>
        <el-form-item label="时间间隔:" prop="timeInterval">
          <el-input v-model.number="monitorSetting.timeInterval">
            <template #append>ms</template>
          </el-input>
        </el-form-item>
        <el-form-item label="提醒邮箱:" prop="email">
          <el-input v-model="monitorSetting.email" />
        </el-form-item>
        <el-form-item label="114平台手机号:" prop="phone">
          <el-input v-model="monitorSetting.phone">
            <template #append>
              <div @click="send114smsCode" class="cursor-btn">发送验证码</div>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="验证码:" prop="code">
          <el-input v-model="monitorSetting.code">
            <template #append>
              <div @click="login114Handle" class="cursor-btn">登录114</div>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="就诊信息:">
          <el-radio-group v-model="monitorSetting.patientInfo">
            <el-radio label="1" border>Option A</el-radio>
            <el-radio label="2" border>Option B</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="createAppointment">
            创建预约单
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="tips">
      注意：系统会根据您设定的时间对您选择的医院-科室进行查询，如果有余量则会通过邮件通知您！！！
    </div>
  </div>
</template>
        
<style lang="less" scoped>
div.date-container {
  div.base-info-title {
    font-size: 18px;
    color: #333;
    line-height: 27px;
  }

  div.tips {
    font-size: 14px;
    color: #4d4d4d;
  }

  .el-form {
    width: 500px;
  }

  .cursor-btn {
    cursor: pointer;
  }
}
</style>
        