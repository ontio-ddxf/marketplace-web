<template>
  <div class="registered">
    <div class="logo"></div>
    <i class="el-icon-s-home tohome" @click="toHome()"></i>
    <div class="form">
      <el-form
        :model="ruleForm"
        :rules="rules"
        ref="ruleForm"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item label="ONT ID" prop="ontid">
          <el-input v-model="ruleForm.ontid"></el-input>
        </el-form-item>
        <el-form-item label="ONS" prop="domain">
          <el-input v-model="ruleForm.domain"></el-input>
        </el-form-item>
        <el-button type="primary" @click="submitForm('ruleForm')">立即注册</el-button>
      </el-form>
    </div>
  </div>
</template>

<script>
import { client } from 'ontology-dapi'
export default {
  data() {
    return {
      ruleForm: {
        ontid: '',
        domain: ''
      },
      rules: {
        ontid: [
          { required: true, message: '请输入ONT ID', trigger: 'blur' }
        ],
        ons: [
          { required: true, message: '请输入ONS', trigger: 'blur' }
        ]
      }
    };
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate(async (valid) => {
        if (valid) {
          try {
            this.ruleForm.domain = this.ruleForm.domain+'.on.ont'
            let res = await this.$store.dispatch('regiter', this.ruleForm)
            if (res.data.result) {
              this.$message({
                message: '注册成功!',
                type: 'success',
                center: true,
                duration: 2000
              })
            } else {
              this.$message({
                message: 'ONT ID 已被注册，请重试！',
                type: 'error',
                center: true,
                duration: 2000
              })
            }
          } catch (error) {
            this.$message({
              message: '注册失败，请重试！',
              type: 'error',
              center: true,
              duration: 2000
            })
          }
        } else {
          console.log('error submit!!');
          return false;
        }
      });
    },
    toHome() {
      this.$router.push({ path: '/' });
    }
  },
  async mounted() {
    this.ruleForm.ontid = await client.api.identity.getIdentity()
  },
}
</script>

<style lang='less' scoped>
.registered {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  margin-top: 80px;
  padding: 50px 50px;
  box-sizing: border-box;
  border-radius: 10px;
  box-shadow: 0px 0 10px #ccc;
  position: relative;
  .logo {
    width: 150px;
    height: 58px;
    background: url(../assets/images/logo.png) no-repeat;
    background-size: contain;
    margin: 0 auto;
    padding-bottom: 80px;
  }
  i.tohome {
    font-size: 36px;
    position: absolute;
    left: 30px;
    top: 20px;
    cursor: pointer;
  }
}
</style>
