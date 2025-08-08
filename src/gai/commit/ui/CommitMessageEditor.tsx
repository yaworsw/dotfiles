import React, { useState } from 'react';
import { Box, Text, Newline } from 'ink';
import TextInput from 'ink-text-input';

interface CommitMessageEditorProps {
  commitMessage: string;
  onSave: (message: string) => void;
  onCancel: () => void;
}

const CommitMessageEditor: React.FC<CommitMessageEditorProps> = ({ 
  commitMessage, 
  onSave, 
  onCancel 
}) => {
  const [message, setMessage] = useState(commitMessage);

  const handleSubmit = () => {
    onSave(message);
  };

  const handleKeyPress = (input: string, key: any) => {
    if (key.return) {
      handleSubmit();
    } else if (key.escape) {
      onCancel();
    }
  };

  return (
    <Box flexDirection="column">
      <Text color="yellow" bold>Edit Commit Message:</Text>
      <Newline />
      <Text color="gray">Press Enter to save, Escape to cancel</Text>
      <Newline />
      <Box borderStyle="round" borderColor="gray" paddingX={1}>
        <TextInput
          value={message}
          onChange={setMessage}
          onSubmit={handleSubmit}
          onKeyPress={handleKeyPress}
          placeholder="Enter your commit message..."
        />
      </Box>
      <Newline />
      <Text color="gray">Tip: Use Ctrl+C to cancel</Text>
    </Box>
  );
};

export { CommitMessageEditor };
