let register_form = document.getElementById('register_form');
let nicknameInput = document.getElementById('nickname');
let passwordInput = document.getElementById('password');
register_form.addEventListener('submit', function (event) {
  event.preventDefault();

  // 获取用户名、密码和头像地址
  let nickname = nicknameInput.value.trim();
  if (!nickname) {
    return alert('用户名不能为空');
  }

  let password = passwordInput.value.trim();
  if (!password) {
    return alert('密码不能为空');
  }

  axios.post('/login', {
    nickname,
    password
  }).then(res => {
    let err_code = res.data.err_code;
    if (err_code === 0) {
      // 登录成功后把当前用户的用户名存入sessionStorage中，跳转到聊天界面
      let user = {
        nickname,
        avatar: res.data.avatar
      };
      sessionStorage.setItem('currentUser', JSON.stringify(user));
      location.href = '/index';
    } else if (err_code === 1) {
      alert('昵称或密码错误');
    }
  })
});

