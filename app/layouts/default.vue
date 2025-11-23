<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Sidebar -->
    <Sidebar :is-open="sidebarOpen" @close="sidebarOpen = false" />

    <!-- Main Content -->
    <div class="lg:pl-64">
      <!-- Header -->
      <Header @toggle-sidebar="sidebarOpen = !sidebarOpen" />

      <!-- Page Content -->
      <main class="p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const sidebarOpen = ref(false);
</script>
