import Quill from 'quill';

export interface QuillEditorState {
  delta: any;
  html: string;
  text: string;
}

export interface MentionData {
  id: string;
  value: string;
  denotationChar: string;
}

export interface QuillModuleConfig {
  toolbar?: any;
  syntax?: any;
  mention?: any;
  keyboard?: any;
}

export interface QuillConfig {
  theme: string;
  modules: QuillModuleConfig;
  formats: string[];
  placeholder?: string;
  readOnly?: boolean;
}

export type QuillInstance = Quill;