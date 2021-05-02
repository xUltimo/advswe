import supertest from 'supertest';
import dotenv from 'dotenv';
dotenv.config({path: '.env.test'});
import mongoose from 'mongoose';
import {app} from '../server/app';
import POI from '../server/models/poi';
import User from '../server/models/user';
import {IPOI, IPOIDocument, IUser} from '../server/models/types';
import {createUsers, saveUsers, getToken, createAndSaveUsers, createAndSavePOIs} from './helpers';
import fs from 'fs';


mongoose.connect(process.env.MONGODB_URI, {useNewUrlParser: true});
const db = mongoose.connection;

const clearDB = () => Promise.all([User.deleteMany({}),
  POI.deleteMany({}),
  db.collection('fs.chunks').remove({}),
  db.collection('fs.files').remove({})
]);



beforeEach(async () => await clearDB());
afterAll(async () => await clearDB());

const poi: IPOI = {
  name: 'myPOI',
  description: 'a description',
  loc : {coordinates: [1, 2]},
  creator: new mongoose.Schema.Types.ObjectId('1234'),
  type: 'museum'
};

describe('Create POIs', () => {
  it('should not be possible to create a new POI without being logged-in', async () => {
    const createResponse = await supertest(app).post('/api/pois').send(poi);
    expect(createResponse.status).toBe(401);
  });
  it('should be possible to create a POI if logged-in', async () => {
    const savedUsers = await saveUsers(createUsers(1));
    const createResponse = await supertest(app).post('/api/pois')
      .set('Authorization', `Bearer ${getToken(savedUsers[0])}`)
      .send(poi);
    expect(createResponse.status).toBe(200);
    const savedPOI: IPOIDocument = createResponse.body;
    expect(savedPOI._id).toBeDefined();
    expect(savedPOI.name).toBe(poi.name);
    expect(savedPOI.description).toBe(poi.description);
    expect(savedPOI.createdAt).toBeDefined();
    const creator = savedPOI.creator as {_id: string, username: string};
    expect(creator._id.toString()).toEqual(savedUsers[0]._id.toString());
    expect(savedPOI.loc.coordinates).toEqual(poi.loc.coordinates);
  });
});

describe('Delete POIs', () => {
  it('should not be possible to delete POIs without authentication', async () => {
    const savedUsers = await saveUsers(createUsers(1));
    poi.creator = savedUsers[0];
    const savedPOI = await new POI(poi).save();
    const deleteResponse = await supertest(app).delete(`/api/pois/${savedPOI._id}`);
    expect(deleteResponse.status).toBe(401);
  });
  it('should be possible to delete your own POIs', async () => {
    const savedUsers = await saveUsers(createUsers(1));
    poi.creator = savedUsers[0];
    const savedPOI = await new POI(poi).save();
    const deleteResponse = await supertest(app).delete(`/api/pois/${savedPOI._id}`)
      .set('Authorization', `Bearer ${getToken(savedUsers[0])}`);
    expect(deleteResponse.status).toBe(200);
  });
  it('should not be possible to delete somebody else\'s POIs', async () => {
    const savedUsers = await saveUsers(createUsers(2));
    poi.creator = savedUsers[0];
    const savedPOI = await new POI(poi).save();
    const deleteResponse = await supertest(app).delete(`/api/pois/${savedPOI._id}`)
      .set('Authorization', `Bearer ${getToken(savedUsers[1])}`);
    expect(deleteResponse.status).toBe(403);
  });
  it('should be possible for admins to delete POIs', async () => {
    const savedUsers = await saveUsers(createUsers(2));
    const savedAdmins = await saveUsers(createUsers(1, 'admin', 'admin'));
    poi.creator = savedUsers[0];
    const savedPOI = await new POI(poi).save();
    const deleteResponse = await supertest(app).delete(`/api/pois/${savedPOI._id}`)
      .set('Authorization', `Bearer ${getToken(savedAdmins[0])}`);
    expect(deleteResponse.status).toBe(200);
  });
});

describe('Update POIs', () => {
  it('should be possible to change your own pois', async () => {
    const savedUsers = await saveUsers(createUsers(1));
    poi.creator = savedUsers[0];
    const savedPOI = await new POI(poi).save();
    poi.name = 'changed POI';
    const updateResponse = await supertest(app).put(`/api/pois/${savedPOI._id}`)
      .set('Authorization', `Bearer ${getToken(savedUsers[0])}`).send(poi);
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.name).toBe('changed POI');
  });
  it('should not be possible to change someone else\'s pois', async () => {
    const savedUsers = await saveUsers(createUsers(2));
    poi.creator = savedUsers[0];
    const savedPOI = await new POI(poi).save();
    poi.name = 'changed POI';
    const updateResponse = await supertest(app).put(`/api/pois/${savedPOI._id}`)
      .set('Authorization', `Bearer ${getToken(savedUsers[1])}`).send(poi);
    expect(updateResponse.status).toBe(403);
  });
  it('should not be possible to change someone else\'s pois even for admins', async () => {
    const savedUsers = await saveUsers(createUsers(1));
    const savedAdmins = await saveUsers(createUsers(1, 'admin', 'admin'));
    poi.creator = savedUsers[0];
    const savedPOI = await new POI(poi).save();
    poi.name = 'changed POI';
    const updateResponse = await supertest(app).put(`/api/pois/${savedPOI._id}`)
      .set('Authorization', `Bearer ${getToken(savedAdmins[0])}`).send(poi);
    expect(updateResponse.status).toBe(403);
  });
  it('should not be possible to change the ownership of an existing POI', async () => {
    const savedUsers = await saveUsers(createUsers(2));
    poi.creator = savedUsers[0];
    const savedPOI = await new POI(poi).save();
    poi.name = 'changed POI';
    poi.creator = savedUsers[1]._id;
    const updateResponse = await supertest(app).put(`/api/pois/${savedPOI._id}`)
      .set('Authorization', `Bearer ${getToken(savedUsers[0])}`).send(poi);
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.name).toBe('changed POI');
    expect(updateResponse.body.creator._id.toString()).toBe(savedUsers[0]._id.toString());
  });
});


//Image tests
describe('Add Image', () => {
  it('should support adding images to POIs', async () => {
    const savedUsers = await createAndSaveUsers(1);
    const pois = await createAndSavePOIs(3, savedUsers[0]);
    const poiToAddImage = pois[0];
    const addImageResponse = await supertest(app)
      .post(`/api/pois/${poiToAddImage._id}/image`)
      .set('Authorization', `Bearer ${getToken(savedUsers[0])}`)
      .field('description', 'A Test Image')
      .attach('file', fs.createReadStream('test/images/test.png'));
    expect(addImageResponse.status).toBe(200);
    const updatedPOI = await POI.load(poiToAddImage._id);
    expect(updatedPOI.images).toBeInstanceOf(Array);
    expect(updatedPOI.images).toHaveLength(1);
    const testImage = updatedPOI.images[0];
    expect(testImage.description).toBe('A Test Image');
  });
  it('should not be possible to add images to somebody else\'s POIs', async () => {
    const savedUsers = await createAndSaveUsers(2);
    const pois = await createAndSavePOIs(3, savedUsers[0]);
    const poiToAddImage = pois[0];
    const addImageResponse = await supertest(app)
      .post(`/api/pois/${poiToAddImage._id}/image`)
      .set('Authorization', `Bearer ${getToken(savedUsers[1])}`)
      .field('description', 'A Test Image')
      .attach('file', fs.createReadStream('test/images/test.png'));
    expect(addImageResponse.status).toBe(403);
  });
});

describe('Get Image', () => {
  it('should be possible to download any image', async () => {
    const savedUsers = await createAndSaveUsers(1);
    const pois = await createAndSavePOIs(3, savedUsers[0]);
    const poiToAddImage = pois[0];
    const addImageResponse = await supertest(app)
      .post(`/api/pois/${poiToAddImage._id}/image`)
      .set('Authorization', `Bearer ${getToken(savedUsers[0])}`)
      .field('description', 'A Test Image')
      .attach('file', fs.createReadStream('test/images/test.png'));
    expect(addImageResponse.status).toBe(200);
    const poiWithImage = await POI.findOne({_id: poiToAddImage._id});
    const imageId = poiWithImage.images[0].id;
    const getImageResponse = await supertest(app)
      .get(`/api/pois/images/${imageId}`)
      .set('Authorization', `Bearer ${getToken(savedUsers[0])}`);
    expect(getImageResponse.status).toBe(200);
    expect(getImageResponse.type).toEqual('image/png')
  });
});
