import ButtonLink from '../ui/ButtonLink';

interface NameViewProps {
  data: string;
  value: string;
  placeholder?: string;
  className?: string; // Optional className
  canEdit: boolean;
  onEdit: () => void; // Define the onEdit prop as a function
}

const NameView: React.FC<NameViewProps> = ({
  data,
  value,
  placeholder,
  className,
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
  
  const [mdtext, mdcolor] = getTextAndColor(data, value, placeholder);

  return (
    <div className={`flex space-x-2 items-center ${className || ''}`}>
      <div className="text-2xl font-semibold text-gray-400">Agent:</div>
      <div className={`text-2xl font-medium ${mdcolor}`}>{mdtext}</div>
      {/* Call the onEdit prop when the ButtonLink is clicked */}
      {canEdit && !data && <ButtonLink size="px-2 text-md" onClick={onEdit}>edit </ButtonLink> }
    </div>
  );
};

export default NameView;
