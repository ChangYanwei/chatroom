# chatroom
聊天室

## 版本1.0 websocket-chatroom
- 使用 [nodejs-WebSocket](https://github.com/sitegui/nodejs-websocket) 第三方库来开发websocket的服务器
- 相关博客：[使用Websocket制作简易聊天室](https://www.yuque.com/changyanwei-wlmrd/cnxiwc/iswywm)

## 版本1.1 socket.io + express
- 使用[socket.io](https://socket.io/)监听连接的建立、断开事件，监听用户的登录、发送消息事件
- 使用[express](https://www.expressjs.com.cn/)开放静态资源目录
- 使用[html2canvas](http://html2canvas.hertzen.com/)实现截图
- 使用[jQuery-emoji](http://eshengsky.github.io/jQuery-emoji/)添加表情
- 除了选用默认头像外，用户可以上传本地图片作为头像
- 聊天记录和用户信息没有持久化存储


