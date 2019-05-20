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
        <!-- 商品名 -->
        <el-form-item
          prop="data.name"
          label="商品名"
          :rules="[
            { required: true, message: '请输入商品名' }
          ]"
        >
          <el-input v-model="dynamicValidateForm.data.name"></el-input>
        </el-form-item>
        <!-- 描述 -->
        <el-form-item
          prop="data.desc"
          label="描述"
          :rules="[
            { required: true, message: '请添加描述' }
          ]"
        >
          <el-input v-model="dynamicValidateForm.data.desc"></el-input>
        </el-form-item>
        <!-- 图片地址 -->
        <el-form-item prop="data.img" label="图片地址">
          <el-input v-model="dynamicValidateForm.data.img"></el-input>
        </el-form-item>
        <!-- price -->
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
        <!-- 标签 -->
        <el-form-item
          v-for="(tag, index) in dynamicValidateForm.tags"
          :label="'标签' + (index + 1)"
          :key="tag.key"
          :prop="'tags.' + index + '.value'"
          :rules="{
            required: true, message: '标签不能为空', trigger: 'blur'
        }"
        >
          <el-input v-model="tag.value"></el-input>
          <el-button @click.prevent="removetag(tag)">删除</el-button>
        </el-form-item>
        <!-- 币种 coin -->
        <el-form-item label="币种">
          <el-select style="float: left;" v-model="dynamicValidateForm.coin" placeholder="请选择币种">
            <el-option label="ONG" value="ONG"></el-option>
            <el-option label="ONT" value="ONT"></el-option>
          </el-select>
        </el-form-item>
        <!-- 认证方 -->
        <el-form-item label="认证方">
          <el-select
            style="float: left;"
            v-model="dynamicValidateForm.certifier"
            placeholder="请选择认证方"
          >
            <el-option
              v-for="item in certifierArr"
              :key="item.id"
              :label="item.ontid"
              :value="item.ontid"
            ></el-option>
          </el-select>
        </el-form-item>
        <!-- 仲裁方 -->
        <el-form-item label="仲裁方">
          <el-select
            style="float: left;"
            v-model="dynamicValidateForm.judger"
            placeholder="请选择仲裁方"
          >
            <el-option
              v-for="item in judgerArr"
              :key="item.id"
              :label="item.ontid"
              :value="item.ontid"
            ></el-option>
          </el-select>
        </el-form-item>
        <!-- dataId -->
        <el-form-item prop="data.dataId" label="dataId">
          {{dynamicValidateForm.data.dataId}}
          <el-button
            type="primary"
            v-show="!dynamicValidateForm.data.dataId"
            round
            size="medium"
            @click="toDataId()"
          >生成dataId</el-button>
        </el-form-item>
        <!-- dToken -->
        <el-form-item prop="data.token" label="dToken">
          <span v-show="!dynamicValidateForm.data.token">请生成dToken</span>
          {{dynamicValidateForm.data.token}}
          <el-button
            type="primary"
            round
            size="medium"
            @click="generateOep5('dynamicValidateForm')"
          >oep5生成</el-button>
          <el-button
            type="primary"
            round
            size="medium"
            @click="generateOep8('dynamicValidateForm')"
          >oep8生成</el-button>
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
function uuid(len, radix) {
  var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
  var uuid = [], i;
  radix = radix || chars.length;

  if (len) {
    for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
  } else {
    var r;
    uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
    uuid[14] = '4';
    for (i = 0; i < 36; i++) {
      if (!uuid[i]) {
        r = 0 | Math.random() * 16;
        uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
      }
    }
  }

  return uuid.join('');
}
import { client } from 'ontology-dapi'
import { sha256 } from 'js-sha256'

export default {
  data() {
    return {
      dynamicValidateForm: {
        tags: [{
          value: ''
        }],
        price: '',
        coin: 'ONG',
        data: {
          dataId: null,
          name: null,
          desc: null,
          token: null,
          keywords: [],
          img: null,
          metadata: null
        },
        certifier: '',
        judger: ''
      },
      accountid: '',
      metadata: {
        context: '',
        type: 'Dataset',
        identifier: '',  // uuid----dataId
        name: '',   // name----name
        description: '', //  description
        keywords: '',
        publisher: {
          type: 'Person',
          identifier: '',   // ONT ID
          dateCreated: new Date()
        },
        datePublished: new Date()
      },
      ont_id: null,
      certifierArr: [
      ],
      judgerArr: []
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
      if (!this.dynamicValidateForm.data.dataId) {
        this.$message({
          message: '请先生成dataId',
          type: 'error',
          center: true,
          duration: 2000
        })
        return
      }
      if (!this.dataParams.data.dToken) {
        this.$message({
          message: '清先生成dToken',
          type: 'error',
          center: true,
          duration: 2000
        })
        return
      }
      try {
        console.log('asdfasdfasdf', this.dataParams)
        let res = await this.$store.dispatch('addCommodity', this.dataParams)
        console.log('addnewdata', res)
        if (res && res.data.msg === 'SUCCESS') {
          this.$message({
            message: '商品添加成功',
            type: 'success',
            center: true,
            duration: 2000
          })
          this.$refs['dynamicValidateForm'].resetFields();
        } else {
          console.log('err1')
          this.$message({
            message: '商品添加失败',
            type: 'error',
            center: true,
            duration: 2000
          })
        }

      } catch (error) {
        console.log('err2')
        this.$message({
          message: '商品添加失败',
          type: 'error',
          center: true,
          duration: 2000
        })
      }
    },
    generateOep5(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          console.log(this.dynamicValidateForm.data.dataId)
          if (!this.dynamicValidateForm.data.dataId) {
            this.$message({
              message: '请先生成dataId',
              type: 'error',
              center: true,
              duration: 2000
            })
            return
          }
          let str = JSON.stringify(this.dataParams) + (new Date()).valueOf()
          this.dynamicValidateForm.data.token = sha256(str)
          this.dataParams.data.dToken = this.dynamicValidateForm.data.token
          console.log('this.dataParams', this.dataParams)
        } else {
          console.log('error submit!!');
          return false;
        }
      });
    },
    generateOep8(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          if (!this.dynamicValidateForm.data.dataId) {
            this.$message({
              message: '请先生成dataId',
              type: 'error',
              center: true,
              duration: 2000
            })
            return
          }
          // console.log(this.metadata)
          // console.log(this.dataParams)
          this.dataParams.data.dToken = ''
          this.dynamicValidateForm.data.token = sha256(JSON.stringify(this.dataParams))
          this.dataParams.data.dToken = this.dynamicValidateForm.data.token
          console.log('this.dataParams', this.dataParams)
        } else {
          console.log('error submit!!');
          return false;
        }
      });

    },
    toDataId() {
      this.dynamicValidateForm.data.dataId = uuid()
    }
  },
  async mounted() {
    this.accountid = await client.api.asset.getAccount()
    this.ont_id = await client.api.identity.getIdentity()
    try {
      let res = await this.$store.dispatch('getCertifier')
      if (res.data && res.data.msg === 'SUCCESS') {
        this.certifierArr = res.data.result
        this.dynamicValidateForm.certifier = this.certifierArr[0].ontid
      } else {
        this.certifierArr = []
        this.dynamicValidateForm.certifier = ''
      }
    } catch (error) {
      this.certifierArr = []
      this.dynamicValidateForm.certifier = ''
    }

    try {
      let res = await this.$store.dispatch('getJudger')
      if (res.data && res.data.msg === 'SUCCESS') {
        this.judgerArr = res.data.result
        this.dynamicValidateForm.judger = this.judgerArr[0].ontid
      } else {
        this.judgerArr = []
        this.dynamicValidateForm.judger = ''
      }
    } catch (error) {
      this.judgerArr = []
      this.dynamicValidateForm.judger = ''
    }
  },
  computed: {
    dataParams() {
      let cpas = {
        coin: '',
        price: null,
        ontid: '',
        data: {
          dataId: '',
          desc: '',
          img: '',
          keywords: [],
          metadata: '',
          name: "",
        }
      }
      cpas.coin = this.dynamicValidateForm.coin
      cpas.price = this.dynamicValidateForm.price
      cpas.ontid = this.ont_id
      cpas.certifier = this.dynamicValidateForm.certifier
      cpas.judger = this.dynamicValidateForm.judger
      console.log('this.dynamicValidateForm.data.desc', this.dynamicValidateForm.data.desc);


      this.dynamicValidateForm.tags.map(item => {
        cpas.data.keywords.push(item.value)
      })
      cpas.data.desc = this.dynamicValidateForm.data.desc
      cpas.data.dataId = this.dynamicValidateForm.data.dataId
      cpas.data.img = this.dynamicValidateForm.data.img
      cpas.data.name = this.dynamicValidateForm.data.name
      this.metadata.identifier = this.dynamicValidateForm.data.dataId
      this.metadata.name = this.dynamicValidateForm.data.name
      this.metadata.description = this.dynamicValidateForm.data.desc
      this.metadata.publisher.identifier = this.ont_id

      this.metadata.keywords = [...cpas.data.keywords].join()
      console.log('this.metadata', this.metadata);
      this.dynamicValidateForm.data.metadata = JSON.stringify(this.metadata)
      cpas.data.metadata = this.dynamicValidateForm.data.metadata
      return cpas
    }
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
