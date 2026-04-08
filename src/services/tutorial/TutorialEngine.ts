/**
 * TutorialEngine - Logic controller for interactive onboarding
 * Story 5.1: Interactive "My First Mod" Tutorial
 */

import { useUIStore } from '@/stores/useUIStore';
import { useProjectStore } from '@/stores/useProjectStore';
import { useEditorStore } from '@/stores/useEditorStore';
import { useBuildStore } from '@/stores/useBuildStore';
import { MY_FIRST_MOD_STEPS} from './types';
import { sensory } from '@/services/SensoryService';

export class TutorialEngine {
  private static instance: TutorialEngine;
  private unsubscribes: (() => void)[] = [];

  private constructor() {}

  public static getInstance(): TutorialEngine {
    if (!TutorialEngine.instance) {
      TutorialEngine.instance = new TutorialEngine();
    }
    return TutorialEngine.instance;
  }

  public start(): void {
    const { isTutorialActive, setTutorialStep: _setTutorialStep } = useUIStore.getState();
    if (!isTutorialActive) return;

    console.log('[TutorialEngine] Starting interactive mission logic...');

    // Subscribe to stores to watch for progress
    this.setupSubscriptions();
  }

  public stop(): void {
    this.unsubscribes.forEach(unsub => unsub());
    this.unsubscribes = [];
    console.log('[TutorialEngine] Interactive mission logic stopped.');
  }

  private setupSubscriptions(): void {
    // 1. Watch Project Store for "File Created"
    const unsubProject = useProjectStore.subscribe(
      (state) => state.currentProject?.files.length,
      (fileCount, prevFileCount) => {
        const { tutorialStep, isTutorialActive } = useUIStore.getState();
        if (!isTutorialActive) return;

        const currentStep = MY_FIRST_MOD_STEPS[tutorialStep];
        if (currentStep?.validationType === 'file_created' && (fileCount || 0) > (prevFileCount || 0)) {
          this.advanceStep('File materialized in the grid. Proceeding.');
        }
      }
    );

    // 2. Watch Editor Store for "Code Entered"
    const unsubEditor = useEditorStore.subscribe(
      (state) => state.editorContent,
      (contentMap) => {
        const { tutorialStep, isTutorialActive } = useUIStore.getState();
        const { activeTabId } = useEditorStore.getState();
        if (!isTutorialActive || !activeTabId) return;

        const currentStep = MY_FIRST_MOD_STEPS[tutorialStep];
        if (currentStep?.validationType === 'code_entered') {
          const content = contentMap[activeTabId] || '';
          if (content.toUpperCase().includes('WHEN')) {
             this.advanceStep('Logical directive detected. Synchronization complete.');
          }
        }
      }
    );

    // 3. Watch Build Store for "Project Built"
    const unsubBuild = useBuildStore.subscribe(
      (state) => state.buildStatus,
      (status) => {
        const { tutorialStep, isTutorialActive } = useUIStore.getState();
        if (!isTutorialActive) return;

        const currentStep = MY_FIRST_MOD_STEPS[tutorialStep];
        if (currentStep?.validationType === 'project_built' && status === 'completed') {
           const buildResult = useBuildStore.getState().results;
           if (buildResult && buildResult.totalErrors === 0) {
              this.advanceStep('Production bundle locked and loaded.');
           }
        }
      }
    );

    this.unsubscribes.push(unsubProject, unsubEditor, unsubBuild);
  }

  private advanceStep(logMessage: string): void {
    const { tutorialStep, setTutorialStep } = useUIStore.getState();
    console.log(`[TutorialEngine] ${logMessage}`);
    
    // Play subtle success chime
    sensory.triggerNotification();
    
    // Advance to next step
    if (tutorialStep < MY_FIRST_MOD_STEPS.length - 1) {
      setTutorialStep(tutorialStep + 1);
    }
  }

  /**
   * Helper to determine if the next button should be enabled
   */
  public static canManuallyAdvance(): boolean {
    const { tutorialStep } = useUIStore.getState();
    const currentStep = MY_FIRST_MOD_STEPS[tutorialStep];
    return !currentStep?.isInteractive;
  }
}
