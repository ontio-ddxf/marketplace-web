<template>
  <div>
    <el-table border :data="tableData" style="width: 100%" :empty-text="$t('common.no_data')">
      <el-table-column type="index" :index="indexMethod" align="center"></el-table-column>
      <el-table-column prop="demander" :label="tableLang.buyer" width="260" align="center"></el-table-column>
      <el-table-column prop="orderId" :label="tableLang.order_num" width="260" align="center"></el-table-column>
      <el-table-column label="dataId" width="360" align="center">
        <template slot-scope="scope">
          <el-button
            @click="toDataIDList(scope.row.dataId)"
            size="mini"
            type="primary"
          >{{scope.row.dataId}}</el-button>
        </template>
      </el-table-column>
      <el-table-column label="tokenId" width="100" align="center">
        <template slot-scope="scope">
          <el-button
            @click="toTokenId(scope.row.tokenId)"
            size="mini"
            type="primary"
          >{{scope.row.tokenId}}</el-button>
        </template>
      </el-table-column>
      <el-table-column prop="boughtTime" :label="tableLang.buy_date" width="180" align="center"></el-table-column>
      <el-table-column :label="tableLang.state" width="180" align="center">
        <template slot-scope="scope">
          <el-tag size="medium" type="info" v-if="scope.row.state == 1">{{$t('common.sold')}}</el-tag>
          <el-tag
            size="medium"
            type="info"
            v-else-if="scope.row.state == 2"
          >{{$t('common.sold_out')}}</el-tag>
          <el-tag
            size="medium"
            type="info"
            v-else-if="scope.row.state == 3"
          >{{$t('common.order_over')}}</el-tag>
          <el-tag size="medium" type="info" v-else-if="scope.row.state == 4">{{$t('common.appeal')}}</el-tag>
          <el-tag size="medium" type="info" v-else>{{$t('common.apple_end')}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="tableLang.operating" width="180" align="center">
        <template slot-scope="scope">
          <el-button
            v-show="scope.row.state == 2 && scope.row.isExpired == 1"
            @click="collectMoney(scope.row)"
            type="primary"
          >{{$t('common.receipt')}}</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="paginatio">
      <el-pagination
        @current-change="handleCurrentChange"
        background
        layout="prev, pager, next"
        :total="orderCount"
        :page-size="pageSize"
      ></el-pagination>
    </div>
  </div>
</template>

<script>
import { client } from 'ontology-dapi'
import { Base64 } from 'js-base64'
import { OntidContract, TransactionBuilder, TxSignature, Identity, Crypto, RestClient, utils } from 'ontology-ts-sdk';

export default {
  data() {
    return {
      tableLang: {
        buyer: this.$t('center.buy'),
        order_num: this.$t('common.order_num'),
        desc: this.$t('common.description'),
        buy_date: this.$t('common.buy_date'),
        operating: this.$t('common.operating'),
        state: this.$t('common.state'),
      },
      tableData: [],
      accountid: '',
      orderCount: 0,
      pageSize: 10,
      pageNum: 0
    }
  },
  methods: {
    async toShip(data, value) {
      console.log(data)
      // 构造数据
      let operation = 'sendEncMessage'
      // 构造args
      let exchange_id = data.orderId     //   ByteArray
      console.log(exchange_id)

      let str = value   // 发货的数据
      str = client.api.utils.strToHex(str)
      let message_list = [
        {
          type: 'ByteArray',
          value: str
        }
      ]

      let args = [
        {
          type: 'ByteArray',
          value: exchange_id
        },
        {
          type: 'Array',
          value: message_list
        }
      ]
      let params = {
        operation,
        args
      }
      try {
        const result = await this.$store.dispatch('dapiInvoke', params)
        console.log(result)
        if (result && result.transaction) {
          this.getSellOrder()
          this.$message({
            message: '发货成功！',
            type: 'success',
            center: true,
            duration: 2000
          });
        } else {
          this.$message({
            message: '发货失败，请重试！',
            type: 'error',
            center: true,
            duration: 2000
          })
        }
      } catch (error) {
        this.$message({
          message: '发货失败，请重试！',
          type: 'error',
          center: true,
          duration: 2000
        })
      }
    },
    indexMethod(index) {
      return (this.pageNum) * this.pageSize + index + 1
    },
    async getSellOrder() {
      let params = {
        ontid: this.accountid,
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        type: 2
      }
      try {
        // this.$store.dispatch('getSellOrderData', params)
        let res = await this.$store.dispatch('getBuyOrder', params)
        console.log('sellerorder', res)
        if (res.status === 200 && res.data.msg === 'SUCCESS') {
          this.tableData = res.data.result.recordList
          this.orderCount = res.data.result.recordCount
        } else {
          this.tableData = []
        }
      } catch (error) {
        this.tableData = []
        console.log(error)
      }
    },
    async collectMoney(data) {
      let sureParams = {}
      if (data.authId) {
        sureParams = {
          argsList: [
            { name: "orderId", value: "ByteArray:" + data.orderId }],
          contractHash: "f261464e2cd21c2ab9c06fa3e627ce03c7715ec9",
          method: "confirm"
        }
      } else {
        sureParams = {
          argsList: [
            { name: "orderId", value: "ByteArray:" + data.orderId }],
          contractHash: "7c2b06ae3e70a470d01ac5ce63017d18b88e08b7",
          method: "confirm"
        }
      }
      console.log('sureParams', sureParams)
      let paramsData = {
        txHex: '',
        pubKeys: '',
        sigData: ''
      }
      try {
        let res = await this.$store.dispatch('makeTransaction', sureParams)
        console.log('makeTransaction', res)
        // return
        if (res.data.msg === 'SUCCESS') {
          paramsData.txHex = res.data.result
          console.log('paramsData', paramsData)
        } else {
          this.$message({
            message: this.$t('common.receipt_fail'),
            type: 'error',
            center: true,
            duration: 2000
          })
          return
        }
      } catch (error) {
        console.log(error)
        this.$message({
          message: this.$t('common.receipt_fail'),
          type: 'error',
          center: true,
          duration: 2000
        })
        return
      }

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
          message: this.$t('common.receipt_fail'),
          type: 'error',
          center: true,
          duration: 2000
        })
        return
      }

      console.log('paramsData', paramsData)

      try {
        let res = await this.$store.dispatch('sendPass', paramsData)
        console.log('sendPass', res)
        if (res.data.msg === 'SUCCESS') {
          this.$message({
            message: this.$t('common.receipt_suc'),
            type: 'success',
            center: true,
            duration: 2000
          })
        } else {
          this.$message({
            message: this.$t('common.receipt_fail'),
            type: 'error',
            center: true,
            duration: 2000
          })
          return
        }
      } catch (error) {
        this.$message({
          message: this.$t('common.receipt_fail'),
          type: 'error',
          center: true,
          duration: 2000
        })
        return
      }
    },
    handleCurrentChange(val) {
      this.pageNum = val - 1
      this.getSellOrder()
    },
    openMsgBox(data) {
      this.$prompt('请输入内容', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /\S/,
        inputErrorMessage: '内容不能为空'
      }).then(({ value }) => {
        value = Base64.encode(value)
        console.log('Base64.encode(value)', value)
        this.toShip(data, value)
      }).catch(() => {
      });
    },
    toDataIDList(dataId) {
      this.$router.push({ name: 'DataIDList', query: { dataId: dataId } })
    },
    toTokenId(tokenId) {
      this.$router.push({ name: 'TokenDetail', query: { tokenId: tokenId } })
    }
  },
  async  mounted() {
    this.accountid = sessionStorage.getItem("user_ontid")
    // this.accountid = await client.api.asset.getAccount()
    console.log(this.accountid);
    if (!this.accountid) {
      return
    }
    this.getSellOrder()
  }
}
</script>

<style lang='less' scoped>
.paginatio {
  margin: 20px auto;
}
</style>
