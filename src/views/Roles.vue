<template>
  <div>
    <breadcrumb :itemList="['权限管理', '角色列表']"></breadcrumb>
    <el-card>
      <!-- 添加人员 -->
      <el-button type="primary" size="medium" @click="addDialogVisible = true">添加角色</el-button>
      <!-- 表格区域 -->
      <el-table :data="rolesList" style="width: 100%" border stripe>
        <el-table-column type="expand">
          <!--  -->
          <template slot-scope="scope">
            <el-row
              v-for="(item1, index1) in scope.row.children"
              :key="item1.id"
              :class="['bdbottom', index1 === 0 ? 'bdtop' : '', 'vcenter']"
            >
              <!-- , index1  一级权限-->
              <el-col :span="5">
                <el-tag closable @close="deleteItem(scope.row, item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 二级三级权限 -->
              <el-col :span="19">
                <!-- 二级权限   行 -->
                <el-row
                  v-for="(item2, index2) in item1.children"
                  :key="item2.id"
                  :class="[ index2 === 0 ? '' : 'bdtop', 'vcenter']"
                >
                  <!-- 二级权限    列 -->
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="deleteItem(scope.row, item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级权限   列 -->
                  <el-col :span="18">
                    <!-- 三级权限   行 -->
                    <el-tag
                      type="warning"
                      v-for="(item3, index3) in item2.children"
                      :key="item3.id"
                      :class="[ index3 === 0 ? '' : 'bdtop']"
                      closable
                      @close="deleteItem(scope.row, item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" label="ID"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <!--  -->
            <div calss="operate">
              <!-- 修改 -->
              <el-button type="primary" icon="el-icon-edit" @click="editRoleBtn(scope.row.id)">编辑</el-button>
              <!-- 删除 -->
              <el-button type="danger" icon="el-icon-delete" @click="deleteRoleBtn(scope.row.id)">删除</el-button>
              <!-- 设置 -->
              <el-button type="warning" icon="el-icon-setting" @click="showRight(scope.row)">分配权限</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色   -->
    <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="60%" @close="resetAddConfig">
      <el-form
        :model="addForm"
        :rules="addRules"
        ref="addFormRef"
        label-width="88px"
        label-height="44px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">添 加</el-button>
      </span>
    </el-dialog>
    <!-- 修改角色 -->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="60%" @close="resetEditConfig">
      <el-form
        :model="editForm"
        :rules="editRules"
        ref="editFormRef"
        label-width="88px"
        label-height="44px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRole">修 改</el-button>
      </span>
    </el-dialog>
    <!-- 树形权限结构 -->
    <el-dialog title="分配权限" :visible.sync="setDialogVisible" width="60%" @close="resetRightConfig">
      <el-tree
        :data="rightList"
        show-checkbox
        node-key="id"
        ref="rightTreeRef"
        highlight-current
        :props="defaultProps"
        default-expand-all
        :default-checked-keys="defaultItem"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="setRight">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import Breadcrumb from '../components/common/Breadcrumb'
export default {
  name: 'Roles',
  data() {
    return {
      rolesList: [],
      addDialogVisible: false,
      addForm: {
        roleName: '',
        roleDesc: ''
      },
      addRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 2, max: 8, message: '长度在 2 到 8 个字符', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          { min: 4, max: 10, message: '长度在 4 到 10 个字符', trigger: 'blur' }
        ]
      },
      editForm: {}, //这里不能写成null
      editRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 2, max: 8, message: '长度在 2 到 8 个字符', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          { min: 4, max: 10, message: '长度在 4 到 10 个字符', trigger: 'blur' }
        ]
      },
      editDialogVisible: false,
      setDialogVisible: false,
      rightList: [],
      defaultProps: {
        children: 'children',
        label: 'authName'
      },
      defaultItem: [],
      // 只有当点击分配权限的时候获取的roleId才可以
      roleId: ''
    }
  },
  created() {
    this.getRolesList()
  },
  components: {
    Breadcrumb
  },
  methods: {
    // 获取列表数据
    getRolesList() {
      this.$http.get('roles').then(res => {
        // console.log(res)
        if (res.data.meta.status !== 200) return this.$message.error('获取失败')
        this.$message.success('获取成功')
        this.rolesList = res.data.data
        // console.log(this.rolesList)
      })
    },
    // 添加角色
    addRole() {
      // 首先我们得先验证填入的信息
      this.$refs.addFormRef.validate(val => {
        if (!val) return
        // 调用接口存入数据
        this.$http.post('roles', this.addForm).then(res => {
          // console.log(res)
          if (res.data.meta.status !== 201)
            return this.$message.error('创建角色失败')
          this.addDialogVisible = false
          this.$message.success('创建角色成功')
          this.getRolesList()
        })
      })
    },
    // 关闭对话框时调用,重置表单内容
    resetAddConfig() {
      this.$refs.addFormRef.resetFields()
    },
    // 修改角色
    editRoleBtn(id) {
      // 显示对话框
      this.editDialogVisible = true
      // 先获取人员id,根据id获取人员信息
      // console.log(id)
      this.$http.get(`roles/${id}`).then(res => {
        // console.log(res)
        if (res.data.meta.status === 200) {
          this.editForm = res.data.data
        }
        // console.log(res.data.data)
      })
    },
    editRole() {
      // console.log(this.editForm)
      this.$refs.editFormRef.validate(val => {
        if (!val) return
        this.$http
          .put(`roles/${this.editForm.roleId}`, {
            roleName: this.editForm.roleName,
            roleDesc: this.editForm.roleDesc
          })
          .then(res => {
            // console.log(res)
            if (res.data.meta.status !== 200)
              return this.$message.error('修改失败')
            this.$message.success('修改成功')
            this.editDialogVisible = false
            this.getRolesList()
          })
      })
    },
    resetEditConfig() {
      // 关闭对话框时调用,重置表单内容
      this.$refs.editFormRef.resetFields()
    },
    // 删除角色
    deleteRoleBtn(id) {
      this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(result => {
          if (result === 'confirm') {
            this.$http.delete(`roles/${id}`).then(res => {
              // console.log(id)
              // console.log(res)
              if (res.data.meta.status !== 200)
                return this.$message.info('删除失败')
              this.$message.success('删除成功')
              this.getRolesList()
            })
          }
        })
        .catch(err => {
          if (err === 'cancel') {
            this.$message.info('删除失败')
          }
        })
    },
    // 删除权限
    deleteItem(role, id) {
      this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(result => {
          if (result === 'confirm') {
            this.$http.delete(`roles/${role.id}/rights/${id}`).then(res => {
              // console.log(id)
              // console.log(res)
              if (res.data.meta.status !== 200)
                return this.$message.info('取消删除')
              this.$message.success('删除成功')
              //防止强制刷新，所以我们将删除后服务器返回的数据直接赋值给role.children即可
              // this.getRolesList()
              role.children = res.data.data
            })
          }
        })
        .catch(err => {
          if (err === 'cancel') {
            this.$message.info('删除失败')
          }
        })
    },
    // 获取权限
    showRight(item) {
      this.roleId = item.id
      // console.log(item)
      // 获取所有权限
      this.$http.get('rights/tree').then(res => {
        // console.log(res)
        if (res.data.meta.status !== 200)
          return this.$message.error('获取权限失败')
        this.rightList = res.data.data
        // console.log(this.rightList)
        // 将选中的权限id保存到数组中   (三层孩子)
        for (let itemFirst of item.children) {
          for (let itemSecond of itemFirst.children) {
            for(let itemThird of itemSecond.children) {
              this.defaultItem.push(itemThird.id)
            }
          }
        }
        // console.log(this.defaultItem)
      })
      this.setDialogVisible = true
    },
    resetRightConfig() {
      // 关闭对话框时调用,清空数组
      this.defaultItem = []
     
    },
    // 设置权限
    setRight() {
      // 获取选中的权限id
      let getRightId = [...this.$refs.rightTreeRef.getCheckedKeys(),...this.$refs.rightTreeRef.getHalfCheckedKeys()]
      let strId = getRightId.join(',')
      // console.log(strId)
      // console.log(this.roleId)
      this.$http.post(`roles/${this.roleId}/rights`, {rids: strId}).then(res => {
        // console.log(res)
        if(res.data.meta.status !== 200) return this.$message.error("分配权限失败")
        this.$message.success('分配权限成功')
      })
      this.setDialogVisible = false
    }
  }
}
</script>

<style scoped>
.el-button {
  height: 40px;
  padding-top: 12px;
  text-align: center;
  margin-bottom: 20px;
}
div .operate .el-button {
  margin-top: 20px !important;
}
.el-tag {
  margin: 10px;
  width: 120px;
  height: 33px;
  text-align: center;
  padding-top: 5px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>