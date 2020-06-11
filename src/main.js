import Vue from 'vue'
import App from './App.vue'
import router from './router'
import axios from "axios"
import "./assets/css/base.css"
//按需引入
import { 
  Form, 
  FormItem, 
  Input, 
  Button, 
  Message, 
  Container, 
  Header, 
  Main, 
  Aside,
  Menu,
  Submenu,
  MenuItemGroup,
  MenuItem,
  Breadcrumb,
  BreadcrumbItem,
  Card,
  Row,
  Col,
  Table,
  TableColumn,
  Switch,
  Tooltip,
  Pagination,
  Dialog,
  MessageBox,
  Tag,
  Tree,
  Select,
  Option,
  Cascader,
  Alert,
  Tabs,
  TabPane,
  Steps,
  Step,
  Checkbox,
  CheckboxGroup,
  Upload
} from 'element-ui';
// 导入富文本编译器
import VueQuillEditor from 'vue-quill-editor'
// 导入样式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css' 

// 导入加载样式
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
// 配置默认路径
axios.defaults.baseURL = "https://www.liulongbin.top:8888/api/private/v1/"
// 配置请求拦截器
axios.interceptors.request.use(config => {
  // console.log(config)
  // 展示进度条
  NProgress.start()
  config.headers.Authorization = window.sessionStorage.getItem("token")
  return config
})

// 配置响应拦截
axios.interceptors.response.use(config => {
  // console.log(config)
  // 隐藏进度条
  NProgress.done()
  return config
})


Vue.prototype.$http = axios
Vue.prototype.$ELEMENT = { size: 'small', zIndex: 3000 };
Vue.prototype.$message = Message
Vue.prototype.$confirm = MessageBox.confirm
Vue.use(Form);
Vue.use(FormItem);
Vue.use(Input);
Vue.use(Button);
Vue.use(Container);
Vue.use(Header);
Vue.use(Main);
Vue.use(Aside);
Vue.use(Menu);
Vue.use(MenuItem);
Vue.use(MenuItemGroup);
Vue.use(Submenu);
Vue.use(Breadcrumb);
Vue.use(BreadcrumbItem);
Vue.use(Card);
Vue.use(Row);
Vue.use(Col);
Vue.use(Table);
Vue.use(TableColumn);
Vue.use(Switch);
Vue.use(Tooltip);
Vue.use(Pagination);
Vue.use(Dialog);
Vue.use(Tag);
Vue.use(Tree);
Vue.use(Select);
Vue.use(Option);
Vue.use(Cascader);
Vue.use(Alert);
Vue.use(TabPane);
Vue.use(Tabs);
Vue.use(Step);
Vue.use(Steps);
Vue.use(Checkbox);
Vue.use(CheckboxGroup);
Vue.use(Upload);
Vue.config.productionTip = false

// // 注册中央事件处理器
// Vue.prototype.$bus = new Vue

// 注册富文本编辑器
Vue.use(VueQuillEditor)
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
