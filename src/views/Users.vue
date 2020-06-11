<template>
  <div>
    <!-- 面包屑 -->
    <breadcrumb :itemList="['用户管理', '用户列表']" />
    <!-- 全局卡片 -->
    <el-card class="box-card">
      <!-- Layout 布局 -->
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
      <!-- 表格 -->
      <el-table :data="userList" style="width: 100%" border stripe>
        <el-table-column prop="_id" label="ID"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="mg_state" label="状态">
          <!-- 只能使用这样的作用域插槽，不能使用v-slot指令 -->
          <template slot-scope="scope">
            <!-- 这里为什么会出现row，哪里来的 -->
            <el-switch v-model="scope.row.mg_state" @change="userStateUpdate(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template class="operate" slot-scope="scope">
            <!-- 通过id查询到这个人进行修改 -->
            <!-- 修改 -->
            <el-button type="primary" icon="el-icon-edit" circle @click="getEditUser(scope.row.id)"></el-button>
            <!-- 删除 -->
            <el-button type="danger" icon="el-icon-delete" circle @click="deleteUser(scope.row.id)"></el-button>
            <!-- 设置 -->
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" circle @click="assignRoles(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="getParams.pagenum"
        :page-sizes="[1, 5, 10, 20]"
        :page-size="getParams.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 弹框，添加人员 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="60%" @close="resetAddConfig">
      <el-form :model="addForm" :rules="addRules" ref="addFormRef" label-width="66px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱号" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">添 加</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户 -->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="60%" @close="resetEditConfig">
      <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="66px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="邮箱号" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser">修 改</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色 -->
    <el-dialog title="分配角色" :visible.sync="assignDialogVisible" width="60%" @close="assignRoleConfig">
      <div>
        <p>当前用户: &nbsp;&nbsp;{{userInfo.username}}</p>
        <p>当前角色: &nbsp;&nbsp;{{userInfo.role_name}}</p>
        <div>
          分配新角色:
          <el-select v-model="selectRoleId" placeholder="请选择">
            <el-option
              v-for="item in getRoleList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            ></el-option>
          </el-select>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="assignDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="assignRolesBtn">修 改</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import Breadcrumb from '../components/common/Breadcrumb'
export default {
  name: 'Users',
  data() {
    return {
      getParams: {
        query: '',
        pagenum: 1,
        pagesize: 6
      },
      userList: [],
      total: 0,

      addDialogVisible: false,
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      addRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 8, message: '长度在 3 到 8 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 16, message: '长度在 6 到 16 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱号', trigger: 'blur' },
          {
            pattern: /^[0-9a-zA-Z]+@[0-9a-zA-Z]+/,
            message: '请输入正确的邮箱号，例如 669638556@qq.com',
            trigger: 'blur'
          }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          {
            pattern: /^1[3-9][0-9]{9}$/,
            message: '请输入正确的手机号',
            trigger: 'blur'
          }
        ]
      },
      editDialogVisible: false,
      editForm: {
        username: '',
        email: '',
        mobile: ''
      },
      editRules: {
        email: [
          { required: true, message: '请输入邮箱号', trigger: 'blur' },
          {
            pattern: /^[0-9a-zA-Z]+@[0-9a-zA-Z]+/,
            message: '请输入正确的邮箱号，例如 669638556@qq.com',
            trigger: 'blur'
          }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          {
            pattern: /^1[3-9][0-9]{9}$/,
            message: '请输入正确的手机号',
            trigger: 'blur'
          }
        ]
      },
      currentId: '',
      assignDialogVisible: false,
      // 角色id
      selectRoleId: '',
      getRoleList: [],
      userInfo: {}
    }
  },
  components: {
    Breadcrumb
  },
  created() {
    this.getUsers()
  },
  methods: {
    getUsers() {
      this.$http.get('users', { params: this.getParams }).then(res => {
        // console.log(res)
        this.userList = res.data.data.users
        // console.log(this.userList)
        for (let i in this.userList) {
          this.userList[i]._id = i
        }
        this.total = res.data.data.total
      })
    },
    handleSizeChange(val) {
      this.getParams.pagesize = val
      //这里要发送请求
      this.getUsers()
    },
    handleCurrentChange(val) {
      //这里要发送请求
      this.getUsers()
      // console.log(val)
      this.getParams.pagenum = val
    },
    userStateUpdate(userMgState) {
      // console.log(userMgState)
      this.$http
        .put(`users/${userMgState.id}/state/${userMgState.mg_state}`)
        .then(res => {
          // console.log(res)
          if (!res.data.meta.status) return this.$message.error('修改状态失败')
          this.$message.success('修改状态成功')
        })
    },
    resetAddConfig() {
      // 关闭对话框时调用,重置表单内容
      this.$refs.addFormRef.resetFields()
    },
    addUser() {
      // 首先我们得先验证填入的信息
      this.$refs.addFormRef.validate(val => {
        if (!val) return
        // 调用接口存入数据
        this.$http.post('users', this.addForm).then(res => {
          // console.log(res)
          if (res.data.meta.status !== 201)
            return this.$message.error('创建用户失败')
          this.addDialogVisible = false
          this.$message.success('创建用户成功')
          this.getUsers()
        })
      })
    },
    getEditUser(id) {
      // console.log(id)
      this.currentId = id
      this.editDialogVisible = true
      this.$http.get(`users/${id}`).then(res => {
        // console.log(res)
        if (res.data.meta.status !== 200) return
        ;(this.editForm.username = res.data.data.username),
          (this.editForm.email = res.data.data.email),
          (this.editForm.mobile = res.data.data.mobile)
      })
    },
    resetEditConfig() {
      // 关闭对话框时调用,重置表单内容
      this.$refs.editFormRef.resetFields()
    },
    editUser() {
      // 首先我们得先验证填入的信息
      this.$refs.editFormRef.validate(val => {
        if (!val) return
        // 调用接口存入数据
        this.$http
          .put(`users/${this.currentId}`, {
            email: this.editForm.email,
            mobile: this.editForm.mobile
          })
          .then(res => {
            // console.log(res)
            if (res.data.meta.status !== 200)
              return this.$message.error('修改用户失败')
            this.editDialogVisible = false
            this.$message.success('修改用户成功')
            this.getUsers()
          })
      })
    },
    deleteUser(id) {
      this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(result => {
          if (result === 'confirm') {
            this.$http.delete(`users/${id}`).then(res => {
              // console.log(id)
              // console.log(res)
              if (res.data.meta.status !== 200)
                return this.$message.info('删除失败')
              this.$message.success('删除成功')
              this.getUsers()
            })
          }
        })
        .catch(err => {
          if (err === 'cancel') {
            this.$message.info('删除失败')
          }
        })
    },
    // 分配角色
    assignRoles(role) {
      this.userInfo = role
      // console.log(role)
      this.$http.get('roles').then(res => {
        // console.log(res)
        if(res.data.meta.status !== 200) {
          return this.$message.error('获取角色失败')
        }
        this.$message.success('获取角色成功')
        // for(let item of res.data.data) {
        //   console.log(item)
        //   this.getRoleList.push(item.roleName)
        //   this.selectRoleId.push(item.id)
        // }
        // 这里直接获取的就是全部角色的数组
        this.getRoleList = res.data.data
        // console.log(this.getRoleList)
        // console.log(this.selectRoleId)
      })
      this.assignDialogVisible = true
    },
    // 确认分配
    assignRolesBtn() {
      if(!this.selectRoleId) return this.$message.warning('请选择分配的角色')
      this.$http.put(`users/${this.userInfo.id}/role`, {rid: this.selectRoleId}).then(res => {
        // console.log(res)
        if(res.data.meta.status !== 200) return this.$message.error('分配角色失败')
        this.$message.success('分配角色成功')
        // this.selectRoleId = res.data.data.id
        this.getUsers()
      })
      this.assignDialogVisible = false
    },
    assignRoleConfig() {
      this.selectRoleId = ''
      this.userInfo = {}
    }
  }
}
</script>

<style scoped>
.btn {
  margin-left: 30px;
  margin-top: -3px;
}

/* .operate {
  margin: 0 20px !important;
} */
.el-table {
  text-align: center !important;
}
.el-pagination {
  margin-top: 30px;
}
</style>