/**
 * Project Model for JPE Sims 4 Mod Translator Mobile App
 * Defines the data structure for project entities
 */

// Define TypeScript interfaces for our data models

export interface ResourceId {
  name: string;
  module?: string;
  className?: string;
  instanceId?: number;
}

export interface InteractionParticipant {
  role: string;
  description: string;
}

export interface Interaction {
  id: ResourceId;
  displayNameKey: string;
  descriptionKey: string;
  participants: InteractionParticipant[];
  tests?: string[];
  lootActions?: string[];
  autonomyDisabled?: boolean;
}

export interface Buff {
  id: ResourceId;
  displayNameKey: string;
  descriptionKey: string;
  durationSimMinutes?: number;
  traits?: string[];
}

export interface Trait {
  id: ResourceId;
  displayNameKey: string;
  descriptionKey: string;
  buffs?: ResourceId[];
}

export interface EnumOption {
  name: string;
  value: number | string;
}

export interface EnumDefinition {
  id: ResourceId;
  options: EnumOption[];
}

export interface LocalizedString {
  key: string;
  text: string;
  locale: string;
}

export interface ProjectMetadata {
  name: string;
  projectId: string;
  version: string;
  author?: string;
  description?: string;
  createdDate?: Date;
  lastModified?: Date;
}

export interface ProjectIR {
  metadata: ProjectMetadata;
  interactions: Interaction[];
  buffs: Buff[];
  traits: Trait[];
  enums: EnumDefinition[];
  localizedStrings: LocalizedString[];
}

export class ProjectModel {
  private ir: ProjectIR;
  
  constructor(metadata: ProjectMetadata) {
    this.ir = {
      metadata: metadata,
      interactions: [],
      buffs: [],
      traits: [],
      enums: [],
      localizedStrings: []
    };
  }
  
  get metadata(): ProjectMetadata {
    return this.ir.metadata;
  }
  
  set metadata(value: ProjectMetadata) {
    this.ir.metadata = value;
  }
  
  get interactions(): Interaction[] {
    return this.ir.interactions;
  }
  
  addInteraction(interaction: Interaction): void {
    this.ir.interactions.push(interaction);
  }
  
  removeInteraction(id: string): void {
    this.ir.interactions = this.ir.interactions.filter(i => i.id.name !== id);
  }
  
  get buffs(): Buff[] {
    return this.ir.buffs;
  }
  
  addBuff(buff: Buff): void {
    this.ir.buffs.push(buff);
  }
  
  removeBuff(id: string): void {
    this.ir.buffs = this.ir.buffs.filter(b => b.id.name !== id);
  }
  
  get traits(): Trait[] {
    return this.ir.traits;
  }
  
  addTrait(trait: Trait): void {
    this.ir.traits.push(trait);
  }
  
  removeTrait(id: string): void {
    this.ir.traits = this.ir.traits.filter(t => t.id.name !== id);
  }
  
  get enums(): EnumDefinition[] {
    return this.ir.enums;
  }
  
  addEnum(enumDef: EnumDefinition): void {
    this.ir.enums.push(enumDef);
  }
  
  removeEnum(id: string): void {
    this.ir.enums = this.ir.enums.filter(e => e.id.name !== id);
  }
  
  get localizedStrings(): LocalizedString[] {
    return this.ir.localizedStrings;
  }
  
  addLocalizedString(stringDef: LocalizedString): void {
    this.ir.localizedStrings.push(stringDef);
  }
  
  removeLocalizedString(key: string): void {
    this.ir.localizedStrings = this.ir.localizedStrings.filter(s => s.key !== key);
  }
  
  serialize(): string {
    // Convert the project IR to a JPE string representation
    let jpeContent = `[Project]\n`;
    jpeContent += `name: ${this.ir.metadata.name}\n`;
    jpeContent += `id: ${this.ir.metadata.projectId}\n`;
    jpeContent += `version: ${this.ir.metadata.version}\n`;
    if (this.ir.metadata.author) {
      jpeContent += `author: ${this.ir.metadata.author}\n`;
    }
    if (this.ir.metadata.description) {
      jpeContent += `description: ${this.ir.metadata.description}\n`;
    }
    jpeContent += `end\n\n`;

    if (this.ir.interactions.length > 0) {
      jpeContent += `[Interactions]\n`;
      for (const interaction of this.ir.interactions) {
        jpeContent += `id: ${interaction.id.name}\n`;
        jpeContent += `display_name: ${interaction.displayNameKey}\n`;
        jpeContent += `description: ${interaction.descriptionKey}\n`;
        
        for (const participant of interaction.participants) {
          jpeContent += `participant: role:${participant.role}, description:${participant.description}\n`;
        }
        
        if (interaction.autonomyDisabled) {
          jpeContent += `autonomy_disabled: ${interaction.autonomyDisabled}\n`;
        }
        
        jpeContent += `end\n\n`;
      }
    }

    if (this.ir.buffs.length > 0) {
      jpeContent += `[Buffs]\n`;
      for (const buff of this.ir.buffs) {
        jpeContent += `id: ${buff.id.name}\n`;
        jpeContent += `display_name: ${buff.displayNameKey}\n`;
        jpeContent += `description: ${buff.descriptionKey}\n`;
        if (buff.durationSimMinutes) {
          jpeContent += `duration: ${buff.durationSimMinutes}\n`;
        }
        if (buff.traits && buff.traits.length > 0) {
          for (const trait of buff.traits) {
            jpeContent += `trait: ${trait}\n`;
          }
        }
        jpeContent += `end\n\n`;
      }
    }

    if (this.ir.traits.length > 0) {
      jpeContent += `[Traits]\n`;
      for (const trait of this.ir.traits) {
        jpeContent += `id: ${trait.id.name}\n`;
        jpeContent += `display_name: ${trait.displayNameKey}\n`;
        jpeContent += `description: ${trait.descriptionKey}\n`;
        if (trait.buffs && trait.buffs.length > 0) {
          for (const buffRef of trait.buffs) {
            jpeContent += `buff: ${buffRef.name}\n`;
          }
        }
        jpeContent += `end\n\n`;
      }
    }

    if (this.ir.enums.length > 0) {
      jpeContent += `[Enums]\n`;
      for (const enumDef of this.ir.enums) {
        jpeContent += `id: ${enumDef.id.name}\n`;
        for (const option of enumDef.options) {
          jpeContent += `option: ${option.name}:${option.value}\n`;
        }
        jpeContent += `end\n\n`;
      }
    }

    if (this.ir.localizedStrings.length > 0) {
      jpeContent += `[Strings]\n`;
      for (const stringDef of this.ir.localizedStrings) {
        jpeContent += `key: ${stringDef.key}\n`;
        jpeContent += `text: ${stringDef.text}\n`;
        jpeContent += `locale: ${stringDef.locale}\n`;
        jpeContent += `end\n\n`;
      }
    }

    return jpeContent;
  }
  
  static deserialize(jpeContent: string): ProjectModel {
    // This would implement parsing of JPE content back to a ProjectModel
    // For brevity in this example, we'll return a minimal project
    const project = new ProjectModel({
      name: "Parsed Project",
      projectId: "parsed_project",
      version: "1.0.0"
    });
    
    // In a real implementation, this would parse the JPE content
    // and populate the model with appropriate values
    
    return project;
  }
}