<template>
  <div class="layout">
    <el-container>
      <el-header>
        <Theheader></Theheader>
      </el-header>
      <el-main>
        <router-view/>
        <Commoditylist v-if='this.$route.path == "/"'></Commoditylist>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import Theheader from '../components/Theheader'
import Commoditylist from '../components/Commoditylist'
export default {
  components: {
    Theheader,
    Commoditylist
  }
}
</script>

<style lang='less' scoped>
.layout {
  width: 80%;
  margin: 0 auto;
}
</style>
