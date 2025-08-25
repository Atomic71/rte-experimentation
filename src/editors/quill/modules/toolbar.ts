export const toolbarConfig = [
  [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ 'color': [] }, { 'background': [] }],
  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
  [{ 'indent': '-1'}, { 'indent': '+1' }],
  ['link', 'code-block'],
  ['clean']
];

export const toolbarHandlers = {
  // Custom link handler
  link: function(this: any, value: boolean) {
    if (value) {
      const href = prompt('Enter the URL:');
      if (href) {
        this.quill.format('link', href);
      }
    } else {
      this.quill.format('link', false);
    }
  }
};