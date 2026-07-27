import { fallbackAnalyzeATS } from './services/ai.service.js';

const testResumes = {
  javaFresher: `
  LUCAS BENNETT
  Email: lucas.bennett@gmail.com | Phone: (555) 234-5678
  OBJECTIVE: Enthusiastic Java Developer fresher seeking an entry level backend engineer role.
  TECHNICAL SKILLS: Java, Spring Boot, Hibernate, JPA, Maven, SQL, MySQL, JUnit, Git.
  PROJECTS:
  1. E-Commerce Backend API: Built RESTful services using Java and Spring Boot with Spring Security and MySQL database.
  2. Library Management System: Created OOP application utilizing Hibernate ORM and Maven build tools with JUnit test coverage.
  EDUCATION: Bachelor of Science in Computer Science, State University, 2025.
  `,

  mernDeveloper: `
  SARAH JENKINS
  Email: sarah.j@merntech.io | Portfolio: sarahjenkins.dev
  SUMMARY: Senior Full Stack Software Engineer with 4 years building scalable web applications.
  SKILLS: React, Node.js, Express, MongoDB, JavaScript, TypeScript, Redux, Tailwind CSS, REST APIs, AWS, Docker.
  EXPERIENCE:
  Software Engineer at TechCorp (2022 - Present):
  - Architected microservices backends using Node.js and Express handling 10k req/min.
  - Implemented real-time dashboard UI in React and Redux Toolkit with Tailwind CSS.
  - Deployed containerized applications to AWS ECS using Docker.
  `,

  dataScientist: `
  DR. ARYAN SHARMA
  Email: aryan.sharma@ai-labs.org
  SUMMARY: Lead Data Scientist specializing in Deep Learning, Computer Vision, and Large Language Models.
  SKILLS: Python, Pandas, NumPy, Scikit-learn, PyTorch, TensorFlow, Keras, Data Science, Machine Learning, AI, NLP, SQL.
  EXPERIENCE:
  Senior AI Researcher at NeuralTech Labs:
  - Trained custom transformer models using PyTorch and Distributed Data Parallel on AWS GPUs.
  - Processed large text datasets with Pandas, NumPy, and Scikit-learn to improve sentiment model accuracy by 18%.
  `
};

console.log('=== VERIFYING DYNAMIC RESUME ANALYZER OUTPUTS FOR 3 RESUME TYPES ===\n');

const results = {};

for (const [key, text] of Object.entries(testResumes)) {
  const analysis = fallbackAnalyzeATS(text);
  results[key] = {
    domainSummary: analysis.resumeSummary,
    atsScore: analysis.overallAtsScore,
    technicalSkills: analysis.skillMatch.technicalSkills,
    missingSkills: analysis.skillMatch.missingSkills,
    strengths: analysis.strengths,
  };

  console.log(`--- [RESUME TYPE: ${key.toUpperCase()}] ---`);
  console.log(`ATS Score: ${analysis.overallAtsScore}/100`);
  console.log(`Summary: ${analysis.resumeSummary}`);
  console.log(`Matched Skills:`, analysis.skillMatch.technicalSkills.join(', '));
  console.log(`Missing Skills:`, analysis.skillMatch.missingSkills.join(', '));
  console.log(`Strengths:`, analysis.strengths[0]);
  console.log('\n');
}

// Assert that outputs are NOT identical
const summaries = Object.values(results).map(r => r.domainSummary);
const uniqueSummaries = new Set(summaries);

if (uniqueSummaries.size !== 3) {
  console.error('❌ ERROR: Resume analysis outputs are NOT unique!');
  process.exit(1);
} else {
  console.log('🎉 SUCCESS: All 3 resume types produced unique, dynamic AI analysis outputs!');
}
