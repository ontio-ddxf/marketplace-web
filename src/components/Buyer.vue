<template>
  <div>
    <el-table border :data="tableData" style="width: 100%">
      <el-table-column type="index" :index="indexMethod" align="center"></el-table-column>
      <el-table-column prop="dataProvider" label="卖家" style="width: 20%" align="center"></el-table-column>
      <el-table-column prop="orderId" label="订单号" width="260" align="center"></el-table-column>
      <el-table-column label="订单状态" align="center" width="180">
        <template slot-scope="scope">
          <el-tag size="medium" v-if="scope.row.state === 'boughtOnchain'">已下单</el-tag>
          <el-tag
            size="medium"
            type="success"
            v-else-if="scope.row.state === 'deliveredOnchain'"
          >已发货</el-tag>
          <el-tag
            size="medium"
            type="warning"
            v-else-if="scope.row.state === 'buyerRecvMsgOnchain'"
          >已收货</el-tag>
          <el-tag
            size="medium"
            type="danger"
            v-else-if="scope.row.state === 'sellerRecvTokenOnchain'"
          >卖家已收钱</el-tag>
          <el-tag size="medium" type="info" v-else>订单已取消</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="buyDate" label="购买日期" width="180" align="center"></el-table-column>
      <el-table-column label="操作" width="180" align="center">
        <template slot-scope="scope">
          <el-button
            size="medium"
            type="success"
            v-if="scope.row.isRecvMsg === 0 && scope.row.state === 'deliveredOnchain'"
            @click="confirmReceipt(scope.row)"
          >确认收货</el-button>
          <el-button
            size="medium"
            type="success"
            v-else-if="scope.row.isRecvMsg === 0 && scope.row.state === 'sellerRecvTokenOnchain'"
            @click="confirmReceipt(scope.row)"
          >确认收货</el-button>
          <el-tag size="medium" type="info" v-else-if="scope.row.isRecvMsg === 1">订单已完成</el-tag>
          <el-tag
            size="medium"
            type="danger"
            v-else-if="scope.row.state === 'buyerCancelOnchain'"
          >订单已取消</el-tag>
          <el-button @click="cancelOrder(scope.row)" type="danger" v-else>取消订单</el-button>
          <el-button
            style="margin-top: 6px;"
            @click="viewInfo(scope.row)"
            type="success"
            size="mini"
            v-show="scope.row.isRecvMsg === 1"
          >查看信息</el-button>
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

export default {
  data() {
    return {
      tableData: [],
      accountid: '',
      orderCount: 0,
      pageSize: 10,
      pageNum: 1
    }
  },
  methods: {
    indexMethod(index) {
      return (this.pageNum - 1) * this.pageSize + index + 1
    },
    async getBuyOrder() {
      try {
        let res = await this.$http.get(`${process.env.VUE_APP_ORFDER}/api/v1/data-dealer/tools/orders/0?ontid=did:ont:${this.accountid}&pageNum=${this.pageNum}&pageSize=${this.pageSize}`)
        console.log(res)
        if (res.status === 200 && res.data.msg === 'SUCCESS') {
          this.tableData = res.data.result.list
          this.orderCount = res.data.result.total
        }
      } catch (error) {
        this.tableData = []
      }

    },
    async cancelOrder(data) {   // 取消订单
      console.log(data)
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
      console.log(data)
      // 构造数据
      let operation = 'receiveEncMessage'
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
            message: '收货成功！',
            type: 'success',
            center: true,
            duration: 2000
          });
        } else {
          this.$message({
            message: '收货失败，请重试！',
            type: 'error',
            center: true,
            duration: 2000
          });
        }
      } catch (error) {
        this.$message({
          message: '收货失败，请重试！',
          type: 'error',
          center: true,
          duration: 2000
        });
      }

    },
    handleCurrentChange(val) {
      this.pageNum = val
      this.getBuyOrder()
    },
    async viewInfo(data) {
      try {
        let res = await this.$http.get(`${process.env.VUE_APP_ORFDER}/api/v1/data-dealer/tools/data?orderId=${data.orderId}&ontid=did:ont:${this.accountid}`)
        console.log('viewInfo', res)
        if (res.status === 200 && res.data.msg === 'SUCCESS') {
          this.openMsgBox(res.data.result[0])
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
    }
  },
  async mounted() {
    this.accountid = await client.api.asset.getAccount()
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
