<template>
  <v-container>
    <v-row class="mb-4" justify="space-between" align="center">
      <v-col cols="6">
        <h2>Daftar Kategori</h2>
      </v-col>
      <v-col cols="6" class="text-right">
        <v-btn color="primary" @click="openForm()">Tambah Kategori</v-btn>
      </v-col>
    </v-row>

    <v-data-table
      :headers="headers"
      :items="categories"
      :loading="loading"
      item-key="id"
      class="elevation-1"
    >
      <template v-slot:item.actions="{ item }">
        <v-btn icon color="blue" @click="openForm(item)">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn icon color="red" @click="confirmDelete(item)">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </template>
    </v-data-table>

    <!-- Dialog Form Tambah/Edit -->
    <v-dialog v-model="formDialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">{{ isEdit ? "Edit Kategori" : "Tambah Kategori" }}</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="formValid">
            <v-text-field
              v-model="form.name"
              label="Nama Kategori"
              :rules="[v => !!v || 'Nama wajib diisi']"
              required
            />
            <v-textarea
              v-model="form.description"
              label="Deskripsi"
              auto-grow
              rows="2"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="closeForm">Batal</v-btn>
          <v-btn color="primary" :disabled="!formValid" @click="saveCategory">
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
          Apakah Anda yakin ingin menghapus kategori
          <strong>{{ categoryToDelete?.name }}</strong>?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="deleteDialog = false">Batal</v-btn>
          <v-btn color="red" @click="deleteCategory">Hapus</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import api from "@/plugins/axios";

export default {
  name: "CategoryPage",
  data() {
    return {
      categories: [],
      loading: false,
      headers: [
        { text: "Nama", value: "name" },
        { text: "Deskripsi", value: "description" },
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
      },
      categoryToDelete: null,
    };
  },
  mounted() {
    this.fetchCategories();
  },
  methods: {
    async fetchCategories() {
      this.loading = true;
      try {
        const res = await api.get("/categories");
        this.categories = res.data;
      } catch (err) {
        console.error("Gagal memuat kategori:", err);
        alert("Gagal memuat kategori");
      } finally {
        this.loading = false;
      }
    },
    openForm(category = null) {
      if (category) {
        this.isEdit = true;
        this.form = { ...category };
      } else {
        this.isEdit = false;
        this.form = { id: null, name: "", description: "" };
      }
      this.formDialog = true;
    },
    closeForm() {
      this.formDialog = false;
    },
    async saveCategory() {
      if (!this.$refs.form.validate()) return;

      try {
        if (this.isEdit) {
          await api.put(`/categories/${this.form.id}`, this.form);
          alert("Kategori berhasil diperbarui");
        } else {
          await api.post("/categories", this.form);
          alert("Kategori berhasil ditambahkan");
        }
        this.formDialog = false;
        this.fetchCategories();
      } catch (err) {
        console.error("Gagal menyimpan kategori:", err);
        alert("Gagal menyimpan kategori");
      }
    },
    confirmDelete(category) {
      this.categoryToDelete = category;
      this.deleteDialog = true;
    },
    async deleteCategory() {
      try {
        await api.delete(`/categories/${this.categoryToDelete.id}`);
        alert(`Kategori "${this.categoryToDelete.name}" berhasil dihapus`);
        this.deleteDialog = false;
        this.fetchCategories();
      } catch (err) {
        console.error("Gagal menghapus kategori:", err);
        alert("Gagal menghapus kategori");
      }
    },
  },
};
</script>
