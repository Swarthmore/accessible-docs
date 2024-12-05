# **Contribution Guidelines**

Pull requests, bug reports, and other contributions are welcomed and highly encouraged! Below, you'll find a detailed guide to ensure smooth collaboration.

---

## **Contents**
- [Code of Conduct](#code-of-conduct)
- [Asking Questions](#asking-questions)
- [Opening an Issue](#opening-an-issue)
- [Reporting Security Issues](#reporting-security-issues)
- [Submitting Bug Reports](#submitting-bug-reports)
- [Feature Requests](#feature-requests)
- [Triaging Issues](#triaging-issues)
- [Submitting Pull Requests](#submitting-pull-requests)
- [Writing Commit Messages](#writing-commit-messages)
- [Code Review](#code-review)
- [Coding Style](#coding-style)

---

## **Code of Conduct**

Please review our [Code of Conduct](CODE_OF_CONDUCT.md). We are committed to maintaining a respectful and inclusive community for everyone. Acting with disrespect or hostility will not be tolerated.

## **Asking Questions**

If you have questions, please refer to our [Support Guide](SUPPORT_GUIDE.md). GitHub issues are reserved for bug reports and feature requests, not for troubleshooting individual projects.

## **Opening an Issue**

Before opening an issue:
- Ensure you are using the latest version of the project.
- Search for existing issues to avoid duplicates.

When opening a new issue:
- Use the provided issue template.
- Be clear, concise, and descriptive. Include as much relevant information as possible (e.g., steps to reproduce, error messages, environment details).
- Format your report using GitHub-flavored Markdown to improve readability.

## **Reporting Security Issues**

If you find a security vulnerability, do not open a public GitHub issue. Instead, review our [Security Policy](SECURITY.md) for appropriate reporting guidelines.

## **Submitting Bug Reports**

A great bug report should:
- Clearly describe the problem.
- Include steps to reproduce the issue.
- Provide relevant environment details (e.g., library versions, OS versions).
- Use Markdown formatting for readability.

Before submitting, ensure the issue is not already reported. If it exists, add any additional information you have or react to it with a "+1" to prioritize common issues.

## **Feature Requests**

We welcome feature requests! However, keep in mind:
- Search for existing requests before submitting a new one.
- Clearly describe the feature and how it relates to existing features.
- Include implementation details if possible.

We cannot guarantee every feature request will be accepted or implemented immediately. Feature requests must align with the scope of the project.

## **Triaging Issues**

You can help by triaging issues:
- Reproduce bug reports when possible.
- Ask for additional information if required (e.g., version numbers, logs).

## **Submitting Pull Requests**

### **General Guidelines**
- **Open an Issue First:** For significant changes, discuss them by opening an issue before starting the work. This helps avoid unnecessary effort if the change is not aligned with the project's goals.
- **Create a Fork and Branch:**
  - Fork the repository and create a feature branch for your changes.
  - Use meaningful branch names such as `feature/file-upload-enhancement` or `bugfix/empty-link-cleanup`.

### **Making Changes**
- **Smaller is Better:** Submit one pull request per bug fix or feature. Do not bundle unrelated changes into a single PR.
- **Coordinate Bigger Changes:** For large changes, open an issue to discuss strategies before starting work.
- **Prioritize Readability:** Write code clearly and concisely, focusing on maintainability.
- **Follow Existing Style:** Keep your code consistent with the rest of the codebase. Run linting tools to ensure consistency.
- **Include Tests:** Add relevant tests for new features or bug fixes. Follow existing patterns for unit or integration tests.
- **Update Documentation:** Ensure any new features are documented. Update README files or add inline documentation where necessary.

### **Submitting Your Pull Request**
- **Push Your Branch:**
  ```bash
  git push origin feature/your-feature-name
  ```
- **Open a Pull Request:** Navigate to your fork on GitHub, click "New Pull Request," and select the appropriate branch.
- **Write a Clear Description:** Explain the purpose of your pull request and reference any related issues.
- **Follow Branch Guidelines:** Branch from and submit your pull request to the repository's default branch (usually `main` or `develop`).

### **Pull Request Checklist**
- **Resolve Merge Conflicts:** Ensure there are no merge conflicts with the default branch.
- **Address CI Failures:** If CI tests fail, address these promptly.
- **Follow Commit Message Standards:** See [Writing Commit Messages](#writing-commit-messages) below for guidelines.

## **Writing Commit Messages**

A good commit message should:
- **Be Short and Descriptive:** Limit the subject line to 50 characters.
- **Use the Imperative Mood:** Examples include "Fix upload bug" or "Add multi-file support."
- **Include a Body for Complex Changes:** If the commit requires more explanation, include a detailed body that describes the why, not just the what and how.
- **Separate Subject and Body with a Blank Line**
- **Provide Context:** Reference related issues where applicable (e.g., `Resolves: #123`).

Example:
```
[TAG] Short summary of changes in 50 chars or less

A more detailed explanation if necessary. Provide background on the issue, explain why the change was made, and note any side effects.

- Bullet points can be used for additional details.

Resolves: #123
See also: #456
```

## **Code Review**

### **General Review Guidelines**
- **Review the Code, Not the Author:** Provide constructive feedback on the code itself without personal judgment.
- **Request Changes if Needed:** If code does not meet guidelines or could be improved, kindly request revisions.
- **Be Respectful:** Remember that code reviews are about improving the project and learning as a team.

## **Coding Style**

Consistency is key. Follow the style, formatting, and naming conventions used throughout the codebase. Examples:
- **Property Naming:** If private properties are prefixed with an underscore (`_`), follow the same pattern for new properties.
- **Methods and Functions:** If camelCase is used, maintain that convention (e.g., `thisIsMyMethod`).
- **Formatting:** Use spaces rather than tabs, and ensure proper indentation throughout the file.
- **Linter Tools:** Run ESLint and any other configured linters before submitting changes:
  ```bash
  npm run lint
  ```

