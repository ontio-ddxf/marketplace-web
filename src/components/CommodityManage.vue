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
        <!-- <el-table-column prop="coin" align="center" label="币种" width="80"></el-table-column> -->
        <!-- <el-table-column prop="price" align="center" label="价格" width="80"></el-table-column> -->
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
        <el-table-column label="操作" align="center" width="400">
          <template slot-scope="scope">
            <el-button @click="dialog(scope.row)" type="primary" round size="small">DataId</el-button>
            <el-button @click="handleClick(scope.row)" type="primary" round size="small">详情</el-button>
            <el-button
              @click="prodOperat(scope.row)"
              v-if="scope.row.state === 1"
              type="warning"
              round
              size="small"
            >挂单</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!--  -->
    <el-dialog title="收货地址" :visible.sync="dialogFormVisible" center width="30%">
      <el-form :model="form" :rules="rules" ref="ruleForm">
        <el-form-item label="symbol" prop="symbol">
          <el-input v-model="form.symbol" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="name" prop="name">
          <el-input v-model="form.name" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="totalAmount" prop="totalAmount">
          <el-input type="age" v-model.number="form.totalAmount" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="proDataId('ruleForm')">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { client } from 'ontology-dapi'
import { setTimeout } from 'timers';
import { OntidContract, TransactionBuilder, TxSignature, Identity, Crypto, RestClient, utils } from 'ontology-ts-sdk';

import { TEST_NET } from '../assets/control'
import { sha256 } from 'js-sha256'
import { throws } from 'assert';
export default {
  data() {
    return {
      address: null,
      tableData: [],
      ontid: '',
      url: '',
      dialogFormVisible: false,
      form: {
        symbol: '',
        name: '',
        totalAmount: null
      },
      rules: {
        name: [
          { required: true, message: '请输入name', trigger: 'blur' },
          { min: 3, message: '字符长度不能小于3', trigger: 'blur' }
        ],
        symbol: [
          { required: true, message: '请输入symbol', trigger: 'blur' },
          { min: 3, message: '字符长度不能小于3', trigger: 'blur' }
        ],
        totalAmount: [
          { required: true, message: '请输入totalAmount' },
          { type: 'number', message: 'totalAmount必须是数字' },
        ]
      },
      cortData: null
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

        let params = {
          ontid: this.ontid,
          pageNum: 0,
          pageSize: 10
        }
        console.log(params)
        let res = await this.$store.dispatch('getSellData', params)
        console.log(res);
        if (res.status === 200 && res.data.msg === 'SUCCESS') {
          this.tableData = res.data.result.recordList
        } else {
          this.tableData = []
        }
      } catch (error) {
        this.tableData = []
      }
    },
    handleClick(row) {
      sessionStorage.setItem('isCert', 3)
      this.$router.push({ path: 'commoditydetail', query: { commodityId: row.id } });
    },
    toEditData(row) {
      if (row.state == 1) {
        this.$message({
          message: '请先下架，才能修改！',
          type: 'success',
          center: true,
          duration: 2000
        });
        return;
      }
      // this.$router.push({ path: 'editdata', query: { commodityId: row.id } });
    },
    async prodOperat(row) {
      if (!row.tokenId) {
        this.$message({
          message: 'tokenId生成中，请稍后！',
          type: 'error',
          center: true,
          duration: 2000
        });
      } else {
        this.$router.push({ path: 'editdata', query: { commodityId: row.id } });
      }
      console.log(row)
      // try {
      //   let res = await this.$store.dispatch('prodOperat', row.id)
      //   console.log(res);
      //   if (res.status === 200 && res.data.msg === "SUCCESS") {
      //     this.getSellData()
      //   }
      // } catch (error) {
      //   return error
      // }
    },
    proDataId(formName) {
      this.$refs[formName].validate(async (valid) => {
        if (valid) {

          const privateKey = Crypto.PrivateKey.random();
          var identity = Identity.create(privateKey, '', '')
          let params0 = {
            dataId: identity.ontid,
            ontid: this.ontid,
            pubKey: 1,
            contractVo: {
              argsList: [{
                name: "account",
                value: "Address:" + this.ontid.substring(8)
              }, {
                name: "dataId",
                value: "String:" + identity.ontid
              }, {
                name: "ontid",
                value: "String:" + this.ontid
              }, {
                name: "index",
                value: 1
              }, {
                name: "symbol",
                value: "String:" + this.form.symbol
              }, {
                name: "name",
                value: "String:" + this.form.name
              }, {
                name: "totalAmount",
                value: this.form.totalAmount
              }],
              contractHash: "0f0929b514ddf62522a8a335b588321b2e7725bc",
              method: "createTokenWithController",
            }
          }
          console.log('params0', params0.dataId)
          let res = await this.$store.dispatch('getDID', params0)
          console.log('result', res)
          if (res.data.msg === 'SUCCESS') {
            let params1 = {
              id: this.cortData.id,
              dataId: identity.ontid,
              sigDataVo: {
                txHex: res.data.result[0],
                pubKeys: '',
                sigData: ''
              },
              sigTokenVo: {
                txHex: res.data.result[1],
                pubKeys: '',
                sigData: ''
              }
            }

            let message0 = res.data.result[0]
            console.log('message1', message0)
            message0 = message0.slice(0, message0.length - 2)
            message0 = utils.sha256(message0)
            message0 = utils.sha256(message0)
            message0 = utils.hexstr2str(message0)
            try {
              let signData = await client.api.message.signMessage({ message: message0 });
              params1.sigDataVo.pubKeys = signData.publicKey
              params1.sigDataVo.sigData = signData.data
            } catch (error) {
              this.$message({
                message: 'dataid生成失败！',
                type: 'error',
                center: true,
                duration: 2000
              });
              this.dialogFormVisible = false
              this.$refs[formName].resetFields()
              return
            }

            let message1 = res.data.result[1]
            console.log('message2', message1)

            message1 = message1.slice(0, message1.length - 2)
            message1 = utils.sha256(message1)
            message1 = utils.sha256(message1)
            message1 = utils.hexstr2str(message1)
            try {
              let signData = await client.api.message.signMessage({ message: message1 });
              params1.sigTokenVo.pubKeys = signData.publicKey
              params1.sigTokenVo.sigData = signData.data
            } catch (error) {
              this.$message({
                message: 'dataid生成失败！',
                type: 'error',
                center: true,
                duration: 2000
              });
              this.dialogFormVisible = false
              this.$refs[formName].resetFields()
              return
            }

            console.log('params1', params1.dataId)
            console.log(JSON.stringify(params1))
            // retutn
            try {
              let res = await this.$store.dispatch('getTID', params1)
              console.log('getTID', res)
              if (res.data.msg == 'SUCCESS') {
                this.$message({
                  message: 'dataid生成成功！',
                  type: 'success',
                  center: true,
                  duration: 2000
                });
                this.dialogFormVisible = false
                this.$refs[formName].resetFields()
              } else {
                this.$message({
                  message: 'dataid生成失败！',
                  type: 'error',
                  center: true,
                  duration: 2000
                });
                this.dialogFormVisible = false
                this.$refs[formName].resetFields()
              }
            } catch (error) {
              console.log('error', error)
              this.$message({
                message: 'dataid生成失败！',
                type: 'error',
                center: true,
                duration: 2000
              });
              this.dialogFormVisible = false
              this.$refs[formName].resetFields()
              return
            }


          } else {
            this.$message({
              message: 'dataid生成失败！',
              type: 'error',
              center: true,
              duration: 2000
            });
            this.dialogFormVisible = false
            this.$refs[formName].resetFields()
          }
        } else {
          console.log('error submit!!');
          return false;
        }
      });
    },
    setUrl() {
      const net = localStorage.getItem('net');
      let url = ''
      if (net === 'TEST_NET') {
        url = TEST_NET + ':20334'
      } else {
        url = MAIN_NET + ':20334'
      }
      return url;
    },
    dialog(data) {
      console.log('data', data)
      if (data.isCertificated == 0) {
        this.$message({
          message: '请先认证，再生成dataID！',
          type: 'error',
          center: true,
          duration: 2000
        });
        return
      }
      if (!this.address) {
        this.$message({
          message: '请先获取钱包地址！',
          type: 'error',
          center: true,
          duration: 2000
        });
        return
      }
      this.cortData = data
      this.dialogFormVisible = true
    }
  },
  async mounted() {
    this.url = this.setUrl()
    this.ontid = await client.api.identity.getIdentity()
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



