import SectionTitle from './SectionTitle';
import ButtonLink from '../ui/ButtonLink';
import MarkdownRenderer from '../ui/MarkdownRenderer';

interface FilesViewProps {
  files: string;
  new_files: File[];
  deleted_files: string,
  placeholder?: string;
  canEdit: boolean;
  onEdit: () => void; // Define the onEdit prop as a function
}


const FilesToMarkdown = (input: string): [string, string, number] => {
  let count = 0;
  if (typeof input !== 'string' || !input.trim()) {
    return ['', 'text-gray-800', 0]; // Return blank if the input is not a string or is blank
  }

  const items = input.split(',').map(item => item.trim().replace(/^"|"$/g, ''));
  let markdown = '';
  items.forEach((item, index) => {
    markdown += `${index + 1}. ${item}\n`;
    count++
  });
  return [markdown.trim(), 'text-gray-800', count];
};

const NewFilesToMarkdown = (newFiles: File[], count: number): [string, string, number] => {
  if (newFiles.length == 0) {
    return ['', 'text-blue-700', 0]; // Return blank if the input is not a string or is blank
  }

  // Function to convert a File array to a markdown string
  let markdown = '';
  newFiles.forEach((file, index) => {
    markdown += `${count + index + 1}. ${file.name}\n`;
  });
  return [markdown.trim(), 'text-blue-700', newFiles.length];
};


const FilesView: React.FC<FilesViewProps> = ({
  files,
  new_files,
  deleted_files,
  placeholder,
  canEdit,
  onEdit,
}) => {

  // Function to convert a comma-delimited string to a array of string
  const files_arr: string[] = files ? files.split(',').map(file => file.trim().replace(/^"|"$/g, '')) : [];
  const deleted_files_arr: string[] = deleted_files ? deleted_files.split(',').map(file => file.trim().replace(/^"|"$/g, '')) : [];

  return (
    <div className="flex flex-col">
      <div className="flex space-x-4 items-center">
        <SectionTitle>Files:</SectionTitle>
        {canEdit && 
          <ButtonLink size="text-md" onClick={onEdit}>
            edit
          </ButtonLink>
        }
      </div>
      <div>
         {/* The message line */}
        {placeholder ? (
         <div className="text-base text-gray-400">{placeholder}</div> 
        ) :
        !files && new_files.length == 0 ? (
          <div className="text-base text-gray-800">No files have been uploaded for this event.</div>
        ) : (
          <div className="text-base text-gray-800 mb-4">The following are the files:</div>
        )}
        <div className="flex flex-col">
         {/* loop through files object */}
         { files_arr.map((file, index) => {
          const isDeleted: boolean = deleted_files_arr.includes(file);
          if(isDeleted) {
            return (
              <div key={index} className="px-2 text-base text-blue-700 line-through">
                {index+1}. {file}
              </div>
            )  
          }
          else {
          return (
            <div key={index} className="px-2 text-base text-gray-800">
              {index+1}. {file}
            </div>
          )
        }
         })}
         { new_files.map((file, index) => {
          return (
            <div key={index} className="px-2 text-base text-blue-700">
              {files_arr.length + index + 1 }. {file.name}
            </div>  
          )
         })}
         </div>
      </div>
    </div>
  );
};

export default FilesView;
