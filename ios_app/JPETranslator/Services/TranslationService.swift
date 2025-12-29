//
//  TranslationService.swift
//  JPETranslator
//
//  Created by Tuwana Development Team on 2023.
//

import Foundation

/// Service that communicates with the backend translation engine
class TranslationService {
    
    private let baseURL = "https://api.jpe-sims4.com"
    private let session = URLSession.shared
    
    /// Validates a JPE syntax string for correctness
    func validateJPE(_ jpeContent: String) async throws -> ValidationResult {
        let endpoint = "\(baseURL)/validate"
        
        var request = URLRequest(url: URL(string: endpoint)!)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let requestBody = [
            "content": jpeContent,
            "format": "jpe"
        ]
        
        let jsonData = try JSONSerialization.data(withJSONObject: requestBody)
        request.httpBody = jsonData
        
        let (data, _) = try await session.data(for: request)
        
        let result = try JSONDecoder().decode(ValidationResult.self, from: data)
        return result
    }
    
    /// Translates JPE content to XML
    func translateJPEToXML(_ jpeContent: String) async throws -> TranslationResult {
        let endpoint = "\(baseURL)/translate/to-xml"
        
        var request = URLRequest(url: URL(string: endpoint)!)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let requestBody = [
            "source_content": jpeContent,
            "source_format": "jpe",
            "target_format": "xml"
        ]
        
        let jsonData = try JSONSerialization.data(withJSONObject: requestBody)
        request.httpBody = jsonData
        
        let (data, _) = try await session.data(for: request)
        
        let result = try JSONDecoder().decode(TranslationResult.self, from: data)
        return result
    }
    
    /// Translates XML content to JPE
    func translateXMLToJPE(_ xmlContent: String) async throws -> TranslationResult {
        let endpoint = "\(baseURL)/translate/to-jpe"
        
        var request = URLRequest(url: URL(string: endpoint)!)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let requestBody = [
            "source_content": xmlContent,
            "source_format": "xml",
            "target_format": "jpe"
        ]
        
        let jsonData = try JSONSerialization.data(withJSONObject: requestBody)
        request.httpBody = jsonData
        
        let (data, _) = try await session.data(for: request)
        
        let result = try JSONDecoder().decode(TranslationResult.self, from: data)
        return result
    }
    
    /// Builds a complete project
    func buildProject(_ project: JPEProject) async throws -> BuildResult {
        let endpoint = "\(baseURL)/build"
        
        var request = URLRequest(url: URL(string: endpoint)!)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        // Convert project to dictionary
        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601
        
        let jsonData = try encoder.encode(project)
        request.httpBody = jsonData
        
        let (data, _) = try await session.data(for: request)
        
        let result = try JSONDecoder().decode(BuildResult.self, from: data)
        return result
    }
}

// Result structures
struct ValidationResult: Codable {
    let isValid: Bool
    let errors: [ValidationError]
    let warnings: [String]
    let suggestions: [String]
}

struct ValidationError: Codable {
    let code: String
    let message: String
    let severity: String // "error", "warning", "info"
    let position: Position?
}

struct Position: Codable {
    let line: Int
    let column: Int
}

struct TranslationResult: Codable {
    let success: Bool
    let content: String
    let errors: [String]
    let warnings: [String]
}

struct BuildResult: Codable {
    let success: Bool
    let artifacts: [String]  // List of generated file paths
    let errors: [String]
    let warnings: [String]
    let buildId: String
}