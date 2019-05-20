<template>
  <div class="commoditymanage_box">
    <div class="msg">
      <el-button @click="toIndex()" type="primary" plain style="float: right">返回首页</el-button>
      <div class="msg_item">
        <p>发布商品需要KYC认证</p>
        <p>KYC: www.baidu.com</p>
        <p>
          还未认证，
          <el-link type="danger" @click="certificatKYC()">立即认证</el-link>
        </p>
      </div>
      <div class="msg_item">
        <p>Wallet Address</p>
        <p v-if="address">{{address}}</p>
        <p v-else>
          <el-link type="danger" @click="walletAddress()">获取地址</el-link>
        </p>
      </div>
      <el-button style="margin-bottom: 20px;" @click="toAddData()" type="primary">新增商品</el-button>
    </div>
    <div class="table_box">
      <el-table :data="tableData" border style="width: 100%">
        <el-table-column type="index" align="center" width="50" :index="indexMethod"></el-table-column>
        <el-table-column prop="data.name" align="center" label="商品名" width="180"></el-table-column>
        <el-table-column align="center" label="标签">
          <template slot-scope="scope">
            <el-tag
              style="margin-right: 10px;"
              v-for="(item, idx) in scope.row.data.keywords"
              :key="idx"
            >{{item}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="coin" align="center" label="币种" width="80"></el-table-column>
        <el-table-column prop="price" align="center" label="价格" width="80"></el-table-column>
        <el-table-column align="center" label="认证状态" width="100">
          <template slot-scope="scope">
            <el-tag
              style="margin-right: 10px;"
              type="info"
              v-if="scope.row.isCertificated === 0"
            >未认证</el-tag>
            <el-tag style="margin-right: 10px;" v-else type="success">已认证</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" align="center" label="日期" width="200"></el-table-column>
        <el-table-column label="操作" align="center" width="200">
          <template slot-scope="scope">
            <el-button @click="handleClick(scope.row)" type="primary" round size="small">详情</el-button>
            <el-button
              @click="toEditData(scope.row)"
              type="primary"
              size="small"
              icon="el-icon-edit"
              circle
            ></el-button>
            <el-button
              @click="prodOperat(scope.row)"
              v-if="scope.row.state === 1"
              type="warning"
              round
              size="small"
            >下架</el-button>
            <el-button @click="prodOperat(scope.row)" v-else type="success" round size="small">上架</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import { client } from 'ontology-dapi'
import { setTimeout } from 'timers';

export default {
  data() {
    return {
      address: null,
      tableData: [],
      ontid: ''
    }
  },
  methods: {
    certificatKYC() {
      let callback_url = window.location.origin + '/#/commoditymanage';
      let access_token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiJ9.eyJhdWQiOiJkaWQ6b250OkFQZUUxcGlKcmhzRVRncG5nSHNUM2htdXZyakFpRFF0NE4iLCJpc3MiOiJkaWQ6b250OkFkajdXNVoyaFRlS0g3WXdKc2ZNekx1d2lENjcxbXZKNlgiLCJleHAiOjE1NTc5OTM3MDEsImlhdCI6MTU1NzkwNzMwMSwianRpIjoiZmY2MWIyNDdmZTZjNGFlNjg3MDNlNjJlZDMxYTM0ODgiLCJjb250ZW50Ijp7InR5cGUiOiJhY2Nlc3NfdG9rZW4iLCJvbnRpZCI6ImRpZDpvbnQ6QWF0YmdWMThhOExRMkhhZWJ6cVEzZmtqUnFURzV0V0FHcSJ9fQ.MDEwYWY0OWI4ZmFhZDRhZjM1MDhmMjg2MGFlYTI3MjZhZDE2NGVhNDIyYjgzNTU0N2U1ODVlODA3ZTRlOWE2MGY1MDE0ZjVjNmZmNWJlODIxNTc5NmZlODVjY2UzMDcxNzI5ZTczNzU4MDA2MGIyN2NhZTlmMzlmMWVmYjFkNDA2NQ'
      let ontid = 'did:ont:AatbgV18a8LQ2HaebzqQ3fkjRqTG5tWAGq'
      console.log(ontid + '&' + access_token + '&' + callback_url + '&' + 'zh')
      let value = window.encodeURIComponent(ontid + '&' + access_token + '&' + callback_url + '&' + 'zh');
      console.log(value)
      window.location.href = 'https://kyc.ont.io/#/mgmtHome?params=' + value;
    },
    async walletAddress() {
      this.address = await client.api.asset.getAccount()
    },
    toIndex() {
      this.$router.push({ path: '/' })
    },
    toAddData() {
      this.$router.push({ path: 'addnewdata' })
    },
    indexMethod(idx) {
      return idx + 1
    },
    async getSellData() {
      try {
        let res = await this.$store.dispatch('getSellData', this.ontid)
        console.log(res);
        if (res.status === 200 && res.data.msg === 'SUCCESS') {
          this.tableData = res.data.result
        } else {
          this.tableData = []
        }
      } catch (error) {
        this.tableData = []
      }
    },
    handleClick(row) {
      this.$router.push({ path: 'commoditydetail', query: { commodityId: row.id } });
    },
    toEditData(row) {
      this.$router.push({ path: 'editdata', query: { commodityId: row.id } });
    },
    async  prodOperat(row) {
      console.log(row)
      try {
        let res = await this.$store.dispatch('prodOperat', row.id)
        console.log(res);
        if (res.status === 200 && res.data.msg === "SUCCESS") {
          this.getSellData()
        }
      } catch (error) {
        return error
      }
    }
  },
  async mounted() {
    this.ontid = await client.api.identity.getIdentity()
    console.log(this.ontid);
    this.getSellData()
  },
}
</script>

<style lang='less' scoped>
.commoditymanage_box {
  // width: 80%;
  margin: 20px auto;
  text-align: left;
  overflow: hidden;
  .msg {
    overflow: hidden;
    width: 50%;
    margin: 0 auto;
  }
}
</style>
