<template>
  <div class="addBox">
    <h2>{{$t('common.ready_shelf')}}</h2>
    <div style="overflow: hidden; margin-bottom: 20px;">
      <el-button
        @click="$router.go(-1)"
        type="primary"
        plain
        style="float: left"
      >{{$t('common.back_to_prev')}}</el-button>
      <el-button
        @click="toIndex()"
        type="primary"
        plain
        style="float: right"
      >{{$t('common.to_home')}}</el-button>
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
          :label="tableLang.name"
          :rules="[
            { required: true, message: tableLang.nameTip }
          ]"
        >
          <el-input disabled v-model="dynamicValidateForm.data.name"></el-input>
        </el-form-item>
        <!-- 描述 -->
        <el-form-item
          prop="data.desc"
          :label="tableLang.desc"
          :rules="[
            { required: true, message: tableLang.descTip }
          ]"
        >
          <el-input disabled v-model="dynamicValidateForm.data.desc"></el-input>
        </el-form-item>
        <!-- 图片地址 -->
        <el-form-item prop="data.img" :label="tableLang.imgAddress">
          <el-input disabled v-model="dynamicValidateForm.data.img"></el-input>
        </el-form-item>
        <!-- amount -->
        <el-form-item
          prop="amount"
          :label="tableLang.amount"
          :rules="[
            { required: true, message: tableLang.amountTip1 },
            { type: 'number', message: tableLang.priceTip2 }
          ]"
          style="text-align:left;"
        >
          <el-input-number
            v-model="dynamicValidateForm.amount"
            controls-position="right"
            :min="0"
            :max="100"
          ></el-input-number>
        </el-form-item>
        <!-- tokenSymbol -->
        <el-form-item
          prop="symbol"
          :label="tableLang.symbol"
          :rules="[
            { required: true, message: this.$t('common.please_enter') + 'symbol', trigger: 'blur' },
            { min: 3, message: this.$t('common.character3'), trigger: 'blur' }
          ]"
          style="text-align:left;"
        >
          <el-input v-model="dynamicValidateForm.symbol" autocomplete="off"></el-input>
        </el-form-item>
        <!-- tokenName -->
        <el-form-item
          prop="tokenName"
          :label="tableLang.tokenName"
          :rules="[
            { required: true, message: this.$t('common.please_enter') + 'name', trigger: 'blur' },
            { min: 3, message: this.$t('common.character3'), trigger: 'blur' }
          ]"
          style="text-align:left;"
        >
          <el-input v-model="dynamicValidateForm.tokenName" autocomplete="off"></el-input>
        </el-form-item>
        <!-- transferCount -->
        <el-form-item
          prop="transferCount"
          :label="tableLang.transferCount"
          :rules="[
            { required: true, message: this.$t('common.please_enter') + 'transferCount' },
            { type: 'number', message: 'transferCount' + this.$t('common.mbnum') },
          ]"
          style="text-align:left;"
        >
          <el-input-number
            v-model="dynamicValidateForm.transferCount"
            controls-position="right"
            :min="0"
            :max="100"
          ></el-input-number>
        </el-form-item>
        <!-- expireTime -->
        <el-form-item :label="tableLang.expireTime" prop="expireTime">
          <!-- <el-input type="age" v-model.number="form.expireTime" autocomplete="off"></el-input> -->
          <el-date-picker
            v-model="dynamicValidateForm.expireTime"
            type="datetime"
            placeholder="选择日期时间"
          ></el-date-picker>
        </el-form-item>
        <!-- 标签 -->
        <el-form-item
          v-for="(tag, index) in dynamicValidateForm.tags"
          :label="tableLang.tag + (index + 1)"
          :key="tag.key"
          :prop="'tags.' + index + '.value'"
          :rules="{
            required: true, message: tableLang.tagTip, trigger: 'blur'
        }"
        >
          <el-input v-model="tag.value" disabled></el-input>
          <el-button disabled @click.prevent="removetag(tag)">{{$t('common.delete')}}</el-button>
        </el-form-item>
        <!-- 币种 coin -->
        <el-form-item :label="tableLang.coin">
          <el-select
            style="float: left;"
            v-model="dynamicValidateForm.coin"
            :placeholder="tableLang.coinTip"
          >
            <el-option label="ONG" value="ONG"></el-option>
            <el-option label="ONT" value="ONT"></el-option>
          </el-select>
        </el-form-item>
        <!-- 认证方 -->
        <el-form-item :label="tableLang.certifier">
          <el-select
            style="float: left;"
            v-model="dynamicValidateForm.certifier"
            :placeholder="tableLang.cerTips"
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
        <el-form-item :label="tableLang.judger">
          <el-checkbox-group v-model="dynamicValidateForm.judgerType">
            <el-checkbox
              v-for="item in judgerArr"
              :key="item.id"
              :label="item.ontid"
              name="judgerType"
            ></el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            @click="submitForm('dynamicValidateForm')"
          >{{$t('common.shelf')}}</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import { client } from 'ontology-dapi'
import { sha256 } from 'js-sha256'
// import { OntidContract, TransactionBuilder, TxSignature, Identity, Crypto, RestClient, utils } from 'ontology-ts-sdk';
import moment from 'moment'


export default {
  data() {
    return {
      tableLang: {
        name: this.$t('common.commodity_name'),
        nameTip: this.$t('common.please_enter') + this.$t('common.commodity_name'),
        desc: this.$t('common.description'),
        descTip: this.$t('common.please_enter') + this.$t('common.description'),
        imgAddress: this.$t('common.img_address'),
        dataSource: this.$t('common.data_source'),
        tag: this.$t('common.tag'),
        tagTip: this.$t('common.tag_not_empty'),
        certifier: this.$t('common.certifier'),
        cerTips: this.$t('common.cerTip'),
        price: this.$t('common.price'),
        amount: this.$t('common.amount'),
        symbol: this.$t('common.symbol'),
        tokenName: this.$t('common.tokenName'),
        transferCount: this.$t('common.transferCount'),
        accessCount: this.$t('common.accessCount'),
        expireTime: this.$t('common.expireTime'),
        priceTip1: this.$t('common.please_enter') + this.$t('common.price'),
        amountTip1: this.$t('common.please_enter') + this.$t('common.amount'),
        priceTip2: this.$t('common.price_tip2'),
        coin: this.$t('common.coin'),
        coinTip: this.$t('common.please_enter') + this.$t('common.coin'),
        judger: this.$t('common.judger'),
        tokenNum: this.$t('common.number'),
        tokenNumTip: this.$t('common.please_enter') + this.$t('common.number'),
      },
      dynamicValidateForm: {
        tags: [],
        price: 0,
        amount: '',
        symbol: '',
        tokenName: '',
        transferCount: '',
        accessCount: 999999999,
        expireTime: '',
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
        identifier: '',  //
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
      hashId: null,
      idTimer: null,
      DId: null,
      dataIdTimer: null
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
      if (index !== 0) {
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
          message: this.$t('common.judger_one_tip'),
          type: 'error',
          center: true,
          duration: 2000
        })
        return
      }
      this.dataParams.id = this.detailList.id

      console.log('this.dataParams', this.dataParams)
      let OJList = []
      this.dataParams.judger.map((item, idx) => {
        OJList.push('Address:' + item.substring(8))
      })
      const privateKey = Ont.Crypto.PrivateKey.random();
      var identity = Ont.Identity.create(privateKey, '', '')
      let contracParams = {
        argsList: [{
          name: "dataId",
          value: "String:" + identity.ontid
        }, {
          name: "index",
          value: 1
        }, {
          name: "symbol",
          value: "String:" + this.dataParams.symbol
        }, {
          name: "name",
          value: "String:" + this.dataParams.tokenName
        }, {
          name: "authAmount",
          value: this.dataParams.amount
        }, {
          name: "price",
          value: this.dataParams.price * Math.pow(10, 9)
        }, {
          name: "transferCount",
          value: this.dataParams.transferCount
        }, {
          name: "accessCount",
          value: 99
        }, {
          name: "expireTime",
          // value: moment(this.dataParams.expireTime).unix()
          value: 0
        }, {
          name: "makerTokenHash",
          value: "ByteArray:3e7d3d82df5e1f951610ffa605af76846802fbae"
        }, {
          name: "makerReceiveAddress",
          value: "Address:" + this.accountid
        }, {
          name: "mpReceiveAddress",
          value: "Address:AePd2vTPeb1DggiFj82mR8F4qQXM2H9YpB"
        }, {
          name: "OJList",
          value: OJList
        }],
        contractHash: '57a078f603a6894ea4c3688251b981e543fe1cb1',
        method: 'authOrder'
      }
      console.log('contracParams', contracParams)
      console.log('this.dataParams', this.dataParams);
      // let orderParams = {
      //   id: this.detailList.id,
      //   token: "ong",
      //   price: this.dataParams.price * Math.pow(10, 9),
      //   amount: this.dataParams.amount,
      //   ojList: this.dataParams.judger,
      //   contractVo: contracParams
      // }

      let idParams = {
        dataIdVo: {
          dataId: identity.ontid,
          id: this.detailList.id,
          ontid: this.ont_id,
          pubKey: 1
        },
        orderVo: {
          id: this.detailList.id,
          amount: this.dataParams.amount,
          contractVo: contracParams,
          ojList: this.dataParams.judger,
          price: this.dataParams.price * Math.pow(10, 9),
          // providerOntid: 'string',
          token: 'ong'
        }
      }
      console.log('idParams', idParams)
      let result = await this.$store.dispatch('getTID', idParams)
      console.log('result', result)
      if (result.data.desc === 'SUCCESS') {
        this.DId = result.data.result.id
        let message = result.data.result.message
        console.log('message', message)
        let msgArr = []
        message.map((item, index) => {
          item = item.slice(0, item.length - 2)
          item = Ont.utils.sha256(item)
          item = Ont.utils.sha256(item)
          msgArr.push(item)
        })
        console.log('msgArr', msgArr)
        let codeParams = {
          action: 'signMultiMessage',
          version: 'v1.0.0',
          id: this.DId,
          params: {
            type: 'ontid',
            message: msgArr,
            ishex: true,
            callback: result.data.result.callback
          }
        }
        console.log('codeParams', codeParams)
        let qrparams = {
          params: codeParams,
          isShow: true
        }
        this.$store.dispatch('changeQrcode', qrparams)
        clearInterval(this.dataIdTimer)
        this.dataIdTimer = setInterval(async () => {
          let result = await this.$store.dispatch('getCheckRes', this.DId)
          console.log('result orjs', result)
          if (result === 1) {
            clearInterval(this.dataIdTimer)
            this.$message({
              message: this.$t('common.pro_success'),
              center: true,
              type: 'success'
            });
            this.$router.push({path: '/'})
          } else if (result === 3) {
            clearInterval(this.dataIdTimer)
            this.$message({
              message: this.$t('common.pro_fail'),
              type: 'error',
              center: true,
              duration: 2000
            });
          }  else if (result === 4) { clearInterval(this.dataIdTimer) } else {}
        }, 3000)
      } else {
        this.$message({
          message: this.$t('common.pro_fail'),
          type: 'error',
          center: true,
          duration: 2000
        });
      }
    },
    async getDetail(id) {
      let params = {
        id
      }
      try {
        let res = await this.$store.dispatch('getCommodityDetail', params)
        if (res.status === 200 && res.data.desc === 'SUCCESS') {
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
          this.dynamicValidateForm.data.dataId = this.detailList.data.dataId

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
    this.accountid = sessionStorage.getItem("user_ontid").substring(8)
    this.ont_id = sessionStorage.getItem("user_ontid")
    
    try {
      let res = await this.$store.dispatch('getCertifier')
      if (res.data && res.data.desc === 'SUCCESS') {
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
      if (res.data && res.data.desc === 'SUCCESS') {
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
  },
  computed: {
    dataParams() {
      let cpas = {
        coin: '',
        price: 1,
        ontid: '',
        judger: [],
        challengePeriod: []
      }
      cpas.coin = this.dynamicValidateForm.coin || 'ONG'
      // cpas.price = this.dynamicValidateForm.price
      cpas.amount = this.dynamicValidateForm.amount
      cpas.ontid = this.ont_id
      cpas.certifier = this.dynamicValidateForm.certifier
      cpas.judger = this.dynamicValidateForm.judgerType
      cpas.tokenNum = this.dynamicValidateForm.tokenNum
      cpas.tokenName = this.dynamicValidateForm.tokenName
      cpas.symbol = this.dynamicValidateForm.symbol
      cpas.expireTime = this.dynamicValidateForm.expireTime
      cpas.transferCount = this.dynamicValidateForm.transferCount
      cpas.accessCount = this.dynamicValidateForm.accessCount
      return cpas
    }
  },
  beforeDestroy() {
    clearInterval(this.dataIdTimer)
  }
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
