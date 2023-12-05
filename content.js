import { processInstanceMove } from "./src/integrations/camunda-api/camundaApi.js";
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
import { getProcessInstanceFromUrl } from "./src/script/util.js";

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

let firstActivityMoveInput = document.getElementById("firstActivityMoveInput");
let secondActivityMoveInput = document.getElementById(
  "secondActivityMoveInput"
);
let processInstanceMoveInput = document.getElementById(
  "processInstanceMoveInput"
);
let selectFirstActivityButton = document.getElementById(
  "selectFirstActivityButton"
);
let selectSecondActivityButton = document.getElementById(
  "selectSecondActivityButton"
);

let mainToMoveButton = document.getElementById("mainToMoveButton");
let moveToMainButton = document.getElementById("moveToMainButton");
let executeMove = document.getElementById("executeMove");

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

executeMove.addEventListener("click", () => {
  const promise = processInstanceMove(
    processInstanceMoveInput.value,
    [firstActivityMoveInput.value],
    [secondActivityMoveInput.value]
  );
  promise
    .then(async (response) => {
      if (response.ok) {
        return response.status;
      } else {
        const message = await response.json().then((json) => {
          return json.message;
        });
        throw new Error(message);
      }
    })
    .then((data) => {
      console.log("Process Instance Moved:", data);

      injectNotification(
        createNotification(
          {
            status: "Process Instance Moved:",
            message: "A process instance was successfully moved.",
          },
          "success"
        )
      );

      reloadCurrentTab();
    })
    .catch(async (error) => {
      const message = error.message;

      if (message.includes("Missing")) {
        handleMissingFieldsError(message);
      } else {
        handleExecutionError(message);
      }
    });
});

function handleMissingFieldsError(message) {
  console.error("Missing fields error: " + message);
  injectNotification(
    createNotification(
      {
        status: "Missing fields:",
        message: message,
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
        message: message,
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
