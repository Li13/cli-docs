<template>
  <div class="message">
    {{message}}
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  data() {
    return {
      message: '欢迎使用 qts-cli'
    }
  }
}
</script>
<style lang="less">
  .message {
    font-size: 100px;
  }
</style>