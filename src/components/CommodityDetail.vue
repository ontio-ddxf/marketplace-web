<template>
  <div class="detail_box">
    <div style="overflow: hidden; margin-bottom: 20px;">
      <el-button @click="toIndex()" type="primary" plain style="float: right">返回首页</el-button>
    </div>
    <div class="item_box">
      <!-- 商品名 -->
      <div class="item">
        <p>商品名:</p>
        {{detailList.data.name}}
      </div>
      <!-- 图片 -->
      <div class="item">
        <p>缩略图:</p>
        <img v-if="detailList.data.img" :src="detailList.data.img" alt>
        <img v-else src="https://ont.io/upload_img/20190420001238_417.png" alt>
      </div>
      <div class="item">
        <p>标签:</p>
        <el-tag v-for="(item, idx) in detailList.data.keywords" :key="idx">{{item}}</el-tag>
      </div>
      <div class="item">
        <p>币种:</p>
        {{detailList.coin}}
      </div>
      <div class="item">
        <p>价格:</p>
        {{detailList.price}}
      </div>
      <!-- 描述 -->
      <div class="item">
        <p>描述:</p>
        {{detailList.data.desc}}
      </div>
      <div class="item">
        <p>认证方:</p>
        {{detailList.certifier}}
        <!-- 认证状态 -->
        <br>
        <el-tag type="info" v-if="detailList.isCertificated === 0">认证中</el-tag>
        <el-tag type="success" v-else>已认证</el-tag>
      </div>
      <div class="item">
        <p>仲裁方:</p>
        {{detailList.judger}}
      </div>
      <div class="item">
        <p>dToken:</p>
        {{detailList.data.dToken}}
      </div>
      <div class="item">
        <p>dataId:</p>
        {{detailList.data.dataId}}
      </div>
      <div class="item">
        <p>创建时间:</p>
        {{detailList.createTime}}
      </div>
    </div>
    <el-button type="success" :disabled="signing" round v-if="isCert" @click="toCert()">立即认证</el-button>
    <el-button type="success" :disabled="signing" v-else @click="toBuy()" round>立即购买</el-button>
  </div>
</template>

<script>
import { client } from 'ontology-dapi'

export default {
  data() {
    return {
      signing: false,
      detailList: { data: {} },
      isCert: null
    }
  },
  created() {
    // console.log(this.$route.query.commodityId)
    let id = this.$route.query.commodityId
    this.getDetail(id)
    this.isCert = sessionStorage.getItem('isCert')
    sessionStorage.removeItem('isCert')
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

      let operation = 'sendToken'

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
      let token_address = this.$store.state.token_address
      console.log(this.$store.state.token_address)
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

      let wait_send_msg_time = 6000

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
      let params = {
        operation,
        args
      }

      try {
        this.signing = true
        const result = await this.$store.dispatch('dapiInvoke', params)
        console.log('result', result)
        if (result && result.transaction) {
          this.$message({
            message: '购买成功！',
            type: 'success',
            center: true,
            duration: 2000
          });
          this.signing = false
        } else {
          this.$message({
            message: '购买失败，请重试！',
            type: 'error',
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
      let params = {
        id
      }
      try {
        let res = await this.$store.dispatch('getCommodityDetail', params)
        if (res.status === 200 && res.data.msg === 'SUCCESS') {
          this.detailList = res.data.result
        }
      } catch (error) {
        console.log(error)
      }
    },
    async toCert() {
      let params = {}
      params.id = this.detailList.id
      params.certifier = this.detailList.certifier
      try {
        let res = await this.$store.dispatch('toCert', params)
        console.log(res);
        if (res.status === 200 && res.data.msg === 'SUCCESS') {
          this.$message({
            message: '认证成功！',
            type: 'success',
            center: true,
            duration: 2000
          });
          window.location.reload();
        } else {
          this.$message({
            message: '认证失败！',
            type: 'success',
            center: true,
            duration: 2000
          });
        }
      } catch (error) {
        this.$message({
          message: '认证失败！',
          type: 'success',
          center: true,
          duration: 2000
        });
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
