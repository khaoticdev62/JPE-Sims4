# Contributing Guide - JPE Sims 4 Mod Translator

## Welcome!

Thank you for your interest in contributing to the JPE Sims 4 Mod Translator! This document outlines how to contribute to the project, whether through code, documentation, bug reports, or feature suggestions.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Testing](#testing)
6. [Documentation](#documentation)
7. [Submitting Changes](#submitting-changes)
8. [Pull Request Process](#pull-request-process)
9. [Commit Message Guidelines](#commit-message-guidelines)

---

## Code of Conduct

### Our Commitment

We are committed to providing a welcoming and inspiring community for all. Please be respectful of others, maintain professionalism, and help create a positive environment.

### Expected Behavior

- Use inclusive language
- Be respectful of different perspectives
- Focus on what is best for the community
- Show empathy and kindness toward other community members
- Accept constructive criticism gracefully

### Unacceptable Behavior

- Harassment, discrimination, or bullying
- Disrespectful comments or personal attacks
- Posting private information without permission
- Any conduct that violates laws or regulations

---

## Getting Started

### Prerequisites

- **Python**: 3.8 or higher (3.11+ recommended)
- **Git**: Version 2.0 or higher
- **GitHub Account**: Create one at https://github.com

### Development Environment Setup

#### 1. Fork the Repository

Visit https://github.com/khaoticdev62/JPE-Sims4 and click "Fork"

#### 2. Clone Your Fork

```bash
git clone https://github.com/YOUR_USERNAME/JPE-Sims4.git
cd JPE-Sims4
```

#### 3. Add Upstream Remote

```bash
git remote add upstream https://github.com/khaoticdev62/JPE-Sims4.git
git remote set-url --push upstream no_push
```

#### 4. Create Virtual Environment

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

#### 5. Install Development Dependencies

```bash
pip install -e ".[dev]"
```

#### 6. Verify Installation

```bash
python run_tests.py
```

If all tests pass, you're ready to contribute!

---

## Development Workflow

### Branch Naming Convention

Create branches using descriptive names:

```
feature/add-new-parser          # New feature
bugfix/fix-validation-error     # Bug fix
docs/update-readme              # Documentation
refactor/simplify-ir-validation # Refactoring
test/add-cloud-api-tests        # Tests
```

### Create Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### Keep Sync with Upstream

```bash
git fetch upstream
git rebase upstream/master
```

### During Development

1. **Write code** following coding standards
2. **Run tests** frequently: `python run_tests.py`
3. **Commit regularly** with clear messages
4. **Keep branch updated**: `git rebase upstream/master`

---

## Coding Standards

### Python Code Style

We follow PEP 8 with these guidelines:

#### Naming Conventions

```python
# Classes: PascalCase
class TranslationEngine:
    pass

# Functions/Methods: snake_case
def validate_ir_object(obj):
    pass

# Constants: UPPER_SNAKE_CASE
MAX_FILE_SIZE = 10_000_000

# Private members: _leading_underscore
def _internal_method(self):
    pass
```

#### Type Hints

Always include type hints:

```python
from typing import List, Dict, Optional

def process_files(
    file_paths: List[str],
    output_dir: str,
    options: Optional[Dict[str, any]] = None
) -> Dict[str, any]:
    """Process JPE files and return results."""
    pass
```

#### Docstrings

Use Google-style docstrings:

```python
def validate_interaction(interaction: Interaction) -> List[ValidationError]:
    """Validate an interaction object.

    Args:
        interaction: The Interaction object to validate.

    Returns:
        List of ValidationError objects found, empty if valid.

    Raises:
        TypeError: If interaction is not an Interaction instance.
    """
    pass
```

#### Code Organization

```python
# Imports at top
import os
from typing import List

# Constants
MAX_SIZE = 1000

# Classes
class MyClass:
    pass

# Functions
def my_function():
    pass

# Main block
if __name__ == "__main__":
    pass
```

#### Line Length

- Maximum 100 characters per line
- Use implicit line continuation (inside brackets)

```python
# Good
result = long_function_name(
    argument_one,
    argument_two,
    argument_three
)

# Avoid
result = long_function_name(argument_one, argument_two, argument_three)
```

### Import Organization

```python
# Standard library imports
import os
import sys
from typing import List

# Third-party imports
import requests

# Local imports
from jpe_sims4.engine import TranslationEngine
from jpe_sims4.diagnostics import ValidationError
```

### Error Handling

```python
# Good: Specific exception handling
try:
    result = engine.build(project_path)
except ValidationError as e:
    logger.error(f"Validation failed: {e}")
    raise
except FileNotFoundError as e:
    logger.error(f"File not found: {e}")
    raise

# Avoid: Bare except
try:
    result = engine.build(project_path)
except:
    pass
```

### Comments and Documentation

```python
# Comments should explain WHY, not WHAT
# GOOD: Skip validation for built-in types
if is_builtin_type(obj):
    return True

# AVOID: Check if it's a built-in type
if is_builtin_type(obj):  # Check if built-in
    return True
```

---

## Testing

### Running Tests

```bash
# Run all tests
python run_tests.py

# Run specific test file
python -m pytest tests/test_engine.py -v

# Run with coverage
python -m pytest tests/ --cov=jpe_sims4 -v

# Run specific test
python -m pytest tests/test_ir.py::test_interaction_creation -v
```

### Writing Tests

#### Test File Structure

```python
"""Tests for translation engine module."""

import pytest
from jpe_sims4.engine import TranslationEngine
from jpe_sims4.diagnostics.errors import ValidationError


class TestTranslationEngine:
    """Test suite for TranslationEngine class."""

    @pytest.fixture
    def engine(self):
        """Create a translation engine instance."""
        return TranslationEngine()

    def test_build_success(self, engine):
        """Test successful project build."""
        result = engine.build("/path/to/project")
        assert result.success
        assert result.build_id is not None

    def test_build_with_errors(self, engine):
        """Test build with validation errors."""
        result = engine.build("/path/to/invalid/project")
        assert not result.success
        assert len(result.errors) > 0

    def test_build_missing_project(self, engine):
        """Test build with missing project directory."""
        with pytest.raises(FileNotFoundError):
            engine.build("/nonexistent/path")


def test_standalone_function():
    """Test a standalone function."""
    result = validate_id("valid_id_123")
    assert result is True
```

### Test Coverage

- **Target**: Maintain at least 80% code coverage
- **Critical Path**: 100% coverage for core translation logic
- **New Features**: Include tests for all new functionality

### Running Coverage Report

```bash
python -m pytest tests/ --cov=jpe_sims4 --cov-report=html
```

---

## Documentation

### Documentation Standards

#### README Updates

If your changes affect user-facing functionality, update [README.md](./README.md):

```markdown
## New Feature

Brief description of the feature.

### Usage Example

```bash
jpe-sims4 new-command
```

### Configuration

See [DOCUMENTATION.md](./DOCUMENTATION.md) for detailed options.
```

#### Code Documentation

Update relevant documentation files:

- [DOCUMENTATION.md](./DOCUMENTATION.md) - User guide
- [API_REFERENCE.md](./API_REFERENCE.md) - API documentation
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System design (when applicable)

#### Changelog Entry

Add to [CHANGELOG.md](./CHANGELOG.md):

```markdown
## [1.0.1] - 2024-12-07

### Added
- New parser plugin system with extensibility

### Fixed
- Cloud sync conflict resolution issue
- Memory leak in large project builds

### Changed
- Improved validation error messages
```

---

## Submitting Changes

### Before Submitting

1. **Run all tests**: `python run_tests.py`
2. **Check coverage**: Ensure new code is tested
3. **Update documentation**: Include docstrings and relevant docs
4. **Review code style**: Follow PEP 8 and project standards
5. **Update CHANGELOG.md**: Document your changes

### Commit Messages

See [Commit Message Guidelines](#commit-message-guidelines) below.

### Push to Your Fork

```bash
git push origin feature/your-feature-name
```

---

## Pull Request Process

### 1. Create Pull Request

Visit your fork on GitHub and click "New Pull Request"

### 2. PR Title Format

```
[Type] Brief description

Types: feat, fix, docs, refactor, test, chore
```

**Examples:**
- `[feat] Add interactive plugin debugger`
- `[fix] Resolve cloud sync timeout issue`
- `[docs] Update API reference for validators`

### 3. PR Description Template

```markdown
## Description

Brief description of the changes.

## Type of Change

- [ ] New feature
- [ ] Bug fix
- [ ] Documentation update
- [ ] Refactoring
- [ ] Test addition

## Related Issue

Fixes #(issue number)

## Testing

- [ ] Existing tests pass
- [ ] New tests added
- [ ] Manual testing completed

## Documentation

- [ ] Documentation updated
- [ ] README updated (if applicable)
- [ ] Docstrings added/updated

## Additional Notes

Any additional context or considerations.
```

### 4. Review Process

- Automated tests must pass
- At least one code review approval required
- Address review feedback
- Maintain clean commit history

### 5. Merging

Maintainers will merge once approved and all checks pass.

---

## Commit Message Guidelines

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, semicolons, etc.)
- **refactor**: Code refactoring without feature/bug changes
- **test**: Test additions or modifications
- **chore**: Dependency updates, build changes, etc.

### Scope

Scope should specify what part of the codebase is affected:

```
engine, parsers, validators, cloud, ui, plugins, etc.
```

### Subject Line

- Imperative mood: "add" not "added" or "adds"
- Don't capitalize first letter
- No period at the end
- Maximum 50 characters

### Body

```
Explain what and why, not how. Include:
- Problem being solved
- Solution approach
- Any breaking changes
- Related issues

Wrap at 72 characters.
```

### Footer

```
Fixes #123
Related-To #456
Breaking-Change: Describe what breaks
```

### Complete Example

```
feat(engine): add JPE-XML intermediate format support

Add support for JPE-XML as an intermediate format between JPE and Sims 4 XML.
This allows easier debugging and format conversion.

- Implement JPE-XML parser
- Implement JPE-XML generator
- Add comprehensive tests
- Update documentation

Fixes #45
```

---

## Troubleshooting Common Issues

### Tests Failing Locally

```bash
# Clear cache
rm -rf __pycache__ .pytest_cache

# Reinstall dependencies
pip install -e ".[dev]" --upgrade

# Run tests again
python run_tests.py
```

### Git Conflicts

```bash
# Fetch latest changes
git fetch upstream

# Rebase on upstream
git rebase upstream/master

# Resolve conflicts in your editor
# Then continue
git rebase --continue
```

### Changes Not Appearing

```bash
# Make sure you're on the right branch
git status

# Check remote is correct
git remote -v

# Push to origin
git push origin feature/your-feature
```

---

## Questions or Need Help?

- 📖 Check [DOCUMENTATION.md](./DOCUMENTATION.md)
- 🐛 Search existing [GitHub Issues](https://github.com/khaoticdev62/JPE-Sims4/issues)
- 💬 Ask in [GitHub Discussions](https://github.com/khaoticdev62/JPE-Sims4/discussions)

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License (see LICENSE file).

---

## Recognition

Contributors will be recognized in:
- Release notes
- Contributors list on GitHub
- Project documentation

Thank you for contributing! 🎉

---

**Last Updated**: December 2024
