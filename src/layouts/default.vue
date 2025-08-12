<template>
  <v-main class="">
    <router-view />
  </v-main>
   <Header @toggle-sidebar="drawer = !drawer" />
   <categories-sidebar v-if="drawer && layoutComponent"  />
   <fitur-sidebar v-if="drawer && layoutDashboard"  />
  <!-- <AppFooter /> -->
</template>

<script>
  export default {
    setup() {
    const route = useRoute()
    return { route }
  },
  name: "Sidebar",
  data() {
    return {
      drawer: true,
    };
  },
  computed: {
    layoutComponent() {
      console.log("Current route name:", this.$route.name);
      return this.$route.name !== '/' ? false : true;
    },
    layoutDashboard() {
      console.log("Current route name:", this.$route.name);
      return this.$route.name.startsWith('/dashboard') ? true : false;
    }
  },
  mounted() {
    console.log("NoSidebarLayout active");
  },
};
</script>
