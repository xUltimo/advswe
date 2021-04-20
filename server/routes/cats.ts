import CatCtrl from "../controllers/cat";

module.exports = function(router, jwtAuth) {
  const catCtrl = new CatCtrl();

  router.get('/cats/count', jwtAuth, catCtrl.count);
  router.route('/cat').post(jwtAuth, catCtrl.insert, catCtrl.show);
  router.route('/cat/:catId').get(catCtrl.get, catCtrl.show);
  router.route('/cat/:catId').put(catCtrl.update, catCtrl.show);
  router.route('/cat/:catId').delete(catCtrl.delete);
  router.route('/cats').get(catCtrl.getAll);

  router.param('catId', catCtrl.load);
}
