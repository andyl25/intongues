'use client';
import React, {use, useState, useEffect} from 'react';
import axios from 'axios';

import './Downloads.css';

const allowedFileTypes = ['mp3', 'wav', 'mp4'];



// New Functional Component
const Upload: React.FC = () => {

    // Initialize state of the files with an empty list, and define
    // the function that updates it (with the useState hook)
    // const initialList: File[] = []
    const [files, setFiles] = useState<any[]>([]);
    const [downloads, setDownloads] = useState<any[]>([]);

    useEffect(() => {
        async function fetchData() {
            const response = await fetch('/api/getdownloads');
            const result_files = await response.json();
            //take result_files.files and turn into a javascript array
            const fileslist = [];
            for (let i = result_files.files.length-1; i >= 0; i--) {
                console.log(result_files.files[0])
                fileslist.push(result_files.files[i]);
            }
            const downloadslist = [];
            for (let i = result_files.downloads.length-1; i >= 0; i--) {
                console.log(result_files.downloads[0])
                downloadslist.push(result_files.downloads[i]);
            }

            setFiles(fileslist);
            setDownloads(downloadslist);
            showNonEmpty();
            

        }
        fetchData();


    }, []);
    
    
    // Handles CSS changes to display the page when there are no uploaded files (no list)
    const showEmpty = () => {
        const label = document.getElementById("file-upload-label");
        const labelSmall = document.getElementById("file-upload-label-small");
        const deleteAllLabel = document.getElementById("delete-all-button");
        const fileListContainer = document.getElementById("file-list-container");
        const submissionButton = document.getElementById("submission-button");
        if (label != null) label.style.display = "block";
        if (labelSmall != null) labelSmall.style.display = "none";
        if (deleteAllLabel != null) deleteAllLabel.style.display = "none";
        if (fileListContainer != null) {fileListContainer.style.marginTop = "50px"}
        if (submissionButton != null) {submissionButton.style.display = "none"};
    }

    // Handles CSS changes to display the page with uploaded files (list)
    const showNonEmpty = () => {
        const uploadLabel = document.getElementById("file-upload-label");
        const uploadLabelSmall = document.getElementById("file-upload-label-small");
        const deleteAllLabel = document.getElementById("delete-all-button");
        const fileListContainer = document.getElementById("file-list-container");
        const submissionButton = document.getElementById("submission-button");
        if (uploadLabel != null) uploadLabel.style.display = "none";
        if (uploadLabelSmall != null) uploadLabelSmall.style.display = "block";
        if (deleteAllLabel != null) {deleteAllLabel.style.display = "flex"}
        if (fileListContainer != null) {fileListContainer.style.marginTop = "14px"}
        if (submissionButton != null) {submissionButton.style.display = "flex"};
    }
    const download = (i : number) => {
        const signedUrl = downloads[i];
        const downloadFile = async (url : string, filename : string) => {
            try {
              const response = await fetch(url);
              if (!response.ok) throw new Error(`Error: ${response.statusText}`);
          
              // Create a Blob from the response
              const blob = await response.blob();
          
              // Create an anchor element and use it for the download
              const link = document.createElement('a');
              link.href = window.URL.createObjectURL(blob);
              link.download = filename;
          
              // This is necessary as link.click() does not work on the latest firefox
              link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
          
              // Clean up the URL object created to avoid memory leaks
              window.URL.revokeObjectURL(link.href);
            } catch (error) {
              console.error('Error downloading file:', error);
            }
        };
        downloadFile(signedUrl, files[i].orig_file_id);
        
          
          
    }
    // When dragging files over the upload area, keep track of how many elements
    // have been dragged over (add 1 when something new is dragged over, remove 1
    // on drag leave). When it reaches 0 again, we know we need to remove the hover outline
    // - 
    // https://stackoverflow.com/questions/7110353/html5-dragleave-fired-when-hovering-a-child-element
    // I love you stack overflow
    var dragCounter = 0;


    // Runs when a new file is uploaded
    // const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    //     // Store the files from the new list of files, and spreads them into the files state
    //     if (event.target.files) {
    //         const newFiles: File[] = Array.from(event.target.files);   
    //         if(files.length === 0) {showNonEmpty()}         
    //         setFiles(previousFiles => [...previousFiles, ...newFiles]);
    //     }       
    // };

    // Splices the file at the given index from the files state
    // const removeFileFromIndex = (index: number) => {
    //     if (files.length === 1) {showEmpty()}
    //     setFiles(previousFiles => {
    //         const newFiles: File[] = [...previousFiles];
    //         newFiles.splice(index, 1);
    //         return newFiles;
    //     })
    // }

    // const removeAllFiles = () => {
    //     setFiles([]);
    //     showEmpty();
    // }

    // Function to show a notification
    
    // Function that gets called on the 'Upload All' button press
    
        
        
    
    
    /* FINAL RETURN HTML */

    
    return (
        <div className="upload-container">
            <div id="overlay">
                <div id="overlay-notification">
                    <div id="overlay-notification-top">
                        <div id="overlay-notification-text"></div>
                    </div>
                    <div id="overlay-notification-bottom">
                        <button id="overlay-notification-exit" >OK</button>
                    </div>
                </div>
            </div>

            <div className = "file-settings-container">

                



            </div>

            <div className = "file-list-container" id = "file-list-container">
                <ul className = "uploaded-files">
                    {/* Map each file in the files state to a seperate list element,
                        and 'React' (hehe) when the files array changes */}
                    {files && files.map((file, index) => (
                    <li className="uploaded-file" key={index}>
                        <div className = "file-item">

                            <div className = "file-info">{file.orig_file_id}</div>
                            <div className = "file-actions">
                            </div>
                            <div className = "file-actions">
                                <img src="loading.gif" className="upload-loading-gif" id={`loading-${index}`}></img>
                                <button className = "delete-button" onClick={()=>download(index)} style={{width:"24px",height:"24px"}}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="16" fill="currentColor" className="bi bi-download" viewBox="0 0 16 16">
                                    <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5"/>
                                    <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708z"/>
                                    </svg>
                                </button>
                            </div>

                        </div>
                        
                    </li>
                    ))}
                </ul>


            </div>
            
        
        </div>
    );
};
    
export default Upload;
