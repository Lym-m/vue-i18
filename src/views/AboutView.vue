<template>
  <div class="about">
    <div style="position: fixed; top: 10px; right: 10px;">
      <Language/>
    </div>
    <h1>{{ $t('test_message') }}</h1>
    <a-button @click="login">登录</a-button>
  </div>
</template>
<script>
import Language from "@/components/language.vue";
import {useI18n} from "vue-i18n";

export default {
  name: "HomeView",
  components: {
    Language,
  },
  setup() {
    const i18n = useI18n();

    const login = () => {
      message.info(i18n.t('tips_error_menus'));
    }
    return {
      login,
    }
  }
};
</script>