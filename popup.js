document.addEventListener('DOMContentLoaded', function() {
  const clearSelectedBtn = document.getElementById('clearSelected');
  const clearCurrentBtn = document.getElementById('clearCurrent');
  const statusDiv = document.getElementById('status');

  function showStatus(message, isError = false) {
    statusDiv.textContent = message;
    statusDiv.className = 'status ' + (isError ? 'error' : 'success');
    statusDiv.style.display = 'block';
    
    // 添加动画效果
    statusDiv.style.animation = 'slideIn 0.3s ease-out';
    
    // 3秒后淡出
    setTimeout(() => {
      statusDiv.style.animation = 'fadeOut 0.5s ease-out';
      setTimeout(() => {
        statusDiv.style.display = 'none';
      }, 500);
    }, 3000);
  }

  function getTimeRange() {
    const selection = document.getElementById('timeRange').value;
    const now = new Date().getTime();
    switch(selection) {
      case 'last_hour':
        return now - (1000 * 60 * 60);
      case 'last_day':
        return now - (1000 * 60 * 60 * 24);
      case 'last_week':
        return now - (1000 * 60 * 60 * 24 * 7);
      case 'last_month':
        return now - (1000 * 60 * 60 * 24 * 30);
      default:
        return 0;
    }
  }

  function getSelectedTypes() {
    const types = {};
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
      types[checkbox.id] = checkbox.checked;
    });
    return types;
  }

  clearSelectedBtn.addEventListener('click', async () => {
    const types = getSelectedTypes();
    const since = getTimeRange();
    
    // 添加加载状态
    clearSelectedBtn.disabled = true;
    clearSelectedBtn.innerHTML = '<span class="spinner"></span> 正在清理...';

    try {
      await chrome.browsingData.remove({
        "since": since
      }, {
        "cache": types.cache,
        "cookies": types.cookies,
        "downloads": types.downloads,
        "formData": types.formData,
        "history": types.history,
        "localStorage": types.localStorage
      });
      
      // 显示详细的清理信息
      const clearedItems = Object.entries(types)
        .filter(([_, value]) => value)
        .map(([key, _]) => {
          const typeNames = {
            cache: '页面缓存',
            cookies: 'Cookies',
            downloads: '下载记录',
            formData: '表单数据',
            history: '浏览历史',
            localStorage: '本地存储'
          };
          return typeNames[key];
        });
      
      showStatus(`成功清理了：${clearedItems.join('、')}！`);
    } catch (error) {
      showStatus('清理失败：' + error.message, true);
    } finally {
      // 恢复按钮状态
      clearSelectedBtn.disabled = false;
      clearSelectedBtn.textContent = '清理选中项';
    }
  });

  clearCurrentBtn.addEventListener('click', async () => {
    const types = getSelectedTypes();
    
    clearCurrentBtn.disabled = true;
    clearCurrentBtn.innerHTML = '<span class="spinner"></span> 正在清理...';

    try {
      const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
      const url = new URL(tab.url);
      const domain = url.hostname;

      await chrome.browsingData.remove({
        "origins": [url.origin]
      }, {
        "cache": types.cache,
        "cookies": types.cookies,
        "downloads": types.downloads,
        "formData": types.formData,
        "history": types.history,
        "localStorage": types.localStorage
      });
      
      // 显示实际清理的内容
      const clearedItems = Object.entries(types)
        .filter(([_, value]) => value)
        .map(([key, _]) => {
          const typeNames = {
            cache: '页面缓存',
            cookies: 'Cookies',
            downloads: '下载记录',
            formData: '表单数据',
            history: '浏览历史',
            localStorage: '本地存储'
          };
          return typeNames[key];
        });
      
      showStatus(`已成功清理 ${domain} 的数据！\n清理项目：${clearedItems.join('、')}`);
    } catch (error) {
      showStatus('清理失败：' + error.message, true);
    } finally {
      clearCurrentBtn.disabled = false;
      clearCurrentBtn.textContent = '仅清理当前网站';
    }
  });
}); 