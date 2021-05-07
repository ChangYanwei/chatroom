let express = require('express');
let app = express();
let server = require('http').Server(app);
let io = require('socket.io')(server);

// 记录所有已经登录的用户
let users = [];

server.listen(5000, function () {
  console.log('http://127.0.0.1:5000');
});

app.use(express.static('./public'));

app.get('/', function (req, res) {
  res.redirect('index.html');
});

// 只要有用户连接，就会触发connection事件，并为每个用户创建独一无二的连接socket（也就是socket对象是每个用户都有的）
io.on('connection', function (socket) {
  console.log('新用户连接了');
  /**
   * 监听用户登录，并返回登录成功或失败的消息
   * 如果登录成功需要做以下几件事情
   * 1.广播消息，告诉所有用户有新用户进来了。使用io.emit()
   * 2.广播消息，将当前的用户列表发送给所有用户
   * */
  socket.on('login', function (data) {
    // 判断，如果data在users中存在，说明该用户已经登录了，不允许登录
    // 如果data在users中不存在，说明该用户没有登录。允许用户登录
    let user = users.find(item => {
      return item.nickname === data.nickname;
    });
    console.log('user', user);
    if (user) {
      // 用户存在，登录失败
      console.log('登录失败');
      socket.emit('loginResult', {
        err_code: 1,
        message: "登录失败"
      });
      return;
    }

    // 登录成功，返回响应给当前用户
    console.log('登录成功');
    users.push(data);
    socket.emit('loginResult', {
      err_code: 0,
      message: "登录成功",
      user: data
    });

    // 告诉所有用户有新用户进来了，广播消息
    io.emit('addUser', data);

    // 告诉所有用户当前聊天室有多少人
    io.emit('userList', users);

    // 存储当前的登录用户
    console.log('当前的登录用户:', data);
    socket.currentUser = data;

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
  socket.on('sendMessage',function (data) {
    // 把接收到的消息广播给所有用户
    io.emit('receiveMessage',data);
  });

  // 监听接收图片的消息
  socket.on('sendImg',function (data) {
    io.emit('receiveImg',data);
  });

});
