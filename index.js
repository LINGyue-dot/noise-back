const globalHistory = window.history;
const baseHref = window.location.host;

const forwardBtn = document.querySelector("#forward");
const backBtn = document.querySelector("#back");

const historyStack = [window.location.href];
const maxLen = 50;
let historyPointer = 0;

forwardBtn.addEventListener("click", function (e) {
  const nextUrl = baseHref + "/" + "?time=" + encodeURIComponent(Date.now());
  pushNewUrl(nextUrl);
});
backBtn.addEventListener("click", function (e) {
  if (historyPointer > 0) {
    console.log(historyPointer, historyStack);
    console.log("可以返回上一个页面");
    globalHistory.back(); // 等效于浏览器返回按钮，同样会触发 popstate 事件
  } else {
    console.log("不能返回上一个页面，触发兜底逻辑");
    pushNewUrl(baseHref + "/" + "?new");
  }
});

window.addEventListener("popstate", function () {
  // 改变 url 后触发
  const newUrl = this.window.location.href;
  // 当前无法前进
  if (historyPointer === historyStack.length - 1) {
    console.log("点击了后退按钮");
    historyPointer -= 1;
  } else {
    if (historyPointer === 0) {
      // 没有前一个了，跳出项目了
      return;
    }
    const prevUrl = historyStack[historyPointer - 1];
    const nextUrl = historyStack[historyPointer + 1];
    switch (newUrl) {
      case prevUrl:
        console.log("点击了后退按钮");
        historyPointer -= 1;
        break;
      case nextUrl:
        console.log("点击了前进按钮");
        historyPointer += 1;
        break;
      default:
        console.log("闹鬼了");
        console.log(historyStack, historyPointer, newUrl);
    }
  }
});

function pushNewUrl(newUrl) {
  globalHistory.pushState({}, "", newUrl);
  // push 时候清空指针之后所有数据
  historyStack.length = historyPointer + 1;
  historyStack.push(newUrl);
  historyPointer = historyStack.length - 1;
}
