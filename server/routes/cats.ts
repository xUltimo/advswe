import CatCtrl from "../controllers/cat";

module.exports = function(router, jwtAuth) {
  const catCtrl = new CatCtrl();

  router.get('/cats/count', jwtAuth, catCtrl.count);
  router.route('/cat').post(jwtAuth, catCtrl.insert, catCtrl.show);
  router.route('/cat/:id').get(catCtrl.get, catCtrl.show);
  router.route('/cat/:id').put(catCtrl.update, catCtrl.show);
  router.route('/cat/:id').delete(catCtrl.delete);
  router.route('/cats').get(catCtrl.getAll);

  router.param('id', catCtrl.load);
}
