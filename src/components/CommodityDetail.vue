<template>
  <div class="detail_box">
    <div style="overflow: hidden; margin-bottom: 20px;">
      <el-button @click="toIndex()" type="primary" plain style="float: right">返回首页</el-button>
    </div>
    <div class="item_box">
      <div class="item">
        <p>标签:</p>
        <el-tag v-for="(item, idx) in detailList.tagValue" :key="idx">{{item}}</el-tag>
      </div>
      <div class="item">
        <p>币种:</p>
        {{detailList.coin}}
      </div>
      <div class="item">
        <p>价格:</p>
        {{detailList.price}}
      </div>
      <div class="item">
        <p>创建时间:</p>
        {{detailList.createTime}}
      </div>
    </div>
    <el-button type="success" :disabled="signing" @click="toBuy()" round>立即购买</el-button>
  </div>
</template>

<script>
import { client } from 'ontology-dapi'

export default {
  data() {
    return {
      signing: false,
      detailList: {}
    }
  },
  created() {
    console.log(this.$route.query.commodityId)
    let id = this.$route.query.commodityId
    this.getDetail(id)
  },
  methods: {
    toIndex() {
      this.$router.push({ path: '/' })
    },
    async toBuy() {
      let ontid = sessionStorage.getItem('user_ontid')
      if (!ontid) {
        this.$message({
          message: '请先登录，再购买！',
          type: 'error',
          center: true,
          duration: 2000
        });
        return
      }

      let scriptHash = '472848200412d9a7abbb0ed0bfb568a47745e4ba'
      let operation = 'sendToken'
      let gasPrice = 500
      let gasLimit = 30000
      let requireIdentity = true

      // 构造args
      let account = await client.api.asset.getAccount()
      console.log('account', account);
      let demander = account
      demander = client.api.utils.addressToHex(demander)
      console.log(demander)
      let provider = this.detailList.ontid      
      let idxstr = provider.lastIndexOf(':')
      console.log(idxstr)
      console.log('provider', provider)
      provider = provider.substr(idxstr + 1)
      console.log('provider', provider)
      provider = client.api.utils.addressToHex(provider)
      console.log(provider)
      let token_address = '0000000000000000000000000000000000000002'
      let id = this.$route.query.commodityId
      id = client.api.utils.strToHex(id)
      console.log('id', id)
      let data_list = [
        {
          type: 'ByteArray',
          value: id
        }
      ]

      let price = this.detailList.price
      price = Number(price)
      let price_list = [
        {
          type: 'Integer',
          value: price
        }
      ]

      let wait_send_msg_time = 60000

      let args = [
        {
          type: 'ByteArray',
          value: demander
        },
        {
          type: 'ByteArray',
          value: provider
        },
        {
          type: 'ByteArray',
          value: token_address
        }, {
          type: 'Array',
          value: data_list
        }, {
          type: 'Array',
          value: price_list
        }, {
          type: 'Integer',
          value: wait_send_msg_time
        },
      ]
      console.log(args)

      try {
        this.signing = true
        const result = await client.api.smartContract.invoke({
          scriptHash,
          operation,
          args,
          gasPrice,
          gasLimit,
          requireIdentity
        });
        console.log(result)
        if (result && result.transaction) {
          this.$message({
            message: '购买成功！',
            type: 'success',
            center: true,
            duration: 2000
          });
          this.signing = false
        }

      } catch (error) {
        this.$message({
          message: '购买失败，请重试！',
          type: 'error',
          center: true,
          duration: 2000
        });
        this.signing = false
      }
    },
    async getDetail(id) {

      try {
        let res = await this.$http.get(`http://192.168.50.96:8182/api/v1/dataset/${id}`)
        if (res.status === 200 && res.data.msg === 'SUCCESS') {
          this.detailList = res.data.result
        }
      } catch (error) {
        console.log(error)
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
      span.el-tag {
        margin-right: 20px;
      }
    }
  }
}
</style>
