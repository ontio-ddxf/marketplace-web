<template>
  <div>
    <el-table border :data="tableData" style="width: 100%" :empty-text="$t('common.no_data')">
      <el-table-column type="index" :index="indexMethod" align="center"></el-table-column>
      <el-table-column
        prop="providerOntid"
        :label="tableLang.seller"
        style="width: 20%"
        align="center"
      ></el-table-column>
      <el-table-column prop="orderId" :label="tableLang.order_num" width="260" align="center"></el-table-column>
      <el-table-column :label="tableLang.desc" prop="desc" align="center" width="180"></el-table-column>
      <el-table-column prop="boughtTime" :label="tableLang.buy_date" width="180" align="center"></el-table-column>
      <el-table-column :label="tableLang.state" width="220" align="center">
        <template slot-scope="scope">
          <el-button
            size="mini"
            v-if="scope.row.state == 3"
            type="danger"
          >{{$t('common.order_over')}}</el-button>
          <el-button
            size="mini"
            v-else-if="scope.row.state == 4"
            type="danger"
          >{{$t('common.appeal')}}</el-button>
          <el-button
            size="mini"
            v-else-if="scope.row.state == 5"
            type="success"
          >{{$t('common.apple_end')}}</el-button>
          <el-button
            size="mini"
            v-else-if="scope.row.state == 1"
            type="danger"
          >{{$t('common.pending_order')}}</el-button>
          <el-button
            size="mini"
            v-else
            type="danger"
            @click="toAppeal(scope.row)"
          >{{$t('common.to_appeal')}}</el-button>
          <el-tag type="info" v-show="scope.row.arbitrage == '1'">{{$t('common.appeal_suc')}}</el-tag>
          <el-tag type="danger" v-show="scope.row.arbitrage == '0'">{{$t('common.appeal_fail')}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="tableLang.operating" width="380" align="center">
        <template slot-scope="scope">
          <el-button size="mini" @click="viewInfo(scope.row)">{{$t('common.view_info')}}</el-button>
          <el-button size="mini" @click="viewOther(scope.row)">{{$t('common.view_other')}}</el-button>
          <el-button
            size="mini"
            v-show="!scope.row.arbitrage && scope.row.state != '3'"
            type="success"
            @click="confirmReceipt(scope.row)"
          >{{$t('common.sure_order')}}</el-button>
          <el-button
            size="mini"
            v-show="scope.row.state == 3 || scope.row.arbitrage == '0'"
            @click="Resale(scope.row)"
          >{{$t('common.resale')}}</el-button>
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
import moment from 'moment'

export default {
  data() {
    return {
      tableLang: {
        seller: this.$t('center.sell'),
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
            message: this.$t('common.cancel_suc'),
            type: 'success',
            center: true,
            duration: 2000
          });
        } else {
          this.$message({
            message: this.$t('common.cancel_fail'),
            type: 'error',
            center: true,
            duration: 2000
          });
        }

      } catch (error) {
        this.$message({
          message: this.$t('common.cancel_fail'),
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
        contractHash: "88da35324f1133aca1f3b728b27fa1f017e6fb8c",
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
            message: this.$t('common.delivery_fail'),
            type: 'error',
            center: true,
            duration: 2000
          })
          return
        }
      } catch (error) {
        console.log(error)
        this.$message({
          message: this.$t('common.delivery_fail'),
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
          message: this.$t('common.delivery_fail'),
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
            message: this.$t('common.delivery_suc'),
            type: 'success',
            center: true,
            duration: 2000
          })
        } else {
          this.$message({
            message: this.$t('common.delivery_fail'),
            type: 'error',
            center: true,
            duration: 2000
          })
          return
        }
      } catch (error) {
        this.$message({
          message: this.$t('common.delivery_fail'),
          type: 'error',
          center: true,
          duration: 2000
        })
        return
      }

    },
    handleCurrentChange(val) {
      this.pageNum = val - 1
      this.getBuyOrder()
    },
    async viewInfo(data) {

      console.log('data', data)
      let transactionParams = {
        argsList: [
          { name: 'tokenId', value: data.tokenId }
        ],
        contractHash: "06633f64506fbf7fd4b65b422224905d362d1f55",
        method: "consumeToken"
      }
      let paramsData = {
        txHex: '',
        pubKeys: '',
        sigData: ''
      }
      try {
        let res = await this.$store.dispatch('makeTransaction', transactionParams)
        console.log('makeTransaction', res)
        // return
        if (res.data.msg === 'SUCCESS') {
          paramsData.txHex = res.data.result
          console.log('paramsData', paramsData)
        } else {
          this.$message({
            message: this.$t('common.view_fail'),
            type: 'error',
            center: true,
            duration: 2000
          })
          return
        }
      } catch (error) {
        console.log(error)
        this.$message({
          message: this.$t('common.view_fail'),
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
          message: this.$t('common.view_fail'),
          type: 'error',
          center: true,
          duration: 2000
        })
        return
      }
      let params = {
        id: data.id,
        ontid: this.accountid,
        sigVo: paramsData
      }
      try {
        let res = await this.$store.dispatch('checkData', params)
        console.log('viewInfo', res)
        if (res.status === 200 && res.data.msg === 'SUCCESS') {
          this.openMsgBox(res.data.result)
        } else {
          this.$message({
            message: this.$t('common.view_fail'),
            type: 'error',
            center: true,
            duration: 2000
          })
        }
      } catch (error) {
        this.$message({
          message: this.$t('common.view_fail'),
          type: 'error',
          center: true,
          duration: 2000
        })
      }

    },
    openMsgBox(msg) {
      this.$alert(msg, 'Message', {
        confirmButtonText: this.$t('common.sure'),
        callback: action => {
        }
      });
    },
    async toAppeal(data) {

      let appealParams = {
        argsList: [
          { name: "orderId", value: "ByteArray:" + data.orderId },
          { name: "arbitrageFee", value: data.price * 0.05 }
        ],
        contractHash: "88da35324f1133aca1f3b728b27fa1f017e6fb8c",
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
            message: this.$t('common.to_appeal_fail'),
            type: 'error',
            center: true,
            duration: 2000
          })
          return
        }
      } catch (error) {
        this.$message({
          message: this.$t('common.to_appeal_fail'),
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
          message: this.$t('common.to_appeal_fail'),
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
            message: this.$t('common.to_appeal_suc'),
            type: 'success',
            center: true,
            duration: 2000
          })
        } else {
          this.$message({
            message: this.$t('common.to_appeal_fail'),
            type: 'error',
            center: true,
            duration: 2000
          })
        }
      } catch (error) {
        this.$message({
          message: this.$t('common.to_appeal_fail'),
          type: 'error',
          center: true,
          duration: 2000
        })
        return
      }
    },
    async viewOther(data) {
      // moment(infoCode.expireTimeCount).format('YYYY-MM-DD HH:mm:ss')
      try {
        let res = await this.$store.dispatch('viewOtherInfo', data.tokenId)
        console.log('viewInfo', res.data.result)
        if (res.status === 200 && res.data.msg === 'SUCCESS') {

          let infoCode = res.data.result
          let timer = ''
          if (+infoCode.expireTimeCount == 1) {
            timer = 'everlasting'
          } else {
            timer = moment(infoCode.expireTimeCount * 1000).format('YYYY-MM-DD HH:mm:ss')
          }
          let message = `
            accessCount: ${infoCode.accessCount}
            transferCount: ${infoCode.transferCount},
            expireTimeCount: ${timer}
          `
          console.log('message', message)
          this.openMsgBox(message)
        } else {
          console.log('1231')
          this.$message({
            message: this.$t('common.view_fail'),
            type: 'error',
            center: true,
            duration: 2000
          })
        }
      } catch (error) {
        console.log('error', error)
        this.$message({
          message: this.$t('common.view_fail'),
          type: 'error',
          center: true,
          duration: 2000
        })
      }
    },
    async Resale(data) {
      try {
        let res = await this.$store.dispatch('viewOtherInfo', data.tokenId)
        console.log('viewInfo', res.data.result)
        if (res.status === 200 && res.data.msg === 'SUCCESS') {
          let infoCode = res.data.result
          if (+infoCode.accessCount <= 0 || +infoCode.transferCount <= 0) {
            this.$message({
              message: this.$t('common.resale_noenough'),
              type: 'error',
              center: true,
              duration: 2000
            })
            return
          }
        } else {
          this.$message({
            message: this.$t('common.resale_fail'),
            type: 'error',
            center: true,
            duration: 2000
          })
        }
      } catch (error) {
        console.log('error', error)
        this.$message({
          message: this.$t('common.resale_fail'),
          type: 'error',
          center: true,
          duration: 2000
        })
      }
      sessionStorage.setItem('resale_tokenId', data.tokenId)
      sessionStorage.setItem('resale_id', data.id)
      this.$router.push({ path: 'resaleDetail', query: { commodityId: data.dataId } })
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
