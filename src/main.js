import { createApp } from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import store from "./store";
import Antd from "ant-design-vue";
import 'ant-design-vue/dist/antd.css';
import i18n from "@/i18n";

createApp(App)
  .use(store)
  .use(router)
  .use(i18n)
  .use(Antd)
  .mount("#app");
