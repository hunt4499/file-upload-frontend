import { Copy, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";

import axios from "../../lib/axios";

const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const FileCard = ({ file, onUpdateTags, showAlert, onDelete, onShare }) => {
  const [isTagInputVisible, setIsTagInputVisible] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [viewCount, setViewCount] = useState(file.views || 0);

  useEffect(() => {
    const fetchViewCount = async () => {
      try {
        const response = await axios.get(`/api/files/stats/${file._id}`);
        setViewCount(response.data.views);
      } catch (error) {
        console.error('Failed to fetch view count:', error);
      }
    };

    fetchViewCount();

    const interval = setInterval(fetchViewCount, 30000); 

    return () => clearInterval(interval);
  }, [file._id]);

  const handleAddTag = async (e) => {
    e.preventDefault();
    const trimmedTag = newTag.trim();
    
    if (!trimmedTag) return;
    if (file.tags.includes(trimmedTag)) {
      showAlert("error", "Error", "Tag already exists");
      return;
    }

    setIsLoading(true);
    try {
      const updatedTags = [...file.tags, trimmedTag];
      await onUpdateTags(updatedTags);
      setNewTag("");
      setIsTagInputVisible(false);
    } catch (error) {
      showAlert("error", "Error", "Failed to add tag");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveTag = async (tagToRemove) => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const updatedTags = file.tags.filter(tag => tag !== tagToRemove);
      await onUpdateTags(updatedTags);
    } catch (error) {
      showAlert("error", "Error", "Failed to remove tag");
    } finally {
      setIsLoading(false);
    }
  };

  const generateShareableLink = async () => {
    if (isLoading) return;
  
    setIsLoading(true);
    try {
      // increment view count
      const { data: updatedFile } = await axios.post(`/api/files/${file._id}/share`);
      
      const shareableUrl = `${window.location.origin}/shared/${updatedFile.shareableLink}`;
      await navigator.clipboard.writeText(shareableUrl);
      setViewCount(updatedFile.views);
      showAlert("success", "Success", "Link copied to clipboard!");
    } catch (error) {
      showAlert("error", "Error", "Failed to generate share link");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFile = async () => {
    if (isLoading) return;
    
    if (window.confirm('Are you sure you want to delete this file?')) {
      setIsLoading(true);
      try {
        await onDelete(file._id);
      } catch (error) {
        console.log({error})
        showAlert("error", "Error", "Failed to delete file");
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="rounded-lg bg-white p-4 shadow-md">
      <div className="aspect-video w-full overflow-hidden rounded-lg bg-gray-100">
        {file.mimeType?.startsWith("image/") ? (
          <img
            src={file.path}
            alt={file.originalName}
            className="h-full w-full object-cover"
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://placehold.co/300x200'
            }}
          />
        ) : (
          <video 
            src={file.path} 
            className="h-full w-full" 
            controls 
            onError={(e) => {
              showAlert("error", "Error", "Failed to load video");
            }}
          />
        )}
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0 pr-2">
            <h3 
              className="font-medium text-sm text-ellipsis overflow-hidden whitespace-nowrap"
              title={file.originalName || 'Untitled'}
            >
              {file.originalName || 'Untitled'}
            </h3>
          </div>
          <button
            onClick={handleDeleteFile}
            className="text-red-600 hover:text-red-800 disabled:opacity-50 flex-shrink-0"
            disabled={isLoading}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-1 flex justify-between items-center">
          <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
          <p className="text-sm text-gray-500">{viewCount} views</p>
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
          {Array.isArray(file.tags) && file.tags.map((tag, index) => (
            <span
              key={`${tag}-${index}`}
              className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800 flex items-center gap-1"
            >
              {tag}
              <button
                onClick={() => handleRemoveTag(tag)}
                className="hover:text-blue-600 disabled:opacity-50"
                disabled={isLoading}
                aria-label={`Remove ${tag} tag`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between">
          {isTagInputVisible ? (
            <form onSubmit={handleAddTag} className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className="rounded border px-2 py-1 text-sm"
                placeholder="Add tag..."
                disabled={isLoading}
                maxLength={50}
              />
              <button
                type="submit"
                className="rounded bg-blue-600 px-2 py-1 text-sm text-white disabled:bg-blue-400"
                disabled={isLoading || !newTag.trim()}
              >
                Add
              </button>
            </form>
          ) : (
            <button
              onClick={() => setIsTagInputVisible(true)}
              className="text-sm text-blue-600 disabled:opacity-50"
              disabled={isLoading}
            >
              Add Tag
            </button>
          )}

          <button
            onClick={generateShareableLink}
            className="flex items-center text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50"
            disabled={isLoading}
          >
            <Copy className="mr-1 h-4 w-4" />
            Share
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileCard;