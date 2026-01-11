import { getEditorInstance } from '@/components/editor/MonacoEditor';

/**
 * CURSOR CONTROLLER
 * 
 * Handles cursor movement, selection, and editing via gamepad inputs.
 * Interfaces with the Monaco Editor instance.
 */
export class CursorController {
  private static instance: CursorController;
  private editorId: string = 'current';

  private constructor() {}

  static getInstance(): CursorController {
    if (!CursorController.instance) {
      CursorController.instance = new CursorController();
    }
    return CursorController.instance;
  }

  /**
   * Move cursor relative to current position
   */
  moveCursorBy(lines: number, chars: number): void {
    const editor = getEditorInstance(this.editorId);
    if (!editor) return;

    const position = editor.getPosition();
    if (!position) return;

    const newPosition = {
      lineNumber: Math.max(1, position.lineNumber + lines),
      column: Math.max(1, position.column + chars)
    };

    editor.setPosition(newPosition);
    editor.revealPositionInCenterIfOutsideViewport(newPosition);
  }

  /**
   * Select current word at cursor
   */
  selectWord(): void {
    const editor = getEditorInstance(this.editorId);
    if (!editor) return;

    const model = editor.getModel();
    const position = editor.getPosition();
    if (!model || !position) return;

    const word = model.getWordAtPosition(position);
    if (word) {
      editor.setSelection({
        startLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endLineNumber: position.lineNumber,
        endColumn: word.endColumn
      });
    }
  }

  /**
   * Delete character at cursor (Backspace equivalent)
   */
  deleteCharacter(): void {
    const editor = getEditorInstance(this.editorId);
    if (!editor) return;

    // Trigger backspace command
    editor.trigger('gamepad', 'deleteLeft', {});
  }

  /**
   * Delete word at cursor
   */
  deleteWord(): void {
    const editor = getEditorInstance(this.editorId);
    if (!editor) return;

    // Trigger delete word left command
    editor.trigger('gamepad', 'deleteWordLeft', {});
  }

  /**
   * Undo last action
   */
  undo(): void {
    const editor = getEditorInstance(this.editorId);
    if (!editor) return;
    editor.trigger('gamepad', 'undo', {});
  }

  /**
   * Redo last action
   */
  redo(): void {
    const editor = getEditorInstance(this.editorId);
    if (!editor) return;
    editor.trigger('gamepad', 'redo', {});
  }

  /**
   * Indent current line or selection
   */
  indent(): void {
    const editor = getEditorInstance(this.editorId);
    if (!editor) return;
    editor.trigger('gamepad', 'editor.action.indentLines', {});
  }

  /**
   * Outdent current line or selection
   */
  outdent(): void {
    const editor = getEditorInstance(this.editorId);
    if (!editor) return;
    editor.trigger('gamepad', 'editor.action.outdentLines', {});
  }
}
