<template>
  <!-- 侧边栏 -->
  <el-aside :width="isCollapse ? '64px' : '200px'">
    <div class="btnCollapse" @click="btnCollapse">|||</div>
    <el-menu
      background-color="#333744"
      text-color="#fff"
      active-text-color="#409EFF"
      :unique-opened="true"
      :collapse="isCollapse"
      :collapse-transition="false"
      :default-active="activePath"
    >
      <!-- 为了避免作用多个submenu,所以要设置不同的index ，并且要是字符串-->
      <el-submenu :index="item.id + ''" v-for="(item) in menuList" :key="item.id">
        <template slot="title">
          <i :class="iconList[item.id]"></i>
          <span>{{item.authName}}</span>
        </template>
        <el-menu-item
          :index="'/' + child.path"
          v-for="child in item.children"
          :key="child.id"
          @click="changePath(child.path)"
        >
          <template slot="title">
            <i class="el-icon-menu"></i>
            <span>{{child.authName}}</span>
          </template>
        </el-menu-item>
      </el-submenu>
    </el-menu>
  </el-aside>
</template>

<script>
export default {
  name: 'Aside',
  data() {
    return {
      menuList: [],
      iconList: {
        125: 'el-icon-s-custom',
        103: 'el-icon-s-help',
        101: 'el-icon-suitcase',
        102: 'el-icon-tickets',
        145: 'el-icon-s-platform'
      },
      isCollapse: false,
      activePath: ''
    }
  },
  created() {
    this.getMuneList()
    // console.log(this.$route)
    // this.activePath = this.$route.path.slice(5)
    this.activePath = window.sessionStorage.getItem('childPath')
  },
  methods: {
    getMuneList() {
      this.$http.get('menus').then(res => {
        // console.log(res)
        this.menuList = res.data.data
        if (res.data.meta.status !== 200)
          return this.$message.error(res.data.meta.msg)
        this.$message.success(res.data.meta.msg)
      })
    },
    btnCollapse() {
      this.isCollapse = !this.isCollapse
    },
    changePath(childPath) {
      // 这里的路由跳转不需要加“/”,但是字体高亮的是需要加/
      childPath = '/' + childPath
      this.$router.push(childPath)
      window.sessionStorage.setItem('childPath', childPath)
      this.activePath = childPath
    }
  }
}
</script>

<style scoped>
  .el-aside {
    background-color: #333744;
  }
  .e-main {
    background-color: #373d41;
  }
  i {
    margin-right: 10px;
  }
  /* 去掉右侧边框 */
  .el-menu {
    border-right: none;
  }
  .btnCollapse {
    background-color: #4a5064;
    color: #fff;
    font-size: 14px;
    text-align: center;
    height: 25px;
    line-height: 25px;
    letter-spacing: 0.2em;
    cursor: pointer;
  }
</style>