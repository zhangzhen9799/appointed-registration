<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

import { postAppointmentRecordAPI } from "@/api/common.js";

const route = useRoute();
const router = useRouter();

const monitorSetting = reactive({
  timeInterval: 300,
  email: "",
  timeRange: [new Date(), new Date()],
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

  if (data.success) {
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
}
</style>
        