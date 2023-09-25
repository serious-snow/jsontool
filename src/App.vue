<template>
  <a-layout style="min-height: 100vh;height: 100%">
    <a-layout>
      <a-layout-sider v-model:collapsed="collapsed" width="200" style="background: #fff">
        <a-menu mode="inline"
                theme="light"
                :selectedKeys="[route.path]"
                :style="{ height: '100%', borderRight: 0 }">
          <template v-for="item in routes" :key="item.path"

          >
            <template v-if="item.children && item.children.length">
              <a-sub-menu>
                <template #title>

                  <router-link :to="item.path" :key="item.path">
                    <span>{{ item.meta.title }} </span>
                  </router-link>
                </template>
                <template v-if="item.children && item.children.length">
                  <a-menu-item v-for="child in item.children" :key="child.path">
                    <span>{{ child.meta.title }}</span>
                    <router-link :key="child.path" :to="item.path + '/' + child.path">
                    </router-link>
                  </a-menu-item>
                </template>
              </a-sub-menu>
            </template>
            <template v-else-if="!item.redirect">
              <a-menu-item :key="item.path">
                <span>{{ item.meta.title }}</span>
                <router-link :key="item.path" :to="item.path">

                </router-link>
              </a-menu-item>
            </template>
          </template>
        </a-menu>
      </a-layout-sider>


      <a-layout>
        <!--        <a-layout-header style="background: #fff; padding: 0" />-->
        <a-layout-content style="margin: 0 16px">
          <a-breadcrumb style="margin: 16px 0">
            <a-breadcrumb-item>{{ route.meta.title }}</a-breadcrumb-item>
          </a-breadcrumb>
          <div
              :style="{ display:'flex', background: '#fff',maxHeight:'calc(100% - 24px)', minHeight: 'calc(100% - 48px)' }">
            <router-view v-slot="{ Component }">
              <keep-alive v-if="route.meta.keepAlive">
                <component :is="Component"/>
              </keep-alive>
              <component v-else :is="Component"/>
            </router-view>
          </div>
        </a-layout-content>
        <a-layout-footer style="text-align: center">
          JsonTool ©2023 Created by Serious-Snow
        </a-layout-footer>
      </a-layout>
    </a-layout>
  </a-layout>
</template>
<script setup>
import {routes} from '@/router/router'

import {ref} from 'vue';
import {useRoute} from "vue-router";
// import {useRoute} from 'vue-router'
const collapsed = ref(false)

// let selectedKeys = ref(['0']);
const route = useRoute()



// let collapsed = ref(false);
</script>
<style scoped>
#components-layout-demo-side .logo {
  height: 32px;
  margin: 16px;
  background: rgba(255, 255, 255, 0.3);
}

.site-layout .site-layout-background {
  background: #fff;
}

[data-theme='dark'] .site-layout .site-layout-background {
  background: #141414;
}
</style>
