<template>
  <div>
    <breadcrumb :itemList="['商品管理', '商品分类']" />
    <el-card>
      <!-- 添加分类 -->
      <el-button type="primary" size="medium" @click="addCateogryBtn">添加分类</el-button>
      <el-table
        :data="categoryList"
        style="width: 100%"
        row-key="cat_id"
        border
        stripe
        :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
      >
        <!-- <el-table-column prop="_id" label="ID" width="60"></el-table-column> -->
        <el-table-column prop="cat_name" label="分类名称"></el-table-column>
        <el-table-column label="是否有效">
          <template slot-scope="scope">
            <!-- 有效   这里的cat_deleted有问题-->
            <i class="el-icon-success" v-if="!scope.row.cat_deleted" style="color: lightgreen;"></i>
            <!-- 无效 -->
            <i class="el-icon-error" v-else style="color: red;"></i>
          </template>
        </el-table-column>
        <el-table-column label="排序">
          <template slot-scope="scope">
            <el-tag
              :type="typeList[scope.row.cat_level]"
              size="medium"
            >{{judgeLevel(scope.row.cat_level)}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="address" label="操作">
          <template slot-scope="scope">
            <!--  -->
            <div calss="operate">
              <!-- 修改 -->
              <el-button
                type="primary"
                icon="el-icon-edit"
                round
                @click="editCateogryBtn(scope.row.cat_id)"
              >编辑</el-button>
              <!-- 删除 -->
              <el-button
                type="danger"
                icon="el-icon-delete"
                round
                @click="deleteCategoryBtn(scope.row.cat_id)"
              >删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页显示 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="query.pagenum"
        :page-sizes="[1, 5, 10, 20]"
        :page-size="query.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 修改分类   @close="resetEditConfig"-->
    <el-dialog title="修改分类" :visible.sync="editDialogVisible" width="50%">
      <el-form
        :model="categoryForm"
        :rules="categoryRules"
        ref="categoryFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="categoryForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCateogry">修 改</el-button>
      </span>
    </el-dialog>
    <!-- 添加分类 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="resetCategoryConfig"
    >
      <el-form
        :model="addCategoryForm"
        :rules="addCategoryRules"
        ref="addCategoryFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCategoryForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <el-cascader
            v-model="selectId"
            :options="parentCategoryList"
            :props="cascaderProps"
            @change="handleChange"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCateogry">添 加</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import Breadcrumb from '../components/common/Breadcrumb'
export default {
  name: 'Category',
  data() {
    return {
      categoryList: [],
      query: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      total: 0,
      typeList: {
        '0': '',
        '1': 'success',
        '2': 'warning'
      },
      // 修改分类
      editDialogVisible: false,
      categoryForm: {},
      categoryRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
        ]
      },
      currentEditCategoryId: 0,
      // 添加分类
      addCategoryForm: {
        // // 这里的name值是双向绑定的
        // cat_name: '',
        cat_pid: 0,
        cat_level: 0
      },
      addCategoryRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
        ]
      },
      addDialogVisible: false,

      parentCategoryList: [],
      // 为cascader的显示指明配置
      cascaderProps: {
        // 指定怎样展示父级分类（移入）
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        // // 指定可以选中任意一级的父级分类
        // checkStrictly: true
      },
      // 保存选中的父级分类的id
      selectId: []
    }
  },
  created() {
    this.getcategoryList()
    // this.isChildren(this.categoryList)
  },
  components: {
    Breadcrumb
  },
  methods: {
    getcategoryList() {
      this.$http.get('categories', { params: this.query }).then(res => {
        // console.log(res)
        if (res.data.meta.status !== 200) {
          return this.$message.error('获取分类列表失败')
        }
        this.categoryList = res.data.data.result
        // console.log(this.categoryList[1].cat_deleted)
        for (let index in this.categoryList) {
          if (this.categoryList[index].children) {
            this.categoryList[index].hasChildren
            // 为每一项添加id
            this.categoryList[index]._id = parseInt(index) + 1
          }
          if (this.categoryList[index] instanceof Array) {
            for (let item2 of this.categoryList[index]) {
              if (item2.children) {
                item2.hasChildren
              }
            }
          }
        }
        this.total = res.data.data.total
      })
    },
    // isChildren(itemList) {
    //   let item = {}
    //   if(itemList instanceof Array) {
    //     for(item of itemList) {
    //       if(item.children) {
    //         item.hasChildren = true
    //       }
    //     }
    //   }

    //   return this.isChildren(item)
    // }
    // 每页数量发生改变时
    handleSizeChange(newPageSize) {
      // console.log(newPageSize)
      this.query.pagesize = newPageSize
      this.getcategoryList()
    },
    // 页码发生改变时
    handleCurrentChange(newPage) {
      //这里要发送请求
      this.getcategoryList()
      // console.log(newPage)
      this.query.pagenum = newPage
    },
    // 点击编辑
    editCateogryBtn(id) {
      // 保存id,确认是会用到
      this.currentEditCategoryId = id
      this.$http.get(`categories/${id}`).then(res => {
        // console.log(res)
        if (res.data.meta.status !== 200) {
          return this.$message.error('获取分类失败')
        }
        this.$message.success('获取分类成功')
        this.categoryForm = res.data.data
      })
      this.editDialogVisible = true
    },
    // 确认编辑
    editCateogry() {
      // 确认之前来一个预验证
      this.$refs.categoryFormRef.validate(val => {
        if (!val) return this.$message.error('修改失败')
        this.$http
          .put(`categories/${this.currentEditCategoryId}`, {
            cat_name: this.categoryForm.cat_name
          })
          .then(res => {
            // console.log(res)
            if (res.data.meta.status !== 200) {
              return this.$message.error('修改失败')
            }
            this.$message.success('修改成功')
            this.getcategoryList()
          })
      })
      this.editDialogVisible = false
    },
    // 点击删除按钮
    deleteCategoryBtn(id) {
      this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(result => {
          if (result === 'confirm') {
            this.$http.delete(`categories/${id}`).then(res => {
              // console.log(res)
              if (res.data.meta.status !== 200)
                return this.$message.error('删除失败')
              this.$message.success('删除成功')
              this.getcategoryList()
            })
          }
        })
        .catch(err => {
          if (err === 'cancel') {
            this.$message.info('删除失败')
          }
        })
    },
    // 点击添加按钮，先获取父级列表
    addCateogryBtn() {
      // 这里只是获取前两极的分类，不需要第三极，所以要重新发送请求，不可以用categoryList
      this.$http.get('categories', { params: { type: 2 } }).then(res => {
        if (res.data.meta.status !== 200)
          return this.$message.error('获取全部父级分类失败')
        // console.log(res)
        this.parentCategoryList = res.data.data
        // console.log(this.parentCategoryList)
        this.$message.success('获取全部父级分类成功')
      })
      this.addDialogVisible = true
    },
    // 添加分类     (重点)
    addCateogry() {
      // console.log(this.addCategoryForm)
      this.$refs.addCategoryFormRef.validate(val => {
        if (!val) return
        this.$http.post('categories', {
          cat_pid: this.addCategoryForm.cat_pid,
          cat_name: this.addCategoryForm.cat_name,
          cat_level: this.addCategoryForm.cat_level
        }).then(res => {
          console.log(res)
          if (res.data.meta.status !== 201)
            return this.$message.error('添加分类失败')
          this.$message.success('添加分类成功')
          this.getcategoryList()
          console.log(this.categoryList)
        })
        this.addDialogVisible = false
      })
    },
    handleChange() {
      // console.log(this.selectId)
      if (this.selectId.length > 0) {
        this.addCategoryForm.cat_pid = this.selectId[this.selectId.length - 1]
        // 数组中有多少项，分类层级就是几
        this.addCategoryForm.cat_level = this.selectId.length
      } else {
        this.addCategoryForm.cat_pid = 0
        this.addCategoryForm.cat_level = 0
      }
    },
    // 当关闭会话框时，重置表单
    resetCategoryConfig() {
      this.$refs.addCategoryFormRef.resetFields()
      this.selectId = []
      this.addCategoryForm.cat_level = 0
      this.addCategoryForm.cat_pid = 0
    }
  },
  computed: {
    judgeLevel() {
      return function(level) {
        if (level == '0') {
          return '一级'
        } else if (level == '1') {
          return '二级'
        } else {
          return '三级'
        }
      }
    }
  }
}
</script>

<style scoped>
.el-cascader {
  width: 100%;
}
</style>