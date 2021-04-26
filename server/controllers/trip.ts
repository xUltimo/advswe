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
    this.model.find({creator: req.user._id}, this.projection)
      .populate('creator')
      .select('-pois')
      .then(l => res.json(l))
      .catch(err => res.status(500).json({message: err}));

  getPaginatedList = (req, res) => {
    const rowsPerPage = +req.query?.size || 10;
    const page = req.query.page || 0;

    this.model.find({}, (err, docs) => {
        if (err) {
          return console.error(err);
        }
        res.json(docs);
      }).skip(rowsPerPage*page).limit(rowsPerPage).select('-pois');
  }


  addPoi = (req, res) => {
    this.model.findOneAndUpdate({_id: req.trips._id}, {$addToSet: {pois: req.pois._id}}, {new: true})
      .populate('pois')
      .then(l => res.json(l))
      .catch(err => res.status(500).json({message: err}));
  };

  removePoi = (req, res) => {
    this.model.findOneAndUpdate({_id: req.trips._id}, {$pull: {pois: req.pois._id}}, {new: true})
      .populate('pois')
      .then(l => res.json(l))
      .catch(err => res.status(500).json({message: err}));
  };

}
