import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.1.0',
  info: {
    title: 'SkillBridge AI Enterprise API Documentation',
    version: '1.0.0',
    description: `
### SkillBridge AI - Production Enterprise REST API Documentation

SkillBridge AI is a next-generation AI-powered talent marketplace and assessment platform.

#### Key Features & Modules Documented:
- **Authentication**: Email verification, password reset, JWT token pair, refresh token rotation, account lockout (5 failed attempts), session revocation.
- **Candidate Portal**: Profile management, skills, work experience, education, resume upload, saved jobs, dashboard summary, timeline & analytics.
- **Company Portal**: Profile management, job management, candidate application reviews, interview scheduling, dashboard analytics.
- **AI Resume Analyzer**: Gemini-powered ATS analysis, keyword matching, skill gap auditing, recruiter feedback.
- **AI Mock Interview Platform**: Dynamic adaptive interview sessions, audio/text answer submission, 6-metric evaluation report.
- **AI Coding Assessment Platform**: Support for 5 languages (JS, Python, Java, C++, SQL) across 4 problem types (MCQ, Output, Debugging, Coding Challenge).
- **AI Video Interview Platform**: Asynchronous video interviews, Cloudinary video response tracking, presentation & transcript analysis.

#### API Security & Authentication:
- **Bearer Authentication**: Include \`Authorization: Bearer <your_jwt_access_token>\` header for protected Candidate / Company endpoints.
- **AI Microservice Authentication**: Include \`X-AI-SECRET-KEY: <shared_secret_key>\` header for Node-to-FastAPI inter-service communication.
`,
    contact: {
      name: 'SkillBridge AI Engineering Team',
      email: 'support@skillbridge.ai',
      url: 'https://skillbridge.ai',
    },
    license: {
      name: 'ISC License',
      url: 'https://opensource.org/licenses/ISC',
    },
  },
  servers: [
    {
      url: 'http://localhost:5000/api/v1',
      description: 'Development Server (Version 1)',
    },
    {
      url: 'http://localhost:5000/api/v2',
      description: 'Future Release Server (Version 2 Fallback)',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Provide JWT Access Token obtained from /auth/candidate/login or /auth/company/login.',
      },
      secretKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'X-AI-SECRET-KEY',
        description: 'Shared Secret Key for internal AI microservice communication.',
      },
    },
    schemas: {
      ApiResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Operation completed successfully' },
          data: { type: 'object', nullable: true },
          errors: { type: 'array', items: { type: 'string' }, nullable: true, example: null },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Error description message' },
          data: { type: 'object', nullable: true, example: null },
          errors: { type: 'array', items: { type: 'string' }, example: ['Specific error detail'] },
        },
      },
      CandidateUser: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '6a62f88b3189c4a19bea8b79' },
          fullName: { type: 'string', example: 'Marcus Vance' },
          email: { type: 'string', example: 'marcus@gmail.com' },
          phone: { type: 'string', example: '+1 555-0199' },
          role: { type: 'string', example: 'candidate' },
          isEmailVerified: { type: 'boolean', example: true },
          profileCompleted: { type: 'boolean', example: true },
          skills: { type: 'array', items: { type: 'string' }, example: ['Node.js', 'Python', 'Docker'] },
        },
      },
      CompanyUser: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '6a62f88b3189c4a19bea8b98' },
          companyName: { type: 'string', example: 'DataScale Systems' },
          email: { type: 'string', example: 'hiring@datascale.io' },
          website: { type: 'string', example: 'https://datascale.io' },
          industry: { type: 'string', example: 'Cloud Computing' },
          role: { type: 'string', example: 'company' },
          isEmailVerified: { type: 'boolean', example: true },
        },
      },
      JobPosting: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '6a62f88b3189c4a19bea8b98' },
          title: { type: 'string', example: 'Senior Backend Engineer' },
          company: { type: 'string', example: 'DataScale Systems' },
          department: { type: 'string', example: 'Engineering' },
          description: { type: 'string', example: 'High throughput backend microservices in Node.js and Redis.' },
          requiredSkills: { type: 'array', items: { type: 'string' }, example: ['Node.js', 'MongoDB', 'Redis'] },
          experienceLevel: { type: 'string', example: 'senior' },
          employmentType: { type: 'string', example: 'Full Time' },
          workMode: { type: 'string', example: 'Remote' },
          status: { type: 'string', example: 'open' },
        },
      },
      Application: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '6a62f88b3189c4a19bea8c12' },
          candidateId: { type: 'string', example: '6a62f88b3189c4a19bea8b79' },
          jobId: { type: 'string', example: '6a62f88b3189c4a19bea8b98' },
          status: { type: 'string', example: 'applied' },
          coverLetter: { type: 'string', example: 'I am excited to apply for this backend role.' },
          appliedAt: { type: 'string', format: 'date-time' },
        },
      },
      ResumeAnalysis: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '6a62f94c46b1f3e8087ce50f' },
          atsScore: { type: 'number', example: 85 },
          matchScore: { type: 'number', example: 80 },
          extractedText: { type: 'string', example: 'Extracted candidate resume text...' },
          suggestions: { type: 'array', items: { type: 'string' }, example: ['Quantify metrics in accomplishments'] },
        },
      },
      InterviewSession: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '6a62f71c27d3386eda68ac3a' },
          interviewType: { type: 'string', example: 'Technical' },
          difficulty: { type: 'string', example: 'Medium' },
          status: { type: 'string', example: 'In Progress' },
          overallScore: { type: 'number', example: 84 },
        },
      },
      CodingAssessment: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '6a62f88b3189c4a19bea8bae' },
          language: { type: 'string', example: 'Python' },
          difficulty: { type: 'string', example: 'Medium' },
          status: { type: 'string', example: 'Completed' },
          score: { type: 'number', example: 92 },
        },
      },
      VideoInterview: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '6a62fab2d54d1d56179d1b34' },
          title: { type: 'string', example: 'Asynchronous Senior Engineering Lead Interview' },
          status: { type: 'string', example: 'Completed' },
          overallScore: { type: 'number', example: 88 },
          communicationScore: { type: 'number', example: 90 },
        },
      },
    },
    responses: {
      UnauthorizedError: {
        description: 'Authentication token is missing, invalid, or expired.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: {
              success: false,
              message: 'Authentication failed. Please log in again.',
              data: null,
              errors: ['Invalid or missing Bearer token'],
            },
          },
        },
      },
      ForbiddenError: {
        description: 'User lacks required role permissions to perform this operation.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: {
              success: false,
              message: 'Forbidden: Candidate role cannot perform company operations.',
              data: null,
              errors: ['Role restriction enforced'],
            },
          },
        },
      },
      NotFoundError: {
        description: 'The requested resource was not found.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: {
              success: false,
              message: 'Requested resource not found.',
              data: null,
              errors: ['Resource ID not found'],
            },
          },
        },
      },
      AccountLockedError: {
        description: 'Account is temporarily locked due to consecutive failed login attempts.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: {
              success: false,
              message: 'Account locked due to 5 consecutive failed login attempts. Please try again after 15 minutes.',
              data: null,
              errors: ['Account locked'],
            },
          },
        },
      },
      RateLimitError: {
        description: 'Too many requests sent from this IP address.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: {
              success: false,
              message: 'Too many requests from this IP. Please try again after 15 minutes.',
              data: null,
              errors: ['Rate limit exceeded'],
            },
          },
        },
      },
    },
  },
  tags: [
    { name: 'Auth Candidate', description: 'Candidate registration, login, verification, password reset, token refresh' },
    { name: 'Auth Company', description: 'Company registration, login, verification, password reset, token refresh' },
    { name: 'Candidate Profile', description: 'Candidate profile management, skills, experience, education, resume upload' },
    { name: 'Company Profile', description: 'Company profile management, website, industry, logo upload' },
    { name: 'Jobs', description: 'Public job search, filtering, detailed view, company job management' },
    { name: 'Applications', description: 'Candidate job application submission, company candidate review & status updates' },
    { name: 'Company Dashboard', description: 'Company real-time statistics, hiring funnel metrics, candidate analytics' },
    { name: 'Candidate Dashboard', description: 'Candidate dashboard summary, application tracking, upcoming interviews, analytics' },
    { name: 'Saved Jobs', description: 'Candidate saved jobs module (Save, list, delete)' },
    { name: 'Notifications', description: 'Real-time notifications & unread alerts' },
    { name: 'Interviews', description: 'Scheduled company interviews & meeting links' },
    { name: 'AI Resume Analyzer', description: 'FastAPI + Gemini ATS analysis, keyword matching, resume review' },
    { name: 'AI Mock Interview', description: 'FastAPI + Gemini adaptive mock interviews, 6-metric audio/text evaluation' },
    { name: 'AI Coding Assessment', description: 'FastAPI + Gemini coding assessment across 5 languages & 4 problem types' },
    { name: 'AI Video Interview', description: 'FastAPI + Gemini asynchronous video interviews & Cloudinary video tracking' },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./routes/*.js', './controllers/*.js'],
};

export const swaggerSpec = swaggerJSDoc(options);
