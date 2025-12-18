//
//  ProjectModel.swift
//  JPETranslator
//
//  Created by Tuwana Development Team on 2023.
//

import Foundation

struct JPEProject: Codable {
    let id: String
    let name: String
    let version: String
    let author: String
    let description: String
    let createdDate: Date
    let lastModified: Date
    var interactions: [JPEInteraction]
    var buffs: [JPEBuff]
    var traits: [JPETrait]
    var enums: [JPEEnum]
    var strings: [JPEString]
}

struct JPEInteraction: Codable {
    let id: String
    let displayName: String
    let description: String
    let participants: [JPEParticipant]
    let tests: [JPETest]
    let lootActions: [JPELootAction]
}

struct JPEParticipant: Codable {
    let role: String
    let description: String
}

struct JPETest: Codable {
    let type: String
    let parameters: [String: String]
}

struct JPELootAction: Codable {
    let type: String
    let parameters: [String: String]
}

struct JPEBuff: Codable {
    let id: String
    let displayName: String
    let description: String
    let duration: Int // in minutes
}

struct JPETrait: Codable {
    let id: String
    let displayName: String
    let description: String
    let effects: [JPEBuff]
}

struct JPEEnum: Codable {
    let id: String
    let options: [JPEEnumOption]
}

struct JPEEnumOption: Codable {
    let name: String
    let value: Int
}

struct JPEString: Codable {
    let key: String
    let text: String
    let locale: String
}