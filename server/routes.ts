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

  /*
  *  #swagger.tags = ['Users']
  * */

  var catroute = require('./routes/cats')(router, jwtAuth);
  var userroute = require('./routes/users')(router, jwtAuth, checkPermission(isAdmin), checkPermission(isAdminOrOwner(userId)), protectRole)

  //router.get('/cats/count', jwtAuth, catCtrl.count);

//  router.route('/cats/count').get(jwtAuth, catCtrl.count);



  app.use('/api', router);



}
