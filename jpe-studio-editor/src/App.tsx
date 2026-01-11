import React, { useState, useEffect } from 'react';
import Editor from './components/Editor';
import Sidebar from './components/Sidebar';
import PreviewPanel from './components/PreviewPanel';
import { mockJPEEngine } from './integration/jpe-engine-api';
import './App.css';

const App: React.FC = () => {
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [previewContent, setPreviewContent] = useState<string>('');
  const [isTransforming, setIsTransforming] = useState<boolean>(false);

  // Simulate loading a file
  useEffect(() => {
    // In a real implementation, this would come from file system or user action
    setFileContent(`# Example JPE file

interaction "Friendly Ask About Day":
  id: 123456789012345678
  target: Sim
  pie_menu: Friendly

  available_when:
    - actor is teen_or_older
    - target is not sleeping

  on_success:
    - apply buff "Happy +1" to target for 2h
`);
    setActiveFile('example.jpe');
  }, []);

  const handleContentChange = async (newContent: string) => {
    setFileContent(newContent);

    // Trigger transformation to XML
    setIsTransforming(true);
    try {
      const result = await mockJPEEngine.transformToXML(newContent);
      if (result.success && result.data) {
        setPreviewContent(result.data);
      } else if (result.error) {
        console.error('Transformation error:', result.error);
        setPreviewContent(`<!-- Error: ${result.error} -->`);
      }
    } catch (error) {
      console.error('Transformation error:', error);
      setPreviewContent(`<!-- Error: ${(error as Error).message} -->`);
    } finally {
      setIsTransforming(false);
    }
  };

  return (
    <div className="app">
      <Sidebar
        activeFile={activeFile}
        onFileOpen={() => {
          // In a real implementation, this would open a file dialog
          window.electronAPI.openFile();
        }}
      />
      <div className="main-content">
        <Editor
          content={fileContent}
          onChange={handleContentChange}
          fileName={activeFile || 'untitled.jpe'}
        />
        <PreviewPanel
          content={previewContent}
          isLoading={isTransforming}
        />
      </div>
    </div>
  );
};

export default App;