import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { ConfigList } from './components/ConfigList';

interface ConfigFileInfo {
  path: string;
  content: any;
}

interface ConfigFilesResponse {
  'config-files': Record<string, ConfigFileInfo>;
}

const App: React.FC = () => {
  const [configFiles, setConfigFiles] = useState<ConfigFilesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfigFiles = async() => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/config-files');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setConfigFiles(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch config files');
        console.error('Error fetching config files:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchConfigFiles();
  }, []);

  if (loading) {
    return (
      <div className="container">
        <div className="header">
          <h1>Dotfiles Web Config</h1>
          <p>Manage your configuration files with ease</p>
        </div>
        <div className="loading">Loading configuration files...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="header">
          <h1>Dotfiles Web Config</h1>
          <p>Manage your configuration files with ease</p>
        </div>
        <div className="error">
          <h3>Error loading configuration files</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Dotfiles Web Config</h1>
        <p>Manage your configuration files with ease</p>
      </div>

      <div className="card">
        <h2>Configuration Files</h2>
        {configFiles && <ConfigList configFiles={configFiles} />}
      </div>
    </div>
  );
};

// Mount the React app
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
