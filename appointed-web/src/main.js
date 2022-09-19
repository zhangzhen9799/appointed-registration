import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';

import './utils/common';
// 第三方组件库注册
import componentInit from '@/components/otherComponents';

import './utils/util';
// import '@/utils/rem';
// import '@/utils/vconsole';
// import '@/utils/chii'
const app = createApp(App);
componentInit(app);
app.use(store).use(router).mount('#app');
