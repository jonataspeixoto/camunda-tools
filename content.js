import {
  getAllProcessInstanceByActivityAndProcessDefinition,
  processInstanceMove
} from "./src/integrations/camunda-api/camundaApi.js";
import { createNotification } from "./src/integrations/camunda-cockpit/cockpitInjections.js";
import {
  getAsyncSessionStorage,
  getSessionStorage,
  setSessionStorage,
} from "./src/integrations/chrome/sessionApi.js";
import {
  injectNotification,
  reloadCurrentTab,
  selectElementOnPage,
} from "./src/integrations/tab/pageActions.js";
import {
  getProcessDefinitionFromUrl,
  getProcessInstanceFromUrl
} from "./src/script/util.js";

let screens = {
  main: document.getElementById("main"),
  move: document.getElementById("move"),
};

function showCurrentScreen(screen) {
  screen = screen || "main";
  Object.values(screens).forEach((el) => el.classList.add("hidden"));
  screens[screen].classList.remove("hidden");
}

getSessionStorage("screenState").then((result) => showCurrentScreen(result));

let processInstanceMoveInput = document.getElementById("processInstanceMoveInput");
let processDefinitionMoveInput = document.getElementById("processDefinitionMoveInput");
let firstActivityMoveInput = document.getElementById("firstActivityMoveInput");
let secondActivityMoveInput = document.getElementById("secondActivityMoveInput");
let selectFirstActivityButton = document.getElementById("selectFirstActivityButton");
let selectSecondActivityButton = document.getElementById("selectSecondActivityButton");
let processGroupCheckbox = document.getElementById("processGroupCheckbox");
let mainToMoveButton = document.getElementById("mainToMoveButton");
let moveToMainButton = document.getElementById("moveToMainButton");
let executeMove = document.getElementById("executeMove");
let executeMoveAllProcess = document.getElementById("executeMoveAllProcess");

let processGroup = {
  instanceGroup: document.getElementsByClassName("instanceGroup"),
  definitionGroup: document.getElementsByClassName("definitionGroup"),
};

function isMultipleProcessSelected() {
  return processGroupCheckbox.checked || false;
}

function showCurrentProcessGroup() {
  Array.from(Object.values(processGroup)).forEach((item) =>
    Array.from(item).forEach((el) => el.classList.add("hidden"))
  );
  if (isMultipleProcessSelected()) {
    Array.from(processGroup.definitionGroup).forEach((el) =>
      el.classList.remove("hidden")
    );
  } else {
    Array.from(processGroup.instanceGroup).forEach((el) =>
      el.classList.remove("hidden")
    );
  }
}

getSessionStorage("processGroupCheckbox").then(async (result) => {
  processGroupCheckbox.checked = result || false;
  setSessionStorage({ processGroupCheckbox: processGroupCheckbox.checked });
  showCurrentProcessGroup();
});

processGroupCheckbox.addEventListener("change", () => {
  setSessionStorage({ processGroupCheckbox: processGroupCheckbox.checked });
  showCurrentProcessGroup();
});

selectFirstActivityButton.addEventListener("click", () => {
  selectElementOnPage("firstActivity");
  window.close();
});

selectSecondActivityButton.addEventListener("click", () => {
  selectElementOnPage("secondActivity");
  window.close();
});

getSessionStorage("processInstance").then(async (result) => {
  processInstanceMoveInput.value =
    getProcessInstanceFromUrl(await getAsyncSessionStorage("url")) ||
    result ||
    "";
  setSessionStorage({ processInstance: processInstanceMoveInput.value });
});

processInstanceMoveInput.addEventListener("change", () => {
  setSessionStorage({ processInstance: processInstanceMoveInput.value });
});

getSessionStorage("processDefinition").then(async (result) => {
  processDefinitionMoveInput.value =
    getProcessDefinitionFromUrl(await getAsyncSessionStorage("url")) ||
    result ||
    "";
  setSessionStorage({ processDefinition: processDefinitionMoveInput.value });
});

processDefinitionMoveInput.addEventListener("change", () => {
  setSessionStorage({ processDefinition: processDefinitionMoveInput.value });
});

getSessionStorage("firstActivity").then((result) => {
  firstActivityMoveInput.value = result || "";
  setSessionStorage({ firstActivity: firstActivityMoveInput.value });
});

firstActivityMoveInput.addEventListener("change", () => {
  setSessionStorage({ firstActivity: firstActivityMoveInput.value });
});

getSessionStorage("secondActivity").then((result) => {
  secondActivityMoveInput.value = result || "";
  setSessionStorage({ secondActivity: secondActivityMoveInput.value });
});

secondActivityMoveInput.addEventListener("change", () => {
  setSessionStorage({ secondActivity: secondActivityMoveInput.value });
});

mainToMoveButton.addEventListener("click", () => {
  let screenState = "move";

  setSessionStorage({ screenState: screenState });

  showCurrentScreen(screenState);
});

moveToMainButton.addEventListener("click", () => {
  let screenState = "main";

  setSessionStorage({ screenState: screenState });

  showCurrentScreen(screenState);
});

executeMove.addEventListener("click", async () => {

  executeMove.disabled = true;

  const processInstance = await getAsyncSessionStorage("processInstance");
  const cancel = await getAsyncSessionStorage("firstActivity");
  const startBeforeActivity = await getAsyncSessionStorage("secondActivity");

  console.log(processInstance);
  console.log(cancel);
  console.log(startBeforeActivity);

  try {
    const response = await moveProcessInstance(processInstance, [cancel], [startBeforeActivity])

      console.log('result', response);
      if (response.status === 'success'){
        handleProcessMovedSuccess();

        setSessionStorage({firstActivity: ""});
        firstActivityMoveInput.value = "";
        setSessionStorage({secondActivity: ""});
        secondActivityMoveInput.value = "";

        reloadCurrentTab();
      } else {

        const message = response.result.message;

        if (message.includes("Missing")) {
          handleMissingFieldsError(message);
        } else {
          handleExecutionError(message);
        }
      }
  } catch (error){
    console.error(error);
  } finally {
    executeMove.disabled = false;
  }
});

executeMoveAllProcess.addEventListener("click", async () => {
 
  executeMoveAllProcess.disabled = true;

  const processDefinition = await getAsyncSessionStorage("processDefinition");
  const cancel = await getAsyncSessionStorage("firstActivity");
  const startBeforeActivity = await getAsyncSessionStorage("secondActivity");

  console.log(processDefinition);
  console.log(cancel);
  console.log(startBeforeActivity);

  const summary = {
    errors: [],
    success: []
  };

  try {
    const response = await getAllProcessInstanceByActivityAndProcessDefinition(
      processDefinition,
      [cancel]
    );
    if (response.ok) {
      const processInstanceArray = await response.json();
      console.log(processInstanceArray);

      if(processInstanceArray.length === 0){
        throw new Error(`No process instances found in this activity (${cancel}) and process definition (${processDefinition})`);
      }
      let i = 0;
      const movePromises = processInstanceArray.map(async (processInstance) => {
        const response = await moveProcessInstance(
          processInstance.id, 
          [cancel], 
          [startBeforeActivity]
        );
        if (response.status === 'success'){
          summary.success.push(processInstance.id);
        } else {
          summary.errors.push({ id: processInstance.id, message: response.result });
        }
      });

      await Promise.all(movePromises);

      return 'success';
    } else {
      throw new Error(response.json().message)
    }
  } catch (error) {
    const message = error.message;

    if (message.includes("Missing")) {
      handleMissingFieldsError(message);
    } else {
      handleExecutionError(message);
    }

    return 'error';
    
  } finally {
    setSessionStorage({firstActivity: ""});
    firstActivityMoveInput.value = "";
    setSessionStorage({secondActivity: ""});
    secondActivityMoveInput.value = "";

    if (summary.success.length > 0) {
      handleProcessMovedSuccess(`Success: ${summary.success.length} instance(s) moved successfully.`);
      console.log(`Success: ${summary.success.length} instance(s) moved successfully.`);
    }

    if (summary.errors.length > 0) {
      handleExecutionError(`Error: ${summary.errors.length} instance(s) failed to move.`);
      console.error(`Error: ${summary.errors.length} instance(s) failed to move. Details: ${summary.errors}`);
    }
    executeMoveAllProcess.disabled = false;
  }
});

async function moveProcessInstance(processInstance, cancel, startBeforeActivity) {
  try {
    const response = await processInstanceMove(processInstance, cancel, startBeforeActivity);

    if (response.ok) {
      return {
        status: 'success',
        result: response.status
      };
    } else {
      const message = await response.json().then((json) => {
        return json.message;
      });
      throw new Error(message);
    }
  } catch (error) {
    return {
      status: 'error',
      result: error
    };
  }
}


function handleProcessMovedSuccess(message) {
  console.log("Process Instance Moved:", message);
  injectNotification(
    createNotification(
      {
        status: "Process Instance Moved:",
        message: message || "A process instance was successfully moved.",
      },
      "success"
    )
  );
}

function handleMissingFieldsError(message) {
  console.error("Missing fields error: " + message);
  injectNotification(
    createNotification(
      {
        status: "Missing fields:",
        message: message || "Some fields are missing",
      },
      "warning"
    )
  );
}

function handleExecutionError(message) {
  console.error("Execution error: " + message);
  injectNotification(
    createNotification(
      {
        status: "Execution error:",
        message: message || "Some error happened",
      },
      "error"
    )
  );
}

function handleOtherErrors(error) {
  console.error("Other error: " + error.message);
  injectNotification(
    createNotification(
      {
        status: "Error:",
        message: error.message,
      },
      "warning"
    )
  );
}
