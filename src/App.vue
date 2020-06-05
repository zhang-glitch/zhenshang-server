<template>
  <div id="app">
    <login/>
    <router-view/>
  </div>
</template>

<script>
import Login from "./components/Login"
export default {
  name: "App",
  components: {
    Login
  }
}
</script>
<style>

</style>
