<script setup>
import { ref, reactive, onMounted, computed, watch } from "vue";
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
  patientInfo: {
    cardType: "",
    cardNo: "",
  },
});

const curPatientCardNo = ref("");
const visiterCardNo = ref("");

const patientList = reactive([
  {
    patientName: "黄贺",
    idCardType: "IDENTITY_CARD",
    idCardTypeView: "居民身份证",
    idCardNo: "411421199811092116",
    idCardNoView: "4114****2116",
    phone: "17796761085",
    status: "BIND",
    statusTips: "",
    cardList: [
      {
        cardType: "SOCIAL_SECURITY",
        cardTypeView: "社保卡",
        cardNo: "12984506600X",
        cardNoView: "1298****600X",
        medicareType: "MEDICARE_CARD",
        medicareTypeView: "医保",
      },
      {
        cardType: "IDENTITY_CARD",
        cardTypeView: "居民身份证",
        cardNo: "411421199811092116",
        cardNoView: "4114****2116",
        medicareType: "SELF_PAY_CARD",
        medicareTypeView: "自费",
      },
    ],
    options: [],
  },
]);

const patientCards = reactive([]);
const radioGroupChange = (label) => {
  const cardItem = patientCards.filter((item) => item.cardNo === label)[0];
  monitorSetting.patientInfo.cardNo = cardItem.cardNo;
  monitorSetting.patientInfo.cardType = cardItem.cardType;
};
watch(
  () => curPatientCardNo.value,
  (newVal, oldVal) => {
    if (newVal !== "") {
      patientCards.length = 0;
      patientCards.push(
        ...patientList.filter((item) => item.idCardNo === newVal)[0].cardList
      );
    }
  }
);

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
    await getPatientInfo();
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
        <el-divider content-position="left">选择就诊人信息</el-divider>
        <el-form-item label="选择就诊人">
          <el-radio-group v-model="curPatientCardNo">
            <el-radio
              :label="patientItem.idCardNo"
              border
              size="large"
              v-for="patientItem in patientList"
              :key="patientItem.idCardNo"
            >
              {{ patientItem.patientName }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="选择就诊卡" v-if="patientCards.length > 0">
          <el-radio-group @change="radioGroupChange" v-model="visiterCardNo">
            <el-radio
              :label="patientCard.cardNo"
              size="large"
              border
              v-for="patientCard in patientCards"
              :key="patientCard.cardNo"
              >{{ patientCard.cardTypeView }}</el-radio
            >
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
    <div class="tips">
      注意：系统会在有余号的情况下尝试用您的账号进行尝试挂号！！！
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
        