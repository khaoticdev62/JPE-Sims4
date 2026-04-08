import {
  type LucideIcon,
  FileCode, Code2, Globe, Braces, Package, FileText,
  Sparkles, Shield, Network, Languages, Layers,
  Star, Heart, Activity, Eye, Cpu, GitBranch, Clock, Zap,
  Database, Rocket, HardDrive, Monitor, Boxes,
  CheckCircle2, AlertTriangle,
} from "lucide-react";
import { T } from "./jpe-theme";

/* ═══ FILE TREE ═══ */
export const fileTree = [
  { name: "JPE_Project", type: "folder" as const, expanded: true, children: [
    { name: "src", type: "folder" as const, expanded: true, children: [
      { name: "tuning", type: "folder" as const, expanded: true, children: [
        { name: "S4_03B33DDF_BG_YA_shorts.xml", type: "file" as const, ext: "xml", status: "modified" as const, size: "24.8 KB" },
        { name: "S4_034AEECB_trait_Evil.xml", type: "file" as const, ext: "xml", status: "ready" as const, size: "18.2 KB" },
        { name: "S4_0904DF10_buff_Energized.xml", type: "file" as const, ext: "xml", status: "warning" as const, size: "12.4 KB" },
        { name: "S4_16CD1E22_interaction_Cook.xml", type: "file" as const, ext: "xml", status: "ready" as const, size: "31.6 KB" },
        { name: "S4_E882D22F_recipe_Salad.xml", type: "file" as const, ext: "xml", status: "ready" as const, size: "9.7 KB" },
      ]},
      { name: "scripts", type: "folder" as const, children: [
        { name: "jpe_translator.ts4script", type: "file" as const, ext: "ts4script", status: "ready" as const, size: "8.9 KB" },
        { name: "mod_injector.ts4script", type: "file" as const, ext: "ts4script", status: "modified" as const, size: "14.3 KB" },
        { name: "conflict_resolver.ts4script", type: "file" as const, ext: "ts4script", status: "ready" as const, size: "6.1 KB" },
      ]},
      { name: "translations", type: "folder" as const, expanded: true, children: [
        { name: "en_US.stbl", type: "file" as const, ext: "stbl", status: "ready" as const, size: "156.7 KB" },
        { name: "ja_JP.stbl", type: "file" as const, ext: "stbl", status: "warning" as const, size: "148.2 KB" },
        { name: "de_DE.stbl", type: "file" as const, ext: "stbl", status: "ready" as const, size: "152.1 KB" },
        { name: "fr_FR.stbl", type: "file" as const, ext: "stbl", status: "draft" as const, size: "89.4 KB" },
      ]},
      { name: "configs", type: "folder" as const, children: [
        { name: "settings.json", type: "file" as const, ext: "json", status: "ready" as const, size: "2.1 KB" },
        { name: "overrides.json", type: "file" as const, ext: "json", status: "modified" as const, size: "4.8 KB" },
        { name: "locale_map.json", type: "file" as const, ext: "json", status: "ready" as const, size: "1.4 KB" },
      ]},
    ]},
    { name: "build", type: "folder" as const, children: [
      { name: "EvilTraitOverride.package", type: "file" as const, ext: "package", status: "ready" as const, size: "2.4 MB" },
      { name: "EvilTraitOverride_strings.package", type: "file" as const, ext: "package", status: "ready" as const, size: "856 KB" },
    ]},
    { name: "manifest.json", type: "file" as const, ext: "json", status: "ready" as const, size: "1.2 KB" },
    { name: "README.md", type: "file" as const, ext: "md", status: "ready" as const, size: "3.8 KB" },
  ]},
];

export type FileExt = "xml" | "stbl" | "ts4script" | "json" | "package" | "md";
export const fileTypeConfig: Record<string, { icon: LucideIcon; color: string; label: string }> = {
  xml: { icon: FileCode, color: "#63B3ED", label: "XML Tuning" },
  stbl: { icon: Globe, color: "#A78BFA", label: "STBL Locale" },
  ts4script: { icon: Code2, color: "#48BB78", label: "TS4Script" },
  json: { icon: Braces, color: "#F6AD55", label: "JSON Config" },
  package: { icon: Package, color: "#FC8181", label: "Package" },
  md: { icon: FileText, color: "#718096", label: "Markdown" },
};

export const fileFilterTypes: { ext: FileExt; label: string }[] = [
  { ext: "xml", label: ".xml" },
  { ext: "stbl", label: ".stbl" },
  { ext: "ts4script", label: ".py" },
  { ext: "json", label: ".json" },
  { ext: "package", label: ".pkg" },
];

/* ═══ CODE LINES ═══ */
export const codeLines = [
  { num: 1, text: '<?xml version="1.0" encoding="utf-8"?>', type: "tag" as const },
  { num: 2, text: '<TuningRoot>', type: "tag" as const },
  { num: 3, text: '  <Instance i="trait" s="Evil" n="trait_Evil">', type: "tag" as const },
  { num: 4, text: '    <TunableVariant name="trait_type" type="PERSONALITY">', type: "attr" as const },
  { num: 5, text: '      <Tunable name="display_name">', type: "attr" as const },
  { num: 6, text: '        0x0A3B4C5D <!-- Evil -->', type: "value" as const },
  { num: 7, text: '      </Tunable>', type: "tag" as const },
  { num: 8, text: '      <Tunable name="trait_description">', type: "attr" as const },
  { num: 9, text: '        0x1F2E3D4C <!-- These Sims enjoy being mean... -->', type: "value" as const },
  { num: 10, text: '      </Tunable>', type: "tag" as const },
  { num: 11, text: '      <TunableList name="conflicting_traits">', type: "attr" as const },
  { num: 12, text: '        <Tunable>trait_Good</Tunable>', type: "value" as const },
  { num: 13, text: '        <Tunable>trait_Childish</Tunable>', type: "value" as const },
  { num: 14, text: '      </TunableList>', type: "tag" as const },
  { num: 15, text: '      <Tunable name="icon" type="ResourceKey">', type: "attr" as const },
  { num: 16, text: '        S4_2F7D0004_00000001_Evil_Icon', type: "value" as const },
  { num: 17, text: '      </Tunable>', type: "tag" as const },
  { num: 18, text: '      <TunableList name="buffs_on_add">', type: "attr" as const },
  { num: 19, text: '        <TunableTuple>', type: "tag" as const },
  { num: 20, text: '          <Tunable name="buff_type">buff_Evil_Aura</Tunable>', type: "value" as const },
  { num: 21, text: '          <Tunable name="buff_reason">0x2A3B4C5D</Tunable>', type: "value" as const },
  { num: 22, text: '        </TunableTuple>', type: "tag" as const },
  { num: 23, text: '      </TunableList>', type: "tag" as const },
  { num: 24, text: '      <Tunable name="ages" type="TunableSet">', type: "attr" as const },
  { num: 25, text: '        TEEN, YOUNGADULT, ADULT, ELDER', type: "value" as const },
  { num: 26, text: '      </Tunable>', type: "tag" as const },
  { num: 27, text: '      <Tunable name="cas_selected_icon">', type: "attr" as const },
  { num: 28, text: '        S4_2F7D0004_CAS_trait_Evil', type: "value" as const },
  { num: 29, text: '      </Tunable>', type: "tag" as const },
  { num: 30, text: '    </TunableVariant>', type: "tag" as const },
  { num: 31, text: '  </Instance>', type: "tag" as const },
  { num: 32, text: '</TuningRoot>', type: "tag" as const },
];

export const translationRows = [
  { id: "STR-001", key: "0x0A3B4C5D", source: "Evil", jpe: 'Trait name for a Sim personality that enjoys causing misery to others', status: "ready" as const, confidence: 98 },
  { id: "STR-002", key: "0x1F2E3D4C", source: "These Sims enjoy being mean and causing mayhem", jpe: "Description text explaining the Evil trait behavior: Sims with this trait take pleasure in mean social interactions and autonomously perform mischief", status: "ready" as const, confidence: 95 },
  { id: "STR-003", key: "0x2A3B4C5D", source: "Feeling Evil", jpe: "Buff reason string displayed when the Evil trait's passive aura activates on the Sim", status: "draft" as const, confidence: 87 },
  { id: "STR-004", key: "0x3B4C5D6E", source: "Maniacal Laugh", jpe: "Interaction name: autonomous mean interaction triggered by the Evil trait with a 15% chance per hour", status: "review" as const, confidence: 92 },
  { id: "STR-005", key: "0x4C5D6E7F", source: "Plot Against", jpe: "Social interaction name: targets another Sim to reduce their relationship score by -20 to -35 points", status: "ready" as const, confidence: 96 },
  { id: "STR-006", key: "0x5D6E7F80", source: "Troll teh Forums", jpe: 'Computer interaction name: idle activity that generates +2 Fun per hour while "trolling"', status: "draft" as const, confidence: 78 },
  { id: "STR-007", key: "0x6E7F8091", source: "Voodoo Doll", jpe: "Object interaction: targets a specific Sim via a Voodoo Doll object to apply negative buffs remotely", status: "warning" as const, confidence: 64 },
  { id: "STR-008", key: "0x7F8091A2", source: "Evil Sims gain...", jpe: "Tooltip description for the CAS panel explaining trait bonuses: +Mischief skill gain, +Mean interaction success rate", status: "ready" as const, confidence: 94 },
];

export const diagnosticLogs = [
  { time: "15:42:18", level: "INFO" as const, text: "JPE Studio v4.2.0 initialized \u2014 workspace loaded", hash: "a3f8" },
  { time: "15:42:19", level: "SYS" as const, text: "Sims 4 SDK connected: Build 1.108.329.1030", hash: "b7c2" },
  { time: "15:42:20", level: "INFO" as const, text: "Loaded project: Evil_Trait_Override (14 tuning files)", hash: "c1d9" },
  { time: "15:42:21", level: "DEPS" as const, text: "Resolved 847 resource references across 3 packages", hash: "d4e8" },
  { time: "15:42:22", level: "WARN" as const, text: "String table mismatch: ja_JP missing 3 entries", hash: "e5f0" },
  { time: "15:42:23", level: "JPE" as const, text: "Translation engine ready \u2014 8/8 strings processed", hash: "f6a1" },
  { time: "15:42:24", level: "INFO" as const, text: "Conflict scanner: 0 critical, 2 warnings detected", hash: "07b2" },
  { time: "15:42:25", level: "BUILD" as const, text: "Last build: 2m ago \u2014 Build #4218 (main branch)", hash: "18c3" },
  { time: "15:42:26", level: "DEBUG" as const, text: "Heap: 412MB | GC: 8ms avg | Threads: 4/8 active", hash: "29d4" },
  { time: "15:42:27", level: "SYS" as const, text: "WebSocket relay: ws://localhost:8847 \u2014 latency 4ms", hash: "3ae5" },
  { time: "15:42:28", level: "INFO" as const, text: "Plugin manager: 6 plugins loaded, 0 errors", hash: "4bf6" },
  { time: "15:42:29", level: "JPE" as const, text: "AI confidence avg: 91.2% across 847 translations", hash: "5c07" },
];

export const modDependencies = [
  { name: "BaseGame Tuning", version: "1.108.329", status: "ok" as const, type: "core" as const },
  { name: "EP01_GetTogether", version: "1.108.329", status: "ok" as const, type: "expansion" as const },
  { name: "GP04_Vampires", version: "1.108.329", status: "ok" as const, type: "gamepack" as const },
  { name: "MCCC_Core", version: "8.3.1", status: "warn" as const, type: "mod" as const },
  { name: "UI_Cheats_Ext", version: "1.38", status: "ok" as const, type: "mod" as const },
  { name: "WickedWhims", version: "180a", status: "conflict" as const, type: "mod" as const },
];

export const sparkData = Array.from({ length: 40 }, (_, i) => ({
  t: i, cpu: 35 + Math.sin(i * 0.4) * 20 + Math.random() * 10,
  mem: 55 + Math.cos(i * 0.3) * 15 + Math.random() * 8,
  net: 20 + Math.sin(i * 0.5 + 1) * 12 + Math.random() * 6,
}));

export const pieData = [
  { name: "Traits", value: 34, color: T.cyan },
  { name: "Buffs", value: 28, color: T.violet },
  { name: "Interactions", value: 22, color: T.emerald },
  { name: "Objects", value: 16, color: T.amber },
];

/* ═══ MOD LIBRARY DATA ═══ */
export type ModStatus = "installed" | "update" | "available" | "outdated";
export type ModSource = "scarlet" | "curseforge" | "local" | "nexus";
export interface LibMod {
  id: string; name: string; version: string; latestVersion: string; author: string; downloads: string;
  rating: number; status: ModStatus; category: string; size: string; source: ModSource;
  enabled: boolean; gameCompat: string[]; desc: string; conflicts: number; deps: string[];
  updated: string; installed: string; tunings: number; strings: number;
}
export const modLibraryData: LibMod[] = [
  { id: "evil-trait", name: "Evil Trait Override", version: "2.1.0", latestVersion: "2.1.0", author: "JPE_Dev", downloads: "12.4K", rating: 4.8, status: "installed", category: "Traits", size: "2.4 MB", source: "scarlet", enabled: true, gameCompat: ["1.108", "1.107", "1.106"], desc: "Overhauls the Evil trait with new interactions, autonomous behaviors, and unique mood buffs. Adds 12 new social interactions and 4 trait-specific whims.", conflicts: 0, deps: ["Base Game"], updated: "3 days ago", installed: "2 weeks ago", tunings: 14, strings: 48 },
  { id: "career-mega", name: "Career Mega Pack", version: "5.0.2", latestVersion: "5.1.0", author: "SimsModder", downloads: "84.2K", rating: 4.9, status: "update", category: "Careers", size: "18.7 MB", source: "scarlet", enabled: true, gameCompat: ["1.108", "1.107"], desc: "Adds 8 fully-branching careers with custom chance cards, career outfits, and workplace lot assignments.", conflicts: 1, deps: ["Base Game", "Get to Work"], updated: "1 day ago", installed: "1 month ago", tunings: 86, strings: 412 },
  { id: "food-set", name: "Custom Food Set", version: "1.3.1", latestVersion: "1.3.1", author: "CookingSim", downloads: "6.8K", rating: 4.5, status: "installed", category: "Objects", size: "8.2 MB", source: "curseforge", enabled: true, gameCompat: ["1.108", "1.107", "1.106", "1.105"], desc: "24 new recipes with custom meshes, including cultural dishes from 6 regions. Features animated cooking sequences.", conflicts: 0, deps: ["Base Game"], updated: "2 weeks ago", installed: "3 weeks ago", tunings: 24, strings: 96 },
  { id: "neighborhood-fix", name: "Neighborhood Fix", version: "3.2.0", latestVersion: "3.2.0", author: "FixIt", downloads: "45.1K", rating: 4.7, status: "installed", category: "Fixes", size: "1.1 MB", source: "nexus", enabled: true, gameCompat: ["1.108"], desc: "Repairs broken lot assignments, fixes townie generation bugs, and restores correct NPC schedules.", conflicts: 0, deps: ["Base Game"], updated: "5 days ago", installed: "1 week ago", tunings: 8, strings: 0 },
  { id: "anim-override", name: "Animation Override", version: "1.0.4", latestVersion: "1.1.0", author: "MotionDev", downloads: "23.5K", rating: 4.6, status: "update", category: "Animation", size: "34.8 MB", source: "scarlet", enabled: false, gameCompat: ["1.108", "1.107"], desc: "Replaces 60+ default animations with high-fidelity motion-captured alternatives.", conflicts: 2, deps: ["Base Game"], updated: "12 hours ago", installed: "2 months ago", tunings: 4, strings: 0 },
  { id: "lighting-overhaul", name: "Lighting Overhaul", version: "2.8.0", latestVersion: "2.8.0", author: "LuxStudio", downloads: "31.2K", rating: 4.4, status: "available", category: "Graphics", size: "12.6 MB", source: "nexus", enabled: false, gameCompat: ["1.108", "1.107", "1.106"], desc: "Complete interior and exterior lighting rebalance with physically-based light falloff.", conflicts: 0, deps: ["Base Game"], updated: "1 week ago", installed: "", tunings: 32, strings: 0 },
  { id: "scarlet-traits", name: "Scarlet's Trait Collection", version: "4.2.1", latestVersion: "4.3.0", author: "ScarletRealm", downloads: "156.8K", rating: 4.9, status: "update", category: "Traits", size: "6.4 MB", source: "scarlet", enabled: true, gameCompat: ["1.108", "1.107"], desc: "30 unique personality traits with deep gameplay integration. Fan favorites: Chaotic, Bookworm+, Night Owl.", conflicts: 1, deps: ["Base Game"], updated: "6 hours ago", installed: "2 months ago", tunings: 120, strings: 640 },
  { id: "build-buy-plus", name: "Build/Buy Expansion", version: "3.5.0", latestVersion: "3.5.0", author: "BB_Creator", downloads: "67.3K", rating: 4.7, status: "installed", category: "Objects", size: "45.2 MB", source: "curseforge", enabled: true, gameCompat: ["1.108", "1.107", "1.106"], desc: "200+ new build/buy objects including furniture, wall decorations, outdoor items.", conflicts: 0, deps: ["Base Game"], updated: "4 days ago", installed: "3 weeks ago", tunings: 200, strings: 200 },
  { id: "social-bundles", name: "Social Interaction Bundles", version: "2.0.0", latestVersion: "2.0.0", author: "SocSimDev", downloads: "19.7K", rating: 4.3, status: "installed", category: "Interactions", size: "3.8 MB", source: "local", enabled: true, gameCompat: ["1.108", "1.107", "1.106", "1.105"], desc: "40+ new social interactions organized into themed bundles: Romantic+, Friendly+, Mean+, Mischief+.", conflicts: 0, deps: ["Base Game"], updated: "2 weeks ago", installed: "1 month ago", tunings: 40, strings: 160 },
  { id: "lot-traits-ext", name: "Lot Traits Extended", version: "1.6.0", latestVersion: "1.7.2", author: "LotMaster", downloads: "38.9K", rating: 4.5, status: "outdated", category: "Gameplay", size: "2.1 MB", source: "scarlet", enabled: true, gameCompat: ["1.107", "1.106"], desc: "15 new lot traits including Haunted Grounds, Party Zone, Study Haven, and Nature Preserve.", conflicts: 3, deps: ["Base Game", "City Living"], updated: "3 weeks ago", installed: "2 months ago", tunings: 15, strings: 60 },
  { id: "weather-effects", name: "Enhanced Weather Effects", version: "1.2.0", latestVersion: "1.2.0", author: "WeatherMod", downloads: "28.4K", rating: 4.6, status: "available", category: "Graphics", size: "8.9 MB", source: "nexus", enabled: false, gameCompat: ["1.108", "1.107"], desc: "Volumetric fog, improved rain particles, snow accumulation, and dynamic puddle reflections.", conflicts: 0, deps: ["Base Game", "Seasons"], updated: "10 days ago", installed: "", tunings: 6, strings: 12 },
  { id: "debug-cheats", name: "Developer Debug Suite", version: "0.8.3", latestVersion: "0.9.0", author: "DevTools", downloads: "41.2K", rating: 4.8, status: "update", category: "Utilities", size: "1.6 MB", source: "local", enabled: true, gameCompat: ["1.108"], desc: "Advanced developer tools: resource key inspector, tuning hot-reload, real-time Sim state viewer.", conflicts: 0, deps: ["Base Game"], updated: "2 days ago", installed: "3 months ago", tunings: 2, strings: 8 },
];
export const modSources: { id: ModSource | "all"; label: string; icon: LucideIcon; color: string }[] = [
  { id: "all", label: "All Sources", icon: Database, color: T.textTertiary },
  { id: "scarlet", label: "Scarlet's Realm", icon: Star, color: T.rose },
  { id: "curseforge", label: "CurseForge", icon: Rocket, color: T.amber },
  { id: "nexus", label: "NexusMods", icon: Globe, color: T.emerald },
  { id: "local", label: "Local Mods", icon: HardDrive, color: T.cyan },
];
export const modCategoryList = ["All", "Traits", "Careers", "Objects", "Fixes", "Animation", "Graphics", "Interactions", "Gameplay", "Utilities"];

/* ═══ MARKETPLACE PLUGINS ═══ */
export interface MarketPlugin {
  id: string; name: string; version: string; author: string; desc: string; longDesc: string;
  category: "translator" | "tool" | "version-pack" | "language" | "theme" | "analysis";
  rating: number; reviews: number; downloads: string; installed: boolean; verified: boolean;
  compat: string; updated: string; size: string; license: string;
  deps: string[]; tags: string[]; changelog: string[]; icon: LucideIcon; iconColor: string;
}

export const marketPlugins: MarketPlugin[] = [
  { id: "auto-translate", name: "JPE Auto-Translate", version: "1.4.0", author: "JPE Core Team", desc: "AI-powered tuning XML to JPE translation with GPT-4o backend", longDesc: "The flagship translation engine for JPE Studio. Automatically converts Sims 4 tuning XML into JPE format using a GPT-4o backend with domain-specific fine-tuning. Supports batch processing, confidence scoring, and interactive review workflows.", category: "translator", rating: 4.9, reviews: 1247, downloads: "89.3K", installed: true, verified: true, compat: "JPE 3.0+", updated: "2 days ago", size: "4.2 MB", license: "MIT", deps: ["JPE Runtime v3.0+", "STBL Parser v2.1+"], tags: ["ai", "translation", "gpt", "stbl", "core"], changelog: ["v1.4.0 \u2014 Added GPT-4o backend, 23% accuracy improvement", "v1.3.2 \u2014 Fixed batch mode memory leak", "v1.3.0 \u2014 Added confidence threshold settings"], icon: Sparkles, iconColor: T.violet },
  { id: "conflict-detector", name: "Conflict Detector Pro", version: "2.1.0", author: "ModTools Lab", desc: "Deep mod conflict scanning with three-panel merge resolution", longDesc: "Advanced conflict detection system that scans your entire mod library for tuning overlaps, resource key collisions, and STBL hash conflicts.", category: "analysis", rating: 4.7, reviews: 634, downloads: "45.1K", installed: true, verified: true, compat: "JPE 2.8+", updated: "1 week ago", size: "2.8 MB", license: "MIT", deps: ["JPE Runtime v2.8+", "Diff Engine v1.0+"], tags: ["conflict", "merge", "analysis", "diff"], changelog: ["v2.1.0 \u2014 Three-panel merge UI", "v2.0.0 \u2014 Smart merge algorithm", "v1.5.0 \u2014 Chain conflict detection"], icon: Shield, iconColor: T.rose },
  { id: "stbl-editor", name: "STBL Visual Editor", version: "3.0.1", author: "JPE Core Team", desc: "String table editor with multi-locale preview and FNV hash tools", longDesc: "Full-featured visual editor for Sims 4 STBL (String Table) files. Edit translations across all 18 supported locales simultaneously with live preview.", category: "tool", rating: 4.8, reviews: 892, downloads: "67.8K", installed: true, verified: true, compat: "JPE 2.5+", updated: "3 days ago", size: "3.1 MB", license: "MIT", deps: ["JPE Runtime v2.5+"], tags: ["stbl", "string-table", "editor", "localization"], changelog: ["v3.0.1 \u2014 Fixed XLIFF export encoding", "v3.0.0 \u2014 Multi-locale grid view", "v2.9.0 \u2014 CSV batch import"], icon: Globe, iconColor: T.emerald },
  { id: "package-inspector", name: "Package Inspector", version: "1.8.2", author: "JPE Core Team", desc: "DBPF .package file analysis with resource browser and hex viewer", longDesc: "Deep inspection tool for Sims 4 .package (DBPF) files. Browse resource entries by type, group, and instance.", category: "tool", rating: 4.6, reviews: 423, downloads: "34.2K", installed: true, verified: true, compat: "JPE 2.0+", updated: "2 weeks ago", size: "1.9 MB", license: "MIT", deps: ["JPE Runtime v2.0+", "ZLIB Decoder"], tags: ["package", "dbpf", "hex", "inspector"], changelog: ["v1.8.2 \u2014 Fixed large file handling", "v1.8.0 \u2014 Side-by-side comparison", "v1.7.0 \u2014 Hex annotation overlay"], icon: Package, iconColor: T.cyan },
  { id: "tuning-validator", name: "Tuning Schema Validator", version: "1.2.0", author: "Community Contributors", desc: "XML schema validation against official EA tuning specifications", longDesc: "Validates your tuning XML files against the official EA tuning schema specifications. Catches malformed attributes, missing required fields, deprecated elements, and type mismatches.", category: "tool", rating: 4.3, reviews: 187, downloads: "12.1K", installed: false, verified: false, compat: "JPE 2.5+", updated: "1 month ago", size: "6.4 MB", license: "Apache 2.0", deps: ["JPE Runtime v2.5+", "XML Parser v3.0+"], tags: ["validator", "schema", "xml", "tuning"], changelog: ["v1.2.0 \u2014 Updated schemas for patch 1.108", "v1.1.0 \u2014 Custom schema support", "v1.0.0 \u2014 Initial release"], icon: CheckCircle2, iconColor: T.amber },
  { id: "batch-processor", name: "Batch Processor", version: "0.9.1", author: "JPE Core Team", desc: "Bulk tuning operations: rename, re-hash, batch translate, mass export", longDesc: "Process hundreds of tuning files simultaneously with configurable batch operations.", category: "tool", rating: 4.5, reviews: 312, downloads: "23.5K", installed: true, verified: true, compat: "JPE 3.0+", updated: "5 days ago", size: "1.4 MB", license: "MIT", deps: ["JPE Runtime v3.0+"], tags: ["batch", "bulk", "automation", "rename"], changelog: ["v0.9.1 \u2014 Fixed regex edge cases", "v0.9.0 \u2014 Preview mode", "v0.8.0 \u2014 Queue-based execution"], icon: Layers, iconColor: T.violet },
  { id: "ko-kr-pack", name: "Korean Language Pack", version: "2.3.0", author: "KR Modding Community", desc: "Complete ko_KR translation reference with 12,400+ verified strings", longDesc: "Comprehensive Korean language pack containing over 12,400 verified string translations for base game and all expansion packs.", category: "language", rating: 4.9, reviews: 2341, downloads: "156.2K", installed: false, verified: true, compat: "JPE 2.0+", updated: "4 days ago", size: "18.7 MB", license: "CC BY 4.0", deps: ["STBL Parser v2.0+"], tags: ["korean", "ko_kr", "language", "translation"], changelog: ["v2.3.0 \u2014 Added Growing Together strings", "v2.2.0 \u2014 Horse Ranch expansion", "v2.1.0 \u2014 For Rent pack"], icon: Languages, iconColor: T.cyan },
  { id: "ja-jp-pack", name: "Japanese Language Pack", version: "2.1.4", author: "JP Sims Collective", desc: "Full ja_JP translation reference with honorific-aware context engine", longDesc: "Japanese language pack with 11,800+ translations featuring an honorific-aware context engine.", category: "language", rating: 4.8, reviews: 1856, downloads: "134.7K", installed: true, verified: true, compat: "JPE 2.0+", updated: "1 week ago", size: "22.1 MB", license: "CC BY 4.0", deps: ["STBL Parser v2.0+", "Unicode Handler v1.5+"], tags: ["japanese", "ja_jp", "language", "honorific"], changelog: ["v2.1.4 \u2014 Fixed keigo detection edge case", "v2.1.0 \u2014 Honorific context engine", "v2.0.0 \u2014 Complete rewrite"], icon: Languages, iconColor: T.rose },
  { id: "dep-graph", name: "Dependency Graph Visualizer", version: "1.6.0", author: "GraphWorks", desc: "Interactive force-directed dependency graph with cluster analysis", longDesc: "Renders your mod dependency tree as an interactive force-directed graph with real-time physics.", category: "analysis", rating: 4.4, reviews: 276, downloads: "18.9K", installed: false, verified: true, compat: "JPE 2.8+", updated: "3 weeks ago", size: "5.6 MB", license: "MIT", deps: ["JPE Runtime v2.8+", "Canvas Renderer v2.0+"], tags: ["graph", "dependency", "visualization"], changelog: ["v1.6.0 \u2014 Cluster analysis algorithm", "v1.5.0 \u2014 SVG/PNG export", "v1.4.0 \u2014 Cycle detection"], icon: Network, iconColor: T.amber },
  { id: "cyberpunk-theme", name: "Neon Cyberpunk Theme", version: "1.0.3", author: "UIForge", desc: "Enhanced cyberpunk color scheme with animated glow effects", longDesc: "A carefully crafted cyberpunk theme that enhances the default JPE Studio appearance.", category: "theme", rating: 4.2, reviews: 89, downloads: "5.3K", installed: false, verified: false, compat: "JPE 3.0+", updated: "2 months ago", size: "0.8 MB", license: "MIT", deps: [], tags: ["theme", "ui", "colors", "glow"], changelog: ["v1.0.3 \u2014 Fixed contrast in Sunrise variant", "v1.0.2 \u2014 Added Crimson sub-theme", "v1.0.0 \u2014 Initial release"], icon: Monitor, iconColor: T.violet },
  { id: "perf-profiler", name: "Build Performance Profiler", version: "0.7.0", author: "DevMetrics", desc: "Flamegraph and waterfall profiling for build pipeline stages", longDesc: "Profiles your build pipeline execution with flamegraph visualization and waterfall timelines.", category: "analysis", rating: 4.1, reviews: 143, downloads: "8.7K", installed: false, verified: true, compat: "JPE 3.0+", updated: "6 days ago", size: "3.2 MB", license: "MIT", deps: ["JPE Runtime v3.0+", "Build Pipeline v2.0+"], tags: ["profiler", "performance", "flamegraph"], changelog: ["v0.7.0 \u2014 Flamegraph visualization", "v0.6.0 \u2014 Historical trends", "v0.5.0 \u2014 Memory profiling"], icon: Activity, iconColor: T.emerald },
  { id: "version-compat", name: "Version Compatibility Checker", version: "1.1.0", author: "JPE Core Team", desc: "Verify mod compatibility across TS4 game versions and expansion packs", longDesc: "Automatically checks your mod against multiple Sims 4 game versions and expansion pack combinations.", category: "version-pack", rating: 4.6, reviews: 521, downloads: "38.4K", installed: false, verified: true, compat: "JPE 2.5+", updated: "10 days ago", size: "7.8 MB", license: "MIT", deps: ["JPE Runtime v2.5+", "Version DB v4.0+"], tags: ["version", "compatibility", "expansion"], changelog: ["v1.1.0 \u2014 Added patch 1.108 definitions", "v1.0.5 \u2014 Horse Ranch compat data", "v1.0.0 \u2014 Initial release"], icon: Boxes, iconColor: T.cyan },
];

export const pluginCategories = [
  { id: "all", label: "All Plugins", count: marketPlugins.length },
  { id: "translator", label: "Translators", count: marketPlugins.filter(p => p.category === "translator").length },
  { id: "tool", label: "Tools", count: marketPlugins.filter(p => p.category === "tool").length },
  { id: "language", label: "Language Packs", count: marketPlugins.filter(p => p.category === "language").length },
  { id: "analysis", label: "Analysis", count: marketPlugins.filter(p => p.category === "analysis").length },
  { id: "version-pack", label: "Version Packs", count: marketPlugins.filter(p => p.category === "version-pack").length },
  { id: "theme", label: "Themes", count: marketPlugins.filter(p => p.category === "theme").length },
];

/* ═══ JPE EDITOR DATA ═══ */
export type JpeSyntaxToken = "keyword" | "identifier" | "operator" | "value" | "string" | "comment" | "section" | "property" | "number" | "unit" | "error" | "plain";

export interface JpeEditorLine {
  num: number;
  text: string;
  tokens: { text: string; type: JpeSyntaxToken }[];
  error?: string;
  warning?: string;
  hint?: string;
  quickFix?: { label: string; replacement: string };
  validationStatus?: "valid" | "warning" | "error";
}

export interface XmlPreviewLine {
  num: number;
  text: string;
  type: "tag" | "attr" | "value" | "comment";
  indent: number;
  sourceJpeLine?: number;
}

export interface JpeDocEntry {
  keyword: string;
  category: "declaration" | "modifier" | "condition" | "effect" | "logic" | "unit" | "meta";
  signature: string;
  description: string;
  xmlMapping: string;
  examples: string[];
  relatedKeywords: string[];
  sinceVersion: string;
}

const jpeKeywords = new Set(["interaction", "trait", "buff", "career", "skill", "object", "recipe", "requires", "gives", "duration", "chance", "targets", "when", "then", "else", "and", "or", "not", "while", "every", "after", "before", "on", "for", "with", "from", "loot", "outcome", "test", "autonomy", "category", "display_name", "description", "icon", "age", "conflicts_with", "compatible_with"]);
const jpeOperators = new Set([">", "<", ">=", "<=", "==", "!=", "=", "+", "-", "\u2192", "=>", ":"]);
const jpeUnits = new Set(["hours", "hour", "minutes", "minute", "seconds", "second", "days", "day", "percent", "%", "pts", "points"]);

export const jpeDocumentation: JpeDocEntry[] = [
  { keyword: "interaction", category: "declaration", signature: "interaction: <id>", description: "Declares a new Sim interaction. This is the top-level block for defining custom social, object, or environment interactions. The ID becomes the internal tuning reference.", xmlMapping: '<Instance i="interaction" s="id" n="interaction_id">', examples: ["interaction: hug_friend", "interaction: cook_gourmet_meal", "interaction: repair_broken_sink"], relatedKeywords: ["requires", "gives", "outcome", "autonomy", "targets"], sinceVersion: "1.0" },
  { keyword: "trait", category: "declaration", signature: "trait: <id>", description: "Declares a new Sim personality trait. Traits modify Sim behavior, emotions, and available interactions. They persist across play sessions and appear in CAS.", xmlMapping: '<Instance i="trait" s="id" n="trait_id">', examples: ["trait: hugger_trait", "trait: night_owl", "trait: bookworm_enhanced"], relatedKeywords: ["conflicts_with", "compatible_with", "gives", "category", "age"], sinceVersion: "1.0" },
  { keyword: "buff", category: "declaration", signature: "buff: <id>", description: "Declares a new buff (moodlet). Buffs are temporary emotional states applied to Sims that modify their behavior and mood. They have a duration and can stack.", xmlMapping: '<Instance i="buff" s="id" n="buff_id">', examples: ["buff: warm_aura", "buff: happy_small", "buff: focused_study"], relatedKeywords: ["duration", "gives", "display_name", "description"], sinceVersion: "1.0" },
  { keyword: "requires", category: "condition", signature: "requires <test> <operator> <value>", description: "Adds a prerequisite test that must pass before the interaction/effect can trigger. Supports relationship tests, trait checks, skill levels, age gates, and custom tests.", xmlMapping: '<TunableList name="test_globals"> \u2192 <TunableTuple>', examples: ["requires friendship > 40", "requires skill cooking >= 5", "requires age TEEN or ADULT", "requires trait creative"], relatedKeywords: ["not", "and", "or", "targets", "test"], sinceVersion: "1.0" },
  { keyword: "gives", category: "effect", signature: "gives <type> <target> [+/- <amount>]", description: "Applies an effect when the interaction succeeds. Can give moodlets (buffs), relationship changes, skill points, or other rewards.", xmlMapping: '<TunableList name="outcome_actions"> \u2192 <TunableTuple>', examples: ["gives moodlet happy_small", "gives friendship + 5 points", "gives skill cooking + 2", "gives social_need + 15"], relatedKeywords: ["duration", "chance", "loot", "outcome"], sinceVersion: "1.0" },
  { keyword: "duration", category: "modifier", signature: "duration <amount> <unit>", description: "Sets how long an effect lasts. Applies to buffs, moodlets, and timed interactions. The value is converted to in-game Sim minutes during compilation.", xmlMapping: '<Tunable name="duration">value_in_minutes</Tunable>', examples: ["duration 2 hours", "duration 30 minutes", "duration 1 day"], relatedKeywords: ["gives", "buff", "hours", "minutes"], sinceVersion: "1.0" },
  { keyword: "chance", category: "modifier", signature: "chance <value> percent", description: "Sets the probability of an outcome or autonomous action. Values are 0-100. Used with outcome branches and autonomy weight calculations.", xmlMapping: '<Tunable name="weight">value</Tunable>', examples: ["chance 85 percent", "chance 15 percent", "autonomy chance 35 percent"], relatedKeywords: ["outcome", "autonomy", "percent"], sinceVersion: "1.0" },
  { keyword: "outcome", category: "effect", signature: "outcome <SUCCESS|FAILURE> chance <value> percent", description: "Defines a branch in the interaction result. Each outcome can have its own effects, loots, and animations.", xmlMapping: '<TunableTuple name="outcome"> \u2192 <Tunable name="type">', examples: ["outcome SUCCESS chance 85 percent", "outcome FAILURE chance 15 percent"], relatedKeywords: ["chance", "gives", "loot"], sinceVersion: "1.1" },
  { keyword: "autonomy", category: "modifier", signature: "autonomy chance <value> percent", description: "Controls how likely the game AI is to autonomously choose this interaction. Higher values mean Sims will perform this action more often without player direction.", xmlMapping: '<Tunable name="autonomy_weight">value</Tunable>', examples: ["autonomy chance 35 percent", "autonomy chance 0 percent"], relatedKeywords: ["targets", "chance", "requires"], sinceVersion: "1.0" },
  { keyword: "targets", category: "condition", signature: "targets <SIM|OBJECT> with <condition>", description: "Filters which Sims or objects can be the target of this interaction. Combines with relationship and trait tests.", xmlMapping: '<TunableList name="target_tests">', examples: ["targets SIM with friendship > 30", "targets OBJECT with tag COOKING"], relatedKeywords: ["requires", "with", "autonomy"], sinceVersion: "1.0" },
  { keyword: "conflicts_with", category: "modifier", signature: "conflicts_with trait <id>", description: "Prevents this trait from coexisting with another trait. If a Sim has the conflicting trait, this trait cannot be added.", xmlMapping: '<TunableList name="conflicting_traits"> \u2192 <Tunable>', examples: ["conflicts_with trait evil", "conflicts_with trait mean_spirited"], relatedKeywords: ["compatible_with", "trait"], sinceVersion: "1.0" },
  { keyword: "display_name", category: "meta", signature: 'display_name "<text>"', description: "Sets the human-readable name shown in the game UI. This text is automatically registered in the String Table (STBL) during compilation.", xmlMapping: '<Tunable name="display_name">STBL_HASH</Tunable>', examples: ['display_name "Friendly Hug"', 'display_name "Night Owl"'], relatedKeywords: ["description", "icon"], sinceVersion: "1.0" },
  { keyword: "description", category: "meta", signature: 'description "<text>"', description: "Sets the tooltip/description text shown when hovering over items in the game UI. Also auto-registered in STBL.", xmlMapping: '<Tunable name="description">STBL_HASH</Tunable>', examples: ['description "Give a warm, friendly hug"', 'description "This Sim loves the nightlife"'], relatedKeywords: ["display_name", "icon"], sinceVersion: "1.0" },
  { keyword: "category", category: "meta", signature: "category <TYPE>", description: "Assigns a classification type. For interactions: FRIENDLY, MEAN, ROMANTIC, MISCHIEF, FUN. For traits: PERSONALITY, EMOTIONAL, LIFESTYLE.", xmlMapping: '<Tunable name="category">TYPE</Tunable>', examples: ["category FRIENDLY", "category PERSONALITY", "category ROMANTIC"], relatedKeywords: ["interaction", "trait"], sinceVersion: "1.0" },
  { keyword: "loot", category: "effect", signature: 'loot "<loot_id>"', description: "Triggers a loot action, which is a pre-defined bundle of effects. Loots can grant buffs, change relationships, give objects.", xmlMapping: '<Tunable name="loot_action">loot_id</Tunable>', examples: ['loot "friendship_boost_small"', 'loot "career_promotion_check"'], relatedKeywords: ["gives", "outcome"], sinceVersion: "1.1" },
  { keyword: "age", category: "modifier", signature: "age <AGE_1> [AGE_2] [...]", description: "Restricts which Sim life stages can have this trait or perform this interaction. Valid ages: BABY, TODDLER, CHILD, TEEN, YOUNGADULT, ADULT, ELDER.", xmlMapping: '<TunableList name="ages"> \u2192 <TunableEnum>', examples: ["age TEEN YOUNGADULT ADULT ELDER", "age CHILD TEEN"], relatedKeywords: ["requires", "trait"], sinceVersion: "1.0" },
  { keyword: "not", category: "logic", signature: "not <condition>", description: "Negates a condition test. The following requirement must NOT be true for the interaction/effect to proceed.", xmlMapping: '<Tunable name="negate">True</Tunable>', examples: ["not requires trait evil", "not requires friendship > 80"], relatedKeywords: ["requires", "and", "or"], sinceVersion: "1.0" },
  { keyword: "icon", category: "meta", signature: "icon <resource_key>", description: "References an icon resource for UI display. The resource key maps to a PNG/DDS texture in the mod package.", xmlMapping: '<Tunable name="icon" type="ResourceKey">key</Tunable>', examples: ["icon friendly_hug_icon", "icon trait_night_owl_cas"], relatedKeywords: ["display_name", "description"], sinceVersion: "1.0" },
];

export const jpeDocCategories: Record<string, { label: string; color: string; bg: string }> = {
  declaration: { label: "DECLARATION", color: "#63B3ED", bg: "rgba(99,179,237,0.1)" },
  modifier: { label: "MODIFIER", color: "#A78BFA", bg: "rgba(139,92,246,0.1)" },
  condition: { label: "CONDITION", color: "#F6AD55", bg: "rgba(246,173,85,0.1)" },
  effect: { label: "EFFECT", color: "#48BB78", bg: "rgba(72,187,120,0.1)" },
  logic: { label: "LOGIC", color: "#FC8181", bg: "rgba(252,129,129,0.1)" },
  unit: { label: "UNIT", color: "#90CDF4", bg: "rgba(144,205,244,0.1)" },
  meta: { label: "META", color: "#CBD5E0", bg: "rgba(203,213,224,0.1)" },
};

export function tokenizeJpeLine(text: string): { text: string; type: JpeSyntaxToken }[] {
  if (!text.trim()) return [{ text, type: "plain" }];
  if (text.trimStart().startsWith("//") || text.trimStart().startsWith("#")) return [{ text, type: "comment" }];
  if (text.trimStart().startsWith("---") || text.trimStart().startsWith("===")) return [{ text, type: "section" }];
  const tokens: { text: string; type: JpeSyntaxToken }[] = [];
  const parts = text.split(/(\s+|[><=!:+\-]+|"[^"]*")/g).filter(p => p.length > 0);
  for (const part of parts) {
    if (/^\s+$/.test(part)) tokens.push({ text: part, type: "plain" });
    else if (part.startsWith('"') && part.endsWith('"')) tokens.push({ text: part, type: "string" });
    else if (jpeKeywords.has(part.toLowerCase())) tokens.push({ text: part, type: "keyword" });
    else if (jpeOperators.has(part)) tokens.push({ text: part, type: "operator" });
    else if (jpeUnits.has(part.toLowerCase())) tokens.push({ text: part, type: "unit" });
    else if (/^\d+(\.\d+)?$/.test(part)) tokens.push({ text: part, type: "number" });
    else if (/^[A-Z_][A-Z0-9_]*$/.test(part)) tokens.push({ text: part, type: "property" });
    else tokens.push({ text: part, type: "identifier" });
  }
  return tokens;
}

export const jpeSourceLines: JpeEditorLine[] = [
  { num: 1, text: "# \u2550\u2550\u2550 Friendly Hug Interaction \u2550\u2550\u2550", tokens: [], hint: "Section header", validationStatus: "valid" },
  { num: 2, text: "", tokens: [], validationStatus: "valid" },
  { num: 3, text: "interaction: hug_friend", tokens: [], hint: "Defines a new social interaction", validationStatus: "valid" },
  { num: 4, text: '  display_name "Friendly Hug"', tokens: [], validationStatus: "valid" },
  { num: 5, text: '  description "Give a warm, friendly hug"', tokens: [], validationStatus: "valid" },
  { num: 6, text: "  icon friendly_hug_icon", tokens: [], validationStatus: "valid" },
  { num: 7, text: "  category FRIENDLY", tokens: [], validationStatus: "valid" },
  { num: 8, text: "", tokens: [], validationStatus: "valid" },
  { num: 9, text: "  # Requirements", tokens: [], validationStatus: "valid" },
  { num: 10, text: "  requires friendship > 40", tokens: [], hint: "Minimum relationship score", validationStatus: "valid" },
  { num: 11, text: "  requires age TEEN or YOUNGADULT or ADULT or ELDER", tokens: [], validationStatus: "valid" },
  { num: 12, text: "  not requires trait evil", tokens: [], validationStatus: "valid" },
  { num: 13, text: "", tokens: [], validationStatus: "valid" },
  { num: 14, text: "  # Effects", tokens: [], validationStatus: "valid" },
  { num: 15, text: "  gives moodlet happy_small", tokens: [], hint: "Applies a buff to the Sim", validationStatus: "valid" },
  { num: 16, text: "    duration 2 hours", tokens: [], validationStatus: "valid" },
  { num: 17, text: "  gives friendship + 5 points", tokens: [], validationStatus: "valid" },
  { num: 18, text: "", tokens: [], validationStatus: "valid" },
  { num: 19, text: "  # Autonomy", tokens: [], validationStatus: "valid" },
  { num: 20, text: "  autonomy chance 35 percent", tokens: [], validationStatus: "valid" },
  { num: 21, text: "  targets SIM with friendship > 30", tokens: [], validationStatus: "valid" },
  { num: 22, text: "", tokens: [], validationStatus: "valid" },
  { num: 23, text: "  # Outcomes", tokens: [], validationStatus: "valid" },
  { num: 24, text: "  outcome SUCCESS chance 85 percent", tokens: [], warning: "Consider adding a failure animation reference", validationStatus: "warning", quickFix: { label: "Add animation ref", replacement: '  outcome SUCCESS chance 85 percent\n    animation "hug_success"' } },
  { num: 25, text: '    loot "friendship_boost_small"', tokens: [], validationStatus: "valid" },
  { num: 26, text: "  outcome FAILURE chance 15 percent", tokens: [], validationStatus: "valid" },
  { num: 27, text: "    gives moodlet embarrassed_small", tokens: [], validationStatus: "valid" },
  { num: 28, text: "    duration 1 hour", tokens: [], validationStatus: "valid" },
  { num: 29, text: "", tokens: [], validationStatus: "valid" },
  { num: 30, text: "# \u2550\u2550\u2550 Trait: Hugger \u2550\u2550\u2550", tokens: [], validationStatus: "valid" },
  { num: 31, text: "", tokens: [], validationStatus: "valid" },
  { num: 32, text: "trait: hugger_trait", tokens: [], hint: "Defines a new personality trait", validationStatus: "valid" },
  { num: 33, text: '  display_name "Hugger"', tokens: [], validationStatus: "valid" },
  { num: 34, text: '  description "This Sim loves giving hugs to everyone"', tokens: [], validationStatus: "valid" },
  { num: 35, text: "  category PERSONALITY", tokens: [], validationStatus: "valid" },
  { num: 36, text: "  age TEEN YOUNGADULT ADULT ELDER", tokens: [], validationStatus: "valid" },
  { num: 37, text: "  conflicts_with trait distant", tokens: [], validationStatus: "valid" },
  { num: 38, text: "  conflicts_with trait mean_spirited", tokens: [], validationStatus: "valid" },
  { num: 39, text: "", tokens: [], validationStatus: "valid" },
  { num: 40, text: "  # Trait bonuses", tokens: [], validationStatus: "valid" },
  { num: 41, text: "  gives skill charisma + 1", tokens: [], validationStatus: "valid" },
  { num: 42, text: "  gives hug_friend autonomy + 20 percent", tokens: [], validationStatus: "valid" },
  { num: 43, text: "", tokens: [], validationStatus: "valid" },
  { num: 44, text: "  # Passive buff", tokens: [], validationStatus: "valid" },
  { num: 45, text: "  buff: warm_aura", tokens: [], validationStatus: "valid" },
  { num: 46, text: '    display_name "Warm Presence"', tokens: [], validationStatus: "valid" },
  { num: 47, text: '    description "Feeling the love radiating outward"', tokens: [], validationStatus: "valid" },
  { num: 48, text: "    gives SOCIAL + 2", tokens: [], error: 'Unknown motive key "SOCIAL". Did you mean social_need?', validationStatus: "error", quickFix: { label: "Replace with social_need", replacement: "    gives social_need + 2" } },
].map(l => ({ ...l, tokens: tokenizeJpeLine(l.text) }));

export const xmlPreviewLines: XmlPreviewLine[] = [
  { num: 1, text: '<?xml version="1.0" encoding="utf-8"?>', type: "tag", indent: 0 },
  { num: 2, text: "<TuningRoot>", type: "tag", indent: 0 },
  { num: 3, text: "<!-- Generated from JPE: hug_friend interaction -->", type: "comment", indent: 1, sourceJpeLine: 3 },
  { num: 4, text: '<Instance i="interaction" s="hug_friend" n="interaction_hug_friend">', type: "tag", indent: 1, sourceJpeLine: 3 },
  { num: 5, text: '<TunableVariant name="interaction_type">', type: "attr", indent: 2 },
  { num: 6, text: '<Tunable name="display_name">0xABCD1234</Tunable>', type: "value", indent: 3, sourceJpeLine: 4 },
  { num: 7, text: '<Tunable name="display_name_text">Friendly Hug</Tunable>', type: "value", indent: 3 },
  { num: 8, text: '<Tunable name="description">0xABCD1235</Tunable>', type: "value", indent: 3, sourceJpeLine: 5 },
  { num: 9, text: '<Tunable name="icon">friendly_hug_icon</Tunable>', type: "value", indent: 3, sourceJpeLine: 6 },
  { num: 10, text: '<Tunable name="category">FRIENDLY</Tunable>', type: "value", indent: 3, sourceJpeLine: 7 },
  { num: 11, text: "", type: "tag", indent: 0 },
  { num: 12, text: "<!-- Requirements -->", type: "comment", indent: 3 },
  { num: 13, text: '<TunableList name="test_globals">', type: "attr", indent: 3, sourceJpeLine: 10 },
  { num: 14, text: "<TunableTuple>", type: "tag", indent: 4 },
  { num: 15, text: '<Tunable name="test">relationship_test</Tunable>', type: "value", indent: 5 },
  { num: 16, text: '<Tunable name="track">FRIENDSHIP</Tunable>', type: "value", indent: 5, sourceJpeLine: 10 },
  { num: 17, text: '<Tunable name="threshold">40</Tunable>', type: "value", indent: 5, sourceJpeLine: 10 },
  { num: 18, text: '<Tunable name="comparison">GREATER_THAN</Tunable>', type: "value", indent: 5 },
  { num: 19, text: "</TunableTuple>", type: "tag", indent: 4 },
  { num: 20, text: "</TunableList>", type: "tag", indent: 3 },
  { num: 21, text: "", type: "tag", indent: 0 },
  { num: 22, text: "<!-- Buffs/Moodlets -->", type: "comment", indent: 3, sourceJpeLine: 15 },
  { num: 23, text: '<TunableList name="outcome_actions">', type: "attr", indent: 3 },
  { num: 24, text: "<TunableTuple>", type: "tag", indent: 4, sourceJpeLine: 15 },
  { num: 25, text: '<Tunable name="buff_type">happy_small</Tunable>', type: "value", indent: 5, sourceJpeLine: 15 },
  { num: 26, text: '<Tunable name="duration">120</Tunable> <!-- 2 hours -->', type: "value", indent: 5, sourceJpeLine: 16 },
  { num: 27, text: "</TunableTuple>", type: "tag", indent: 4 },
  { num: 28, text: "</TunableList>", type: "tag", indent: 3 },
  { num: 29, text: "", type: "tag", indent: 0 },
  { num: 30, text: "<!-- Autonomy -->", type: "comment", indent: 3, sourceJpeLine: 20 },
  { num: 31, text: '<Tunable name="autonomy_weight">35</Tunable>', type: "value", indent: 3, sourceJpeLine: 20 },
  { num: 32, text: "</TunableVariant>", type: "tag", indent: 2 },
  { num: 33, text: "</Instance>", type: "tag", indent: 1 },
  { num: 34, text: "</TuningRoot>", type: "tag", indent: 0 },
];

export const jpeSuggestions = [
  { trigger: "inter", completion: "interaction:", desc: "Define a new interaction", icon: Zap, detail: "Top-level declaration block" },
  { trigger: "trait", completion: "trait:", desc: "Define a new trait", icon: Star, detail: "Personality trait declaration" },
  { trigger: "buff", completion: "buff:", desc: "Define a new buff/moodlet", icon: Heart, detail: "Temporary emotional state" },
  { trigger: "req", completion: "requires", desc: "Add a requirement test", icon: Shield, detail: "Prerequisite condition" },
  { trigger: "give", completion: "gives", desc: "Apply an effect/loot", icon: Sparkles, detail: "Outcome effect action" },
  { trigger: "dur", completion: "duration", desc: "Set time duration", icon: Clock, detail: "Time span modifier" },
  { trigger: "chan", completion: "chance", desc: "Set probability", icon: Activity, detail: "Percentage weight" },
  { trigger: "tar", completion: "targets", desc: "Define target filter", icon: Eye, detail: "Target Sim/Object test" },
  { trigger: "aut", completion: "autonomy", desc: "Configure AI behavior", icon: Cpu, detail: "NPC decision weight" },
  { trigger: "out", completion: "outcome", desc: "Define outcome branch", icon: GitBranch, detail: "Success/Failure path" },
  { trigger: "dis", completion: 'display_name ""', desc: "Set display name", icon: FileText, detail: "UI label string" },
  { trigger: "des", completion: 'description ""', desc: "Set description", icon: FileText, detail: "Tooltip text" },
  { trigger: "cat", completion: "category", desc: "Set category type", icon: Layers, detail: "Classification enum" },
  { trigger: "con", completion: "conflicts_with", desc: "Define trait conflict", icon: AlertTriangle, detail: "Mutual exclusion" },
];

export const jpeSyntaxColors: Record<JpeSyntaxToken, string> = {
  keyword: "#63B3ED", identifier: "#A78BFA", operator: "#FC8181", value: "#48BB78",
  string: "#F6AD55", comment: "#4A5568", section: "#90CDF4", property: "#E2E8F0",
  number: "#48BB78", unit: "#90CDF4", error: "#FC8181", plain: "#A0AEC0",
};

/* ═══ GRAPH DATA ═══ */
export interface GraphNode {
  id: string; label: string; shortLabel: string; x: number; y: number; r: number;
  color: string; type: "primary" | "pack" | "mod" | "library" | "conflict";
  version: string; fileCount: number; size: string;
  status: "ok" | "warning" | "conflict" | "outdated"; description: string;
}

export interface GraphEdge {
  from: string; to: string; type: "dependency" | "conflict" | "optional" | "override"; label?: string;
}

export const graphNodes: GraphNode[] = [
  { id: "your_mod", label: "Your Mod \u2014 Hugger Trait Pack", shortLabel: "Your Mod", x: 480, y: 260, r: 36, color: T.cyan, type: "primary", version: "1.4.2", fileCount: 23, size: "2.4 MB", status: "ok", description: "Primary project. Adds Hugger personality trait, Friendly Hug interaction, and 3 associated buffs." },
  { id: "basegame", label: "Base Game Data", shortLabel: "BaseGame", x: 220, y: 140, r: 30, color: T.emerald, type: "pack", version: "1.106.148", fileCount: 14200, size: "1.2 GB", status: "ok", description: "Core Sims 4 tuning data. Required by all mods." },
  { id: "ep01", label: "Get to Work (EP01)", shortLabel: "EP01", x: 740, y: 140, r: 24, color: T.emerald, type: "pack", version: "1.106.148", fileCount: 3100, size: "340 MB", status: "ok", description: "Expansion pack. Adds active careers, retail system, aliens." },
  { id: "gp04", label: "Vampires (GP04)", shortLabel: "GP04", x: 480, y: 100, r: 20, color: T.emerald, type: "pack", version: "1.106.148", fileCount: 1800, size: "210 MB", status: "ok", description: "Game pack. Adds vampire life state." },
  { id: "mccc", label: "MC Command Center", shortLabel: "MCCC", x: 140, y: 340, r: 28, color: T.amber, type: "mod", version: "8.3.1", fileCount: 847, size: "18.6 MB", status: "warning", description: "Community framework mod. Outdated API calls detected." },
  { id: "ui_cheats", label: "UI Cheats Extension", shortLabel: "UI Cheats", x: 300, y: 400, r: 20, color: T.emerald, type: "mod", version: "2.14", fileCount: 42, size: "890 KB", status: "ok", description: "Adds cheat shortcuts to the UI." },
  { id: "ww", label: "WickedWhims", shortLabel: "WW", x: 680, y: 380, r: 26, color: T.rose, type: "conflict", version: "180a", fileCount: 2300, size: "56 MB", status: "conflict", description: "CONFLICT: Overrides trait_Evil tuning at Instance 0x034AEECB." },
  { id: "s4s_lib", label: "Sims4Studio Libraries", shortLabel: "S4S Lib", x: 820, y: 300, r: 18, color: T.violet, type: "library", version: "3.1.6", fileCount: 156, size: "4.2 MB", status: "ok", description: "Shared utility library." },
  { id: "stbl_helper", label: "STBL Helper", shortLabel: "STBL", x: 360, y: 180, r: 16, color: T.violet, type: "library", version: "2.0.4", fileCount: 12, size: "340 KB", status: "ok", description: "String table management utility." },
  { id: "tmex", label: "Trait Manager EX", shortLabel: "TMEX", x: 580, y: 440, r: 22, color: T.cyanBright, type: "mod", version: "1.2.0", fileCount: 68, size: "1.8 MB", status: "ok", description: "Extended trait management." },
  { id: "bbc", label: "Better Build/Buy", shortLabel: "BB+", x: 160, y: 220, r: 16, color: T.emerald, type: "mod", version: "3.7", fileCount: 312, size: "5.4 MB", status: "ok", description: "Build mode enhancement." },
  { id: "lms", label: "Lumpinou's Mods Suite", shortLabel: "LMS", x: 840, y: 180, r: 18, color: T.emerald, type: "mod", version: "4.2.1", fileCount: 420, size: "8.1 MB", status: "ok", description: "Relationship system overhaul. Compatible." },
];

export const graphEdges: GraphEdge[] = [
  { from: "your_mod", to: "basegame", type: "dependency", label: "Core Tuning" },
  { from: "your_mod", to: "ep01", type: "optional", label: "Career Hooks" },
  { from: "your_mod", to: "gp04", type: "optional", label: "Buff Compat" },
  { from: "your_mod", to: "stbl_helper", type: "dependency", label: "String Tables" },
  { from: "your_mod", to: "tmex", type: "dependency", label: "Trait API" },
  { from: "your_mod", to: "ww", type: "conflict", label: "ID Collision!" },
  { from: "your_mod", to: "s4s_lib", type: "dependency", label: "Package Utils" },
  { from: "mccc", to: "basegame", type: "dependency" },
  { from: "ui_cheats", to: "basegame", type: "dependency" },
  { from: "ww", to: "basegame", type: "dependency" },
  { from: "ww", to: "ep01", type: "optional" },
  { from: "s4s_lib", to: "basegame", type: "dependency" },
  { from: "tmex", to: "basegame", type: "dependency" },
  { from: "tmex", to: "stbl_helper", type: "dependency" },
  { from: "mccc", to: "ui_cheats", type: "optional" },
  { from: "bbc", to: "basegame", type: "dependency" },
  { from: "lms", to: "basegame", type: "dependency" },
  { from: "lms", to: "ep01", type: "optional" },
  { from: "your_mod", to: "mccc", type: "optional", label: "Settings API" },
];

/* ═══ CONFLICT FILES ═══ */
export interface ConflictRegion {
  id: string; startLine: number; endLine: number;
  type: "conflict" | "warning" | "info"; description: string;
  resolved?: "left" | "right" | "merged" | "disabled";
}

export interface ConflictFile {
  id: string; filename: string;
  leftMod: { name: string; version: string; author: string; color: string };
  rightMod: { name: string; version: string; author: string; color: string };
  leftLines: { num: number; text: string; type: "tag" | "attr" | "value" | "comment" | "empty" }[];
  rightLines: { num: number; text: string; type: "tag" | "attr" | "value" | "comment" | "empty" }[];
  conflicts: ConflictRegion[];
  severity: "critical" | "major" | "minor";
  resource: string; instance: string;
}

export const conflictFiles: ConflictFile[] = [
  {
    id: "cf1", filename: "S4_034AEECB_trait_Evil.xml",
    leftMod: { name: "Hugger Trait Pack", version: "1.4.2", author: "JPE_Dev", color: T.cyan },
    rightMod: { name: "WickedWhims", version: "180a", author: "TURBODRIVER", color: T.rose },
    severity: "critical", resource: "Trait Tuning", instance: "0x034AEECB",
    leftLines: [
      { num: 1, text: '<?xml version="1.0" encoding="utf-8"?>', type: "tag" }, { num: 2, text: '<I c="Trait" i="trait_Evil" m="traits.traits"', type: "tag" }, { num: 3, text: '   n="trait_Evil" s="034AEECB">', type: "attr" }, { num: 4, text: "", type: "empty" },
      { num: 5, text: "  <!-- Hugger Trait: Friendship boost override -->", type: "comment" }, { num: 6, text: '  <T n="display_name">0x1A2B3C4D</T>', type: "attr" }, { num: 7, text: '  <T n="trait_type">PERSONALITY</T>', type: "value" }, { num: 8, text: '  <T n="ages">TEEN YOUNGADULT ADULT ELDER</T>', type: "value" },
      { num: 9, text: "", type: "empty" }, { num: 10, text: '  <L n="buffs_add_on_apply">', type: "tag" }, { num: 11, text: '    <V t="buff_ref">', type: "tag" }, { num: 12, text: '      <T n="buff_type">buff_Friendly_Hugger</T>', type: "value" }, { num: 13, text: '      <T n="buff_reason">0xABCD1234</T>', type: "value" },
      { num: 14, text: "    </V>", type: "tag" }, { num: 15, text: "  </L>", type: "tag" }, { num: 16, text: "", type: "empty" }, { num: 17, text: '  <T n="social_skill_gain_mult">1.35</T>', type: "value" }, { num: 18, text: '  <T n="friendship_decay_rate">0.65</T>', type: "value" }, { num: 19, text: '  <T n="mood_weight">POSITIVE</T>', type: "value" },
      { num: 20, text: "", type: "empty" }, { num: 21, text: "  <!-- Interaction whitelist -->", type: "comment" }, { num: 22, text: '  <L n="interactions_add">', type: "tag" }, { num: 23, text: "    <T>interaction_FriendlyHug</T>", type: "value" }, { num: 24, text: "    <T>interaction_ComfortTalk</T>", type: "value" }, { num: 25, text: "  </L>", type: "tag" }, { num: 26, text: "</I>", type: "tag" },
    ],
    rightLines: [
      { num: 1, text: '<?xml version="1.0" encoding="utf-8"?>', type: "tag" }, { num: 2, text: '<I c="Trait" i="trait_Evil" m="traits.traits"', type: "tag" }, { num: 3, text: '   n="trait_Evil" s="034AEECB">', type: "attr" }, { num: 4, text: "", type: "empty" },
      { num: 5, text: "  <!-- WW: Override trait behavior system -->", type: "comment" }, { num: 6, text: '  <T n="display_name">0x9F8E7D6C</T>', type: "attr" }, { num: 7, text: '  <T n="trait_type">PERSONALITY</T>', type: "value" }, { num: 8, text: '  <T n="ages">YOUNGADULT ADULT</T>', type: "value" },
      { num: 9, text: "", type: "empty" }, { num: 10, text: '  <L n="buffs_add_on_apply">', type: "tag" }, { num: 11, text: '    <V t="buff_ref">', type: "tag" }, { num: 12, text: '      <T n="buff_type">buff_WW_Attraction</T>', type: "value" }, { num: 13, text: '      <T n="buff_reason">0xWW001122</T>', type: "value" },
      { num: 14, text: "    </V>", type: "tag" }, { num: 15, text: "  </L>", type: "tag" }, { num: 16, text: "", type: "empty" }, { num: 17, text: '  <T n="social_skill_gain_mult">1.00</T>', type: "value" }, { num: 18, text: '  <T n="friendship_decay_rate">1.00</T>', type: "value" }, { num: 19, text: '  <T n="mood_weight">NEUTRAL</T>', type: "value" },
      { num: 20, text: "", type: "empty" }, { num: 21, text: "  <!-- WW interaction injections -->", type: "comment" }, { num: 22, text: '  <L n="interactions_add">', type: "tag" }, { num: 23, text: "    <T>interaction_WW_Flirt_Override</T>", type: "value" }, { num: 24, text: "    <T>interaction_WW_Attraction_Check</T>", type: "value" }, { num: 25, text: "  </L>", type: "tag" }, { num: 26, text: "</I>", type: "tag" },
    ],
    conflicts: [
      { id: "c1", startLine: 5, endLine: 6, type: "conflict", description: "Display name hash collision \u2014 both mods assign different STBL keys" },
      { id: "c2", startLine: 8, endLine: 8, type: "warning", description: "Age range difference \u2014 Your Mod includes TEEN & ELDER, WW restricts to YA & Adult" },
      { id: "c3", startLine: 10, endLine: 15, type: "conflict", description: "Buff injection conflict \u2014 completely different buff systems applied to same trait" },
      { id: "c4", startLine: 17, endLine: 19, type: "conflict", description: "Stat multiplier values diverge \u2014 Hugger boosts social, WW resets to defaults" },
      { id: "c5", startLine: 22, endLine: 25, type: "conflict", description: "Interaction list override \u2014 incompatible interaction registrations" },
    ],
  },
  {
    id: "cf2", filename: "S4_0904DF10_buff_Energized.xml",
    leftMod: { name: "Hugger Trait Pack", version: "1.4.2", author: "JPE_Dev", color: T.cyan },
    rightMod: { name: "MCCC", version: "8.3.1", author: "Deaderpool", color: T.amber },
    severity: "minor", resource: "Buff Tuning", instance: "0x0904DF10",
    leftLines: [
      { num: 1, text: '<?xml version="1.0" encoding="utf-8"?>', type: "tag" }, { num: 2, text: '<I c="Buff" i="buff_Energized" m="buffs.buffs"', type: "tag" }, { num: 3, text: '   n="buff_Energized" s="0904DF10">', type: "attr" },
      { num: 4, text: '  <T n="buff_duration">240</T>', type: "value" }, { num: 5, text: '  <T n="visible">True</T>', type: "value" }, { num: 6, text: '  <T n="mood_type">mood_Energized</T>', type: "value" }, { num: 7, text: '  <T n="mood_weight">2</T>', type: "value" }, { num: 8, text: "</I>", type: "tag" },
    ],
    rightLines: [
      { num: 1, text: '<?xml version="1.0" encoding="utf-8"?>', type: "tag" }, { num: 2, text: '<I c="Buff" i="buff_Energized" m="buffs.buffs"', type: "tag" }, { num: 3, text: '   n="buff_Energized" s="0904DF10">', type: "attr" },
      { num: 4, text: '  <T n="buff_duration">480</T>', type: "value" }, { num: 5, text: '  <T n="visible">True</T>', type: "value" }, { num: 6, text: '  <T n="mood_type">mood_Energized</T>', type: "value" }, { num: 7, text: '  <T n="mood_weight">3</T>', type: "value" }, { num: 8, text: "</I>", type: "tag" },
    ],
    conflicts: [
      { id: "c6", startLine: 4, endLine: 4, type: "warning", description: "Duration mismatch \u2014 240 ticks vs 480 ticks" },
      { id: "c7", startLine: 7, endLine: 7, type: "info", description: "Weight differs \u2014 mood_weight 2 vs 3" },
    ],
  },
];

/* ═══ BUILD PIPELINE TEMPLATES ═══ */
export type StageStatus = "idle" | "running" | "success" | "failed" | "skipped";

export interface PipelineStage {
  id: string; name: string; shortName: string; icon: LucideIcon;
  status: StageStatus; progress: number; duration: number; targetDuration: number; artifacts: number;
  logs: { time: string; text: string; type: "info" | "success" | "warn" | "error" | "debug" }[];
}

export const stageTemplates: { id: string; name: string; shortName: string; icon: LucideIcon; targetDuration: number; artifacts: number;
  logs: { time: string; text: string; type: "info" | "success" | "warn" | "error" | "debug" }[];
}[] = [
  { id: "parse", name: "Parse Tuning XML", shortName: "PARSE", icon: FileCode, targetDuration: 1800, artifacts: 847, logs: [
    { time: "00:00.0", text: "Scanning project root: /Mods/HuggerTraitPack/", type: "info" }, { time: "00:00.1", text: "Located 14 tuning XML files in src/", type: "info" }, { time: "00:00.2", text: "Parsing S4_034AEECB_trait_Evil.xml \u2026 OK", type: "success" }, { time: "00:00.3", text: "Parsing S4_0904DF10_buff_Energized.xml \u2026 OK", type: "success" },
    { time: "00:00.4", text: "Parsing S4_1F3A2B4C_interaction_Hug.xml \u2026 OK", type: "success" }, { time: "00:00.5", text: "Parsing S4_2E4B3C5D_situation_FriendlyMeet.xml \u2026 OK", type: "success" }, { time: "00:00.6", text: "Parsing S4_3D5C4E6F_loot_SocialBoost.xml \u2026 OK", type: "success" },
    { time: "00:00.8", text: "Validating XML schema against EA tuning spec v1.108", type: "info" }, { time: "00:01.0", text: "Schema check: 14/14 files valid \u2014 0 errors, 2 warnings", type: "warn" }, { time: "00:01.2", text: "Building abstract syntax tree from 847 tuning nodes", type: "info" },
    { time: "00:01.4", text: "AST construction complete \u2014 847 nodes, 3,214 attributes", type: "success" }, { time: "00:01.6", text: "Indexing resource keys (Type/Group/Instance)\u2026", type: "debug" }, { time: "00:01.8", text: "Parse stage complete \u2014 14 files, 847 nodes processed", type: "success" },
  ]},
  { id: "translate", name: "JPE Translation Engine", shortName: "TRANSLATE", icon: Languages, targetDuration: 4200, artifacts: 2541, logs: [
    { time: "00:00.0", text: "Initializing JPE translation engine v3.2.1", type: "info" }, { time: "00:00.3", text: "Loading language packs: en_US, ja_JP, ko_KR, zh_CN, de_DE, fr_FR, es_ES, pt_BR", type: "info" }, { time: "00:00.8", text: "Loaded 8 language packs \u2014 2,541 string entries total", type: "success" },
    { time: "00:01.0", text: "Resolving STBL references from tuning AST\u2026", type: "info" }, { time: "00:01.5", text: "Found 317 translatable string references", type: "info" }, { time: "00:02.0", text: "Running AI translation pass for missing entries\u2026", type: "info" }, { time: "00:02.2", text: "ja_JP: 3 strings flagged for manual review (confidence < 85%)", type: "warn" },
    { time: "00:02.5", text: "ko_KR: all entries pass confidence threshold (avg 94.1%)", type: "success" }, { time: "00:02.8", text: "zh_CN: 1 string requires context disambiguation", type: "warn" }, { time: "00:03.2", text: "Generating STBL binary tables for each locale\u2026", type: "info" },
    { time: "00:03.5", text: "STBL compilation: 8 tables x 317 entries = 2,536 cells", type: "info" }, { time: "00:03.8", text: "Hash collision check: 0 collisions detected across all locales", type: "success" }, { time: "00:04.0", text: "String deduplication: saved 42 entries (13.2%)", type: "debug" }, { time: "00:04.2", text: "Translation stage complete \u2014 8 locales, 2,541 strings", type: "success" },
  ]},
  { id: "validate", name: "Validation & Lint", shortName: "VALIDATE", icon: Shield, targetDuration: 2800, artifacts: 0, logs: [
    { time: "00:00.0", text: "Starting validation pipeline (6 validators)", type: "info" }, { time: "00:00.2", text: "[TuningValidator] Checking resource key uniqueness\u2026", type: "info" }, { time: "00:00.5", text: "[TuningValidator] 847 unique keys \u2014 no duplicates", type: "success" },
    { time: "00:00.8", text: "[RefValidator] Resolving cross-references\u2026", type: "info" }, { time: "00:01.0", text: "[RefValidator] 412 references resolved \u2014 2 soft warnings", type: "warn" }, { time: "00:01.2", text: "[DepValidator] Checking mod dependencies\u2026", type: "info" },
    { time: "00:01.5", text: "[DepValidator] BaseGame v1.108 OK | EP01 OK | GP04 OK", type: "success" }, { time: "00:01.6", text: "[DepValidator] MCCC v8.3.1: optional dep, minor API drift", type: "warn" }, { time: "00:01.8", text: "[ConflictScanner] Scanning for tuning overlaps\u2026", type: "info" },
    { time: "00:02.0", text: "[ConflictScanner] 2 potential conflicts detected (see Analysis)", type: "warn" }, { time: "00:02.2", text: "[JPELinter] Linting JPE grammar in 6 script files\u2026", type: "info" }, { time: "00:02.4", text: "[JPELinter] 0 errors, 4 style suggestions", type: "success" },
    { time: "00:02.6", text: "[SecurityAudit] Checking for unsafe Python injections\u2026", type: "info" }, { time: "00:02.8", text: "[SecurityAudit] All clear \u2014 0 security issues", type: "success" },
  ]},
  { id: "compile", name: "Compile & Optimize", shortName: "COMPILE", icon: Cpu, targetDuration: 3500, artifacts: 14, logs: [
    { time: "00:00.0", text: "Initializing TS4 Package compiler v2.4.0", type: "info" }, { time: "00:00.3", text: "Merging tuning XML with STBL binary data\u2026", type: "info" }, { time: "00:00.6", text: "Compiling trait tuning (4 files)\u2026", type: "info" },
    { time: "00:01.0", text: "Compiling buff tuning (3 files)\u2026", type: "info" }, { time: "00:01.3", text: "Compiling interaction tuning (5 files)\u2026", type: "info" }, { time: "00:01.6", text: "Compiling miscellaneous tuning (2 files)\u2026", type: "info" },
    { time: "00:01.8", text: "Resource compression: ZLIB level 6\u2026", type: "debug" }, { time: "00:02.0", text: "Compressed 14 resources: 2.4MB to 1.1MB (54% reduction)", type: "success" }, { time: "00:02.3", text: "Generating resource index table (DBPF header)\u2026", type: "info" },
    { time: "00:02.5", text: "Computing FNV-64 hashes for all resource entries\u2026", type: "debug" }, { time: "00:02.8", text: "Linking STBL entries to compiled tuning references\u2026", type: "info" }, { time: "00:03.0", text: "Dead code elimination: removed 3 unreferenced buffs", type: "debug" },
    { time: "00:03.3", text: "Optimization pass complete \u2014 saved 180KB", type: "success" }, { time: "00:03.5", text: "Compile stage complete \u2014 14 resources compiled", type: "success" },
  ]},
  { id: "package", name: "Package & Deploy", shortName: "PACKAGE", icon: Package, targetDuration: 2000, artifacts: 1, logs: [
    { time: "00:00.0", text: "Assembling DBPF v2.0 package file\u2026", type: "info" }, { time: "00:00.2", text: "Writing header: magic=DBPF, version=2.0, entries=22", type: "debug" }, { time: "00:00.4", text: "Writing resource entries to package body\u2026", type: "info" },
    { time: "00:00.6", text: "Appending 8 STBL tables (317 strings x 8 locales)", type: "info" }, { time: "00:00.8", text: "Appending 14 compiled tuning resources", type: "info" }, { time: "00:01.0", text: "Computing package checksum: SHA256=7f3a\u2026e91b", type: "debug" },
    { time: "00:01.2", text: "Package size: 1.14MB \u2014 within TS4 limits", type: "success" }, { time: "00:01.4", text: "Output: HuggerTraitPack_v1.4.2_build4219.package", type: "info" }, { time: "00:01.6", text: "Copying to: Documents/EA/The Sims 4/Mods/", type: "info" },
    { time: "00:01.8", text: "Generating build manifest (build_4219.json)\u2026", type: "debug" }, { time: "00:02.0", text: "Build #4219 complete \u2014 ready for testing", type: "success" },
  ]},
];
