let express = require('express');
let bodyParser = require('body-parser');
let session = require('express-session');
let app = express();

let server = require('http').createServer(app);
let io = require('socket.io')(server);
let router = require('./router');

// 配置解析表单 POST请求体插件（注意:一定要在 app.use(router)之前)
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static('./public'));

// 配置使用art-template
app.engine('html', require('express-art-template'));

app.use(session({
  secret: 'webchang',
  resave: false,
  saveUninitialized: true
}));

// 记录所有已经登录的用户
let users = [];

app.use(router);

server.listen(7000, function () {
  console.log('http://127.0.0.1:7000');
});

// 只要有用户连接，就会触发connection事件，并为每个用户创建独一无二的连接socket（也就是socket对象是每个用户都有的）
io.on('connection', function (socket) {
  console.log('新用户连接了',socket.id);

  /**
   * 监听用户登录，并返回登录成功或失败的消息
   * 如果登录成功需要做以下几件事情
   * 1.广播消息，告诉所有用户有新用户进来了。使用io.emit()
   * 2.广播消息，将当前的用户列表发送给所有用户
   * */
  socket.on('loginSuccess', function (user) {
    users.push(user);
    console.log(users);
    // 告诉所有用户有新用户进来了，广播消息
    io.emit('addUser', user);

    // 告诉所有用户当前聊天室有多少人
    io.emit('userList', users);

    // 存储当前的登录用户
    console.log('当前的登录用户:', user);
    socket.currentUser = user;

  });

  // 监听用户断开连接，disconnect事件是系统提前定义好的，不是自己定义的
  socket.on('disconnect', function () {
    console.log('断开连接');
    /**
     * 把当前用户的信息从users中删除掉
     * 1．告诉所有人，有人离开了聊天室
     * 2．告诉所有人. userList发生了更新
     * */
    if (!socket.currentUser) return;
    let index = users.findIndex(user => {
      return user.nickname === socket.currentUser.nickname;
    });
    let whoLeave = users.splice(index, 1)[0];
    console.log('wholeave', whoLeave);

    // 1．告诉所有人，有人离开了聊天室
    io.emit('userLeave', whoLeave);

    // 2．告诉所有人. userList发生了更新
    io.emit('userList', users);
  });

  // 监听聊天的消息
  socket.on('sendMessage', function (data) {
    // 把接收到的消息广播给所有用户
    io.emit('receiveMessage', data);
  });

  // 监听接收图片的消息
  socket.on('sendImg', function (data) {
    io.emit('receiveImg', data);
  });

});
