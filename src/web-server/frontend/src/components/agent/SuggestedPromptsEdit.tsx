import { useState, useEffect, FormEvent, ChangeEvent } from 'react';

import Card from '../ui/Card';
import Title from '../ui/Title';
import InputText from '../ui/InputText';
import InfoBlock from '../ui/InfoBlock';
import ErrorBlock from '../ui/ErrorBlock';
import ButtonFilled from '../ui/ButtonFilled';
import { HiArrowLeft, HiArrowRight } from 'react-icons/hi';

interface SuggestedPromptsEditProps {
  value: string;
  prev: string | null;
  next: string | null;
  onSuccess: (value: string, field: string | null) => void;
}

const SuggestedPromptsEdit: React.FC<SuggestedPromptsEditProps> = ({
  value,
  prev,
  next,
  onSuccess,
}) => {
  // Define state variables for prompts
  const [prompts, setPrompts] = useState<string[]>(['', '', '']); // Initial empty prompts

  const [error, setError] = useState<string | null>(null);

  const info = 'Use different prompt styles to indicate agent\'s capabilities';

  // All handler converters
  const processInputs = (field: string | null) => {
    // convert promps array to string
    const prompts_str: string = arrayToCommaDelimitedString(prompts);
    onSuccess(prompts_str, field);

  }

  // Handler for DONE
  const handleSubmit = (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    processInputs('');
  };

  // Handler for PREV field
  const handlePrev = () => {
    processInputs(prev);
  };

  // Handler for NEXT field
  const handleNext = () => {
    processInputs(next);
  };

  // function to split string to array
  const commaDelimitedStringToArray = (input: string): string[] => {
    return input
      .split(',')
      .map(item => item.trim())  // Trim leading/trailing spaces
      .filter(item => item !== '');  // Ignore blank elements
  }

  // function to split array into string
  const arrayToCommaDelimitedString = (input: string[]): string => {
    return input
      .filter(item => item.trim() !== '')  // Ignore blank elements
      .map(item => item.replace(/"/g, '\\"'))  // Escape double quotes
      .join(', ');
  };


  useEffect(() => {
    const prompts_arr = commaDelimitedStringToArray(value);
    const newPrompts = [...prompts]; // Copy the current state
    prompts_arr.forEach((value, index) => {
      if (index < newPrompts.length) {
        newPrompts[index] = value; // Update the corresponding state
      }
    });
    setPrompts(newPrompts); // Set the updated prompts array
  }, [])

  // Handle change event for an input
  const handlePromptChange = (index: number) => (e: ChangeEvent<HTMLInputElement>) => {
    const newPrompts = [...prompts];  // Copy current prompts state
    newPrompts[index] = e.target.value;  // Update the specific index with the new value
    setPrompts(newPrompts);  // Update the state with the new prompts array
  };

  return (
    <Card>
      <div className="w-full max-w-lg">
        <div className="flex w-full gap-4 items-center mb-4">
          {prev ? (
            <HiArrowLeft
              className="text-xl font-medium text-blue-500 cursor-pointer"
              title={prev}
              onClick={handlePrev}
            />
          ) : (
            ''
          )}
          <div className="flex-1 justify-center">
            <Title className="mb-0">Suggested Prompts</Title>
          </div>
          {next && (
            <HiArrowRight
              className="text-xl font-medium text-blue-500 cursor-pointer"
              onClick={handleNext}
              title={next}
            />
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <InputText
              id="prompt1"
              label="Prompt #1"
              value={prompts[0]}
              onChange={handlePromptChange(0)}
            />
            <InputText
              id="prompt2"
              label="Prompt #2"
              value={prompts[1]}
              onChange={handlePromptChange(1)}
            />
            <InputText
              id="prompt3"
              label="Prompt #3"
              value={prompts[2]}
              onChange={handlePromptChange(2)}
            />
          </div>
          <InfoBlock>{info}</InfoBlock>
          {error && <ErrorBlock>{error}</ErrorBlock>}
          <div className="flex justify-between gap-4 items-center">
            <div className="w-1/3 text-left flex space-x-2 font-medium text-gray-500"></div>
            <div className="w-1/3 text-center">
              <ButtonFilled type="submit">Done</ButtonFilled>
            </div>
            <div className="w-1/3 text-right flex space-x-2 font-medium text-gray-500"></div>
          </div>
        </form>
      </div>
    </Card>
  );
};

export default SuggestedPromptsEdit;
