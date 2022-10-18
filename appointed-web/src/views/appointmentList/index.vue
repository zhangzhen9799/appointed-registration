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

const stateToBtnParams = (state) => {
  let result = {
    type: "success",
    text: "等待监控",
  };
  switch (state) {
    case 1:
      result = {
        type: "info",
        text: "等待监控",
      };
      break;
    case 2:
      result = {
        type: "warning",
        text: "监控中",
      };
      break;
    case 3:
      result = {
        type: "success",
        text: "监控结束",
      };
      break;
    case 4:
      result = {
        type: "info",
        text: "已取消监控",
      };
      break;
  }
  return result;
};
</script>
  
<template>
  <div class="appoint-container">
    <el-table :data="appointmentList" style="width: 100%">
      <el-table-column fixed prop="id" label="预约id" width="150" />
      <el-table-column prop="hosname" label="医院" width="120" />
      <el-table-column prop="second_depname" label="科室" width="120" />
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
      <el-table-column prop="inter_time" label="时间间隔(ms)" width="120" />
      <el-table-column prop="receive_email" label="接收邮箱" width="120" />
      <el-table-column prop="state" label="预约状态">
        <template v-slot:default="{ row }">
          <div>
            <el-tag :type="stateToBtnParams(row.state).type">{{
              stateToBtnParams(row.state).text
            }}</el-tag>
          </div>
        </template>
      </el-table-column>
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
  
<style lang="less" scoped>
.appoint-container {
  height: 80%;
  overflow: auto;
  margin-bottom: 100px;
}

</style>
  