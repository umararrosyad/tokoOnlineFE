<template>
  <v-navigation-drawer app permanent class="pa-3" >
    <v-list nav>
      <v-list-item>
        <v-list-item-content>
          <span class="text-h6">KATEGORI </span>
        </v-list-item-content>
      </v-list-item>

      <v-divider class="my-2" />
      <v-list-item
        link
        @click="clearCategory"
        :active="!selectedCategory"
        rounded
      >
        <v-list-item-content>
          <v-list-item-title>Semua Kategori</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item
        v-for="category in categories"
        :key="category.id"
        link
        @click="selectCategory(category)"
        :active="selectedCategory && selectedCategory.id === category.id"
        rounded
      >
        <v-list-item-content>
          <v-list-item-title>{{ category.name }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script>

import api from "@/plugins/axios";
import { useFilterStore } from "@/stores/filterStore"; 
export default {
  name: "CategoriesSidebar",
  data() {
    return {
      categories: [],
      selectedCategory: null,
      filterStore: useFilterStore(),
    };
  },
   mounted() {
    this.fetchCategories();
  },
  methods: {
    async fetchCategories() {
      try {
        const { data } = await api.get("/categories"); 
        this.categories = data; // pastikan API balikin array kategori
      } catch (error) {
        if (error.response) {
          console.error("Server Error:", error.response.data);
        } else if (error.request) {
          console.error("No Response from server");
        } else {
          console.error("Error:", error.message);
        }
      }
    },
    selectCategory(category) {
      this.selectedCategory = category;
        this.filterStore.setCategoryId(category.id);
    },
    clearCategory() {
      this.selectedCategory = null;
      this.filterStore.setCategoryId(null);
    },
  },
};
</script>

<style scoped>
.v-list-item--active {
  background-color: #1976d2 !important;
  color: white !important;
}
</style>
