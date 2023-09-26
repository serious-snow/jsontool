import { createApp } from 'vue'
import App from './App.vue'
import router from "@/router/router";
import 'ant-design-vue/dist/reset.css';
import Antd from "ant-design-vue";
import 'highlight.js/styles/github.css'
import 'highlight.js/lib/common'
import hljsVuePlugin from '@highlightjs/vue-plugin'

const app = createApp(App)
app.use(Antd)
  .use(hljsVuePlugin)
  .use(router)
  .mount('#app')
