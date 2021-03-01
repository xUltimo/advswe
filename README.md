# Angular Full Stack 
[![](https://github.com/davideviolante/Angular-Full-Stack/workflows/Build/badge.svg)](https://github.com/DavideViolante/Angular-Full-Stack/actions?query=workflow%3ABuild) [![](https://github.com/davideviolante/Angular-Full-Stack/workflows/Tests/badge.svg)](https://github.com/DavideViolante/Angular-Full-Stack/actions?query=workflow%3ATests) [![Dependencies](https://david-dm.org/DavideViolante/Angular-Full-Stack.svg)](https://david-dm.org/DavideViolante/Angular-Full-Stack) [![Donate](https://img.shields.io/badge/paypal-donate-179BD7.svg)](https://www.paypal.me/dviolante)


This project is based on Davide Violantes and Another Code Artist Angular Full Stack starter project. The major difference to the original project is that server- and client-side are all tested with jest. Additionally this project integrates passport for validating the JWT token.

The frontend is generated with Angular CLI. The backend is made from scratch. Whole stack in TypeScript.


This project uses the [MEAN stack](https://en.wikipedia.org/wiki/MEAN_(software_bundle)):
* [**M**ongoose.js](http://www.mongoosejs.com) ([MongoDB](https://www.mongodb.com)): database
* [**E**xpress.js](http://expressjs.com): backend framework
* [**A**ngular 2+](https://angular.io): frontend framework
* [**N**ode.js](https://nodejs.org): runtime environment

Other tools and technologies used:
* [Angular CLI](https://cli.angular.io): frontend scaffolding
* [Bootstrap](http://www.getbootstrap.com): layout and styles
* [Font Awesome](http://fontawesome.com): icons
* [JSON Web Token](https://jwt.io): user authentication
* [Angular 2 JWT](https://github.com/auth0/angular2-jwt): JWT helper for Angular 2+
* [Bcrypt.js](https://github.com/dcodeIO/bcrypt.js): password encryption
* [Jest](https://facebook.github.io/jest/): Javascript Testing
* [Passport] (http://passportjs.org/): Authentication Strategies 

## Prerequisites
1. Install [Node.js](https://nodejs.org) and [MongoDB](https://www.mongodb.com)
2. Install Angular CLI: `npm i -g @angular/cli`
3. From project root folder install all the dependencies: `npm i`

## Run
### Development mode
`npm run dev`: [concurrently](https://github.com/kimmobrunfeldt/concurrently) execute MongoDB, Angular build, TypeScript compiler and Express server.

A window will automatically open at [localhost:4200](http://localhost:4200). Angular and Express files are being watched. Any change automatically creates a new bundle, restart Express server and reload your browser.

### Production mode
`npm run prod`: run the project with a production bundle and AOT compilation listening at [localhost:3000](http://localhost:3000) 

## Please open an issue if
* you have any suggestion to improve this project
* you noticed any problem or error

## Running tests
Run `ng test` to execute the frontend unit tests via [Karma](https://karma-runner.github.io).

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

Run `npm run testbe` to execute the backend tests via [Mocha](https://mochajs.org/) (it requires `mongod` already running).

## Running linters
Run `npm run lint` to execute [TS linting](https://github.com/palantir/tslint), [HTML linting](https://github.com/htmlhint/HTMLHint) and [SASS linting](https://github.com/sasstools/sass-lint).

## Wiki
To get more help about this project, [visit the official wiki](https://github.com/DavideViolante/Angular-Full-Stack/wiki).

## Further help
To get more help on the `angular-cli` use `ng --help` or go check out the [Angular-CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

### Author
* [Thomas Schirgi](https://github.com/schirgitom)
* [AnotherCodeArtist] (https://github.com/AnotherCodeArtist)
* Based on [Davide Violante] (https://github.com/DavideViolante)
