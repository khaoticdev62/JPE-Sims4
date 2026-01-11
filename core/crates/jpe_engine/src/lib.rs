//! Orchestration engine for JPE Sims 4 Mod Translation Suite
use jpe_diag::{Diagnostic, Severity};
use jpe_ir::ProjectIR;
use jpe_xml::{XmlParser, XmlGenerator};
use jpe_lang::{JpeParser, JpeFormatter};
use std::fs;
use std::path::Path;

pub struct EngineConfig {
    pub passthrough: bool,
}

pub struct TranslationEngine {
    config: EngineConfig,
}

impl TranslationEngine {
    pub fn new(config: EngineConfig) -> Self {
        Self { config }
    }

    pub fn import_xml_folder(&self, xml_folder: &Path, jpe_folder: &Path) -> Result<Vec<Diagnostic>, Vec<Diagnostic>> {
        let mut diagnostics = Vec::new();

        // Parse XML files into IR
        let xml_parser = XmlParser {};
        match xml_parser.parse_folder(xml_folder) {
            Ok((mut project, mut xml_diagnostics)) => {
                diagnostics.append(&mut xml_diagnostics);

                // Format as JPE and write to jpe_folder
                let jpe_formatter = JpeFormatter {};
                match jpe_formatter.format_project(&project) {
                    Ok((jpe_content, mut format_diagnostics)) => {
                        diagnostics.append(&mut format_diagnostics);

                        // Create JPE folder if it doesn't exist
                        fs::create_dir_all(jpe_folder).map_err(|e| {
                            vec![Diagnostic::new(
                                "JPE3005_CREATE_JPE_DIR_ERROR",
                                Severity::Error,
                                format!("Failed to create JPE directory: {}", e)
                            )]
                        })?;

                        // Write the formatted JPE content to a file
                        let output_path = jpe_folder.join("generated.jpe");
                        fs::write(&output_path, jpe_content).map_err(|e| {
                            vec![Diagnostic::new(
                                "JPE3006_WRITE_JPE_FILE_ERROR",
                                Severity::Error,
                                format!("Failed to write JPE file: {}", e)
                            )]
                        })?;
                    }
                    Err(mut format_diagnostics) => {
                        diagnostics.append(&mut format_diagnostics);
                    }
                }

                Ok(diagnostics)
            }
            Err(mut xml_diagnostics) => {
                diagnostics.append(&mut xml_diagnostics);
                Err(diagnostics)
            }
        }
    }

    pub fn build_jpe_folder(&self, jpe_folder: &Path, xml_folder: &Path) -> Result<Vec<Diagnostic>, Vec<Diagnostic>> {
        let mut diagnostics = Vec::new();

        // Parse JPE files into IR
        let jpe_parser = JpeParser {};
        match jpe_parser.parse_folder(jpe_folder) {
            Ok((project, mut jpe_diagnostics)) => {
                diagnostics.append(&mut jpe_diagnostics);

                // Generate XML from IR
                let xml_generator = XmlGenerator {};
                match xml_generator.generate_folder(&project, xml_folder) {
                    Ok(mut gen_diagnostics) => {
                        diagnostics.append(&mut gen_diagnostics);
                        Ok(diagnostics)
                    }
                    Err(mut gen_diagnostics) => {
                        diagnostics.append(&mut gen_diagnostics);
                        Err(diagnostics)
                    }
                }
            }
            Err(mut jpe_diagnostics) => {
                diagnostics.append(&mut jpe_diagnostics);
                Err(diagnostics)
            }
        }
    }

    pub fn check_project(&self, project_path: &Path) -> Result<Vec<Diagnostic>, Vec<Diagnostic>> {
        let mut diagnostics = Vec::new();

        // Check if project directory exists
        if !project_path.is_dir() {
            diagnostics.push(
                Diagnostic::new(
                    "JPE3007_PROJECT_DIR_NOT_FOUND",
                    Severity::Error,
                    format!("Project directory does not exist: {:?}", project_path)
                )
            );
            return Err(diagnostics);
        }

        // Check XML folder if it exists
        let xml_path = project_path.join("xml");
        if xml_path.is_dir() {
            let xml_parser = XmlParser {};
            match xml_parser.parse_folder(&xml_path) {
                Ok((_project, mut xml_diagnostics)) => {
                    diagnostics.append(&mut xml_diagnostics);
                }
                Err(mut xml_diagnostics) => {
                    diagnostics.append(&mut xml_diagnostics);
                }
            }
        }

        // Check JPE folder if it exists
        let jpe_path = project_path.join("jpe");
        if jpe_path.is_dir() {
            let jpe_parser = JpeParser {};
            match jpe_parser.parse_folder(&jpe_path) {
                Ok((_project, mut jpe_diagnostics)) => {
                    diagnostics.append(&mut jpe_diagnostics);
                }
                Err(mut jpe_diagnostics) => {
                    diagnostics.append(&mut jpe_diagnostics);
                }
            }
        }

        // If we have error-level diagnostics, return them as an error
        if jpe_diag::has_error_level(&diagnostics) {
            return Err(diagnostics);
        }

        Ok(diagnostics)
    }

    pub fn format_jpe_folder(&self, jpe_folder: &Path) -> Result<Vec<Diagnostic>, Vec<Diagnostic>> {
        let mut diagnostics = Vec::new();

        // Check if JPE folder exists
        if !jpe_folder.is_dir() {
            diagnostics.push(
                Diagnostic::new(
                    "JPE3008_JPE_DIR_NOT_FOUND",
                    Severity::Error,
                    format!("JPE directory does not exist: {:?}", jpe_folder)
                )
            );
            return Err(diagnostics);
        }

        // Parse JPE files into IR
        let jpe_parser = JpeParser {};
        match jpe_parser.parse_folder(jpe_folder) {
            Ok((project, mut parse_diagnostics)) => {
                diagnostics.append(&mut parse_diagnostics);

                // Format the project canonically
                let jpe_formatter = JpeFormatter {};
                match jpe_formatter.format_project(&project) {
                    Ok((formatted_content, mut format_diagnostics)) => {
                        diagnostics.append(&mut format_diagnostics);

                        // Write the formatted content back to the files
                        // For simplicity, we'll write to a single file in a formatted subdirectory
                        let formatted_dir = jpe_folder.join("formatted");
                        fs::create_dir_all(&formatted_dir).map_err(|e| {
                            vec![Diagnostic::new(
                                "JPE3009_CREATE_FORMATTED_DIR_ERROR",
                                Severity::Error,
                                format!("Failed to create formatted directory: {}", e)
                            )]
                        })?;

                        let output_path = formatted_dir.join("formatted.jpe");
                        fs::write(&output_path, formatted_content).map_err(|e| {
                            vec![Diagnostic::new(
                                "JPE3010_WRITE_FORMATTED_FILE_ERROR",
                                Severity::Error,
                                format!("Failed to write formatted JPE file: {}", e)
                            )]
                        })?;

                        Ok(diagnostics)
                    }
                    Err(mut format_diagnostics) => {
                        diagnostics.append(&mut format_diagnostics);
                        Err(diagnostics)
                    }
                }
            }
            Err(mut parse_diagnostics) => {
                diagnostics.append(&mut parse_diagnostics);
                Err(diagnostics)
            }
        }
    }

    /// Import XML files and convert to JPE format
    pub fn import_to_jpe(&self, source_xml: &Path, dest_jpe: &Path) -> Result<Vec<Diagnostic>, Vec<Diagnostic>> {
        self.import_xml_folder(source_xml, dest_jpe)
    }

    /// Build JPE files to XML format
    pub fn build_to_xml(&self, source_jpe: &Path, dest_xml: &Path) -> Result<Vec<Diagnostic>, Vec<Diagnostic>> {
        self.build_jpe_folder(source_jpe, dest_xml)
    }

    /// Validate a project by checking both XML and JPE files
    pub fn validate_project(&self, project_path: &Path) -> Result<Vec<Diagnostic>, Vec<Diagnostic>> {
        self.check_project(project_path)
    }

    /// Format JPE files in canonical format
    pub fn format_project(&self, project_path: &Path) -> Result<Vec<Diagnostic>, Vec<Diagnostic>> {
        let jpe_path = project_path.join("jpe");
        self.format_jpe_folder(&jpe_path)
    }
}