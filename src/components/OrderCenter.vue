<template>
  <div class="order_box">
    <div style="overflow: hidden; margin-bottom: 20px;">
      <el-button @click="toIndex()" type="primary" plain style="float: right">返回首页</el-button>
    </div>
    <el-tabs v-model="activeName" type="card" @tab-click="handleClick">
      <el-tab-pane label="买家中心" name="first">
        <Buyer></Buyer>
      </el-tab-pane>
      <el-tab-pane label="卖家中心" name="second">
        <Seller></Seller>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import Buyer from './Buyer'
import Seller from './Seller'
export default {
  components: {
    Buyer, Seller
  },
  data() {
    return {
      activeName: 'first'
    };
  },
  methods: {
    handleClick(tab, event) {
    },
    toIndex() {
      this.$router.push({ path: '/' })
    }
  }
}
</script>

<style lang='less' scoped>
.order_box {
  margin: 100px auto;
}
</style>
