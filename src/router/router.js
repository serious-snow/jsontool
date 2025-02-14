import { createRouter, createWebHistory } from "vue-router";
import Json2Go from "@/views/Json2Go.vue";
import Json2Protobuf from "@/views/Json2Protobuf.vue";
import Swagger2MD from "@/views/Swagger2MD.vue";
import JsonRemoveComment from "@/views/JsonRemoveComment.vue";

const routes = [
  {
    path: "/",
    redirect: "/json2go",
  },
  {
    path: "/jsonremovecomment",
    name: "jsonremovecomment",
    component: JsonRemoveComment,
    meta: {
      title: "json移除注释",
      keepAlive: true,
    },
  },
  {
    path: "/json2go",
    name: "json2go",
    component: Json2Go,
    meta: {
      title: "json转go",
      keepAlive: true,
      description: "(支持带注释的json)",
    },
  },
  {
    path: "/json2pb",
    name: "json2pb",
    component: Json2Protobuf,
    meta: {
      title: "json转protobuf",
      keepAlive: true,
      description: "(支持带注释的json)",
    },
  },
  {
    path: "/swagger2md",
    name: "swagger2md",
    component: Swagger2MD,
    meta: {
      title: "swagger转md",
      keepAlive: true,
      description: "",
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export { routes };
export default router;
