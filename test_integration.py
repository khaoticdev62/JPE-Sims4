"""Integration test to verify all systems work together."""

def test_all_systems():
    """Test that all major systems can be imported and initialized."""
    print("Testing system integration...")
    
    # Test core engine
    from engine.engine import TranslationEngine, EngineConfig
    from engine.ir import ProjectIR, ProjectMetadata
    print("✓ Core engine components loaded")
    
    # Test diagnostics
    from diagnostics.errors import EngineError, ErrorCategory, ErrorSeverity
    from diagnostics.logging import app_logger, log_info, log_error
    print("✓ Diagnostics components loaded")
    
    # Test parsers
    from engine.parsers.jpe_parser import JpeParser
    from engine.parsers.jpe_xml_parser import JpeXmlParser
    from engine.parsers.xml_parser import XmlParser
    print("✓ Parser components loaded")
    
    # Test generators
    from engine.generators.xml_generator import XmlGenerator
    print("✓ Generator components loaded")
    
    # Test validators
    from engine.validation.validator import ProjectValidator
    print("✓ Validator components loaded")
    
    # Test cloud sync
    from cloud.api import CloudSyncAPI
    print("✓ Cloud API components loaded")
    
    # Test plugins
    from plugins.manager import PluginManager
    print("✓ Plugin system loaded")
    
    # Test UI components
    from ui.theme_manager import ThemeManager, theme_manager
    print("✓ Theme manager loaded")
    
    # Test onboarding system
    from onboarding.teaching_system import teaching_system, onboarding_system, test_system
    print("✓ Teaching system loaded")
    
    # Test configuration
    from config.config_manager import config_manager
    print("✓ Configuration manager loaded")
    
    # Test security
    from security.validator import security_validator
    print("✓ Security validator loaded")
    
    # Test performance
    from performance.monitor import performance_monitor, async_worker
    print("✓ Performance monitor loaded")
    
    # Test that systems can be used together
    project_metadata = ProjectMetadata(
        name="Test Project",
        project_id="test_project",
        version="1.0.0"
    )
    project_ir = ProjectIR(metadata=project_metadata)
    print("✓ IR components working")
    
    # Test logging
    log_info("Integration test passed")
    print("✓ Logging system working")
    
    # Test configuration access
    theme = config_manager.get("ui.theme", "default")
    print(f"✓ Configuration system working - current theme: {theme}")
    
    # Test security validation
    safe = security_validator.validate_file_path("test.jpe")
    print(f"✓ Security validation working - file validation: {safe}")
    
    # Test performance monitoring
    context = performance_monitor.start_operation("test_operation")
    performance_monitor.end_operation("test_operation", context)
    print("✓ Performance monitoring working")
    
    print("\nAll systems successfully integrated!")

if __name__ == "__main__":
    test_all_systems()