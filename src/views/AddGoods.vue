<template>
  <div>
    <breadcrumb :itemList="['商品管理', '添加商品']" />
    <el-card>
      <!-- 消息提示框 -->
      <div class="alert">
        <el-alert title="添加商品信息" type="info" center show-icon :closable="false"></el-alert>
      </div>
      <!-- 横向步骤条 -->
      <el-steps :active="activeIndex" simple>
        <el-step title="基本信息" icon="el-icon-edit"></el-step>
        <el-step title="商品参数" icon="el-icon-tickets"></el-step>
        <el-step title="商品属性" icon="el-icon-menu"></el-step>
        <el-step title="商品图片" icon="el-icon-picture"></el-step>
        <el-step title="商品内容" icon="el-icon-s-order"></el-step>
        <el-step title="完成" icon="el-icon-document-checked"></el-step>
      </el-steps>
      <!-- 竖形导航 -->
      <el-form
        :model="addForm"
        :rules="addRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <el-tabs :tab-position="'left'" @tab-click="seletedClick">
          <el-tab-pane label="基本信息">
            <el-form-item label="商品名称 : " prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格 : " prop="goods_price">
              <el-input v-model.number="addForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品重量 : " prop="goods_weight">
              <el-input v-model.number="addForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量 : " prop="goods_number">
              <el-input v-model.number="addForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类 : " prop="goods_cat">
              <!-- 三级联动  @change="handleChange" -->
              <el-cascader
                v-model="addForm.goods_cat"
                :options="allCategoryList"
                :props="categoryConfig"
                :show-all-levels="false"
                @change="handleChange"
                size="small"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数">
            <!-- <el-tag type="success" v-for="item in paramsCategoryList" :key="item.attr_id">{{item.attr_name}}</el-tag> -->
            <el-form-item
              v-for="item in paramsCategoryList"
              :key="item.attr_id"
              :label="item.attr_name"
            >
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  :label="val"
                  v-for="(val, index) in item.attr_vals"
                  :key="index"
                  border
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性">
            <el-form-item
              :label="item.attr_name"
              v-for="(item, index) in onlyCategoryList"
              :key="item.attr_id"
            >
              <el-input v-model="item.attr_vals[index]"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片">
            <el-upload
              :action="pictureUrl"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="setHeader"
              :on-success="uploadSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容">
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <el-button @click="addGoods" type="primary" class="add-btn" size="medium">添加 商品</el-button>

          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览 -->
    <el-dialog title="图片预览" :visible.sync="pictureDialogVisible" width="50%">
      <img :src="picturePreviewUrl" alt="">
    </el-dialog>
  </div>
</template>

<script>
import Breadcrumb from '../components/common/Breadcrumb'
export default {
  name: 'AddGoods',
  data() {
    return {
      activeIndex: 0,
      // 保存选中的id
      seletedId: [],
      allCategoryList: [],
      // 全部商品的配置
      categoryConfig: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        checkStrictly: false
      },
      // 添加商品时，要将参数写在里面，以便后续发送请求
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 所选中的商品分类id组成的数组
        goods_cat: [],
        // 图片数据
        pics: [],
        // 文本描述
        goods_introduce: '',
        // 动态参数，静态属性
        attrs: []
      },
      addRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' },
          { min: 1, max: 10, message: '长度在 1 到 10 个字符', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' },
          { type: 'number', message: '商品价格必须为数字值' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' },
          { type: 'number', message: '商品数量必须为数字值' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' },
          { type: 'number', message: '商品重量必须为数字值' }
        ],
        // 这一项也得验证，防止用户未选
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
        ]
      },
      //商品参数
      paramsCategoryList: [],
      onlyCategoryList: [],
      // 上传图片
      pictureUrl: 'https://www.liulongbin.top:8888/api/private/v1/upload',
      setHeader: { Authorization: window.sessionStorage.getItem('token') },
      // 图片预览
      pictureDialogVisible: false,
      picturePreviewUrl: ''
    }
  },
  created() {
    this.getAllCategory()
  },
  components: {
    Breadcrumb
  },
  methods: {
    getAllCategory() {
      this.$http.get('categories').then(res => {
        // console.log(res)
        if (res.data.meta.status !== 200)
          return this.$message.error('获取分类数据失败')
        this.$message.success('获取分类数据成功')
        this.allCategoryList = res.data.data
      })
    },
    // 当选择分类时
    handleChange() {
      // this.isThird
      const length = this.addForm.goods_cat.length
      if (length !== 3) {
        this.addForm.goods_cat = []
      }
      // console.log(this.addForm.goods_cat)
    },
    // 选中tabs时触发
    seletedClick(val) {
      // val是当前tab-pane实例
      // console.log(val)
      this.activeIndex = parseInt(val.index)
      // 防止用户未选中商品分类
      if (val.index !== '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请先选择商品分类')
      }
      // 发送请求获取商品参数
      if (val.index === '1') {
        this.$http
          .get(`categories/${parseInt(this.addForm.goods_cat[2])}/attributes`, {
            params: { sel: 'many' }
          })
          .then(res => {
            // console.log(res)
            if (res.data.meta.status !== 200)
              return this.$message.error('获取商品参数失败')
            this.$message.success('获取商品参数成功')
            res.data.data.forEach(item => {
              item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
            })
            this.paramsCategoryList = res.data.data
          })
      } else if (val.index === '2') {
        // 发送请求获取静态属性
        this.$http
          .get(`categories/${parseInt(this.addForm.goods_cat[2])}/attributes`, {
            params: { sel: 'only' }
          })
          .then(res => {
            // console.log(res)
            if (res.data.meta.status !== 200)
              return this.$message.error('获取商品属性失败')
            this.$message.success('获取商品属性成功')
            res.data.data.forEach(item => {
              item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
            })
            this.onlyCategoryList = res.data.data
            // console.log(this.onlyCategoryList)
          })
      }
    },
    // 点击上传的图片时
    handlePreview(file) {
      this.picturePreviewUrl = file.response.data.url
      this.pictureDialogVisible = true
    },
    // 点击删除图片时
    handleRemove(file) {
      // console.log(file)
      // console.log(file.response.data.tmp_path)
      // let index = this.addForm.pics.indexOf({pic: this.addForm.pics.})
      let index = this.addForm.pics.findIndex(item => {
        return item.pic === file.response.data.tmp_path
      })
      // console.log(index)
      this.addForm.pics.splice(index, 1)
    },
    // 上传成功时
    uploadSuccess(res) {
      // console.log(res)
      if (res.meta.status !== 200) return this.$message.error('图片上传失败')
      this.$message.success('图片上传成功')
      this.addForm.pics.push({ pic: res.data.tmp_path })
      // console.log(this.addForm.pics)
    },
    addGoods() {
      // 处理动态参数
      this.paramsCategoryList.forEach(item => {
        this.addForm.attrs.push({attr_id: item.attr_id, attr_value: item.attr_vals.join(' ')})
      })
      // 处理静态属性
      this.onlyCategoryList.forEach(item => {
        this.addForm.attrs.push({attr_id: item.attr_id, attr_value: item.attr_vals.join(' ')})
      })
      // 克隆  addForm
      let cloneDeepAddForm = JSON.parse(JSON.stringify(this.addForm))
      // this.addForm.goods_cat = this.addForm.goods_cat.join(',')
      cloneDeepAddForm.goods_cat = cloneDeepAddForm.goods_cat.join(',')
      // console.log(this.addForm)
      this.$refs.addFormRef.validate(val => {
        if(!val) return this.$message.info('请将表单项填写完整')
        this.$http.post('goods', cloneDeepAddForm).then(res => {
          // console.log(res)
          if(res.data.meta.status !== 201) return this.$message.error('添加商品失败')
          this.$message.success('添加商品成功')
          // 添加成功后跳会商品主页
          this.$router.push('/home/goods')
        })
      })
    }
  }
  // computed: {
  //   isThird() {
  //     const length = this.addForm.goods_cat.length
  //     if (length !== 3) {
  //       this.addForm.goods_cat = []
  //       return this.addForm.goods_cat
  //     }
  //   }
  // }
}
</script>

<style scoped>
.alert {
  padding-bottom: 20px !important;
}
.el-tabs {
  padding-top: 20px;
}
.el-steps {
  font-size: 16px;
}
.el-form-item {
  margin-top: 30px;
}
/* .el-tab-pane .el-tag {
  padding: 0 20px;
  height: 40px;
  line-height: 40px;
  margin-right: 20px;
} */
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
.el-dialog img {
  width: 100%;
  height:  100%;
}
.add-btn {
  margin-top: 20px;
}
</style>