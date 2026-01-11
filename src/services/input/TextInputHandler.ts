import { getEditorInstance } from '@/components/editor/MonacoEditor';

/**
 * TEXT INPUT HANDLER
 * 
 * Handles character input and text manipulation via gamepad/virtual keyboard.
 */
export class TextInputHandler {
  private static instance: TextInputHandler;
  private editorId: string = 'current';

  private constructor() {}

  static getInstance(): TextInputHandler {
    if (!TextInputHandler.instance) {
      TextInputHandler.instance = new TextInputHandler();
    }
    return TextInputHandler.instance;
  }

  /**
   * Insert text at current cursor position
   */
  insertText(text: string): void {
    const editor = getEditorInstance(this.editorId);
    if (!editor) return;

    const selection = editor.getSelection();
    if (!selection) return;

    const range = {
      startLineNumber: selection.startLineNumber,
      startColumn: selection.startColumn,
      endLineNumber: selection.endLineNumber,
      endColumn: selection.endColumn
    };

    editor.executeEdits('gamepad-input', [
      {
        range,
        text,
        forceMoveMarkers: true
      }
    ]);
    
    editor.pushUndoStop();
  }

  /**
   * Insert a newline at current cursor position
   */
  insertNewline(): void {
    this.insertText('\n');
  }

  /**
   * Handle special XML character insertion
   */
  insertXmlTag(tagName: string, closed: boolean = false): void {
    const text = closed ? `<${tagName} />` : `<${tagName}>`;
    this.insertText(text);
  }
}
