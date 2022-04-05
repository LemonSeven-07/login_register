import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    phoneCodeCount: 0,
    isShow: false

  },
  getters: {
    getPhoneCodeCount(state) {
      if(!state.phoneCodeCount) {
        state.phoneCodeCount = localStorage.getItem('phoneCodeCount') || 0;
      }
      return state.phoneCodeCount;
    }
  },
  mutations: {
    add(state) {
      state.phoneCodeCount ++;
      if(state.phoneCodeCount <= 3) {
        localStorage.setItem('phoneCode', state.phoneCodeCount);
      }
    },
  },
})
