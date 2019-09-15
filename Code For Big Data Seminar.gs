function convertJPGtoGoogleDocs() {
  var sourceFolderId = "1kd4Gvg84202o6KGOQP9H1wxl1Opd4cI9"; // <--- Please input folder ID.
  var destFolderId = "16srF8tUKMdvuduClQJdvqoodu_sSzuTJ"; // <--- If you want to change the destination folder, please modify this.
  var tempFileName = "TempDocBigDataSeminar";
  
  // There should not be any left-over copies of the temp file, but just in case...
  Logger.log("deleteing all the files in the destination folder");
  var destFolder = DriveApp.getFolderById(destFolderId);
  deleteAllFilesInFolder( destFolderId);
  
  
  Logger.log("Finished deleteing, starting to convert");
  // Create a list of the JPEG files in the source folder
  var sourceFiles = DriveApp.getFolderById(sourceFolderId).getFilesByType(MimeType.JPEG);
  
  // Process the JPEG files list
  while (sourceFiles.hasNext()) {
    
    var sourceFile = sourceFiles.next();
    var sourceFileNameWithExtension = sourceFile.getName();
    
    // Credit: John Hartsock's Stack Exchange answer to "How to trim a file extension from a String in JavaScript?"
    var sourceFileNameWithoutExtensionAndPeriod = sourceFileNameWithExtension.replace(/\.[^/.]+$/, "");
    
    Logger.log("Now Converting: " + sourceFileNameWithExtension);
    
    // Creat one temporary Google Document with the OCRed image.
    // This document contains the impage at the top  of the page, and the OCR result at the bootom
    Logger.log("    Start OCR to : " + tempFileName);
    var tempGoogleDocument = Drive.Files.insert({title: tempFileName, parents: [{id: destFolderId}]}, sourceFile.getBlob(), {ocr: true});


    var destFileNameWithoutExtensionAndPeriod = sourceFileNameWithoutExtensionAndPeriod;
    Logger.log("    Start Export to  : " + destFileNameWithoutExtensionAndPeriod + ".txt");
    convertGoogleDoc(destFolderId, tempFileName, destFileNameWithoutExtensionAndPeriod, "txt");
    
    Logger.log("    Delete  : " + tempFileName);
    deleteTempFile( destFolderId,  tempFileName);
    
    Logger.log("Finished Converting: " + sourceFileNameWithExtension);
    
  }
}
  

function convertGoogleDoc(theDestFolderID, theTempFileName, theDestFileNameWithoutExtensionAndPeriod, theExportFormat)
{

  var destFolder = DriveApp.getFolderById(theDestFolderID);

  //  There should be excatly one file with TempFileName
  var allFilesWithTempFileName = destFolder.getFilesByName(theTempFileName);
  if (allFilesWithTempFileName.hasNext()){
    
    var tempFile = allFilesWithTempFileName.next();
    var tempFileId  = tempFile.getId();
    var url = "https://docs.google.com/document/d/" + tempFileId +"/export?format=" + theExportFormat;

    // Get the blob from the document accessed through its URL.
    // !!! Notice that the "format" suffix of the URL is the convertion (to PDF, txt, docx) instruction!!!
    var httpResponse = UrlFetchApp.fetch(url, 
                      {
                        "headers" : { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
                        "muteHttpExceptions" : true 
                      });
    var blob = httpResponse.getBlob();
    
    //Now create and name the file
    var destFile = destFolder.createFile(blob);
    destFile.setName(theDestFileNameWithoutExtensionAndPeriod + "." + theExportFormat);
  
  }  
  
}

function deleteAllFilesInFolder( theFolderID)
{
  var destFolder = DriveApp.getFolderById(theFolderID);

  //Get the dest folder. Throws exception if can't find it.
  var allFilesInFolder = destFolder.getFiles();
  while (allFilesInFolder.hasNext()){
    var thisFile = allFilesInFolder.next();
    var idToDelete = thisFile.getId();
 
    var returnFromDelete = Drive.Files.remove(idToDelete);
  }
  
}


function deleteTempFile( theDestFolderID,  theTempFileName)
{
  Logger.log("theDestFolderID: " + theDestFolderID);
  var destFolder = DriveApp.getFolderById(theDestFolderID);

  //Get the dest folder. Throws exception if can't find it.
  var allFilesWithTempFileName = destFolder.getFilesByName(theTempFileName);
  while (allFilesWithTempFileName.hasNext()){
    var thisFile = allFilesWithTempFileName.next();
    var idToDelete = thisFile.getId();
    
    Logger.log("idToDelete: " + idToDelete);
    
    var returnFromDelete = Drive.Files.remove(idToDelete);
  }
  
}

