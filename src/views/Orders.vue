<template>
  <div>
    <breadcrumb :itemList="['订单管理', '订单列表']" />
    <el-card>
      <!-- 查询 -->
      <el-input placeholder="请输入内容" v-model="getOrders.query" class="input" clearable>
        <el-button slot="append" icon="el-icon-search" @click="getOrdersList"></el-button>
      </el-input>
      <!-- 表格 -->
      <el-table :data="ordersList" style="width: 100%" border stripe>
        <el-table-column type="index" label="ID"></el-table-column>
        <el-table-column prop="order_number" label="订单编号" width="280px"></el-table-column>
        <el-table-column prop="order_price" label="订单价格"></el-table-column>
        <el-table-column label="是否付款">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.order_pay === '1'">已付款</el-tag>
            <el-tag
              type="danger"
              v-else-if="scope.row.order_pay === '0' || scope.row.order_pay === '2'"
            >未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货"></el-table-column>
        <el-table-column prop="update_time" label="下单时间"></el-table-column>
        <el-table-column label="操作">
          <template>
            <!-- 修改地址 -->
            <el-button type="primary" icon="el-icon-edit" circle @click="editAddress"></el-button>
            <!-- 物流信息 -->
            <el-button
              type="success"
              icon="el-icon-location-information"
              circle
              @click="viewInformation"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="getOrders.pagenum - 0"
        :page-sizes="[1, 5, 10, 20]"
        :page-size="getOrders.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 修改地址 -->
    <el-dialog title="修改地址" :visible.sync="editDialogVisible" width="60%" @close="resetEditConfig">
      <!-- 三级联动 -->

      <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="100px">
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader :options="cityOptions" v-model="editForm.address1" size="small"></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="editForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editDialogVisible = false">修 改</el-button>
      </span>
    </el-dialog>
    <el-dialog title="物流信息" :visible.sync="viewDialogVisible" width="55%">
      <el-steps direction="vertical" :active="0">
        <el-step :title="item.time" :description="item.context" v-for="(item,index) in informationList" :key="index"></el-step>
      </el-steps>
    </el-dialog>
  </div>
</template>

<script>
import Breadcrumb from '../components/common/Breadcrumb'
import cityData from '../assets/city/city'
export default {
  name: 'Orders',
  data() {
    return {
      ordersList: [],
      getOrders: {
        // 查询的参数
        query: '',
        // 第几页
        pagenum: 1,
        // 每页显示多少条
        pagesize: 5
      },
      total: 0,
      editDialogVisible: false,
      editForm: {
        address1: [],
        address2: ''
      },
      editRules: {
        address1: [{ required: true, message: '请选择区域', trigger: 'blur' }],
        address2: [
          { required: true, message: '请填写详细地址信息', trigger: 'blur' }
        ]
      },
      cityOptions: cityData,
      informationList: [],
      viewDialogVisible: false
    }
  },
  created() {
    this.getOrdersList()
  },
  components: {
    Breadcrumb
  },
  methods: {
    getOrdersList() {
      this.$http
        .get('orders', {
          params: this.getOrders
        })
        .then(res => {
          // console.log(res)
          if (res.data.meta.status !== 200)
            return this.$message.error('获取订单数据失败')
          this.$message.success('获取订单数据成功')
          res.data.data.goods.forEach(item => {
            item.update_time = this.changeTimestamp(item.update_time)
          })
          this.ordersList = res.data.data.goods
          this.getOrders.pagenum = res.data.data.pagenum
          this.total = res.data.data.total
        })
    },
    // 转化时间戳
    changeTimestamp(times) {
      let date = new Date(times)
      let Y = date.getFullYear() + '-'
      let M =
        (date.getMonth() + 1 < 10
          ? '0' + (date.getMonth() + 1)
          : date.getMonth() + 1) + '-'
      let D = date.getDate() + ' '
      let h = date.getHours() + ':'
      let m = date.getMinutes() + ':'
      let s = date.getSeconds()
      return Y + M + D + h + m + s
    },
    // 当页码改变时
    handleCurrentChange(newPagenum) {
      this.pagenum = newPagenum
      this.getOrdersList()
    },
    // 当每页数量改变时
    handleSizeChange(newPagesize) {
      this.pagesize = newPagesize
      this.getOrdersList()
    },
    // 修改地址
    editAddress() {
      this.editDialogVisible = true
    },
    // 关闭时
    resetEditConfig() {
      this.$refs.editFormRef.resetFields()
    },
    // 查看物流信息
    viewInformation() {
      this.viewDialogVisible = true
      this.$http.get('/kuaidi/1106975712662').then(res => {
        // console.log(res)
        if (res.data.meta.status !== 200)
          return this.$message.error('获取物流信息失败')
        this.$message.success('获取物流信息成功')
        this.informationList = res.data.data
      })
    }
  }
}
</script>

<style scoped>
.input {
  width: 40%;
}
.el-cascader {
  width: 100%;
}
.el-step__title.is-process {
  font-weight: 400 !important;
}
.el-step__title {
  font-size: 12px !important;
}
</style>