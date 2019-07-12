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
        {{detailList.data.name}}
      </div>
      <!-- 图片 -->
      <div class="item">
        <p>{{$t('common.thumbnail')}}:</p>
        <img v-if="detailList.data.img" :src="detailList.data.img" alt />
        <img v-else src="https://ont.io/upload_img/20190420001238_417.png" alt />
      </div>
      <div class="item">
        <p>{{$t('common.tag')}}:</p>
        <el-tag v-for="(item, idx) in detailList.data.keywords" :key="idx">{{item}}</el-tag>
      </div>
      <div class="item" v-show="detailList.coin">
        <p>{{$t('common.coin')}}:</p>
        {{detailList.coin}}
      </div>
      <div class="item" v-show="detailList.price">
        <p>{{$t('common.price')}}:</p>
        {{detailList.price}}
      </div>
      <!-- 描述 -->
      <div class="item">
        <p>{{$t('common.description')}}:</p>
        {{detailList.data.desc}}
      </div>
      <div class="item">
        <p>{{$t('common.certifier')}}:</p>
        {{detailList.certifier}}
        <!-- 认证状态 -->
        <br />
        <el-tag type="info" v-if="detailList.isCertificated === 0">{{$t('common.no_cert')}}</el-tag>
        <el-tag type="success" v-else>{{$t('common.verified')}}</el-tag>
      </div>

      <div class="item" v-show="detailList.data.dToken">
        <p>dToken:</p>
        {{detailList.data.dToken}}
      </div>
      <div class="item" v-show="detailList.data.dataId">
        <p>dataId:</p>
        {{detailList.data.dataId}}
      </div>
      <div class="item">
        <p>{{$t('common.create_time')}}:</p>
        {{detailList.createTime}}
      </div>
    </div>
    <el-button
      type="success"
      :disabled="signing"
      round
      v-if="isCert === 0"
      @click="toCert()"
    >{{$t('common.toCer')}}</el-button>
    <el-button
      type="success"
      :disabled="signing"
      round
      v-else-if="isCert === 1"
    >{{$t('common.verified')}}</el-button>
    <el-button type="success" :disabled="signing" v-else round>{{$t('common.detail')}}</el-button>
  </div>
</template>

<script>
import { client } from 'ontology-dapi'

export default {
  data() {
    return {
      signing: false,
      detailList: { data: {} },
      isCert: null,
      OJlist: null
    }
  },
  created() {
    let id = this.$route.query.commodityId
    this.getDetail(id)
    this.isCert = +sessionStorage.getItem('isCert')
    console.log(this.isCert)
  },
  methods: {
    toIndex() {
      this.$router.push({ path: '/' })
    },
    async getDetail(id) {
      let params = {
        id
      }
      try {
        let res = await this.$store.dispatch('getCommodityDetail', params)
        console.log(res)
        if (res.status === 200 && res.data.msg === 'SUCCESS') {
          this.detailList = res.data.result
        }
      } catch (error) {
        console.log(error)
      }
    },
    async toCert() {
      this.$confirm(this.$t('common.sure_cert'), this.$t('common.prompt'), {
        confirmButtonText: this.$t('common.sure'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'success'
      }).then(async () => {//确定

        let params = {}
        params.id = this.detailList.id
        params.certifier = this.detailList.certifier
        try {
          console.log('params', params)
          let res = await this.$store.dispatch('toCert', params)
          console.log(res);
          if (res.status === 200 && res.data.msg === 'SUCCESS') {
            this.$message({
              message: this.$t('common.verified'),
              type: 'success',
              center: true,
              duration: 2000
            });
            sessionStorage.setItem('isCert', 1)
            this.isCert = 1
            window.location.reload();
          } else {
            this.$message({
              message: this.$t('common.cer_fail'),
              type: 'success',
              center: true,
              duration: 2000
            });
          }
        } catch (error) {
          this.$message({
            message: this.$t('common.cer_fail'),
            type: 'success',
            center: true,
            duration: 2000
          });
        }
      }).catch(() => {
      });
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
