'use client';

import React, { useState, memo } from 'react';
import PropTypes from 'prop-types';
import { ArrowUp, Camera, Paperclip, X, Upload } from 'lucide-react';
import TextInputComponent from './TextInputComponent';
import FileUploadComponent from './FileUploadComponent';
import FilePreviewComponent, { IMAGE_TYPES } from './FilePreviewComponent';

const MessageInput = ({
    inputText,
    setInputText,
    handleSubmit,
    isPending,
    disabled,
    msgLen,
    modelName,
    onFileUpload,
    uploadProgress,
    isUploading,
    uploadedFile,
    onCancelUpload,
    onRemoveFile,
}) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files?.length > 0) {
            await onFileUpload(files[0]);
        }
    };

    const handlePaste = async (e) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        for (const item of items) {
            if (item.type.startsWith('image/')) {
                e.preventDefault();
                const file = item.getAsFile();
                if (file) {
                    await onFileUpload(file);
                }
                break;
            }
        }
    };

    const onSubmit = (e) => {
        e.preventDefault();
        handleSubmit(e);
    };

    return (
        <form
            onSubmit={onSubmit}
            onPaste={handlePaste}
            className="fixed bottom-0 left-0 right-0 mx-auto lg:ml-40 px-4 w-full"
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}>
            <div className="max-w-3xl mx-auto">
                <div className={`relative bg-[#2a2b36] rounded-3xl min-h-[96px] flex flex-col dark:border-2 
                    ${isDragging ? 'border-blue-500 dark:border-blue-500' : 'border-white/50'} 
                    transition-colors duration-200`}>
                    
                    {/* Drag overlay */}
                    {isDragging && (
                        <div className="absolute inset-0 bg-blue-500 bg-opacity-10 rounded-3xl flex items-center justify-center">
                            <div className="flex flex-col items-center gap-2 text-blue-500">
                                <Upload className="w-8 h-8 animate-bounce" />
                                <p className="text-sm font-medium">Drop your file here</p>
                            </div>
                        </div>
                    )}

                    {/* Upload Progress */}
                    {isUploading && (
                        <div className="px-4 pt-2">
                            <div className="flex items-center gap-2 text-gray-300">
                                {uploadedFile && IMAGE_TYPES.includes(uploadedFile.type) ? (
                                    <Camera className="w-4 h-4" />
                                ) : (
                                    <Paperclip className="w-4 h-4" />
                                )}
                                <span className="text-sm truncate flex-1">
                                    {uploadedFile && IMAGE_TYPES.includes(uploadedFile.type)
                                        ? 'Processing image...'
                                        : 'Uploading file...'}
                                </span>
                                <div className="h-1 w-24 bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500 transition-all duration-300"
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={onCancelUpload}
                                    className="text-gray-400 hover:text-white p-1">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* File Preview */}
                    {!isUploading && uploadedFile && (
                        <FilePreviewComponent
                            file={uploadedFile}
                            onRemove={onRemoveFile}
                        />
                    )}

                    {/* Text Input */}
                    <TextInputComponent 
                        inputText={inputText}
                        setInputText={setInputText}
                        handleSubmit={handleSubmit}
                        isPending={isPending}
                        disabled={disabled}
                        msgLen={msgLen}
                        modelName={modelName}
                        uploadedFile={uploadedFile}
                        isUploading={isUploading}
                    />

                    {/* Action Buttons */}
                    <div className="flex justify-between items-center p-3 pt-0">
                        <FileUploadComponent
                            onFileUpload={onFileUpload}
                            isUploading={isUploading}
                            onCancelUpload={onCancelUpload}
                            handleDragEnter={handleDragEnter}
                            handleDragLeave={handleDragLeave}
                            handleDragOver={handleDragOver}
                            handleDrop={handleDrop}
                            isDragging={isDragging}
                        />

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className={`p-2 rounded-full transition-all duration-200
                                ${
                                    isPending ||
                                    disabled ||
                                    (!inputText.trim() && !uploadedFile) ||
                                    isUploading
                                        ? 'text-gray-500 bg-gray-700/50 cursor-not-allowed'
                                        : 'text-gray-400 hover:text-white bg-gray-700 hover:bg-gray-600 shadow-lg'
                                }`}
                            disabled={
                                isPending ||
                                disabled ||
                                (!inputText.trim() && !uploadedFile) ||
                                isUploading
                            }
                            aria-label="Send Message">
                            <ArrowUp className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Footer Message */}
                    <div className="text-center w-full text-[11px] text-white/70 py-1 font-medium">
                        <h2>AI Models can make mistakes. Please double-check responses.</h2>
                    </div>
                </div>
            </div>
        </form>
    );
};

MessageInput.propTypes = {
    inputText: PropTypes.string.isRequired,
    setInputText: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    isPending: PropTypes.bool.isRequired,
    disabled: PropTypes.bool.isRequired,
    msgLen: PropTypes.number.isRequired,
    modelName: PropTypes.string.isRequired,
    onFileUpload: PropTypes.func.isRequired,
    uploadProgress: PropTypes.number,
    isUploading: PropTypes.bool,
    uploadedFile: PropTypes.shape({
        name: PropTypes.string,
        type: PropTypes.string,
        size: PropTypes.number,
        content: PropTypes.string,
        extension: PropTypes.string,
        isText: PropTypes.bool,
    }),
    onCancelUpload: PropTypes.func.isRequired,
    onRemoveFile: PropTypes.func.isRequired,
};

MessageInput.defaultProps = {
    uploadProgress: 0,
    isUploading: false,
    uploadedFile: null,
};

export default memo(MessageInput);