<template>
  <div>
    <el-table border :data="tableData" style="width: 100%">
      <el-table-column type="index" :index="indexMethod" align="center"></el-table-column>
      <el-table-column prop="data_demander" label="买家" style="width: 20%" align="center"></el-table-column>
      <el-table-column prop="order_id" label="订单号" width="260" align="center"></el-table-column>
      <el-table-column label="订单状态" align="center" width="180">
        <template slot-scope="scope">
          <el-tag size="medium" v-if="scope.row.state === 'boughtOnchain'">待发货</el-tag>
          <el-tag
            size="medium"
            type="success"
            v-else-if="scope.row.state === 'deliveredOnchain'"
          >已发货</el-tag>
          <el-tag
            size="medium"
            type="warning"
            v-else-if="scope.row.state === 'buyerRecvMsgOnchain'"
          >买家已收货</el-tag>
          <el-tag
            size="medium"
            type="danger"
            v-else-if="scope.row.state === 'sellerRecvTokenOnchain'"
          >已收钱</el-tag>
          <el-tag size="medium" type="info" v-else>订单已取消</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="buy_date" label="购买日期" width="180" align="center"></el-table-column>
      <el-table-column label="操作" width="180" align="center">
        <template slot-scope="scope">
          <el-button
            @click="toShip(scope.row)"
            type="primary"
            v-if="scope.row.state === 'boughtOnchain'"
          >立即发货</el-button>
          <el-button
            @click="collectMoney(scope.row)"
            type="primary"
            v-else-if="scope.row.state === 'deliveredOnchain'"
          >收钱</el-button>
          <el-tag
            size="medium"
            type="info"
            v-else-if="scope.row.state === 'sellerRecvTokenOnchain'"
          >订单已完成</el-tag>
          <el-tag size="medium" type="info" v-else>订单已取消</el-tag>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { client } from 'ontology-dapi'

export default {
  data() {
    return {
      tableData: [],
      accountid: ''
    }
  },
  methods: {
    async toShip(data) {
      console.log(data)
      // 构造数据
      let scriptHash = '472848200412d9a7abbb0ed0bfb568a47745e4ba'
      let operation = 'sendEncMessage'
      let gasPrice = 500
      let gasLimit = 30000
      let requireIdentity = true

      // 构造args
      let exchange_id = data.order_id     //   ByteArray
      console.log(exchange_id)
      //   exchange_id = client.api.utils.addressToHex(exchange_id)

      let str = 'lijie'
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


      const result = await client.api.smartContract.invoke({
        scriptHash,
        operation,
        args,
        gasPrice,
        gasLimit,
        requireIdentity
      });
      console.log(result)
    },
    indexMethod(index) {
      return index + 1
    },
    async getSellOrder() {
      try {
        let res = await this.$http.get(`http://192.168.50.96:10335/api/v1/data-dealer/tools/orders/1?ontid=did:ont:${this.accountid}`)
        console.log('sellerorder', res)
        if (res.status === 200 && res.data.desc === 'SUCCESS') {
          this.tableData = res.data.result
        }
      } catch (error) {
        this.tableData = []
        console.log(error)
      }
    },
    async collectMoney(data) {
      // 构造数据
      let scriptHash = '472848200412d9a7abbb0ed0bfb568a47745e4ba'
      let operation = 'receiveToken'
      let gasPrice = 500
      let gasLimit = 30000
      let requireIdentity = true

      // 构造args
      let exchange_id = data.order_id
      let args = [
        {
          type: 'ByteArray',
          value: exchange_id
        }
      ]

      const result = await client.api.smartContract.invoke({
        scriptHash,
        operation,
        args,
        gasPrice,
        gasLimit,
        requireIdentity
      });
      console.log(result)
    }
  },
  async  mounted() {
    this.accountid = await client.api.asset.getAccount()
    console.log(this.accountid);
    if (!this.accountid) {
      return
    }
    this.getSellOrder()
  },
}
</script>

<style>
</style>
