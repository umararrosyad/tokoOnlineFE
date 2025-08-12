<template>
  <v-container>
    <v-btn icon @click="$router.back()" class="mb-4">
      <v-icon>mdi-arrow-left</v-icon>
    </v-btn>
    <h2>Keranjang Belanja</h2>

    <v-row>
      <v-col cols="12" v-for="item in cartItems" :key="item.product.id">
        <v-card outlined class="pa-3 d-flex align-center">
          <v-checkbox
            v-model="item.selected"
            class="ma-0 mr-3"
            @change="onSelectionChange"
            aria-label="Pilih produk"
            dense
          />

          <v-img
            :src="item.product.image || 'https://via.placeholder.com/100'"
            max-width="100"
            max-height="100"
            contain
            class="mr-4"
          />

          <div class="flex-grow-1">
            <div class="text-subtitle-1 font-weight-medium">
              {{ item.product.name }}
            </div>
            <div class="text-body-2 text-primary mb-1">
              Rp {{ item.product.price.toLocaleString() }}
            </div>

            <v-text-field
              v-model.number="item.quantity"
              type="number"
              min="1"
              :max="item.product.stock"
              label="Jumlah"
              style="max-width: 100px"
              @change="updateQuantity(item)"
              dense
              hide-details
            />

            <div class="mt-1">
              Subtotal: Rp
              {{ (item.product.price * item.quantity).toLocaleString() }}
            </div>
          </div>

          <v-btn color="red" text @click="removeFromCart(item.product.id)">
            <v-icon left>mdi-delete</v-icon> Hapus
          </v-btn>
        </v-card>
      </v-col>
    </v-row>

    <v-divider class="my-4" />

    <v-row v-if="cartItems.length > 0">
      <v-col cols="12" v-for="item in cartItems" :key="item.product.id">
        <!-- kartu produk seperti biasa -->
      </v-col>
    </v-row>

    <div v-else class="text-center my-12 text-subtitle-1 grey--text">
      Keranjang kosong
    </div>

    <!-- Total dan tombol Checkout hanya muncul jika cartItems tidak kosong -->
    <div
      v-if="cartItems.length > 0"
      class="d-flex justify-end align-center mt-n6"
    >
      <div class="mr-6 text-h6">
        Total: Rp {{ selectedTotalPrice.toLocaleString() }}
      </div>
      <v-btn
        color="success"
        :disabled="selectedCartItems.length === 0"
        @click="checkout"
      >
        Checkout
      </v-btn>
    </div>
  </v-container>
</template>

<script>
import api from "@/plugins/axios"; // axios instance
import { useMainStore } from "@/stores/app";
import { mapState, mapActions } from "pinia";

export default {
  name: "CartPage",
  data() {
    return {
      cartItems: [],
      loading: false,
    };
  },
  computed: {
    selectedCartItems() {
      return this.cartItems.filter((item) => item.selected);
    },
    selectedTotalPrice() {
      return this.selectedCartItems.reduce(
        (sum, item) => sum + item.products.price * item.quantity,
        0
      );
    },
    ...mapState(useMainStore, [
      "cartCount",
      "pendingOrders",
      "isLoggedIn",
      "user",
    ]),
  },
  async created() {
    await this.fetchCart();
  },
  methods: {
    ...mapActions(useMainStore, [
      "setUser",
      "clearUser",
      "newCartCount",
      "newPendingOrders",
    ]),
    async fetchCart() {
      try {
        this.loading = true;
        const userId = this.user?.id; // atau Pinia store
        if (!userId) {
          alert("Harap login terlebih dahulu.");
          return;
        }

        const { data } = await api.get(`/cart/${userId}`);
        // API mengembalikan data dengan relasi products(*)
        this.cartItems = data.map((c) => ({
          ...c,
          product: c.products, // supaya mudah diakses di template
          selected: false,
        }));
      } catch (err) {
        console.error("Gagal mengambil cart:", err);
      } finally {
        this.loading = false;
      }
    },
    async getCartCountFromAPI() {
      try {
        const userId = this.user?.id;
        if (!userId) return;

        const { data } = await api.get(`/cart/count/${userId}`);
        console.log("Cart count:", data.cart_count);
        this.newCartCount(data.cart_count);
      } catch (err) {
        console.error("Gagal mengambil jumlah cart:", err);
      }
    },
    async getPendingOrdersFromAPI() {
      try {
        const userId = this.user?.id;
        if (!userId) return;

        const { data } = await api.get(`/orders/pending-count/${userId}`);
        this.newPendingOrders(data.pending_count);
      } catch (err) {
        console.error("Gagal mengambil pending orders:", err);
      }
    },

    async updateQuantity(item) {
      if (item.quantity < 1) item.quantity = 1;
      if (item.quantity > item.product.stock)
        item.quantity = item.product.stock;

      try {
        await api.put(`/cart/${item.user_id}/${item.product.id}`, {
          quantity: item.quantity,
        });
      } catch (err) {
        console.error("Gagal update quantity:", err);
      }
    },

    async removeFromCart(productId) {
      try {
        const userId = this.user?.id;
        await api.delete(`/cart/${userId}/${productId}`);
        this.cartItems = this.cartItems.filter(
          (item) => item.product.id !== productId
        );
        this.getCartCountFromAPI(); // update jumlah cart di Pinia store
        alert("Produk berhasil dihapus dari keranjang.");
      } catch (err) {
        console.error("Gagal hapus cart:", err);
      }
    },

    async checkout() {
      try {
        const userId = this.user?.id;
        if (!userId) {
          alert("Harap login terlebih dahulu.");
          return;
        }

        const selectedItems = this.selectedCartItems.map((i) => ({
          product_id: i.product.id,
          quantity: i.quantity,
        }));

        if (selectedItems.length === 0) {
          alert("Pilih produk terlebih dahulu.");
          return;
        }

        await api.post(`/orders`, {
          user_id: userId,
          items: selectedItems,
        });

        alert("Checkout berhasil!");
        await this.fetchCart();
        this.getCartCountFromAPI(); // update jumlah cart di Pinia store
        this.getPendingOrdersFromAPI(); // update jumlah pending orders di Pinia store
      } catch (err) {
        console.error("Gagal checkout:", err);
      }
    },

    onSelectionChange() {
      // opsional
    },
  },
};
</script>

<style scoped>
/* Opsional styling */
</style>
