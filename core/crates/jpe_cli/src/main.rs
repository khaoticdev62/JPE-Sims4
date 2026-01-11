//! Command-line interface for JPE Sims 4 Mod Translation Suite
use clap::{Parser, Subcommand};
use jpe_diag::{Diagnostic, Severity};
use jpe_engine::{EngineConfig, TranslationEngine};
use std::path::PathBuf;

#[derive(Parser)]
#[command(name = "jpe")]
#[command(about = "JPE Sims 4 Mod Translation Suite", long_about = None)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Initialize a new JPE project
    Init {
        /// Project directory to create
        #[arg(value_name = "PROJECT_DIR")]
        project_dir: PathBuf,
    },
    /// Import XML tuning files into JPE format
    Import {
        /// Source XML folder to import from
        #[arg(short, long, value_name = "XML_FOLDER")]
        xml_folder: PathBuf,
        
        /// Output project directory
        #[arg(short, long, value_name = "PROJECT_DIR")]
        out: PathBuf,
    },
    /// Check project for errors
    Check {
        /// Project directory to check
        #[arg(value_name = "PROJECT_DIR")]
        project: PathBuf,
        
        /// Output diagnostics to JSON file
        #[arg(long, value_name = "JSON_FILE")]
        json: Option<PathBuf>,
    },
    /// Build JPE files back to XML
    Build {
        /// Project directory to build
        #[arg(value_name = "PROJECT_DIR")]
        project: PathBuf,
        
        /// Output directory for XML files
        #[arg(long, value_name = "OUTPUT_DIR")]
        out: PathBuf,
        
        /// Enable passthrough mode for unsupported elements
        #[arg(long)]
        passthrough: bool,
    },
    /// Format JPE files canonically
    Fmt {
        /// Project directory to format
        #[arg(value_name = "PROJECT_DIR")]
        project: PathBuf,
    },
}

fn main() {
    // Initialize tracing
    tracing_subscriber::fmt::init();

    let cli = Cli::parse();

    match cli.command {
        Commands::Init { project_dir } => {
            cmd_init(&project_dir);
        }
        Commands::Import { xml_folder, out } => {
            cmd_import(&xml_folder, &out);
        }
        Commands::Check { project, json } => {
            cmd_check(&project, json.as_ref());
        }
        Commands::Build { project, out, passthrough } => {
            cmd_build(&project, &out, passthrough);
        }
        Commands::Fmt { project } => {
            cmd_fmt(&project);
        }
    }
}

fn cmd_init(project_dir: &PathBuf) {
    println!("Initializing new JPE project in {:?}", project_dir);
    
    // Create project directory structure
    std::fs::create_dir_all(project_dir.join("xml")).expect("Failed to create xml directory");
    std::fs::create_dir_all(project_dir.join("jpe")).expect("Failed to create jpe directory");
    std::fs::create_dir_all(project_dir.join("build")).expect("Failed to create build directory");
    
    // Create project config file
    let config_content = r#"[project]
name = ""
version = "0.1"
game = "sims4"

[paths]
xml_in = "xml"
jpe = "jpe"
xml_out = "build/xml"

[engine]
passthrough = true
"#;
    
    std::fs::write(project_dir.join("jpe_project.toml"), config_content)
        .expect("Failed to create project config file");
    
    println!("Project initialized successfully!");
}

fn cmd_import(xml_folder: &PathBuf, out: &PathBuf) {
    println!("Importing XML from {:?} to {:?}", xml_folder, out);
    
    let config = EngineConfig {
        passthrough: true, // Default to true for import
    };
    let engine = TranslationEngine::new(config);
    
    match engine.import_xml_folder(xml_folder, &out.join("jpe")) {
        Ok(diagnostics) => {
            print_diagnostics(&diagnostics);
            if has_error_level(&diagnostics) {
                std::process::exit(1);
            }
        }
        Err(diagnostics) => {
            print_diagnostics(&diagnostics);
            std::process::exit(1);
        }
    }
}

fn cmd_check(project: &PathBuf, json_file: Option<&PathBuf>) {
    println!("Checking project {:?}", project);
    
    let config = EngineConfig {
        passthrough: false,
    };
    let engine = TranslationEngine::new(config);
    
    match engine.check_project(project) {
        Ok(diagnostics) => {
            print_diagnostics(&diagnostics);
            
            if let Some(json_path) = json_file {
                let json_output = serde_json::to_string_pretty(&diagnostics)
                    .expect("Failed to serialize diagnostics to JSON");
                std::fs::write(json_path, json_output)
                    .expect("Failed to write diagnostics to JSON file");
            }
            
            if has_error_level(&diagnostics) {
                std::process::exit(1);
            }
        }
        Err(diagnostics) => {
            print_diagnostics(&diagnostics);
            std::process::exit(1);
        }
    }
}

fn cmd_build(project: &PathBuf, out: &PathBuf, passthrough: bool) {
    println!("Building project {:?} to {:?}", project, out);
    
    let config = EngineConfig {
        passthrough,
    };
    let engine = TranslationEngine::new(config);
    
    match engine.build_jpe_folder(&project.join("jpe"), out) {
        Ok(diagnostics) => {
            print_diagnostics(&diagnostics);
            if has_error_level(&diagnostics) {
                std::process::exit(1);
            }
        }
        Err(diagnostics) => {
            print_diagnostics(&diagnostics);
            std::process::exit(1);
        }
    }
}

fn cmd_fmt(project: &PathBuf) {
    println!("Formatting JPE files in {:?}", project);
    
    let config = EngineConfig {
        passthrough: false,
    };
    let engine = TranslationEngine::new(config);
    
    match engine.format_jpe_folder(&project.join("jpe")) {
        Ok(diagnostics) => {
            print_diagnostics(&diagnostics);
            if has_error_level(&diagnostics) {
                std::process::exit(1);
            }
        }
        Err(diagnostics) => {
            print_diagnostics(&diagnostics);
            std::process::exit(1);
        }
    }
}

fn print_diagnostics(diagnostics: &[Diagnostic]) {
    for diag in diagnostics {
        let level = match diag.severity {
            Severity::Info => "INFO",
            Severity::Warning => "WARNING",
            Severity::Error => "ERROR",
            Severity::Fatal => "FATAL",
        };
        
        match &diag.span {
            Some(span) => {
                println!("[{}] {}:{}:{} - {}", level, span.file, span.start_line, span.start_col, diag.message);
            }
            None => {
                println!("[{}] {}", level, diag.message);
            }
        }
        
        if let Some(hint) = &diag.hint {
            println!("  Hint: {}", hint);
        }
    }
}

fn has_error_level(diagnostics: &[Diagnostic]) -> bool {
    diagnostics.iter().any(|d| {
        matches!(d.severity, Severity::Error | Severity::Fatal)
    })
}