const fs = require('fs');
let content = fs.readFileSync('components/SubmissionForm.tsx', 'utf8');

// Improve Field input contrast
content = content.replace(
  'bg-background/75 border rounded-xl text-foreground text-base focus:outline-none focus:ring-2 focus:ring-jaipur-primary/40 transition-all placeholder:text-muted-foreground/70',
  'bg-background border rounded-xl text-foreground text-base focus:outline-none focus:ring-2 focus:ring-jaipur-primary transition-all placeholder:text-muted-foreground/90 font-medium'
);

// Improve Category button contrast
content = content.replace(
  '"bg-background/70 border border-jaipur-gold/25 text-foreground hover:border-jaipur-primary/50 hover:text-jaipur-primary"',
  '"bg-background border-2 border-jaipur-gold/40 text-foreground font-semibold hover:border-jaipur-primary hover:text-jaipur-primary"'
);

// Improve Tech Stack button contrast
content = content.replace(
  '"bg-background/70 border border-jaipur-gold/25 text-foreground hover:bg-jaipur-primary/10 hover:text-jaipur-primary"',
  '"bg-background border-2 border-jaipur-gold/40 text-foreground font-semibold hover:border-jaipur-primary hover:text-jaipur-primary"'
);

// Improve member input contrast
content = content.replace(
  'className="flex-1 min-h-12 px-4 py-3 bg-background/75 border border-jaipur-gold/25 rounded-xl text-foreground text-base placeholder:text-muted-foreground/70 focus:outline-none focus:border-jaipur-primary transition-all"',
  'className="flex-1 min-h-12 px-4 py-3 bg-background border-2 border-jaipur-gold/40 rounded-xl text-foreground text-base placeholder:text-muted-foreground/90 font-medium focus:outline-none focus:border-jaipur-primary transition-all"'
);

fs.writeFileSync('components/SubmissionForm.tsx', content);
console.log("Improved form contrast");
