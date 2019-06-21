<template>
  <div class="header_layout">
    <div class="logo" @click="toIndex()"></div>
    <div class="select_lang">
      <el-select
        v-model="$i18n.locale"
        size="mini"
        :placeholder="$t('common.lang')"
        popper-class="text-color"
        @change="handlechange"
      >
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        ></el-option>
      </el-select>
    </div>
    <div class="dropList" v-show="userAccount">
      <el-dropdown @command="toOrder">
        <span class="el-dropdown-link">
          {{$t('top.personal_center')}}
          <i class="el-icon-arrow-down el-icon--right"></i>
        </span>
        <el-dropdown-menu slot="dropdown" style="top:auto; top: 40px; padding-bottom: 0;">
          <el-dropdown-item command="ordercenter">{{$t('top.order_center')}}</el-dropdown-item>
          <el-dropdown-item command="commoditymanage">{{$t('top.Commodity_Center')}}</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>

    <!-- <el-button round size="small" v-show="userAccount" @click="toOrder()">订单中心</el-button> -->
    <el-button round size="small" v-if="userAccount" @click="LoginOut()">{{$t('sign.sign_out')}}</el-button>
    <el-button
      round
      size="small"
      :disabled="logining"
      v-else
      @click="getIdenty()"
    >{{$t('sign.sign_in')}}</el-button>
    <el-button round size="small" v-show="!userAccount" @click="toRegister()">{{$t('sign.sign_up')}}</el-button>
    <span class="userAccount">{{userAccount}}</span>
  </div>
</template>

<script>
import { client } from 'ontology-dapi';
import LangStorage from '../helpers/lang'
export default {
  data() {
    return {
      userAccount: '',
      logining: false,
      options: [{
        value: 'en',
        label: 'English'
      }, {
        value: 'zh',
        label: '中文'
      }],
      value: ''
    }
  },
  created() {
    this.userAccount = sessionStorage.getItem('ons')
  },
  methods: {
    toIndex() {
      this.$router.push({ path: '/' })
    },
    LoginOut() {
      this.$confirm(this.$t('top.sure_out'), this.$t('common.prompt'), {
        confirmButtonText: this.$t('common.sure'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(() => {//确定
        sessionStorage.removeItem("user_ontid");
        sessionStorage.removeItem("access_token");
        sessionStorage.removeItem("ons");
        this.userAccount = '';
        this.$router.push({ path: '/' });
      }).catch(() => {

      });
    },
    async getIdenty() {
      try {
        this.logining = true
        let message = 'Welcome to MarketPlace'
        let result = await client.api.message.signMessage({ message });
        console.log(result)
        if (!result.data || !result.publicKey) {
          this.$message({
            message: this.$t('top.login_fail'),
            type: 'error',
            center: true,
            duration: 2000
          });
          this.logining = false
          return
        }
        // console.log(result);
        // return
        let res = await client.api.identity.getIdentity()

        try {
          let result = await this.$store.dispatch('login', res)
          if (result.data.result) {
            sessionStorage.setItem("ons", result.data.result)
            sessionStorage.setItem("user_ontid", res)
            this.userAccount = result.data.result
            this.logining = false
            this.$message({
              message: this.$t('top.login_suc'),
              type: 'success',
              center: true,
              duration: 2000
            });
            this.$router.push({ path: '/' });
          } else {
            this.logining = false
            this.$message({
              message: this.$t('top.ontid_fail'),
              type: 'warning',
              center: true,
              duration: 2000
            });
            this.$router.push({ path: 'register' });
          }
        } catch (error) {
          this.$message({
            message: this.$t('top.login_fail'),
            type: 'error',
            center: true,
            duration: 2000
          });
          this.logining = false
        }
      } catch (error) {
        this.$message({
          message: this.$t('top.login_fail'),
          type: 'error',
          center: true,
          duration: 2000
        });
        this.logining = false
      }
    },
    toOrder(command) {
      console.log(command)
      this.$router.push({ path: command });
    },
    toRegister() {
      this.$router.push({ path: 'register' });
    },
    handlechange(val) {
      this.$i18n.locale = val
      LangStorage.setLang(this.$i18n.locale)
      window.location.reload()
    },
  }
}
</script>

<style lang="less" scoped>
.header_layout {
  overflow: hidden;
  .logo {
    float: left;
    width: 140px;
    height: 60px;
    background: url(../assets/images/logo_dark.svg) no-repeat center;
    background-size: contain;
    cursor: pointer;
    &:hover {
      opacity: 0.7;
    }
  }
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

  .dropList {
    float: right;
    height: 60px;
    line-height: 60px;
  }
  .select_lang {
    float: right;
    width: 100px;
    height: 60px;
    line-height: 60px;
    margin-left: 20px;
    margin-right: 20px;
  }
}
.el-dropdown-menu {
  top: 40px !important;
}
</style>
