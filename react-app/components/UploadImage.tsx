import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { create } from 'ipfs-http-client';

const ipfs = create({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });

interface Props {
  onUploadSuccess: (cid: string) => void;
  onUploadFailure: (error: Error) => void;
}

const UploadToIPFS: React.FC<Props> = ({}) => {
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    try {
      const files = await Promise.all(
        acceptedFiles.map(async (file) => {
          const buffer = await file.arrayBuffer();
          return { path: file.name, content: buffer };
        })
      );
      console.log("ok");

      const result = await ipfs.addAll(files);
      console.log(result);
      return result;

    } catch (error) {
      console.log("pas ok");
        return error;
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Drop the files here ...</p>
      ) : (
        <p>Drag and drop files here or click to select files</p>
      )}
    </div>
  );
};

export default UploadToIPFS;
