<template>
  <div class="login">
    <div class="login_box">
      <!-- 图像区域 -->
      <div class="avatar_box">
        <img src="../assets/img/logo.png" alt />
      </div>
      <!-- 文档区域 -->
      <el-form
        label-width="80px"
        class="login_form"
        :model="form"
        :rules="loginRules"
        ref="loginRef"
      >
        <el-form-item label="用户名:" prop="username">
          <el-input prefix-icon="el-icon-user" v-model="form.username"></el-input>
        </el-form-item>
        <el-form-item label="密码:" prop="password">
          <el-input prefix-icon="el-icon-lock" v-model="form.password" type="password"></el-input>
        </el-form-item>
      </el-form>

      <!-- 按钮 -->
      <div class="login_btn">
        <el-button type="primary" size="medium" @click="login">登录</el-button>
        <el-button type="info" size="medium" @click="resetInfo">重置</el-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      form: {
        username: 'admin',
        password: '123456'
      },
      // 校验数据必须是对象
      loginRules: {
        // 可以匹配多个校验规则
        username: [
          { require: true, message: '请输入用户名', tigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { require: true, message: '请输入密码', tigger: 'blur' },
          { min: 6, max: 16, message: '长度在 6 到 16 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    resetInfo() {
      this.$refs.loginRef.resetFields()
    },
    login() {
      this.$refs.loginRef.validate(val => {
        if (!val) return
        this.$http.post('login', this.form).then(res => {
          // console.log(res.data)
          if (res.data.meta.status !== 200) {
            return this.$message.error('登录失败')
          }
          this.$message.success('登陆成功')
          // 保存token到sessionStroge
          let token = res.data.data.token
          // console.log(token)
          window.sessionStorage.setItem('token', token)
          this.$router.push('/home')
        })
      })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.login {
  width: 100%;
  height: 100%;
  background-color: #2b4b6b;
}
.login_box {
  position: relative;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 450px;
  height: 304px;
  background-color: #fff;
  border-radius: 20px;
}

.avatar_box {
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 130px;
  height: 130px;
  border: 1px solid #eee;
  border-radius: 50%;
  padding: 10px;
  box-shadow: 0 0 10px #eee;
  background-color: #fff;
}
.avatar_box img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: #eee;
}
.login_form {
  position: absolute;
  top: 35%;
  width: 90%;
}
.login_btn {
  position: absolute;
  bottom: 20px;
  right: 10%;
}
</style>
