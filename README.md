# chatroom
多人聊天室

博客：[使用socket.io + express + mongodb制作在线聊天室](https://blog.csdn.net/weixin_43974265/article/details/116600763)

> 由于版本之间的改动很大，我想把代码都保留下来，所以不同版本的聊天室我放在了不同的文件夹中。

## 版本1.0 websocket-chatroom
- 进入websocket-chatroom文件夹，执行`node app.js`，直接在浏览器查看index.html
- 使用 [nodejs-WebSocket](https://github.com/sitegui/nodejs-websocket) 第三方库来开发websocket的服务器
- 相关博客：[使用Websocket制作简易聊天室](https://www.yuque.com/changyanwei-wlmrd/cnxiwc/iswywm)

## 版本1.1 socket.io + express
- 进入chatroom1.1文件夹，执行`node app.js`，访问`http://127.0.0.1:5000`
- 使用[socket.io](https://socket.io/)监听连接的建立、断开事件，监听用户的登录、发送消息事件
- 使用[express](https://www.expressjs.com.cn/)开放静态资源目录
- 使用[html2canvas](http://html2canvas.hertzen.com/)实现截图
- 使用[jQuery-emoji](http://eshengsky.github.io/jQuery-emoji/)添加表情
- 除了选用默认头像外，用户可以上传本地图片作为头像
- 点击图片消息放大预览
- 聊天记录和用户信息没有持久化存储

## 版本1.2 socket.io + express + mongodb + art-template
- 体验地址：http://8.131.68.141:7000
- 需要先在自己电脑上安装MongoDB数据库
- 进入chatroom1.2文件夹，执行`node app.js`，访问`http://127.0.0.1:7000`
- 用户信息保存到了MongoDB数据库中，使用[mongoose](https://mongoosejs.com/)在node中操作数据库
- 新增注册和登录页面
- 相关博客：[使用socket.io + express + mongodb制作在线聊天室](https://blog.csdn.net/weixin_43974265/article/details/116600763)
