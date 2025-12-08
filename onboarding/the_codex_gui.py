"""
THE CODEX - Comprehensive Interactive Tutorial Guide for JPE Sims 4 Mod Translator

This is the world's most accessible guide to Sims 4 modding, designed for users
with zero coding experience and maximum creativity!
"""

import tkinter as tk
from tkinter import ttk, messagebox, scrolledtext
import webbrowser
from pathlib import Path
from typing import List, Dict, Optional
import json


class TheCodex:
    """The world's most accessible Sims 4 modding tutorial system."""
    
    def __init__(self, parent_window):
        self.parent_window = parent_window
        self.current_section = 0
        self.completed_sections = set()
        self.user_profile = {"experience_level": "new", "goals": [], "progress": 0}
        
        # Create the Codex window
        self.codex_window = tk.Toplevel(parent_window)
        self.codex_window.title("The Codex - Ultimate JPE Tutorial")
        self.codex_window.geometry("900x700")
        self.codex_window.transient(parent_window)
        self.codex_window.grab_set()
        
        # Create UI elements
        self.create_ui()
        
        # Load tutorial content
        self.load_tutorial_content()
    
    def create_ui(self):
        """Create the user interface for The Codex."""
        # Main container
        main_frame = ttk.Frame(self.codex_window)
        main_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Header with welcome message
        header_frame = ttk.Frame(main_frame)
        header_frame.pack(fill=tk.X, pady=(0, 10))
        
        title_label = ttk.Label(
            header_frame, 
            text="📖 THE CODEX", 
            font=("Arial", 24, "bold")
        )
        title_label.pack(pady=5)
        
        subtitle_label = ttk.Label(
            header_frame,
            text="Your Complete Guide to Sims 4 Modding Without Coding!",
            font=("Arial", 12)
        )
        subtitle_label.pack()
        
        # Create navigation and content area
        content_nav_frame = ttk.Frame(main_frame)
        content_nav_frame.pack(fill=tk.BOTH, expand=True)
        
        # Navigation sidebar
        nav_frame = ttk.Frame(content_nav_frame, width=200)
        nav_frame.pack(side=tk.LEFT, fill=tk.Y, padx=(0, 10))
        nav_frame.pack_propagate(False)  # Keep fixed width
        
        # Navigation header
        nav_header = ttk.Label(nav_frame, text="Learning Path", font=("Arial", 10, "bold"))
        nav_header.pack(pady=(0, 10))
        
        # Navigation listbox with scrollbar
        nav_listbox_frame = ttk.Frame(nav_frame)
        nav_listbox_frame.pack(fill=tk.BOTH, expand=True)
        
        self.nav_listbox = tk.Listbox(nav_listbox_frame, selectmode=tk.SINGLE)
        scrollbar = ttk.Scrollbar(nav_listbox_frame, orient=tk.VERTICAL, command=self.nav_listbox.yview)
        self.nav_listbox.configure(yscrollcommand=scrollbar.set)
        
        self.nav_listbox.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        self.nav_listbox.bind('<<ListboxSelect>>', self.on_section_select)
        
        # Main content area
        content_area_frame = ttk.LabelFrame(content_nav_frame, text="Tutorial Content", padding=15)
        content_area_frame.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True)
        
        # Progress tracking
        progress_frame = ttk.Frame(content_area_frame)
        progress_frame.pack(fill=tk.X, pady=(0, 10))
        
        self.progress_label = ttk.Label(progress_frame, text="Progress: 0%")
        self.progress_label.pack(side=tk.LEFT)
        
        self.progress_bar = ttk.Progressbar(progress_frame, mode='determinate', length=200)
        self.progress_bar.pack(side=tk.RIGHT)
        
        # Content display area
        content_display_frame = ttk.Frame(content_area_frame)
        content_display_frame.pack(fill=tk.BOTH, expand=True)
        
        self.content_text = tk.Text(
            content_display_frame,
            wrap=tk.WORD,
            font=("Arial", 11),
            padx=10,
            pady=10
        )
        content_scrollbar = ttk.Scrollbar(content_display_frame, orient=tk.VERTICAL, command=self.content_text.yview)
        self.content_text.configure(yscrollcommand=content_scrollbar.set)
        
        self.content_text.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        content_scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        # Make content read-only
        self.content_text.config(state=tk.DISABLED)
        
        # Interactive elements frame
        interactive_frame = ttk.Frame(content_area_frame)
        interactive_frame.pack(fill=tk.X, pady=(10, 0))
        
        self.prev_button = ttk.Button(interactive_frame, text="← Previous", command=self.prev_section)
        self.prev_button.pack(side=tk.LEFT)
        
        self.next_button = ttk.Button(interactive_frame, text="Next →", command=self.next_section)
        self.next_button.pack(side=tk.RIGHT)
        
        self.complete_button = ttk.Button(
            interactive_frame, 
            text="Mark Complete ✓", 
            command=self.mark_section_complete,
            state=tk.DISABLED  # Initially disabled
        )
        self.complete_button.pack(side=tk.RIGHT, padx=5)
        
        # Resources and help buttons
        resources_frame = ttk.Frame(main_frame)
        resources_frame.pack(fill=tk.X, pady=(10, 0))
        
        ttk.Button(resources_frame, text="Mod Examples", command=self.show_examples).pack(side=tk.LEFT, padx=5)
        ttk.Button(resources_frame, text="Video Tutorials", command=self.open_video_tutorials).pack(side=tk.LEFT, padx=5)
        ttk.Button(resources_frame, text="Community Help", command=self.open_community_forum).pack(side=tk.LEFT, padx=5)
        ttk.Button(resources_frame, text="Settings", command=self.open_settings).pack(side=tk.RIGHT, padx=5)
    
    def load_tutorial_content(self):
        """Load all tutorial sections."""
        self.tutorial_sections = [
            {
                "id": "welcome",
                "title": "👋 Welcome to Modding!",
                "topic": "Getting Started",
                "difficulty": "Newbie", 
                "duration": "5 min",
                "content": self.get_welcome_content(),
                "completed": False,
                "prerequisites": []
            },
            {
                "id": "what_are_mods",
                "title": "🤔 What Even ARE Mods?",
                "topic": "Understanding Basics",
                "difficulty": "Newbie",
                "duration": "10 min",
                "content": self.get_what_are_mods_content(),
                "completed": False,
                "prerequisites": ["welcome"]
            },
            {
                "id": "jpe_explained", 
                "title": "💬 Meet JPE: English for Sims 4!",
                "topic": "JPE Language",
                "difficulty": "Newbie",
                "duration": "15 min",
                "content": self.get_jpe_explained_content(),
                "completed": False,
                "prerequisites": ["what_are_mods"]
            },
            {
                "id": "first_project",
                "title": "🏗️ Your Very First Project!",
                "topic": "Project Setup",
                "difficulty": "Beginner",
                "duration": "20 min",
                "content": self.get_first_project_content(),
                "completed": False,
                "prerequisites": ["jpe_explained"]
            },
            {
                "id": "interactions_basics",
                "title": "🤝 Making Sims Do New Things",
                "topic": "Interactions",
                "difficulty": "Beginner", 
                "duration": "25 min",
                "content": self.get_interactions_basics_content(),
                "completed": False,
                "prerequisites": ["first_project"]
            },
            {
                "id": "buffs_explained",
                "title": "😊 Temporary Feelings: Buffs",
                "topic": "Buffs",
                "difficulty": "Beginner",
                "duration": "20 min", 
                "content": self.get_buffs_explained_content(),
                "completed": False,
                "prerequisites": ["interactions_basics"]
            },
            {
                "id": "traits_introduction",
                "title": "🧠 Who Are Your Sims? Traits",
                "topic": "Traits",
                "difficulty": "Beginner",
                "duration": "20 min",
                "content": self.get_traits_introduction_content(),
                "completed": False,
                "prerequisites": ["buffs_explained"]
            },
            {
                "id": "enums_concepts", 
                "title": "🔢 Choices & Options: Enums",
                "topic": "Enums",
                "difficulty": "Intermediate",
                "duration": "25 min",
                "content": self.get_enums_concepts_content(),
                "completed": False,
                "prerequisites": ["traits_introduction"]
            },
            {
                "id": "strings_localization",
                "title": "📝 Words & Names: Strings",
                "topic": "Strings",
                "difficulty": "Beginner",
                "duration": "15 min",
                "content": self.get_strings_localization_content(),
                "completed": False,
                "prerequisites": ["interactions_basics"]
            },
            {
                "id": "building_compiling",
                "title": "🔨 Making It Real: Building",
                "topic": "Building Process",
                "difficulty": "Intermediate",
                "duration": "20 min",
                "content": self.get_building_compiling_content(),
                "completed": False,
                "prerequisites": ["first_project", "interactions_basics"]
            },
            {
                "id": "testing_debugging",
                "title": "🔍 Finding Problems: Testing",
                "topic": "Testing & Debugging", 
                "difficulty": "Intermediate",
                "duration": "30 min",
                "content": self.get_testing_debugging_content(),
                "completed": False,
                "prerequisites": ["building_compiling"]
            },
            {
                "id": "sharing_publishing",
                "title": "🎁 Share Your Creation!",
                "topic": "Sharing & Publishing",
                "difficulty": "Intermediate", 
                "duration": "20 min",
                "content": self.get_sharing_publishing_content(),
                "completed": False,
                "prerequisites": ["testing_debugging"]
            }
        ]
        
        # Populate navigation
        for i, section in enumerate(self.tutorial_sections):
            status = "○ "  # Circle for incomplete
            if section["id"] in self.completed_sections:
                status = "✓ "  # Check for complete
            self.nav_listbox.insert(tk.END, f"{status}{section['title']}")
        
        # Show first section
        self.show_section(0)
    
    def get_welcome_content(self):
        """Get content for the welcome section."""
        return """
# 🎉 Welcome to The Codex! 

## Hi there, amazing creator! 👋

You've just taken your first step into the wonderful world of Sims 4 modding. If you're new to this, don't worry - everyone starts somewhere! This guide will walk you through everything you need to know, step by step, with zero experience required.

## What Is The Codex? 📚

The Codex is your complete, interactive tutorial guide to creating Sims 4 mods. Think of it as your personal mentor who:
- Explains concepts in simple, everyday language
- Guides you through creating your first mods
- Shows you exactly what to do, when to do it
- Celebrates your successes along the way

## What Will You Learn? 🎯

By the end of this tutorial, you'll be able to:
- 💡 Understand what mods are and how they work
- 📝 Create your own mod files using simple English
- 🏗️ Build complete mods that change how Sims 4 works
- 🔧 Fix problems when your mods don't work correctly
- 🎁 Share your creations with other players

## How This Guide Works 🧭

- **Step-by-step lessons**: Each section builds on the previous one
- **Hands-on practice**: You'll create real mods as you learn
- **Visual examples**: Pictures and screenshots to show what to do
- **Friendly explanations**: No complex jargon or scary code terms
- **Progress tracking**: See how far you've come!

## Ready to Start? 🚀

This guide assumes you've never touched code before. We'll start with the very basics and build up to creating full Sims 4 mods together.

Don't feel pressured to rush through everything. Take your time, practice what you learn, and have fun with it! The goal is to help you become a confident Sims 4 modder, not to overwhelm you.

Click "Next →" below to move to the next section and begin your modding journey!

---

💡 **Pro Tip**: Bookmark this guide! You'll want to come back to different sections as you create more complex mods.
"""
    
    def get_what_are_mods_content(self):
        """Get content for the what are mods section."""
        return """
# 🤔 What Even ARE Sims 4 Mods?

## Simply Put... 🎮

A **mod** (short for "modification") is like a custom recipe you add to your favorite cooking game. It changes how the game works or adds new features that weren't there before.

### Real-Life Examples:
- **New hairstyles**: Like adding new hair products to your beauty routine
- **New career paths**: Like imagining new jobs your Sims could have
- **New interactions**: Like teaching your Sims new ways to interact with each other
- **New objects**: Like furnishing your home with custom items
- **Personality traits**: Like adding new personality types to your Sims

### Think of It Like This:
Imagine you love playing with dolls. But the doll clothes that come with the set are limited. So you sew new outfits and accessories. That's exactly what modding is! You're creating new "outfits and accessories" for your Sims.

## Why Do People Create Mods? 🌟

1. **To express creativity**: Like painting or crafting, but in the game
2. **To fix problems**: If something in the game bothers them
3. **To add missing features**: Like "Why don't Sims have a coffee maker that makes fancy drinks?"
4. **To help others**: So more people can enjoy the game
5. **To learn**: Because they're curious about how things work

## Common Types of Sims 4 Mods:
- **Interactions**: New things Sims can do (greetings, activities, etc.)
- **Buffs**: Temporary mood changes (feeling happy, inspired, etc.)
- **Traits**: Permanent personality characteristics (loves to cook, hates children, etc.)
- **Objects**: New things you can buy and place in households
- **Clothing/Hairstyles**: New appearances for Sims

## Important to Know 🚨

- **Mods are not cheating** - They're creative additions to enhance your gameplay
- **Mods are voluntary** - You only install the ones you want
- **Mods can be removed** - If you don't like a mod, you can simply delete it
- **Mods are shared by the community** - Created by fans, for fans

## What Makes Our Tool Special? ✨

Traditional Sims 4 modding involves complex XML files that look like this:
```
<I c="sims4.community_mod.Interaction" id="12345678">
    <T n="display_name">0xF00B00FA<!-- Greet Cheerfully --></T>
    <T n="description">0xF00B00FB<!-- A cheerful greeting --></T>
    <L n="participants">
        <U>
            <T n="role">Actor</T>
            <T n="description">The person greeting</T>
        </U>
    </L>
</I>
```

That looks pretty intimidating, right? 😅

Our tool uses **JPE (Just Plain English)** which looks like this:
```
[Interactions]
id: greet_cheerfully
display_name: Greet Cheerfully  
description: A cheerful greeting
participant: role:Actor, description:The person greeting
end
```

See the difference? Our version looks like plain English! No scary symbols or complex code.

---

🎯 **Your Mission**: Remember, you're learning something completely new. Be patient with yourself and celebrate small wins!

Click "Next →" to continue learning!
"""
    
    def get_jpe_explained_content(self):
        """Get content for the JPE explained section."""
        return """
# 💬 Meet JPE: English for Sims 4!

## What Is JPE? 🔤

**JPE** stands for **"Just Plain English"**. It's our way of creating Sims 4 mods using words everyone understands, instead of complex programming languages.

### Think of It Like Instructions for a Friend:

Instead of this complex computer language:
```
<I c="interactions.social.GreetNeighbor"><T n="display_name">Greet Neighbor</T><L n="participants"><U><T n="role">Actor</T></U><U><T n="role">Target</T></U></L></I>
```

We use this simple English format:
```
[Interactions]  
id: greet_neighbor
display_name: Greet Neighbor
participant: role:Actor, description:The person greeting
participant: role:Target, description:The neighbor being greeted
end
```

That's way easier to understand, right? 😊

## How JPE Works 🧩

JPE has a simple pattern:
1. **Section markers** - Tell us what kind of thing we're creating
2. **Properties** - Describe what that thing should do or be like
3. **End marker** - Tell us when the definition is complete

### The Basic Pattern:
```
[SECTION NAME]
property: value
another_property: another_value
end
```

### Real Examples:
```
[Project]
name: My Awesome Mod
id: my_awesome_mod
version: 1.0.0
end
```

```
[Buffs]
id: happy_visitor
display_name: Happy Visitor
description: Feeling welcomed and joyful
duration: 60
end
```

```
[Traits]
id: night_owl
display_name: Night Owl
description: Prefers to be active during the night
end
```

## Understanding JPE Structure 🏗️

### 1. Section Markers [Like This]
These tell the application what type of game element you're creating:
- `[Interactions]` - For new things Sims can do
- `[Buffs]` - For temporary feelings/moodlets
- `[Traits]` - For personality characteristics  
- `[Enums]` - For lists of choices
- `[Strings]` - For text that appears in the game

### 2. Property Lines
These define what your game element should be like:
- `id: unique_name` - A special internal name (no spaces, use underscores)
- `display_name: "What Players See"` - What appears in the game
- `description: "What it does"` - Explains the purpose
- `duration: 60` - How long something lasts (in game minutes)

### 3. End Marker
Every section ends with `end` - this tells the application where one definition stops and another can begin.

## Practice Exercise 📝

Before moving on, try to understand this simple interaction:

```
[Interactions]
id: share_snack
display_name: Share Snack
description: Offer to share a delicious snack with a friend
participant: role:Actor, description:The person sharing
participant: role:Target, description:The friend receiving
end
```

Can you tell what this does? 
- It creates an interaction (something Sims can do)
- The internal ID is `share_snack`
- Players will see it as "Share Snack" in the game
- It involves two participants: an actor (who shares) and a target (who receives)

Pretty cool, right? You're already reading JPE like a pro! 🌟

---

💡 **Remember**: JPE is designed to be as close to plain English as possible. If it helps, read it aloud like instructions you're giving to a friend.

Click "Next →" to learn how to create your first project!
"""
    
    def get_first_project_content(self):
        """Get content for the first project section."""
        return """
# 🏗️ Your Very First Project!

## What Is a Project? 📂

A **project** is like a digital folder where you keep all the pieces of your mod. Think of it like:
- A recipe folder where you keep all ingredients and instructions
- An art portfolio where you keep all sketches and paintings
- A photo album where you keep all photos from a trip

Everything related to your mod goes in one project folder.

## Project Structure 🏠

When you create a project with our tool, it looks like this:

```
My First Mod/
├── src/              ← Your mod source files go here
│   ├── interactions.jpe  ← Your interactions go here
│   ├── buffs.jpe         ← Your buffs go here  
│   ├── traits.jpe        ← Your traits go here
│   └── strings.jpe       ← Your text goes here
├── build/            ← Finished mod files appear here
│   └── (generated automatically)
├── config/           ← Project settings go here
│   └── project.jpe   ← General project info
└── docs/             ← Documentation (optional)
    └── (tutorials and help)
```

Don't worry about all the technical names - here's what you need to know:

- **src/** (source) = Where you write your mod using JPE
- **build/** = Where your finished mod appears (created automatically)
- **config/** = Settings about your project

## Creating Your First Project 🎉

1. **Open The Studio** - Look for "JPE Sims 4 Studio" in your programs
2. **Click "File"** → **"New Project"**
3. **Choose a location** - Pick a spot you'll remember (like Desktop/MyMods/)
4. **Name your project** - Something descriptive like "My First Social Interactions" or "Custom Moodlets Pack"
5. **Click "Create"**

### What Happens Next?
The application creates a complete project structure with all necessary files, so you can start creating right away!

## Your Project Definition File 🔧

After creating your project, you'll see a file called `project.jpe` in the config folder. It looks like this:

```
[Project]
name: My First Social Interactions
id: my_first_social_interactions
version: 1.0.0
author: Your Name Here
description: A collection of new social interactions for Sims
end
```

This file contains basic information about your project. You can change these properties anytime:
- **name**: What people see (can have spaces)
- **id**: Internal identifier (no spaces, use underscores)
- **version**: For tracking updates (start with 1.0.0)
- **author**: Your name (so people know who created it!)
- **description**: What your project does

## Important Tips 💡

- **Keep project names descriptive** - "My First Social Interactions" is better than "Mod 1"
- **Use underscores in IDs** - Instead of "my first mod", use "my_first_mod"
- **Start with simple projects** - It's better to create one small, working mod than one big, confusing one
- **Save your work often** - Use Ctrl+S to save your files

## Practice Time! 🎯

1. **Create a new project** called "My Learning Project"
2. **Open the project.jpe file** in the config folder
3. **Change the information** to something that describes what you want to learn
4. **Save the file** (Ctrl+S)

Example for your learning project:
```
[Project]
name: My Learning Project
id: my_learning_project
version: 1.0.0
author: My Name
description: A project for learning JPE modding concepts
end
```

Don't worry if it's not perfect - we'll improve it as we go!

## What's Next? 🚀

Now that you have a project set up, it's time to add your first mod elements! In the next section, we'll create your first interaction - something new and exciting for your Sims to do.

---

🌟 **Congratulations**: You've created your first project! This is a big milestone in your modding journey. Every experienced modder started exactly where you are now.

Click "Next →" to learn about interactions!
"""
    
    def get_interactions_basics_content(self):
        """Get content for the interactions basics section."""
        return """
# 🤝 Making Sims Do New Things: Interactions

## What Are Interactions? 🎮

**Interactions** are actions that Sims can perform. Every time a Sim:
- Greets another Sim
- Uses an object (like a computer or TV)
- Performs an activity (like gardening or cooking)
- Responds to emotions (like crying or laughing)

Those are all interactions! Creating new interactions is like teaching your Sims new things they can do.

## Simple Example 📝

Let's create a simple interaction that lets your Sims wave to their neighbors:

```
[Interactions]
id: wave_hello
display_name: Wave Hello
description: A friendly wave to greet others
participant: role:Actor, description:The person waving
participant: role:Target, description:The person being waved at
end
```

### Breaking It Down:

**`[Interactions]`**
- Tells the application we're defining new interactions

**`id: wave_hello`**
- The internal name for this interaction
- Must be unique (no other interaction can have the same ID)
- No spaces (use underscores instead)
- Descriptive of what it does

**`display_name: Wave Hello`**
- What players see in the game
- Can have spaces and special characters
- Should clearly describe what happens

**`description: A friendly wave to greet others`**
- Explains what the interaction does
- Players may see this as a tooltip
- Helps others understand your mod

**`participant: role:Actor, description:The person waving`**
- Defines who can initiate this action
- The Actor is always the Sim doing the interaction

**`participant: role:Target, description:The person being waved at`**
- Defines who the action is performed on
- The Target is who receives the interaction

**`end`**
- Signals the end of this interaction definition

## More Complex Interaction 🌟

Here's an example of a more complex interaction:

```
[Interactions]
id: invite_neighbor_over
display_name: Invite Over for Coffee
description: Invite a nearby neighbor to come over and have coffee together
autonomy_score: 5
participant: role:Actor, description:The homeowner inviting
participant: role:Target, description:The neighbor being invited
tests: 
  - test: actor.has_skill:cooking >= 3
  - test: target.relationship_level >= 20
end
```

This interaction includes:
- **autonomy_score**: How likely Sims are to choose this automatically
- **tests**: Conditions that must be met for the interaction to appear

## Common Interaction Types 🧩

### Social Interactions
```
[Interactions]
id: compliment_outfit
display_name: Compliment Outfit
description: Give a genuine compliment about someone's clothes
participant: role:Actor
participant: role:Target
end
```

### Self-Interactions  
```
[Interactions]
id: practice_facial_expressions
display_name: Practice Facial Expressions
description: Improve acting skills by practicing faces in the mirror
participant: role:Actor
end
```

### Object-Related Interactions
```
[Interactions]
id: water_garden_plants
display_name: Water Garden Plants
description: Care for plants with fresh water
participant: role:Actor
end
```

## Practice Exercise 📝

Try creating your own simple interaction! Think of something your Sims might want to do that isn't in the base game.

Examples:
- Share a funny story
- Offer to help with homework
- Demonstrate a skill
- Teach a new hobby

Copy this template and make it your own:

```
[Interactions]
id: (think of a unique id like your_idea_name)
display_name: (what players see)
description: (what the interaction does)
participant: role:Actor, description:(who starts the action)
participant: role:Target, description:(who receives the action, if applicable)
end
```

Then:
1. Open your project
2. Find the `src/interactions.jpe` file
3. Add your interaction to the file
4. Save it (Ctrl+S)

## Common Mistakes to Avoid 🚨

1. **Forgetting `end`** - Every interaction must end with `end`
2. **Using spaces in IDs** - Use underscores instead of spaces in your `id:`
3. **Not making IDs unique** - Make sure your `id:` is different from any other IDs in your project
4. **Forgetting participants** - Most interactions need at least an Actor

## Testing Your Interaction 🧪

When you're ready, you can:
1. Click the "Build" tab in the studio
2. Click "Build Project" 
3. Check for any errors in the "Reports" tab
4. If successful, you'll get a mod file to use in The Sims 4!

---

💡 **Remember**: Start simple! A single, working interaction is better than a complex one that doesn't work. We'll learn how to make them more advanced as we progress.

Click "Next →" to learn about buffs (temporary moodlets)!
"""
    
    def get_buffs_explained_content(self):
        """Get content for the buffs explained section."""
        return """
# 😊 Temporary Feelings: Buffs

## What Are Buffs? 🎭

**Buffs** are temporary moodlets that change how your Sims feel and behave for a period of time. Think of them as:

- **Temporary stickers** that change your Sims' mood or abilities
- **Power-ups** that give benefits for a limited time  
- **Feelings** that fade after a while

Some examples from the base game:
- **Flirty** moodlet when Sims are attracted to each other
- **Inspired** moodlet when Sims create something artistic
- **Playful** moodlet when Sims are having fun
- **Embarrassed** moodlet when something awkward happens

## Why Are Buffs Important? 🌟

Buffs make your interactions feel meaningful! When a Sim does something, you can make them feel a certain way afterward. It creates a complete cycle:
1. Sim does an interaction (like helping someone)
2. Sim gets a buff (like feeling helpful)
3. Buff affects the Sim's mood or behavior
4. Buff expires and Sim's mood returns to normal

## Simple Buff Example 📝

Let's create a simple buff for when Sims help someone:

```
[Buffs]
id: helpful_feeling
display_name: Helpful Feeling
description: Feeling good about lending a hand
duration: 60
end
```

### Breaking It Down:

**`[Buffs]`**
- Tells the application we're defining buffs

**`id: helpful_feeling`**
- Internal name for this buff
- Must be unique within your project
- No spaces (use underscores)

**`display_name: Helpful Feeling`**
- What players see in the moodlet list
- Can have spaces and special characters

**`description: Feeling good about lending a hand`**
- Explains what the buff represents
- May appear as a tooltip in-game

**`duration: 60`**
- How long the buff lasts in game minutes
- 60 minutes = approximately 1.5 hours of game time
- Use 0 for permanent buffs (be careful!)

**`end`**
- Signals the end of this buff definition

## Connecting Buffs to Interactions 🔄

Buffs become powerful when connected to interactions. You can make an interaction apply a buff:

```
[Interactions]
id: help_neighbor_mow_lawn
display_name: Help Mow Neighbor's Lawn
description: Lend a hand with lawn maintenance
participant: role:Actor
participant: role:Target
# This interaction would apply a buff when completed (advanced topic)
end

[Buffs]
id: helpful_feeling
display_name: Helpful Feeling
description: Feeling good about helping others
duration: 120  # Lasts 2 hours in-game
end
```

## More Complex Buff Example 🧩

Here's a buff with more advanced properties:

```
[Buffs]
id: inspired_artist
display_name: Inspired Artist
description: Overflowing with creative ideas after a great session
duration: 180
icon: 0x00B00FA  # References a specific moodlet icon
mood_type: focused
trait_incompatible: lazy
statistics_bonus: 
  creativity: 10
  fun: 5
end
```

This buff includes:
- **icon**: Visual representation in the game
- **mood_type**: How it affects the Sim's overall mood
- **trait_incompatible**: Which traits can't have this buff
- **statistics_bonus**: Which in-game stats get a boost

## Common Buff Types 🎨

### Motivation Buffs
```
[Buffs]
id: motivation_boost
display_name: Motivation Boost
description: Feeling energized to tackle new challenges
duration: 120
end
```

### Comfort Buffs
```
[Buffs]
id: relaxed_after_massage
display_name: Relaxed
description: Feeling wonderfully loose after a massage
duration: 90
end
```

### Skill Improvement Buffs
```
[Buffs]
id: learned_something_new
display_name: Learned Something New
description: Mental stimulation from acquiring knowledge
duration: 60
statistics_bonus:
  logic: 5
end
```

## Practice Exercise 📝

Create a buff that would go with an interaction you imagined earlier! Think of how your interaction might make Sims feel afterward.

Example: If you created an interaction for "Share Funny Story", you might create:

```
[Buffs]
id: amused_by_story
display_name: Amused by Story
description: Still chuckling from a hilarious story
duration: 30
mood_type: playful
end
```

Steps to try:
1. Open your project's `src/buffs.jpe` file
2. Add your buff definition
3. Make sure to follow the correct format
4. Save the file (Ctrl+S)

## Common Mistakes to Avoid 🚨

1. **Forgetting `end`** - Every buff must end with `end`
2. **Using spaces in ID** - Use underscores instead: `amused_by_story` not `amused by story`
3. **Setting impossible durations** - Negative numbers or extremely large values
4. **Not connecting to interactions properly** - Later we'll learn how to apply buffs from interactions

## Connecting to Real Life 🌍

Think about how buffs work like:
- **After eating a good meal** - You feel satisfied for a while
- **After exercising** - You feel energetic and proud
- **After getting good sleep** - You feel refreshed until fatigue returns
- **After learning something** - You feel smart and capable for a while

That's exactly what buffs do in the game - they capture temporary feelings and experiences!

---

💡 **Pro Tip**: Start with simple buffs and gradually add more complex properties as you get comfortable. The duration is especially important - consider how long a feeling realistically lasts.

Click "Next →" to learn about traits (personality characteristics)!
"""
    
    def get_traits_introduction_content(self):
        """Get content for the traits introduction section."""
        return """
# 🧠 Who Are Your Sims? Traits

## What Are Traits? 🏷️

**Traits** are permanent personality characteristics that make each Sim unique. Think of them as:

- **Personality labels** that stick with your Sim forever
- **Preferences** that influence behavior
- **Characteristics** that make Sims act differently
- **Identity markers** that define who your Sim is

Some examples from the base game:
- **Slob** - Loves messy surroundings
- **Neat** - Hates messiness and keeps things tidy
- **Loves The Outdoors** - Feels energetic outside
- **Shy** - Gets nervous around other people
- **Evil** - Enjoys causing trouble
- **Artistic** - Appreciates creative things

## Why Are Traits Important? 🌟

Traits make your Sims feel authentic and alive! They:
- Influence which interactions Sims prefer
- Change how Sims react to situations
- Create interesting variations between different Sims
- Enhance storytelling by matching personality to actions

For example: A Sim with the "Evil" trait will enjoy mean interactions more than a Sim with the "Good" trait.

## Simple Trait Example 📝

Let's create a simple trait for an environmentally conscious Sim:

```
[Traits]
id: eco_friendly
display_name: Eco-Friendly
description: Cares deeply about environmental sustainability
end
```

### Breaking It Down:

**`[Traits]`**
- Tells the application we're defining traits

**`id: eco_friendly`**
- Internal name for this trait
- Must be unique in your project
- Use underscores instead of spaces

**`display_name: Eco-Friendly`**
- What players see in Create-a-Sim
- Can have spaces and special characters

**`description: Cares deeply about environmental sustainability`**
- Explains what the trait represents
- Helps players understand how it affects gameplay

**`end`**
- Signals the end of this trait definition

## Connecting Traits to Buffs and Behaviors 🔗

Traits become more powerful when connected to other game elements:

```
[Traits]
id: night_owl
display_name: Night Owl
description: Prefers to be active during the night
buffs_applied:
  - energetic_at_night
interactions_preferred:
  - use_computer_late
  - stargaze
  - work_late
interactions_avoided:
  - early_morning_exercise
  - wake_up_early
end
```

This trait example:
- Automatically applies an "energetic_at_night" buff
- Makes the Sim more likely to choose late-night activities
- Makes the Sim less likely to choose morning activities

## More Complex Trait Example 🧩

Here's a trait with more advanced properties:

```
[Traits]
id: aspiring_chef
display_name: Aspiring Chef
description: Dreams of culinary greatness
trait_type: positive
age_restrictions: teen, adult, elder
buffs_reduced:
  - hungry_easily
activities_preferred:
  - cooking
  - baking
  - recipe_sharing
statistics_bonus:
  - cooking: 10
  - fun: 5
end
```

This trait:
- Is categorized as positive
- Only available for certain age groups
- Reduces the likelihood of getting "hungry_easily" buff
- Increases preference for cooking activities
- Improves cooking and fun statistics

## Common Trait Categories 📚

### Personality Traits
```
[Traits]
id: day_dreamer
display_name: Day Dreamer
description: Often gets lost in thoughts and imagination
end
```

### Social Traits
```
[Traits]
id: social_butterfly
display_name: Social Butterfly
description: Thrives in social situations with many people
end
```

### Lifestyle Traits
```
[Traits]
id: fitness_enthusiast
display_name: Fitness Enthusiast
description: Dedicated to maintaining peak physical condition
end
```

## Practice Exercise 🎯

Think of a personality characteristic that would make your Sims more interesting, then create a trait for it!

Examples:
- Someone who loves collecting rare items
- A person who's always trying to make others laugh
- Someone who finds comfort in routines
- A Sim who's fascinated by technology

Use this template:

```
[Traits]
id: (unique_trait_identifier)
display_name: (what players see)
description: (what the trait represents)
end
```

Then:
1. Open your project's `src/traits.jpe` file
2. Add your trait definition
3. Save the file (Ctrl+S)

## Traits vs. Buffs Comparison 🔄

| Traits | Buffs |
|--------|-------|
| Permanent | Temporary |
| Define baseline personality | Change mood temporarily |
| Don't expire | Have a duration |
| Influence behavior always | Affect mood for limited time |

## Common Mistakes to Avoid 🚨

1. **Forgetting `end`** - Every trait must end with `end`
2. **Using spaces in ID** - Use underscores instead of spaces in IDs
3. **Making trait descriptions too vague** - Be specific about what the trait does
4. **Not considering gameplay impact** - Think about how the trait affects Sim behavior

## Real-World Analogy 🌍

Traits work like real personality characteristics:
- Someone who's genuinely **organized** will always prefer tidiness
- A **night owl** naturally feels more awake at night
- A **social butterfly** consistently enjoys meeting new people
- An **introvert** typically prefers quiet, familiar settings

Just like in real life, traits shape how your Sims experience the world!

---

💡 **Creative Challenge**: Try to think of traits that would complement the interactions and buffs you've created. This will make your mod feel more cohesive and realistic.

Click "Next →" to learn about Enums (choices and options)!
"""

    def get_enums_concepts_content(self):
        """Get content for the enums concepts section."""
        return """
# 🔢 Choices & Options: Enums

## What Are Enums? 🧩

**Enums** (short for "Enumerations") are lists of possible choices for Sims 4 game elements. Think of them as:

- **Dropdown menus** with predefined options
- **Multiple choice questions** where you select one answer
- **Categories** with specific values to choose from
- **Limited options** that control different behaviors

Some examples from the base game:
- **Mood types**: happy, sad, angry, playful, focused
- **Skill types**: cooking, painting, fitness, logic
- **Seasons**: spring, summer, fall, winter
- **Weather types**: sunny, rainy, snowy, foggy

## Why Are Enums Important? 🌟

Enums help create organized, predictable game elements by:
- Providing consistent options across different parts of the game
- Making it easier to create complex interactions that depend on specific values
- Allowing game systems to work together properly
- Reducing errors by limiting choices to valid options

## Simple Enum Example 📝

Let's create a simple enum for different types of greetings:

```
[Enums]
id: greeting_types
option: casual:0
option: formal:1
option: friendly:2
option: professional:3
end
```

### Breaking It Down:

**`[Enums]`**
- Tells the application we're defining an enumeration

**`id: greeting_types`**
- Internal name for this enum
- Must be unique within your project
- Use underscores instead of spaces

**`option: casual:0`**
- Defines an option with a name and numeric value
- Format: `option: name:value`
- The value is typically a number starting from 0

**`end`**
- Signals the end of this enum definition

## More Complex Enum Example 🧩

Here's an enum with more options and better organization:

```
[Enums]
id: cooking_difficulty
option: beginner:0
option: intermediate:1
option: advanced:2
option: expert:3
option: master:4
end
```

This enum creates 5 levels of cooking difficulty that could be used in cooking-related interactions or traits.

## Using Enums with Other Elements 🔗

Enums become powerful when connected to other game elements:

```
[Enums]
id: social_mood_types
option: cheerful:0
option: contemplative:1
option: energetic:2
option: relaxed:3
end

[Interactions]
id: change_mood_by_choice
display_name: Choose Your Mood
description: Select a mood type to temporarily experience
mood_type: enum:social_mood_types
end
```

## Common Enum Categories 📚

### Mood Types
```
[Enums]
id: mood_types
option: happy:0
option: sad:1
option: angry:2
option: playful:3
option: focused:4
end
```

### Skill Categories
```
[Enums]
id: skill_categories
option: creative:0
option: mental:1
option: physical:2
option: social:3
end
```

### Time Periods
```
[Enums]
id: time_periods
option: morning:0
option: afternoon:1
option: evening:2
option: night:3
end
```

## Practice Exercise 🎯

Think of a category of choices that would be useful in your mod, then create an enum for it!

Examples:
- Different types of food (pizza, pasta, salad, sandwich)
- Weather conditions (sunny, cloudy, rainy, stormy)
- Music genres (rock, pop, classical, jazz)
- Art styles (realistic, abstract, impressionist, pop)

Use this template:

```
[Enums]
id: (unique_enum_identifier)
option: (first_option_name):(first_option_value)
option: (second_option_name):(second_option_value)
option: (third_option_name):(third_option_value)
end
```

Then:
1. Open your project's `src/enums.jpe` file
2. Add your enum definition
3. Save the file (Ctrl+S)

## Best Practices for Enums 🏆

1. **Start numbering from 0** - This is the standard convention
2. **Use descriptive names** - Make option names clear and meaningful
3. **Keep values consistent** - Use the same naming patterns throughout
4. **Plan for expansion** - Consider if you might need more options later

## Common Mistakes to Avoid 🚨

1. **Forgetting `end`** - Every enum must end with `end`
2. **Using spaces in IDs or option names** - Use underscores instead
3. **Skipping numbers** - Keep your numbering sequence consistent
4. **Creating enums with only one option** - Enums are for multiple choices!

## Real-World Analogy 🌍

Enums work like:
- **Multiple choice tests** where you select one answer from several options
- **Restaurant menus** where you choose from a set list of items
- **Radio buttons** where you can only select one option
- **Dropdown lists** that limit your choices to valid options

Just like in real life, enums help organize choices and make decisions easier!

---

💡 **Pro Tip**: Enums are most useful when you have several related options that serve the same purpose. Don't create enums for just one or two choices unless you expect to add more later.

Click "Next →" to learn about Strings (text and localization)!
"""

    def get_strings_localization_content(self):
        """Get content for the strings localization section."""
        return """
# 📝 Words & Names: Strings

## What Are Strings? 🗣️

**Strings** are the actual text that appears in The Sims 4 game. Think of them as:

- **Visible text** that players read in the game
- **Translated text** that can appear in different languages
- **Display names** for your interactions, buffs, and traits
- **Descriptions** that explain what game elements do

Some examples from the base game:
- **Interaction names**: "Greet Neighbor", "Cook Pasta", "Paint Portrait"
- **Buff descriptions**: "Feeling inspired", "Slightly embarrassed", "Energized"
- **Trait names**: "Night Owl", "Loves the Outdoors", "Evil"
- **Tooltips**: "This Sim enjoys cooking", "Makes food taste better"

## Why Are Strings Important? 🌟

Strings make your mods accessible and professional by:
- Providing proper names and descriptions in the game
- Enabling localization for different languages
- Making your mod elements clear and understandable to players
- Following Sims 4's standard text management system

## Simple String Example 📝

Let's create a simple string for an interaction:

```
[Strings]
key: greet_neighbor_name
text: Greet Neighbor
locale: en_US
end
```

### Breaking It Down:

**`[Strings]`**
- Tells the application we're defining a string

**`key: greet_neighbor_name`**
- Unique identifier for this string
- Used by other game elements to reference this text
- Should be descriptive and unique

**`text: Greet Neighbor`**
- The actual text that will appear in the game
- What players will see

**`locale: en_US`**
- The language code for this text
- `en_US` means American English
- Other common codes: `en_GB` (British English), `fr_FR` (French), `de_DE` (German)

**`end`**
- Signals the end of this string definition

## More Complex String Example 🧩

Here's a string with multiple elements:

```
[Strings]
key: greet_neighbor_desc
text: Politely greet a nearby neighbor with a warm smile
locale: en_US
end

[Strings]
key: greet_neighbor_tooltip
text: A friendly way to start a conversation
locale: en_US
end
```

This creates two related strings for the same interaction.

## Connecting Strings to Other Elements 🔗

Strings become powerful when connected to other game elements:

```
[Interactions]
id: greet_neighbor
display_name_key: greet_neighbor_name
description_key: greet_neighbor_desc
participant: role:Actor, description_key: greet_actor_desc
participant: role:Target, description_key: greet_target_desc
end

[Strings]
key: greet_neighbor_name
text: Greet Neighbor
locale: en_US
end

[Strings]
key: greet_neighbor_desc
text: Politely greet a nearby neighbor with a warm smile
locale: en_US
end

[Strings]
key: greet_actor_desc
text: The person initiating the greeting
locale: en_US
end

[Strings]
key: greet_target_desc
text: The neighbor being greeted
locale: en_US
end
```

## Multi-Language Support 🌍

You can provide the same text in multiple languages:

```
[Strings]
key: greet_neighbor_name
text: Greet Neighbor
locale: en_US
end

[Strings]
key: greet_neighbor_name
text: Saludar Vecino
locale: es_ES
end

[Strings]
key: greet_neighbor_name
text: Accueillir le Voisin
locale: fr_FR
end
```

## Common String Categories 📚

### Interaction Names
```
[Strings]
key: wave_hello_name
text: Wave Hello
locale: en_US
end
```

### Interaction Descriptions
```
[Strings]
key: wave_hello_desc
text: Politely wave to someone nearby
locale: en_US
end
```

### Buff Names and Descriptions
```
[Strings]
key: happy_visiting_name
text: Happy Visitor
locale: en_US
end

[Strings]
key: happy_visiting_desc
text: Feeling welcomed and joyful
locale: en_US
end
```

## Practice Exercise 🎯

Create strings for one of your previous interactions, buffs, or traits!

Use this template:

```
[Strings]
key: (unique_string_key)
text: (the actual text to display)
locale: en_US
end
```

Then:
1. Open your project's `src/strings.jpe` file
2. Add your string definitions
3. Update your other elements to use the string keys instead of direct text
4. Save the file (Ctrl+S)

## Best Practices for Strings 🏆

1. **Use descriptive keys** - Make them clear about what they represent
2. **Keep text concise** - Game UI has limited space
3. **Be consistent** - Use similar wording patterns throughout
4. **Plan for translation** - Consider how text might change in other languages

## Common Mistakes to Avoid 🚨

1. **Forgetting `end`** - Every string must end with `end`
2. **Using the same key for different text** - Keys must be unique
3. **Putting strings directly in other elements** - Use keys instead for proper localization
4. **Using special characters** - Stick to standard letters, numbers, and punctuation

## Real-World Analogy 🌍

Strings work like:
- **Labels on products** that describe what's inside
- **Signs in a store** that tell you what's available
- **Subtitles in a movie** that make content accessible
- **Translations in a guidebook** that help different people understand

Just like in real life, strings help communicate important information to users!

---

💡 **Pro Tip**: Always use string keys in your other elements instead of direct text. This makes your mod ready for translation and easier to update.

Click "Next →" to learn about Building and Compiling your mods!
"""

    def get_building_compiling_content(self):
        """Get content for the building and compiling section."""
        return """
# 🔨 Making It Real: Building

## What Is Building? 🏗️

**Building** is the process of converting your JPE (Just Plain English) files into actual Sims 4 mod files that the game can use. Think of it as:

- **Translating** your English-like code into computer-readable XML
- **Compiling** your source files into game-ready files
- **Packaging** your mod elements into a format the game understands
- **Finalizing** your creation so players can use it

## Why Is Building Important? 🌟

Building is crucial because:
- The Sims 4 game can only read XML files, not JPE files
- Building validates that your JPE code is correct and error-free
- Building creates the final mod files that go in your game's mod folder
- Building generates reports that help you identify and fix issues

## The Building Process 🔄

The building process works like this:

1. **Input**: Your JPE source files in the `src/` folder
2. **Processing**: The JPE translator converts JPE to Sims 4 XML
3. **Output**: Generated XML files in the `build/` folder
4. **Installation**: Copy files to your Sims 4 mod folder

## Building in The Studio 🖥️

To build your project in the JPE Studio:

1. **Open your project** in the Studio application
2. **Check your files** in the Project Explorer tab
3. **Click "Build Project"** in the Build tab
4. **Review the build report** in the Build tab output area
5. **Find your files** in the project's `build/` folder

## Building from Command Line 💻

You can also build from the command line:

```
jpe-sims4 build /path/to/your/project
```

This will:
- Parse all JPE files in your project
- Validate the syntax and structure
- Generate Sims 4-compatible XML files
- Create a build report with any issues

## Understanding Build Reports 📊

After building, you'll get a report that shows:

### Success Report:
```
Build SUCCESSFUL
Build ID: 20231101_143022
Project ID: my_awesome_mod
Errors: 0, Warnings: 2

BUILD SUCCESSFUL - Your mod is ready to use!
```

### Error Report:
```
Build FAILED
Build ID: 20231101_143022
Project ID: my_awesome_mod
Errors: 3, Warnings: 1

ERRORS:
  - [ERROR] Missing 'end' statement in interactions.jpe at line 15
  - [ERROR] Invalid ID format in buffs.jpe at line 8
  - [ERROR] Undefined reference in traits.jpe at line 12
```

## Common Build Issues and Solutions 🔧

### Issue: Missing 'end' statements
**Solution**: Make sure every section has a proper `end` at the end

### Issue: Invalid characters in IDs
**Solution**: Use only letters, numbers, and underscores in IDs (no spaces)

### Issue: Undefined references
**Solution**: Make sure all referenced elements (buffs, traits, etc.) actually exist

### Issue: File structure problems
**Solution**: Verify your project follows the proper structure with `src/`, `build/`, and `config/` folders

## Example Build Process 📝

Let's walk through building a simple project:

**Input Files:**
```
my_project/
├── config/
│   └── project.jpe
├── src/
│   ├── interactions.jpe
│   └── strings.jpe
└── build/
```

**After Building:**
```
my_project/
├── config/
│   └── project.jpe
├── src/
│   ├── interactions.jpe
│   └── strings.jpe
└── build/
    ├── output_1.xml
    ├── output_2.xml
    └── build_report.json
```

## Testing Your Build ✅

After building:

1. **Check the build report** for errors or warnings
2. **Look in the build folder** for generated XML files
3. **Copy XML files** to your Sims 4 mod folder
4. **Start The Sims 4** and test your mod
5. **Verify everything works** as expected

## Practice Exercise 🎯

Try building a simple project with one interaction:

1. Create a new project in the Studio
2. Add a simple interaction to `src/interactions.jpe`
3. Add corresponding strings to `src/strings.jpe`
4. Click "Build Project" in the Build tab
5. Check the build report for success
6. Look for generated files in the `build/` folder

## Best Practices for Building 🏆

1. **Validate before building** - Check your JPE syntax
2. **Build frequently** - Catch issues early
3. **Read build reports carefully** - They contain helpful information
4. **Keep backups** - Save working versions before making changes

## Common Mistakes to Avoid 🚨

1. **Not checking the build report** - Always review build results
2. **Ignoring warnings** - Warnings can become errors later
3. **Building in wrong directory** - Make sure you're in the project root
4. **Not testing after building** - Always verify functionality

## Real-World Analogy 🌍

Building works like:
- **Baking a cake** - You mix ingredients (JPE) and bake (build) to create the final product
- **Developing photos** - You take pictures (JPE) and develop them (build) to see the results
- **Manufacturing products** - You design (JPE) and produce (build) the final item
- **Publishing books** - You write (JPE) and print (build) the final book

Just like in real life, building transforms your ideas into something others can use!

---

💡 **Pro Tip**: Always build and test small changes before making larger ones. This makes it easier to identify and fix issues.

Click "Next →" to learn about Testing and Debugging!
"""

    def get_testing_debugging_content(self):
        """Get content for the testing and debugging section."""
        return """
# 🔍 Finding Problems: Testing

## What Is Testing and Debugging? 🔧

**Testing** is making sure your mod works correctly, and **Debugging** is finding and fixing problems when it doesn't work. Think of it as:

- **Quality control** for your mod creation
- **Problem-solving** when things don't work as expected
- **Verification** that your mod behaves properly in the game
- **Troubleshooting** when errors occur

## Why Is Testing Important? 🌟

Testing ensures that:
- Your mod works as intended in the actual game
- Players have a good experience with your mod
- There are no game-breaking bugs or issues
- Your mod integrates well with other mods
- Your mod is stable and reliable

## Types of Testing 🧪

### 1. Syntax Testing
- Checking that your JPE code follows proper format
- Done automatically during the build process
- Catches basic errors like missing colons or 'end' statements

### 2. Functional Testing
- Testing that your mod elements work in-game
- Verifying interactions trigger properly
- Checking that buffs apply and expire correctly
- Ensuring traits behave as expected

### 3. Integration Testing
- Testing how your mod works with other mods
- Checking for conflicts or compatibility issues
- Verifying that your mod doesn't break other functionality

## Common Issues and How to Debug Them 🔍

### Issue: Mod Doesn't Appear in Game
**Checklist:**
- Is the mod file in the correct Sims 4 mod folder?
- Is the file extension .package or .xml (depending on your output)?
- Are there any errors in the build report?
- Is the game's testing cheats enabled?

### Issue: Interaction Doesn't Work
**Checklist:**
- Does the interaction have proper participants?
- Are all required fields filled in correctly?
- Is there a corresponding string for the display name?
- Does the interaction pass all tests in the game?

### Issue: Buff Doesn't Apply
**Checklist:**
- Is the buff referenced correctly in the interaction?
- Does the buff have all required properties?
- Is the duration set correctly?
- Are there any conflicting traits or buffs?

## Debugging Tools and Techniques 🛠️

### 1. Build Reports
- Always read the build report carefully
- Look for specific error messages and line numbers
- Address errors in the order they appear

### 2. In-Game Testing
- Use testing cheats in the game: `testingcheats on`
- Look for your mod elements in the appropriate places
- Try different scenarios to ensure reliability

### 3. Log Files
- Check Sims 4 log files for errors related to your mod
- Look in Documents/Electronic Arts/The Sims 4/ for log files
- Pay attention to any error messages that mention your mod

## Example Debugging Process 📝

Let's debug a common issue:

**Problem:** Your "Wave Hello" interaction doesn't appear in the game.

**Debugging Steps:**
1. Check the build report for errors
2. Verify the interaction file syntax
3. Ensure the interaction has proper participants
4. Confirm string references are correct
5. Check that the mod file is in the right folder
6. Test with testing cheats enabled

**JPE Code Check:**
```
[Interactions]
id: wave_hello
display_name: Wave Hello  # Make sure this exists in strings
description: Friendly greeting
participant: role:Actor, description:The one waving
participant: role:Target, description:The one being waved at
end
```

## Best Practices for Testing 🏆

1. **Test Early and Often** - Don't wait until your mod is complete
2. **Test in Small Steps** - Add one element at a time and test
3. **Use Multiple Test Cases** - Test different scenarios
4. **Document Your Tests** - Keep notes on what you've tested
5. **Get Feedback** - Have others test your mod

## Common Testing Scenarios 🧩

### Interaction Testing
- Test with different Sim types (babies, children, adults, etc.)
- Test with different traits to see if they affect the interaction
- Test in different locations (home, community lots)
- Test with different target types (other Sims, objects)

### Buff Testing
- Verify the duration works correctly
- Check if the buff affects mood appropriately
- Test if the buff conflicts with other buffs
- Verify the buff icon displays correctly

### Trait Testing
- Create a Sim with your trait and verify it appears
- Test how the trait affects behavior
- Check if the trait conflicts with other traits
- Verify trait descriptions are clear

## Practice Exercise 🎯

Test a simple interaction you've created:

1. Build your project successfully
2. Copy the mod file to your Sims 4 mod folder
3. Start The Sims 4 with testing cheats enabled
4. Try to use your interaction in the game
5. Verify it works as expected
6. Document any issues you find

## Debugging Checklist 📋

When debugging, go through this checklist:
- [ ] Build completed successfully with no errors
- [ ] All required fields are present in your JPE files
- [ ] String references are correct and exist
- [ ] File is in the correct Sims 4 mod folder
- [ ] Testing cheats are enabled in the game
- [ ] No conflicting mod elements
- [ ] Proper game version compatibility

## Common Mistakes to Avoid 🚨

1. **Skipping testing** - Always test your mods before sharing
2. **Testing only one scenario** - Test multiple situations
3. **Ignoring warnings** - Warnings can lead to issues
4. **Not documenting issues** - Keep track of what you find

## Real-World Analogy 🌍

Testing and debugging work like:
- **Quality testing for products** - Ensuring they work before selling
- **Medical trials** - Testing treatments for safety and effectiveness
- **Software testing** - Finding and fixing bugs before release
- **Recipe testing** - Adjusting ingredients until the dish is perfect

Just like in real life, testing ensures quality and reliability!

---

💡 **Pro Tip**: Create a test plan before you start building. List what you'll test and how, so you don't miss anything important.

Click "Next →" to learn about Sharing and Publishing your mods!
"""

    def get_sharing_publishing_content(self):
        """Get content for the sharing and publishing section."""
        return """
# 🎁 Share Your Creation!

## Sharing Your Mods 🚀

Now that you've created and tested your mod, it's time to share it with the world! Sharing your creations allows other Sims 4 players to enjoy your work and contributes to the vibrant modding community.

## Preparing Your Mod for Sharing 📦

Before sharing, make sure your mod is ready:

### 1. Final Testing
- Test your mod thoroughly in the game
- Verify all interactions, buffs, and traits work correctly
- Check for any remaining bugs or issues
- Test with different Sim types and scenarios

### 2. Documentation
- Write clear installation instructions
- Describe what your mod does
- List any requirements or compatibility notes
- Include credits if you used any resources from others

### 3. Package Organization
- Include only the necessary mod files
- Organize files in a clear folder structure
- Remove any temporary or development files
- Consider grouping related elements in folders

## Creating Installation Instructions 📋

Clear installation instructions help users properly install your mod:

```
INSTALLATION:
1. Extract the downloaded file
2. Copy the .package or .xml files to your Sims 4 mod folder
3. Location: Documents/Electronic Arts/The Sims 4/Mods/
4. Start The Sims 4 and enjoy!

COMPATIBILITY:
- Game version 1.95 or higher
- No conflicting interaction mods
- Works with all packs

CREDITS:
Created with JPE Sims 4 Mod Translator
Original concept by [Your Name]
```

## Distribution Platforms 🌐

There are several places where you can share your Sims 4 mods:

### ModTheSims
- Large Sims 4 modding community
- Good organization and search features
- Active user base

### Nexus Mods
- Popular modding platform
- Good tools for mod management
- Cross-game compatibility

### Reddit Communities
- r/simss4mods
- Active feedback from users
- Good for smaller, experimental mods

### Personal Websites
- Complete control over your content
- Direct connection with users
- Professional presentation

## Mod File Formats 📁

### Package Files (.package)
- Traditional Sims 4 mod format
- Requires S3PE or similar tools to create
- More complex but widely compatible

### XML Files (.xml)
- Human-readable format
- Generated by JPE translator
- Easier to inspect and modify

### ZIP Archives (.zip)
- Compressed packages containing mod files
- Easy to distribute
- Preserves folder structure

## Best Practices for Sharing 🏆

### 1. Clear Descriptions
- Explain what your mod does in simple terms
- Include screenshots or videos if possible
- List features and benefits

### 2. Proper Tagging
- Use relevant tags for searchability
- Include game version requirements
- Mark as compatible or incompatible with other mods

### 3. Regular Updates
- Keep your mod compatible with game updates
- Fix bugs when reported by users
- Add new features based on feedback

### 4. Community Engagement
- Respond to user comments and questions
- Accept constructive feedback
- Consider suggestions for improvements

## Example Distribution Package 📦

Here's how to organize a mod for distribution:

```
MyAwesomeMod_v1.0.zip
├── MyAwesomeMod/
│   ├── Interactions/
│   │   ├── wave_hello.package
│   │   └── friendly_greetings.package
│   ├── Buffs/
│   │   └── happy_visitor.package
│   └── Documentation/
│       ├── Readme.txt
│       └── Installation Guide.pdf
```

## Versioning Your Mods 🔄

Use version numbers to track updates:

- **Major.Minor.Patch** format (e.g., 1.2.3)
- Increment major version for significant changes
- Increment minor version for new features
- Increment patch for bug fixes

## Getting Feedback 🗣️

### User Feedback
- Encourage users to report bugs
- Ask for feature requests
- Respond to comments and questions

### Testing with Others
- Have friends or community members test your mod
- Get feedback on usability and functionality
- Make improvements based on feedback

## Legal and Ethical Considerations ⚖️

### Respecting EA's Terms
- Don't distribute EA's original game files
- Only share your own creations
- Follow EA's modding guidelines

### Giving Credit
- Credit original modders if you were inspired by their work
- Acknowledge any resources you used
- Be transparent about your process

## Practice Exercise 🎯

Prepare one of your mods for sharing:

1. Test it thoroughly in the game
2. Create clear installation instructions
3. Write a description of what it does
4. Package it in a ZIP file with proper organization
5. Consider where you might share it

## Common Sharing Mistakes to Avoid 🚨

1. **Not testing before sharing** - Always verify functionality
2. **Poor documentation** - Include clear instructions
3. **Incorrect file formats** - Make sure files are properly generated
4. **Not updating for new game versions** - Keep mods compatible
5. **Ignoring user feedback** - Engage with your community

## Real-World Analogy 🌍

Sharing mods works like:
- **Publishing a book** - Creating something valuable and sharing with others
- **Open source software** - Contributing to a community of creators
- **Art exhibitions** - Sharing creative work with an appreciative audience
- **Cooking for others** - Creating something enjoyable for people to experience

Just like in real life, sharing your creations brings joy to others and builds community!

---

🎉 **Congratulations**: You've completed The Codex! You now have all the knowledge needed to create, build, test, and share Sims 4 mods using JPE. Keep experimenting, learning, and creating amazing mods for the community!

Click "Next →" to complete your journey and see additional resources!
"""

    def show_section(self, section_index):
        """Display a specific tutorial section."""
        if 0 <= section_index < len(self.tutorial_sections):
            section = self.tutorial_sections[section_index]
            self.current_section = section_index

            # Update content display
            self.content_text.config(state=tk.NORMAL)
            self.content_text.delete(1.0, tk.END)
            self.content_text.insert(tk.END, section["content"])
            self.content_text.config(state=tk.DISABLED)

            # Update navigation selection
            self.nav_listbox.select_clear(0, tk.END)
            self.nav_listbox.selection_set(section_index)
            self.nav_listbox.see(section_index)

            # Update progress
            self.update_progress()
    
    def next_section(self):
        """Go to the next tutorial section."""
        if self.current_section < len(self.tutorial_sections) - 1:
            self.current_section += 1
            self.show_section(self.current_section)
    
    def prev_section(self):
        """Go to the previous tutorial section."""
        if self.current_section > 0:
            self.current_section -= 1
            self.show_section(self.current_section)
    
    def on_section_select(self, event):
        """Handle selection of a tutorial section from the list."""
        selection = self.nav_listbox.curselection()
        if selection:
            selected_index = selection[0]
            self.show_section(selected_index)
    
    def update_progress(self):
        """Update the progress bar and label."""
        total = len(self.tutorial_sections)
        completed = len(self.completed_sections)
        progress_percent = (completed / total) * 100 if total > 0 else 0
        
        self.progress_bar['value'] = progress_percent
        self.progress_label.config(text=f"Progress: {completed}/{total} sections completed ({int(progress_percent)}%)")
        
        # Enable/disable next button based on current section
        is_last = self.current_section == len(self.tutorial_sections) - 1
        self.next_button.config(state=tk.DISABLED if is_last else tk.NORMAL)
        self.prev_button.config(state=tk.NORMAL if self.current_section > 0 else tk.DISABLED)
    
    def mark_section_complete(self):
        """Mark the current section as complete."""
        current_id = self.tutorial_sections[self.current_section]["id"]
        self.completed_sections.add(current_id)
        
        # Update the listbox to show completion
        self.nav_listbox.delete(self.current_section)
        section = self.tutorial_sections[self.current_section]
        status = "✓ " if current_id in self.completed_sections else "○ "
        self.nav_listbox.insert(self.current_section, f"{status}{section['title']}")
        
        # Update selection after repopulating
        self.nav_listbox.selection_set(self.current_section)
        
        # Update progress
        self.update_progress()
        
        # Show completion message
        messagebox.showinfo("Section Complete!", f"You've completed: {section['title']}")
    
    def show_examples(self):
        """Show example mods."""
        examples_window = tk.Toplevel(self.codex_window)
        examples_window.title("Mod Examples")
        examples_window.geometry("600x400")
        examples_window.transient(self.codex_window)
        
        ttk.Label(examples_window, text="Coming Soon: Sample mods to download and explore", 
                 font=("Arial", 14)).pack(expand=True)
    
    def open_video_tutorials(self):
        """Open video tutorial page."""
        # In a real implementation, this would open the videos
        messagebox.showinfo("Video Tutorials", "Opening video tutorials in your browser...")
        webbrowser.open("https://jpe-sims4-tutorials.example.com")
    
    def open_community_forum(self):
        """Open community forum."""
        messagebox.showinfo("Community Help", "Opening community forum in your browser...")
        webbrowser.open("https://community.jpe-sims4.example.com")
    
    def open_settings(self):
        """Open settings dialog."""
        settings_window = tk.Toplevel(self.codex_window)
        settings_window.title("Settings")
        settings_window.geometry("400x300")
        settings_window.transient(self.codex_window)
        
        ttk.Label(settings_window, text="Tutorial Settings", 
                 font=("Arial", 14, "bold")).pack(pady=10)
        
        # Add settings controls here
        ttk.Button(settings_window, text="Reset Progress", 
                  command=self.reset_progress).pack(pady=5)
        
        ttk.Button(settings_window, text="Change Difficulty", 
                  command=self.change_difficulty).pack(pady=5)
    
    def reset_progress(self):
        """Reset tutorial progress."""
        result = messagebox.askyesno("Reset Progress", 
                                    "Are you sure you want to reset all tutorial progress?")
        if result:
            self.completed_sections = set()
            self.nav_listbox.delete(0, tk.END)
            for i, section in enumerate(self.tutorial_sections):
                status = "○ "
                self.nav_listbox.insert(tk.END, f"{status}{section['title']}")
            self.update_progress()
            messagebox.showinfo("Progress Reset", "All tutorial progress has been reset.")
    
    def change_difficulty(self):
        """Change tutorial difficulty."""
        messagebox.showinfo("Difficulty", 
                           "Currently set to 'Beginner-friendly'.\n\n"
                           "This mode uses simple explanations and step-by-step guidance.")


def launch_the_codex(parent_window=None):
    """Launch The Codex tutorial system."""
    if parent_window is None:
        # Create a root window if none provided
        root = tk.Tk()
        root.withdraw()  # Hide the root window
        codex = TheCodex(root)
        root.mainloop()
    else:
        codex = TheCodex(parent_window)
    
    return codex


# For direct execution
if __name__ == "__main__":
    app = launch_the_codex()