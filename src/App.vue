<script setup>
import { RouterView } from 'vue-router'
import GlobalSettings from './components/GlobalSettings.vue'
import { ConfigProvider } from 'ant-design-vue'
</script>

<template>
  <div class="app-root">
    <ConfigProvider :theme="{ token: { colorPrimary: 'var(--primary-color)', borderRadius: 8 } }">
      <div class="app-container">
        <GlobalSettings />
        <RouterView />
      </div>
    </ConfigProvider>
  </div>
</template>

<style>
.app-root {
  width: 100%;
  min-height: 100vh;
  background-color: var(--bg-base);
  transition: var(--transition-background);
}

.app-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
  background-color: var(--bg-base);
  transition: var(--transition-background);
}
</style>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
