import { useState, useRef, useEffect, FormEvent, ChangeEvent } from 'react';

import Card from '../ui/Card';
import SectionTitle from './SectionTitle';
import Title from '../ui/Title';
import InputText from '../ui/InputText';
import InfoBlock from '../ui/InfoBlock';
import ErrorBlock from '../ui/ErrorBlock';
import ButtonFilled from '../ui/ButtonFilled';
import { HiArrowLeft, HiArrowRight } from 'react-icons/hi';

interface NameEditProps {
  value: string;
  prev: string | null;
  next: string | null;
  onSuccess: (value: string, field: string | null) => void;
}

const NameEdit: React.FC<NameEditProps> = ({
  value,
  prev,
  next,
  onSuccess,
}) => {
  // ref to input field
  const inputRef = useRef<HTMLInputElement | null>(null);
  // states inside the form
  const [name, setName] = useState<string>(value);
  const [error, setError] = useState<string | null>(null);

  const info =
    'Keep the name meaningful and short. It should be unique and can contain only letters, digits, hyphen (-) and underscore (_). No spaces or decimal point.';

  // Handler for DONE
  const handleSubmit = (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    onSuccess(name, '');
  };

  // Handler for PREV field
  const handlePrev = () => {
    onSuccess(name, prev);
  };

  // Handler for NEXT field
  const handleNext = () => {
    onSuccess(name, next);
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
            <SectionTitle className="text-center">Agent Name</SectionTitle>
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
          <InputText
            ref={inputRef}
            id="name"
            label=""
            value={name}
            placeholder="e.g. policy-specialist"
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setName(e.target.value)
            }
            required
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

export default NameEdit;
