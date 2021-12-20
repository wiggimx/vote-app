import Vue from "vue";
import Vuex from "vuex";
import { ethers } from "ethers";
import Vote from "../utils/vote.json";

Vue.use(Vuex)

const transformProposalData = (characterData) => {
  return {
    name: characterData.name,
    votesCount: characterData.votesCount.toNumber(),
  };
};


export default new Vuex.Store({
  state:{
    account:null,
    error:null,
    mining:false,
    voteInfo:{},
    proposals:[],
    contract_address:"0xD337C7ee04D96F6fd4b2c8a12f0793aFf4e3f8D7"
  },
  getters:{
    account:(state)=> state.account,
    voteInfo:(state)=> state.voteInfo,
    proposals:(state)=> state.proposals,
  },
  mutations:{
    setAccount(state, account) {
      state.account = account;
    },
    setError(state, error) {
      state.error = error;
    },
    setProposals(state, proposals) {
      state.proposals = proposals;
    },
    setVoteInfo(state, voteInfo) {
      state.voteInfo = voteInfo;
    },
  },
  actions:{
    async connect({ commit, dispatch }, connect) {
      try {
        const { ethereum } = window;
        if (!ethereum) {
          commit("setError", "Metamask not installed!");
          return;
        }
        if (!(await dispatch("checkIfConnected")) && connect) {
          await dispatch("requestAccess");
        }
        await dispatch("checkNetwork")
      } catch (error) {
        console.log(error);
        commit("setError", "Account request refused.");
      }
    },
    async checkIfConnected({ commit }) {
      const { ethereum } = window;
      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (accounts.length !== 0) {
        commit("setAccount", accounts[0]);
        return 1;
      } else {
        return 0;
      }
    },
    async checkNetwork({ commit, dispatch }) {
      const { ethereum } = window;
      let chainId = await ethereum.request({ method: "eth_chainId" });
      const rinkebyChainId = "0x4";
      if (chainId !== rinkebyChainId) {
        if (!(await dispatch("switchNetwork"))) {
          commit(
            "setError",
            "You are not connected to the Rinkeby Test Network!"
          );
        }
      }
    },
    async switchNetwork() {
      const { ethereum } = window;
      try {
        await ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x3" }],
        });
        return 1;
      } catch (switchError) {
        return 0;
      }
    },
    async requestAccess({ commit }) {
      const { ethereum } = window;
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      commit("setAccount", accounts[0]);
    },
    async getContract({ state }) {
      try {
        const { ethereum } = window;
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          state.contract_address,
          Vote.abi,
          signer
        );
        return connectedContract;
      } catch (error) {
        console.log(error);
        console.log("connected contract not found");
        return null;
      }
    },
    async vote({dispatch},index){
      try{
        const connectedContract = await dispatch("getContract");
        await connectedContract.vote(index);
        return {
          isError:false,
        }
      }catch (error) {
        return {
          isError:true,
          msg:"you already voted"
        }
      }
    },
    async voteInfo({dispatch,commit,state}){
      try{
        const connectedContract = await dispatch("getContract");
        const charactersTxn = await connectedContract.voters(state.account);
        const voteInfo = {
          vote:charactersTxn.vote.toNumber(),
          voted:charactersTxn.voted
        }
        commit("setVoteInfo",voteInfo)
      }catch (error) {
        console.log(error);
      }
    },
    async getProposals({commit,dispatch}){
      try{
        const connectedContract = await dispatch("getContract");
        const charactersTxn = await connectedContract.getInfoProposals();
        const proposals = charactersTxn.map((characterData) =>
          transformProposalData(characterData)
        );
        commit("setProposals",proposals)
      }catch (error) {
        console.log(error);
      }
    },
    async addProposal({dispatch},proposal){
       try {
        const connectedContract = await dispatch("getContract");
        const mintTxn = await connectedContract.addProposal(proposal);
        await mintTxn.wait();
      } catch (error) {
        throw new Error(error.message)
      }
    }
  }
})
