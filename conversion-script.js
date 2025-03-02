const fs = require("fs");
const path = require("path");

// Configuration
const MD_FILES_DIRECTORY = "./markdown"; // Directory containing your MD files
const OUTPUT_FILE = "./data.json"; // Output JSON file


const chapterRegex = /\*\*(Chapter \d+: .+?)\*\*/;
const sectionRegex = /\*\*([\d\.]+): (.+?)\*\*/;
const stepNumberRegex = /^(\d+)[\.\)]\s/;
const substepNumberRegex = /^\s+(\d+)[\.\)]\s/; 
const metaLineRegex = /\*\*([^:]+?):\*\*\s*(.+)/;
const totalTimeRegex = /\*\*Total time for section:\*\*\s*(.+)/i;

function convertMdToJson() {
  const guideSections = [];
  let currentChapter = null;
  let currentSection = null;

  const files = fs
    .readdirSync(MD_FILES_DIRECTORY)
    .filter((file) => file.endsWith(".md"))
    .sort(); 

  console.log(`Found ${files.length} MD files to process.`);

  files.forEach((file) => {
    console.log(`Processing file: ${file}`);
    const filePath = path.join(MD_FILES_DIRECTORY, file);
    const content = fs.readFileSync(filePath, "utf8");

    const chapterMatch = file.match(/Chapter(\d+)/);
    const chapterId = chapterMatch ? chapterMatch[1] : "0";

    console.log(`File preview: ${content.substring(0, 100)}...`);

    const lines = content.split("\n");

    let lineIndex = 0;

    while (lineIndex < lines.length) {
      const line = lines[lineIndex].trim();
      const originalLine = lines[lineIndex];

      const chapMatch = line.match(chapterRegex);
      if (chapMatch) {
        currentChapter = chapMatch[1];
        console.log(`Found chapter: ${currentChapter}`);
        lineIndex++;
        continue;
      }

      const sectMatch = line.match(sectionRegex);
      if (sectMatch) {
        if (currentSection) {
          guideSections.push(currentSection);
        }

        const sectionId = sectMatch[1];

        currentSection = {
          id: sectionId,
          title: sectMatch[2],
          totalTime: "Unknown",
          steps: [],
        };

        console.log(`Found section: ${sectionId}: ${sectMatch[2]}`);

        if (lineIndex + 1 < lines.length) {
          const nextLine = lines[lineIndex + 1].trim();
          const timeMatch = nextLine.match(totalTimeRegex);
          if (timeMatch) {
            currentSection.totalTime = timeMatch[1].trim();
            console.log(`Found total time: ${currentSection.totalTime}`);
          }
        }

        lineIndex++;
        continue;
      }

      if (currentChapter && !currentSection) {
        const chapterTitle = currentChapter.replace(/^Chapter \d+: /, "");
        currentSection = {
          id: chapterId,
          title: chapterTitle,
          totalTime: "Unknown",
          steps: [],
        };
        console.log(
          `Created default section for chapter: ${chapterId}: ${chapterTitle}`
        );
      }

      const isSubstep = originalLine.match(substepNumberRegex);

      const stepMatch = !isSubstep && line.match(stepNumberRegex);
      if (stepMatch && currentSection) {
        const stepNumber = stepMatch[1];
        let stepContent = line.replace(stepNumberRegex, "").trim();
        let stepMeta = {};

        console.log(
          `Found step ${stepNumber}: ${stepContent.substring(0, 30)}...`
        );

        let nextLineIndex = lineIndex + 1;
        let collectingMetadata = false;

        while (nextLineIndex < lines.length) {
          const nextLine = lines[nextLineIndex].trim();
          const originalNextLine = lines[nextLineIndex];

          const nextIsSubstep = originalNextLine.match(substepNumberRegex);

          if (
            (!nextIsSubstep && nextLine.match(stepNumberRegex)) ||
            nextLine.match(sectionRegex) ||
            nextLine.match(chapterRegex)
          ) {
            break;
          }

          const metaMatch = nextLine.match(metaLineRegex);
          if (metaMatch) {
            collectingMetadata = true;
            const metaKey = metaMatch[1]
              .toLowerCase()
              .replace(/\s+/g, "_")
              .replace(/[^a-z0-9_]/g, "");
            const metaValue = metaMatch[2].trim();
            stepMeta[metaKey] = metaValue;
            console.log(`Found metadata: ${metaKey} = ${metaValue}`);
          }
          else if (collectingMetadata && nextLine === "") {
            collectingMetadata = false;
          }
          else if (!collectingMetadata && nextLine !== "") {
            stepContent += " " + nextLine;
          }

          nextLineIndex++;
        }

        currentSection.steps.push({
          number: parseInt(stepNumber),
          content: stepContent,
          meta: stepMeta,
        });

        lineIndex = nextLineIndex;
        continue;
      }

      lineIndex++;
    }
  });

  if (currentSection) {
    guideSections.push(currentSection);
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(guideSections, null, 2));
  console.log(
    `Successfully converted MD files to JSON. Output saved to ${OUTPUT_FILE}`
  );
  console.log(`Total sections found: ${guideSections.length}`);
}

convertMdToJson();
