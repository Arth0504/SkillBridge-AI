import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const runCicdTests = async () => {
  console.log('=====================================================');
  console.log('--- STARTING PHASE 16 CI/CD & RELEASE ENGINEERING TESTS ---');
  console.log('=====================================================');

  try {
    const projectRoot = path.resolve(process.cwd(), '..');

    // -----------------------------------------------------
    // TEST 1: GitHub Actions Workflows Verification
    // -----------------------------------------------------
    console.log('\n[TEST 1] Verifying GitHub Actions Workflows (.github/workflows) ...');
    const workflows = ['ci.yml', 'cd.yml', 'security.yml', 'quality.yml'];

    for (const wf of workflows) {
      const filePath = path.join(projectRoot, '.github', 'workflows', wf);
      if (!fs.existsSync(filePath)) {
        throw new Error(`Missing mandatory workflow file: ${filePath}`);
      }
      const content = fs.readFileSync(filePath, 'utf-8');
      if (!content.includes('name:')) {
        throw new Error(`Invalid workflow format in: ${wf}`);
      }
    }
    console.log('✅ TEST 1 PASSED: All 4 GitHub Actions workflows (ci, cd, security, quality) verified.');

    // -----------------------------------------------------
    // TEST 2: Code Quality Tooling Verification
    // -----------------------------------------------------
    console.log('\n[TEST 2] Verifying Quality Tooling Configs (.eslintrc, .prettierrc, .editorconfig, commitlint) ...');
    const qualityFiles = [
      path.join(projectRoot, '.editorconfig'),
      path.join(projectRoot, '.eslintrc.json'),
      path.join(projectRoot, '.prettierrc'),
      path.join(projectRoot, 'commitlint.config.js'),
    ];

    for (const file of qualityFiles) {
      if (!fs.existsSync(file)) {
        throw new Error(`Missing mandatory quality config file: ${file}`);
      }
    }
    console.log('✅ TEST 2 PASSED: ESLint, Prettier, EditorConfig, and Commitlint files verified.');

    // -----------------------------------------------------
    // TEST 3: Husky Pre-commit Git Hooks Verification
    // -----------------------------------------------------
    console.log('\n[TEST 3] Verifying Husky Git Hooks (.husky) ...');
    const huskyHooks = [
      path.join(projectRoot, '.husky', 'pre-commit'),
      path.join(projectRoot, '.husky', 'commit-msg'),
    ];

    for (const hook of huskyHooks) {
      if (!fs.existsSync(hook)) {
        throw new Error(`Missing mandatory Husky git hook: ${hook}`);
      }
    }
    console.log('✅ TEST 3 PASSED: Husky pre-commit and commit-msg git hooks verified.');

    // -----------------------------------------------------
    // TEST 4: CHANGELOG.md & README.md Badges Verification
    // -----------------------------------------------------
    console.log('\n[TEST 4] Verifying CHANGELOG.md & README.md Status Badges ...');
    const changelogPath = path.join(projectRoot, 'CHANGELOG.md');
    const readmePath = path.join(projectRoot, 'README.md');

    if (!fs.existsSync(changelogPath) || !fs.existsSync(readmePath)) {
      throw new Error('Missing CHANGELOG.md or README.md file.');
    }

    const readmeContent = fs.readFileSync(readmePath, 'utf-8');
    if (
      !readmeContent.includes('Build Status') ||
      !readmeContent.includes('Code Coverage') ||
      !readmeContent.includes('Docker Image')
    ) {
      throw new Error('README.md missing required status badges.');
    }
    console.log('✅ TEST 4 PASSED: CHANGELOG.md and README.md status badges verified.');

    console.log('\n=====================================================');
    console.log('🎉 ALL PHASE 16 CI/CD & RELEASE ENGINEERING TESTS PASSED SUCCESSFULLY! 🎉');
    console.log('=====================================================');
  } catch (error) {
    console.error('\n❌ TEST RUNNER ERROR:', error);
    process.exitCode = 1;
  }
};

runCicdTests();
