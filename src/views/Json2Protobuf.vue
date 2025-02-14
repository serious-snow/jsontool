<template>
  <context-holder />
  <div style="display: flex; flex: 1; flex-direction: column; padding: 10px">
    <div
      style="
        height: 40px;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: right;
      "
    >
      <a-tooltip>
        <template #title>将可能是int64的字符串转为int64</template>
        <a-checkbox v-model:checked="string2int64" style="margin-left: 5px"
          >string2int64</a-checkbox
        >
      </a-tooltip>
      <a-tooltip>
        <template #title>添加openapi的example</template>
        <a-checkbox v-model:checked="isSwaggerExample" style="margin-left: 5px"
          >swaggerExample</a-checkbox
        >
      </a-tooltip>
      <a-checkbox v-model:checked="singular" style="margin-left: 5px"
        >数组使用单数名词</a-checkbox
      >
      <a-checkbox v-model:checked="withComment" style="margin-left: 5px"
        >显示注释</a-checkbox
      >
      <a-button
        type="primary"
        :disabled="!resultText"
        :icon="h(CopyOutlined)"
        @click="onClickCopy"
        >复制</a-button
      >
    </div>
    <div style="display: flex; flex: 1">
      <div style="display: flex; flex: 1">
        <a-textarea
          @input="onChange"
          style="width: 100%; resize: none; height: 100%"
          v-model:value="inputText"
          placeholder="请输入json"
        >
        </a-textarea>
      </div>
      <div style="flex: 1; height: 100%; margin-left: 1px">
        <a-textarea
          readonly
          style="width: 100%; resize: none; height: 100%"
          v-model:value="resultText"
          placeholder=""
        >
        </a-textarea>
      </div>
    </div>
  </div>
</template>

<script setup>
import { h, ref, watch } from "vue";
import { parse } from "comment-json";
import copy from "copy-text-to-clipboard";
import { message } from "ant-design-vue";
import { json2protobuf } from "@/utils/json2protobuf";
import { CopyOutlined } from "@ant-design/icons-vue";

const [messageApi, contextHolder] = message.useMessage();

const string2int64 = ref(false);
const isSwaggerExample = ref(false);
const withComment = ref(true);
const singular = ref(false);
const inputText = ref("");
const resultText = ref("");
const onChange = () => {
  exchange();
};

watch([string2int64, isSwaggerExample, withComment, singular], () => {
  exchange();
});

//
const exchange = () => {
  if (inputText.value.length === 0) {
    resultText.value = "";
    return;
  }
  try {
    const object = parse(inputText.value);
    console.log(object);
    resultText.value = json2protobuf(object, {
      isShowExample: isSwaggerExample.value,
      withComment: withComment.value,
      singular: singular.value,
      string2int64: string2int64.value,
    });
  } catch (e) {
    resultText.value = e.stack.toString();
  }
};

const onClickCopy = () => {
  if (copy(resultText.value)) {
    messageApi.info("复制成功！");
    return;
  }
  messageApi.warning("复制失败！");
};
</script>

<style scoped></style>
