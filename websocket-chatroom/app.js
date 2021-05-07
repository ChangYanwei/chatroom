const ws = require('nodejs-websocket');

let count = 0; // 当前正在聊天的总人数
let numId = 0; // 用户ID

/**
 * 发送的消息不应该是简单的字符串，否则前端无法做出一些判断处理
 * 消息应该是一个对象，有下列属性
 * type：消息的类型，0：表示用户进入聊天室，1：用户离开聊天室，2：正常的聊天
 * message：内容
 * time：聊天的具体时间
 * */
const TYPE_ENTER = 0;
const TYPE_EXIT = 1;
const TYPE_NORMAL = 2;

// 每个连接到服务器的用户都会有一个独立的conn对象
const server = ws.createServer(conn => {
  console.log('新的连接已建立');
  count++;
  numId++;
  conn.userName = '用户' + numId;
  let messageObj = {
    type: TYPE_ENTER,
    message: `${conn.userName}进入了聊天室`,
    time: new Date().toLocaleString(),
    count
  };

  // 1. 当有新用户连接的时候，告诉所有人
  broadcast(messageObj);

  conn.on('text', (data) => {
    // 2. 当我们接收到某个用户的新消息的时候，告诉所有用户，发送的消息内容是什么，类似于广播
    console.log('用户发送的数据', data);
    messageObj.type = TYPE_NORMAL;
    messageObj.message = `${conn.userName}：${data}`;
    broadcast(messageObj);
  });

  conn.on('close', () => {
    count--;
    console.log('连接已关闭');
    //  3. 告诉所有用户，有人离开了
    messageObj.type = TYPE_EXIT;
    messageObj.message = `${conn.userName}离开了聊天室`;
    broadcast(messageObj);
  });

  conn.on('error', () => {
    console.log('连接发生错误');
  });
});

// server.connections是一个数组，表示所有已经连接的用户
function broadcast(msg) {
  server.connections.forEach(conn => {
    conn.send(JSON.stringify(msg));
  })
}

server.listen(7000, () => {
  console.log('监听端口7000');
});
