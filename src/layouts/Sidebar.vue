<template>
  <v-main class="bg-grey lighten-4">
    <router-view />
  </v-main>
<Header @toggle-sidebar="drawer = !drawer" />
   <categories-sidebar v-if="drawer" @category-selected="onCategorySelected" />
  <!-- <AppFooter /> -->
</template>

<script>
  export default {
  name: "Sidebar",
  data() {
    return {
      drawer: false,
    };
  },
  mounted() {
    console.log("NoSidebarLayout active");
  },
};
</script>
