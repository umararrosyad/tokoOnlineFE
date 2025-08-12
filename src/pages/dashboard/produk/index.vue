<template>
  <v-container>
    <v-row class="mb-4" justify="space-between" align="center">
      <v-col cols="6">
        <h2>Daftar Produk</h2>
      </v-col>
      <v-col cols="6" class="text-right">
        <v-btn color="primary" @click="openForm()">Tambah Produk</v-btn>
      </v-col>
    </v-row>

    <v-data-table
      :headers="headers"
      :items="products"
      :loading="loading"
      class="elevation-1"
      item-key="id"
      disable-sort
    >
      <template v-slot:item.image="{ item }">
        <v-img
          :src="
            item.image || 'https://via.placeholder.com/100x70?text=No+Image'
          "
          min-width="100"
          max-height="50"
          contain
        />
      </template>

      <template v-slot:item.actions="{ item }">
        <v-btn
          icon
          color="blue"
          class="mr-2"
          density="compact"
          @click="openForm(item)"
        >
          <v-icon size="x-small">mdi-pencil</v-icon>
        </v-btn>
        <v-btn icon color="red" density="compact" @click="confirmDelete(item)">
          <v-icon size="x-small">mdi-delete</v-icon>
        </v-btn>
      </template>
    </v-data-table>

    <!-- Dialog Form Tambah/Edit Produk -->

    <v-dialog v-model="formDialog" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">{{
            isEdit ? "Edit Produk" : "Tambah Produk"
          }}</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="formValid">
            <v-text-field
              v-model="form.name"
              label="Nama Produk"
              :rules="[(v) => !!v || 'Nama wajib diisi']"
              required
            />
            
            <v-select
              v-model="form.category_id"
              :items="simpleCategories"
              item-title="name"
              item-value="id"
              label="Kategori Produk"
              :rules="[v => !!v || 'Kategori wajib dipilih']"
              required
              clearable
              class="mb-4"
            />

            <v-textarea
              v-model="form.description"
              label="Deskripsi"
              auto-grow
              rows="2"
            />
            <v-text-field
              v-model.number="form.price"
              label="Harga"
              prefix="Rp"
              type="number"
              :rules="[(v) => v > 0 || 'Harga harus lebih besar dari 0']"
              required
            />
            <v-text-field
              v-model.number="form.stock"
              label="Stok"
              type="number"
              :rules="[(v) => v >= 0 || 'Stok harus nol atau lebih']"
              required
            />

            <!-- File input untuk upload gambar -->
            <v-file-input
              label="Upload Gambar Produk"
              accept="image/*"
              prepend-icon="mdi-camera"
              v-model="form.file"
              :rules="[fileRule]"
              :counter="false"
              show-size
              clearable
            />

            <!-- Preview gambar jika ada file baru -->
            <v-img
              v-if="form.filePreview"
              :src="form.filePreview"
              max-width="200"
              max-height="150"
              contain
              class="my-3"
            />

            <!-- Preview gambar lama jika edit dan tidak ganti file -->
            <v-img
              v-else-if="form.image"
              :src="form.image"
              max-width="200"
              max-height="150"
              contain
              class="my-3"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="closeForm">Batal</v-btn>
          <v-btn color="primary" :disabled="!formValid" @click="saveProduct">
            Simpan
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog Konfirmasi Hapus -->
    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="headline">Konfirmasi Hapus</v-card-title>
        <v-card-text>
          Apakah anda yakin ingin menghapus produk
          <strong>{{ productToDelete?.name }}</strong
          >?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="deleteDialog = false">Batal</v-btn>
          <v-btn color="red" @click="deleteProduct">Hapus</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import api from "@/plugins/axios";

export default {
  name: "ProductsPage",
  data() {
    return {
      products: [],
      loading: false,
      headers: [
        { text: "Gambar", value: "image", sortable: false },
        { text: "Nama Produk", value: "name" },
        { text: "Deskripsi", value: "description" },
        { text: "Harga", value: "price" },
        { text: "Stok", value: "stock" },
        { text: "Aksi", value: "actions", sortable: false },
      ],
      formDialog: false,
      deleteDialog: false,
      formValid: false,
      isEdit: false,
      form: {
        id: null,
        name: "",
        description: "",
        price: 0,
        stock: 0,
        image: "", // url gambar lama (edit)
        file: null, // file baru untuk upload
        filePreview: null, // preview gambar dari file
      },
      productToDelete: null,
    };
  },
  mounted() {
    this.fetchProducts();
    this.fetchCategories();
  },
  computed: {
    simpleCategories() {
      return this.categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
      }));
    },
  },
  methods: {
    async fetchProducts() {
      try {
        this.loading = true;
        const res = await api.get("/products");
        this.products = res.data;
      } catch (error) {
        console.error("Gagal mengambil produk:", error);
        alert("Gagal memuat produk.");
      } finally {
        this.loading = false;
      }
    },
    async fetchCategories() {
      try {
        const res = await api.get("/categories");
        this.categories = res.data;
      } catch (error) {
        console.error("Gagal mengambil kategori:", error);
        alert("Gagal memuat kategori.");
      }
    },

    openForm(product = null) {
      if (product) {
        this.isEdit = true;
        this.form = {
          id: product.id,
          name: product.name,
          category_id: product.category_id || null,
          description: product.description,
          price: product.price,
          stock: product.stock,
          image: product.image,
          file: null,
          filePreview: null,
        };
      } else {
        this.isEdit = false;
        this.form = {
          id: null,
          name: "",
          category_id: null,
          description: "",
          price: 0,
          stock: 0,
          image: "",
          file: null,
          filePreview: null,
        };
      }
      this.formDialog = true;
    },

    closeForm() {
      this.formDialog = false;
    },

    fileRule(file) {
      if (!file) return true;
      const isImage = file.type.startsWith("image/");
      return isImage || "File harus berupa gambar";
    },

    async saveProduct() {
      if (!this.$refs.form.validate()) return;

      try {
        const formData = new FormData();
        formData.append("name", this.form.name);
        formData.append("category_id", this.form.category_id);
        formData.append("description", this.form.description);
        formData.append("price", this.form.price);
        formData.append("stock", this.form.stock);

        if (this.form.file) {
          formData.append("file", this.form.file);
        }

        if (this.isEdit) {
          await api.put(`/products/${this.form.id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          alert("Produk berhasil diperbarui");
        } else {
          await api.post("/products", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          alert("Produk berhasil ditambahkan");
        }
        this.formDialog = false;
        this.fetchProducts();
      } catch (error) {
        console.error("Gagal menyimpan produk:", error);
        alert("Gagal menyimpan produk");
      }
    },

    confirmDelete(product) {
      this.productToDelete = product;
      this.deleteDialog = true;
    },

    async deleteProduct() {
      try {
        await api.delete(`/products/${this.productToDelete.id}`);
        alert(`Produk "${this.productToDelete.name}" berhasil dihapus`);
        this.deleteDialog = false;
        this.fetchProducts();
      } catch (error) {
        console.error("Gagal menghapus produk:", error);
        alert("Gagal menghapus produk");
      }
    },
  },
  watch: {
    "form.file"(newFile) {
      if (!newFile) {
        this.form.filePreview = null;
        return;
      }
      // Preview image untuk file baru yang dipilih
      this.form.filePreview = URL.createObjectURL(newFile);
    },
  },
};
</script>
