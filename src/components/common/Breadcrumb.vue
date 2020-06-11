<template>
  <!-- 面包屑 -->
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item v-for="item in itemList" :key="item">{{item}}</el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script>
export default {
  name: 'Breadcrumb',
  props: {
    itemList: {
      type: Array,
      defalut() {
        return []
      },
      required: true
    }
  }
}
</script>

<style scoped>
.el-breadcrumb {
  margin-bottom: 20px !important;
}
</style>