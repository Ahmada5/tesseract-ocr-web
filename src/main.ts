// import { createApp } from 'vue';
// import Example from './components/Example.vue';

// createApp(Example).mount('#app');

import { createApp } from 'vue';
import App from './App.vue';
import Vuetify from './plugins/Vuetify';
import './style.css';

createApp(App)
  .use(Vuetify) // Use Vuetify
  .mount('#app');
