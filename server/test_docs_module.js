import dotenv from 'dotenv';
import http from 'http';
import app from './app.js';

dotenv.config();

let httpServer;

const runDocsTests = async () => {
  console.log('=====================================================');
  console.log('--- STARTING PHASE 14 ENTERPRISE API DOCUMENTATION TESTS ---');
  console.log('=====================================================');

  try {
    const PORT = 5099;
    httpServer = http.createServer(app);
    await new Promise((resolve) => httpServer.listen(PORT, resolve));
    const BASE_URL = `http://127.0.0.1:${PORT}`;
    console.log(`✅ Server running on port ${PORT}`);

    // -----------------------------------------------------
    // TEST 1: Swagger UI Loading (GET /api/docs)
    // -----------------------------------------------------
    console.log('\n[TEST 1] Testing GET /api/docs (Swagger UI HTML) ...');
    const docsRes = await fetch(`${BASE_URL}/api/docs/`);
    const docsHtml = await docsRes.text();

    console.log('Swagger UI Status:', docsRes.status);

    if (docsRes.status === 200 && docsHtml.includes('swagger-ui')) {
      console.log('✅ TEST 1 PASSED: Interactive Swagger UI served at /api/docs.');
    } else {
      throw new Error('❌ TEST 1 FAILED: GET /api/docs failed.');
    }

    // -----------------------------------------------------
    // TEST 2: Versioned Swagger UI Loading (GET /api/v1/docs)
    // -----------------------------------------------------
    console.log('\n[TEST 2] Testing GET /api/v1/docs (Versioned Swagger UI) ...');
    const v1DocsRes = await fetch(`${BASE_URL}/api/v1/docs/`);
    const v1DocsHtml = await v1DocsRes.text();

    console.log('Versioned Swagger UI Status:', v1DocsRes.status);

    if (v1DocsRes.status === 200 && v1DocsHtml.includes('swagger-ui')) {
      console.log('✅ TEST 2 PASSED: Versioned Swagger UI served at /api/v1/docs.');
    } else {
      throw new Error('❌ TEST 2 FAILED: GET /api/v1/docs failed.');
    }

    // -----------------------------------------------------
    // TEST 3: OpenAPI 3.1 Spec JSON (GET /api/docs/json)
    // -----------------------------------------------------
    console.log('\n[TEST 3] Testing GET /api/docs/json (OpenAPI 3.1 Spec) ...');
    const specRes = await fetch(`${BASE_URL}/api/docs/json`);
    const specJson = await specRes.json();

    console.log('OpenAPI Version:', specJson.openapi);
    console.log('Title:', specJson.info.title);
    console.log('Total Tags:', specJson.tags.length);
    console.log('Security Schemes:', Object.keys(specJson.components.securitySchemes));

    if (
      specRes.status === 200 &&
      specJson.openapi === '3.1.0' &&
      specJson.components.securitySchemes.bearerAuth &&
      specJson.components.securitySchemes.secretKeyAuth &&
      specJson.tags.length >= 15
    ) {
      console.log('✅ TEST 3 PASSED: OpenAPI 3.1 Spec JSON validated with all 15 module tags & security schemes.');
    } else {
      throw new Error('❌ TEST 3 FAILED: OpenAPI spec JSON validation failed.');
    }

    // -----------------------------------------------------
    // TEST 4: API Versioning Support (GET /api/v2)
    // -----------------------------------------------------
    console.log('\n[TEST 4] Testing GET /api/v2 (Future Version Fallback) ...');
    const v2Res = await fetch(`${BASE_URL}/api/v2`);
    const v2Json = await v2Res.json();

    console.log('v2 Status:', v2Res.status);
    console.log('v2 Response:', v2Json.data);

    if (v2Res.status === 200 && v2Json.data.version === 'v2') {
      console.log('✅ TEST 4 PASSED: API v2 fallback endpoint verified.');
    } else {
      throw new Error('❌ TEST 4 FAILED: GET /api/v2 failed.');
    }

    console.log('\n=====================================================');
    console.log('🎉 ALL PHASE 14 ENTERPRISE API DOCUMENTATION TESTS PASSED SUCCESSFULLY! 🎉');
    console.log('=====================================================');
  } catch (error) {
    console.error('\n❌ TEST RUNNER ERROR:', error);
    process.exitCode = 1;
  } finally {
    if (httpServer) httpServer.close();
    console.log('Closed test server.');
  }
};

runDocsTests();
