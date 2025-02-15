document.addEventListener("DOMContentLoaded", () => {
  const authKeyInput = document.getElementById("authKey");
  const userIdInput = document.getElementById("userId");
  const dcidSelect = document.getElementById("dcid");
  const loginBtn = document.getElementById("loginBtn");
  const errorMsg = document.getElementById("errorMsg");
  const errorBox = document.getElementById("errorBox");

  function validateForm() {
    const authKey = authKeyInput.value.trim();
    const userId = userIdInput.value.trim();
    const dcid = dcidSelect.value.trim();
    let error = "";

    if (authKey.length !== 512) {
      error = "Auth Key must be 512 characters!";
    } else if (!userId) {
      error = "Enter User ID!";
    } else if (!dcid) {
      error = "Select DC ID!";
    }

    errorMsg.textContent = error;
    errorBox.style.display = error ? "block" : "none";
    loginBtn.disabled = !!error;
  }

  [authKeyInput, userIdInput].forEach(el => el.addEventListener("input", validateForm));
  dcidSelect.addEventListener("change", validateForm);

  loginBtn.addEventListener("click", () => {
    const now_unix = Math.floor(Date.now() / 1000);
    const dataForLocalStorage = {
      user_auth: { dcID: dcidSelect.value, id: userIdInput.value },
      tgme_sync: { canRedirect: true, ts: now_unix },
      [`dc${dcidSelect.value}_auth_key`]: `"${authKeyInput.value.trim()}"`,
      dc: dcidSelect.value
    };

    chrome.tabs.query({ url: "*://web.telegram.org/*" }, (tabs) => {
      if (!tabs || !tabs.length) {
        alert("No open tab with https://web.telegram.org!");
        return;
      }
      const [{ id: tabId }] = tabs;
      chrome.scripting.executeScript(
        {
          target: { tabId },
          func: (inputData) => {
            localStorage.clear();
            Object.keys(inputData).forEach(key => {
              const val = typeof inputData[key] === "object"
                ? JSON.stringify(inputData[key])
                : inputData[key];
              localStorage.setItem(key, val);
            });
          },
          args: [dataForLocalStorage]
        },
        () => alert("Authorized")
      );
    });
  });
});
