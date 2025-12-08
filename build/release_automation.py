"""Release automation script for JPE Sims 4 Mod Translator.

Handles version bumping, changelog generation, git tagging, and release notes.
"""

import subprocess
import sys
import json
import re
from pathlib import Path
from typing import Optional, Dict, List
from datetime import datetime
from enum import Enum


class ReleaseType(Enum):
    """Types of releases (semantic versioning)."""

    MAJOR = "major"  # X.0.0
    MINOR = "minor"  # 0.X.0
    PATCH = "patch"  # 0.0.X
    PRERELEASE = "prerelease"  # 0.0.0-beta


class ReleaseAutomation:
    """Automates release process."""

    def __init__(self, project_root: Path):
        """Initialize release automation.

        Args:
            project_root: Project root directory
        """
        self.project_root = project_root
        self.version_file = project_root / "VERSION"
        self.changelog_file = project_root / "CHANGELOG.md"
        self.setup_py_file = project_root / "setup.py"

    def get_current_version(self) -> str:
        """Get current version.

        Returns:
            Current version string
        """
        if self.version_file.exists():
            return self.version_file.read_text().strip()

        # Try to get from setup.py
        if self.setup_py_file.exists():
            content = self.setup_py_file.read_text()
            match = re.search(r'version\s*=\s*["\']([^"\']+)["\']', content)
            if match:
                return match.group(1)

        return "0.0.0"

    def bump_version(self, release_type: ReleaseType) -> str:
        """Bump version based on release type.

        Args:
            release_type: Type of release

        Returns:
            New version string
        """
        current = self.get_current_version()
        parts = current.split(".")

        major = int(parts[0]) if len(parts) > 0 else 0
        minor = int(parts[1]) if len(parts) > 1 else 0
        patch = int(parts[2].split("-")[0]) if len(parts) > 2 else 0
        prerelease = parts[2].split("-")[1] if len(parts) > 2 and "-" in parts[2] else None

        if release_type == ReleaseType.MAJOR:
            major += 1
            minor = 0
            patch = 0
        elif release_type == ReleaseType.MINOR:
            minor += 1
            patch = 0
        elif release_type == ReleaseType.PATCH:
            patch += 1
        elif release_type == ReleaseType.PRERELEASE:
            if prerelease:
                prerelease = f"beta{int(prerelease[4:]) + 1}"
            else:
                prerelease = "beta1"

        new_version = f"{major}.{minor}.{patch}"
        if prerelease:
            new_version += f"-{prerelease}"

        return new_version

    def update_version(self, new_version: str) -> bool:
        """Update version in all files.

        Args:
            new_version: New version string

        Returns:
            True if successful
        """
        try:
            # Update VERSION file
            self.version_file.write_text(new_version + "\n")

            # Update setup.py
            if self.setup_py_file.exists():
                content = self.setup_py_file.read_text()
                content = re.sub(
                    r'version\s*=\s*["\']([^"\']+)["\']',
                    f'version="{new_version}"',
                    content
                )
                self.setup_py_file.write_text(content)

            # Update __init__.py if exists
            init_file = self.project_root / "jpe_sims4" / "__init__.py"
            if init_file.exists():
                content = init_file.read_text()
                content = re.sub(
                    r'__version__\s*=\s*["\']([^"\']+)["\']',
                    f'__version__ = "{new_version}"',
                    content
                )
                init_file.write_text(content)

            return True
        except Exception as e:
            print(f"Error updating version: {e}")
            return False

    def generate_changelog(self, new_version: str, release_notes: str) -> bool:
        """Generate changelog entry.

        Args:
            new_version: New version
            release_notes: Release notes content

        Returns:
            True if successful
        """
        try:
            # Read existing changelog
            existing = ""
            if self.changelog_file.exists():
                existing = self.changelog_file.read_text()

            # Create new entry
            timestamp = datetime.now().strftime("%Y-%m-%d")
            new_entry = f"""## [{new_version}] - {timestamp}

{release_notes}

"""

            # Combine with existing
            new_content = new_entry + existing

            # Write back
            self.changelog_file.write_text(new_content)

            return True
        except Exception as e:
            print(f"Error generating changelog: {e}")
            return False

    def git_commit_and_tag(self, version: str, commit_message: str = None) -> bool:
        """Commit version changes and create git tag.

        Args:
            version: Version being released
            commit_message: Optional custom commit message

        Returns:
            True if successful
        """
        try:
            # Stage changes
            subprocess.run(
                ["git", "add", "-A"],
                cwd=self.project_root,
                check=True,
                capture_output=True
            )

            # Commit
            if commit_message is None:
                commit_message = f"chore: Release version {version}"

            subprocess.run(
                ["git", "commit", "-m", commit_message],
                cwd=self.project_root,
                check=True,
                capture_output=True
            )

            # Tag
            subprocess.run(
                ["git", "tag", "-a", f"v{version}", "-m", f"Release {version}"],
                cwd=self.project_root,
                check=True,
                capture_output=True
            )

            return True
        except subprocess.CalledProcessError as e:
            print(f"Error with git operations: {e}")
            return False

    def create_release_notes(self, version: str) -> str:
        """Generate release notes from commit history.

        Args:
            version: Version being released

        Returns:
            Release notes content
        """
        try:
            # Get commits since last tag
            result = subprocess.run(
                ["git", "log", "--oneline", "--grep", "^(feat|fix|docs|perf)"],
                cwd=self.project_root,
                capture_output=True,
                text=True,
                check=True
            )

            commits = result.stdout.strip().split("\n")

            # Categorize commits
            features = []
            fixes = []
            docs = []
            perf = []

            for commit in commits:
                if "feat" in commit:
                    features.append(commit)
                elif "fix" in commit:
                    fixes.append(commit)
                elif "docs" in commit:
                    docs.append(commit)
                elif "perf" in commit:
                    perf.append(commit)

            # Build release notes
            notes = ""

            if features:
                notes += "### Features\n"
                for feat in features:
                    notes += f"- {feat}\n"
                notes += "\n"

            if fixes:
                notes += "### Bug Fixes\n"
                for fix in fixes:
                    notes += f"- {fix}\n"
                notes += "\n"

            if perf:
                notes += "### Performance\n"
                for p in perf:
                    notes += f"- {p}\n"
                notes += "\n"

            if docs:
                notes += "### Documentation\n"
                for doc in docs:
                    notes += f"- {doc}\n"

            return notes

        except subprocess.CalledProcessError:
            return "See commit history for changes."

    def push_release(self) -> bool:
        """Push release to remote repository.

        Returns:
            True if successful
        """
        try:
            # Push commits
            subprocess.run(
                ["git", "push", "origin", "master"],
                cwd=self.project_root,
                check=True,
                capture_output=True
            )

            # Push tags
            subprocess.run(
                ["git", "push", "origin", "--tags"],
                cwd=self.project_root,
                check=True,
                capture_output=True
            )

            return True
        except subprocess.CalledProcessError as e:
            print(f"Error pushing to remote: {e}")
            return False

    def perform_release(self, release_type: ReleaseType, custom_notes: Optional[str] = None) -> bool:
        """Perform complete release process.

        Args:
            release_type: Type of release
            custom_notes: Optional custom release notes

        Returns:
            True if successful
        """
        print(f"Starting {release_type.value} release...")

        # Get current version
        current_version = self.get_current_version()
        print(f"Current version: {current_version}")

        # Bump version
        new_version = self.bump_version(release_type)
        print(f"New version: {new_version}")

        # Update version in files
        if not self.update_version(new_version):
            print("Failed to update version")
            return False
        print("✓ Version updated")

        # Generate release notes
        if custom_notes:
            release_notes = custom_notes
        else:
            release_notes = self.create_release_notes(new_version)
        print("✓ Release notes generated")

        # Update changelog
        if not self.generate_changelog(new_version, release_notes):
            print("Failed to generate changelog")
            return False
        print("✓ Changelog updated")

        # Git commit and tag
        if not self.git_commit_and_tag(new_version):
            print("Failed to commit and tag")
            return False
        print("✓ Changes committed and tagged")

        # Push to remote
        if not self.push_release():
            print("Failed to push to remote")
            return False
        print("✓ Changes pushed to remote")

        print(f"\n✅ Release {new_version} completed successfully!")
        print(f"   Tag: v{new_version}")
        print(f"   Build artifacts will be created automatically by CI/CD")

        return True


def main():
    """Main entry point."""
    import argparse

    parser = argparse.ArgumentParser(description="Release automation for JPE Sims 4")
    parser.add_argument(
        "release_type",
        choices=["major", "minor", "patch", "prerelease"],
        help="Type of release"
    )
    parser.add_argument("--notes", type=str, help="Custom release notes")
    parser.add_argument("--push", action="store_true", help="Push to remote after release")

    args = parser.parse_args()

    project_root = Path(__file__).parent.parent
    automation = ReleaseAutomation(project_root)

    release_type = ReleaseType(args.release_type)
    success = automation.perform_release(release_type, args.notes)

    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
