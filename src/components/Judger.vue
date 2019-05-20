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
        <el-table-column prop="coin" align="center" label="币种" width="80"></el-table-column>
        <el-table-column prop="price" align="center" label="价格" width="80"></el-table-column>
        <el-table-column prop="createTime" align="center" label="日期" width="200"></el-table-column>
        <el-table-column label="操作" align="center" width="100">
          <template slot-scope="scope">
            <el-button @click="handleClick(scope.row)" type="text" size="small">立即仲裁</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      tableData: []
    }
  },
  methods: {
    handleClick(data) { },
    indexMethod(idx) {
        return idx + 1
    }
  },
}
</script>

<style>
</style>
