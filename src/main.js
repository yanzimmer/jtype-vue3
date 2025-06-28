import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// 导入 Ant Design Vue
import {
  Button,
  Tag,
  Typography,
  Input,
  Radio,
  Drawer,
  ConfigProvider
} from 'ant-design-vue'

// 导入样式，注意顺序
import 'ant-design-vue/dist/reset.css'
import './style.css'
import './styles/variables.scss'

const app = createApp(App)

// 注册 Pinia
app.use(createPinia())
// 注册路由
app.use(router)

// 注册 Ant Design Vue 组件
app.use(Button)
app.use(Tag)
app.use(Typography)
app.use(Input)
app.use(Radio)
app.use(Drawer)
app.use(ConfigProvider)

app.mount('#app')
