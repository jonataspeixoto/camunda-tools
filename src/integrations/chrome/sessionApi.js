export async function setSessionStorage(obj) {
  return new Promise((resolve, reject) => {
    chrome.storage.session.set(obj, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        console.log(Object.keys(obj)[0] + " was set on storage");
        resolve();
      }
    });
  });
}

export async function getSessionStorage(key) {
  return new Promise((resolve, reject) => {
    chrome.storage.session.get([key], (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        const values = Object.values(result);
        resolve(values[0]);
      }
    });
  });
}

export async function getAsyncSessionStorage(key) {
  return await getSessionStorage(key);
}
