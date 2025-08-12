<template>
  <v-container>
    <v-btn text @click="goBack" class="mb-4"> ← Kembali </v-btn>
    <v-row>
      <v-col
        cols="12"
        md="6"
        class="d-flex justify-center align-items-start"
        style="height: 50%"
      >
        <v-img :src="product.image" aspect-ratio="1" cover class="h-50" />
      </v-col>

      <v-col cols="12" md="6">
        <h2>{{ product.name }}</h2>
        <p>{{ product.description }}</p>
        <h3 class="text-h5 text-primary">
          Rp {{ product.price.toLocaleString() }}
        </h3>
        <p>Stok: {{ product.stock }}</p>

        <v-text-field
          v-model="quantity"
          type="number"
          label="Jumlah"
          min="1"
          :max="product.stock"
          class="my-4"
          style="max-width: 100px"
        ></v-text-field>

        <v-btn
          color="primary"
          @click="addToCart(product)"
          block
          :disabled="quantity < 1 || quantity > product.stock"
          class="mr-3 mb-2"
        >
          Tambah ke Keranjang
        </v-btn>

        <v-btn
          color="success"
          block
          @click="buyNow"
          :disabled="quantity < 1 || quantity > product.stock"
        >
          Beli Sekarang
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import api from "@/plugins/axios"; // pastikan ini sesuai path axios.js kamu
import { useMainStore } from "@/stores/app";

import { mapState, mapActions } from "pinia";
export default {
  name: "ProductDetail",
  layout: "NoSidebarLayout",
  data() {
    return {
      product: {
        id: null,
        name: "",
        description: "",
        price: 0,
        stock: 0,
        image: "", // awalnya kosong
      }, // awalnya null karena akan di-fetch
      quantity: 1,
      loading: false,
    };
  },
  async created() {
    await this.fetchProduct();
  },
  computed: {
    ...mapState(useMainStore, [
      "cartCount",
      "pendingOrders",
      "isLoggedIn",
      "user",
    ]),
  },
  methods: {
    ...mapActions(useMainStore, [
      "setUser",
      "clearUser",
      "newCartCount",
      "newPendingOrders",
    ]),
    goBack() {
      this.$router.back();
    },
    async fetchProduct() {
      try {
        this.loading = true;
        const id = this.$route.params.id;

        const { data } = await api.get(`/products/${id}`);
        this.product = data;
        console.log("Fetched product:", this.product);
      } catch (err) {
        console.error("Gagal mengambil produk:", err);
      } finally {
        this.loading = false;
      }
    },
    addToCart(product) {
      if (!this.isLoggedIn) {
        alert("Silakan login terlebih dahulu untuk menambahkan ke keranjang.");
        return;
      }

      api
        .post("/cart", {
          user_id: this.user.id,
          product_id: product.id,
          quantity: 1,
        })
        .then(() => {
          this.getCartCountFromAPI(); // ambil jumlah terbaru dari Pinia store
          alert(`Produk "${product.name}" berhasil ditambahkan ke keranjang`);
        })
        .catch((err) => {
          console.error("Gagal menambahkan ke keranjang:", err);
          alert("Gagal menambahkan produk ke keranjang.");
        });
    },
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
    async buyNow() {
      if (!this.isLoggedIn) {
        alert("Silakan login terlebih dahulu untuk membeli produk.");
        return;
      }

      if (this.quantity < 1 || this.quantity > this.product.stock) {
        alert("Jumlah tidak valid.");
        return;
      }

      try {
        const userId = this.user.id;
        // Buat order dengan satu item ini
        await api.post("/orders", {
          user_id: userId,
          items: [
            {
              product_id: this.product.id,
              quantity: this.quantity,
            },
          ],
        });

        alert(`Pembelian berhasil!`);

        // Update jumlah pending orders di store
        await this.getPendingOrdersFromAPI();

        // Kalau mau juga update cart count, panggil getCartCountFromAPI()
        await this.getCartCountFromAPI();
      } catch (err) {
        console.error("Gagal melakukan pembelian:", err);
        alert("Gagal melakukan pembelian.");
      }
    },
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
};
</script>
