import { QuillInstance } from '../types';
import { EditorContent } from '../../common/types';

export class QuillSerialization {
  private quill: QuillInstance;

  constructor(quill: QuillInstance) {
    this.quill = quill;
  }

  // Export to HTML
  exportHTML(): string {
    return this.quill.root.innerHTML;
  }

  // Export to Delta (Quill's native format)
  exportDelta(): any {
    return this.quill.getContents();
  }

  // Export to plain text
  exportText(): string {
    return this.quill.getText();
  }

  // Import from HTML
  importHTML(html: string): void {
    this.quill.clipboard.dangerouslyPasteHTML(html);
  }

  // Import from Delta
  importDelta(delta: any): void {
    this.quill.setContents(delta);
  }

  // Get current content in EditorContent format
  getContent(): EditorContent {
    return {
      format: 'quill',
      data: {
        delta: this.exportDelta(),
        html: this.exportHTML(),
        text: this.exportText()
      }
    };
  }

  // Set content from EditorContent format
  setContent(content: EditorContent): void {
    if (content.format === 'html' && typeof content.data === 'string') {
      this.importHTML(content.data);
    } else if (content.format === 'quill' && content.data?.delta) {
      this.importDelta(content.data.delta);
    } else {
      // Fallback to HTML if available
      if (content.data?.html) {
        this.importHTML(content.data.html);
      } else if (typeof content.data === 'string') {
        this.importHTML(content.data);
      }
    }
  }

  // Clear content
  clear(): void {
    this.quill.setContents([]);
  }
}