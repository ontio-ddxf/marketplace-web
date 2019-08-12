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
          <el-dropdown-item command="secondHandCommoditylist">{{$t('top.second_hand_commodity')}}</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
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
import { mapState } from 'vuex'

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
      value: '',
      getResTimer: null,
      dataId: ''
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
        let result = await this.$store.dispatch('getLoginMsg')
        console.log('loginmsg', result)
        if (result.data.desc === 'SUCCESS') {
          this.dataId = result.data.result.id
          let codeParams = {
            action: 'onsLogin',
            version: 'v1.0.0',
            id: result.data.result.id,
            params: {
              // type: 'ontid',
              // type: 'address',
              domain: 'on.ont',
              dappName: 'dapp Name',
              dappIcon: 'dapp Icon',
              message: result.data.result.message,
              domainListUrl: result.data.result.domain_list_url + '/?domain=on.ont&ontid=',
              callback: result.data.result.callback,
            }
          }
          // ons_list_url
          // domainListUrl: '/?domain=ont.io&ontid='
          console.log('codeParams', codeParams)
          let qrparams = {
            params: codeParams,
            isShow: true
          }
          this.$store.dispatch('changeQrcode', qrparams)
          this.getResTimer = setInterval(() => {
            this.getLoginResult()
          }, 3000)
        } else {
          this.$message({
            message: 'Get Message Fail!',
            center: true,
            type: 'error'
          });
          return
        }
      } catch (error) {
        this.$message({
          message: error,
          center: true,
          type: 'error'
        });
        return
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
    async getLoginResult() {
      if (this.isShow) {
        try {
          let res = await this.$store.dispatch('getLoginRes', this.dataId)
          console.log('getLoginResult', res)
          if (res.data.desc === 'SUCCESS') {
            if (res.data.result && res.data.result.result === '1') {
              if (!res.data.result.ons) {
                this.$message({
                  message: 'Please Sign Up ONS',
                  center: true,
                  type: 'error'
                });
                clearInterval(this.getResTimer)
                return
              } else {
                this.$message({
                  message: 'Sign In Successful',
                  center: true,
                  type: 'success'
                });
                this.$store.commit('CHANGE_MODEL_STATE', false)
                clearInterval(this.getResTimer)
                sessionStorage.setItem("ons", res.data.result.ons)
                sessionStorage.setItem("user_ontid", res.data.result.ontid)
                this.userAccount = res.data.result.ons
                this.$router.push({ path: '/' });
                return
              }
            }
          } else {
            this.$message({
              message: 'Get Sign In Result Fail!',
              center: true,
              type: 'error'
            });
            clearInterval(this.getResTimer)
            return
          }
        } catch (error) {
          this.$message({
            message: error,
            center: true,
            type: 'error'
          });
          clearInterval(this.getResTimer)
          return
        }
      } else {
        clearInterval(this.getResTimer)
        return
      }

    }
  },
  computed: {
    ...mapState({
      isShow: state => state.qrcodeParams.isShow,
    })
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
