import * as mongoose from 'mongoose';
import {IPOIDocument, IPOIModel} from './types';

const geoJSONPoint = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point'
  },
  coordinates: {
    type: [Number, Number],
    required: true
  }
});

const poiSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  loc: {
    type: geoJSONPoint,
    required: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
   images: [
     {
       id: mongoose.Schema.Types.ObjectId,
       description: String,
       uploaded: {
         type: Date,
         default: Date.now
       },
       user: String,
     }
   ]
});

poiSchema.index({
  loc: '2dsphere'
});


poiSchema.statics.load = function(id: mongoose.Schema.Types.ObjectId) {
  return this.findOne({
    _id: id
  }).populate('creator', 'username');
};

const POI: IPOIModel = mongoose.model<IPOIDocument, IPOIModel>('POI', poiSchema);

export default POI;
