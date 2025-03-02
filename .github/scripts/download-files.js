const { google } = require("googleapis");
const fs = require("fs-extra");
const path = require("path");

async function downloadFiles() {
  const folderId = process.env.FOLDER_ID;

  const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
  const auth = new google.auth.JWT(
    credentials.client_email,
    null,
    credentials.private_key,
    ["https://www.googleapis.com/auth/drive.readonly"]
  );

  const drive = google.drive({ version: "v3", auth });

  const response = await drive.files.list({
    q: `'${folderId}' in parents`,
    fields: "files(id, name)",
  });

  const markdownDir = "./markdown";
  await fs.ensureDir(markdownDir);

  for (const file of response.data.files) {
    console.log(`Downloading ${file.name}`);

    const dest = fs.createWriteStream(path.join(markdownDir, file.name));

    const fileResponse = await drive.files.get(
      { fileId: file.id, alt: "media" },
      { responseType: "stream" }
    );

    fileResponse.data.pipe(dest);

    await new Promise((resolve, reject) => {
      dest.on("finish", resolve);
      dest.on("error", reject);
    });
  }

  console.log("All files downloaded!");
}

downloadFiles().catch(console.error);
