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
            location: { type: 'string', example: 'Kyiv', nullable: true },
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
              enum: ['unverified', 'verified'],
            },
            publicQrId: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 10 },
            total: { type: 'integer', example: 42 },
            totalPages: { type: 'integer', example: 5 },
            hasNextPage: { type: 'boolean', example: true },
            hasPreviousPage: { type: 'boolean', example: false },
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
    paths: {
      '/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Register a new user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'email', 'password', 'role'],
                  properties: {
                    name: { type: 'string', example: 'Олена Ковальчук' },
                    email: { type: 'string', example: 'olena@example.com' },
                    password: { type: 'string', example: 'password123' },
                    role: {
                      type: 'string',
                      enum: ['owner', 'vet', 'shelter', 'admin'],
                    },
                    phone: { type: 'string', example: '+380671234567' },
                    city: { type: 'string', example: 'Київ' },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: 'User registered successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: {
                        type: 'string',
                        example: 'User registered successfully',
                      },
                      data: {
                        type: 'object',
                        properties: {
                          user: { $ref: '#/components/schemas/UserPublic' },
                          token: { type: 'string' },
                        },
                      },
                    },
                  },
                },
              },
            },
            400: {
              description: 'Validation error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            409: {
              description: 'User already exists',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Login user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', example: 'olena@example.com' },
                    password: { type: 'string', example: 'password123' },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'User logged in successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: {
                        type: 'string',
                        example: 'User logged in successfully',
                      },
                      data: {
                        type: 'object',
                        properties: {
                          user: { $ref: '#/components/schemas/UserPublic' },
                          token: { type: 'string' },
                        },
                      },
                    },
                  },
                },
              },
            },
            400: {
              description: 'Validation error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            401: {
              description: 'Invalid credentials',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/auth/me': {
        get: {
          tags: ['Auth'],
          summary: 'Get current user',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Current user fetched successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string' },
                      data: { $ref: '#/components/schemas/UserPublic' },
                    },
                  },
                },
              },
            },
            401: {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/auth/logout': {
        post: {
          tags: ['Auth'],
          summary: 'Logout user',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Logged out successfully' },
            401: {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/pets': {
        get: {
          tags: ['Pets'],
          summary: 'Get pets',
          parameters: [
            {
              name: 'isAdoptable',
              in: 'query',
              required: false,
              description: 'Filter pets by adoption availability. Use true to list pets available for adoption.',
              schema: { type: 'boolean' },
            },
            {
              name: 'page',
              in: 'query',
              required: false,
              description: 'Page number for paginated pet results.',
              schema: { type: 'integer', minimum: 1, default: 1 },
            },
            {
              name: 'limit',
              in: 'query',
              required: false,
              description: 'Number of pets to return per page.',
              schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
            },
          ],
          responses: {
            200: {
              description: 'Pets fetched successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: {
                        type: 'string',
                        example: 'Pets fetched successfully',
                      },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Pet' },
                      },
                      meta: { $ref: '#/components/schemas/PaginationMeta' },
                    },
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ['Pets'],
          summary: 'Create a new pet',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'species'],
                  properties: {
                    name: { type: 'string', example: 'Барсик' },
                    species: { type: 'string', example: 'Cat' },
                    breed: { type: 'string', example: 'Siamese' },
                    location: { type: 'string', example: 'Kyiv' },
                    gender: {
                      type: 'string',
                      enum: ['male', 'female', 'unknown'],
                    },
                    birthDate: { type: 'string', example: '2020-01-15' },
                    color: { type: 'string', example: 'orange' },
                    description: { type: 'string' },
                    imageUrl: { type: 'string' },
                    microchipId: { type: 'string' },
                    isLost: { type: 'boolean' },
                    isAdoptable: { type: 'boolean' },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Pet created successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Pet' },
                },
              },
            },
            400: {
              description: 'Validation error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            401: {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/pets/{id}': {
        get: {
          tags: ['Pets'],
          summary: 'Get pet by ID',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            200: {
              description: 'Pet fetched successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Pet' },
                },
              },
            },
            404: {
              description: 'Pet not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
        put: {
          tags: ['Pets'],
          summary: 'Update pet',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    species: { type: 'string' },
                    breed: { type: 'string' },
                    location: { type: 'string' },
                    gender: {
                      type: 'string',
                      enum: ['male', 'female', 'unknown'],
                    },
                    birthDate: { type: 'string' },
                    color: { type: 'string' },
                    description: { type: 'string' },
                    imageUrl: { type: 'string' },
                    microchipId: { type: 'string' },
                    isLost: { type: 'boolean' },
                    isAdoptable: { type: 'boolean' },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Pet updated successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Pet' },
                },
              },
            },
            401: {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            404: {
              description: 'Pet not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
        delete: {
          tags: ['Pets'],
          summary: 'Delete pet',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            200: { description: 'Pet deleted successfully' },
            401: {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            404: {
              description: 'Pet not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/shelters': {
        get: {
          tags: ['Shelters'],
          summary: 'Get all shelters',
          responses: {
            200: {
              description: 'Shelters fetched successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Shelter' },
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ['Shelters'],
          summary: 'Create a shelter',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'email', 'address'],
                  properties: {
                    name: { type: 'string', example: 'Щасливі лапки' },
                    email: { type: 'string', example: 'shelter@example.com' },
                    phone: { type: 'string', example: '+380671234567' },
                    address: {
                      type: 'string',
                      example: 'вул. Хрещатик 1, Київ',
                    },
                    description: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Shelter created successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Shelter' },
                },
              },
            },
            400: {
              description: 'Validation error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            401: {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/shelters/{id}': {
        get: {
          tags: ['Shelters'],
          summary: 'Get shelter by ID',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            200: {
              description: 'Shelter fetched successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Shelter' },
                },
              },
            },
            404: {
              description: 'Shelter not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/vets': {
        get: {
          tags: ['Vets'],
          summary: 'Get all vets',
          responses: {
            200: {
              description: 'Vets fetched successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Vet' },
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ['Vets'],
          summary: 'Create a vet',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'clinicName', 'email'],
                  properties: {
                    name: { type: 'string', example: 'Іван Петренко' },
                    clinicName: {
                      type: 'string',
                      example: 'Клініка Добрий лікар',
                    },
                    email: { type: 'string', example: 'vet@example.com' },
                    phone: { type: 'string', example: '+380671234567' },
                    address: { type: 'string' },
                    specialization: { type: 'string', example: 'Хірургія' },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Vet created successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Vet' },
                },
              },
            },
            400: {
              description: 'Validation error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            401: {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/vets/{id}': {
        get: {
          tags: ['Vets'],
          summary: 'Get vet by ID',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            200: {
              description: 'Vet fetched successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Vet' },
                },
              },
            },
            404: {
              description: 'Vet not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
