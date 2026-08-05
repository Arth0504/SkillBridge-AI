import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api/v1';

async function testAIResumeBuilderEndpoints() {
  console.log('\n===========================================================');
  console.log('⚡ STARTING AI RESUME BUILDER INTEGRATION VERIFICATION');
  console.log('===========================================================\n');

  try {
    // 1. Authenticate / Login to get Token
    // We can simulate candidate login or call server endpoint directly if running.
    // If server is offline, we will simulate a local direct call to services to verify fallback.
    
    // Let's test the services layer directly to verify FastAPI integration
    const { suggestResumeContentWithAI, checkResumeGrammarWithAI } = await import('./services/ai.service.js');

    console.log('--- TEST 1: CONTENT SUGGESTIONS SERVICE GATEWAY ---');
    const suggestionsResult = await suggestResumeContentWithAI('work experience', 'Designed a distributed microservice system in React and Node.js');
    
    console.log('✔ Suggestions list received:', suggestionsResult.suggestions);
    console.log('✔ Suggestions paragraph received:', suggestionsResult.suggestedText);

    if (!suggestionsResult.suggestions || suggestionsResult.suggestions.length === 0) {
      throw new Error('Suggestions content list is empty');
    }
    if (!suggestionsResult.suggestedText) {
      throw new Error('Suggestions paragraph is empty');
    }

    console.log('\n--- TEST 2: GRAMMAR SCANNERS SERVICE GATEWAY ---');
    const grammarResult = await checkResumeGrammarWithAI('I has working as developer for three year.');
    
    console.log('✔ Corrections items:', grammarResult.corrections);
    console.log('✔ Polished Text:', grammarResult.correctedText);

    if (!grammarResult.correctedText) {
      throw new Error('Corrected text is empty');
    }

    console.log('\n===========================================================');
    console.log('🎉 AI RESUME BUILDER INTEGRATION VERIFICATION COMPLETE');
    console.log('===========================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Integration test failed with errors:', err.message);
    process.exit(1);
  }
}

testAIResumeBuilderEndpoints();
