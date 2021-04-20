import supertest from 'supertest';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
const config = dotenv.config({path: '.env.test'});
//console.log(config.pased);
import {app} from '../server/app';
import POI from '../server/models/poi';
import User from '../server/models/user';
import Trip from '../server/models/trip';
import {IPOI} from '../server/models/types';
import {createAndSaveUsers, getToken, createAndSaveTrips, range, saveUsers} from './helpers';


mongoose.connect(process.env.MONGODB_URI, {useNewUrlParser: true});
const db = mongoose.connection;

const clearDB = () => {
  console.log('Delete all database entries!');
  return Promise.all([User.deleteMany({}),
    POI.deleteMany({}), Trip.deleteMany({})]);
}


beforeEach(async () => await clearDB());
afterAll(async () => await clearDB());

describe('Create Trips', () => {
  it('should not be possible to create trips without being logged-in', async () => {
    const savedUsers = await createAndSaveUsers(1);
    const trip = {
      name: 'myTrip',
      loc: { coordinates: [31, 21]}
    }
    const createResponse = await supertest(app).post('/api/trips').send(trip);
    expect(createResponse.status).toBe(401);
  });
  it('should be possible to create a trip when logged-in', async () => {
    const savedUsers = await createAndSaveUsers(1);
    const trip = {
      name: 'myTrip',
      loc: { coordinates: [31, 21]}
    }
    const createResponse = await supertest(app).post('/api/trips')
      .set('Authorization', `Bearer ${getToken(savedUsers[0])}`)
      .send(trip);
    expect(createResponse.status).toBe(200);
    expect(createResponse.body.name).toBe('myTrip');
    expect(createResponse.body._id).toBeDefined();
    expect(createResponse.body.pois).toBeInstanceOf(Array);
    expect(createResponse.body.pois).toHaveLength(0);
    expect(createResponse.body.creator._id.toString()).toBe(savedUsers[0]._id.toString());
    expect(createResponse.body.creator.username).toBe(savedUsers[0].username);
  });
  it('should be impossible to create trips on somebody else\'s behalf', async () => {
    const savedUsers = await createAndSaveUsers(2);
    const trip = {
      name: 'myTrip',
      loc: { coordinates: [31, 21]},
      creator: savedUsers[1]._id
    }
    const createResponse = await supertest(app).post('/api/trips')
      .set('Authorization', `Bearer ${getToken(savedUsers[0])}`)
      .send(trip);
    expect(createResponse.status).toBe(200);
    expect(createResponse.body.name).toBe('myTrip');
    expect(createResponse.body._id).toBeDefined();
    expect(createResponse.body.pois).toBeInstanceOf(Array);
    expect(createResponse.body.pois).toHaveLength(0);
    expect(createResponse.body.creator._id.toString()).toBe(savedUsers[0]._id.toString());
    expect(createResponse.body.creator.username).toBe(savedUsers[0].username);
  });
});

describe('Update Trips', () => {
  it('should be possible to update your onw trip', async () => {
    const savedUsers = await createAndSaveUsers(2);
    const trip = {
      name: 'myTrip',
      loc: { coordinates: [31, 21]},
      creator: savedUsers[0]._id
    };
    const savedTrip = await Trip.create(trip);
    trip.name = 'My other Trip';
    const updateResponse = await supertest(app)
      .put(`/api/trips/${savedTrip._id}`)
      .set('Authorization', `Bearer ${getToken(savedUsers[0])}`)
      .send(trip);
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.name).toBe('My other Trip');
    expect(updateResponse.body.creator.username).toBe(savedUsers[0].username);
  });
  it('should not be possible to update somebody else\'s trip', async () => {
    const savedUsers = await createAndSaveUsers(2);
    const trip = {
      name: 'myTrip',
      loc: { coordinates: [31, 21]},
      creator: savedUsers[0]._id
    };
    const savedTrip = await Trip.create(trip);
    trip.name = 'My other Trip';
    const updateResponse = await supertest(app)
      .put(`/api/trips/${savedTrip._id}`)
      .set('Authorization', `Bearer ${getToken(savedUsers[1])}`)
      .send(trip);
    expect(updateResponse.status).toBe(403);
  });
  it('should not be possible to change the ownership of a trip', async () => {
    const savedUsers = await createAndSaveUsers(2);
    const trip = {
      name: 'myTrip',
      loc: { coordinates: [31, 21]},
      creator: savedUsers[0]._id
    };
    const savedTrip = await Trip.create(trip);
    trip.name = 'My other Trip';
    trip.creator = savedUsers[1]._id;
    const updateResponse = await supertest(app)
      .put(`/api/trips/${savedTrip._id}`)
      .set('Authorization', `Bearer ${getToken(savedUsers[0])}`)
      .send(trip);
    // console.log('BODY: ' + JSON.stringify(updateResponse.body));
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.creator.username).toBe(savedUsers[0].username);
    expect(updateResponse.body.creator._id.toString()).toBe(savedUsers[0]._id.toString());
  });
});


describe('My Trips', () => {
  it('should be possible to get all trips of the current user', async () => {
    const savedUsers = await createAndSaveUsers(2);
    const savedTrips = await createAndSaveTrips(4, savedUsers[0]);
    const mineResponse = await supertest(app)
      .get(`/api/trips/mine`)
      .set('Authorization', `Bearer ${getToken(savedUsers[0])}`);
    expect(mineResponse.status).toBe(200);
    const trips = mineResponse.body;
    expect(trips).toHaveLength(savedTrips.length);
    range(savedTrips.length - 1).forEach(i => {
        expect(new Date(trips[i].createdAt).getTime()).toBeLessThanOrEqual(new Date(trips[i].createdAt).getTime());
        expect(trips[i - 1].creator.username).toBe(savedUsers[0].username);
        expect(trips[i - 1].begin).toBeUndefined();
        expect(trips[i - 1].name).toBeDefined();
        expect(trips[i - 1].description).toBeDefined();
      }
    );
  });
  it('should not include other user\'s trips in the result', async () => {
    const savedUsers = await createAndSaveUsers(2);
    const savedTrips = await createAndSaveTrips(4, savedUsers[0]);
    await createAndSaveTrips(5, savedUsers[1]);
    const mineResponse = await supertest(app)
      .get(`/api/trips/mine`)
      .set('Authorization', `Bearer ${getToken(savedUsers[0])}`);
    expect(mineResponse.status).toBe(200);
    const trips = mineResponse.body;
    expect(trips).toHaveLength(savedTrips.length);
    range(savedTrips.length - 1).forEach(i => {
        expect(new Date(trips[i].createdAt).getTime()).toBeLessThanOrEqual(new Date(trips[i].createdAt).getTime());
        expect(trips[i - 1].creator.username).toBe(savedUsers[0].username);
        expect(trips[i - 1].begin).toBeUndefined();
        expect(trips[i - 1].name).toBeDefined();
        expect(trips[i - 1].pois).toBeUndefined();
        expect(trips[i - 1].description).toBeDefined();
      }
    );
  });
  it('should not be possible to get trips if the user is not logged in', async () => {
    const mineResponse = await supertest(app)
      .get(`/api/trips/mine`);
    expect(mineResponse.status).toBe(401);
  });
});
describe('List trips', () => {
  it('should be possible to list all trips in a paginated fashion (if logged in)', async () => {
    const savedUsers = await createAndSaveUsers(5);
    const savedTrips = await savedUsers.map(user => createAndSaveTrips(5, user));
    const page1Response = await supertest(app)
      .get(`/api/trips`)
      .set('Authorization', `Bearer ${getToken(savedUsers[1])}`);
    expect(page1Response.status).toBe(200);
    const page1 = page1Response.body;
    expect(page1).toHaveLength(10);
    const page2Response = await supertest(app)
      .get(`/api/trips?page=1`)
      .set('Authorization', `Bearer ${getToken(savedUsers[1])}`);
    const page2 = page2Response.body;
    expect(page2).toHaveLength(10);
    const page3Response = await supertest(app)
      .get(`/api/trips?page=2`)
      .set('Authorization', `Bearer ${getToken(savedUsers[1])}`);
    const page3 = page3Response.body;
    expect(page3).toHaveLength(5);
    const allTrips = page1.concat(page2).concat(page3);
    range(allTrips.length - 1).forEach(i => {
        expect(new Date(allTrips[i].createdAt).getTime()).toBeLessThanOrEqual(new Date(allTrips[i].createdAt).getTime());
        expect(allTrips[i - 1].begin).toBeUndefined();
        expect(allTrips[i - 1].name).toBeDefined();
        expect(allTrips[i - 1].description).toBeDefined();
        expect(allTrips[i - 1].pois).toBeUndefined();
      }
    );
    const pageOfSize20 = await supertest(app)
      .get(`/api/trips?page=0&size=20`)
      .set('Authorization', `Bearer ${getToken(savedUsers[1])}`);
    expect(pageOfSize20.body).toHaveLength(20);
    const pageOfSize20_1 = await supertest(app)
      .get(`/api/trips?page=1&size=20`)
      .set('Authorization', `Bearer ${getToken(savedUsers[1])}`);
    expect(pageOfSize20_1.body).toHaveLength(5);
  });
  it('should not be possible to list any trips without authentication', async () => {
    const listResponse = await supertest(app)
      .get(`/api/trips`)
    expect(listResponse.status).toBe(401);
  });
});

describe('Loading Trips', () => {
  it('should not be possible to load a trip if not authenticated', async () => {
    const savedUsers = await createAndSaveUsers(1);
    const savedTrips = await createAndSaveTrips(1, savedUsers[0]);
    const loadResponse = await supertest(app).get(`/api/trips/${savedTrips[0]._id}`);
    expect(loadResponse.status).toBe(401);
  });
  it('should be possible to load a specific Trip along with its pois', async () => {
    const savedUsers = await createAndSaveUsers(2);
    const savedTrips = await createAndSaveTrips(2, savedUsers[1]);
    const loadResponse = await supertest(app)
      .get(`/api/trips/${savedTrips[1]._id}`)
      .set('Authorization', `Bearer ${getToken(savedUsers[0])}`);
    expect(loadResponse.status).toBe(200);
    expect(loadResponse.body.name).toBe(savedTrips[1].name);
    expect(loadResponse.body.description).toBe(savedTrips[1].description);
    expect(loadResponse.body.creator.username).toBe(savedUsers[1].username);
    expect(loadResponse.body.pois).toHaveLength(5);
    loadResponse.body.pois.forEach(p => {
      expect(p.name).toBeDefined();
    });
  });
});

describe('Deleting Trips', () => {
  it('should be possible to delete your onw trips', async () => {
    const savedUsers = await createAndSaveUsers(2);
    const savedTrips = await createAndSaveTrips(2, savedUsers[1]);
    const deleteResponse = await supertest(app)
      .delete(`/api/trips/${savedTrips[1]._id}`)
      .set('Authorization', `Bearer ${getToken(savedUsers[1])}`);
    console.log(JSON.stringify(deleteResponse.body));
    expect(deleteResponse.status).toBe(200);
    const trips = await Trip.find({});
    expect(trips).toHaveLength(1);
    expect(trips[0]._id.toString()).toBe(savedTrips[0]._id.toString());
    const pois = await POI.find({});
    expect(pois).toHaveLength(savedTrips[0].pois.length);
  });
  it('should not be possible to delete somebody else\'s trips', async () => {
    const savedUsers = await createAndSaveUsers(2);
    const savedTrips = await createAndSaveTrips(2, savedUsers[1]);
    const deleteResponse = await supertest(app)
      .delete(`/api/trips/${savedTrips[1]._id}`)
      .set('Authorization', `Bearer ${getToken(savedUsers[0])}`);
    expect(deleteResponse.status).toBe(403);
  });
  it('should be possible to delete any trip if you are an admin', async () => {
    const savedUsers = await createAndSaveUsers(2);
    const admins = await createAndSaveUsers(1, 'admin', 'admin');
    const savedTrips = await createAndSaveTrips(2, savedUsers[1]);
    const deleteResponse = await supertest(app)
      .delete(`/api/trips/${savedTrips[1]._id}`)
      .set('Authorization', `Bearer ${getToken(admins[0])}`);
    console.log(JSON.stringify(deleteResponse.body));
    expect(deleteResponse.status).toBe(200);
    const trips = await Trip.find({});
    expect(trips).toHaveLength(1);
    expect(trips[0]._id.toString()).toBe(savedTrips[0]._id.toString());
    const pois = await POI.find({});
    expect(pois).toHaveLength(savedTrips[0].pois.length);
  });
});

describe('Count Trips', () => {
  it('should be possible to count trips if authenticated', async () => {
    const savedUsers = await createAndSaveUsers(5);
    const savedTrips = await [].concat.apply([],
      savedUsers.map(user => createAndSaveTrips(5, user)));
    const countResponse = await supertest(app)
      .get(`/api/trips/count`)
      .set('Authorization', `Bearer ${getToken(savedUsers[1])}`);
    expect(countResponse.status).toBe(200);
    expect(countResponse.body).toBe(25);
  });
  it('should not be possible to count trips if not authenticated', async () => {
    const countResponse = await supertest(app)
      .get(`/api/trips/count`);
    expect(countResponse.status).toBe(401);
  });
});

describe('Add POI', () => {
  it('should be possible to add a new POI to an existing trip if the current user is the owner of this trip',
    async () => {
      const savedUsers = await createAndSaveUsers(2);
      const savedTrips = await Promise.all(
        savedUsers.map(user => createAndSaveTrips(3, user, 0)));
      const allTrips = savedTrips.reduce((acc, a) => acc.concat(a), []);
      const poi: IPOI = {
        name: 'MyPOI',
        type: 'museum',
        loc: { coordinates: [2 , 4]}
      };
      const addPOIResponse = await supertest(app)
        .post(`/api/trips/${allTrips[1]._id}/addPOI`)
        .set('Authorization', `Bearer ${getToken(savedUsers[0])}`)
        .send(poi);
      expect(addPOIResponse.status).toBe(200);
      const trip = addPOIResponse.body;
      expect(trip.pois).toHaveLength(1);
    });
  it('should not be possible to add POI\'s to somebody else\'s Trips', async () => {
    const savedUsers = await createAndSaveUsers(2);
    const savedTrips = await Promise.all(
      savedUsers.map(user => createAndSaveTrips(3, user, 0)));
    const allTrips = savedTrips.reduce((acc, a) => acc.concat(a), []);
    const poi: IPOI = {
      name: 'MyPOI',
      type: 'bar',
      loc: { coordinates: [2 , 4]}
    };
    const addPOIResponse = await supertest(app)
      .post(`/api/trips/${allTrips[1]._id}/addPOI`)
      .set('Authorization', `Bearer ${getToken(savedUsers[1])}`)
      .send(poi);
    expect(addPOIResponse.status).toBe(403);
  });
});

describe('Remove POI', () => {
  it('should be possible to remove a POI from an existing trip if the current user is the owner of this trip',
    async () => {
      const savedUsers = await createAndSaveUsers(2);
      const savedTrips = await Promise.all(
        savedUsers.map(user => createAndSaveTrips(3, user, 0)));
      const allTrips = savedTrips.reduce((acc, a) => acc.concat(a), []);
      const poi: IPOI = {
        name: 'MyPOI',
        type: 'bar',
        loc: { coordinates: [2 , 4]}
      };
      let addPOIResponse = await supertest(app)
        .post(`/api/trips/${allTrips[1]._id}/addPOI`)
        .set('Authorization', `Bearer ${getToken(savedUsers[0])}`)
        .send(poi);
      expect(addPOIResponse.status).toBe(200);
      addPOIResponse = await supertest(app)
        .post(`/api/trips/${allTrips[1]._id}/addPOI`)
        .set('Authorization', `Bearer ${getToken(savedUsers[0])}`)
        .send(poi);
      expect(addPOIResponse.status).toBe(200);
      let trip = addPOIResponse.body;
      expect(trip.pois).toHaveLength(2);
      const poiToDelete = trip.pois[0]._id;
      const otherPoi = trip.pois[1]._id;
      const deletePOIResponse = await supertest(app)
        .delete(`/api/trips/${allTrips[1]._id}/${poiToDelete}`)
        .set('Authorization', `Bearer ${getToken(savedUsers[0])}`)
        .send(poi);
      expect(deletePOIResponse.status).toBe(200);
      trip = deletePOIResponse.body;
      expect(trip.pois).toHaveLength(1);
      expect(trip.pois[0]._id.toString()).toBe(otherPoi.toString());
    });

  it('should not be possible to remove a POI from somebody else\'s Trips', async () => {
    const savedUsers = await createAndSaveUsers(2);
    const savedTrips = await Promise.all(
      savedUsers.map(user => createAndSaveTrips(3, user, 0)));
    const allTrips = savedTrips.reduce((acc, a) => acc.concat(a), []);
    const poi: IPOI = {
      name: 'MyPOI',
      type: 'bar',
      loc: { coordinates: [2 , 4]}
    };
    let addPOIResponse = await supertest(app)
      .post(`/api/trips/${allTrips[1]._id}/addPOI`)
      .set('Authorization', `Bearer ${getToken(savedUsers[0])}`)
      .send(poi);
    expect(addPOIResponse.status).toBe(200);
    const poiToDelete = addPOIResponse.body.pois[0]._id;
    addPOIResponse = await supertest(app)
      .delete(`/api/trips/${allTrips[1]._id}/${poiToDelete}`)
      .set('Authorization', `Bearer ${getToken(savedUsers[1])}`)
      .send(poi);
    expect(addPOIResponse.status).toBe(403);
  });
});
