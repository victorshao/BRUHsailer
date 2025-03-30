function onOpen() {
  DocumentApp.getUi()
    .createMenu("Export Tools")
    .addItem("Export File as JSON", "exportCurrentDocAsJSON")
    .addItem("Push Data to Site", "triggerGitHubAction")
    .addToUi();
}

function exportCurrentDocAsJSON() {
  const doc = DocumentApp.getActiveDocument();
  const docId = doc.getId();
  const docTitle = doc.getName();

  exportAsJSON(docId, docTitle);
}

function exportAsJSON(docId, docTitle) {
  var scriptProperties = PropertiesService.getScriptProperties();
  var fileId = scriptProperties.getProperty("FILE_ID");
  var folderId = scriptProperties.getProperty("FOLDER_ID");
  if (!folderId) {
    DocumentApp.getUi().alert(
      "Error: Folder ID not configured in Script Properties"
    );
    Logger.log("Error: FOLDER_ID not found in Script Properties.");
    return;
  }
  if (!fileId) {
    DocumentApp.getUi().alert(
      "Error: FILE_ID not configured in Script Properties"
    );
    Logger.log("Error: FILE_ID not found in Script Properties.");
    return;
  }
  const document = Docs.Documents.get(docId, { includeTabsContent: true });
  const fileName = "data_export_" + fileId + ".json";

  DriveApp.getFolderById(folderId).createFile(fileName, document);
}

function triggerGitHubAction() {
  var scriptProperties = PropertiesService.getScriptProperties();
  var folderId = scriptProperties.getProperty("FOLDER_ID");
  var repositoryOwner = scriptProperties.getProperty("REPOSITORY_OWNER");
  var repositoryName = scriptProperties.getProperty("REPOSITORY_NAME");
  var githubToken = scriptProperties.getProperty("GITHUB_TOKEN");

  if (!githubToken) {
    DocumentApp.getUi().alert(
      "Error: GitHub token not configured in Script Properties"
    );
    Logger.log("Error: GITHUB_TOKEN not found in Script Properties.");
    return;
  }
  if (!repositoryOwner || !repositoryName) {
    DocumentApp.getUi().alert(
      "Error: Repository owner or name not configured in Script Properties"
    );
    Logger.log(
      "Error: REPOSITORY_OWNER or REPOSITORY_NAME not found in Script Properties."
    );
    return;
  }
  if (!folderId) {
    DocumentApp.getUi().alert(
      "Error: Folder ID not configured in Script Properties"
    );
    Logger.log("Error: FOLDER_ID not found in Script Properties.");
    return;
  }

  var url =
    "https://api.github.com/repos/" +
    repositoryOwner +
    "/" +
    repositoryName +
    "/dispatches";

  var payload = {
    event_type: "google-docs-update",
    client_payload: {
      folder_id: folderId,
    },
  };

  var options = {
    method: "post",
    contentType: "application/json",
    headers: {
      Authorization: "token " + githubToken,
      Accept: "application/vnd.github+json",
    },
    payload: JSON.stringify(payload),
  };

  try {
    var response = UrlFetchApp.fetch(url, options);
    DocumentApp.getUi().alert("Request sent to GitHub successfully");
  } catch (e) {
    DocumentApp.getUi().alert("Error: " + e.toString());
  }
}
