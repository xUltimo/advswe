import {IPOI, IUser, IUserDocument, IPOIDocument, ITrip, ITripDocument} from '../server/models/types';
import User from '../server/models/user';
import POI from '../server/models/poi';
import Trip from '../server/models/trip';
import * as jwt from 'jsonwebtoken';


export const range = (size: number): Array<number> =>
  Array.from(new Array(size + 1).keys()).slice(1);

export const createUsers = (number, prefix = 'user', role = 'user'): Array<IUser> =>
  range(number).map(nr => ({
    username: `${prefix}${nr}`,
    email: `${prefix}${nr}@test.com`,
    password: 'topsecret',
    provider: 'local',
    role : role
  }));

export const saveUsers = (users: Array<IUser>): Promise<IUserDocument[]> =>
  Promise.all(users.map(u => new User(u).save()));

export const createAndSaveUsers =
  (number, prefix = 'user', role = 'user'): Promise<IUserDocument[]>  =>
    saveUsers(createUsers(number, prefix, role));

export const getToken = (user: IUser) => jwt.sign({ user: user }, process.env.SECRET_TOKEN);

export const createPOIs = (number: number, creator: IUserDocument, prefix = 'poi'): Array<IPOI> =>
  range(number).map(nr => ({
    name: `${prefix}-${creator.username}-${nr}`,
    description: `${prefix}-${creator.username}-${nr} description`,
    creator: creator._id,
    type: 'sight',
    loc: { coordinates: [nr, nr]}
  }));

export const savePOIs = (pois: IPOI[]): Promise<IPOIDocument[]> =>
  Promise.all(pois.map(p => new POI(p).save()));

export const createAndSavePOIs = (number: number, creator: IUserDocument, prefix = 'poi') =>
  savePOIs(createPOIs(number, creator, prefix));

export const createTrips = (number: number, creator: IUserDocument, numberOfPOIs = 5): Array<ITrip> =>
  range(number).map( nr => ({
    name: `${creator.username}-trip-${nr}`,
    creator: creator._id,
    description: `${creator.username}-trip-${nr}-description`,
    pois: createPOIs(numberOfPOIs, creator, `${creator.username}-trip-${nr}`)
  }));

export const saveTrips = (trips: ITrip[]): Promise<ITripDocument[]> =>
  Promise.all(trips.map( t => savePOIs(t.pois as IPOI[])
    .then(p => p.map(v => v._id))
    .then( p => t.pois = p)
    .then(() => Trip.create(t))
  ));

export const createAndSaveTrips = (number: number, creator: IUserDocument, numberOfPOIs = 5): Promise<ITripDocument[]> =>
  saveTrips(createTrips(number, creator, numberOfPOIs));

