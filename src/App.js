import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Upload, FileIcon, Download } from 'lucide-react';
import { Oval } from 'react-loading-icons';
import { FaFile, FaFileAudio, FaFileVideo, FaFileImage, FaFilePdf, FaFileWord, FaFileExcel, FaFilePowerpoint } from 'react-icons/fa';

const AppContainer = styled.div`
  font-family: 'Arial', sans-serif;
  max-width: 800px;
  margin: 0 auto;
  padding: 40px;
  background-image: url('/api/placeholder/800/600');
  background-size: cover;
  background-position: center;
  min-height: 100vh;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
`;

const Title = styled.h1`
  font-size: 36px;
  color: #ffffff;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
  margin-bottom: 30px;
`;

const UploadButton = styled.label`
  cursor: pointer;
  background-color: #4CAF50;
  color: white;
  padding: 12px 20px;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  transition: background-color 0.3s;
  &:hover {
    background-color: #45a049;
  }
`;

const StatusMessage = styled.div`
  padding: 15px;
  border-radius: 4px;
  margin: 20px 0;
  background-color: ${props => props.type === 'success' ? '#DFF2BF' : '#FFBABA'};
  color: ${props => props.type === 'success' ? '#4F8A10' : '#D8000C'};
`;

const FileList = styled.ul`
  list-style-type: none;
  padding: 0;
`;

const FileItem = styled.li`
  background-color: rgba(255, 255, 255, 0.8);
  margin-bottom: 10px;
  padding: 15px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  transition: background-color 0.3s;
  &:hover {
    background-color: rgba(255, 255, 255, 0.9);
  }
`;

const FileName = styled.span`
  margin-left: 10px;
  flex-grow: 1;
`;

const DownloadButton = styled.a`
  background-color: #008CBA;
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  transition: background-color 0.3s;
  &:hover {
    background-color: #007B9A;
  }
`;

const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const getFileIcon = (fileName) => {
  const extension = fileName.split('.').pop().toLowerCase();
  switch (extension) {
    case 'mp3':
    case 'wav':
    case 'ogg':
      return <FaFileAudio size={24} />;
    case 'mp4':
    case 'avi':
    case 'mov':
      return <FaFileVideo size={24} />;
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return <FaFileImage size={24} />;
    case 'pdf':
      return <FaFilePdf size={24} />;
    case 'doc':
    case 'docx':
      return <FaFileWord size={24} />;
    case 'xls':
    case 'xlsx':
      return <FaFileExcel size={24} />;
    case 'ppt':
    case 'pptx':
      return <FaFilePowerpoint size={24} />;
    default:
      return <FaFile size={24} />;
  }
};

const FileSharing = () => {
  const [files, setFiles] = useState([]);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const serverUrl = `http://${window.location.hostname}:5000`; // Dynamically get the host IP

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await fetch(`${serverUrl}/api/files`);
      const data = await response.json();
      setFiles(data);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${serverUrl}/api/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setUploadStatus({ type: 'success', message: data.message });
      fetchFiles();
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadStatus({ type: 'error', message: 'Error uploading file' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (fileName) => {
    setIsLoading(true);
    try {
      // Assuming fileName is just the filename, not a URL
      const response = await fetch(`http://localhost:5000/api/download/${fileName}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      setUploadStatus({ type: 'error', message: 'Error downloading file' });
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <AppContainer>
      <Title>File Sharing</Title>
      
      <UploadButton htmlFor="fileUpload">
        <Upload size={20} style={{ marginRight: '10px' }} />
        <span>Upload File</span>
      </UploadButton>
      <input id="fileUpload" type="file" style={{ display: 'none' }} onChange={handleFileUpload} />

      {uploadStatus && (
        <StatusMessage type={uploadStatus.type}>
          <strong>{uploadStatus.type === 'success' ? 'Success:' : 'Error:'}</strong> {uploadStatus.message}
        </StatusMessage>
      )}

      <FileList>
        {files.map((file) => (
          <FileItem key={file}>
            {getFileIcon(file)}
            <FileName>{file}</FileName>
            <DownloadButton onClick={() => handleDownload(file)}>
              <Download size={16} style={{ marginRight: '5px' }} />
              Download
            </DownloadButton>
          </FileItem>
        ))}
      </FileList>

      {isLoading && (
        <LoadingOverlay>
          <Oval stroke="#ffffff" />
        </LoadingOverlay>
      )}
    </AppContainer>
  );
};

export default FileSharing;
