<template>
  <div>
    <el-button style="margin-bottom: 20px; float: right;" @click="toAddData()" type="primary">新增商品</el-button>
    <el-table border :data="tableData" style="width: 100%">
      <el-table-column type="index" :index="indexMethod" align="center"></el-table-column>
      <el-table-column prop="dataDemander" label="买家" style="width: 20%" align="center"></el-table-column>
      <el-table-column prop="orderId" label="订单号" width="260" align="center"></el-table-column>
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
      <el-table-column prop="buyDate" label="购买日期" width="180" align="center"></el-table-column>
      <el-table-column label="操作" width="180" align="center">
        <template slot-scope="scope">
          <el-button
            @click="collectMoney(scope.row)"
            type="primary"
            v-if="scope.row.state === 'deliveredOnchain' && scope.row.isRecvToken === 0"
          >收款</el-button>
          <el-button
            @click="collectMoney(scope.row)"
            type="primary"
            v-else-if="scope.row.state === 'buyerRecvMsgOnchain' && scope.row.isRecvToken === 0"
          >收款</el-button>
          <el-tag size="medium" type="info" v-else-if="scope.row.isRecvToken === 1">订单已完成</el-tag>
          <el-tag
            size="medium"
            type="danger"
            v-else-if="scope.row.state === 'buyerCancelOnchain'"
          >订单已取消</el-tag>
          <!-- <el-button @click="toShip(scope.row)" type="primary" v-else>立即发货</el-button> -->
          <el-button @click="openMsgBox(scope.row)" type="primary" v-else>立即发货</el-button>
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

export default {
  data() {
    return {
      tableData: [],
      accountid: '',
      orderCount: 0,
      pageSize: 2,
      pageNum: 1
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
      return (this.pageNum - 1) * this.pageSize + index + 1
    },
    async getSellOrder() {
      try {
        let res = await this.$http.get(`${process.env.VUE_APP_ORFDER}/api/v1/data-dealer/tools/orders/1?ontid=did:ont:${this.accountid}&pageNum=${this.pageNum}&pageSize=${this.pageSize}`)
        console.log('sellerorder', res)
        if (res.status === 200 && res.data.msg === 'SUCCESS') {
          this.tableData = res.data.result.list
          this.orderCount = res.data.result.total
        }
      } catch (error) {
        this.tableData = []
        console.log(error)
      }
    },
    async collectMoney(data) {
      // 构造数据
      let operation = 'receiveToken'
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
      console.log(params)
      try {
        const result = await this.$store.dispatch('dapiInvoke', params)
        console.log('result', result)

        if (result && result.transaction) {
          this.getSellOrder()
          this.$message({
            message: '收钱成功！',
            type: 'success',
            center: true,
            duration: 2000
          });
        } else {
          this.$message({
            message: '收钱失败，请重试！',
            type: 'error',
            center: true,
            duration: 2000
          })
        }
      } catch (error) {
        this.$message({
          message: '收钱失败，请重试！',
          type: 'error',
          center: true,
          duration: 2000
        })
      }

    },
    handleCurrentChange(val) {
      this.pageNum = val
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
    toAddData() {
      this.$router.push({ path: 'addnewdata' })
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

<style lang='less' scoped>
.paginatio {
  margin: 20px auto;
}
</style>
