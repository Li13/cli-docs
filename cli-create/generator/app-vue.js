module.exports = function() {
  const template = `
<template>
  <div id="app">
    <HelloWorld></HelloWorld>
  </div>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'

export default {
  name: 'app',
  components: {
    HelloWorld
  }
}
</script>
`;
  return {
    template,
    dir: "src",
    name: "App.vue"
  };
};
