//
//  ViewController.swift
//  JPETranslator
//
//  Created by Tuwana Development Team on 2023.
//

import UIKit

class ViewController: UIViewController {

    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view.
        
        // Set up the UI for the JPE Sims 4 Mod Translator
        self.view.backgroundColor = UIColor.systemBackground
        
        // Add a title label
        let titleLabel = UILabel()
        titleLabel.text = "JPE Sims 4 Mod Translator"
        titleLabel.font = UIFont.boldSystemFont(ofSize: 24)
        titleLabel.textAlignment = .center
        titleLabel.translatesAutoresizingMaskIntoConstraints = false
        
        self.view.addSubview(titleLabel)
        
        // Add a description label
        let descLabel = UILabel()
        descLabel.text = "Create Sims 4 mods with simple English-like syntax"
        descLabel.font = UIFont.systemFont(ofSize: 16)
        descLabel.textAlignment = .center
        descLabel.textColor = UIColor.secondaryLabel
        descLabel.numberOfLines = 0
        descLabel.translatesAutoresizingMaskIntoConstraints = false
        
        self.view.addSubview(descLabel)
        
        // Add project button
        let projectButton = UIButton(type: .system)
        projectButton.setTitle("New Project", for: .normal)
        projectButton.titleLabel?.font = UIFont.systemFont(ofSize: 18, weight: .medium)
        projectButton.backgroundColor = UIColor.systemBlue
        projectButton.setTitleColor(UIColor.white, for: .normal)
        projectButton.layer.cornerRadius = 8
        projectButton.translatesAutoresizingMaskIntoConstraints = false
        projectButton.addTarget(self, action: #selector(newProjectTapped), for: .touchUpInside)
        
        self.view.addSubview(projectButton)
        
        // Set up constraints
        NSLayoutConstraint.activate([
            titleLabel.centerXAnchor.constraint(equalTo: self.view.centerXAnchor),
            titleLabel.topAnchor.constraint(equalTo: self.view.safeAreaLayoutGuide.topAnchor, constant: 50),
            
            descLabel.leadingAnchor.constraint(equalTo: self.view.leadingAnchor, constant: 40),
            descLabel.trailingAnchor.constraint(equalTo: self.view.trailingAnchor, constant: -40),
            descLabel.topAnchor.constraint(equalTo: titleLabel.bottomAnchor, constant: 20),
            
            projectButton.centerXAnchor.constraint(equalTo: self.view.centerXAnchor),
            projectButton.widthAnchor.constraint(equalToConstant: 200),
            projectButton.heightAnchor.constraint(equalToConstant: 50),
            projectButton.topAnchor.constraint(equalTo: descLabel.bottomAnchor, constant: 50)
        ])
    }
    
    @objc func newProjectTapped() {
        // Present an alert to select project options
        let alert = UIAlertController(title: "New Project", message: "Enter project details", preferredStyle: .alert)
        
        alert.addTextField { textField in
            textField.placeholder = "Project Name"
        }
        
        alert.addTextField { textField in
            textField.placeholder = "Project ID"
            textField.text = "my_mod_project"
        }
        
        let createAction = UIAlertAction(title: "Create", style: .default) { [weak self] _ in
            guard let nameField = alert.textFields?[0],
                  let idField = alert.textFields?[1],
                  let name = nameField.text, !name.isEmpty,
                  let id = idField.text, !id.isEmpty else {
                return
            }
            
            // In a real implementation, this would create a new project
            self?.showAlert(title: "Project Created", message: "Created project '\(name)' with ID '\(id)'")
        }
        
        let cancelAction = UIAlertAction(title: "Cancel", style: .cancel)
        
        alert.addAction(createAction)
        alert.addAction(cancelAction)
        
        self.present(alert, animated: true)
    }
    
    func showAlert(title: String, message: String) {
        let alert = UIAlertController(title: title, message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "OK", style: .default))
        self.present(alert, animated: true)
    }
}