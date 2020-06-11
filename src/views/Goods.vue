<template>
  <div>
    <breadcrumb :itemList="['商品管理', '商品列表']" />
    <el-card>
      <!-- 搜索框 -->
      <el-input placeholder="请输入内容" v-model="query" class="input-with-select" clearable @clear="getGoodsList">
        <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
      </el-input>
      <el-button type="primary" size="medium" @click="addGoodsPage">添加商品</el-button>
      <!-- 表格 -->
      <el-table :data="goodsList" style="width: 100%" border stripe>
        <el-table-column type="index" label="ID"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称"></el-table-column>
        <el-table-column prop="goods_price" label="商品价格(元)"></el-table-column>
        <el-table-column prop="goods_number" label="商品数量"></el-table-column>
        <el-table-column prop="goods_weight" label="商品重量"></el-table-column>
        <el-table-column prop="upd_time" label="更新时间"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <!-- 添加 -->
            <el-button type="primary" icon="el-icon-edit" circle @click="editGoodsBtn(scope.row)"></el-button>
            <!-- 删除 -->
            <el-button type="danger" icon="el-icon-delete" circle @click="deleteGoodsBtn(scope.row)"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="pagenum"
        :page-sizes="[1, 5, 10, 20]"
        :page-size="pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 编辑商品 -->
    <el-dialog title="修改商品数据" :visible.sync="editGoodsDialogVisible" width="50%">
      <el-form :model="goodsForm" :rules="goodsRules" ref="goodsFormRef" label-width="100px">
        <el-form-item label="商品价格" prop="goods_price">
          <el-input v-model="goodsForm.goods_price"></el-input>
        </el-form-item>
        <el-form-item label="商品数量" prop="goods_number">
          <el-input v-model="goodsForm.goods_number"></el-input>
        </el-form-item>
        <el-form-item label="商品重量" prop="goods_weight">
          <el-input v-model="goodsForm.goods_weight"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editGoodsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editGoods">修 改</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import Breadcrumb from '../components/common/Breadcrumb'
export default {
  name: 'Goods',
  created() {
    this.getGoodsList()
  },
  data() {
    return {
      goodsList: [],
      // 写一下三个数据最好写在对象中，方便
      query: '',
      // 当前页码
      pagenum: 1,
      // 每页个数
      pagesize: 5,
      total: 0,
      editGoodsDialogVisible: false,
      goodsForm: {},
      goodsRules: {
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' },
          { min: 1, max: 10, message: '长度在 1 到 10 个字符', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' },
          { min: 1, message: '数量至少为1', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' },
          { min: 1, max: 10, message: '长度在 1 到 10 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  components: {
    Breadcrumb
  },
  methods: {
    getGoodsList() {
      this.$http
        .get('goods', {
          params: {
            query: this.query,
            pagenum: this.pagenum,
            pagesize: this.pagesize
          }
        })
        .then(res => {
          // console.log(res)
          if (res.data.meta.status !== 200)
            return this.$message.error('获取商品列表失败')
          this.$message.success('获取商品列表成功')
          this.goodsList = res.data.data.goods
          res.data.data.goods.forEach(item => {
            // console.log(item.upd_time)
            item.upd_time = this.changeTimestamp(item.upd_time)
          })
          this.pagenum = parseInt(res.data.data.pagenum)
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
    // 每页多少条
    handleSizeChange(valsize) {
      // console.log(valsize)
      this.pagesize = valsize
      this.getGoodsList()
    },
    // 当前页
    handleCurrentChange(valnum) {
      this.pagenum = valnum
      this.getGoodsList()
    },
    // 编辑商品,点击修改商品按钮
    editGoodsBtn(item) {
      this.editGoodsDialogVisible = true
      item.attrs = []
      // 点击按钮后绑定数据
      this.goodsForm = item
    },
    // 确认修改
    editGoods() {
      this.editGoodsDialogVisible = false
      // console.log(this.goodsForm)
      // 预验证
      this.$refs.goodsFormRef.validate(val => {
        if (!val) return this.$message.info('请将表单项填写完整')
        this.$http
          .put(`goods/${this.goodsForm.goods_id}`, this.goodsForm)
          .then(res => {
            console.log(res)
            if(res.data.meta.status !== 200) return this.$message.error('修改失败')
          })
      })
    },
    // 删除按钮
    deleteGoodsBtn(item) {
       this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(result => {
          if (result === 'confirm') {
            this.$http.delete(`goods/${item.goods_id}`).then(res => {
              console.log(res)
              if (res.data.meta.status !== 200)
                return this.$message.info('删除失败')
              this.$message.success('删除成功')
              this.getGoodsList()
            })
          }
        })
        .catch(err => {
          if (err === 'cancel') {
            this.$message.info('删除失败')
          }
        })
    },
    addGoodsPage() {
      // ‘/’表示根路由
      this.$router.push('/goods/add')
    }
  }
}
</script>

<style scoped>
.el-input {
  width: 40%;
  margin-right: 15px;
}
.input-with-select {
  background-color: #fff;
}
</style>