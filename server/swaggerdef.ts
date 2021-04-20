export default function getSwagger() {

  return {
    openapi: '3.0.0',
    info: {
      title: "Travel Log Server with Swagger",
      version: '1.0.0',
      description:
        "This is a simple CRUD API application made with Express and documented with Swagger",
      license: {
        name: 'Licensed Under MIT',
        url: 'https://spdx.org/licenses/MIT.html',
      },
      contact: {
        name: "TravelLog Agency",
        email: "somemail@travellog.com",
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api'
      },
    ],
    components: {
      securitySchemes: {
        jwt: {
          type: "http",
          scheme: "bearer",
          in: "header",
          bearerFormat: "JWT"
        },
      }
    }
    ,
    security: [{
      jwt: []
    }]
  }

}
