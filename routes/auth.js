const express = require('express');
const passport = require('passport');

const { isLoggedIn, isNotLoggedIn } = require('../middlewares');
const { join, login, logout,update } = require('../controllers/auth');

const router = express.Router();

// POST /auth/join
router.post('/join', isNotLoggedIn, join); 

// POST /auth/login
router.post('/login', isNotLoggedIn, login);

// GET /auth/logout
router.get('/logout', isLoggedIn, logout);
router.post('/update', isLoggedIn, update);
// GET /auth/kakao
router.get('/kakao', passport.authenticate('kakao')); //카카오톡 록인 화면으로 redirect 로그인 성공후 callback로 이동

// GET /auth/kakao/callback
router.get('/kakao/callback', passport.authenticate('kakao', {
  failureRedirect: '/?error=카카오로그인 실패',
}), (req, res) => {
  res.redirect('/'); // 성공 시에는 /로 이동
});

router.get('/kakao/logout', async (req,res)=>{
  // https://kapi.kakao/com/v1/user/logout
  try {
    const ACCESS_TOKEN = res.locals.user.accessToken;
    let logout = await axios({
      method:'post',
      url:'https://kapi.kakao.com/v1/user/unlink',
      headers:{
        'Authorization': `Bearer ${ACCESS_TOKEN}`
      }
    });
  } catch (error) {
    console.error(error);
    res.json(error);
  }
  // 세션 정리
  req.logout();
  req.session.destroy();
  
  res.redirect('/');
})

module.exports = router;