<template>
  <div class="commoditymanage_box">
    <div class="msg">
      <div style="overflow: hidden;">
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

      <div class="msg_item">
        <p>{{$t('common.kyc')}}</p>
        <p>KYC: www.baidu.com</p>
        <p>
          {{$t('common.not_certified')}}
          <el-link type="danger" @click="certificatKYC()">{{$t('common.to_cer')}}</el-link>
        </p>
      </div>
      <div class="msg_item">
        <p>Wallet Address</p>
        <p v-if="address">{{address}}</p>
        <p v-else>
          <el-link type="danger" @click="walletAddress()">{{$t('common.get_add')}}</el-link>
        </p>
      </div>
      <el-button
        style="margin-bottom: 20px;"
        @click="toAddData()"
        type="primary"
      >{{$t('common.add_data')}}</el-button>
    </div>
    <div class="table_box">
      <el-table :data="tableData" border style="width: 100%" :empty-text="$t('common.no_data')">
        <el-table-column type="index" align="center" width="50" :index="indexMethod"></el-table-column>
        <el-table-column prop="data.name" align="center" :label="tableLang.name" width="180"></el-table-column>
        <el-table-column align="center" :label="tableLang.tags">
          <template slot-scope="scope">
            <el-tag
              style="margin-right: 10px;"
              v-for="(item, idx) in scope.row.data.keywords"
              :key="idx"
            >{{item}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" :label="tableLang.state" width="150">
          <template slot-scope="scope">
            <el-tag
              style="margin-right: 10px;"
              type="info"
              v-if="scope.row.isCertificated === 0"
            >{{$t('common.no_cert')}}</el-tag>
            <el-tag style="margin-right: 10px;" v-else type="success">{{$t('common.verified')}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" align="center" :label="tableLang.date" width="200"></el-table-column>
        <el-table-column :label="tableLang.operating" align="center" width="400">
          <template slot-scope="scope">
            <el-button @click="proDataId(scope.row)" type="primary" round size="small">DataId</el-button>
            <el-button
              @click="handleClick(scope.row)"
              type="primary"
              round
              size="small"
            >{{$t('common.detail')}}</el-button>
            <el-button
              @click="prodOperat(scope.row)"
              v-if="scope.row.state === 1"
              type="warning"
              round
              size="small"
            >{{$t('common.pending_order')}}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!--  -->
    <el-dialog
      :title="$t('common.shipping_address')"
      :visible.sync="dialogFormVisible"
      center
      width="30%"
    >
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
        <el-form-item label="transferCount" prop="transferCount">
          <el-input type="age" v-model.number="form.transferCount" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="accessCount" prop="accessCount">
          <el-input type="age" v-model.number="form.accessCount" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="expireTime" prop="expireTime">
          <!-- <el-input type="age" v-model.number="form.expireTime" autocomplete="off"></el-input> -->
          <el-date-picker v-model="form.expireTime" type="datetime" placeholder="选择日期时间"></el-date-picker>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{$t('common.cancel')}}</el-button>
        <el-button type="primary" @click="proDataId('ruleForm')">{{$t('common.sure')}}</el-button>
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
import moment from 'moment'
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
        totalAmount: null,
        transferCount: null,
        accessCount: null,
        expireTime: null
      },
      rules: {
        name: [
          { required: true, message: this.$t('common.please_enter') + 'name', trigger: 'blur' },
          { min: 3, message: this.$t('common.character3'), trigger: 'blur' }
        ],
        symbol: [
          { required: true, message: this.$t('common.please_enter') + 'symbol', trigger: 'blur' },
          { min: 3, message: this.$t('common.character3'), trigger: 'blur' }
        ],
        totalAmount: [
          { required: true, message: this.$t('common.please_enter') + 'totalAmount' },
          { type: 'number', message: 'totalAmount' + this.$t('common.mbnum') },
        ],
        transferCount: [
          { required: true, message: this.$t('common.please_enter') + 'transferCount' },
          { type: 'number', message: 'transferCount' + this.$t('common.mbnum') },
        ],
        accessCount: [
          { required: true, message: this.$t('common.please_enter') + 'accessCount' },
          { type: 'number', message: 'accessCount' + this.$t('common.mbnum') },
        ],
        expireTime: [
          { required: true, message: this.$t('common.please_enter') + 'expireTime' }
          // { type: 'number', message: 'expireTime' + this.$t('common.mbnum') },
        ]
      },
      cortData: null,
      tableLang: {
        name: this.$t('common.commodity_name'),
        tags: this.$t('common.tags'),
        date: this.$t('common.date'),
        operating: this.$t('common.operating'),
        state: this.$t('common.certification_status')
      }
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
          message: this.$t('common.remove'),
          type: 'success',
          center: true,
          duration: 2000
        });
        return;
      }
    },
    async prodOperat(row) {
      if (!row.tokenRange) {
        this.$message({
          message: this.$t('common.tokenid_loading'),
          type: 'error',
          center: true,
          duration: 2000
        });
      } else {
        this.$router.push({ path: 'editdata', query: { commodityId: row.id } });
      }
      console.log(row)
    },
    async proDataId(formName) {
      // this.$refs[formName].validate(async (valid) => {
      // if (valid) {
      // if (+this.form.totalAmount > 10) {
      //   this.$message({
      //     message: 'TotalAmount Must Less than 10',
      //     type: 'error',
      //     center: true,
      //     duration: 2000
      //   });
      //   return
      // }
      const privateKey = Crypto.PrivateKey.random();
      var identity = Identity.create(privateKey, '', '')
      let params0 = {
        dataId: identity.ontid,
        ontid: this.ontid,
        pubKey: 1,
        // contractVo: {
        //   argsList: [{
        //     name: "account",
        //     value: "Address:" + this.ontid.substring(8)
        //   }, {
        //     name: "dataId",
        //     value: "String:" + identity.ontid
        //   }, {
        //     name: "ontid",
        //     value: "String:" + this.ontid
        //   }, {
        //     name: "index",
        //     value: 1
        //   }, {
        //     name: "symbol",
        //     value: "String:" + this.form.symbol
        //   }, {
        //     name: "name",
        //     value: "String:" + this.form.name
        //   }, {
        //     name: "amount",
        //     value: this.form.totalAmount
        //   }, {
        //     name: 'transferCount',
        //     value: this.form.transferCount
        //   }, {
        //     name: 'accessCount',
        //     value: this.form.accessCount
        //   },
        //   {
        //     name: 'expireTime',
        //     value: moment(this.form.expireTime).unix()
        //   }],
        //   contractHash: "06633f64506fbf7fd4b65b422224905d362d1f55",
        //   method: "createTokenWithController",
        // }
      }
      console.log('params0', params0)
      // return
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
            message: this.$t('common.data_id_fail'),
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
            message: this.$t('common.data_id_fail'),
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
              message: this.$t('common.data_id_suc'),
              type: 'success',
              center: true,
              duration: 2000
            });
            this.dialogFormVisible = false
            this.$refs[formName].resetFields()
          } else {
            this.$message({
              message: this.$t('common.data_id_fail'),
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
            message: this.$t('common.data_id_fail'),
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
          message: this.$t('common.data_id_fail'),
          type: 'error',
          center: true,
          duration: 2000
        });
        this.dialogFormVisible = false
        this.$refs[formName].resetFields()
      }
      // } else {
      // console.log('error submit!!');
      // return false;
      // }
      // });
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
          message: this.$t('common.b_dataid'),
          type: 'error',
          center: true,
          duration: 2000
        });
        return
      }
      if (!this.address) {
        this.$message({
          message: this.$t('common.wallet_acc'),
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



