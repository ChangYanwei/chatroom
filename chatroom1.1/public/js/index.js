// 1. 连接socket.io服务
let socket = io('http://127.0.0.1:5000');

let currentUser = null;
// 聊天框
let chatContainer = document.querySelector(".chat-container");

// 监听登录成功和失败的请求
socket.on('loginResult', function (data) {

  console.log(data);
  if (data.err_code === 1) {
    alert('用户名已经存在');
    return;
  }
  let user = data.user;
  currentUser = user;
  document.querySelector('.loginContainer').style.display = 'none';
  document.querySelector('.chatContainer').style.display = 'flex';

  // 设置个人信息
  document.getElementById('userAvatarImg').src = user.avatar;
  document.getElementById('currentNickname').innerText = user.nickname;
});

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
  console.log('users:', users);
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
  console.log('离开了：', user);
  let p = document.createElement('p');
  p.classList.add('tip');
  p.textContent = user.nickname + '离开了聊天室';
  chatContainer.appendChild(p);
  scrollIntoView(chatContainer);
});

// 监听用户发送文本内容
socket.on('receiveMessage', function (data) {
  console.log('消息：',data);
  // 把接收到的消息显示到聊天窗口中，需要区分这个消息是自己的还是其他人发的
  let sendUser = data.sendUser;
  let html = '';
  if (sendUser.nickname === currentUser.nickname) {
    // 自己发的消息
    html = `
            <div class="sendMsg">
              <span class="sendContent">${data.message}</span>
              <img src="${sendUser.avatar}" class="avatarImg">
            </div>`;
  } else {
    // 别人发的消息
    html = `<div class="receiveMsg">
              <img src="${sendUser.avatar}" class="avatarImg">
              <div class="rightStyle">
                <span class="nickname">${sendUser.nickname}</span>
                <p class="receiveContent">${data.message}</p>
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
  scrollIntoView(chatContainer);
});

let imgList = document.getElementById('imgList');

// 2.登录时选择头像功能
function selectImg() {
  let imgs = imgList.getElementsByTagName('img');
  let preIndex = 0;
  imgList.addEventListener('click', function (event) {
    let target = event.target;
    if (target.tagName !== 'IMG') return;
    imgs[preIndex].classList.remove('now');
    target.classList.add('now');
    let index = [...imgs].findIndex(item => {
      return item === target;
    });
    preIndex = index;
  })
}

// 3.登录
function login() {
  let loginBtn = document.getElementById('loginBtn');
  loginBtn.addEventListener('click', function (event) {
    // 获取用户名和头像地址
    let nickname = document.getElementById('nickname').value.trim();
    if (nickname === '') {
      alert('用户名不能为空');
      return;
    }
    let imgUrl = imgList.getElementsByClassName('now')[0].src;
    console.log(nickname, imgUrl);

    // 告诉socket.io需要登录
    socket.emit('login', {
      nickname: nickname,
      avatar: imgUrl
    })
  });
}

// 获取用户输入的内容
function getMessage(element) {
  let value = element.innerHTML;
  element.innerHTML = '';
  if (!value) {
    return alert('消息不能为空');
  }
  console.log('value:', value);

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
    console.log(event.ctrlKey);
    if (event.key === 'Enter' && event.ctrlKey) {
      getMessage(textareaMsg);
    }
  });
}

// 聊天页滚动到页面底部可视区域
function scrollIntoView(element) {
  element.lastElementChild.scrollIntoView(false);
  console.log(element.scrollTop);
}

// 聊天时发送图片
function sendImg() {
  let fileInput = document.getElementById('fileInput');
  fileInput.addEventListener('change', function (event) {
    console.log(event.target.files);
    let file = event.target.files[0];
    // 要把这个文件发送给服务器
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
      console.log(reader.result);
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
  cutImg.addEventListener('click',function () {
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

selectImg();
login();
sendMessage();
sendImg();
emoji();
cutImg();



