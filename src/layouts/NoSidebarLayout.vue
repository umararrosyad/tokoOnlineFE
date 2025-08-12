<template>
  <v-main>
    <router-view />
  </v-main>
  <Header />
  <!-- <categories-sidebar @category-selected="onCategorySelected" /> -->
  <!-- <AppFooter /> -->
</template>

<script>
export default {
  name: "NoSidebarLayout",
  mounted() {
    console.log("NoSidebarLayout active");
  },
};
</script>
