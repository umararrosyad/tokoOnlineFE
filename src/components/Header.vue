<template>
  <v-app-bar app color="primary" dark>
    <!-- Menu Button -->
    <v-toolbar-title class="mr-8">
      <v-btn icon @click="$emit('toggle-sidebar')">
        <v-icon>mdi-menu</v-icon>
      </v-btn>
    </v-toolbar-title>

    <!-- Search -->
    <v-text-field
      v-model="searchQuery"
      placeholder="Cari produk..."
      hide-details
      rounded
      density="compact"
      clearable
      variant="solo-filled"
      prepend-inner-icon="mdi-magnify"
      @click:clear="onSearch"
      @keyup.enter="onSearch"
    />

    <div class="flex-grow-1"></div>

    <!-- Account -->
    <template v-if="isLoggedIn">
      <v-menu offset-y>
        <template #activator="{ props }">
          <v-btn icon v-bind="props">
            <v-icon>mdi-account-circle</v-icon>
            <v-badge
              v-if="pendingOrders > 0"
              :content="pendingOrders"
              color="red"
              overlap
              class="cart-badge"
            />
          </v-btn>
        </template>

        <v-list>
          <v-list-item @click="$router.push('/')">
            <v-list-item-title>Home</v-list-item-title>
          </v-list-item>
          <v-list-item @click="$router.push('/dashboard/produk')">
            <v-list-item-title>Dashboard</v-list-item-title>
          </v-list-item>
          <v-list-item @click="$router.push('/orders')">
            <v-list-item-title>Riwayat Pembelian</v-list-item-title>
            <v-badge
              v-if="pendingOrders > 0"
              :content="pendingOrders"
              color="red"
              overlap
              class="cart-badge"
            />
          </v-list-item>
          <v-list-item @click="logout">
            <v-list-item-title>Logout</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </template>

    <template v-else>
      <v-btn icon @click="showAuthDialog = true">
        <v-icon>mdi-account-circle</v-icon>
      </v-btn>

      <!-- Dialog Login/Register -->
      <v-dialog v-model="showAuthDialog" max-width="400px">
        <v-card class="border-md border-white">
          <v-tabs v-model="authTab" fixed-tabs>
            <v-tab value="login">Login</v-tab>
            <v-tab value="register">Register</v-tab>
          </v-tabs>

          <v-window v-model="authTab">
            <!-- LOGIN -->
            <v-window-item value="login">
              <v-card-text>
                <v-text-field label="Email" v-model="email" type="email" />
                <v-text-field
                  label="Password"
                  v-model="password"
                  type="password"
                />
              </v-card-text>
              <v-card-actions>
                <v-btn color="primary" @click="doLogin">Login</v-btn>
                <v-spacer></v-spacer>
                <v-btn text @click="showAuthDialog = false">Batal</v-btn>
              </v-card-actions>
            </v-window-item>

            <!-- REGISTER -->
            <v-window-item value="register">
              <v-card-text>
                <v-text-field label="Nama Lengkap" v-model="regName" />
                <v-text-field label="Email" v-model="regEmail" type="email" />
                <v-text-field
                  label="No. Telepon"
                  v-model="regPhone"
                  type="tel"
                />
                <v-text-field
                  label="Password"
                  v-model="regPassword"
                  type="password"
                />
                <v-text-field
                  label="Konfirmasi Password"
                  v-model="regPasswordConfirm"
                  type="password"
                />
              </v-card-text>
              <v-card-actions>
                <v-btn color="primary" @click="doRegister">Daftar</v-btn>
                <v-spacer></v-spacer>
                <v-btn text @click="showAuthDialog = false">Batal</v-btn>
              </v-card-actions>
            </v-window-item>
          </v-window>
        </v-card>
      </v-dialog>
    </template>

    <!-- Cart -->
    <v-btn v-if="isLoggedIn" icon @click.stop="$router.push('/cart')" class="position-relative">
      <v-icon>mdi-cart</v-icon>
      <v-badge
        v-if="cartCount > 0"
        :content="cartCount"
        color="red"
        overlap
        class="cart-badge"
      />
    </v-btn>
  </v-app-bar>
</template>

<script>
import { useMainStore } from "@/stores/app";
import { useFilterStore } from "@/stores/filterStore";
// import { mapState, mapActions } from "pinia";
import { mapState, mapActions } from "pinia";
import api from "@/plugins/axios";

export default {
  name: "Header",
  data() {
    return {
      searchQuery: "",
      showAuthDialog: false,
      authTab: "login",
      filterStore: useFilterStore(),

      // Login form
      email: "",
      password: "",

      // Register form
      regName: "",
      regEmail: "",
      regPhone: "",
      regPassword: "",
      regPasswordConfirm: "",
      isLoading: false,
    };
  },
  computed: {
    ...mapState(useMainStore, ["cartCount", "pendingOrders", "isLoggedIn"]),
  },
  methods: {
    ...mapActions(useMainStore, [
      "setUser",
      "clearUser",
      "newCartCount",
      "newPendingOrders",
    ]),
    onSearch() {
      this.filterStore.setSearchName(this.searchQuery);
    },
    logout() {
      this.clearUser();
      this.clearForm();
      alert("Anda berhasil logout.");
    },
    clearForm() {
      this.email = "";
      this.password = "";
      this.regName = "";
      this.regEmail = "";
      this.regPhone = "";
      this.regPassword = "";
      this.regPasswordConfirm = "";
    },
    doLogin() {
      if (!this.email || !this.password) {
        alert("Email dan password wajib diisi!");
        return;
      }
      this.isLoading = true;
      api
        .post("/users/login", {
          email: this.email,
          password: this.password,
        })
        .then((response) => {
          const { user } = response.data;
          this.setUser(user);
          localStorage.setItem("token", user.token);
          localStorage.setItem("user", JSON.stringify(user));
          this.showAuthDialog = false;
          this.getCartCountFromAPI();
          this.getPendingOrdersFromAPI();
        })
        .catch((error) => {
          alert(error.response?.data?.error || "Login gagal!");
        })
        .finally(() => {
          this.isLoading = false;
          this.clearForm();
        });
    },
    doRegister() {
      if (
        !this.regName ||
        !this.regEmail ||
        !this.regPhone ||
        !this.regPassword
      ) {
        alert("Semua field wajib diisi!");
        return;
      }
      if (this.regPassword !== this.regPasswordConfirm) {
        alert("Password tidak sama!");
        return;
      }
      this.isLoading = true;
      api
        .post("/users", {
          name: this.regName,
          email: this.regEmail,
          phone: this.regPhone,
          password: this.regPassword,
        })
        .then((response) => {
          const { user } = response.data;
          this.setUser(user);
          localStorage.setItem("token", user.token);
          localStorage.setItem("user", JSON.stringify(user));
          this.showAuthDialog = false;
          this.getCartCountFromAPI();
          this.getPendingOrdersFromAPI();
        })
        .catch((error) => {
          alert(error.response?.data?.error || "Registrasi gagal!");
        })
        .finally(() => {
          this.isLoading = false;
          this.clearForm();
        });
    },

    // 🔹 Ambil jumlah cart dari API
    async getCartCountFromAPI() {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user) return;
        const res = await api.get(`/cart/count/${user.id}`);
        console.log("Cart count:", res.data.cart_count);
        this.newCartCount(res.data.cart_count);
      } catch (err) {
        console.error("Gagal mengambil cart count:", err);
      }
    },

    // 🔹 Ambil jumlah pending orders dari API
    async getPendingOrdersFromAPI() {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user) return;
        const res = await api.get(`/orders/pending-count/${user.id}`);
        console.log("Pending orders count:", res.data.pending_count);
        this.newPendingOrders(res.data.pending_count);
      } catch (err) {
        console.error("Gagal mengambil pending orders:", err);
      }
    },
  },
  mounted() {
    // Saat header dimuat, langsung ambil data kalau user sudah login
    if (this.isLoggedIn) {
      this.getCartCountFromAPI();
      this.getPendingOrdersFromAPI();
    }
  },
};
</script>

<style scoped>
.cart-badge {
  position: absolute;
  top: 6px;
  right: 6px;
}
</style>
