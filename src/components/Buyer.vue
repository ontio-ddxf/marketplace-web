<template>
  <div>
    <el-table border :data="tableData" style="width: 100%">
      <el-table-column type="index" :index="indexMethod" align="center"></el-table-column>
      <el-table-column prop="providerOntid" label="卖家" style="width: 20%" align="center"></el-table-column>
      <el-table-column prop="orderId" label="订单号" width="260" align="center"></el-table-column>
      <el-table-column label="描述" prop="desc" align="center" width="180"></el-table-column>
      <el-table-column prop="boughtTime" label="购买日期" width="180" align="center"></el-table-column>
      <el-table-column label="操作" width="220" align="center">
        <template slot-scope="scope">
          <el-button size="mini" v-if="scope.row.state == 3" type="danger">订单结束</el-button>
          <el-button size="mini" v-else-if="scope.row.state == 4" type="danger">申诉中</el-button>
          <el-button size="mini" v-else-if="scope.row.state == 5" type="success">申诉结束</el-button>
          <el-button size="mini" v-else-if="scope.row.state == 1" type="danger" >已挂单</el-button>
          <el-button size="mini" v-else type="danger" @click="toAppeal(scope.row)">立即申诉</el-button>
          <el-tag type="info" v-show="scope.row.arbitrage == '0'">申诉失败</el-tag>
          <el-tag type="danger" v-show="scope.row.arbitrage == '1'">申诉成功</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="380" align="center">
        <template slot-scope="scope">
          <!-- <el-button size="mini" v-if="scope.row.state == 4" type="danger">申诉中</el-button>
          <el-button size="mini" v-else-if="scope.row.arbitrage == '0'" type="danger">申诉失败</el-button>
          <el-button size="mini" v-else-if="scope.row.arbitrage == '1'" type="success">申诉成功</el-button>
          <el-button size="mini" v-else-if="scope.row.state != 5" type="danger" @click="toAppeal(scope.row)">申诉</el-button>
          <el-button size="mini" v-else>订单完成</el-button> -->
          <el-button size="mini" @click="viewInfo(scope.row)">查看信息</el-button>
          <el-button size="mini" v-show="!scope.row.arbitrage && scope.row.state != '3'" type="success" @click="confirmReceipt(scope.row)">确认收货</el-button>
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
import { OntidContract, TransactionBuilder, TxSignature, Identity, Crypto, RestClient, utils } from 'ontology-ts-sdk';

export default {
  data() {
    return {
      tableData: [],
      accountid: '',
      orderCount: 0,
      pageSize: 10,
      pageNum: 0
    }
  },
  methods: {
    indexMethod(index) {
      return (this.pageNum) * this.pageSize + index + 1
    },
    async getBuyOrder() {
      try {
        let params = {
          ontid: this.accountid,
          pageNum: this.pageNum,
          pageSize: this.pageSize,
          type: 1
        }
        let res = await this.$store.dispatch('getBuyOrder', params)
        // console.log(res)
        if (res.status === 200 && res.data.msg === 'SUCCESS') {
          this.tableData = res.data.result.recordList
          this.orderCount = res.data.result.recordCount
          console.log('buyData', this.tableData)
        } else {
          this.tableData = []
        }
      } catch (error) {
        this.tableData = []
      }

    },
    async cancelOrder(data) {   // 取消订单
      // console.log(data)
      // 构造数据
      let operation = 'cancelExchange'

      // 构造args
      let exchange_id = data.orderId
      let args = [
        {
          type: 'ByteArray',
          value: exchange_id
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
          this.getBuyOrder()
          this.$message({
            message: '取消成功！',
            type: 'success',
            center: true,
            duration: 2000
          });
        } else {
          this.$message({
            message: '取消失败，请重试！',
            type: 'error',
            center: true,
            duration: 2000
          });
        }

      } catch (error) {
        this.$message({
          message: '取消失败，请重试！',
          type: 'error',
          center: true,
          duration: 2000
        });
      }

    },
    async confirmReceipt(data) {   //  确认收货
      let sureParams = {
        argsList: [
          { name: "orderId", value: "ByteArray:" + data.orderId }],
        contractHash: "3da0998e1e759aaed78b41ce1f92151d7b3f1083",
        method: "confirm"
      }
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
            message: '收货失败，请重试！',
            type: 'error',
            center: true,
            duration: 2000
          })
          return
        }
      } catch (error) {
        console.log(error)
        this.$message({
          message: '收货失败，请重试！',
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
          message: '收货失败，请重试！',
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
            message: '收货成功！',
            type: 'success',
            center: true,
            duration: 2000
          })
        } else {
          this.$message({
            message: '收货失败，请重试！',
            type: 'error',
            center: true,
            duration: 2000
          })
          return
        }
      } catch (error) {
        this.$message({
          message: '收货失败，请重试！',
          type: 'error',
          center: true,
          duration: 2000
        })
        return
      }

    },
    handleCurrentChange(val) {
      this.pageNum = val
      this.getBuyOrder()
    },
    async viewInfo(data) {
      let params = {
        id: data.id,
        ontid: this.accountid
      }
      try {
        let res = await this.$store.dispatch('checkData', params)
        console.log('viewInfo', res)
        if (res.status === 200 && res.data.msg === 'SUCCESS') {
          this.openMsgBox(res.data.result)
        } else {
          this.$message({
            message: '查看失败，请重试！',
            type: 'error',
            center: true,
            duration: 2000
          })
        }
      } catch (error) {
        this.$message({
          message: '查看失败，请重试！',
          type: 'error',
          center: true,
          duration: 2000
        })
      }

    },
    openMsgBox(msg) {
      this.$alert(msg, '商品信息', {
        confirmButtonText: '确定',
        callback: action => {
        }
      });
    },
    async  toAppeal(data) {

      let appealParams = {
        argsList: [
          { name: "orderId", value: "ByteArray:" + data.orderId },
          { name: "arbitrageFee", value: data.price * 0.05 }
        ],
        contractHash: "3da0998e1e759aaed78b41ce1f92151d7b3f1083",
        method: "applyArbitrage"

      }
      let paramsData = {
        txHex: '',
        pubKeys: '',
        sigData: ''
      }
      try {
        // console.log('appealParams', appealParams)
        let res = await this.$store.dispatch('makeTransaction', appealParams)
        console.log('makeTransaction', res)
        if (res.data.msg === 'SUCCESS') {
          paramsData.txHex = res.data.result
        } else {
          this.$message({
            message: '提交申诉失败，请重试！',
            type: 'error',
            center: true,
            duration: 2000
          })
          return
        }
      } catch (error) {
        this.$message({
          message: '提交申诉失败，请重试！',
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
          message: '提交申诉失败，请重试！',
          type: 'error',
          center: true,
          duration: 2000
        })
        return
      }

      // console.log('paramsData', paramsData)
      try {
        let res = await this.$store.dispatch('sendPass', paramsData)
        console.log('sendPass', res)
        if (res.data.msg === 'SUCCESS') {
          this.$message({
          message: '提交申诉成功！',
          type: 'success',
          center: true,
          duration: 2000
        })
        } else {
          this.$message({
          message: '提交申诉失败，请重试！',
          type: 'error',
          center: true,
          duration: 2000
        })
        }
      } catch (error) {
        this.$message({
          message: '提交申诉失败，请重试！',
          type: 'error',
          center: true,
          duration: 2000
        })
        return
      }
    }
  },
  async mounted() {
    // this.accountid = await client.api.asset.getAccount()
    this.accountid = await client.api.identity.getIdentity();
    console.log(this.accountid);
    if (!this.accountid) {
      return
    }
    this.getBuyOrder()
  },
}
</script>

<style lang='less' scoped>
.paginatio {
  margin: 20px auto;
}
</style>
