import SectionTitle from './SectionTitle';
import ButtonLink from '../ui/ButtonLink';
import MarkdownRenderer from '../ui/MarkdownRenderer';

interface InstructionsViewProps {
  data: string;
  value: string;
  placeholder?: string;
  canEdit: boolean;
  onEdit: () => void; // Define the onEdit prop as a function
}

const InstructionsView: React.FC<InstructionsViewProps> = ({
  data,
  value,
  placeholder,
  canEdit,
  onEdit,
}) => {

  const getTextAndColor = (
    data: string,
    value: string,
    placeholder: string | undefined
  ): [string, string] => {
    if (data === value && data !== "") {
      return [data, "text-gray-800"];
    } else if (data !== value && value !== "") {
      return [value, "text-blue-700"];
    } else {
      return [placeholder || "No instructions to the model have been given", "text-gray-400"];
    }
  };
  
  const [mdtext, mdcolor] = getTextAndColor(data, value, placeholder);

  return (
    <div className="flex flex-col">
      <div className="flex space-x-4 items-center">
        <SectionTitle>Instructions to the model:</SectionTitle>
        {/* Call the onEdit prop when the ButtonLink is clicked */}
        { canEdit && 
          <ButtonLink size="text-md" onClick={onEdit}>
            edit
          </ButtonLink>
        }
      </div>
      <MarkdownRenderer content={mdtext} baseTextColor={mdcolor} />
    </div>
  );
};

export default InstructionsView;
