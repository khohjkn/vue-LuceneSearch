<template>
  <div class="search-container">
    <!-- 搜索表单 -->
    <form @submit.prevent="search" class="search-form">
      <div class="form-group">
        <input v-model="queryStr" placeholder="输入关键词..." type="text" class="input-field" />
      </div>
      <div class="form-group">
        <input v-model="startDate" placeholder="开始日期" type="date" class="input-field" />
      </div>
      <div class="form-group">
        <input v-model="endDate" placeholder="结束日期" type="date" class="input-field" />
      </div>
      <div class="form-group">
        <select v-model="sortField" class="select-field">
          <option value="title">标题</option>
          <option value="abstract">摘要</option>
          <option value="author">作者</option>
        </select>
      </div>
      <button type="submit" class="search-btn">搜索</button>
    </form>

    <!-- 分页 -->
    <div v-if="totalCount > 0" class="pagination-container">
      <p>第 {{ page + 1 }} 页，共 {{ totalPages }} 页</p>
      <div class="pagination-buttons">
        <button @click="changePage(page - 1)" :disabled="page === 0" class="page-btn">上一页</button>
        <button @click="changePage(page + 1)" :disabled="page === totalPages - 1" class="page-btn">下一页</button>
      </div>
    </div>

    <!-- 搜索结果展示 -->
    <div v-if="results.length > 0" class="results-container">
      <ul class="results-list">
        <li v-for="(result, index) in results" :key="index" class="result-item">
          <h3 v-html="result.highlightedTitle" class="highlighted-title"></h3>
          <p v-html="result.highlightedAbstract" class="highlighted-abstract"></p>
          <p class="author">作者: {{ result.author }}</p>
          <p class="publication-date">发布日期: {{ result.publicationDate }}</p>
          <button @click="downloadFile(result.pdfPath)" class="download-btn">
            <span v-if="isDownloading" class="loading"></span>
            下载 PDF
          </button>
          <span v-if="downloadError" class="error-message">{{ downloadError }}</span>
        </li>
      </ul>
    </div>

    <!-- 提示没有结果 -->
    <div v-else class="no-results">
      <p>未找到相关结果</p>
    </div>
  </div>
</template>

<script setup>
import { ref, watchEffect } from 'vue';
import axios from 'axios';

// 定义响应式变量
const queryStr = ref('');
const startDate = ref('');
const endDate = ref('');
const page = ref(0);
const sortField = ref('title');
const pageSize = 10;
const results = ref([]);
const totalCount = ref(0);
const totalPages = ref(0);
const isNewSearch = ref(true);
const downloadError = ref('');
const isDownloading = ref(false);

// 请求搜索数据的函数
async function search() {
  const response = await fetch("http://localhost:80/api/documents/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      queryStr: queryStr.value,
      startDate: startDate.value,
      endDate: endDate.value,
      sortField: sortField.value,
      page: page.value,
    }),
  });
  const data = await response.json();
  
  // 处理搜索结果
  results.value = data.results.map((item) => ({
    highlightedTitle: item.fields[5]?.charSequenceValue || item.fields[0]?.charSequenceValue || '',
    highlightedAbstract: item.fields[6]?.charSequenceValue || item.fields[2]?.charSequenceValue || '',
    author: item.fields[1].charSequenceValue,
    publicationDate: item.fields[4].charSequenceValue,
    pdfPath: item.fields[3].charSequenceValue,
  }));

  // 更新分页信息
  if (isNewSearch.value && data.totalCount != undefined) {
    totalCount.value = data.totalCount;
    totalPages.value = Math.ceil(totalCount.value / pageSize);
    isNewSearch.value = false;
  }
}

// 切换页码的函数
function changePage(newPage) {
  if (newPage >= 0 && newPage < totalPages.value) {
    page.value = newPage;
    isNewSearch.value = false;
    search();
  }
}

// 监听查询变化
watchEffect(() => {
  if (queryStr.value || startDate.value || endDate.value || sortField.value) {
    isNewSearch.value = true;
    search();
  }
});

// 下载文件
const downloadFile = (pdfPath) => {
  isDownloading.value = true;
  downloadError.value = '';
  
  const downloadUrl = `http://localhost:80/api/documents/download/${pdfPath}`;
  
  axios({
    url: downloadUrl,
    method: 'GET',
    responseType: 'blob',
  }).then((response) => {
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = pdfPath;
    link.click();
    isDownloading.value = false;
  }).catch((error) => {
    console.error("Download error:", error);
    downloadError.value = '下载失败，请稍后重试';
    isDownloading.value = false;
  });
};
</script>

<style scoped>
.search-container {
  width: 100%;
  max-width: 900px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  padding: 30px;
  margin: 0 auto;
}

.search-form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.input-field, .select-field {
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s ease;
  background-color: #f9f9f9;
}

.input-field:focus, .select-field:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
  background-color: white;
}

.search-btn {
  padding: 12px 25px;
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  align-self: end;
}

.search-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(52, 152, 219, 0.4);
}

.search-btn:active {
  transform: translateY(0);
}

.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 25px 0;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.pagination-container p {
  font-weight: 500;
  color: #555;
}

.pagination-buttons {
  display: flex;
  gap: 10px;
}

.page-btn {
  padding: 8px 16px;
  background-color: #ecf0f1;
  border: 1px solid #bdc3c7;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.page-btn:hover:not(:disabled) {
  background-color: #3498db;
  color: white;
  border-color: #3498db;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.results-container {
  margin-top: 20px;
}

.results-list {
  list-style: none;
  padding: 0;
}

.result-item {
  background-color: white;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  border-left: 4px solid #3498db;
}

.result-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.highlighted-title {
  font-size: 1.4rem;
  margin-bottom: 10px;
  color: #2c3e50;
}

.highlighted-title :deep(em), .highlighted-abstract :deep(em) {
  background-color: #fffacd;
  font-style: normal;
  padding: 2px 4px;
  border-radius: 3px;
}

.highlighted-abstract {
  margin-bottom: 15px;
  color: #555;
  line-height: 1.7;
}

.author, .publication-date {
  color: #7f8c8d;
  margin-bottom: 8px;
  font-size: 0.95rem;
}

.download-btn {
  padding: 8px 16px;
  background-color: #2ecc71;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.download-btn:hover {
  background-color: #27ae60;
  transform: translateY(-2px);
}

.error-message {
  color: #e74c3c;
  margin-left: 10px;
  font-size: 0.9rem;
}

.no-results {
  text-align: center;
  padding: 40px 20px;
  color: #7f8c8d;
  font-size: 1.1rem;
}

.loading {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .search-container {
    padding: 20px;
  }
  
  .search-form {
    grid-template-columns: 1fr;
  }
  
  .pagination-container {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .pagination-buttons {
    justify-content: center;
  }
  
  .highlighted-title {
    font-size: 1.2rem;
  }
}
</style>