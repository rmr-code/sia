import React, { useState, useCallback } from 'react';
import Card from '../ui/Card';
import Title from '../ui/Title';
import ErrorBlock from '../ui/ErrorBlock';
import ButtonFilled from '../ui/ButtonFilled';
import { HiArrowLeft, HiArrowRight, HiOutlineTrash } from 'react-icons/hi';
import FileUpload from '../ui/FileUpload';

interface FilesEditProps {
  files: string; // Comma-delimited string of original files
  new_files: File[]; // Array of new file objects
  deleted_files: string; // Comma-delimited string of deleted files
  prev: string | null;
  next: string | null;
  onSuccess: (new_files: File[], deleted_files: string, field: string | null) => void;
}

const FilesEdit: React.FC<FilesEditProps> = ({
  files,
  new_files,
  deleted_files,
  prev,
  next,
  onSuccess,
}) => {
  const [newFiles, setNewFiles] = useState<File[]>(new_files);
  const [deletedFiles, setDeletedFiles] = useState<string[]>(
    deleted_files ? deleted_files.split(',').map((file) => file.trim()) : []
  );

  const originalFilesArray = files ? files.split(',').map((file) => file.trim()) : [];

  // Helper function to check if file is in the deleted list
  const isDeleted = useCallback(
    (fileName: string) => deletedFiles.includes(fileName),
    [deletedFiles]
  );

  // Toggle file deletion (add/remove from deletedFiles)
  const toggleDeleteFile = useCallback(
    (fileName: string) => {
      setDeletedFiles((prev) =>
        prev.includes(fileName) ? prev.filter((file) => file !== fileName) : [...prev, fileName]
      );
    },
    [setDeletedFiles]
  );

  // Delete file from newFiles
  const handleDeleteNewFile = useCallback(
    (fileName: string) => {
      setNewFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
    },
    [setNewFiles]
  );

  // Add new files, ignoring duplicates
  const addFiles = useCallback(
    (filesToAdd: File[]) => {
      const filteredFiles = filesToAdd.filter(
        (file) =>
          !newFiles.some((newFile) => newFile.name === file.name) &&
          !originalFilesArray.includes(file.name)
      );
      setNewFiles((prevFiles) => [...prevFiles, ...filteredFiles]);
    },
    [newFiles, originalFilesArray]
  );

    // Handle file upload
    const handleFileUpload = useCallback(
      (uploadedFiles: File[]) => {
        addFiles(uploadedFiles);
      },
      [addFiles]
    );
  
  // Process inputs and call onSuccess
  const processInputs = useCallback(
    (field: string | null) => {
      const deletedFilesStr = deletedFiles.join(', ');
      onSuccess(newFiles, deletedFilesStr, field);
    },
    [deletedFiles, newFiles, onSuccess]
  );

  const handleSubmit = () => {
    processInputs(null);
  };

  const handlePrev = () => {
    processInputs(prev);
  };

  const handleNext = () => {
    processInputs(next);
  };

  return (
    <Card>
      <div className="w-full max-w-lg">
        <div className="flex w-full gap-4 items-center mb-4">
          {prev && (
            <HiArrowLeft
              className="text-xl font-medium text-blue-500 cursor-pointer"
              title={prev}
              onClick={handlePrev}
            />
          )}
          <div className="flex-1 text-center">
            <Title className="mb-0">Files</Title>
          </div>
          {next && (
            <HiArrowRight
              className="text-xl font-medium text-blue-500 cursor-pointer"
              onClick={handleNext}
              title={next}
            />
          )}
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="text-xl text-gray-800 font-semibold">Files</div>
            {originalFilesArray.length === 0 && newFiles.length === 0 && (
              <div className="text-base text-gray-400">No files uploaded</div>
            )}
            {originalFilesArray.map((fileName, index) => (
              <div
                key={fileName}
                className={`text-lg w-full flex items-center space-x-2 ${
                  isDeleted(fileName) ? 'line-through' : ''
                }`}
              >
                <span className="text-gray-400 font-semibold">{index + 1}.</span>
                <span className="text-gray-800 font-semibold">{fileName}</span>
                <span className="flex-1" />
                <HiOutlineTrash
                  className="cursor-pointer ml-2"
                  onClick={() => toggleDeleteFile(fileName)}
                />
              </div>
            ))}
            {newFiles.map((file, index) => (
              <div key={file.name} className="text-lg w-full flex items-center space-x-2">
                <span className="text-gray-400 font-semibold">
                  {originalFilesArray.length + index + 1}.
                </span>
                <span className="text-blue-700 font-semibold">{file.name}</span>
                <span className="flex-1" />
                <HiOutlineTrash
                  className="cursor-pointer ml-2"
                  onClick={() => handleDeleteNewFile(file.name)}
                />
              </div>
            ))}

            {/* Use the FileUpload component */}
            <FileUpload onFileUpload={handleFileUpload} accept=".txt,.pdf" />
          </div>

          <div className="flex justify-between gap-4 items-center">
            <div className="w-1/3 text-left" />
            <div className="w-1/3 text-center">
              <ButtonFilled type="button" onClick={handleSubmit}>
                Done
              </ButtonFilled>
            </div>
            <div className="w-1/3 text-right" />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default FilesEdit;