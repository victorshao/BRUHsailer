const { google } = require("googleapis");
const fs = require("fs-extra");
const path = require("path");

const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/drive"],
});

async function downloadFiles() {
  const drive = google.drive({ version: "v3", auth: await auth.getClient() });
  const folderId = process.env.FOLDER_ID;

  const response = await drive.files.list({
    q: `'${folderId}' in parents and mimeType='application/json' and trashed = false`,
    fields: "files(id, name, mimeType)",
  });

  const files = response.data.files;

  if (!files || files.length === 0) {
    console.log(
      "No JSON files found in the specified folder. They need to be exported first."
    );
    return;
  }

  const dataDir = path.join(process.cwd(), "data");
  await fs.ensureDir(dataDir);

  for (const file of files) {
    console.log(`Downloading ${file.name}`);

    const dest = path.join(dataDir, file.name);

    const res = await drive.files.get(
      {
        fileId: file.id,
        alt: "media",
      },
      { responseType: "stream" }
    );

    const destStream = fs.createWriteStream(dest);

    await new Promise((resolve, reject) => {
      res.data
        .on("error", (err) => {
          reject(err);
        })
        .pipe(destStream)
        .on("error", (err) => {
          reject(err);
        })
        .on("finish", () => {
          console.log(`Successfully downloaded ${file.name}`);
          resolve();
        });
    });
  }

  console.log("All JSON files downloaded successfully.");
}

downloadFiles().catch(console.error);
