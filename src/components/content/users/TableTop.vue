<template>
  <el-row>
        <el-col :span="10">
          <!-- 输入框 -->
          <el-input placeholder="请输入内容" v-model="getParams.query" clearable @clear="getUsers">
            <!-- 双向绑定，来利用query来搜索内容 -->
            <el-button slot="append" icon="el-icon-search" @click="getUsers"></el-button>
          </el-input>
        </el-col>
        <el-col :span="6">
          <el-button type="primary" size="medium" class="btn" @click="addDialogVisible = true">添加人员</el-button>
        </el-col>
      </el-row>
</template>

<script>
export default {
  name: 'TableTop'
}
</script>

<style scoped>

</style>