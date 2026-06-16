const fs = require('fs');
let content = fs.readFileSync('app/SubmissionForm/page.tsx', 'utf8');

content = content.replace('className="grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-2 mb-8"', 'className="grid max-w-xl mx-auto grid-cols-1 gap-3 sm:grid-cols-2 mb-8"');
content = content.replace('className="grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3"', 'className="grid max-w-2xl mx-auto grid-cols-1 gap-3 sm:grid-cols-3"');
content = content.replace('className="w-full max-w-4xl"', 'className="w-full max-w-4xl mx-auto"');

fs.writeFileSync('app/SubmissionForm/page.tsx', content);
console.log("Done");
