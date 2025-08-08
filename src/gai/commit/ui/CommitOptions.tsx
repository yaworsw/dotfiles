import React from 'react';
import { Box, Text, Newline } from 'ink';
import SelectInput from 'ink-select-input';

interface CommitOptionsProps {
  commitMessage: string;
  onOptionSelect: (option: string) => void;
}

interface Option {
  label: string;
  value: string;
}

const CommitOptions: React.FC<CommitOptionsProps> = ({ commitMessage, onOptionSelect }) => {
  const options: Option[] = [
    { label: '✅ Commit with this message', value: 'commit' },
    { label: '✏️  Edit message manually', value: 'edit' },
    { label: '🤖 Give feedback to AI', value: 'feedback' },
    { label: '❌ Cancel', value: 'cancel' }
  ];

  const handleSelect = (option: Option) => {
    onOptionSelect(option.value);
  };

  return (
    <Box flexDirection="column">
      <Text color="green" bold>Generated Commit Message:</Text>
      <Newline />
      <Box borderStyle="round" borderColor="gray" paddingX={1}>
        <Text>{commitMessage}</Text>
      </Box>
      <Newline />
      <Text color="cyan">What would you like to do?</Text>
      <Newline />
      <SelectInput
        items={options}
        onSelect={handleSelect}
        indicatorComponent={({ isSelected }) => (
          <Text color={isSelected ? 'blue' : 'white'}>
            {isSelected ? '❯' : ' '}
          </Text>
        )}
        itemComponent={({ isSelected, label }) => (
          <Text color={isSelected ? 'blue' : 'white'}>
            {label}
          </Text>
        )}
      />
    </Box>
  );
};

export { CommitOptions };
