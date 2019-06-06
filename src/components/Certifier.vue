<template>
  <div>
    <div class="list_box">
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
        <el-table-column prop="createTime" align="center" label="日期" width="200"></el-table-column>
        <el-table-column label="操作" align="center" width="100">
          <template slot-scope="scope">
            <el-button @click="handleClick(scope.row)" type="text" size="small">进入详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import { client } from 'ontology-dapi'

export default {
  data() {
    return {
      tableData: [],
      ontid: ''
    }
  },
  methods: {
    indexMethod(idx) {
      return idx + 1
    },
    async  getCertData() {
      let params = {
        ontid: this.ontid,
        pageNum: 0,
        pageSize: 10
      }
      try {
        let res = await this.$store.dispatch('getCertData', params)
        console.log('certifier', res)
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
      sessionStorage.setItem('isCert', 0)
      this.$router.push({ path: 'commoditydetail', query: { commodityId: row.id } });
    }
  },
  async mounted() {
    this.ontid = await client.api.identity.getIdentity()
    await this.getCertData()
  }
}
</script>

<style>
</style>
