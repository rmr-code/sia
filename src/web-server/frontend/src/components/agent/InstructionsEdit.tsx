import { useState, useRef, useEffect, FormEvent, ChangeEvent } from 'react';

import Card from '../ui/Card';
import Title from '../ui/Title';
import InputTextArea from '../ui/InputTextarea';
import InfoBlock from '../ui/InfoBlock';
import ErrorBlock from '../ui/ErrorBlock';
import ButtonFilled from '../ui/ButtonFilled';
import { HiArrowLeft, HiArrowRight } from 'react-icons/hi';

interface InstructionsEditProps {
  value: string;
  prev: string | null;
  next: string | null;
  onSuccess: (instructions: string, direction: string | null) => void;
}

const InstructionsEdit: React.FC<InstructionsEditProps> = ({
  value,
  prev,
  next,
  onSuccess,
}) => {
  // ref to input field
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // states inside the form
  const [ins, setIns] = useState<string>(value);
  const [error, setError] = useState<string | null>(null);

  const info =
    'Instructions must be detailed and specific. The contents can include: role, task, setting boundaries, tone and style of reply, error handling etc';

  // Handler for DONE
  const handleSubmit = (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    onSuccess(ins, '');
  };

  // Handler for PREV field
  const handlePrev = () => {
    onSuccess(ins, prev);
  };

  // Handler for NEXT field
  const handleNext = () => {
    onSuccess(ins, next);
  };

  useEffect(() => {
    // Focus the input field when the component mounts
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

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
            <Title className="mb-0">Instructions</Title>
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
          <InputTextArea
            ref={inputRef}
            id="instructions"
            label=""
            value={ins}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              setIns(e.target.value)
            }
            rows={8}
          />
          <InfoBlock>{info}</InfoBlock>
          {error && <ErrorBlock>{error}</ErrorBlock>}
          <div className="flex flex-col justify-center items-center space-y-2">
            <ButtonFilled type="submit" width="auto">
              Done
            </ButtonFilled>
            <div className="text-xs text-gray-800 font-thin">
              Use arrow keys above to edit other fields
            </div>
          </div>
        </form>
      </div>
    </Card>
  );
};

export default InstructionsEdit;
