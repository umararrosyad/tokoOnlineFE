<template>
  <v-container class="py-4">
    <h2 class="mb-4">Riwayat Pembelian</h2>

    <v-row v-if="orders.length">
      <v-col cols="12" v-for="order in orders" :key="order.id">
        <v-card class="pa-3 mb-3" outlined>
          <!-- Info Order -->
          <!-- Info Order -->
          <div class="d-flex justify-space-between align-center mb-2">
            <div>
              <strong>Order #{{ order.id }}</strong>
              <div class="text-grey text-body-2">
                {{ formatDate(order.created_at) }}
              </div>
            </div>

            <div class="d-flex align-center">
              <v-chip
                :color="
                  order.status === 'Selesai'
                    ? 'green'
                    : order.status === 'Batal'
                    ? 'red'
                    : 'orange'
                "
                text-color="white"
                small
                class="mr-3"
              >
                {{ order.status || "Proses" }}
              </v-chip>
            </div>
          </div>

          <!-- List Produk -->
          <v-divider class="mb-2"></v-divider>
          <div
            v-for="(item, idx) in order.items"
            :key="idx"
            class="d-flex mb-2"
          >
            <v-img
              :src="
                item.image ||
                'https://via.placeholder.com/150x150?text=No+Image'
              "
              max-width="60"
              max-height="60"
              class="rounded mr-3"
            />
            <div class="flex-grow-1">
              <div class="font-weight-medium">
                {{ item.product_name || item.name }}
              </div>
              <div class="text-grey text-body-2">
                Qty: {{ item.quantity || item.qty }}
              </div>
            </div>
            <div class="font-weight-bold">
              Rp
              {{
                formatPrice(
                  (item.price || 0) * (item.quantity || item.qty || 1)
                )
              }}
            </div>
          </div>

          <!-- Total Order -->
          <v-divider class="mt-2 mb-2"></v-divider>
          <div
            class="d-flex justify-space-between align-center font-weight-bold"
          >
            <div>
              <!-- Tombol hanya tampil jika status belum selesai atau batal -->
              <template
                v-if="order.status !== 'Selesai' && order.status !== 'Batal'"
              >
                <v-btn
                  small
                  color="green"
                  class="mr-2"
                  @click="updateOrderStatus(order.id, 'Selesai')"
                >
                  Selesaikan
                </v-btn>
                <v-btn
                  small
                  color="red"
                  @click="updateOrderStatus(order.id, 'Batal')"
                >
                  Batalkan
                </v-btn>
              </template>
            </div>

            <div>
              Total: Rp {{ formatPrice(order.total_amount || order.total) }}
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <div v-else>
      <p>Belum ada riwayat pembelian.</p>
    </div>
  </v-container>
</template>

<script>
import { useMainStore } from "@/stores/app";
import { mapState, mapActions } from "pinia";
import api from "@/plugins/axios";

export default {
  name: "OrderHistory",
  data() {
    return {
      orders: [],
      loading: false,
      error: null,
    };
  },
  computed: {
    ...mapState(useMainStore, ["user", "isLoggedIn", "pendingOrders", "cartCount"]),
  },
  methods: {
    ...mapActions(useMainStore, [
      "setUser",
      "clearUser",
      "newCartCount",
      "newPendingOrders",
    ]),
    formatPrice(value) {
      return value.toLocaleString("id-ID");
    },
    formatDate(dateStr) {
      const d = new Date(dateStr);
      return d.toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
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
    async fetchOrders() {
      if (!this.isLoggedIn || !this.user) {
        this.orders = [];
        return;
      }
      this.loading = true;
      this.error = null;
      try {
        const res = await api.get(`/orders/user/${this.user.id}`);
        this.orders = res.data || [];
      } catch (err) {
        console.error("Gagal mengambil orders user:", err);
        this.error = "Gagal mengambil data order.";
      } finally {
        this.loading = false;
      }
    },
    async updateOrderStatus(orderId, status) {
      try {
        await api.put(`/orders/${orderId}/status`, { status });
        // Update local state supaya UI langsung refresh
        const index = this.orders.findIndex((o) => o.id === orderId);
        if (index !== -1) {
          this.orders[index].status = status;
        }
        alert(`Order berhasil diubah menjadi ${status}`);
        this.fetchOrders(); // refresh daftar order
        this.getPendingOrdersFromAPI(); // update jumlah pending orders
      } catch (err) {
        console.error("Gagal update status order:", err);
        alert("Gagal memperbarui status order.");
      }
    },
  },
  mounted() {
    this.fetchOrders();
  },
};
</script>
