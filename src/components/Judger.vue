<template>
  <div>
    <div class="list_box">
      <el-table :data="tableData" border style="width: 100%" :empty-text="$t('common.no_data')">
        <el-table-column type="index" align="center" width="50" :index="indexMethod"></el-table-column>
        <el-table-column prop="name" align="center" :label="tableLang.name" width="180"></el-table-column>
        <el-table-column align="center" :label="tableLang.tags">
          <template slot-scope="scope">
            <el-tag
              style="margin-right: 10px;"
              v-for="(item, idx) in scope.row.keywords"
              :key="idx"
            >{{item}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" :label="tableLang.coin" width="80">ONG</el-table-column>
        <el-table-column prop="price" align="center" :label="tableLang.price" width="80"></el-table-column>
        <el-table-column prop="boughtTime" align="center" :label="tableLang.date" width="200"></el-table-column>
        <el-table-column :label="tableLang.operating" align="center" width="200">
          <template slot-scope="scope">
            <el-button @click="handleClick(scope.row, true)" type="text" size="small">{{$t('common.win')}}</el-button>
            <el-button @click="handleClick(scope.row, false)" type="text" size="small">{{$t('common.lose')}}</el-button>
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
      ontid: '',
      tableLang: {
        name: this.$t('common.commodity_name'),
        tags: this.$t('common.tags'),
        coin: this.$t('common.coin'),
        price: this.$t('common.price'),
        date: this.$t('common.date'),
        operating: this.$t('common.operating'),
      }
    }
  },
  methods: {
    async handleClick(data, isWin) {
      let ojparams = {
        "argsList": [
          { "name": "orderId", "value": "ByteArray:" + data.orderId },
          { "name": "isWin", "value": isWin }
        ],
        "contractHash": "a50ec2d48048857646d2bbe4b283b5dcc18968e0",
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
            message: this.$t('common.oj_fail'),
            type: 'error',
            center: true,
            duration: 2000
          })
          return
        }
      } catch (error) {
        this.$message({
          message: this.$t('common.oj_fail'),
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
          message: this.$t('common.oj_fail'),
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
            message: this.$t('common.oj_suc'),
            type: 'success',
            center: true,
            duration: 2000
          })
        } else {
          this.$message({
            message: this.$t('common.oj_fail'),
            type: 'error',
            center: true,
            duration: 2000
          })
        }
      } catch (error) {
        this.$message({
          message: this.$t('common.oj_fail'),
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
