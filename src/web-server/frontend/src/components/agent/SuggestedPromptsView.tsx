import SectionTitle from './SectionTitle';
import ButtonLink from '../ui/ButtonLink';
import MarkdownRenderer from '../ui/MarkdownRenderer';


interface SuggestedPromptsViewProps {
  data: string;
  value: string;
  placeholder?: string;
  canEdit: boolean;
  onEdit: () => void; // Define the onEdit prop as a function
}

  // Function to convert a comma-delimited string to a markdown string
const commaDelimitedStringToMarkdown = (input: string): string => {
  if (typeof input !== 'string' || !input.trim()) {
    return 'No suggested prompts have been set'; // Return blank if the input is not a string or is blank
  }
  
  const items = input.split(',').map(item => item.trim().replace(/^"|"$/g, ''));
  let markdown = 'The following are your suggested prompts:\n\n';
  items.forEach((item, index) => {
    markdown += `${index + 1}. ${item}\n`;
  });
  return markdown.trim();
};
const SuggestedPromptsView: React.FC<SuggestedPromptsViewProps> = ({
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
      return [placeholder || "", "text-gray-400"];
    }
  };
  // store the md text
  const [mdtext, mdcolor] = getTextAndColor(data, value, placeholder);
  const newmdtext: string = commaDelimitedStringToMarkdown(mdtext);

  return (
    <div className="flex flex-col">
      <div className="flex space-x-4 items-center">
        <SectionTitle>Suggested Prompts:</SectionTitle>
        { canEdit && 
          <ButtonLink size="text-md" onClick={onEdit}>
            edit
          </ButtonLink>
        }
      </div>
      <MarkdownRenderer content={newmdtext} baseTextColor={mdcolor} />
    </div>
  );
};

export default SuggestedPromptsView;
