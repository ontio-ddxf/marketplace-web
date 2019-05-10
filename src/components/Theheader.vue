<template>
  <div class="header_layout">
    <el-button round size="small" v-show="userAccount" @click="toOrder()">订单中心</el-button>
    <el-button round size="small" v-if="userAccount" @click="LoginOut()">退出</el-button>
    <el-button round size="small" :disabled="logining" v-else @click="getIdenty()">登陆</el-button>
    <span class="userAccount">{{userAccount}}</span>
  </div>
</template>

<script>
import { client } from 'ontology-dapi';
export default {
  data() {
    return {
      userAccount: '',
      logining: false
    }
  },
  created() {
    this.userAccount = sessionStorage.getItem('user_ontid')
  },
  methods: {
    LoginOut() {
      this.$confirm('确定退出当前登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {//确定
        sessionStorage.removeItem("user_ontid");
        sessionStorage.removeItem("access_token");
        this.userAccount = '';
        this.$router.push({ path: '/' });
      }).catch(() => {

      });
    },
    async getIdenty() {
      try {
        this.logining = true
        let res = await client.api.identity.getIdentity()
        sessionStorage.setItem("user_ontid", res)
        this.userAccount = res
        this.logining = false
        this.$message({
          message: '登陆成功',
          type: 'success',
          center: true,
          duration: 2000
        });
        this.$router.push({ path: '/' });
      } catch (error) {
        this.$message({
          message: '登陆失败，请重试！',
          type: 'error',
          center: true,
          duration: 2000
        });
        this.logining = false
      }
    },
    toOrder() {
      this.$router.push({ path: 'ordercenter' });
    }
  }
}
</script>

<style lang="less" scoped>
.header_layout {
  overflow: hidden;
  button.el-button {
    background: #000;
    color: #fff;
    float: right;
    margin-right: 20px;
    margin: 14px;
  }

  span.userAccount {
    display: block;
    float: right;
    margin-right: 40px;
    height: 60px;
    line-height: 60px;
  }
}
</style>
