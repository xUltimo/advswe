import POICtrl from "../controllers/poi";

module.exports = function(router, jwtAuth, isAdminOrOwner) {
  const poiCtrl = new POICtrl();

  router.route('/pois').post(jwtAuth, poiCtrl.setCreatorAndLocType, poiCtrl.insert, poiCtrl.show);
  router.route('/pois').get(jwtAuth, isAdminOrOwner, poiCtrl.getList);
  router.route('/pois/:poiId').delete(jwtAuth, isAdminOrOwner, poiCtrl.delete);
  router.route('/pois/:poiId').put(jwtAuth, isAdminOrOwner, poiCtrl.setCreatorAndLocType, poiCtrl.update, poiCtrl.show);
  router.route('/pois/:poiId').get(jwtAuth, isAdminOrOwner, poiCtrl.show);

  router.param('poiId', poiCtrl.load);
}
