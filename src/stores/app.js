// Utilities
import { defineStore } from 'pinia'

export const useMainStore = defineStore("main", {
  state: () => ({
    user: null,
    cartCount: 0,
    pendingOrders: 0,
  }),
  getters: {
    isLoggedIn: (state) => !!state.user,
  },
  actions: {
    setUser(userData) {
      this.user = userData;
    },
    clearUser() {
      this.user = null;
    },
    newCartCount(count) {
      this.cartCount = count;
    },
    newPendingOrders(count) {
      this.pendingOrders = count;
    },
  },
  persist: true, // supaya data tetap ada setelah refresh
});