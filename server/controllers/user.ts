import * as jwt from 'jsonwebtoken';

import User from '../models/user';
import BaseCtrl from './base';
import {IUserDocument} from '../models/types';

export default class UserCtrl extends BaseCtrl<IUserDocument> {
  model = User;
  projection = '_id username email';

  login = (req, res) => {
    /*
    #swagger.tags = ['User']
    #swagger.description = 'Endpoint to sign in a specific user'
    */
    this.model.findOne({email: req.body.email}, (err, user) => {
      if (!user) {
        return res.sendStatus(403);
      }
      user.comparePassword(req.body.password, (error, isMatch) => {
        if (!isMatch) {
          return res.sendStatus(403);
        }
        // const token = jwt.sign({user}, process.env.SECRET_TOKEN); // , { expiresIn: 10 } seconds
        var secret = process.env.SECRET_TOKEN;
        const token = jwt.sign({ user: user }, secret, { expiresIn: '8h'}); // , { expiresIn: 10 } seconds
        res.status(200).json({token});
      });
    });
  }

  insert = (req, res, next) => {
    const obj = new this.model(req.body);
    obj.save()
      .then(m => (this.model.hasOwnProperty('load')) ? this.model['load'](m._id) : m)
      .then(m => req[this.model.collection.collectionName] = m)
      .then(() => next())
      .catch(err => err.code === 11000 ?
        res.status(400).json({message: 'Sorry, but this username/email is already in use!'}) :
        res.status(400).json({message: err.message || err}));
  };

  setRoleAndProvider = (req, res, next) =>  {
    req.body.role = 'user';
    req.body.provider = 'local';
    next();
  }

}
