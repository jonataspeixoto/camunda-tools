export function injectNotification(stringElement){
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs && tabs[0]) {
      const tabId = tabs[0].id;
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        function: injectElementToNotificationMenu,
        args: [stringElement]
      });
    }
  });

  function injectElementToNotificationMenu(stringElement){
    if(!stringElement){
      return;
    }

    let notificationsMenu = document.querySelector('.page-notifications > div');

    tempElement = document.createElement('a');
    
    tempElement.innerHTML += stringElement

    notification = tempElement.getElementsByTagName('div')[0];

    notification.getElementsByTagName('button')[0].addEventListener('click', (event) => {
      console.log(event.target.parentElement.remove())
    });

    notificationsMenu.appendChild(notification);
  }
}

export function selectElementOnPage(...arr) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs && tabs[0]) {
      const tabId = tabs[0].id;
      chrome.scripting.insertCSS({
        target: { tabId: tabId },
        files: ["inserted-style.css"],
      });
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        function: handleElementSelection,
        args: [arr],
      });
    }
  });
}

function handleElementSelection(keys) {
  let isSelecting = false;
  let loop = 0;
  const limit = keys.length - 1;

  function enableElementSelection() {
    isSelecting = true;
    document.addEventListener("click", handleElementSelectionOnWebPage);
  }

  function handleElementSelectionOnWebPage(event) {
    if (isSelecting) {
      const selectedElement = elementFilter(event);
      const message = messageFilter(selectedElement);

      console.log(message);

      if (message) {  
        chrome.runtime.sendMessage({ [keys[loop]]: message });
        
        resolveVisualSelection(selectedElement, keys[loop]);

        if (loop == limit) {
          isSelecting = false;

          document.removeEventListener("click", handleElementSelection);
        } else {
          loop++;
        }
      }
    }
  }

  function resolveVisualSelection(element, id){
    document.querySelectorAll("[selected-camunda-tools='" + id + "']").forEach((el) => {
      el.removeAttribute("selected-camunda-tools");
      el.classList.remove("selected-camunda-tools");
    });

    element.setAttribute("selected-camunda-tools", id);
    element.classList.add("selected-camunda-tools");
  }

  function elementFilterMock(event) {
    let selectedElement = null;
    if (!event.target.getAttribute("id")) {
      if (!event.target.parentElement.getAttribute("id")) {
        if (!event.target.parentElement.parentElement.getAttribute("id")) {
          return null;
        } else {
          selectedElement = event.target.parentElement.parentElement;
        }
      } else {
        selectedElement = event.target.parentElement;
      }
    } else {
      selectedElement = event.target;
    }

    return selectedElement.getAttribute("id");
  }

  function elementFilter(event) {
    let selectedElement = getGroupElement(event.target).getElementsByTagName("g")[0]

    if (
      !selectedElement.classList.contains("djs-element") ||
      !selectedElement.classList.contains("djs-shape")
    ) {
      return null;
    }

    const message = selectedElement.getAttribute("data-element-id");

    if (message.includes("_label")) return null;

    return selectedElement;
  }

  function messageFilter(selectedElement){
    return selectedElement.getAttribute("data-element-id");
  }

  function getGroupElement(element){
    if(!element.classList.contains("djs-group")) {
      return getGroupElement(element.parentElement);
    } else {
      return element;
    }
  }

  enableElementSelection();
}

export function reloadCurrentTab(){
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs && tabs[0]) {
      const tabId = tabs[0].id;
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        function: function reload () {
          location.reload();
        }
      });
    }
  })
}