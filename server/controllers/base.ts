import * as mongoose from 'mongoose';

abstract class BaseCtrl<T extends mongoose.Document> {

  // Defines the Model that is used for all CRUD operations
  abstract model: mongoose.Model<T>;
  // A string representing a space-separated list of fields that should be
  // returned by getList()
  abstract projection: string;


  // Get all enities of type model
  getAll = (req, res) => {
    this.model.find({}, (err, docs) => {
      if (err) { return console.error(err); }
      res.json(docs);
    });
  };

  // Returns all entities but only those fields contained in 'projection'
  getList = (req, res) =>
    this.model.find({}, this.projection)
      .then(l => res.json(l))
      .catch(err => res.status(500).json({message: err}));

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
        req[this.model.collection.collectionName] = m})
      .then(() => next())
      .catch(err => res.status(500).json({message: `Could not load this element (${err})`}));

  // Return the result stored in the request object
  show = (req, res) => res.json(req[this.model.collection.collectionName]);

  // Count all
  count = (req, res) => {
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
      .catch(err => res.status(err.code === 11000 ? 400 : 500).json({message: err}));
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
        console.error(err);
        res.status(500).json({message: err});
      });

  // Delete by id
  delete = (req, res) => {
    this.model.findOneAndRemove({ _id: req[this.model.collection.collectionName]._id }, (err) => {
      if (err) { return console.error(err); }
      res.sendStatus(200);
    });
  };
}

export default BaseCtrl;
