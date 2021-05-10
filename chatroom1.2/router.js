let express = require('express');
let User = require('./models/User');

let router = express.Router();

router.get('/', function (req, res) {
  let user = req.session.user;
  console.log('是否登录：', user);
  if (user) {
    res.render('index.html', {
      user
    });
  } else {
    res.redirect('/login');
  }
});

// 聊天界面
router.get('/index', function (req, res) {
  let user = req.session.user;
  console.log('是否登录：', user);
  if (user) {
    res.render('index.html', {
      user
    });
  } else {
    res.redirect('/login');
  }

});

// 注册页面
router.get('/register', function (req, res) {
  res.render('register.html');
});

// 处理注册请求
router.post('/register', async function (req, res) {
  let body = req.body;
  let result = await User.findOne({
    nickname: body.nickname,
    password: body.password
  });
  if (result) {
    return res.status(200).json({
      err_code: 1,
      message: '昵称已存在'
    })
  }

  let user = new User(body);
  await user.save();
  // req.session.user = user;
  return res.status(200).json({
    err_code: 0,
  })
});

// 登录页面
router.get('/login', function (req, res) {
  res.render('login.html');
});

// 处理登录请求
router.post('/login', async function (req, res) {
  let body = req.body;
  let user = await User.findOne(body);
  if (!user) {
    return res.status(200).json({
      err_code: 1,
      message: "昵称或密码错误"
    });
  }

  req.session.user = user;
  console.log('当前登录用户：', user);

  return res.status(200).json({
    err_code: 0,
    message: "登录成功",
    avatar: user.avatar
  });

});

// 修改头像页面
router.get('/changeAvatar', function (req, res) {
  let user = req.session.user;
  if (user) {
    res.render('changeAvatar.html', {
      user
    });
  } else {
    res.redirect('/login');
  }
});

// 处理修改头像的请求
router.post('/changeAvatar', async function (req, res) {
  let avatar = req.body.avatar;
  let result = await User.findOne({
    nickname: req.session.user.nickname
  });
  User.remove({nickname: req.session.user.nickname}, function (err, result) {

  });

  let user = new User({
    nickname: result.nickname,
    password: result.password,
    avatar
  });
  await user.save();
  req.session.user = user;

  return res.status(200).json({
    err_code: 0,
    message: "更新头像成功"
  })
});

// 退出登录的请求
router.post('/loginOut', function (req, res) {
  req.session.user = null;
  return res.status(200).json({
    err_code: 0,
    message: "已退出"
  })
});

module.exports = router;


