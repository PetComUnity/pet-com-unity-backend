import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Pet.com.Unity API',
      version: '1.0.0',
      description: 'Backend API для платформи цифрової ідентифікації тварин',
    },
    servers: [
      { url: 'http://localhost:5000/api', description: 'Local development' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        UserPublic: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '664f1a2b3c4d5e6f7a8b9c0d' },
            name: { type: 'string', example: 'Олена Ковальчук' },
            email: { type: 'string', example: 'olena@example.com' },
            role: {
              type: 'string',
              enum: ['owner', 'vet', 'shelter', 'admin'],
            },
            phone: { type: 'string', example: '+380671234567', nullable: true },
            city: { type: 'string', example: 'Київ', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Pet: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            ownerId: { type: 'string' },
            name: { type: 'string', example: 'Барсик' },
            species: { type: 'string', example: 'Cat' },
            breed: { type: 'string', nullable: true },
            gender: {
              type: 'string',
              enum: ['male', 'female', 'unknown'],
              nullable: true,
            },
            birthDate: { type: 'string', format: 'date', nullable: true },
            color: { type: 'string', nullable: true },
            description: { type: 'string', nullable: true },
            imageUrl: { type: 'string', nullable: true },
            microchipId: { type: 'string', nullable: true },
            isLost: { type: 'boolean' },
            isAdoptable: { type: 'boolean' },
            verificationStatus: {
              type: 'string',
              enum: ['unverified', 'pending', 'verified'],
            },
            publicQrId: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Shelter: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            ownerId: { type: 'string' },
            name: { type: 'string', example: 'Щасливі лапки' },
            email: { type: 'string' },
            phone: { type: 'string', nullable: true },
            address: { type: 'string' },
            description: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Vet: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            ownerId: { type: 'string' },
            name: { type: 'string' },
            clinicName: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string', nullable: true },
            address: { type: 'string', nullable: true },
            specialization: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        LostReport: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            petId: { type: 'string' },
            ownerId: { type: 'string' },
            city: { type: 'string', example: 'Львів' },
            lastSeenLocation: { type: 'string', nullable: true },
            dateLost: { type: 'string', format: 'date', nullable: true },
            message: { type: 'string', nullable: true },
            status: { type: 'string', enum: ['active', 'resolved'] },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Something went wrong' },
          },
        },
      },
    },
    paths: {},
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
