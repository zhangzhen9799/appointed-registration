<script setup>
import { ref, reactive, onMounted } from "vue";
import { getDepListByHoscodeAPI } from "@/api/common.js";
import { useRoute, useRouter } from "vue-router";

const emits = defineEmits(["selectDep"]);
const route = useRoute();
const router = useRouter();

onMounted(() => {
  validateHosInfoExistence();
});

const validateHosInfoExistence = () => {
  console.log("route.query.hoscode", route.query.hoscode);
  if (route.query.hoscode !== undefined) {
    getDepListHandle(route.query.hoscode);
  } else {
    // 请先选择医院，再来选择科室
    ElMessage({
      message: "请先选择医院，再来选择科室",
      type: "warning",
    });
  }
};

const departList = reactive([]);

const getDepListHandle = async (hoscode) => {
  const res = await getDepListByHoscodeAPI({ hoscode });
  if (res.code === 200 && res.data.length > 0) {
    departList.push(...res.data);
  } else {
    // 没有数据或者是请求异常，请联系it小哥修复
    ElMessage({
      message: "没有数据或者是请求异常，请联系it小哥修复",
      type: "warning",
    });
  }
};

const departItemClick = (parent, child) => {
  const firstDepcode = parent.code;
  const secondDepcode = child.code;
  const name = child.name;
  emits("selectDep", { firstDepcode, secondDepcode, name });
  router.push({
    name: "SelectDate",
    query: {
      hoscode: route.query.hoscode,
      firstcode: firstDepcode,
      secondcode: secondDepcode,
    },
  });
};
</script>
      
<template>
  <div class="dep-container">
    <el-tabs tab-position="left">
      <el-tab-pane
        :label="item.name"
        v-for="item in departList"
        :key="item.departid"
      >
        <div class="item-children">
          <div
            class="item-child"
            v-for="v in item.children"
            :key="v.departid"
            @click="departItemClick(item, v, $e)"
          >
            {{ v.name }}
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
      
<style lang="less" scoped>
.dep-container {
  margin: 20px;
  min-height: 80vh;
}

div.item-children {
  width: 60vw;
  display: flex;
  flex-wrap: wrap;
  div.item-child {
    font-size: 18px;
    line-height: 36px;
    width: 20%;
    height: 36px;
    text-align: center;
    cursor: pointer;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    &:hover {
      color: #409eff;
    }
  }
}
</style>
      