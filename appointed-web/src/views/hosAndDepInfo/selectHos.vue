<script setup>
import { ref, reactive, onMounted } from "vue";

import { getHosListAPI } from "@/api/common.js";
import { Picture as IconPicture } from "@element-plus/icons-vue";

const emits = defineEmits(["selectHos"]);

const hosList = reactive([]);
const totalCount = ref(0);
const pageNo = ref(1);
const pageSize = ref(60);
const searchQuery = reactive({
  hosName: "",
  levelText: "",
});

onMounted(() => {
  getHosListAPIHandle();
});

const getHosListAPIHandle = async () => {
  const { data } = await getHosListAPI({
    name: searchQuery.hosName,
    levelText: searchQuery.levelText,
    pageSize: pageSize.value,
    pageNo: pageNo.value,
  });
  if (data && data.list) {
    hosList.length = 0;
    hosList.push(...data.list);
    totalCount.value = data.totalCount;
    console.log("totalCount", totalCount.value);
  } else {
    ElMessage({
      message: "未查到数据，请稍后重试",
      type: "warning",
    });
  }
};

const submitHandle = () => {
  pageNo.value = 1;
  getHosListAPIHandle();
};

const changePageHandle = (curPageNo) => {
  pageNo.value = curPageNo;
  getHosListAPIHandle();
};

const clickHosItem = (item, $e) => {
  emits("selectHos", item);
};
</script>
    
<template>
  <div class="hos-container">
    <el-form :inline="true" :model="searchQuery" class="demo-form-inline">
      <el-form-item label="医院名称">
        <el-input v-model="searchQuery.hosName" placeholder="医院名称" />
      </el-form-item>
      <el-form-item label="医院级别">
        <el-input v-model="searchQuery.levelText" placeholder="医院级别" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitHandle">确认</el-button>
      </el-form-item>
    </el-form>
    <el-divider />
    <div class="hos-list">
      <div
        class="hos-item"
        v-for="item in hosList"
        :key="item.hosid"
        @click="clickHosItem(item)"
      >
        <div class="hos-item-left">
          <div class="hos-item-title">{{ item.name.length > 24 ? item.name.substring(0, 24) + '...' : item.name }}</div>
          <div class="hos-item-bottom">
            <div class="hos-item-level">{{ item.levelText }}</div>
            <div class="hos-item-time">每天{{ item.openTimeText }}放号</div>
          </div>
        </div>
        <div class="hos-item-right">
          <el-image :src="item.picture">
            <template #error>
              <div class="image-slot">
                <el-icon><icon-picture /></el-icon>
              </div>
            </template>
          </el-image>
        </div>
      </div>
    </div>
    <el-pagination
      background
      small
      layout="prev, pager, next"
      :total="totalCount"
      :page-size="pageSize"
      @current-change="changePageHandle"
    />
  </div>
</template>
    
<style lang="less" scoped>
.hos-container {
  margin: 20px;
}
div.hos-list {
  overflow: scroll;
  height: 500px;
  div.hos-item {
    float: left;
    width: 300px;
    height: 70px;
    padding: 20px;
    display: flex;
    margin: 0 20px 20px 0;
    justify-content: space-between;
    border-radius: 4px;
    background-color: #fff;
    box-shadow: 0px 0px 4px rgb(153, 153, 153);
    margin: 10px;
    cursor: pointer;
    div.hos-item-left {
      width: 80%;
      margin-right: 20px;
      div.hos-item-title {
        font-size: 16px;
        font-weight: 500;
      }

      div.hos-item-bottom {
        font-size: 12px;
        margin-top: 12px;
        color: #4d4d4d;
        display: flex;
        justify-content: space-between;
        div.hos-item-level {
        }

        div.hos-item-time {
        }
      }
    }

    div.hos-item-right {
      .el-image {
        width: 50px;
        height: 50px;
        border-radius: 2px;
      }
    }
  }
}

.el-pagination {
  margin-top: 20px;
}

.demo-form-inline {
  .el-form-item {
    margin-bottom: 0;
  }
}
</style>
    