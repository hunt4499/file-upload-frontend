import { Loader, LogOut, Upload } from "lucide-react";
import { useCallback, useState } from "react";

import FileCard from "./FileCard";
import axios from "../../lib/axios";

const DashboardLayout = ({ files, setFiles, showAlert, onLogout, isLoading }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleShare = async (fileId) => {
    try {
      const response = await axios(`/api/files/${fileId}/share`, {
        method: 'POST',
      });
      const updatedFile = await response.json();
      return updatedFile;
    } catch (error) {
      throw new Error('Failed to update share count');
    }
  };

  const validateFile = (file) => {
    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "video/mp4"];
    if (!allowedTypes.includes(file.type)) {
      showAlert("error", "Error", "Invalid file type");
      return false;
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      showAlert("error", "Error", "File size must be less than 10MB");
      return false;
    }

    return true;
  };
  
  const handleFileUpload = async (file) => {
    if (!file || !validateFile(file)) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/api/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      const newFile = response.data;
      setFiles(prevFiles => [...prevFiles, newFile]);
      showAlert("success", "Success", "File uploaded successfully");
    } catch (error) {
      console.error('Upload error:', error);
      showAlert(
        "error",
        "Upload Failed",
        error.response?.data?.error || "Failed to upload file"
      );
    }
  };

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
    // Reset the input value so the same file can be uploaded again
    e.target.value = '';
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    // Handle only the first file
    const file = files[0];
    await handleFileUpload(file);
  };

  const handleUpdateTags = async (fileId, tags) => {
    try {
      await axios.post(`/api/files/${fileId}/tags`, 
        { tags },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        }
      );
      
      setFiles(prevFiles =>
        prevFiles.map(file =>
          file._id === fileId ? { ...file, tags } : file
        )
      );
    } catch (error) {
      showAlert("error", "Error", "Failed to update tags");
      throw error;
    }
  };

  const handleDeleteFile = async (fileId) => {
    try {
      await axios.delete(`/api/files/${fileId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      setFiles(prevFiles => prevFiles.filter(file => file._id !== fileId));
      showAlert("success", "Success", "File deleted successfully");
    } catch (error) {
      console.log({error})
      showAlert("error", "Error", "Failed to delete file");
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">File Management Dashboard</h1>
        <button
          onClick={onLogout}
          className="flex items-center rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </button>
      </div>

      <div 
        className="mb-6"
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <label
          className={`flex w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors duration-200 ${
            isDragging
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
        >
          <div className="space-y-1 text-center">
            <Upload className={`mx-auto h-12 w-12 transition-colors duration-200 ${
              isDragging ? "text-blue-500" : "text-gray-400"
            }`} />
            <div className={`text-sm ${isDragging ? "text-blue-600" : "text-gray-600"}`}>
              {isDragging ? "Drop file here" : "Drop files here or click to upload"}
            </div>
            <div className="text-xs text-gray-500">
              Max file size: 10MB
            </div>
          </div>
          <input
            type="file"
            className="hidden"
            onChange={handleInputChange}
            accept="image/*,video/*"
          />
        </label>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.isArray(files) && files.map((file) => (
            <FileCard
              key={file._id}
              file={file}
              onUpdateTags={(tags) => handleUpdateTags(file._id, tags)}
              onShare={handleShare}
              onDelete={() => handleDeleteFile(file._id)}
              showAlert={showAlert}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;