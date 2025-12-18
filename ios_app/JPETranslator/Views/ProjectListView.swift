//
//  ProjectListView.swift
//  JPETranslator
//
//  Created by Tuwana Development Team on 2023.
//

import SwiftUI

struct ProjectListView: View {
    var projects: [JPEProject]
    
    var body: some View {
        NavigationView {
            List(projects) { project in
                NavigationLink(destination: ProjectDetailView(project: project)) {
                    VStack(alignment: .leading) {
                        Text(project.name)
                            .font(.headline)
                        Text("Version \(project.version) by \(project.author)")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                }
            }
            .navigationTitle("Projects")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("New") {
                        // Create new project
                    }
                }
            }
        }
    }
}

struct ProjectDetailView: View {
    let project: JPEProject
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 10) {
                Text(project.name)
                    .font(.title)
                    .fontWeight(.bold)
                
                Text("Project ID: \(project.id)")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                
                Divider()
                
                Text("Description")
                    .font(.headline)
                Text(project.description)
                
                Divider()
                
                Text("Statistics")
                    .font(.headline)
                VStack(alignment: .leading, spacing: 5) {
                    Text("Interactions: \(project.interactions.count)")
                    Text("Buffs: \(project.buffs.count)")
                    Text("Traits: \(project.traits.count)")
                    Text("Enums: \(project.enums.count)")
                    Text("Strings: \(project.strings.count)")
                }
                .font(.subheadline)
            }
            .padding()
        }
        .navigationTitle(project.name)
    }
}

struct ProjectListView_Previews: PreviewProvider {
    static var previews: some View {
        ProjectListView(projects: [
            JPEProject(
                id: "test_project_1",
                name: "Test Mod Project",
                version: "1.0.0",
                author: "Test Developer",
                description: "A sample mod project for testing",
                createdDate: Date(),
                lastModified: Date(),
                interactions: [],
                buffs: [],
                traits: [],
                enums: [],
                strings: []
            )
        ])
    }
}