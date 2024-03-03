'use client';
import React, {useState} from 'react';
import axios from 'axios';

import './upload.css';


import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
 
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { toast } from "@/components/ui/use-toast"


const allowedFileTypes = ['mp3', 'wav', 'mp4'];

const items = [
    {
      id: "spanish",
      label: "Spanish",
    },
    {
      id: "",
      label: "Home",
    },
    {
      id: "applications",
      label: "Applications",
    },
    {
      id: "desktop",
      label: "Desktop",
    },
    {
      id: "downloads",
      label: "Downloads",
    },
    {
      id: "documents",
      label: "Documents",
    },
  ] as const

const FormSchema = z.object({
items: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one item.",
}),
})

// New Functional Component
const Upload: React.FC = () => {
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
          items: ["recents", "home"],
        },
      })
    
    // Initialize state of the files with an empty list, and define
    // the function that updates it (with the useState hook)
    const initialList: File[] = []
    const [files, setFiles] = useState<File[]>(initialList);
    function onSubmit(data: z.infer<typeof FormSchema>) {
        toast({
          title: "You submitted the following values:",
          description: (
            <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
              <code className="text-white">{JSON.stringify(data, null, 2)}</code>
            </pre>
          ),
        })
      }
    
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

    // When dragging files over the upload area, keep track of how many elements
    // have been dragged over (add 1 when something new is dragged over, remove 1
    // on drag leave). When it reaches 0 again, we know we need to remove the hover outline
    // - 
    // https://stackoverflow.com/questions/7110353/html5-dragleave-fired-when-hovering-a-child-element
    // I love you stack overflow
    var dragCounter = 0;

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault(); // This is crucial for onDrop to work
    };

    const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
        // Increment the counter and show the outline
        dragCounter++;
        const listElement = document.getElementById("file-list-container");
        if(listElement!=null) {
            listElement.style.outline = "4px rgb(97, 97, 255) solid";
            listElement.style.boxShadow = "0 12px 24px rgba(0, 0, 0, 0.1)";
        }

    }

    const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
        // Decrement the counter and remove the outline
        dragCounter--;
        if(dragCounter===0){
            const listElement = document.getElementById("file-list-container");
            if(listElement!=null) {
                listElement.style.outline = "0px";
                listElement.style.boxShadow = "none";
            }
        }
    }

    const handleFileDrop = (event: React.DragEvent<HTMLDivElement>) => {
        // Prevent default behavior (Stops the file from being opened in a new tab)
        event.preventDefault();

        // When the file is dropped, we don't need the counter anymore, so reset back to 0
        dragCounter = 0;

        // Hide the drop outline
        const listElement = document.getElementById("file-list-container");
        if(listElement!=null) {
            listElement.style.outline = "0px";
            listElement.style.boxShadow = "none";
        }

        // If the drop contained items
        if (event.dataTransfer.items) {

            // Use DataTransferItemList interface to access the file(s)
            const newFiles: File[] = [];
            const invalidFileTypes: Set<string> = new Set();
            Array.from(event.dataTransfer.items).forEach((item, i) => {
                const file = item.getAsFile();
                const type = file?.name.split(".").pop()
                
                // If the file isn't of type file, it will be null
                if (file !== null){

                    // Handle invalid types
                    if (type !== undefined && allowedFileTypes.includes(type)) {
                        newFiles.push(file);
                    } else {
                        console.error("Invalid file type:", type);
                        invalidFileTypes.add('.' + type);
                    }
                }
            });

            // If there are valid files being added, apply the NonEmpty CSS
            // FIXME - should keep track of which css is currently applied, 
            // and only apply this if the page is showing Empty. RIght now,
            // it's just changing CSS unnecessarily 
            if(newFiles.length > 0) {showNonEmpty()} 
            
            // change the state of files (with the useState hook) to an array spread of
            // itself + the new files being added
            setFiles(previousFiles => [...previousFiles, ...newFiles]);
            console.log(files);
            // If attempted to add invalid files, display error message  
            if (invalidFileTypes.size > 0) {
                var message = "Invalid file type";
                if (invalidFileTypes.size > 1) {
                    message += "s";
                }
                message += ": ";
                const invalidFileTypesArray = Array.from(invalidFileTypes);
                for (let i = 0; i < invalidFileTypesArray.length; i++){
                    message += invalidFileTypesArray[i]
                    if (i !== invalidFileTypesArray.length-1) {message += ', '}
                }

                // Notification function
                sendNotification(message);
            }
        }
    }

    // Runs when a new file is uploaded
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        // Store the files from the new list of files, and spreads them into the files state
        if (event.target.files) {
            const newFiles: File[] = Array.from(event.target.files);   
            if(files.length === 0) {showNonEmpty()}         
            setFiles(previousFiles => [...previousFiles, ...newFiles]);
        }       
    };

    // Splices the file at the given index from the files state
    const removeFileFromIndex = (index: number) => {
        if (files.length === 1) {showEmpty()}
        setFiles(previousFiles => {
            const newFiles: File[] = [...previousFiles];
            newFiles.splice(index, 1);
            return newFiles;
        })
    }

    const removeAllFiles = () => {
        setFiles([]);
        showEmpty();
    }

    // Function to show a notification
    const sendNotification = (notification: string) => {
        const overlay = document.getElementById("overlay");
        if (overlay != null) {
            overlay.style.display = "block";
            const overlayText = document.getElementById("overlay-notification-text");
            const overlayNotification = document.getElementById("overlay-notification");
            if (overlayText != null) overlayText.innerText = notification;
            if (overlayNotification != null) {

                // Handle exit event of clicking outside the notification
                // 0 tick timeout to stop overlay from exiting out instantly
                setTimeout(() => {
                    document.addEventListener('click', checkForNotificationEscapeClick);
                }, 0);

                // Handle exit event of pressing the escape key
                document.addEventListener('keydown', checkForNotificationEscapeKey);
            }
        }   
    }

    // Remove the notification, and it's corresponding exit events
    const removeNotification = () => {
        const overlay = document.getElementById("overlay");
        if (overlay != null) {
            overlay.style.display = "none";
            document.removeEventListener('click', checkForNotificationEscapeClick)
            document.removeEventListener('keydown', checkForNotificationEscapeKey);
        };
    }

    // Removes the notification when a click occurres on an element outside of the notification
    const checkForNotificationEscapeClick = (e: MouseEvent) => {
        const overlayNotification = document.getElementById("overlay-notification");
        if (overlayNotification != null && !overlayNotification.contains(e.target as Node)) {
            removeNotification();
        }
    }

    // Removes the notification when the escape key is pressed
    const checkForNotificationEscapeKey = (e: globalThis.KeyboardEvent) => {
        if(e.key === 'Escape') {removeNotification()}
    }


    // Upload file to S3 - this is what you would want to change
    const uploadFileToS3 = async (file: File, index: number) => {

        // Show the files corresponding loading gif
        const loadingGif = document.getElementById(`loading-${index}`);
        if(loadingGif != null) loadingGif.style.display = 'block';

        try {

            // Backend with AWS credentials will request a signed URL from the S3
            // instance, granting permission for an upload of the input file
            // const backend_signing_url = `https://some-backend-signing-function.amazonaws.com/sign-e3?fileName=${encodeURIComponent(file.name)}&fileType=${encodeURIComponent(file.type)}`;
            const backend_signing_url = '/api/upload'
            const sendLanguages = [];
            for (const [key, value] of Object.entries(checkedLanguages)) {
                if(value == true){
                    sendLanguages.push(key);
                }
            }

            const response = await fetch(backend_signing_url, {
                method: 'POST',
                body: JSON.stringify({filename: file.name, filetype: file.type, languages: sendLanguages}),
            });

            const signedUrl = await response.json();
            console.log("HERE");
            console.log(signedUrl);
            // Use the signed URL to upload the file directly to S3
            await axios.put(signedUrl.uploadUrl, file, {
                headers: {
                    'Content-Type': file.type,
                },
            });

            console.log(signedUrl.s3Name)
            console.log("abc")
            
            const response2 = await fetch('/api/startjob', {
                method: 'POST',
                body: JSON.stringify({s3Name: signedUrl.s3Name, languages: sendLanguages}),
            });
            console.log("abcafter")
            await response2;
            // If the upload is successful, remove the file from the list
            // and return a success response
            setFiles(previousFiles => previousFiles.filter(f => f !== file));
            return { success: true, file };
            
        } catch (error) {
            // If there is an error during the upload, return a failure response
            console.error('Error uploading file:', file.name, error);
            if(loadingGif != null) loadingGif.style.display = 'none';
            return { success: false, file, error };
        }
    };
    
    // Function that gets called on the 'Upload All' button press
    const uploadAllFilesToS3 = async () => {
        let successfulUploads = 0;
        const failedUploads = [];
    
        for (const [index, file] of files.entries()) {
            try {
                // Await the upload of each file before continuing to the next
                await uploadFileToS3(file, index);
                successfulUploads++;
            } catch (error) {
                // In case of an error, add this file to the failedUploads array
                failedUploads.push(file);
                console.error(`Failed to upload file: ${file.name}`, error);
            }
        }
    
        // Log the results once all files have been attempted
        console.log(`${successfulUploads} files uploaded successfully.`);
        console.log(`${failedUploads.length} files failed to upload.`);
    
        if (failedUploads.length > 0) {
            sendNotification('Some files failed to upload. Please try again.');
        } else {
            showEmpty();
            sendNotification('All files successfully uploaded!');
        }
    };
    
    
        
        
    
    
    /* FINAL RETURN HTML */
    
    const [checkedLanguages, setCheckedLanguages] = useState({});

    //@ts-ignore
    const handleCheckboxChange = (event) => {
        const { id, checked } = event.target;
        setCheckedLanguages((prevCheckedLanguages) => ({
          ...prevCheckedLanguages,
          [id]: checked,
        }));
      };
    
    const languages = [
        'english', 'spanish', 'french', 'german', 'italian', 
        'portuguese', 'polish', 'turkish', 'russian', 'dutch',
        'czech', 'chinese', 'japanese', 'hungarian', 'korean'
    ];


    return (
        <div className="space-y-4">
            <div className="form-container">
        <fieldset>
      <legend className="text-lg font-medium text-gray-900">Languages</legend>
      <p className="mt-1 text-pretty text-sm text-gray-700">
        Select the languages you want to dub into and upload your files below.
      </p>
      <div className="mt-4 space-y-2">
        {languages.map((language) => (
          <label key={language} htmlFor={language} className="flex cursor-pointer items-start gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                className="size-4 rounded border-gray-300"
                id={language}
                // @ts-ignore
                checked={checkedLanguages[language] || false}
                onChange={handleCheckboxChange}
              />
            </div>
            <div>
              <strong className="font-medium text-gray-900"> {language.charAt(0).toUpperCase() + language.slice(1)} </strong>
            </div>
          </label>
        ))}
      </div>
    </fieldset>


        </div>
        <div className="upload-container">
            <div id="overlay">
                <div id="overlay-notification">
                    <div id="overlay-notification-top">
                        <div id="overlay-notification-text"></div>
                    </div>
                    <div id="overlay-notification-bottom">
                        <button id="overlay-notification-exit" onClick={removeNotification}>OK</button>
                    </div>
                </div>
            </div>

            <div className = "file-settings-container">

                <label className="file-upload-label-small" id="file-upload-label-small" htmlFor="file-upload">
                    Add more files
                </label>

                <button className="delete-all-button" id="delete-all-button" onClick={removeAllFiles}>
                    <svg style={{width:"24px",height:"24px"}} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 6.75H8.75M21 6.75H15.25M18.25 6.75V19.25C18.25 19.8023 17.8023 20.25 17.25 20.25H6.75C6.19772 20.25 5.75 19.8023 5.75 19.25V6.75M9.75 10V17M14.25 10V17M8.75 6.75V3.75C8.75 3.19772 9.19772 2.75 9.75 2.75H14.25C14.8023 2.75 15.25 3.19772 15.25 3.75V6.75M8.75 6.75H15.25" stroke="#756CF5" strokeWidth="1.5"></path>
                    </svg>
                    <div>Delete all</div>
                </button>

            </div>

            <div className = "file-list-container" id = "file-list-container" onDrop={handleFileDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDragEnter={handleDragEnter}>
                <ul className = "uploaded-files">
                    {/* Map each file in the files state to a seperate list element,
                        and 'React' (hehe) when the files array changes */}
                    {files.map((file, index) => (
                    <li className="uploaded-file" key={index}>
                        <div className = "file-item">

                            <div className = "file-info">{file.name}</div>
                            <div className = "file-actions">
                                <img src="loading.gif" className="upload-loading-gif" id={`loading-${index}`}></img>
                                
                                <button className = "delete-button" onClick={()=>removeFileFromIndex(index)} style={{width:"24px",height:"24px"}}>
                                    <svg style={{width:"16px",height:"16px"}} width="24" height="24" viewBox="-4.5 -1.6 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M12.0001 13.4143L18.293 19.7072L19.7072 18.293L13.4143 12.0001L19.7072 5.70718L18.293 4.29297L12.0001 10.5859L5.70718 4.29297L4.29297 5.70718L10.5859 12.0001L4.29297 18.293L5.70718 19.7072L12.0001 13.4143Z" fill="currentColor"></path></svg>
                                </button>
                            </div>


                        </div>
                    </li>
                    ))}
                </ul>

                <input id="file-upload" type="file" accept="audio/mp3, audio/wav, video/mp4" onChange={handleFileUpload} multiple />
                <label className="file-upload-label" id="file-upload-label" htmlFor="file-upload">
                    Choose Files
                </label>

            </div>
            
            
            <div className = "file-submission-container">
                <button className="submission-button" id="submission-button" onClick={uploadAllFilesToS3}>
                    UPLOAD
                </button>
            </div>
            
        </div>

        
        </div>
    );
};
    
export default Upload;
