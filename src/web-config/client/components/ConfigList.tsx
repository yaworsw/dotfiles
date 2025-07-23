import React, { useState } from 'react';

interface ConfigFileInfo {
  path: string;
  content: any;
}

interface ConfigFilesResponse {
  'config-files': Record<string, ConfigFileInfo>;
}

interface ConfigListProps {
  configFiles: ConfigFilesResponse;
}

export const ConfigList: React.FC<ConfigListProps> = ({ configFiles }) => {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const files = Object.entries(configFiles['config-files']);

  if (files.length === 0) {
    return (
      <div className="empty-state">
        <h3>No config files found</h3>
        <p>No JSON configuration files were found in your .dotfiles directory.</p>
      </div>
    );
  }

  return (
    <div className="config-list">
      {files.map(([key, fileInfo]) => (
        <div
          key={key}
          className="config-item"
          onClick={() => setSelectedFile(selectedFile === key ? null : key)}
        >
          <h3>{key}</h3>
          <div className="path">{fileInfo.path}</div>

          {selectedFile === key && (
            <div className="json-viewer">
              {JSON.stringify(fileInfo.content, null, 2)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
