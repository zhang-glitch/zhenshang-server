<template>
  <div>
    <breadcrumb :itemList="['商品管理', '参数列表']" />
    <el-card>
      <!-- 提示文字 -->
      <el-alert title="注意：只允许为第三级分类设置相关参数！" type="warning" show-icon :closable="false"></el-alert>
      <!-- 选择联动框 -->
      <div class="cascader">
        <span>选择商品分类：</span>
        <el-cascader
          v-model="selectedId"
          :options="cascaderList"
          :props="paramsProps"
          @change="handleChange"
          clearable
          :show-all-levels="false"
        ></el-cascader>
      </div>

      <!-- tab栏 -->
      <el-tabs v-model="activeName" @tab-click="tabClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" :disabled="isSelect" @click="addParamsBtn">添加参数</el-button>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" :disabled="isSelect" @click="addParamsBtn">添加属性</el-button>
        </el-tab-pane>
      </el-tabs>

      <!-- 动态, 静态参数表格 -->
      <el-table :data="isList" stripe border style="width: 100%">
        <el-table-column type="expand">
          <!-- 渲染可选项 -->
          <template slot-scope="scope">
            <el-tag
              :key="index"
              v-for="(item, index) in scope.row.attr_vals"
              closable
              :disable-transitions="true"
              @close="tagClose(scope.row, item)"
            >{{item}}</el-tag>
            <el-input
              class="input-new-tag"
              v-if="scope.row.inputVisible"
              v-model="scope.row.inputValue"
              ref="saveTagInput"
              size="small"
              @keyup.enter.native="handleInputConfirm(scope.row)"
              @blur="handleInputConfirm(scope.row)"
            ></el-input>
            <el-button
              v-else
              class="button-new-tag"
              size="small"
              @click="showInput(scope.row)"
            >+ New Tag</el-button>
          </template>
        </el-table-column>
        <el-table-column type="index" label="ID"></el-table-column>
        <el-table-column prop="attr_name" :label="tableLebalText"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <div>
              <!-- 修改 （只要是需要修改，就需要利用id获取到对应的值）-->
              <el-button type="primary" icon="el-icon-edit" @click="editDynamicBtn(scope.row)">编辑</el-button>
              <!-- 删除 -->
              <el-button type="danger" icon="el-icon-delete" @click="deleteDynamicBtn(scope.row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 修改动态，静态参数 -->
    <el-dialog :title="'修改'+editDialogText" :visible.sync="dynamicDialogVisible" width="50%">
      <el-form :model="dynamicForm" :rules="dynamicRules" ref="paramsFormRef" label-width="100px">
        <el-form-item :label="editDialogText" prop="attr_name">
          <el-input v-model="dynamicForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dynamicDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editDynamic">修 改</el-button>
      </span>
    </el-dialog>
    <!-- 添加静态，动态参数 -->
    <el-dialog
      :title="'添加'+titleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="resetAddConfig"
    >
      <el-form :model="addForm" :rules="addRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">添 加</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import Breadcrumb from '../components/common/Breadcrumb'
export default {
  name: 'Params',
  data() {
    return {
      cascaderList: [],
      // 用来记录选中的商品名称的id
      selectedId: [],
      paramsProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // tabs默认选中哪一项
      activeName: 'many',
      // 动态数据列表
      dynamicList: [],
      // 静态数据
      staticList: [],
      isSelect: true,

      //动态参数修改数据
      dynamicDialogVisible: false,
      dynamicForm: {},
      dynamicRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
        ]
      },
      // 添加动态，静态参数
      addDialogVisible: false,
      addForm: {
        // 分类id
        cat_id: 0,
        // 商品名称
        attr_name: ''
        // 请求参数类型,这里不能为变量赋其他变量的值
        // attr_sel: this.activeName
      },
      addRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
        ]
      }
      // 可选项的渲染,不应该谢在这里，会使每一个输入框状态都相同
      // inputVisible: false,
      // inputValue: ''
    }
  },
  created() {
    this.getCascaderList()
  },
  components: {
    Breadcrumb
  },
  methods: {
    getCascaderList() {
      this.$http.get('categories').then(res => {
        // console.log(res)
        if (res.data.meta.status !== 200) return
        this.$message.success('获取全部商品分类成功')
        this.cascaderList = res.data.data
      })
    },
    // 选择联动数据时
    handleChange() {
      // 获取动态参数
      this.getPramas('many')
    },
    // tab切换,   tab切换时也得发送数据请求
    tabClick(tab) {
      // 获取动态参数
      if (tab.paneName === 'many') {
        this.getPramas('many')
        // 为下面修改参数做铺垫
        // this.addForm.attr_sel = 'many'
      }
      // 获取静态属性
      if (tab.paneName === 'only') {
        this.getPramas('only')
        // 为下面修改参数做铺垫
        // this.addForm.attr_sel = 'only'
      }
    },
    // 获取参数（动态、静态）
    getPramas(sel) {
      // console.log(this.selectedId)
      let length = this.selectedId.length
      this.addForm.cat_id = this.selectedId[length - 1]
      //  处理按钮的禁用
      if (length === 3) {
        this.isSelect = false
      } else {
        this.isSelect = true
      }
      // 这里的参数要写在params中
      this.$http
        .get(`categories/${this.selectedId[length - 1]}/attributes`, {
          params: { sel }
        })
        .then(res => {
          // console.log(res)
          if (res.data.meta.status !== 200) {
            return this.$message.error('获取动态数据失败')
          }
          this.$message.success('获取动态数据成功')
          // 赋值之前要做一些额外操作，为后面渲染可选项做铺垫
          res.data.data.forEach(item => {
            // 将返回的可选项字符串转化为数组格式
            item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
            // 给每一项参数都添加自己的参数控制输入框的显示和隐藏
            item.inputVisible = false
            //给每一项参数都添加自己的参数控制输入框的内容只影响自己的输入框
            item.inputValue = ''
          })
          if (sel === 'many') {
            this.dynamicList = res.data.data
          } else {
            this.staticList = res.data.data
          }
        })
    },
    // 点击编辑按钮
    editDynamicBtn(itemDynamic) {
      // console.log(itemDynamic)
      this.dynamicForm = itemDynamic
      this.dynamicDialogVisible = true
      // this.$http.get(`categories/${id}/attributes/:attrId`)
    },
    // 确认修改
    editDynamic() {
      this.$refs.paramsFormRef.validate(val => {
        if (!val) return
        this.$http
          .put(
            `categories/${this.dynamicForm.cat_id}/attributes/${this.dynamicForm.attr_id}`,
            this.dynamicForm
          )
          .then(res => {
            // console.log(res)
            if (res.data.meta.status !== 200) {
              return this.$message.error('修改失败')
            }
            this.$message.success('修改成功')
            // 这样赋值不行，没有点击确定，就修改了
            // this.dynamicForm = res.data.data
            // 刷新页面
            this.getPramas(this.activeName)
          })
      })
      this.dynamicDialogVisible = false
    },
    // 点击删除按钮
    deleteDynamicBtn(itemDynamic) {
      this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(result => {
          if (result === 'confirm') {
            this.$http
              .delete(
                `categories/${itemDynamic.cat_id}/attributes/${itemDynamic.attr_id}`
              )
              .then(res => {
                // console.log(res)
                if (res.data.meta.status !== 200)
                  return this.$message.info('取消删除')
                this.$message.success('删除成功')
                // 刷新页面
                this.getPramas(this.activeName)
              })
          }
        })
        .catch(err => {
          if (err === 'cancel') {
            this.$message.info('删除失败')
          }
        })
    },
    // 添加参数按钮
    addParamsBtn() {
      this.addDialogVisible = true
    },
    addParams() {
      this.addDialogVisible = false
      this.$refs.addFormRef.validate(val => {
        if (!val) return
        this.$http
          .post(`categories/${this.addForm.cat_id}/attributes`, {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          })
          .then(res => {
            // console.log(res)
            if (res.data.meta.status !== 201) {
              return this.$message.error('添加参数失败')
            }
            this.$message.success('添加参数成功')
            // 刷新页面
            this.getPramas(this.activeName)
          })
      })
    },
    // 关闭添加参数的时候清空列表
    resetAddConfig() {
      this.$refs.addFormRef.resetFields()
    },
    // 渲染可选项,删除可选项时触发
    tagClose(row, item) {
      // item表示一个可选项
      // console.log(item)
      let index = row.attr_vals.indexOf(item)
      row.attr_vals.splice(index, 1)
      this.$http
        .put(`categories/${row.cat_id}/attributes/${row.attr_id}`, {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(' ')
        })
        .then(res => {
          // console.log(res)
          if (res.data.meta.status !== 200)
            return this.$message.error('移除可选项失败')
          this.$message.success('移除可选项成功')
        })
    },
    showInput(item) {
      item.inputVisible = true
      this.$nextTick(() => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    handleInputConfirm(item) {
      // 判断输入框输入的内容是否为空
      if (item.inputValue.trim().length === 0) {
        item.inputVisible = false
        item.inputValue = ''
        return
      }
      let inputValue = item.inputValue
      if (inputValue) {
        item.attr_vals.push(inputValue)
        item.inputVisible = false
        item.inputValue = ''
        // console.log(item)
        this.$http
          .put(`categories/${item.cat_id}/attributes/${item.attr_id}`, {
            attr_name: item.attr_name,
            attr_sel: item.attr_sel,
            attr_vals: item.attr_vals.join(' ')
          })
          .then(res => {
            // console.log(res)
            if (res.data.meta.status !== 200)
              return this.$message.error('添加可选项失败')
            this.$message.success('添加可选项成功')
          })
      }
    }
  },
  computed: {
    isList() {
      return this.activeName === 'many' ? this.dynamicList : this.staticList
    },
    // getCatId() {
    //   return this.selectedId[this.selectedId.length - 1]
    // },
    titleText() {
      return this.activeName === 'many' ? '动态参数' : '静态属性'
      // 计算属性不能自接返回一个准确的值，他只能通过计算来返回值，正如这个自接返回字符串他会报错
      // if(this.activeName === 'many') {
      //   return '动态参数'
      // }
      // if(this.activeName === 'only') {
      //   return '静态属性'
      // }
    },
    tableLebalText() {
      return this.activeName === 'many' ? '参数名称' : '属性名称'
    },
    editDialogText() {
      return this.activeName === 'many' ? '动态参数' : '静态属性'
    }
    // 使可选项转化为数组,返回的数组不能调用数组方法,那是因为你没有写this
    // changeArr(val) {
    //   console.log(val)
    //   return function(val) {
    //     // 为了防止val为空时，利用空格分隔会产生一个空字符串的数组
    //     return val ? val.split(' ') : []
    //   }
    // }
  }
}
</script>

<style scoped>
.el-alert {
  margin-bottom: 20px;
}
.cascader {
  margin-top: 10px;
}
.el-tag {
  margin-left: 10px;
  height: 32px;
  text-align: center;
  line-height: 32px;
}
.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
</style>