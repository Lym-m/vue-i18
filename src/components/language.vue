<template>
  <a-dropdown :trigger="['click']">
    <a class="ant-dropdown-link" @click.prevent>
      {{ language === "zh" ? "中文" : "英文" }}
      <DownOutlined />
    </a>
    <template #overlay>
      <a-menu @click="handleSetLanguage">
        <a-menu-item key="zh">
          <a>中文</a>
        </a-menu-item>
        <a-menu-item key="en">
          <a>English</a>
        </a-menu-item>
      </a-menu>
    </template>
  </a-dropdown>
</template>

<script>
import {defineComponent, computed} from "vue";
import { useI18n } from "vue-i18n";
import { useStore } from "vuex";
import { message } from "ant-design-vue";
import { DownOutlined } from "@ant-design/icons-vue";

export default defineComponent({
  name: "Language",
  components: { DownOutlined },
  setup(){
    const store = useStore();
    const language = computed(() => store.state.language.language);
    const i18n = useI18n();
    const handleSetLanguage = (e) => {
      i18n.locale.value = e.key;
      store.commit('language/setLanguage', e.key);
      message.success(`语言成功切换为${e.key === "zh" ? "中文" : "英文"}`)
    }

    return {
      language,
      handleSetLanguage,
    }
  }
})
</script>

<style scoped>

</style>