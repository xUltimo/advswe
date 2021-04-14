import BaseCtrl from './base';
import POI from '../models/poi';
import {IPOIDocument } from '../models/types';


export default class POICtrl extends BaseCtrl<IPOIDocument> {
  model = POI;
  projection: '_id, name, creator, createdAt';

  setCreatorAndLocType = (req, res, next) => {
    req.body.creator = req.user._id;
    req.body.loc.type = 'Point';
    next();
  };
}
