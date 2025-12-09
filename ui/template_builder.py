
import tkinter as tk
from tkinter import ttk, messagebox
from pathlib import Path
import os

class TemplateBuilder(tk.Toplevel):
    def __init__(self, parent, project_root):
        super().__init__(parent)
        self.title("Template Builder")
        self.geometry("600x400")
        self.parent = parent
        self.project_root = project_root
        self.templates = self.load_templates()

        self.create_widgets()

    def load_templates(self):
        template_dir = Path(__file__).parent.parent / "templates"
        templates = {}
        for template_file in template_dir.glob("*.jpe"):
            with open(template_file, "r", encoding="utf-8") as f:
                # Use the filename without extension as the template name
                template_name = template_file.stem
                templates[template_name] = f.read()
        return templates

    def create_widgets(self):
        self.template_list = tk.Listbox(self)
        for template_name in self.templates.keys():
            self.template_list.insert(tk.END, template_name)
        self.template_list.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)

        self.template_list.bind("<<ListboxSelect>>", self.on_template_select)

        self.create_button = ttk.Button(self, text="Create from Template", command=self.create_from_template)
        self.create_button.pack(pady=10)
        self.create_button.config(state=tk.DISABLED)

    def on_template_select(self, event):
        self.create_button.config(state=tk.NORMAL)

    def create_from_template(self):
        selected_template_index = self.template_list.curselection()
        if not selected_template_index:
            messagebox.showwarning("No Template Selected", "Please select a template to create from.")
            return

        template_name = self.template_list.get(selected_template_index)
        template_content = self.templates[template_name]

        # For now, just create a new file in the src directory
        # with the template content. A more advanced implementation
        # would allow the user to choose a filename and location.
        new_file_path = self.project_root / "src" / f"{template_name}.jpe"
        
        if new_file_path.exists():
            # File already exists, ask the user if they want to overwrite
            if not messagebox.askyesno("File Exists", f"The file {new_file_path.name} already exists. Do you want to overwrite it?"):
                return

        with open(new_file_path, "w", encoding="utf-8") as f:
            f.write(template_content)

        messagebox.showinfo("File Created", f"Created {new_file_path.name} from the {template_name} template.")
        self.destroy()
