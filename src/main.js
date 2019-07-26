import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import axios from 'axios'
import {client} from 'ontology-dapi'
import zh from './common/lang/zh';
import en from './common/lang/en';
import VueI18n from 'vue-i18n';
Vue.use(VueI18n)
const i18n = new VueI18n({
  locale: localStorage.getItem('user_lang') || 'en',
  messages: {
    'zh': zh,
    'en': en
  }
})
// axios.defaults.baseURL = 'http://192.168.50.96:8182'
//http request 拦截器
axios.interceptors.request.use(
  config => {
    config.data = JSON.stringify(config.data);
    config.headers = {
      'Content-Type':'application/json'
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

client.registerClient({})
Vue.use(ElementUI)
Vue.prototype.$http= axios

Vue.config.productionTip = false

new Vue({
  router,
  store,
  i18n,
  render: h => h(App)
}).$mount('#app')


localStorage.setItem('net', 'TEST_NET');
