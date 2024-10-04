const simpleGit = require("simple-git");
const fs = require('fs-extra');          // Importing the file system module
const path = require('path');      // Importing the path module

// Define the source directory
const sourceDir = './';

// Define destination directories for different file types
const featureDestDir = './features';  // Folder for .feature files
const javaDestDir = './step-definitions';        // Folder for .java files

// Get the list of files from the source directory
const files = fs.readdirSync(sourceDir);           // Reads the content of the source directory


async function uploadToGit() {
  
files.forEach((file) => {
  // Check if the file is a .feature file
  if (file.endsWith('.feature')) {
    const sourceFeatureFilePath = path.join(sourceDir, file);
    const destFeatureFilePath = path.join(featureDestDir, file);  // Move to feature destination directory
    
    if (!fs.existsSync(destFeatureFilePath)) {

    // Move the file from source to destination
    fs.renameSync(sourceFeatureFilePath, destFeatureFilePath);           // Synchronous file move
    console.log(`Feature file automatically moved to destination folder: ${file}`);
  } else {
    console.log(`File already exists in destination: ${file}`);
  }
}
  // Check if the file is a .java file
   if (file.endsWith('.java')) {
    const sourceJavaFilePath = path.join(sourceDir, file);
    const destJavaFilePath = path.join(javaDestDir, file);     // Move to java destination directory

    if (!fs.existsSync(destJavaFilePath)) {

    // Move the file from source to destination
    fs.renameSync(sourceJavaFilePath, destJavaFilePath);           // Synchronous file move
    console.log(`Java file automatically moved to destination folder: ${file}`);
  } else {
      console.log(`File already exists in destination: ${file}`);
    }
}
});

// Git Operation
// Define the directories
const featureDir = path.join(featureDestDir, 'features');
const stepDefDir = path.join(javaDestDir, 'step-definitions');

// Initialize git
const git = simpleGit();

// Check if the current directory is a git repository
async function checkGitRepo() {
  try {
    const isRepo = await git.checkIsRepo();
    if (!isRepo) {
      console.log('Not a Git repository. Initializing a new Git repository...');
      await git.init();  // Initialize a new Git repository
      console.log('Initialized a new Git repository.');
    } else {
      console.log('This is a Git repository.');
    }
  } catch (error) {
    console.error('Error checking or initializing Git repository:', error);
    process.exit(1); // Exit the script if an error occurs
  }
}
await checkGitRepo();

// Check if the remote "origin" already exists
const remotes = await git.getRemotes(true); // List all remotes with detailed info
const originRemote = remotes.find((remote) => remote.name === "origin");

if (!originRemote) {
  await git.addRemote("origin", "https://github.com/RoomNo55/gitPushJs.git"); // Add remote origin if not set
  console.log("Remote origin added.");
} else {
  console.log("Remote origin already exists, skipping addRemote.");
}

const branchName = 'main';
const remoteName = 'origin';
// Add to Git, commit, stash, pull, and push
async function gitProcess() {
  try {
    // Add only the moved files to Git
    await git.add(['features/*.feature', 'step-definitions/*.java', 'filespush.js', 'node_modules/']);

    // Commit the changes
    await git.commit('Added .feature and .java files to features and step-definitions');


    await git.push(['-u', 'origin', branchName ]);

    // Stash any untracked or modified files
    await git.stash({ '--include-untracked': null });

    // Pull the latest changes from the remote repository
    await git.pull('origin', branchName, { '--rebase': 'true' }); // Use rebase to avoid merge commits

    // Reapply the stashed changes
    await git.stash('pop');

    // Push the changes
    // await git.push('origin', branchName);
    // console.log('Files pushed to Git');

    const pushResponse = await git.pull(['-u', remoteName, branchName]);
    
    // Check if there are any commits done
    if (pushResponse && pushResponse && pushResponse.length > 0) {
      const outputMessages = pushResponse.map(output => output.trim()).join('\n');
      
      if (outputMessages.includes("Already up to date")) {
        console.log('No commits done: No changes to push.');
      } else {
        console.log(`Pushed changes to the remote branch ${branchName} with upstream set.`);
      }
    }
  }  
  catch (err) {
    console.error('Git process failed:', err);
  }
}

// Main process
async function main() {
  await gitProcess();
}

main();

}

uploadToGit();