import Vue from 'vue'
import Vuex from 'vuex'
import { client } from 'ontology-dapi'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    scriptHash: '472848200412d9a7abbb0ed0bfb568a47745e4ba',
    gasPrice: 500,
    gasLimit: 30000,
    requireIdentity: true,
    token_address: '0000000000000000000000000000000000000002'
  },
  mutations: {

  },
  actions: {
    async  dapiInvoke({ dispatch, commit }, params) {
      console.log('params', params)
      const { operation, args } = params
      const { scriptHash, gasPrice, gasLimit, requireIdentity } = this.state
      try {
      console.log('scriptHash', scriptHash)

        const result = await client.api.smartContract.invoke({
          scriptHash,
          operation,
          args,
          gasPrice,
          gasLimit,
          requireIdentity
        })
        console.log(result);
        return result

      } catch (error) {
        return error
      }
    }
  }
})
