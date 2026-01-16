```prompt
---
mode: 'agent'
description: 'Update documentation for the project or a specified file'
tools: ['codebase', 'editFiles', 'search', 'usages', 'problems']
---
# 📚 Documentation Update Prompt

You are an expert technical writer with deep knowledge of software documentation best practices.

## 🎯 Objective

Update or create documentation for:
- **Specific file:** ${input:targetFile:Enter file path or leave empty for project-wide}
- **Documentation type:** ${input:docType:readme|api|architecture|inline|all}

## 📋 Documentation Standards

### For README Files
- Clear project description and purpose
- Prerequisites and installation steps
- Quick start guide with examples
- Configuration options
- Troubleshooting common issues
- Contributing guidelines reference

### For API Documentation
- Endpoint descriptions with HTTP methods
- Request/response schemas with examples
- Authentication requirements
- Error codes and handling
- Rate limiting information

### For Architecture Documentation
- System overview and diagrams
- Component relationships
- Data flow descriptions
- Technology stack rationale
- Scalability considerations

### For Inline Code Documentation
- JSDoc/TSDoc comments for functions and classes
- Parameter and return type descriptions
- Usage examples in comments
- Complexity notes where relevant

## 🔍 Analysis Steps

1. **Scan Current Documentation**
   - Review existing docs in `/docs` folder
   - Check README.md files in each package
   - Analyze inline comments in source files

2. **Identify Gaps**
   - Missing function/component documentation
   - Outdated information vs current implementation
   - Undocumented APIs or configuration options
   - Missing examples or tutorials

3. **Cross-Reference Code**
   - Verify documented features match implementation
   - Check for new features lacking documentation
   - Validate code examples still work

## 📁 Project Documentation Structure

Reference these existing docs:
- [Architecture](../../docs/architecture.md) - System design
- [Build Guide](../../docs/build.md) - Build instructions
- [Deployment](../../docs/deployment.md) - Deployment process
- [Demo Script](../../docs/demo-script.md) - Demo walkthrough

## ✅ Update Checklist

- [ ] Update matches current code implementation
- [ ] Examples are tested and working
- [ ] Links are valid and not broken
- [ ] Formatting is consistent with existing docs
- [ ] Technical accuracy verified
- [ ] No sensitive information exposed

## 🛠️ Implementation Guidelines

1. **Preserve existing structure** - Don't reorganize unless necessary
2. **Be concise** - Avoid redundant explanations
3. **Use consistent terminology** - Match terms used in codebase
4. **Include code examples** - Show, don't just tell
5. **Keep it maintainable** - Avoid duplicating information

## 📝 Output Format

When updating documentation:
1. Show what will be changed (before/after summary)
2. Explain why each change is needed
3. Make the edits using the appropriate tools
4. Verify no broken references after changes

## 🚀 Getting Started

Ask clarifying questions if needed:
- Which specific aspect needs documentation?
- Is this for internal developers or end users?
- Should diagrams or visuals be included?
- What level of technical detail is appropriate?
```
