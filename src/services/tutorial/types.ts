/**
 * Tutorial Types for JPE Studio
 * Story 5.1: Interactive "My First Mod" Tutorial
 */

export interface TutorialStep {
  id: string;
  title: string;
  content: string;
  anchorSelector?: string; // CSS selector for spotlighting
  isInteractive?: boolean; // If true, requires validation to proceed
  validationType?: 'file_created' | 'code_entered' | 'project_built' | 'none';
  nextButtonText?: string;
}

export const MY_FIRST_MOD_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Mission: My First Mod',
    content: 'Welcome to JPE Studio, recruit. Today you will build your very first Sims 4 mod using the Just Plain English (JPE) engine. Ready to ignite the grid?',
    nextButtonText: "Let's Go",
  },
  {
    id: 'create_file',
    title: 'Step 1: The Blueprint',
    content: 'Every mod starts with a blueprint. Click the "Add Files" button in the Project Explorer to create your first script file.',
    anchorSelector: '[data-tutorial="add-file-btn"]',
    isInteractive: true,
    validationType: 'file_created',
  },
  {
    id: 'write_jpe',
    title: 'Step 2: Command Entry',
    content: 'Now, let\'s tell the game what to do. Type "WHEN" into the editor. This is the foundation of every JPE reactive event.',
    anchorSelector: '[data-tutorial="editor-pane"]',
    isInteractive: true,
    validationType: 'code_entered',
  },
  {
    id: 'preview_xml',
    title: 'Step 3: The Ghost in the Machine',
    content: 'Look at the right panel. JPE Studio is translating your English into raw Sims 4 XML in real-time. This is where the magic happens.',
    anchorSelector: '[data-testid="right-panel-preview"]', // Need to ensure this exists
    nextButtonText: 'Understood',
  },
  {
    id: 'build_project',
    title: 'Step 4: Technical Ignition',
    content: 'It\'s time to finalize. Click the "Compile" button to package your logic into a production-ready mod bundle.',
    anchorSelector: '[data-tutorial="build-btn"]',
    isInteractive: true,
    validationType: 'project_built',
  },
  {
    id: 'success',
    title: 'Mission Accomplished',
    content: 'Congratulations! You\'ve successfully built and compiled your first mod. The grid is yours. Explore the manual for advanced JPE commands.',
    nextButtonText: 'Finish Mission',
  },
];
