const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'XWZ Parking Management System API',
      version: '1.0.0',
      description: `
## Car Parking Management System - REST API

Built with **Microservices Architecture** by XWZ LTD.

### Features
- User Authentication (JWT)
- Role-based Access Control (Admin, Parking Attendant)
- Parking Space Management
- Car Entry/Exit Tracking
- Automated Billing
- Real-time Reports

### Authentication
Use the **/api/auth/login** endpoint to get a JWT token, then click **Authorize** and enter: \`Bearer <your_token>\`
      `,
      contact: {
        name: 'XWZ LTD Support',
        email: 'support@xwzltd.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js', './src/models/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;
