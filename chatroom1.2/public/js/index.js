// 1. 连接socket.io服务
let socket = io('http://127.0.0.1:7000');

// 聊天框
let chatContainer = document.querySelector(".chat-container");

// 如果直接进入该页面，判断当前用户是否登录成功。如果登录成功，就发一个事件给服务器，服务器做一个广播
let currentUser = sessionStorage.getItem('currentUser');
if (currentUser) {
  currentUser = JSON.parse(currentUser);
  socket.emit('loginSuccess',currentUser);
}

// 监听添加用户的消息
socket.on('addUser', function (user) {
  let p = document.createElement('p');
  p.classList.add('tip');
  p.textContent = user.nickname + '进入了聊天室';
  chatContainer.appendChild(p);
  scrollIntoView(chatContainer);
});

// 监听用户列表的消息
socket.on('userList', function (users) {
  // 把userList的数据动态渲染到左侧用户列表
  let friendsList = document.querySelector('.friends-list');
  friendsList.innerHTML = '';
  let html = '';
  for (let i = 0; i < users.length; i++) {
    let user = users[i];
    if (user.nickname === currentUser.nickname) {
      continue;
    }
    html += `      
      <div class="user-info">
        <img src="${user.avatar}" class="avatarImg">
        <span>${user.nickname}</span>
      </div>`;
  }
  friendsList.innerHTML += html;

  // 修改聊天室的用户总数
  document.getElementById('userCount').textContent = users.length;
});

// 监听用户离开的消息
socket.on('userLeave', function (user) {
  let p = document.createElement('p');
  p.classList.add('tip');
  p.textContent = user.nickname + '离开了聊天室';
  chatContainer.appendChild(p);
  scrollIntoView(chatContainer);
});

// 监听用户发送文本内容
socket.on('receiveMessage', function (data) {
  // 把接收到的消息显示到聊天窗口中，需要区分这个消息是自己的还是其他人发的
  let sendUser = data.sendUser;
  let html = '';
  if (sendUser.nickname === currentUser.nickname) {
    // 自己发的消息
    html = `
            <div class="sendMsg">
              <div class="sendContent">${data.message}</div>
              <img src="${sendUser.avatar}" class="avatarImg">
            </div>`;
  } else {
    // 别人发的消息
    html = `<div class="receiveMsg">
              <img src="${sendUser.avatar}" class="avatarImg">
              <div class="rightStyle">
                <span class="nickname">${sendUser.nickname}</span>
                <div class="receiveContent">${data.message}</div>
              </div>
            </div>`;
  }

  chatContainer.innerHTML += html;
  // 发送消息的时候，让聊天页面滚动到底部可视区域
  scrollIntoView(chatContainer);

});

// 监听图片聊天信息
socket.on('receiveImg', function (data) {
  let sendUser = data.sendUser;
  let html = '';
  if (sendUser.nickname === currentUser.nickname) {
    html += `
      <div class="sendImgMsg">
        <img src="${data.imgUrl}" class="sendImg">
        <img src="${sendUser.avatar}" class="avatarImg">
      </div>`
  } else {
    html += `
      <div class="receiveMsg">
        <img src="${sendUser.avatar}" class="avatarImg">
        <div class="rightStyle">
          <span class="nickname">${sendUser.nickname}</span>
          <img src="${data.imgUrl}" class="receiveImgMsg">
        </div>
      </div>
    `;
  }
  chatContainer.innerHTML += html;
  // 发送消息的时候，让聊天页面滚动到底部可视区域
  let img = new Image();
  img.src = data.imgUrl;
  img.onload = function () {
    // 图片加载完成再滚动
    scrollIntoView(chatContainer);
  };
});

// 获取用户输入的内容
function getMessage(element) {
  let value = element.innerHTML;
  element.innerHTML = '';
  if (!value) {
    return alert('消息不能为空');
  }

  // 把消息发给服务器
  socket.emit('sendMessage', {
    message: value,
    sendUser: currentUser
  });
}

// 4.点击发送按钮或者Ctrl + Enter键发送消息
function sendMessage() {
  let sendBtn = document.getElementById('sendBtn');
  let textareaMsg = document.getElementById('textareaMsg');

  sendBtn.addEventListener('click', function () {
    getMessage(textareaMsg);
  });

  textareaMsg.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' && event.ctrlKey) {
      getMessage(textareaMsg);
    }
  });
}

// 聊天页滚动到页面底部可视区域
function scrollIntoView(element) {
  element.lastElementChild.scrollIntoView(false);
}

// 聊天时发送图片
function sendImg() {
  let fileInput = document.getElementById('fileInput');
  fileInput.addEventListener('change', function (event) {
    let file = event.target.files[0];
    // 要把这个文件发送给服务器
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
      socket.emit('sendImg', {
        sendUser: currentUser,
        imgUrl: reader.result
      })
    }
  })
}

// 初始化jquery-emoji插件
function emoji() {
  let emojiBtn = document.getElementById('emojiBtn');
  emojiBtn.addEventListener('click', function () {
    $('#textareaMsg').emoji({
      button: '#emojiBtn',// 设置触发表情的按钮
      showTab: false,
      animation: "slide",
      position: "topRight",
      icons: [
        {
          name: "QQ表情",
          path: "images/qq/",
          maxNum: 91,
          excludeNums: [41, 45, 54],
          file: ".gif",
          placeholder: "#qq_{alias}#"
        },
        {
          name: "emoji",
          path: "images/emoji/",
          maxNum: 84,
          excludeNums: [41, 45, 54],
          file: ".png",
          placeholder: "#emoji_{alias}#"
        },
        {
          name: "贴吧表情",
          path: "images/tieba/",
          maxNum: 50,
          excludeNums: [41, 45, 54],
          file: ".jpg",
          placeholder: "#tieba{alias}#"
        }
      ]
    })
  });

}

// 截图
function cutImg() {
  let cutImg = document.getElementById('cutImg');
  cutImg.addEventListener('click', function () {
    html2canvas(document.querySelector('.chatContainer')).then(canvas => {
      // 将canvas转成图片url
      let imgUrl = canvas.toDataURL("image/png");

      // 把消息发给服务器
      socket.emit('sendImg', {
        sendUser: currentUser,
        imgUrl: imgUrl
      })
    });
  })
}

// 点击图片消息预览放大
function enlargeImg() {
  let black_overlay = document.getElementById('black_overlay');
  let enlargeContainer = document.getElementById('enlargeContainer');
  let closeBtn = document.getElementById('closeBtn');
  let enlargeBtn = document.getElementById('enlargeBtn');
  let smallerBtn = document.getElementById('smallerBtn');
  let img;

  chatContainer.addEventListener('click', function (event) {
    let target = event.target;
    let classList = target.classList;
    // 点击左侧或右侧图片消息
    if (classList.contains('sendImg') || classList.contains('receiveImgMsg')) {
      let imgUrl = target.src;
      // 显示黑色遮罩和预览容器
      black_overlay.style.display = 'block';
      enlargeContainer.style.display = 'block';
      img = new Image();
      img.src = imgUrl;
      img.classList.add('enlargePreviewImg');
      if (closeBtn.nextElementSibling) {
        enlargeContainer.removeChild(closeBtn.nextElementSibling);
      }
      enlargeContainer.appendChild(img);
    }
  });

  // 关闭预览
  closeBtn.addEventListener('click', function () {
    black_overlay.style.display = 'none';
    enlargeContainer.style.display = 'none';
  });

  // 继续放大
  enlargeBtn.addEventListener('click', function () {
    let documentElement = document.documentElement;
    if (img.height < documentElement.clientHeight * 0.8) {
      img.style.width = img.width + Math.floor(documentElement.clientWidth / 10) + 'px';
    }
  });

  // 继续缩小
  smallerBtn.addEventListener('click', function () {
    let documentElement = document.documentElement;
    img.style.width = img.width - Math.floor(documentElement.clientWidth / 10) + 'px';
    if (img.width < 300) {
      img.style.width = '300px';
    }
  });
}

function loginOut() {
  let loginOut = document.getElementById('loginOut');
  loginOut.addEventListener('click',function () {
    let xhr = new XMLHttpRequest();
    xhr.onload = function() {
      location.href = '/login';
    };
    xhr.open('POST','/loginOut');
    xhr.send();
  })
}

sendMessage();
sendImg();
emoji();
cutImg();
enlargeImg();
loginOut();
