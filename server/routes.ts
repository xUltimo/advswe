import * as express from 'express';

import CatCtrl from './controllers/cat';
import UserCtrl from './controllers/user';

import {PassportStatic} from 'passport';
import {Application} from 'express';
import * as jwt from 'jsonwebtoken';
import multer from 'multer';
import POICtrl from "./controllers/poi";
import TripCtrl from './controllers/trip';

const upload = multer({ dest: 'uploads/' });


export default function setRoutes(app: Application, passport: PassportStatic) {

  const router = express.Router();

  const catCtrl = new CatCtrl();
  const userCtrl = new UserCtrl();
  const poiCtrl = new POICtrl();
  const tripCtrl = new TripCtrl();

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

  /**
   * @openapi
   * tags:
   *   - name: Users
   *     description: User management and login
   *   - name: Trips
   *     description: Trip management and stuff
   */

  /**
   *
   *
   * @swagger
   * components:
   *   schemas:
   *     AbstractUser:
   *       type: object
   *       properties:
   *         username:
   *           type: string
   *           description: The user's username.
   *           example: BobMcDonald
   *         email:
   *           type: string
   *           description: The user's email.
   *           example: BobMcDonald@travellog.com
   *         role:
   *           type: string
   *           enum: [user, admin]
   *           description: The user's role.
   *         provider:
   *           type: string
   *           enum: [local, remote]
   *           description: The user's provider.
   *     NewUser:
   *       allOf:
   *         - $ref: '#/components/schemas/AbstractUser'
   *         - type: object
   *           properties:
   *             password:
   *               type: string
   *               description: The user's password.
   *               example: verysecret
   *     DBUser:
   *       allOf:
   *         - $ref: '#/components/schemas/AbstractUser'
   *         - $ref: '#/components/schemas/DBObject'
   *     AbstractTrip:
   *       type: object
   *       properties:
   *         name:
   *           type: string
   *           description: The trip name.
   *           example: Paris Trip
   *         description:
   *           type: string
   *           description: The trip description.
   *           example: A fun trip to Paris doing fun stuff.
   *         begin:
   *           type: date
   *           description: The start-date of the trip.
   *         end:
   *           type: date
   *           description: The end-date of the trip.
   *     NewTrip:
   *       allOf:
   *         - $ref: '#/components/schemas/AbstractTrip'
   *       type: object
   *       properties:
   *          creator:
   *           type: object
   *           description: The user that created the trip.
   *          pois:
   *           type: object
   *           description: The pois of the trip.
   *     DBTrip:
   *       allOf:
   *         - $ref: '#/components/schemas/AbstractTrip'
   *         - $ref: '#/components/schemas/DBTrip'
   *       type: object
   *       properties:
   *          createdAt:
   *           type: date
   *           description: The creation-date of the trip.
   */




  var catroute = require('./routes/cats')(router, jwtAuth);
  var userroute = require('./routes/users')(router, jwtAuth, checkPermission(isAdmin), checkPermission(isAdminOrOwner(userId)), protectRole)
  var poiroute = require('./routes/pois')(router, jwtAuth, checkPermission(isOwner(poiOwner)), checkPermission(isAdminOrOwner(poiOwner)));
  var triproute = require('./routes/trips')(router, jwtAuth, checkPermission(isOwner(tripOwner)), checkPermission(isAdminOrOwner(tripOwner)));


  app.use('/api', router);



}
