<template>
  <!-- 头部 -->
    <el-header height="66px">
      <div>
        <img src="../../../assets/img/logo1.png" alt />
        <span>臻尚后台管理系统</span>
      </div>
      <el-button type="info" @click="exit" size="medium">退出</el-button>
    </el-header>
</template>

<script>
export default {
  name: 'Header',
  methods: {
    exit() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
  .el-header {
    background-color: #eaedf1;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-left: 0;
    font-size: 22px;
    color: #909399;
  }
  .el-header div img {
    width: 200px;
    border-radius: 20%;
    margin-right: 18px;
  }
  .el-header div {
    display: flex;
    align-items: center;
  }
</style>