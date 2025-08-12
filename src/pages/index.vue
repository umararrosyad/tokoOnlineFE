<template>
   <!-- <categories-sidebar @category-selected="onCategorySelected" /> -->
  <products-list/>
</template>

<script setup>
// import CategoriesSidebar from '@/components/CategoriesSidebar.vue'
import ProductsList from '@/components/ProductsList.vue'
import { ref } from 'vue'

const selectedCategory = ref(null)

function onCategorySelected(category) {
  selectedCategory.value = category
}
</script>
