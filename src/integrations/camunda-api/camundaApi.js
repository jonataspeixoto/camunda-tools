import { setSessionStorage, getAsyncSessionStorage } from "../chrome/sessionApi.js";

chrome.runtime.getPackageDirectoryEntry(function (rootDir) {
  rootDir.getFile(
    "json/processInstanceModification.json",
    {},
    function (fileEntry) {
      fileEntry.file(function (file) {
        const reader = new FileReader();
        reader.onload = function (event) {
          const jsonText = event.target.result;
          setSessionStorage({ processInstanceModification: jsonText });
        };
        reader.readAsText(file);
      });
    }
  );
});

async function setUrlToSessionStorage() {
  return chrome.tabs.query(
    { active: true, currentWindow: true },
    function (tabs) {
      if (tabs && tabs[0]) {
        const url = tabs[0].url;
        setSessionStorage({ url: url });
        return url;
      }
      return "";
    }
  );
}

setUrlToSessionStorage();

async function getBaseUrl() {
  return (await getAsyncSessionStorage("url")).replace(/\/camunda\/app.*$/, "");
}

export async function processInstanceModification(
  processInstance,
  modificationBody
) {
  let baseUrl = await getBaseUrl();

  let fullUrl =
    baseUrl +
    "/engine-rest/process-instance/" +
    processInstance +
    "/modification";

  console.log(fullUrl, modificationBody);

  return fetch(fullUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(modificationBody),
  });
}

export async function processInstanceMove(
  processInstance,
  cancel,
  startBeforeActivity
) {
  return new Promise(async (resolve, reject) => {
    if (!processInstance) {
      reject(new Error("Missing processInstance parameter"));
      return;
    }
    if (!cancel || cancel.length < 1 || !cancel?.[0]) {
      reject(new Error("Missing cancel parameter"));
      return;
    }
    if (!startBeforeActivity || startBeforeActivity.length < 1 || !startBeforeActivity?.[0]) {
      reject(new Error("Missing startBeforeActivity parameter"));
      return;
    }

    const body = JSON.parse(await getAsyncSessionStorage("processInstanceModification"));
    const cancelBody = cancel.map((activityId) => {
      return { type: "cancel", activityId: activityId };
    });
    const startBeforeActivityBody = startBeforeActivity.map((activityId) => {
      return { type: "startBeforeActivity", activityId: activityId };
    });
    body.instructions = startBeforeActivityBody.concat(cancelBody);

    try {
      const result = await processInstanceModification(processInstance, body);
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
}