module.exports = function() {
  const template = `
import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
  `;
  return {
    template,
    dir: "src",
    name: "main.js"
  };
};
