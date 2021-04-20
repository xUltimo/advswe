import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../server/models/user';
import POI from '../server/models/poi';
import Trip from '../server/models/trip';
import {createAndSaveUsers, createAndSavePOIs, range} from './helpers';
import {ITripDocument, IPOI} from '../server/models/types';

dotenv.config({path: '.env.test'});

mongoose.connect(process.env.MONGODB_URI, {useNewUrlParser: true});
const db = mongoose.connection;


const clearDB = () => Promise.all([User.remove({}), POI.remove({}), Trip.remove({})]);

beforeEach(async () => await clearDB());
afterAll(async () => await clearDB());

describe('Trip model', () => {
  it('should not be possible to create a trip without necessary properties', async () => {
    const trip = new Trip();
    try {
      await trip.save();
      fail('saving empty trips is not allowed!');
    } catch (e) {
      const errors = e.errors;
      expect(errors.name).toBeDefined();
      expect(errors.name.kind).toBe('required');
      expect(errors.creator).toBeDefined();
      expect(errors.creator.kind).toBe('required');
    }
  });
  it('should be possible to create a valid trip', async () => {
    const savedUsers = await createAndSaveUsers(1);
    const savedTrip = await Trip.create({name: 'myTrip', creator: savedUsers[0]._id});
    // const savedTrip: ITripModel = await trip.save();
    expect(savedTrip.name).toBe('myTrip');
    expect(savedTrip._id).toBeDefined();
    expect(savedTrip.createdAt).toBeDefined();
    expect(savedTrip.pois).toBeInstanceOf(Array);
    expect(savedTrip.pois).toHaveLength(0);
  });
  it('should load a trip with all its details', async () => {
    const savedUsers = await createAndSaveUsers(1);
    const savedPOIs = await createAndSavePOIs(5, savedUsers[0]);
    const trip = {
      name: 'myTrip',
      description: 'myDescription',
      creator: savedUsers[0]._id,
      pois: savedPOIs.map(p => p._id)
    };
    const lookUpTrip = await Trip.create(trip);
    const savedTrip = await Trip.load(lookUpTrip._id);
    expect(savedTrip.name).toBe('myTrip');
    const creator = savedTrip.creator as {_id: string, username: string}
    expect(creator.username).toBe(savedUsers[0].username);
    expect(creator._id.toString()).toBe(savedUsers[0]._id.toString());
    expect(savedTrip._id).toBeDefined();
    expect(savedTrip.createdAt).toBeDefined();
    expect(savedTrip.pois).toBeInstanceOf(Array);
    expect(savedTrip.pois).toHaveLength(5);
    const pois = savedTrip.pois as IPOI[];
    for (let i of range(5)) {
      expect(pois[i - 1].name).toEqual(savedPOIs[i - 1].name);
      expect(pois[i - 1].loc.toString()).toEqual(savedPOIs[i - 1].loc.toString());
    }
  });
  it('should support a findById function', async () => {
    const savedUsers = await createAndSaveUsers(1);
    const savedPOIs = await createAndSavePOIs(5, savedUsers[0]);
    const trip = {
      name: 'myTrip',
      description: 'myDescription',
      creator: savedUsers[0]._id,
      pois: savedPOIs.map(p => p._id)
    }
    const lookUpTrip = await Trip.create(trip);
    const savedTrip: ITripDocument = await Trip.findById(new mongoose.Types.ObjectId(lookUpTrip._id.toString()));
    expect(savedTrip.name).toBe('myTrip');
    expect(savedTrip.creator.toString()).toBe(savedUsers[0]._id.toString());
    expect(savedTrip._id).toBeDefined();
    expect(savedTrip.createdAt).toBeDefined();
    expect(savedTrip.pois).toBeInstanceOf(Array);
    expect(savedTrip.pois).toHaveLength(5);
  });
});
