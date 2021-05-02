import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../server/models/user';
import POI from '../server/models/poi';
import {createAndSaveUsers} from './helpers';
import {IPOI, IPOIDocument} from '../server/models/types';

dotenv.config({path: '.env.test'});

mongoose.connect(process.env.MONGODB_URI, {useNewUrlParser: true});
const db = mongoose.connection;

const clearDB = () => Promise.all([User.deleteMany({}), POI.deleteMany({})]);

beforeEach(async () => await clearDB());
afterEach(async () => await clearDB());

describe('POI Model', () => {
  it('should not be possible to create a POI with missing properties', async () => {
    try {
      await new POI().save();
      throw Error('This should fail with an error!');
    } catch (err) {
      const errors = err.errors;
      expect(errors.creator).toBeDefined();
      expect(errors.creator.kind).toBe('required');
      expect(errors.name).toBeDefined();
      expect(errors.name.kind).toBe('required');
      expect(errors.loc).toBeDefined();
      expect(errors.loc.kind).toBe('required');
    }
  });
  it('should store a POI', async () => {
    const savedUsers = await createAndSaveUsers(1);
    const poi: IPOI = {
      name: 'POI1',
      loc: {coordinates: [1, 1]},
      creator: savedUsers[0]._id,
      type: 'museum'
    };
    const savedPOI = await new POI(poi).save();
    expect(savedPOI._id).toBeDefined();
    expect(savedPOI.createdAt).toBeDefined();
    expect(savedPOI.name).toBe('POI1');
    expect(savedPOI.loc.coordinates.length).toBe(2);
    expect(savedPOI.creator).toEqual(savedUsers[0]._id);
  });
  it('should resolve the creator when retrieved with load', async () => {
    const savedUsers = await createAndSaveUsers(1);
    const poi: IPOI = {
      name: 'POI1',
      loc: {coordinates: [1, 1]},
      creator: savedUsers[0]._id,
      type: 'museum'
    };
    const savedPOI = await new POI(poi).save();
    const readPOI: IPOIDocument = await POI.load(savedPOI._id);
    expect(readPOI._id).toBeDefined();
    expect(readPOI.createdAt).toBeDefined();
    expect(readPOI.name).toBe('POI1');
    expect(readPOI.loc.coordinates.length).toBe(2);
    const creator = readPOI.creator as {_id: string, username: string}
    expect(creator._id).toEqual(savedUsers[0]._id);
    expect(creator.username).toBe(savedUsers[0].username);
  })
});
