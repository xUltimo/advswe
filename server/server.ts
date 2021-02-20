import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config({ path: '.env' });
import {app} from './app';
import {catSystem} from './logging';
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true } );
const db = mongoose.connection;
(<any>mongoose).Promise = global.Promise;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  catSystem.info('____________ Connected to MongoDB _________________');
  catSystem.info('Database: ' + process.env.MONGODB_URI);
 /* ioServer.listen(process.env.WSPORT || 4700, () => {
    console.log('WebSockets are available at port ' + (process.env.WSPORT || 4700));
  }); */
  app.listen(app.get('port'), () => {
    catSystem.info('Angular Full Stack listening on port ' + app.get('port'));
  });
});



