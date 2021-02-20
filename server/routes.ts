import * as express from 'express';

import CatCtrl from './controllers/cat';
import UserCtrl from './controllers/user';
import {PassportStatic} from 'passport';
import {Application} from 'express';
import * as jwt from 'jsonwebtoken';
import multer from 'multer';

const upload = multer({ dest: 'uploads/' });




export default function setRoutes(app: Application, passport: PassportStatic) {

  const router = express.Router();

  const catCtrl = new CatCtrl();
  const userCtrl = new UserCtrl();


  const jwtAuth = passport.authenticate('jwt', { session: false});
  const isOwner = (extractor: (Request) => string) =>
    (req) => JSON.stringify(req.user._id) === JSON.stringify(extractor(req));
  const isAdmin = (req) => req.user.role === 'admin';
  const isAdminOrOwner = (extractor: (Request) => string) => (req) => isAdmin(req) || isOwner(extractor)(req);
  const checkPermission = condition => (req, res, next) =>
    condition(req) ? next() : res.status(403).send();

  const userId = r => r.users._id;
  const poiOwner = r => r.pois.creator._id;
  const tripOwner = r => r.trips.creator._id;

  const protectRole = (req, res, next) => {
    if (!isAdmin(req)) {
      delete req.body.role;
    }
    next();
  };

  app.use(passport.initialize());

  // Cats
  router.route('/cats').get(catCtrl.getAll);
  /*
  *  #swagger.tags = ['Users']
  * */
  router.route('/cats/count').get(jwtAuth, catCtrl.count);
  router.route('/cat').post(jwtAuth, catCtrl.insert, catCtrl.show);
  router.route('/cat/:id').get(catCtrl.get, catCtrl.show);
  router.route('/cat/:id').put(catCtrl.update, catCtrl.show);
  router.route('/cat/:id').delete(catCtrl.delete);

  router.route('/login').post(userCtrl.login);
  router.route('/users').get(jwtAuth, checkPermission(isAdmin), userCtrl.getList);
  router.route('/users/count').get(jwtAuth, checkPermission(isAdmin), userCtrl.count);
  router.route('/users').post(userCtrl.setRoleAndProvider, userCtrl.insert, userCtrl.show);
  router.route('/users/:userId').get(jwtAuth, checkPermission(isAdminOrOwner(userId)), userCtrl.show);
  router.route('/users/:userId').put(jwtAuth, checkPermission(isAdminOrOwner(userId)), protectRole,
    userCtrl.update, userCtrl.show);
  router.route('/users/:userId').delete(jwtAuth, checkPermission(isAdmin), userCtrl.delete);

  router.param('userId', userCtrl.load);

  app.use('/api', router);



}
