# content
- [content](#content)
- [背景](#背景)
- [问题分析](#问题分析)
  - [history.back](#historyback)
  - [document.referrer](#documentreferrer)
  - [获取 history stack](#获取-history-stack)
- [解决方案](#解决方案)
  - [重写 history.pushState / 监听 history.pushState 事件](#重写-historypushstate--监听-historypushstate-事件)
  - [拦截住前进/后退按钮](#拦截住前进后退按钮)


# 背景
开发过程中遇见需要返回项目中上一个页面的需求，并能正确返回携带上一个页面的参数<br/>
例如：从 `/user?name=xxx` 跳到 `/push` ，此时需要在 `/push` 页面实现能返回 `/user?name=xxx` 

# 问题分析
## history.back
第一直觉就是使用 `history.back` ，`history.back` 确实能正确返回上一个页面，但是由于 history 是 `window.history` 即 window 层级的，就导致了 `history.back` 等效于浏览器的后退按钮，就有可能跳出项目 <br/>
在大多数项目/甚至 stackoverflow 中都使用 `history.length` 来进行判断能否使用 `history.back` 如下：
```js
if(history.length!==1){
    history.back()
}else{
    history.pushState('/fallback')
}
```
但其实 `history.length` 有很多坑: <br/>
* 浏览器后退并不会改变 `history.length`
* 不同项目的 `history.length` 会互相叠加，也就是很可能进入项目的时候 `history.length` 已经是 10


## document.referrer
`document.referrer` 是一个比较远古的 api ，主要用于获取上一个 url ，但是对于现在的 SPA 项目，`history.pushState` 并不会改变 `document.referrer` 的值

## 获取 history stack
获取 history 栈，在 MDN 中很明确表明了 history stack 是无法接触到的，只服务于浏览器，并不开放

# 解决方案
兜兜转转一圈发现并没有一个原生的 api 支持获取上一个 url ，也不难想到 **获取上一个 url /历史 url** 本身就是一个很危险的操作，浏览器不开放给 web 开发者也不难理解。<br/>
虽然项目之外的 url 无法获取到，但是我们可以获取到项目中每一个的 url ，就有如下方案

## 重写 history.pushState / 监听 history.pushState 事件
我们想知道上一个 url 是否为项目的 url ，那么我们就对每次 `history.pushState` 进行监听，这样我们就可以自己维护一个只关于项目的路由栈
```js
const historyStack = []
history.push = function(url){
    historyStack.push(url)
    history.pushState(url)
}
```
这样我们就可以构造出一个 `back` 函数
```js
/**
 * @params fallback 兜底 url
 */
history.back = function(fallback){
    if(historyStack.length>1){
        history.back()
        historyStack.pop()
    }else{
        history.push(fallback)
    }
}
```
看似很完美，但我们似乎都忽略了浏览器的行为，浏览器的前进后退也会影响到项目的路由栈 `historyStack`  <br/>
 `popstate` 事件可以监听浏览器的前进后退按钮，但无法进行区分前进还是后退，
 ```js
 window.addEventListener('popstate',function(e){
    // 浏览器前进或者后退都可以触发
 })
 ```
问题再一次转化为如何监听浏览器的前进按钮，但目前笔者的调研来看似乎是无解的。<br/>
但我们稍微改造下路由栈的思路，
1. 在 `back` 的时候不进行 `pop` 而是使用指针来进行标识当前的页面指向的路由栈位置
2. 在 `push` 时候将当前指针的后面记录清空
3. 每触发 `popstate` 事件时候，获取到新页面的 url ，与当前指针指向前一个以及后一个进行对比，如果与前一个相等那么就是后退，如果与前一相等那么就是前进

具体代码见 https://github.com/LINGyue-dot/noise-back



## 拦截住前进/后退按钮
可参考 https://stackoverflow.com/a/16603692/13663826