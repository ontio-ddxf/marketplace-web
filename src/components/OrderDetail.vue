<template>
  <div class="detail_box">
    <div style="overflow: hidden; margin-bottom: 20px;">
      <el-button @click="toIndex()" type="primary" plain style="float: right">返回首页</el-button>
    </div>
    <div class="item_box">
      <!-- 商品名 -->
      <div class="item">
        <p>商品名:</p>
        {{orderData.name}}
      </div>
      <!-- 图片 -->
      <div class="item">
        <p>缩略图:</p>
        <img v-if="orderData.img" :src="orderData.img" alt>
        <img v-else src="https://ont.io/upload_img/20190420001238_417.png" alt>
      </div>
      <div class="item">
        <p>标签:</p>
        <el-tag v-for="(item, idx) in orderData.keywords" :key="idx">{{item}}</el-tag>
      </div>
      <div class="item">
        <p>币种:</p>ONG
      </div>
      <div class="item" v-show="orderData.price">
        <p>价格:</p>
        {{orderData.price}}
      </div>
      <!-- 描述 -->
      <div class="item">
        <p>描述:</p>
        {{orderData.desc}}
      </div>
      <div class="item">
        <p>认证状态:</p>
        <el-tag type="success">已认证</el-tag>
      </div>
      <div class="item">
        <p>剩余数量:</p>
        {{orderData.amount}}
      </div>
      <div class="item" v-show="orderData.judger">
        <p>仲裁方:</p>
        <el-radio
          v-for="(item, idx) in orderData.judger"
          :key="idx"
          v-model="OJlist"
          :label="item"
        >{{item}}</el-radio>
      </div>
      <div class="item">
        <p>创建时间:</p>
        {{orderData.createTime}}
      </div>
    </div>
    <el-button type="success" :disabled="signing" @click="toBuy()" round>立即购买</el-button>
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
      if (!this.OJlist) {
        this.$message({
          message: '请选择仲裁方',
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
        contractHash: "3da0998e1e759aaed78b41ce1f92151d7b3f1083",
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
            message: '购买失败！',
            type: 'error',
            center: true,
            duration: 2000
          })
          return false
        }
      } catch (error) {
        this.$message({
          message: '购买失败！',
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
          message: '购买失败！',
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
            message: '购买成功！',
            type: 'success',
            center: true,
            duration: 2000
          })
          this.$router.push({path: '/'})
        } else {
          console.log('error222')
          this.$message({
            message: '购买失败！',
            type: 'error',
            center: true,
            duration: 2000
          })
          return false
        }
      } catch (error) {
        console.log('error', error)
        this.$message({
          message: '购买失败！',
          type: 'error',
          center: true,
          duration: 2000
        })
        return false
      }


      // console.log('params', params)
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
