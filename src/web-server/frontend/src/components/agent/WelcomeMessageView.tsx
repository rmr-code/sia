import SectionTitle from './SectionTitle';
import ButtonLink from '../ui/ButtonLink';
import MarkdownRenderer from '../ui/MarkdownRenderer';

interface WelcomeMessageViewProps {
  data: string;
  value: string;
  placeholder?: string;
  canEdit: boolean;
  onEdit: () => void; // Define the onEdit prop as a function
}

const WelcomeMessageView: React.FC<WelcomeMessageViewProps> = ({
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
      return [placeholder || "No welcome message has been set", "text-gray-400"];
    }
  };
  
  const [mdtext, mdcolor] = getTextAndColor(data, value, placeholder);

  return (
    <div className="flex flex-col">
      <div className="flex space-x-4 items-center">
        <SectionTitle>Welcome Message:</SectionTitle>
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

export default WelcomeMessageView;
