import { readFileSync, writeFileSync } from 'fs';

const file = 'src/test/validation/form-validation.test.ts';
let content = readFileSync(file, 'utf8');

// Fix: Replace user.type with empty strings to user.clear() or just not typing
// Lines 328-331
content = content.replace(
  `// Fill out the form with invalid data
      await user.type(screen.getByTestId('name-input'), '') // Empty name
      await user.type(screen.getByTestId('email-input'), 'invalid-email') // Invalid email
      await user.type(screen.getByTestId('subject-input'), '') // Empty subject
      await user.type(screen.getByTestId('message-input'), '') // Empty message`,
  `// Fill out the form with invalid data
      // Leave name empty (don't type anything)
      await user.type(screen.getByTestId('email-input'), 'invalid-email') // Invalid email
      // Leave subject and message empty (don't type anything)`
);

// Find and fix the search form validation test with similar issue
content = content.replace(
  /await user\.type\(screen\.getByTestId\('search-input'\), ''\)/g,
  "// Leave search input empty (don't type anything)"
);

writeFileSync(file, content, 'utf8');
console.log('✅ Fixed form-validation.test.ts');
