"""Tests for Sims 4 file type support and format detection."""

import pytest
from pathlib import Path
from tempfile import TemporaryDirectory
import xml.etree.ElementTree as ET

from engine.sims4_file_support import (
    Sims4FileType,
    Sims4FileFormat,
    Sims4FileMetadata,
    Sims4FileValidationResult,
    Sims4FileTypeDetector,
    Sims4InteractionHandler,
    Sims4TuningHandler,
    Sims4PackageHandler,
    Sims4FileTypeRegistry,
    Sims4FileManager,
    create_file_manager,
)


class TestSims4FileTypeDetection:
    """Test file type detection."""

    def test_detect_by_extension(self):
        """Test detection by file extension."""
        with TemporaryDirectory() as tmpdir:
            # Test XML file
            xml_file = Path(tmpdir) / "test.interaction"
            xml_file.write_text("<Interaction/>")

            detected = Sims4FileTypeDetector.detect_file_type(xml_file)
            assert detected == Sims4FileType.INTERACTION

    def test_detect_by_magic_bytes(self):
        """Test detection by magic bytes."""
        with TemporaryDirectory() as tmpdir:
            # Test XML file by magic bytes
            xml_file = Path(tmpdir) / "test.data"
            xml_file.write_text("<?xml version='1.0'?><root/>")

            detected = Sims4FileTypeDetector.detect_file_type(xml_file)
            assert detected == Sims4FileType.XML

    def test_detect_json_file(self):
        """Test JSON file detection."""
        with TemporaryDirectory() as tmpdir:
            json_file = Path(tmpdir) / "test.data"
            json_file.write_text('{"test": "value"}')

            detected = Sims4FileTypeDetector.detect_file_type(json_file)
            assert detected == Sims4FileType.JSON

    def test_detect_unknown_file(self):
        """Test unknown file type."""
        with TemporaryDirectory() as tmpdir:
            unknown_file = Path(tmpdir) / "test.unknown"
            unknown_file.write_text("unknown content")

            detected = Sims4FileTypeDetector.detect_file_type(unknown_file)
            assert detected == Sims4FileType.UNKNOWN

    def test_format_detection(self):
        """Test format detection from file type."""
        assert (
            Sims4FileTypeDetector.detect_file_format(Sims4FileType.PACKAGE)
            == Sims4FileFormat.BINARY
        )
        assert (
            Sims4FileTypeDetector.detect_file_format(Sims4FileType.INTERACTION)
            == Sims4FileFormat.XML
        )
        assert (
            Sims4FileTypeDetector.detect_file_format(Sims4FileType.JSON)
            == Sims4FileFormat.JSON
        )


class TestInteractionHandler:
    """Test interaction XML file handler."""

    def test_validate_valid_xml(self):
        """Test validation of valid interaction XML."""
        with TemporaryDirectory() as tmpdir:
            xml_file = Path(tmpdir) / "test.interaction"

            # Create valid interaction XML
            root = ET.Element("Interaction")
            root.set("instance_id", "12345")
            root.set("name", "TestInteraction")
            tree = ET.ElementTree(root)
            tree.write(xml_file)

            handler = Sims4InteractionHandler()
            result = handler.validate(xml_file)

            assert result.is_valid
            assert result.file_type == Sims4FileType.INTERACTION
            assert len(result.errors) == 0

    def test_validate_invalid_xml(self):
        """Test validation of invalid XML."""
        with TemporaryDirectory() as tmpdir:
            xml_file = Path(tmpdir) / "test.interaction"
            xml_file.write_text("<unclosed>")

            handler = Sims4InteractionHandler()
            result = handler.validate(xml_file)

            assert not result.is_valid
            assert len(result.errors) > 0

    def test_read_xml_file(self):
        """Test reading XML file."""
        with TemporaryDirectory() as tmpdir:
            xml_file = Path(tmpdir) / "test.interaction"

            # Create XML with content
            root = ET.Element("Interaction")
            root.set("name", "TestInteraction")
            child = ET.SubElement(root, "Parameter")
            child.set("name", "param1")
            child.text = "value1"

            tree = ET.ElementTree(root)
            tree.write(xml_file)

            handler = Sims4InteractionHandler()
            content = handler.read(xml_file)

            assert "root_tag" in content
            assert content["root_tag"] == "Interaction"
            assert "attributes" in content
            assert content["attributes"]["name"] == "TestInteraction"

    def test_write_xml_file(self):
        """Test writing XML file."""
        with TemporaryDirectory() as tmpdir:
            xml_file = Path(tmpdir) / "test.interaction"

            content = {
                "root_tag": "Interaction",
                "attributes": {"name": "TestInteraction"},
                "children": {},
            }

            handler = Sims4InteractionHandler()
            success = handler.write(xml_file, content)

            assert success
            assert xml_file.exists()

            # Verify written content
            tree = ET.parse(xml_file)
            root = tree.getroot()
            assert root.tag == "Interaction"
            assert root.get("name") == "TestInteraction"


class TestTuningHandler:
    """Test tuning XML file handler."""

    def test_validate_tuning_file(self):
        """Test validation of tuning file."""
        with TemporaryDirectory() as tmpdir:
            tune_file = Path(tmpdir) / "test.tune"

            # Create tuning XML
            root = ET.Element("Tuning")
            tree = ET.ElementTree(root)
            tree.write(tune_file)

            handler = Sims4TuningHandler()
            result = handler.validate(tune_file)

            assert result.is_valid
            assert result.file_type == Sims4FileType.TUNING

    def test_validate_wrong_root_element(self):
        """Test validation with wrong root element."""
        with TemporaryDirectory() as tmpdir:
            tune_file = Path(tmpdir) / "test.tune"

            # Create XML with wrong root
            root = ET.Element("WrongRoot")
            tree = ET.ElementTree(root)
            tree.write(tune_file)

            handler = Sims4TuningHandler()
            result = handler.validate(tune_file)

            assert result.is_valid  # Still valid XML, just warning
            assert len(result.warnings) > 0


class TestFileTypeRegistry:
    """Test file type handler registry."""

    def test_register_handler(self):
        """Test handler registration."""
        registry = Sims4FileTypeRegistry()

        # Should have default handlers
        interaction_handlers = registry.get_handlers(Sims4FileType.INTERACTION)
        assert len(interaction_handlers) > 0

    def test_get_primary_handler(self):
        """Test getting primary handler."""
        registry = Sims4FileTypeRegistry()

        handler = registry.get_primary_handler(Sims4FileType.INTERACTION)
        assert handler is not None
        assert isinstance(handler, Sims4InteractionHandler)

    def test_get_handler_for_unknown_type(self):
        """Test getting handler for unknown type."""
        registry = Sims4FileTypeRegistry()

        handler = registry.get_primary_handler(Sims4FileType.UNKNOWN)
        assert handler is None


class TestFileManager:
    """Test file manager operations."""

    def test_create_file_manager(self):
        """Test factory function."""
        manager = create_file_manager()
        assert isinstance(manager, Sims4FileManager)

    def test_detect_and_get_metadata(self):
        """Test metadata detection."""
        with TemporaryDirectory() as tmpdir:
            xml_file = Path(tmpdir) / "test.interaction"
            xml_file.write_text("<?xml version='1.0'?><Interaction/>")

            manager = Sims4FileManager()
            metadata = manager.detect_and_get_metadata(xml_file)

            assert metadata.file_type == Sims4FileType.INTERACTION
            assert metadata.file_format == Sims4FileFormat.XML
            assert metadata.size_bytes > 0

    def test_metadata_caching(self):
        """Test metadata caching."""
        with TemporaryDirectory() as tmpdir:
            xml_file = Path(tmpdir) / "test.interaction"
            xml_file.write_text("<?xml version='1.0'?><Interaction/>")

            manager = Sims4FileManager()

            # First call
            metadata1 = manager.detect_and_get_metadata(xml_file)
            # Second call should use cache
            metadata2 = manager.detect_and_get_metadata(xml_file)

            assert metadata1 is metadata2  # Same object from cache

    def test_validate_file(self):
        """Test file validation through manager."""
        with TemporaryDirectory() as tmpdir:
            xml_file = Path(tmpdir) / "test.interaction"
            root = ET.Element("Interaction")
            root.set("instance_id", "12345")
            tree = ET.ElementTree(root)
            tree.write(xml_file)

            manager = Sims4FileManager()
            result = manager.validate_file(xml_file)

            assert result.is_valid

    def test_read_file(self):
        """Test file reading through manager."""
        with TemporaryDirectory() as tmpdir:
            xml_file = Path(tmpdir) / "test.interaction"
            root = ET.Element("Interaction")
            root.set("name", "Test")
            tree = ET.ElementTree(root)
            tree.write(xml_file)

            manager = Sims4FileManager()
            content = manager.read_file(xml_file)

            assert "root_tag" in content
            assert content["root_tag"] == "Interaction"

    def test_write_file(self):
        """Test file writing through manager."""
        with TemporaryDirectory() as tmpdir:
            xml_file = Path(tmpdir) / "test.interaction"

            content = {
                "root_tag": "Interaction",
                "attributes": {"name": "Test"},
                "children": {},
            }

            manager = Sims4FileManager()
            success = manager.write_file(xml_file, content)

            assert success
            assert xml_file.exists()

    def test_get_supported_file_types(self):
        """Test getting list of supported file types."""
        manager = Sims4FileManager()
        types = manager.get_supported_file_types()

        assert len(types) > 0
        assert "interaction" in types
        assert "tuning" in types
        assert "package" in types

    def test_clear_cache(self):
        """Test cache clearing."""
        with TemporaryDirectory() as tmpdir:
            xml_file = Path(tmpdir) / "test.interaction"
            xml_file.write_text("<?xml version='1.0'?><Interaction/>")

            manager = Sims4FileManager()
            manager.detect_and_get_metadata(xml_file)

            # Verify cache not empty
            assert len(manager._metadata_cache) > 0

            # Clear cache
            manager.clear_cache()

            assert len(manager._metadata_cache) == 0


class TestPackageHandler:
    """Test package file handler."""

    def test_package_type_support(self):
        """Test that handler supports package files."""
        handler = Sims4PackageHandler()
        assert handler.supports_type(Sims4FileType.PACKAGE)

    def test_read_raises_not_implemented(self):
        """Test that read raises NotImplementedError."""
        with TemporaryDirectory() as tmpdir:
            package_file = Path(tmpdir) / "test.package"
            package_file.write_bytes(b"DBpf")  # Valid magic bytes

            handler = Sims4PackageHandler()

            with pytest.raises(NotImplementedError):
                handler.read(package_file)

    def test_write_raises_not_implemented(self):
        """Test that write raises NotImplementedError."""
        with TemporaryDirectory() as tmpdir:
            package_file = Path(tmpdir) / "test.package"

            handler = Sims4PackageHandler()

            with pytest.raises(NotImplementedError):
                handler.write(package_file, {})

    def test_validate_invalid_magic_bytes(self):
        """Test validation of invalid magic bytes."""
        with TemporaryDirectory() as tmpdir:
            package_file = Path(tmpdir) / "test.package"
            package_file.write_bytes(b"XXXX")  # Invalid magic

            handler = Sims4PackageHandler()
            result = handler.validate(package_file)

            assert not result.is_valid
            assert len(result.errors) > 0

    def test_validate_valid_magic_bytes(self):
        """Test validation of valid magic bytes."""
        with TemporaryDirectory() as tmpdir:
            package_file = Path(tmpdir) / "test.package"
            package_file.write_bytes(b"DBpf" + b"\x00" * 100)  # Valid magic

            handler = Sims4PackageHandler()
            result = handler.validate(package_file)

            assert result.is_valid


class TestFileMetadata:
    """Test file metadata."""

    def test_metadata_to_dict(self):
        """Test metadata serialization to dict."""
        path = Path("/test/file.interaction")
        metadata = Sims4FileMetadata(
            file_path=path,
            file_type=Sims4FileType.INTERACTION,
            file_format=Sims4FileFormat.XML,
            size_bytes=1024,
            is_valid=True,
        )

        data = metadata.to_dict()

        assert data["file_type"] == "interaction"
        assert data["file_format"] == "xml"
        assert data["size_bytes"] == 1024
        assert data["is_valid"] is True

    def test_metadata_with_properties(self):
        """Test metadata with custom properties."""
        path = Path("/test/file.interaction")
        metadata = Sims4FileMetadata(
            file_path=path,
            file_type=Sims4FileType.INTERACTION,
            file_format=Sims4FileFormat.XML,
            size_bytes=1024,
            properties={"version": "1.0", "author": "TestAuthor"},
        )

        data = metadata.to_dict()
        assert data["properties"]["version"] == "1.0"
        assert data["properties"]["author"] == "TestAuthor"
