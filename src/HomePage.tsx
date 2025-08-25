import React from 'react'

const HomePage: React.FC = () => {
  const editors = [
    { name: 'Slate.js', path: '/slate', status: 'implemented', features: 'Full formatting, lists, headings, keyboard shortcuts' },
    { name: 'Quill.js', path: '/quill', status: 'implemented', features: 'Full formatting, lists, headings, code blocks, mentions, keyboard shortcuts' },
    { name: 'Lexical', path: '/lexical', status: 'planned', features: 'Coming soon' },
    { name: 'Draft.js', path: '/draft', status: 'planned', features: 'Coming soon' },
  ]

  return (
    <div style={{ 
      padding: '40px', 
      maxWidth: '800px', 
      margin: '0 auto',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h1>Rich Text Editor Playground</h1>
      <p>Select an editor to test:</p>
      
      <div style={{ 
        display: 'grid', 
        gap: '20px', 
        marginTop: '30px',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))'
      }}>
        {editors.map(editor => (
          <div 
            key={editor.name}
            style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '20px',
              textAlign: 'center',
              cursor: editor.status === 'implemented' ? 'pointer' : 'not-allowed',
              opacity: editor.status === 'implemented' ? 1 : 0.5,
              transition: 'all 0.2s',
              ...(editor.status === 'implemented' && {
                ':hover': {
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  transform: 'translateY(-2px)'
                }
              })
            }}
            onClick={() => {
              if (editor.status === 'implemented') {
                window.location.href = `?editor=${editor.path.slice(1)}`
              }
            }}
          >
            <h3>{editor.name}</h3>
            <p style={{ 
              fontSize: '12px', 
              color: editor.status === 'implemented' ? 'green' : '#999',
              marginTop: '10px',
              marginBottom: '10px'
            }}>
              {editor.status === 'implemented' ? '✅ Ready' : '🚧 Coming Soon'}
            </p>
            <p style={{
              fontSize: '11px',
              color: '#666',
              lineHeight: '1.3'
            }}>
              {editor.features}
            </p>
          </div>
        ))}
      </div>
      
      <div style={{ marginTop: '40px', padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
        <h3>WebView Integration</h3>
        <p>When used in a WebView, pass the editor type as a query parameter:</p>
        <code style={{ 
          display: 'block', 
          marginTop: '10px', 
          padding: '10px', 
          background: '#333', 
          color: '#fff',
          borderRadius: '4px',
          fontFamily: 'monospace'
        }}>
          file:///path/to/index.html?editor=slate
        </code>
      </div>
    </div>
  )
}

export default HomePage