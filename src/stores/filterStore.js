import { defineStore } from "pinia";

export const useFilterStore = defineStore("filter", {
  state: () => ({
    searchName: "",
    selectedCategoryId: null,
  }),
  actions: {
    setSearchName(name) {
      this.searchName = name;
    },
    setCategoryId(id) {
      this.selectedCategoryId = id;
    },
  },
});
