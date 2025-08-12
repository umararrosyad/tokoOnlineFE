<template>
  <v-container>
    <v-row>
      <v-col
        v-for="product in products"
        :key="product.id"
        cols="12"
        sm="6"
        md="4"
        lg="3"
        v-if="products.length > 0"
      >
        <v-card @click.stop="$router.push(`/products/${product.id}`)" class="mb-4">
          <v-img
            :src="product.image || defaultImage"
            height="180"
            cover
            alt="Product Image"
          ></v-img>
          <v-card-title>{{ product.name }}</v-card-title>
          <v-card-subtitle>{{ formatPrice(product.price) }}</v-card-subtitle>
          <v-card-text>
            <div v-if="product.description" class="text-truncate">
              {{ product.description }}
            </div>
          </v-card-text>
          <v-card-actions>
            <v-btn  v-if="isLoggedIn" color="primary" @click.stop="addToCart(product)">
              <v-icon left>mdi-cart-plus</v-icon>
              Tambah ke Keranjang
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col cols="12" v-else>
        <v-alert type="info" text>
          Tidak ada produk yang ditemukan.
        </v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import api from "@/plugins/axios";
import { useFilterStore } from "@/stores/filterStore";
import { useMainStore } from "@/stores/app";

import { mapState, mapActions } from "pinia";
export default {
  name: "ProductsList",
  data() {
    return {
      defaultImage: "https://via.placeholder.com/300x180?text=No+Image",
      searchName: "",
      filterStore: useFilterStore(),
      selectedCategoryId: null,
      products: [
        {
          id: 1,
          name: "Produk A",
          description: "Deskripsi singkat produk A",
          price: 120000,
          image: "https://picsum.photos/300/180?random=1",
        },
        {
          id: 2,
          name: "Produk B",
          description: "Deskripsi singkat produk B",
          price: 85000,
          image: "https://picsum.photos/300/180?random=2",
        },
        {
          id: 3,
          name: "Produk C",
          description: "Deskripsi singkat produk C",
          price: 99000,
          image: "https://picsum.photos/300/180?random=3",
        },
        {
          id: 4,
          name: "Produk D",
          description: "Deskripsi singkat produk D",
          price: 150000,
          image: "https://picsum.photos/300/180?random=4",
        },
      ],
    };
  },
  computed: {
    ...mapState(useMainStore, ["cartCount", "pendingOrders", "isLoggedIn","user",]),
  },
  mounted() {
    this.getProducts();
  },
  methods: {
     ...mapActions(useMainStore, [
      "setUser",
      "clearUser",
      "newCartCount",
      "newPendingOrders",
    ]),
    async getProducts() {
      try {
        const params = {};

        if (this.filterStore.searchName) {
          params.name = this.filterStore.searchName;
        }
        if (this.filterStore.selectedCategoryId) {
          params.category_id = this.filterStore.selectedCategoryId;
        }

        const response = await api.get("/products", { params });
        this.products = response.data;
      } catch (error) {
        console.error(error);
        alert("Gagal memuat produk");
      }
    },
    formatPrice(value) {
      return value.toLocaleString("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      });
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
  },
  watch: {
    "filterStore.searchName"(newQuestion, oldQuestion) {
      this.getProducts();
    },
    "filterStore.selectedCategoryId"(newQuestion, oldQuestion) {
      this.getProducts();
    },
  },
};
</script>

<style scoped>
.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
