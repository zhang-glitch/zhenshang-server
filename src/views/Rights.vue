<template>
  <div>
    <breadcrumb :itemList="['权限管理', '权限列表']" />
    <el-card>
      <el-table :data="rightsList" style="width: 100%" border stripe>
        <el-table-column type="index" label="ID"></el-table-column>
        <el-table-column prop="authName" label="权限名称"></el-table-column>
        <el-table-column prop="path" label="路径"></el-table-column>
        <el-table-column label="权限等级">
          <template slot-scope="scope">
            <el-tag :type="typeList[scope.row.level]" size="medium">{{judgeLevel(scope.row.level)}}</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import Breadcrumb from '../components/common/Breadcrumb'
export default {
  name: 'Rights',
  data() {
    return {
      rightsList: [],
      typeList: {
        '0': '',
        '1': 'success',
        '2': 'warning'
      }
    }
  },
  created() {
    this.getRightsList()
  },
  components: {
    Breadcrumb
  },
  methods: {
    getRightsList() {
      this.$http.get('rights/list').then(res => {
        // console.log(res)
        if(res.data.meta.status !== 200) return this.$message.error(('获取数据失败'))
        this.$message.success(('获取数据成功'))
        this.rightsList = res.data.data
      })
    }
  },
  computed: {
    judgeLevel() {
      // switch (level) {
      //   case 1:
      //     return '一级'
          
      //   case 2:
      //     return '二级'
          
      //   case 3:
      //     return '三级'
         
      //   default:
      //     break;
      // }
      return function(level) {
        if(level == '0') {
          return '一级'
        }else if(level == '1') {
          return '二级'
        }else {
          return '三级'
        }
      }
    }
  }
}
</script>

<style scoped>
  .el-tag {
    height: 36px;
    line-height: 36px;
    width: 66px;
    text-align: center;
  }
</style>