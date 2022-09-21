<script setup>
import { ref, reactive, onMounted } from "vue";
import moment from "moment";
import { getAppointmentListAPI } from "@/api/common.js";

const appointmentList = reactive([]);
onMounted(() => {
  getAppointList();
});

const getAppointList = async () => {
  const res = await getAppointmentListAPI();
  if (res.code === 200) {
    appointmentList.push(...res.data);
  }
};

const timeFormat = (time) => {
  return moment(time).format("YYYY-MM-DD hh:mm:ss");
};
</script>
  
<template>
  <div class="appoint-container">
    <el-table :data="appointmentList" style="width: 100%">
      <el-table-column fixed prop="appointmentid" label="预约id" width="150" />
      <el-table-column prop="hoscode" label="医院" width="120" />
      <el-table-column prop="firstdepcode" label="科室" width="120" />
      <el-table-column prop="seconddepcode" label="门诊" width="120" />
      <el-table-column prop="starttime" label="起始时间" width="120">
        <template v-slot:default="{ row }">
          <div>
            {{ timeFormat(row.starttime) }}
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="endtime" label="终止时间" width="120">
        <template v-slot:default="{ row }">
          <div>
            {{ timeFormat(row.endtime) }}
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="interval" label="时间间隔(ms)" width="120" />
      <el-table-column prop="receive_email" label="接收邮箱" width="120" />
      <el-table-column prop="state" label="预约状态" />
      <!-- <el-table-column fixed="right" label="Operations" width="120">
        <template #default>
          <el-button link type="primary" size="small" @click="handleClick"
            >Detail</el-button
          >
          <el-button link type="primary" size="small">Edit</el-button>
        </template>
      </el-table-column> -->
    </el-table>
  </div>
</template>
  
<style lang="less">
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
</style>
  