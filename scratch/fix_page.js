const fs = require('fs');
let content = fs.readFileSync('app/SubmissionForm/page.tsx', 'utf8');

// 1. Delete the <header> block entirely
content = content.replace(/<header[\s\S]*?<\/header>/, '');

// 2. We need to relocate the Tab buttons to the Hero section
const tabsHTML = `
          {/* Nav tabs relocated to hero */}
          <div className="grid max-w-xl mx-auto grid-cols-1 gap-3 sm:grid-cols-2 mb-8">
            <TabButton
              active={activeTab === "submit"}
              onClick={() => setActiveTab("submit")}
            >
              <Zap style={{ width: "16px", height: "16px" }} />
              Submit Project
            </TabButton>
            <TabButton
              active={activeTab === "browse"}
              onClick={() => setActiveTab("browse")}
              count={submissions.length}
            >
              <Trophy style={{ width: "16px", height: "16px" }} />
              Browse Submissions
            </TabButton>
          </div>
`;

if (!content.includes('Nav tabs relocated to hero')) {
    content = content.replace('{/* Stats */}', tabsHTML + '          {/* Stats */}');
}

// 3. Fix the container layout
content = content.replace('<div className="w-full max-w-4xl">', '<div className="w-full max-w-4xl mx-auto">');
content = content.replace(
`<main
          style={{
            position: "relative",
            zIndex: 10,
            padding: "0 24px 80px",
            maxWidth: "900px",
            margin: "0 auto",
          }}
        >`, 
'<main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">'
);

// Form header block in submit tab:
content = content.replace(
`<div
                style={{
                  borderRadius: "20px",
                  background: "rgba(30,18,8,0.7)",
                  border: "1px solid rgba(201,162,39,0.3)",
                  backdropFilter: "blur(16px)",
                  overflow: "hidden",
                  boxShadow:
                    "0 20px 60px rgba(173,114,55,0.1), 0 0 0 1px rgba(235,207,181,0.2)",
                }}
              >`,
`<div className="w-full max-w-4xl mx-auto">
              <div
                style={{
                  borderRadius: "20px",
                  background: "var(--jaipur-card)",
                  border: "1px solid rgba(201,162,39,0.3)",
                  backdropFilter: "blur(16px)",
                  overflow: "hidden",
                  boxShadow:
                    "0 20px 60px rgba(173,114,55,0.1), 0 0 0 1px rgba(235,207,181,0.2)",
                }}
              >`
);

content = content.replace(
  'color: "#FFF7F1",',
  'color: "var(--jaipur-primary)",\n                        fontFamily: "\'Cormorant Garamond\', Georgia, serif",'
);

// Add missing closing div before the end of submit tab
content = content.replace(
  '{/* Quick links */}',
  '</div>\n\n              {/* Quick links */}'
);

// 4. Update TabButton
const newTabButton = `function TabButton({
  active,
  onClick,
  children,
  count,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={\`min-h-12 flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm sm:text-base font-semibold transition-all whitespace-nowrap \${
        active
          ? "bg-jaipur-primary text-white shadow-lg"
          : "border border-jaipur-gold/30 bg-jaipur-card/80 text-foreground hover:bg-jaipur-primary/10 hover:text-jaipur-primary"
      }\`}
    >
      {children}
      {count !== undefined && (
        <span className={\`text-xs px-2 py-0.5 rounded-full transition-all \${active ? "bg-white/20 text-white" : "bg-jaipur-gold/20 text-jaipur-primary"}\`}>
          {count}
        </span>
      )}
    </button>
  );
}`;

content = content.replace(/function TabButton\([\s\S]*?<\/button>\n    \);\n  \}/, newTabButton);

// 5. Add target="_blank"
content = content.replace(/href="https:\/\/learnitmuj\.org"/g, 'href="https://learnitmuj.org" target="_blank" rel="noopener noreferrer"');

// 6. Fix stat block mx-auto
content = content.replace('<div className="grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">', '<div className="grid max-w-2xl mx-auto grid-cols-1 gap-3 sm:grid-cols-3">');

// 7. Make text styles readable
content = content.replace(
  '<a \n              href="https://learnitmuj.org"',
  '<a \n              href="https://learnitmuj.org" \n              target="_blank" \n              rel="noopener noreferrer" \n              style={{ color: "#D4732A", textDecoration: "none", fontWeight: 600, display: "inline-block", marginTop: "8px" }}'
);

fs.writeFileSync('app/SubmissionForm/page.tsx', content);
console.log('Fixed SubmissionForm/page.tsx');
