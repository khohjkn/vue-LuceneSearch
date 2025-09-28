<script setup lang="ts">
import Search from './components/Search.vue';
</script>

<template>
  <div id="app">
    <div class="header">
      <h1>文献检索系统</h1>
    </div>
    <div class="main-content">
      <Search />
    </div>
  </div>
</template>
<style>
#app {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  width: 100%;
  height: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.header {
  width: 100%;
  text-align: center;
  padding: 25px 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 0;
  background-color: white;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header h1 {
  margin: 0;
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(90deg, #3498db, #2c3e50);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  letter-spacing: 1px;
}

.main-content {
  width: 90%;
  max-width: 1200px;
  flex: 1;
  display: flex;
  justify-content: center;
  padding: 30px 20px;
  box-sizing: border-box;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header h1 {
    font-size: 2rem;
  }
  
  .main-content {
    width: 95%;
    padding: 20px 10px;
  }
}
</style>