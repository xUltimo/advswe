
import UserCtrl from "../controllers/user";

module.exports = function(router, jwtAuth, isAdmin, isOwner, protectRole) {
  const userCtrl = new UserCtrl();

  router.route('/login').post(userCtrl.login);
  router.route('/users').get(jwtAuth, isAdmin, userCtrl.getList);
  router.route('/users/count').get(jwtAuth, isAdmin, userCtrl.count);
  router.route('/users').post(userCtrl.setRoleAndProvider, userCtrl.insert, userCtrl.show);
  router.route('/users/:userId').get(jwtAuth, isOwner, userCtrl.show);
  router.route('/users/:userId').put(jwtAuth, isOwner, protectRole,
    userCtrl.update, userCtrl.show);
  router.route('/users/:userId').delete(jwtAuth,isAdmin, userCtrl.delete);

  router.param('userId', userCtrl.load);

}
