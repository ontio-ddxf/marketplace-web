import Vue from "vue";
import Vuex from "vuex";
import { client } from "ontology-dapi";
import axios from "axios";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    scriptHash: "6abeee94255356500bccf4d65017a26413f417ac",
    gasPrice: 500,
    gasLimit: 30000,
    requireIdentity: true,
    token_address: "0000000000000000000000000000000000000002"
  },
  mutations: {},
  actions: {
    async dapiInvoke({ dispatch, commit }, params) {
      console.log("params", params);
      const { operation, args } = params;
      const { scriptHash, gasPrice, gasLimit, requireIdentity } = this.state;
      try {
        console.log("scriptHash", scriptHash);

        const result = await client.api.smartContract.invoke({
          scriptHash,
          operation,
          args,
          gasPrice,
          gasLimit,
          requireIdentity
        });
        console.log(result);
        return result;
      } catch (error) {
        return error;
      }
    },
    async getCommodityList({ dispatch, commit }, params) {
      console.log(params);
      try {
        return await axios.post(
          `${process.env.VUE_APP_SELECT}/api/v1/dataset`,
          params
        );
      } catch (error) {
        return error;
      }
    },
    async addCommodity({ dispatch, commit }, params) {
      try {
        console.log(params);

        return await axios.put(
          process.env.VUE_APP_SELECT + "/api/v1/dataset",
          params
        );
      } catch (error) {
        return error;
      }
    },
    async getCommodityDetail({ dispatch, commit }, params) {
      let { id } = params;
      try {
        return await axios.get(
          `${process.env.VUE_APP_SELECT}/api/v1/dataset/${id}`
        );
      } catch (error) {
        return error;
      }
    },
    async getBuyOrder({ dispatch, commit }, params) {
      console.log(params);
      let { accountid, pageNum, pageSize } = params;
      try {
        return await axios.get(
          `${
            process.env.VUE_APP_ORFDER
          }/api/v1/data-dealer/tools/orders/0?ontid=did:ont:${accountid}&pageNum=${pageNum}&pageSize=${pageSize}`
        );
      } catch (error) {
        return error;
      }
    },
    async getViewInfo({ dispatch, commit }, params) {
      let { orderId, accountid } = params;
      try {
        return await axios.get(
          `${
            process.env.VUE_APP_ORFDER
          }/api/v1/data-dealer/tools/data?orderId=${orderId}&ontid=did:ont:${accountid}`
        );
      } catch (error) {
        return error;
      }
    },
    async getSellOrderData({ dispatch, commit }, params) {
      let { accountid, pageNum, pageSize } = params;
      try {
        return await axios.get(
          `${
            process.env.VUE_APP_ORFDER
          }/api/v1/data-dealer/tools/orders/1?ontid=did:ont:${accountid}&pageNum=${pageNum}&pageSize=${pageSize}`
        );
      } catch (error) {
        return error;
      }
    },
    async getCertifier() {
      try {
        return await axios.get(
          process.env.VUE_APP_SELECT + "/api/v1/certifier"
        );
      } catch (error) {
        return error;
      }
    },
    async getJudger() {
      try {
        return await axios.get(process.env.VUE_APP_SELECT + "/api/v1/judger");
      } catch (error) {
        return error;
      }
    },
    async getCertData({ dispatch, commit }, params) {
      try {
        return await axios.get(
          `${process.env.VUE_APP_SELECT}/api/v1/certifier/${params}`
        );
      } catch (error) {
        return error;
      }
    },
    async toCert({ dispatch, commit }, params) {
      try {
        return await axios.post(
          `${process.env.VUE_APP_SELECT}/api/v1/certifier`,
          params
        );
      } catch (error) {
        return error;
      }
    },
    async getSellData({ dispatch, commit }, params) {
      try {
        return await axios.get(
          `${process.env.VUE_APP_SELECT}/api/v1/dataset/provider/${params}`
        );
      } catch (error) {
        return error;
      }
    },
    async prodOperat({ dispatch, commit }, params) {
      try {
        return await axios.post(`${process.env.VUE_APP_SELECT}/api/v1/dataset/${params}`)
      } catch (error) {
        return error
      }
    }
  }
});
