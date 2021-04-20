import UserCtrl from "../controllers/user";

module.exports = function(router, jwtAuth, isAdmin, isOwner, protectRole) {
  const userCtrl = new UserCtrl();

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
   *
   */



  /**
   * @swagger
   * /login:
   *   post:
   *     summary: Log in to TravelLog
   *     description:   Log in to TravelLog
   *     tags:
   *       - Users
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *                 email:
   *                   type: string
   *                   description: The user's email.
   *                   example: BobMcDonald@travellog.com
   *                 password:
   *                   type: string
   *                   description: The user's password.
   *                   example: SupersecretPassword
   *     security:
   *       - jwt: []
   *     responses:
   *       200:
   *         description: The Token
   *         content:
   *           application/json:
   *             schema:
   *                 type: object
   *                 properties:
   *                   token:
   *                     type: string
   *                     description: The Token
   *                     example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7Il9pZCI6IjYwMzE0ZTM2YTE3YjUyM2VmYzc1Mjc4ZSIsInVzZXJuYW1lIjoic2NoaXJnaXRvbSIsImVtYWlsIjoidG9tLnNjaGlyZ2lAZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwicHJvdmlkZXIiOiJsb2NhbCIsIl9fdiI6MH0sImlhdCI6MTYxNDg4MzYzNSwiZXhwIjoxNjE0OTEyNDM1fQ

   *       401:
   *         description: Login Denied
   *       403:
   *         description:  Login Denied
   */
  router.route('/login').post(userCtrl.login);

  /**
   * @swagger
   * /users:
   *   get:
   *     summary: Retrieve a list of TravelLog users.
   *     description: Retrieve a list of users from TravelLog.
   *     tags:
   *       - Users
   *     security:
   *       - jwt: []
   *     responses:
   *       200:
   *         description: A list of users.
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/DBUser'
   *       401:
   *         description: Permission insufficient
   *       403:
   *         description: Permission insufficient
   */
  router.route('/users').get(jwtAuth, isAdmin, userCtrl.getList);

  /**
   * @swagger
   * /users/count:
   *   get:
   *     summary: Retrieve the amount of TravelLog users.
   *     description:  Retrieve the amount of TravelLog users.
   *     tags:
   *       - Users
   *     security: []
   *     responses:
   *       200:
   *         description: A amont of users.
   *         content:
   *           application/json:
   *             schema:
   *                 type: integer
   */
  router.route('/users/count').get(jwtAuth, isAdmin, userCtrl.count);

  /**
   * @swagger
   * /users:
   *   post:
   *     summary: Add an user to TravelLog.
   *     description:  Add an user to TravelLog.
   *     tags:
   *       - Users
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/NewUser'
   *     security:
   *       - jwt: []
   *     responses:
   *       200:
   *         description: The created user.
   *         content:
   *           application/json:
   *             schema:
   *                 $ref: '#/components/schemas/DBUser'
   *       401:
   *         description: Permission insufficient
   *       403:
   *         description: Permission insufficient
   */
  router.route('/users').post(userCtrl.setRoleAndProvider, userCtrl.insert, userCtrl.show);

  /**
   * @swagger
   * /users/{id}:
   *   get:
   *     summary: Retrieve a specific TravelLog user.
   *     description: Retrieve a specific TravelLog user.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: String ID of the user to retrieve.
   *         schema:
   *           type: string
   *     tags:
   *       - Users
   *     security:
   *       - jwt: []
   *     responses:
   *       200:
   *         description: The User.
   *         content:
   *           application/json:
   *             schema:
   *                 $ref: '#/components/schemas/DBUser'
   *       401:
   *         description: Permission insufficient
   *       403:
   *         description: Permission insufficient
   *       500:
   *         description: User not found
   */
  router.route('/users/:userId').get(jwtAuth, isOwner, userCtrl.show);

  /**
   * @swagger
   * /users/{id}:
   *   put:
   *     summary: Update an user at TravelLog.
   *     description:  Update an user at TravelLog.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: String ID of the user to update.
   *         schema:
   *           type: string
   *     tags:
   *       - Users
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/NewUser'
   *     security:
   *       - jwt: []
   *     responses:
   *       200:
   *         description: The created user.
   *         content:
   *           application/json:
   *             schema:
   *                 $ref: '#/components/schemas/DBUser'
   *       500:
   *         description: User not found
   *       401:
   *         description: Permission insufficient
   *       403:
   *         description: Permission insufficient
   */
  router.route('/users/:userId').put(jwtAuth, isOwner, protectRole,  userCtrl.update, userCtrl.show);


  /**
   * @swagger
   * /users/{id}:
   *   delete:
   *     summary: Delete an user at TravelLog.
   *     description:  Delete an user at TravelLog.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: String ID of the user to update.
   *         schema:
   *           type: string
   *     tags:
   *       - Users
   *     security:
   *       - jwt: []
   *     responses:
   *       200:
   *         description: User successfully deleted
   *       500:
   *         description: User not found
   *       401:
   *         description: Permission insufficient
   *       403:
   *         description: Permission insufficient
   */
  router.route('/users/:userId').delete(jwtAuth,isAdmin, userCtrl.delete);

  router.param('userId', userCtrl.load);

}
