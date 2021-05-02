import POICtrl from "../controllers/poi";
import multer from 'multer';

module.exports = function(router, jwtAuth, isOwner, isAdminOrOwner) {


  const poiCtrl = new POICtrl();

  const upload = multer({
    dest: 'uploads/',
    fileFilter: (req, file, cb) => {
      if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
        cb(null, true);
      } else {
        cb(null, false);
        return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
      } }
  });

  router.route('/pois').post(jwtAuth, poiCtrl.setCreatorAndLocType, poiCtrl.insert, poiCtrl.show);
  router.route('/pois').get(jwtAuth, isAdminOrOwner, poiCtrl.getList);
  router.route('/pois/:poiId').delete(jwtAuth, isAdminOrOwner, poiCtrl.delete);
  router.route('/pois/:poiId').put(jwtAuth, isOwner, poiCtrl.setCreatorAndLocType, poiCtrl.update, poiCtrl.show);
  router.route('/pois/:poiId').get(jwtAuth, isAdminOrOwner, poiCtrl.show);

  router.route('/pois/:poiId/image').post(jwtAuth, isAdminOrOwner, upload.single('file'), poiCtrl.addImage);

  router.route('/pois/images/:imageId').get(jwtAuth, poiCtrl.downloadImage);

  router.param('poiId', poiCtrl.load);

}
