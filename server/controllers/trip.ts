import Trip from '../models/trip';
import BaseCtrl from './base';
import {ITripDocument} from '../models/types';

export default class TripCtrl extends BaseCtrl<ITripDocument> {
  projection: '_id, name, creator, createdAt';
  model = Trip;

  setCreator = (req, res, next) => {
    req.body.creator = req.user._id;
    next();
  };

  getOwnList = (req, res) =>
    this.model.find({creator: req.body.creator}, this.projection)
      .then(l => res.json(l))
      .catch(err => res.status(500).json({message: err}));

  addPoi = (req, res) => {
    super.insert(req, res, addPoi => this.model.update({creator: req.body.creator}, this.projection)
      .then(l => res.json(l))
      .catch(err => res.status(500).json({message: err})));
  }
}
