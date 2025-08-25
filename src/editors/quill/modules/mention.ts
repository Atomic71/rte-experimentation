import { MentionData } from '../types';

// Sample data for mentions
const sampleUsers: MentionData[] = [
  { id: '1', value: 'Alice Johnson', denotationChar: '@' },
  { id: '2', value: 'Bob Smith', denotationChar: '@' },
  { id: '3', value: 'Charlie Brown', denotationChar: '@' },
  { id: '4', value: 'Diana Prince', denotationChar: '@' },
  { id: '5', value: 'Edward Norton', denotationChar: '@' }
];

const sampleTags: MentionData[] = [
  { id: '1', value: 'react', denotationChar: '#' },
  { id: '2', value: 'javascript', denotationChar: '#' },
  { id: '3', value: 'typescript', denotationChar: '#' },
  { id: '4', value: 'quilljs', denotationChar: '#' },
  { id: '5', value: 'webview', denotationChar: '#' }
];

export const mentionConfig = {
  allowedChars: /^[A-Za-z\s]*$/,
  mentionDenotationChars: ["@", "#"],
  source: function(searchTerm: string, renderList: Function, mentionChar: string) {
    try {
      let values: MentionData[];
      
      if (mentionChar === "@") {
        values = sampleUsers;
      } else {
        values = sampleTags;
      }
      
      if (searchTerm.length === 0) {
        renderList(values, searchTerm);
      } else {
        const matches = values.filter(item => 
          item.value.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1
        );
        renderList(matches, searchTerm);
      }
    } catch (error) {
      console.warn('Mention search error:', error);
      renderList([], searchTerm);
    }
  }
};