async function parseFileDrop(event) {
  event.preventDefault();

  let validTarget;

  if(event.target.dataset.fullpath) {
    validTarget = event.target;
  } else if(typeof event.target.parentElement !== "undefined" && event.target.parentElement.dataset.fullpath ) {
    validTarget = event.target.parentElement;
  }

  validTarget.classList.remove('dropzone-green');
  let fileArray = window.fileArray ?? [];

  window.asyncStage = []
  let items = [...event.dataTransfer.items].map((i) => i.kind === 'file' ? window.asyncStage.push(i.getAsFileSystemHandle()) : null);

  window.items = await Promise.all(window.asyncStage);
    for(let item of window.items) {
      let entry = item;
        if (entry.kind === "file") {
          fileArray.push({
            file: entry,
            path: entry.name,
            parent: ""
          })

        } else if (entry.kind === "directory") {
          console.log(entry)
          let nestedFiles = await extractAllFiles(entry, entry.name);
          fileArray = [...fileArray, ...nestedFiles];
        }
    }

  window.fileArray = fileArray;
  let dropzonePath = validTarget.dataset['fullpath'].replaceAll('/home/okular/rolling-hills/FXServer/server-data/resources/', "").replaceAll("//", "/").replaceAll("//", "/");
  let uploadPath = dropzonePath;
  window.dropzonePath = dropzonePath;
  window.dropzoneLabel = dropzonePath === "" || dropzonePath === "/" ? "resources/" : "resources" + dropzonePath.replaceAll("//", "/");
  showUploadDialog(uploadPath);
}

async function extractAllFiles(directoryHandle, directoryName) {
  let files = [];

  for await(let handle of directoryHandle.values()) {
    if(handle.kind === "file") {
      files.push({
        file: handle,
        path: directoryName + "/" + handle.name,
        parent: directoryName
      });
    } else if(handle.kind === "directory") {
      let nestedFiles = await extractAllFiles(handle, directoryName + "/" + handle.name);
      files = [...files, ...nestedFiles]
    }
  }

  return files;
}

function dragOverHandler(ev) {
  if(ev.target.dataset && ev.target.dataset.fullpath) {
    ev.target.classList.add('dropzone-green');
  } else if(typeof ev.target.parentElement !== "undefined" && ev.target.parentElement.dataset && ev.target.parentElement.dataset.fullpath ) {
    ev.target.parentElement.classList.add('dropzone-green');
  }

  ev.preventDefault();
}

function dragEnter(ev) {
  if(ev.target.dataset && ev.target.dataset.fullpath) {
    ev.target.classList.add('dropzone-green');
  } else if(typeof ev.target.parentElement !== "undefined" && ev.target.parentElement.dataset && ev.target.parentElement.dataset.fullpath ) {
    ev.target.parentElement.classList.add('dropzone-green');
  }
}

function dragLeave(ev) {
  if(ev.target.dataset.fullpath) {
    ev.target.classList.remove('dropzone-green');
  } else if(typeof ev.target.parentElement !== "undefined" && ev.target.parentElement.dataset && ev.target.parentElement.dataset.fullpath ) {
    ev.target.parentElement.classList.remove('dropzone-green');
  }
}

function gzipFile(fileHandle) {
  const stream = fileHandle.stream();
  const compressedReadableStream = stream.pipeThrough(new CompressionStream('gzip'));
  return compressedReadableStream;
}
