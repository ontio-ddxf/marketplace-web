<template>
  <div class="header_layout">
    <el-button round size="small" v-if="userAccount" @click="LoginOut">退出</el-button>
    <el-button round size="small" v-else @click="Login">登陆</el-button>
    <span class="userAccount">{{userAccount}}</span>
  </div>
</template>

<script>
export default {
  data() {
    return {
      userAccount: ''
    }
  },
  created() {
    this.userAccount = sessionStorage.getItem('user_ontid')
    if (sessionStorage.getItem("user_ontid")) {
      this.userAccount = sessionStorage.getItem("user_ontid");
    }
    else {
      var result = this.$route.query.result;
      if (result) {
        var response = JSON.parse(decodeURIComponent(result));
        sessionStorage.setItem("user_ontid", response.user_ontid);
        sessionStorage.setItem("access_token", response.access_token);
        this.userAccount = sessionStorage.getItem("user_ontid");
      }
    }
  },
  methods: {
    Login() {
      var callback_url = window.location.origin + '/#/';
      var appontid = 'did:ont:ANqiHycikgyzkfz36faP5ymXLVg1uovhXh';
      var appname = 'OntSourcing';
      var value = window.encodeURIComponent(appontid + '&' + appname + '&' + callback_url + '&' + 'zh');
      window.location.href = "http://139.219.136.188:10390?params=" + value;
    },
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
    }
  },
}
</script>

<style lang="less" scoped>
.header_layout {
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
