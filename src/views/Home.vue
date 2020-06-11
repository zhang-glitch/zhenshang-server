<template>
  <el-container class="home_container">
    <!-- 头部 -->
    <Header></Header>

    <el-container>
      <!-- 侧边栏 -->
      <Aside></Aside>
      <!-- 主体部分 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import Header from '../components/content/home/Header'
import Aside from '../components/content/home/Aside'
export default {
  name: 'Home',
  components: {
    Header,
    Aside
  }
}
</script>

<style scoped>
.home_container {
  height: 100%;
  display: block;
}
.el-container {
  height: 100%;
}
</style>