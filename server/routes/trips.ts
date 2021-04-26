import TripCtrl from "../controllers/trip";
import POICtrl from "../controllers/poi";

module.exports = function(router, jwtAuth, isOwner, isAdminOrOwner) {
  const tripCtrl = new TripCtrl();
  const poiCtrl = new POICtrl();


  /**
   * @swagger
   * /trips:
   *   post:
   *     summary: Add a trip to the TravelLog.
   *     description:  Add a trip to TravelLog.
   *     tags:
   *       - Trips
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/NewTrip'
   *     security:
   *       - jwt: []
   *     responses:
   *       200:
   *         description: The created Trip.
   *         content:
   *           application/json:
   *             schema:
   *                 $ref: '#/components/schemas/DBTrip'
   *       401:
   *         description: Permission insufficient
   *       403:
   *         description: Permission insufficient
   */
  router.route('/trips').post(jwtAuth, tripCtrl.setCreator, tripCtrl.insert, tripCtrl.show); //1

  /**
   * @swagger
   * /trips:
   *   get:
   *     summary: Retrieve a paginated list of TravelLog trips.
   *     description: Retrieve a paginated list of trips from TravelLog.
   *     tags:
   *       - Trips
   *     security:
   *       - jwt: []
   *     responses:
   *       200:
   *         description: A paginated list of trips.
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/DBTrip'
   *       401:
   *         description: Permission insufficient
   *       403:
   *         description: Permission insufficient
   */
  router.route('/trips').get(jwtAuth, tripCtrl.getPaginatedList); //2

  /**
   * @swagger
   * /trips/mine:
   *   get:
   *     summary: Retrieve a list of own trips.
   *     description: Retrieve a list of own trips from TravelLog.
   *     tags:
   *       - Trips
   *     security:
   *       - jwt: []
   *     responses:
   *       200:
   *         description: A list of own trips.
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/DBTrip'
   *       401:
   *         description: Permission insufficient
   *       403:
   *         description: Permission insufficient
   */
  router.route('/trips/mine').get(jwtAuth, tripCtrl.getOwnList); //3 //TODO POIS? :D

  /**
   * @swagger
   * /trips/count:
   *   get:
   *     summary: Retrieve the amount of TravelLog trips.
   *     description:  Retrieve the amount of TravelLog trips.
   *     tags:
   *       - Trips
   *     security: []
   *     responses:
   *       200:
   *         description: An amount of trips.
   *         content:
   *           application/json:
   *             schema:
   *                 type: integer
   */
  router.route('/trips/count').get(jwtAuth, tripCtrl.count); //4


  router.route('/trips/:tripId/addPOI').post(jwtAuth, isOwner, poiCtrl.setCreatorAndLocType, poiCtrl.insert, tripCtrl.addPoi, tripCtrl.show); //5 //TODO check
  router.route('/trips/:tripId').put(jwtAuth, isOwner, tripCtrl.setCreator, tripCtrl.update, tripCtrl.show); //6
  router.route('/trips/:tripId').get(jwtAuth, tripCtrl.show); //7 //LoadingTrips
  router.route('/trips/:tripId/:poiId').delete(jwtAuth, isOwner, tripCtrl.removePoi, tripCtrl.show); //8 //TODO
  router.route('/trips/:tripId').delete(jwtAuth, isAdminOrOwner, poiCtrl.deleteFromTrip, tripCtrl.delete); //9


  router.param('tripId', tripCtrl.load);
  router.param('poiId', poiCtrl.load);
}

/*
1  router.route('/trips').post(jwtAuth, tripCtrl.setCreator, tripCtrl.insert, tripCtrl.show);
2  router.route('/trips').get(jwtAuth, tripCtrl.getList);
3  router.route('/trips/mine').get(...);
4  router.route('/trips/count').get(...);
5  router.route('/trips/:tripId/addPOI').post(...);
6  router.route('/trips/:tripId').put(jwtAuth, isOwner, tripCtrl.setCreator, tripCtrl.update, tripCtrl.show);
7  router.route('/trips/:tripId').get(jwtAuth, tripCtrl.getList); //TODO ID
8  router.route('/trips/:tripId/:poiId').delete();
9  router.route('/trips/:tripId').delete(jwtAuth, isAdminOrOwner, tripCtrl.delete);
10 router.param('tripId', tripCtrl.load);

 */
