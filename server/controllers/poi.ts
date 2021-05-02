import BaseCtrl from './base';
import POI from '../models/poi';
import {IPOIDocument } from '../models/types';
import fs from 'fs';
import mongoose from 'mongoose';
import sharp from 'sharp';
import {createBucket} from 'mongoose-gridfs';
import {logger} from "codelyzer/util/logger";


export default class POICtrl extends BaseCtrl<IPOIDocument> {
  model = POI;
  projection: '_id, name, creator, createdAt';

  setCreatorAndLocType = (req, res, next) => {
    req.body.creator = req.user._id;
    req.body.loc.type = 'Point';
    next();
  };

  deleteFromTrip = (req, res, next) => {
    this.model.deleteMany({_id: req.trips.pois})
      .then(() => next())
      .catch(err => console.error(err));
  };

  addImage = (req, res) => {
    const file = req.file;
    const deleteFile = () => fs.unlinkSync(file.path);
    const _id = mongoose.Types.ObjectId();

    const maxDimension = parseInt(process.env.MAX_IMAGE_DIMENSION || '500', 10);

    const fileOptions = {
      _id,
      filename: _id.toString() + '_' + file.originalname,
      contentType: file.mimetype,
      metadata: {
        poi: req.pois._id,
        creator: req.user.username
      }
    };

    const wStream = createBucket().createWriteStream(fileOptions);

    sharp(file.path).resize(maxDimension).toBuffer()
      .then(img => wStream.write(img))
      .then(a => wStream.end())
      .then(() => {
        const poi = req.pois;
        deleteFile();
        poi.images.push({
          description: req.body.description,
          id: _id,
          uploaded: Date.now(),
          user: req.user.username
        });
        return poi.save();
      })
      .then(p => res.json(p))
  };

  downloadImage = (req, res) => {
    try {
      const bucket = createBucket();
      const id = mongoose.Types.ObjectId(req.params.imageId);

      bucket.findOne({_id: id}, (err, file) => {
        if (err) {
          logger.error('Could not read image from database', err);
          res.status(500).json({message: (err.message || err)})
        } else {
          res.set('Content-Type', file.contentType);
          bucket.createReadStream({_id: id}).pipe(res);
        }
      });
    } catch (err) {
      res.status(500).json({message: err.message})
    }
  };
}
