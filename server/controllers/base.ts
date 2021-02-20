import {catController} from '../logging';
import mongoose from 'mongoose';

abstract class BaseCtrl<T extends mongoose.Document> {

// Defines the Model that is used for all CRUD operations
  abstract model: mongoose.Model<T>;
  // A string representing a space-separated list of fields that should be
  // returned by getList()
  abstract projection: string;


  // Get all enities of type model
  getAll = (req, res) => {
    // #swagger.tags = ['User', 'Trip']

    this.model.find({})
      .then(docs => res.json(docs))
      .catch(err => {
        catController.error('Error while finding documents', err);
        res.status(500).send({message: err})
      });
  }


  // Returns all entities but only those fields contained in 'projection'
  getList = (req, res) => {
    this.model.find({}, this.projection)
      .then(l => res.json(l))
      .catch(err => res.status(500).json({message: err}));
  }

  /*
    loads a single instance from the database. If this instance is found and the schema
    defines a 'static' method called 'load' (which is assumed to also load all referenced
    entities, then the schema's 'load' method is called.
    In any case the entity found is added to the req object, making it available to
    successive middleware functions along the route.
  */
  load = (req, res, next, id) =>
    this.model.findById(id)
      .then(m => (this.model.hasOwnProperty('load')) ? this.model['load'](m._id) : m)
      .then(m => {
        if (m == null) {throw new Error('Element not found')};
        catController.debug('Loaded entity: ' + JSON.stringify(m));
        req[this.model.collection.collectionName] = m})
      .then(() => next())
      .catch(err => res.status(500).json({message: `Could not load this element (${err})`}));

  // Return the result stored in the request object
  show = (req, res) => res.json(req[this.model.collection.collectionName]);

  // Count all
  count = (req, res) => {
    /*  #swagger.tags = ['User']
        #swagger.description = 'Endpoint to add a user.' */

    this.model.count({}).then(count => res.json(count))
      .catch(err => res.status(500).json({message: err}));
  };

  /*
   Inserts a new entity to the database and returns the stored entity, If the schema
    defines a 'static' method called 'load' (which is assumed to also load all referenced
    entities, then the schema's 'load' method is called.
  */
  insert = (req, res, next) => {
    const obj = new this.model(req.body);
    obj.save()
      .then(m => (this.model.hasOwnProperty('load')) ? this.model['load'](m._id) : m)
      .then(m => req[this.model.collection.collectionName] = m)
      .then(() => next())
      .catch(err => err.code === 11000 ? next(err) : res.status(err.code === 11000 ? 400 : 500).json({message: err}));
  };

  // Get by id
  get = (req, res, next) => {
    this.model.findOne({ _id: req.params.id })
      .then(m => req[this.model.collection.collectionName] = m)
      .then(() => next())
      .catch(err => res.status(500).json({message: err}));
  };

  // Update by id
  update = (req, res, next) =>
    this.model.findOneAndUpdate({ _id: req[this.model.collection.collectionName]._id }, req.body, {new: true})
      .then(m => (this.model.hasOwnProperty('load')) ? this.model['load'](m._id) : m)
      .then(m => req[this.model.collection.collectionName] = m)
      .then(() => next())
      .catch(err => {
        catController.error(`Could not update id=${req[this.model.collection.collectionName]._id}`, err);
        res.status(500).json({message: err});
      });

  // Delete by id
  delete = (req, res) =>
    this.model.findOneAndRemove({ _id: req[this.model.collection.collectionName]._id })
      .then(() => res.sendStatus(200))
      .catch((err) => {
        catController.error(`Could not delete id=${req[this.model.collection.collectionName]._id}`, err);
        res.status(500).send({message: err})
      })

  /*
  abstract model: any;

  // Get all
  getAll = async (req, res) => {
    try {
      const docs = await this.model.find({});
      res.status(200).json(docs);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  // Count all
  count = async (req, res) => {
    try {
      const count = await this.model.count();
      res.status(200).json(count);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  // Insert
  insert = async (req, res) => {
    try {
      const obj = await new this.model(req.body).save();
      res.status(201).json(obj);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  // Get by id
  get = async (req, res) => {
    try {
      const obj = await this.model.findOne({ _id: req.params.id });
      res.status(200).json(obj);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // Update by id
  update = async (req, res) => {
    try {
      await this.model.findOneAndUpdate({ _id: req.params.id }, req.body);
      res.sendStatus(200);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }


  // Delete by id
  delete = async (req, res) => {
    try {
      await this.model.findOneAndRemove({ _id: req.params.id });
      res.sendStatus(200);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }


   */
}

export default BaseCtrl;
