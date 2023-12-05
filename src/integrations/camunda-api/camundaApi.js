import {
  getAsyncSessionStorage,
  setSessionStorage,
} from "../chrome/sessionApi.js";

function searchAndStorageJson(fileName) {
  chrome.runtime.getPackageDirectoryEntry(function (rootDir) {
    rootDir.getFile("json/" + fileName + ".json", {}, function (fileEntry) {
      fileEntry.file(function (file) {
        const reader = new FileReader();
        reader.onload = function (event) {
          const jsonText = event.target.result;
          setSessionStorage({ [fileName]: jsonText });
        };
        reader.readAsText(file);
      });
    });
  });
}

searchAndStorageJson("processInstanceModification");
searchAndStorageJson("listProcessByActivity");

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

export async function listProcessInstanceByActivityId(body) {
  let baseUrl = await getBaseUrl();

  let fullUrl = baseUrl + "/engine-rest/process-instance";

  console.log(fullUrl, body);

  return fetch(fullUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

export async function getAllProcessInstanceByActivityAndProcessDefinition(
  processDefinition,
  activityId
) {
  console.log(processDefinition);
  console.log(activityId);

  if (!processDefinition) {
    throw new Error("Missing processDefinition parameter");
  }
  if (
    !activityId ||
    activityId.length < 1 ||
    !activityId?.[0] ||
    activityId?.[0].length < 1
  ) {
    throw new Error("Missing activityId parameter");
  }

  const body = JSON.parse(
    await getAsyncSessionStorage("listProcessByActivity")
  );
  body.processDefinitionId = processDefinition;
  body.activityIdIn = activityId;

  console.log(body);

  try {
    return await listProcessInstanceByActivityId(body);
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function processInstanceMove(
  processInstance,
  cancel,
  startBeforeActivity
) {
  return new Promise(async (resolve, reject) => {
    console.log(processInstance);
    console.log(cancel);
    console.log(startBeforeActivity);

    if (!processInstance) {
      reject(new Error("Missing processInstance parameter"));
      return;
    }
    if (
      !cancel ||
      cancel.length < 1 ||
      !cancel?.[0] ||
      cancel?.[0].length < 1
    ) {
      reject(new Error("Missing cancel parameter"));
      return;
    }
    if (
      !startBeforeActivity ||
      startBeforeActivity.length < 1 ||
      !startBeforeActivity?.[0] ||
      startBeforeActivity?.[0].length < 1
    ) {
      reject(new Error("Missing startBeforeActivity parameter"));
      return;
    }

    const body = JSON.parse(
      await getAsyncSessionStorage("processInstanceModification")
    );
    const cancelBody = cancel.map((activityId) => {
      return { type: "cancel", activityId: activityId };
    });
    const startBeforeActivityBody = startBeforeActivity.map((activityId) => {
      return { type: "startBeforeActivity", activityId: activityId };
    });
    body.instructions = startBeforeActivityBody.concat(cancelBody);

    console.log(body);
    try {
      const result = await processInstanceModification(processInstance, body);
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
}
