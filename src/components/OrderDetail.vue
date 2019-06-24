<template>
  <div class="detail_box">
    <div style="overflow: hidden; margin-bottom: 20px;">
      <el-button
        @click="$router.go(-1)"
        type="primary"
        plain
        style="float: left"
      >{{$t('common.back_to_prev')}}</el-button>
      <el-button
        @click="toIndex()"
        type="primary"
        plain
        style="float: right"
      >{{$t('common.to_home')}}</el-button>
    </div>
    <div class="item_box">
      <!-- 商品名 -->
      <div class="item">
        <p>{{$t('common.commodity_name')}}:</p>
        {{orderData.name}}
      </div>
      <!-- 图片 -->
      <div class="item">
        <p>{{$t('common.thumbnail')}}:</p>
        <img v-if="orderData.img" :src="orderData.img" alt>
        <img v-else src="https://ont.io/upload_img/20190420001238_417.png" alt>
      </div>
      <div class="item">
        <p>{{$t('common.tag')}}:</p>
        <el-tag v-for="(item, idx) in orderData.keywords" :key="idx">{{item}}</el-tag>
      </div>
      <div class="item">
        <p>{{$t('common.coin')}}:</p>ONG
      </div>
      <div class="item" v-show="orderData.price">
        <p>{{$t('common.price')}}:</p>
        {{orderData.price}}
      </div>
      <!-- 描述 -->
      <div class="item">
        <p>{{$t('common.description')}}:</p>
        {{orderData.desc}}
      </div>
      <div class="item">
        <p>{{$t('common.certification_status')}}:</p>
        <el-tag type="success">{{$t('common.verified')}}</el-tag>
      </div>
      <div class="item">
        <p>{{$t('common.number')}}:</p>
        {{orderData.amount}}
      </div>
      <div class="item" v-show="orderData.judger">
        <p>{{$t('common.judger')}}:</p>
        <el-radio
          v-for="(item, idx) in orderData.judger"
          :key="idx"
          v-model="OJlist"
          :label="item"
        >{{item}}</el-radio>
      </div>
      <div class="item">
        <p>{{$t('common.create_time')}}:</p>
        {{orderData.createTime}}
      </div>
    </div>
    <el-button type="success" :disabled="signing" @click="toBuy()" round>{{$t('common.buy')}}</el-button>
  </div>
</template>

<script>
import { client } from 'ontology-dapi'
import { OntidContract, TransactionBuilder, TxSignature, Identity, Crypto, RestClient, utils } from 'ontology-ts-sdk';

export default {
  data() {
    return {
      signing: false,
      OJlist: null,
      orderData: null,
      address: null,
      ontid: null
    }
  },
  async created() {
    this.orderData = JSON.parse(sessionStorage.getItem('orderData'))
    console.log('this.orderData', this.orderData)
    this.address = await client.api.asset.getAccount()
    this.ontid = await client.api.identity.getIdentity();
  },
  methods: {
    toIndex() {
      this.$router.push({ path: '/' })
    },
    async toBuy() {
      let ontid = sessionStorage.getItem('user_ontid')
      if (!ontid) {
        this.$message({
          message: this.$t('common.lg_by'),
          type: 'error',
          center: true,
          duration: 2000
        });
        return
      }
      if (!this.OJlist) {
        this.$message({
          message: this.$t('common.select') + ' ' + this.$t('common.judger'),
          type: 'error',
          center: true,
          duration: 2000
        })
        return
      }
      let params = {
        argsList: [
          { name: "orderId", "value": "ByteArray:" + this.orderData.orderId },
          { name: "takerReceiveAddress", "value": "Address:" + this.address },
          { name: "txFeeTokenHash", "value": "ByteArray:0000000000000000000000000000000000000002" },
          { name: "txFeeAmount", "value": this.orderData.price * Math.pow(10, 9) * 0.1 },
          { name: "OJ", "value": "Address:" + this.OJlist.substring(8) }
        ],
        contractHash: "88da35324f1133aca1f3b728b27fa1f017e6fb8c",
        method: "takeOrder"
      }
      console.log('params', params)
      // return
      let buyDataParams = {
        id: this.orderData.id,
        demanderOntid: this.ontid,
        judger: this.OJlist,
        sigVo: {
          txHex: '',
          pubKeys: '',
          sigData: ''
        }
      }
      try {
        let res = await this.$store.dispatch('makeTransaction', params)
        console.log('makeTransaction', res)
        if (res.data.msg === 'SUCCESS') {
          buyDataParams.sigVo.txHex = res.data.result
        } else {
          this.$message({
            message: this.$t('common.buy_fail'),
            type: 'error',
            center: true,
            duration: 2000
          })
          return false
        }
      } catch (error) {
        this.$message({
          message: this.$t('common.buy_fail'),
          type: 'error',
          center: true,
          duration: 2000
        })
        return false
      }

      try {
        let message = buyDataParams.sigVo.txHex
        message = message.slice(0, message.length - 2)
        message = utils.sha256(message)
        message = utils.sha256(message)
        message = utils.hexstr2str(message)
        let signData = await client.api.message.signMessage({ message });
        buyDataParams.sigVo.pubKeys = signData.publicKey
        buyDataParams.sigVo.sigData = signData.data
      } catch (error) {
        this.$message({
          message: this.$t('common.buy_fail'),
          type: 'error',
          center: true,
          duration: 2000
        })
        return false
      }
      console.log('buyDataParams', buyDataParams)

      try {
        let res = await this.$store.dispatch('buyData', buyDataParams)
        console.log('buyData', res)
        if (res.data.msg == 'SUCCESS' && res.data.result) {
          this.$message({
            message: this.$t('common.buy_suc'),
            type: 'success',
            center: true,
            duration: 2000
          })
          this.$router.push({ path: '/' })
        } else {
          console.log('error222')
          this.$message({
            message: this.$t('common.buy_fail'),
            type: 'error',
            center: true,
            duration: 2000
          })
          return false
        }
      } catch (error) {
        console.log('error', error)
        this.$message({
          message: this.$t('common.buy_fail'),
          type: 'error',
          center: true,
          duration: 2000
        })
        return false
      }
    }
  },
}
</script>

<style lang='less' scoped>
.detail_box {
  width: 80%;
  margin: 40px auto;
  .item_box {
    width: 50%;
    margin: 0 auto;
    text-align: left;
    margin-bottom: 20px;
    .item {
      p {
        font-size: 22px;
        color: #000;
        line-height: 28px;
      }
      img {
        width: 160px;
      }
      span.el-tag {
        margin-right: 20px;
      }
    }
  }
}
</style>
