<template>
  <div>
    <div class="list_box">
      <el-table :data="tableData" border style="width: 100%">
        <el-table-column type="index" align="center" width="50" :index="indexMethod"></el-table-column>
        <el-table-column prop="name" align="center" label="商品名" width="180"></el-table-column>
        <el-table-column align="center" label="标签">
          <template slot-scope="scope">
            <el-tag
              style="margin-right: 10px;"
              v-for="(item, idx) in scope.row.keywords"
              :key="idx"
            >{{item}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="币种" width="80">ONG</el-table-column>
        <el-table-column prop="price" align="center" label="价格" width="80"></el-table-column>
        <el-table-column prop="boughtTime" align="center" label="日期" width="200"></el-table-column>
        <el-table-column label="操作" align="center" width="200">
          <template slot-scope="scope">
            <el-button @click="handleClick(scope.row, true)" type="text" size="small">成功</el-button>
            <el-button @click="handleClick(scope.row, false)" type="text" size="small">失败</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import { client } from 'ontology-dapi'
import { OntidContract, TransactionBuilder, TxSignature, Identity, Crypto, RestClient, utils } from 'ontology-ts-sdk';

export default {
  data() {
    return {
      tableData: [],
      ontid: ''
    }
  },
  methods: {
    async handleClick(data, isWin) {
      let ojparams = {
        "argsList": [
          { "name": "orderId", "value": "ByteArray:" + data.orderId },
          { "name": "isWin", "value": isWin }
        ],
        "contractHash": "3da0998e1e759aaed78b41ce1f92151d7b3f1083",
        "method": "arbitrage"
      }
      console.log('isWin', isWin)
      let paramsData = {
        txHex: '',
        pubKeys: '',
        sigData: ''
      }
      try {
        // console.log('appealParams', appealParams)
        let res = await this.$store.dispatch('makeTransaction', ojparams)
        console.log('makeTransaction', res)
        if (res.data.msg === 'SUCCESS') {
          paramsData.txHex = res.data.result
        } else {
          this.$message({
            message: '仲裁失败！',
            type: 'error',
            center: true,
            duration: 2000
          })
          return
        }
      } catch (error) {
        this.$message({
          message: '仲裁失败！',
          type: 'error',
          center: true,
          duration: 2000
        })
        return
      }
      // return

      try {
        let message = paramsData.txHex
        message = message.slice(0, message.length - 2)
        message = utils.sha256(message)
        message = utils.sha256(message)
        message = utils.hexstr2str(message)
        let signData = await client.api.message.signMessage({ message });
        paramsData.pubKeys = signData.publicKey
        paramsData.sigData = signData.data
      } catch (error) {
        this.$message({
          message: '仲裁失败！',
          type: 'error',
          center: true,
          duration: 2000
        })
        return
      }


      try {
        let params = {
          id: data.id,
          winOrLose: isWin,
          sigVo: paramsData
        }
        let res = await this.$store.dispatch('sendOJData', params)
        console.log('sendOJData', res)
        if (res.data.msg === 'SUCCESS') {
          this.$message({
            message: '仲裁成功！',
            type: 'success',
            center: true,
            duration: 2000
          })
        } else {
          this.$message({
            message: '仲裁失败，请重试！',
            type: 'error',
            center: true,
            duration: 2000
          })
        }
      } catch (error) {
        this.$message({
          message: '仲裁失败，请重试！',
          type: 'error',
          center: true,
          duration: 2000
        })
        return
      }

    },
    indexMethod(idx) {
      return idx + 1
    }
  },
  async mounted() {
    // this.ontid = await client.api.identity.getIdentity()
    this.ontid = await client.api.asset.getAccount()
    let params = {
      ontid: 'did:ont:'+this.ontid,
      pageSize: 10,
      pageNum: 0
    }
    try {
      let res = await this.$store.dispatch('queryjuderData', params)
      if (res.data.msg === 'SUCCESS') {
        this.tableData = res.data.result.recordList
        this.tableData.map((item, idx) => {
          item.price = item.price * Math.pow(10, -9)
        })
      }
    } catch (error) {
      this.tableData = []
      return error
    }
  },
}
</script>

<style>
</style>
