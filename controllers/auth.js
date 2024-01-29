const bcrypt = require('bcrypt');
const passport = require('passport');
const User = require('../models/user');

exports.join = async (req, res, next) => {
  const { email, nick, password } = req.body;
  try {
    const exUser = await User.findOne({ where: { email } });
    if (exUser) {
      return res.redirect('/join?error=exist');
    }
    const hash = await bcrypt.hash(password, 12);
    await User.create({
      email,
      nick,
      password: hash,
    });
    return res.redirect('/');
  } catch (error) {
    console.error(error);
    return next(error);
  }
}

exports.login = (req, res, next) => {
  //localstrategy로 이동 'local'은 사용자 인증에 사용되는 전략(strategy)을 나타냅니다.
  passport.authenticate('local', (authError, user, info) => {

    if (authError) { //서버실패
      console.error(authError);
      return next(authError);
    }
    if (!user) { //로직실패
      return res.redirect(`/?error=${info.message}`);
    }
    return req.login(user, (loginError) => { //로그인성공 serialize실행
      if (loginError) {
        console.error(loginError);
        return next(loginError);
      }
      return res.redirect('/');
    });
  })(req, res, next); // 미들웨어 내의 미들웨어에는 (req, res, next)를 붙입니다.
};

exports.logout = (req, res) => { //세션에 들어있는걸 없애버린다.
  req.logout(() => {
    res.redirect('/');
  });
};

exports.update = async (req, res, next) => {
  const { user: { email }, body: { nick } } = req;
  console.log(req.user);
  console.log(req.body); 
  try {
    const exUser = await User.findOne({ where: { email } });
    if (!exUser) {
      return res.redirect('/login?error=notExist');
    }
    await User.update({ nick }, { where: { email } });
    return res.redirect('/');
  } catch (error) {
    console.error(error);
    return next(error);
  }
}
