<script setup>
import { ref, reactive, onMounted } from "vue";
</script>
      
<template>
  <div class="dep-container">
    <el-tabs tab-position="left" style="height: 200px" class="demo-tabs">
      <el-tab-pane label="User">User</el-tab-pane>
      <el-tab-pane label="Config">Config</el-tab-pane>
      <el-tab-pane label="Role">Role</el-tab-pane>
      <el-tab-pane label="Task">Task</el-tab-pane>
    </el-tabs>
  </div>
</template>
      
<style lang="less" scoped>
.dep-container {
  margin: 20px;
}
</style>
      