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
        <img v-if="orderData.img" :src="orderData.img" alt />
        <img v-else src="https://ont.io/upload_img/20190420001238_417.png" alt />
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
// import { OntidContract, TransactionBuilder, TxSignature, Identity, Crypto, RestClient, utils } from 'ontology-ts-sdk';

export default {
  data() {
    return {
      signing: false,
      OJlist: null,
      orderData: null,
      address: null,
      ontid: null,
      orderHashId: null,
      hashTimer: null
    }
  },
  created() {
    this.orderData = JSON.parse(sessionStorage.getItem('orderData'))
    console.log('this.orderData', this.orderData)
    this.address = sessionStorage.getItem("user_ontid").substring(8)
    this.ontid = sessionStorage.getItem("user_ontid")
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
      let params = {}
      let sureParams = {}
      if (this.orderData.authId) {
        params = {
          argsList: [
            { name: "authId", "value": "ByteArray:" + this.orderData.authId },
            { name: "takerReceiveAddress", "value": "Address:" + this.address },
            { name: "tokenAmount", "value": 1 },
            { name: "OJ", "value": "Address:" + this.OJlist.substring(8) }
          ],
          contractHash: "f261464e2cd21c2ab9c06fa3e627ce03c7715ec9",
          method: "takeOrder"
        }
        console.log('params', params)
        // return
        let buyDataParams = {
          id: this.orderData.id,
          demanderOntid: this.ontid,
          demanderAddress: this.address,
          judger: this.OJlist,
          name: this.orderData.name,
          desc: this.orderData.desc,
          img: this.orderData.img,
          keywords: this.orderData.keywords,
          contractVo: params
        }

        sureParams = {
          argsList: [
            // { name: "orderId", value: "ByteArray:" + data.orderId }],
            { name: "orderId", value: "ByteArray:" + this.orderData.authId }],  // to do
          contractHash: "f261464e2cd21c2ab9c06fa3e627ce03c7715ec9",
          method: "confirm"
        }




        try {
          let result = await this.$store.dispatch('makeOrder', buyDataParams)
          console.log('orderResult', result)
          if (result.data.msg === 'SUCCESS') {
            this.orderHashId = result.data.result.id
            let message = result.data.result.message
            message = message.slice(0, message.length - 2)
            message = Ont.utils.sha256(message)
            message = Ont.utils.sha256(message)
            let codeParams = {
              action: 'signMessage',
              version: 'v1.0.0',
              id: result.data.result.id,
              params: {
                type: 'address',
                message: message,
                ishex: true,
                callback: result.data.result.callback,
              }
            }
            console.log('codeParams', codeParams)
            let qrparams = {
              params: codeParams,
              isShow: true
            }
            this.$store.dispatch('changeQrcode', qrparams)
            this.hashTimer = setInterval(async () => {
              let result = await this.$store.dispatch('getCheckRes', this.orderHashId)
              console.log('result orjs', result)
              if (result === 1) {
                clearInterval(this.hashTimer)
                this.$message({
                  message: this.$t('common.buy_suc'),
                  center: true,
                  type: 'success'
                });
                this.$router.push({ path: '/' })
              } else if (result === 3) {
                clearInterval(this.hashTimer)
                this.$message({
                  message: this.$t('common.buy_fail'),
                  type: 'error',
                  center: true,
                  duration: 2000
                });
              } else { }
            }, 3000)
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
            message: error,
            type: 'error',
            center: true,
            duration: 2000
          })
          return false
        }
      } else {
        sureParams = {
          argsList: [
            // { name: "orderId", value: "ByteArray:" + data.orderId }],
            { name: "orderId", value: "ByteArray:" + this.orderData.authId }],  // to do
          contractHash: "7c2b06ae3e70a470d01ac5ce63017d18b88e08b7",
          method: "confirm"
        }
        params = {
          argsList: [
            { name: "orderId", "value": "ByteArray:" + this.orderData.orderId },
            { name: "takerReceiveAddress", "value": "Address:" + this.address },
            { name: "txFeeAmount", "value": this.orderData.price * Math.pow(10, 9) * 0.1 },
            { name: "OJ", "value": "Address:" + this.OJlist.substring(8) }
          ],
          contractHash: "7c2b06ae3e70a470d01ac5ce63017d18b88e08b7",
          method: "takeOrder"
        }
        console.log('params', params)
        // return
        let buyDataParams = {
          id: this.orderData.id,
          demanderOntid: this.ontid,
          demanderAddress: this.address,
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
          message = Ont.utils.sha256(message)
          message = Ont.utils.sha256(message)
          message = Ont.utils.hexstr2str(message)
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
          let res = await this.$store.dispatch('buySecondHandData', buyDataParams)
          console.log('buySecondHandData', res)
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
