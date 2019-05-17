<template>
  <div class="commodity_box">
    <div class="search_box">
      <el-input placeholder="请输入内容" v-model="searchText" class="input-with-select">
        <el-button slot="append" icon="el-icon-search" @click="searchClick()"></el-button>
      </el-input>
    </div>
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
        <el-table-column prop="coin" align="center" label="币种" width="80"></el-table-column>
        <el-table-column prop="price" align="center" label="价格" width="80"></el-table-column>
        <el-table-column prop="createTime" align="center" label="日期" width="200"></el-table-column>
        <el-table-column label="操作" align="center" width="100">
          <template slot-scope="scope">
            <el-button @click="handleClick(scope.row)" type="text" size="small">进入详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="paginatio">
      <el-pagination
        @current-change="handleCurrentChange"
        background
        layout="prev, pager, next"
        :total="recordCount"
        :page-size="pageSize"
      ></el-pagination>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      recordCount: 0,
      searchText: '',
      tableData: [],
      pageSize: 4,
      currentPage: 0
    }
  },
  methods: {
    handleClick(row) {
      this.$router.push({ path: 'commoditydetail', query: { commodityId: row.id } });
    },
    searchClick() {
      this.currentPage = 0
      this.getSearch()
    },
    async getSearch(pageIndex = 0) {
      let params = {
        pageIndex,
        pageSize: this.pageSize,
        queryParams: [
          {
            percent: 100,
            text: this.searchText
          }
        ]
      }
      // this.$store.dispatch('getCommodityList', params)
      try {
        let res = await this.$store.dispatch('getCommodityList', params)
        console.log(res)

        if (res.status === 200 && res.data.msg === 'SUCCESS') {
          this.tableData = res.data.result.recordList
          this.recordCount = res.data.result.recordCount
        } else {
          this.tableData = []
        }
      } catch (error) {
        this.tableData = []
      }
    },
    handleCurrentChange(val) {
      this.getSearch(val - 1)
      this.currentPage = val - 1
    },
    indexMethod(index) {
      return this.currentPage * this.pageSize + index + 1;
    }
  },
  mounted() {
    this.getSearch()
  },
}
</script>

<style lang='less' scoped>
.commodity_box {
  .search_box {
    padding: 0 10%;
    max-width: 40%;
    margin: 0 auto;
  }
  .list_box {
    margin: 0 auto;
    // width: 80%;
  }
  .list_box,
  .paginatio {
    margin-top: 40px;
  }
}
</style>
