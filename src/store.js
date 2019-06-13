import Vue from "vue";
import Vuex from "vuex";
import { client } from "ontology-dapi";
import axios from "axios";
import LangStorage from "./helpers/lang";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    scriptHash: "6abeee94255356500bccf4d65017a26413f417ac",
    gasPrice: 500,
    gasLimit: 30000,
    requireIdentity: true,
    token_address: "0000000000000000000000000000000000000002",
    dataId: {
      scriptHash: "0300000000000000000000000000000000000000",
      gasPrice: 0,
      gasLimit: 30000,
      requireIdentity: true
    },
    lang: LangStorage.getLang("en")
  },
  mutations: {
    UPDATE_HOME_LANG(state, payload) {
      state.lang = payload.lang;
    }
  },
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
          `${process.env.VUE_APP_DDXF_API}/api/v1/order/all`,
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
          process.env.VUE_APP_DDXF_API + "/api/v1/dataset",
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
          `${process.env.VUE_APP_DDXF_API}/api/v1/dataset/${id}`
        );
      } catch (error) {
        return error;
      }
    },
    async getBuyOrder({ dispatch, commit }, params) {
      console.log(params);
      // let { accountid, pageNum, pageSize } = params;
      try {
        return await axios.post(
          `${process.env.VUE_APP_DDXF_API}/api/v1/order/self`,
          params
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
          process.env.VUE_APP_DDXF_API + "/api/v1/certifier"
        );
      } catch (error) {
        return error;
      }
    },
    async getJudger() {
      try {
        return await axios.get(process.env.VUE_APP_DDXF_API + "/api/v1/judger");
      } catch (error) {
        return error;
      }
    },
    async getCertData({ dispatch, commit }, params) {
      try {
        const { ontid, pageNum, pageSize } = params;
        return await axios.get(
          `${
            process.env.VUE_APP_DDXF_API
          }/api/v1/certifier/${ontid}?pageNum=${pageNum}&pageSize=${pageSize}`
        );
      } catch (error) {
        return error;
      }
    },
    async toCert({ dispatch, commit }, params) {
      try {
        return await axios.post(
          `${process.env.VUE_APP_DDXF_API}/api/v1/certifier`,
          params
        );
      } catch (error) {
        return error;
      }
    },
    async getSellData({ dispatch, commit }, params) {
      try {
        console.log("params", params);
        const { ontid, pageNum, pageSize } = params;
        console.log("ontid", ontid);
        return await axios.get(
          `${
            process.env.VUE_APP_DDXF_API
          }/api/v1/dataset/provider/${ontid}?pageNum=${pageNum}&pageSize=${pageSize}`
        );
      } catch (error) {
        return error;
      }
    },
    async prodOperat({ dispatch, commit }, params) {
      try {
        return await axios.post(
          `${process.env.VUE_APP_SELECT}/api/v1/dataset/${params}`
        );
      } catch (error) {
        return error;
      }
    },
    async regiter({ dispatch, commit }, params) {
      try {
        console.log(params);
        return await axios.post(
          `${process.env.VUE_APP_ORFDER}/api/v1/data-dealer/ons/register`,
          params
        );
      } catch (error) {
        return error;
      }
    },
    async login({ dispatch, commit }, params) {
      try {
        return await axios.get(
          `${process.env.VUE_APP_ORFDER}/api/v1/data-dealer/ons/login/${params}`
        );
      } catch (error) {
        return error;
      }
    },
    async shelf({ dispatch, commit }, params) {
      try {
        return await axios.post(
          `${process.env.VUE_APP_SELECT}/api/v1/dataset/provide`,
          params
        );
      } catch (error) {
        return error;
      }
    },
    async setInvoke({ dispatch, commit }, params) {
      try {
        console.log(params);
        // return;
        return await axios.post(
          `${process.env.VUE_APP_SELECT}/api/v1/data-dealer/contract/dataid`,
          params
        );
      } catch (error) {
        return error;
      }
    },
    async dataIdInvoke({ dispatch, commit }, params) {
      console.log("params", params);
      const { operation, args } = params;
      const {
        scriptHash,
        gasPrice,
        gasLimit,
        requireIdentity
      } = this.state.dataId;
      console.log("args", args);
      console.log("operation", operation);
      console.log("scriptHash", scriptHash);
      console.log("gasPrice", gasPrice);
      console.log("gasLimit", gasLimit);
      console.log("requireIdentity", requireIdentity);
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
    async sendPayer({ dispatch, commit }, params) {
      try {
        console.log(params);
        // return;
        return await axios.post(
          `${process.env.VUE_APP_SELECT}/api/v1/data-dealer/contract/send`,
          params
        );
      } catch (error) {
        return error;
      }
    },
    async addProd({ dispatch, commit }, params) {
      try {
        return await axios.put(
          process.env.VUE_APP_DDXF_API + "/api/v1/dataset",
          params
        );
      } catch (error) {
        return error;
      }
    },
    async getDID({ dispatch, commit }, params) {
      try {
        return await axios.post(
          process.env.VUE_APP_DDXF_API + "/api/v1/contract/dataid",
          params
        );
      } catch (error) {
        return error;
      }
    },
    async getTID({ dispatch, commit }, params) {
      try {
        return await axios.post(
          process.env.VUE_APP_DDXF_API + "/api/v1/dataset/tokenId",
          params
        );
      } catch (error) {
        return error;
      }
    },
    async queryTokenNum({ dispatch, commit }, params) {
      try {
        return await axios.get(
          process.env.VUE_APP_DDXF_API +
            `/api/v1/dataset/token/balance/${params.ontid}/${params.tokenId}`
        );
      } catch (error) {
        return error;
      }
    },
    async queryjuderData({ dispatch, commit }, params) {
      try {
        return await axios.get(
          `${process.env.VUE_APP_DDXF_API}/api/v1/judger/${
            params.ontid
          }?pageNum=${params.pageNum}&pageSize=${params.pageSize}`
        );
      } catch (error) {
        return error;
      }
    },
    async makeTransaction({ dispatch, commit }, params) {
      console.log(params);
      try {
        return await axios.post(
          process.env.VUE_APP_DDXF_API + "/api/v1/contract/transaction",
          params
        );
      } catch (error) {
        return error;
      }
    },
    async createOrderID({ dispatch, commit }, params) {
      try {
        return await axios.post(
          process.env.VUE_APP_DDXF_API + "/api/v1/order",
          params
        );
      } catch (error) {
        return error;
      }
    },
    async buyData({ dispatch, commit }, params) {
      try {
        return axios.post(
          process.env.VUE_APP_DDXF_API + "/api/v1/order/purchase",
          params
        );
      } catch (error) {
        return error;
      }
    },
    async checkData({ dispatch, commit }, params) {
      try {
        return axios.post(
          process.env.VUE_APP_DDXF_API + "/api/v1/order/data",
          params
        );
      } catch (error) {
        return error;
      }
    },
    async sendPass({ dispatch, commit }, params) {
      try {
        return axios.post(
          process.env.VUE_APP_DDXF_API + "/api/v1/contract/send",
          params
        );
      } catch (error) {
        return error;
      }
    },
    async sendOJData({ dispatch, commit }, params) {
      try {
        return axios.post(
          process.env.VUE_APP_DDXF_API + "/api/v1/judger/result",
          params
        );
      } catch (error) {
        return error;
      }
    }
  }
});

/**
 * 
 * import LangStorage from "../../helpers/lang";

const state = {
  lang: LangStorage.getLang("en")
};

const mutations = {
  UPDATE_HOME_LANG(state, payload) {
    state.lang = payload.lang;
  }
};

const actions = {};

export default {
  state,
  mutations,
  actions
};
 * 
 */
