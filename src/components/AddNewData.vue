<template>
  <div class="addBox">
    <h2>新增商品</h2>
    <div style="overflow: hidden; margin-bottom: 20px;">
      <el-button @click="toIndex()" type="primary" plain style="float: right">返回首页</el-button>
    </div>
    <div class="formBox">
      <el-form
        :model="dynamicValidateForm"
        ref="dynamicValidateForm"
        label-width="100px"
        class="demo-dynamic"
      >
        <el-form-item
          prop="price"
          label="价格"
          :rules="[
      { required: true, message: '请输入价格' },
      { type: 'number', message: '请输入正确的数字' }
    ]"
        >
          <el-input v-model.number="dynamicValidateForm.price"></el-input>
        </el-form-item>
        <el-form-item
          v-for="(tag, index) in dynamicValidateForm.tags"
          :label="'标签' + index"
          :key="tag.key"
          :prop="'tags.' + index + '.value'"
          :rules="{
            required: true, message: '标签不能为空', trigger: 'blur'
        }"
        >
          <el-input v-model="tag.value"></el-input>
          <el-button @click.prevent="removetag(tag)">删除</el-button>
        </el-form-item>
        <el-form-item label="币种">
          <el-select style="float: left;" v-model="dynamicValidateForm.coin" placeholder="请选择币种">
            <el-option label="ONG" value="ONG"></el-option>
            <el-option label="ONT" value="ONT"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm('dynamicValidateForm')">添加</el-button>
          <el-button @click="addtag">新增标签</el-button>
          <el-button @click="resetForm('dynamicValidateForm')">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import { client } from 'ontology-dapi'
export default {
  data() {
    return {
      dynamicValidateForm: {
        tags: [{
          value: ''
        }],
        price: '',
        coin: 'ONG'
      },
      accountid: ''
    };
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          console.log(this.dynamicValidateForm)
          this.addNewData()
        } else {
          console.log('error submit!!');
          return false;
        }
      });
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
    removetag(item) {
      var index = this.dynamicValidateForm.tags.indexOf(item)
      if (index !== -1) {
        this.dynamicValidateForm.tags.splice(index, 1)
      }
    },
    addtag() {
      this.dynamicValidateForm.tags.push({
        value: '',
        key: Date.now()
      });
    },
    toIndex() {
      this.$router.push({ path: '/' })
    },
    async addNewData() {
      const { price, coin, tags } = this.dynamicValidateForm
      if (tags.length === 0) {
        this.$message({
          message: '请添加标签',
          type: 'error',
          center: true,
          duration: 2000
        })
        return
      }
      let data = []
      tags.map(item => {
        data.push(item.value)
      })
      let ontid = `did:ont:${this.accountid}`
      let params = {
        ontid,
        data,
        price,
        coin
      }
      console.log(params)
      try {
        let res = await this.$http.put('http://192.168.50.96:8182/api/v1/dataset', params)
        console.log('addnewdata', res)
        if (res && res.data.msg === 'SUCCESS') {
          this.$message({
            message: '商品添加成功',
            type: 'success',
            center: true,
            duration: 2000
          })
          // clear form data
          this.$refs['dynamicValidateForm'].resetFields();
        } else {
          this.$message({
            message: '商品添加失败',
            type: 'error',
            center: true,
            duration: 2000
          })
        }

      } catch (error) {
        this.$message({
          message: error,
          type: 'error',
          center: true,
          duration: 2000
        })
      }
    }
  },
  async mounted() {
    this.accountid = await client.api.asset.getAccount()
  },
}
</script>

<style lang='less' scoped>
.addBox {
  margin: 0 auto;
  width: 80%;
  .formBox {
    .el-input {
      width: 80%;
      float: left;
    }
  }
}
</style>
