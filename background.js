chrome.runtime.onInstalled.addListener(() => {
  console.log('缓存管理器已安装');
});

// 监听来自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "clearCache") {
    // 处理清理缓存的请求
    sendResponse({status: "success"});
  }
}); 