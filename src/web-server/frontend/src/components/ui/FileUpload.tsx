import React, { useRef } from 'react';
import InfoBlock from './InfoBlock';

interface FileUploadProps {
  onFileUpload: (files: File[]) => void;
  accept: string;
  multiple?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileUpload,
  accept,
  multiple = true,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files);
    onFileUpload(droppedFiles);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const selectedFiles = Array.from(event.target.files);
      onFileUpload(selectedFiles);
    }
  };

  const handleFileDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy'; // Indicate that files can be copied
  };

  return (
    <div
      className="cursor-pointer file-upload-area border border-dashed border-gray-400 p-4 mt-4"
      onDrop={handleDrop}
      onDragOver={handleFileDragOver}
      onClick={() => fileInputRef.current?.click()}
    >
      <InfoBlock>Drag and drop files here, or click to upload</InfoBlock>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileUpload}
        multiple={multiple}
        accept={accept}
      />
    </div>
  );
};

export default FileUpload;
