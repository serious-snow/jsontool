import {createRouter, createWebHistory} from 'vue-router'
import Json2Go from "../views/Json2Go.vue"
import Json2Protobuf from "../views/Json2Protobuf.vue"

const routes = [
  {
    path: "/",
    redirect: "/json2go"
  },
  {
    path: '/json2go',
    name: 'json2go',
    component: Json2Go,
    meta: {
      title: "json转go",
      keepAlive: true,
    }
  },
  {
    path: '/json2protobuf',
    name: 'json2protobuf',
    component: Json2Protobuf,
    meta: {
      title: "json转protobuf",
      keepAlive: true,
    }
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export {routes}
export default router
