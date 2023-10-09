<template>
  <context-holder/>
  <div style="display:flex;flex:1;flex-direction: column;padding: 10px">
    <div style="height: 40px;display: flex;flex-direction: row;align-items: center;justify-content: right">
      <a-checkbox v-model:checked="compress" style="margin-left: 5px">压缩</a-checkbox>
      <a-button type="primary" :disabled="!resultText" :icon="h(CopyOutlined)" @click="onClickCopy">复制</a-button>
    </div>
    <div style="display:flex;flex:1;">
      <div style="display:flex;flex:1">
        <a-textarea @input="onChange"
                    style="width: 100%;
                    resize:none;
                    height: 100%"
                    v-model:value="inputText"
                    placeholder="请输入json">
        </a-textarea>
      </div>
      <div style="flex:1;height: 100%;margin-left: 1px">
        <a-textarea
            readonly
            style="width: 100%;
                    resize:none;
                    height: 100%"
            v-model:value="resultText"
            placeholder="">
        </a-textarea>
      </div>
    </div>
  </div>


</template>

<script setup>
import {h, ref, watch} from "vue";
import {parse} from 'comment-json';
import copy from 'copy-text-to-clipboard';
import {message} from 'ant-design-vue';
import {CopyOutlined} from '@ant-design/icons-vue';

const [messageApi, contextHolder] = message.useMessage();


const compress = ref(false)
const inputText = ref("")
const resultText = ref("")
const onChange = () => {
  exchange()
}

watch([compress], () => {
  exchange()
})

//
const exchange = () => {
  if (inputText.value.length === 0) {
    resultText.value = ""
    return
  }
  try {
    const object = parse(inputText.value)

    resultText.value = JSON.stringify(object, null, compress.value ? 0 : 4)
  } catch (e) {
    resultText.value = e.toString()
  }
}

const onClickCopy = () => {
  if (copy(resultText.value)) {
    messageApi.info('复制成功！');
    return
  }
  messageApi.warning('复制失败！');
}


</script>

<style scoped>

</style>
