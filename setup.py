"""Setup configuration for JPE Sims 4 Mod Translator."""

from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

try:
    with open("pyproject.toml", "r", encoding="utf-8") as fh:
        # Extract version from pyproject.toml
        import toml
        pyproject_data = toml.loads(fh.read())
        version = pyproject_data["project"]["version"]
except (ImportError, FileNotFoundError, KeyError):
    # Fallback if toml module or pyproject.toml is not available during install
    version = "0.1.0"  # Default version

setup(
    name="jpe-sims4",
    version=version,
    author="Tuwana Development Team",
    author_email="dev@tuwana.example.com",
    description="Core engine and tooling for JPE Sims 4 mod translation.",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/tuwana/jpe-sims4",
    project_urls={
        "Bug Reports": "https://github.com/tuwana/jpe-sims4/issues",
        "Source": "https://github.com/tuwana/jpe-sims4",
    },
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.11",
        "Topic :: Software Development :: Build Tools",
        "Topic :: Games/Entertainment",
        "Typing :: Typed",
    ],
    packages=find_packages(),
    python_requires=">=3.11",
    install_requires=[
        "requests>=2.25.0",
        "toml>=0.10.0",
        "cryptography>=3.4.0",
        "psutil>=5.8.0; sys_platform != 'emscripten'",
        "ttkbootstrap>=1.10.0",
        "rich>=12.0.0",
        "watchdog>=2.1.0",
        "Pillow>=8.0.0",
        "aiohttp>=3.8.0",
        "websockets>=10.0",
        "matplotlib>=3.5.0",
        "plotly>=5.0.0",
        "regex>=2021.0.0",
        "textdistance>=4.2.0",
        "fuzzywuzzy>=0.18.0",
        "opencv-python>=4.5.0",
        "imageio>=2.9.0",
        "numpy>=1.21.0",
    ],
    entry_points={
        "console_scripts": [
            "jpe-sims4=cli:main",
            "jpe-studio=studio:main",
            "jpe-installer=installer:main",
        ],
    },
    extras_require={
        "dev": [
            "pytest>=6.0",
            "pytest-cov>=2.0",
            "toml>=0.10.0",
            "mypy>=0.910",
            "black>=21.0.0",
            "flake8>=3.8.0",
        ],
        "gui": [
            "Pillow>=8.0.0",
            "ttkbootstrap>=1.10.0",
            "matplotlib>=3.5.0",
            "plotly>=5.0.0",
        ],
        "enhanced": [
            "ttkbootstrap>=1.10.0",
            "rich>=12.0.0",
            "watchdog>=2.1.0",
            "Pillow>=8.0.0",
        ],
        "ai": [
            "torch>=1.9.0",
            "transformers>=4.10.0",
            "scikit-learn>=1.0.0",
            "numpy>=1.21.0",
        ],
        "cloud": [
            "aiohttp>=3.8.0",
            "websockets>=10.0",
        ],
        "text_processing": [
            "regex>=2021.0.0",
            "textdistance>=4.2.0",
            "fuzzywuzzy>=0.18.0",
        ],
        "image_processing": [
            "opencv-python>=4.5.0",
            "imageio>=2.9.0",
            "Pillow>=8.0.0",
        ],
        "all": [
            "pytest>=6.0",
            "pytest-cov>=2.0",
            "toml>=0.10.0",
            "mypy>=0.910",
            "black>=21.0.0",
            "flake8>=3.8.0",
            "Pillow>=8.0.0",
            "ttkbootstrap>=1.10.0",
            "rich>=12.0.0",
            "watchdog>=2.1.0",
            "aiohttp>=3.8.0",
            "websockets>=10.0",
            "matplotlib>=3.5.0",
            "plotly>=5.0.0",
            "regex>=2021.0.0",
            "textdistance>=4.2.0",
            "fuzzywuzzy>=0.18.0",
            "opencv-python>=4.5.0",
            "imageio>=2.9.0",
            "numpy>=1.21.0",
        ],
    },
)