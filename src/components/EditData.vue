<template>
  <div class="addBox">
    <h2>准备上架</h2>
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
          <el-input disabled v-model="dynamicValidateForm.data.name"></el-input>
        </el-form-item>
        <!-- 描述 -->
        <el-form-item
          prop="data.desc"
          label="描述"
          :rules="[
            { required: true, message: '请添加描述' }
          ]"
        >
          <el-input disabled v-model="dynamicValidateForm.data.desc"></el-input>
        </el-form-item>
        <!-- 图片地址 -->
        <el-form-item prop="data.img" label="图片地址">
          <el-input disabled v-model="dynamicValidateForm.data.img"></el-input>
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
          <el-input v-model="tag.value" disabled></el-input>
          <el-button disabled @click.prevent="removetag(tag)">删除</el-button>
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
            disabled
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
          <el-checkbox-group v-model="dynamicValidateForm.judgerType">
            <el-checkbox
              v-for="item in judgerArr"
              :key="item.id"
              :label="item.ontid"
              name="judgerType"
            ></el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item style="text-align:left;">token剩余数量: {{dynamicValidateForm.tokenTotal}}</el-form-item>
        <el-form-item
          label="token数量"
          prop="tokenNum"
          :rules="[
            { required: true, message: '请输入数量' },
            { type: 'number', message: '请输入正确的数字' }
          ]"
        >
          <el-input v-model.number="dynamicValidateForm.tokenNum"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm('dynamicValidateForm')">上架</el-button>
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
import { OntidContract, TransactionBuilder, TxSignature, Identity, Crypto, RestClient, utils } from 'ontology-ts-sdk';

export default {
  data() {
    return {
      dynamicValidateForm: {
        tags: [],
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
        judger: '',
        // juderTime: '',
        judgerType: [],
        tokenNum: null,
        tokenId: null,
        tokenTotal: null
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
      certifierArr: [],
      judgerArr: [],
      detailList: { data: {}, nnn: 2 },

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
      if (this.dataParams.judger.length == 0) {
        this.$message({
          message: '请至少选中一个仲裁方！',
          type: 'error',
          center: true,
          duration: 2000
        })
        return
      }
      if (this.dataParams.tokenNum > this.dynamicValidateForm.tokenTotal) {
        this.$message({
          message: 'token数量不足',
          type: 'error',
          center: true,
          duration: 2000
        })
        return
      }

      this.dataParams.id = this.detailList.id

      console.log('this.dataParams', this.dataParams)
      // return
      let OJList = []
      this.dataParams.judger.map((item, idx) => {
        OJList.push('Address:' + item.substring(8))
      })

      // console.log('OJList', OJList)
      // 构造参数
      let contracParams = {
        argsList: [{
          name: "makerTokenHash",
          value: "ByteArray:0f0929b514ddf62522a8a335b588321b2e7725bc"
        }, {
          name: "makerTokenId",
          value: this.detailList.tokenId
        }, {
          name: "makerTokenAmount",
          value: this.dataParams.tokenNum
        }, {
          name: "makerReceiveAddress",
          value: "Address:" + this.ont_id.substring(8)
        }, {
          name: "makerMortgageTokenHash",
          value: "ByteArray:0000000000000000000000000000000000000002"
        }, {
          name: "takerPaymentTokenHash",
          value: "ByteArray:0000000000000000000000000000000000000002"
        }, {
          name: "takerPaymentTokenAmount",
          value: this.dataParams.price * Math.pow(10, 9)
        }, {
          name: "mpReceiveAddress",
          value: "Address:AePd2vTPeb1DggiFj82mR8F4qQXM2H9YpB"
        }, {
          name: "txFeeTokenHash",
          value: "ByteArray:0000000000000000000000000000000000000002"
        }, {
          name: "OJList",
          value: OJList
        }],
        contractHash: '3da0998e1e759aaed78b41ce1f92151d7b3f1083',
        method: 'makeOrder'
      }
      console.log('contracParams', contracParams)
      console.log('this.dataParams', this.dataParams);
      // return
      // 构造交易

      try {
        let res = await this.$store.dispatch('makeTransaction', contracParams)
        console.log('makeTransaction', res)
        if (res.data.msg === 'SUCCESS') {
          let sigVo = {
            txHex: res.data.result,
            pubKeys: '',
            sigData: ''
          }
          let message = res.data.result
          message = message.slice(0, message.length - 2)
          message = utils.sha256(message)
          message = utils.sha256(message)
          message = utils.hexstr2str(message)
          try {
            let signData = await client.api.message.signMessage({ message });
            sigVo.pubKeys = signData.publicKey
            sigVo.sigData = signData.data
          } catch (error) {
            this.$message({
              message: '商品上架失败',
              type: 'error',
              center: true,
              duration: 2000
            })
            return
          }


          let orderParams = {
            dataId: this.detailList.dataId,
            tokenId: this.detailList.tokenId,
            tokenHash: "0000000000000000000000000000000000000002",
            price: this.dataParams.price * Math.pow(10, 9),
            providerOntid: this.ont_id,
            ojList: this.dataParams.judger,
            keywords: this.detailList.data.keywords,
            sigVo,
            amount: this.dataParams.tokenNum,
            name: this.detailList.data.name,
            desc: this.detailList.data.desc,
            img: this.detailList.data.img
          }

          try {
            let res = await this.$store.dispatch('createOrderID', orderParams)
            console.log('orderParams', res)
            if (res.data.msg === 'SUCCESS' && res.data.result) {
              this.$message({
                message: '商品上架成功',
                type: 'success',
                center: true,
                duration: 2000
              })
               this.$router.push({ path: '/commoditymanage' })
            } else {
              this.$message({
                message: '商品上架失败',
                type: 'error',
                center: true,
                duration: 2000
              })
              return false
            }
          } catch (error) {
            this.$message({
              message: '商品上架失败',
              type: 'error',
              center: true,
              duration: 2000
            })
            return false
          }

        } else {
          this.$message({
            message: '商品上架失败',
            type: 'error',
            center: true,
            duration: 2000
          })
          return false
        }
      } catch (error) {
        throw error
        this.$message({
          message: '商品上架失败',
          type: 'error',
          center: true,
          duration: 2000
        })
        return false
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
          console.log(this.metadata)
          console.log(this.dataParams)
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
    },
    async getDetail(id) {
      let params = {
        id
      }
      try {
        let res = await this.$store.dispatch('getCommodityDetail', params)
        if (res.status === 200 && res.data.msg === 'SUCCESS') {
          this.detailList = res.data.result
          console.log('this.detailList', this.detailList)
          this.dynamicValidateForm.certifier = this.detailList.certifier
          this.dynamicValidateForm.judger = this.detailList.judger
          this.dynamicValidateForm.tokenId = this.detailList.tokenId
          this.dynamicValidateForm.price = +this.detailList.price || ''
          this.dynamicValidateForm.coin = this.detailList.coin || 'ONG'
          this.dynamicValidateForm.data.name = this.detailList.data.name
          this.dynamicValidateForm.data.desc = this.detailList.data.desc
          this.dynamicValidateForm.data.img = this.detailList.data.img

          this.detailList.data.keywords.map(x => {
            let a = {}
            a.value = x
            this.dynamicValidateForm.tags.push(a)
          })
          console.log(this.dynamicValidateForm)
        }
      } catch (error) {
        console.log(error)
      }
    },
    back() {
      this.$router.go(-1)
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
      } else {
        this.judgerArr = []
      }
    } catch (error) {
      this.judgerArr = []
      this.dynamicValidateForm.judger = ''
    }

    let data_id = this.$route.query.commodityId
    await this.getDetail(data_id)
    let pars = {
      ontid: this.ont_id.substring(8),
      tokenId: this.detailList.tokenId
    }

    try {
      let results = await this.$store.dispatch('queryTokenNum', pars)

      if (results.data.msg === "SUCCESS") {

        this.dynamicValidateForm.tokenTotal = results.data.result

      }
    } catch (error) {

    }

  },
  computed: {
    dataParams() {
      let cpas = {
        coin: '',
        price: null,
        ontid: '',
        judger: [],
        challengePeriod: []
      }
      cpas.coin = this.dynamicValidateForm.coin || 'ONG'
      cpas.price = this.dynamicValidateForm.price
      cpas.ontid = this.ont_id
      cpas.certifier = this.dynamicValidateForm.certifier
      cpas.judger = this.dynamicValidateForm.judgerType
      cpas.tokenNum = this.dynamicValidateForm.tokenNum
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
