<template>
  <context-holder/>
  <div style="display:flex;flex:1;flex-direction: column;padding: 10px">
    <div style="height: 40px;display: flex;flex-direction: row;align-items: center;justify-content: right">
      <a-checkbox v-model:checked="omitempty" style="margin-left: 5px">omitempty</a-checkbox>
      <a-button type="primary" :disabled="!resultText" @click="onClickCopy">复制到剪贴板</a-button>
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
import {ref, watch} from "vue";
import {parse,} from 'comment-json';
import {json2go} from "@/utils/json2go";
import copy from 'copy-text-to-clipboard';
import {message} from 'ant-design-vue';

const [messageApi, contextHolder] = message.useMessage();


const omitempty = ref(false)
const inputText = ref("")
const resultText = ref("")
const onChange = () => {
  exchange()
}

watch(omitempty, () => {
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
    resultText.value = json2go(object, {omitempty: omitempty.value})
  } catch (e) {
    resultText.value = e.toString()
  }
}

const onClickCopy = () => {
  if (copy(resultText.value)) {
    messageApi.info('Success!');
    return
  }
  messageApi.warning('Fail!');
}


</script>

<style scoped>

</style>
