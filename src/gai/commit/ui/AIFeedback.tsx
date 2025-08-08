import React, { useState } from 'react';
import { Box, Text, Newline } from 'ink';
import TextInput from 'ink-text-input';

interface AIFeedbackProps {
  onFeedback: (feedback: string) => void;
  onCancel: () => void;
}

const AIFeedback: React.FC<AIFeedbackProps> = ({ onFeedback, onCancel }) => {
  const [feedback, setFeedback] = useState('');

  const handleSubmit = () => {
    if (feedback.trim()) {
      onFeedback(feedback.trim());
    }
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
      <Text color="magenta" bold>Give Feedback to AI:</Text>
      <Newline />
      <Text color="gray">Tell the AI how to improve the commit message</Text>
      <Newline />
      <Text color="gray">Examples:</Text>
      <Text color="gray">- "Make it more concise"</Text>
      <Text color="gray">- "Add more detail about the changes"</Text>
      <Text color="gray">- "Use a different tone"</Text>
      <Newline />
      <Box borderStyle="round" borderColor="gray" paddingX={1}>
        <TextInput
          value={feedback}
          onChange={setFeedback}
          onSubmit={handleSubmit}
          onKeyPress={handleKeyPress}
          placeholder="Enter your feedback..."
        />
      </Box>
      <Newline />
      <Text color="gray">Press Enter to submit, Escape to cancel</Text>
    </Box>
  );
};

export { AIFeedback };
