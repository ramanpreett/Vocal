const storageKey = "vocal-teacher-resources";

const starterSubjects = [
  "Electrical Wiring",
  "Carpentry",
  "Plumbing",
  "Automotive Repair",
  "Tailoring",
  "Computer Applications",
];

let state = { subjects: starterSubjects, resources: [], messages: [] };
let activeSubject = "All Subjects";
let activeConversation = null;

const subjectList = document.querySelector("#subjectList");
const uploadSubject = document.querySelector("#uploadSubject");
const uploadForm = document.querySelector("#uploadForm");
const subjectForm = document.querySelector("#subjectForm");
const addSubjectButton = document.querySelector("#addSubjectButton");
const subjectName = document.querySelector("#subjectName");
const contentTitle = document.querySelector("#contentTitle");
const contentDescription = document.querySelector("#contentDescription");
const contentFile = document.querySelector("#contentFile");
const fileName = document.querySelector("#fileName");
const contentGrid = document.querySelector("#contentGrid");
const emptyState = document.querySelector("#emptyState");
const pageTitle = document.querySelector("#pageTitle");
const contentHeading = document.querySelector("#contentHeading");
const searchInput = document.querySelector("#searchInput");
const dashboardTab = document.querySelector("#dashboardTab");
const messagesTab = document.querySelector("#messagesTab");
const uploadTab = document.querySelector("#uploadTab");
const profileTab = document.querySelector("#profileTab");
const messagesScreen = document.querySelector("#messagesScreen");
const conversationsList = document.querySelector("#conversationsList");
const messagesFeed = document.querySelector("#messagesFeed");
const messageForm = document.querySelector("#messageForm");
const messageInput = document.querySelector("#messageInput");
const activeConversationHeader = document.querySelector("#activeConversationHeader");
const dashboardScreen = document.querySelector("#dashboardScreen");
const uploadScreen = document.querySelector("#uploadScreen");
const profileScreen = document.querySelector("#profileScreen");
const feedSummary = document.querySelector("#feedSummary");
const authScreen = document.querySelector("#authScreen");
const authForm = document.querySelector("#authForm");
const loginUsername = document.querySelector("#loginUsername");
const loginPassword = document.querySelector("#loginPassword");
const authMessage = document.querySelector("#authMessage");
const authSubmit = document.querySelector("#authSubmit");
const authModeButton = document.querySelector("#authModeButton");
const accountName = document.querySelector("#accountName");
const accountAvatar = document.querySelector("#accountAvatar");
const logoutButton = document.querySelector("#logoutButton");
const sidebarToggle = document.querySelector("#sidebarToggle");
const profileUploadButton = document.querySelector("#profileUploadButton");
const profileAvatar = document.querySelector("#profileAvatar");
const profileName = document.querySelector("#profileName");
const profilePostCount = document.querySelector("#profilePostCount");
const profileSubjectCount = document.querySelector("#profileSubjectCount");
const profilePdfCount = document.querySelector("#profilePdfCount");
const profileGrid = document.querySelector("#profileGrid");
const profileEmptyState = document.querySelector("#profileEmptyState");
const postModal = document.querySelector("#postModal");
const modalCloseButton = document.querySelector("#modalCloseButton");
const modalPreview = document.querySelector("#modalPreview");
const modalAvatar = document.querySelector("#modalAvatar");
const modalTeacher = document.querySelector("#modalTeacher");
const modalMeta = document.querySelector("#modalMeta");
const modalTitle = document.querySelector("#modalTitle");
const modalDescription = document.querySelector("#modalDescription");
const modalActions = document.querySelector("#modalActions");
const modalMessageButton = document.querySelector("#modalMessageButton");

let activeView = "dashboard";
let authMode = "login";
let currentUser = null;

document.body.classList.toggle("sidebar-collapsed", localStorage.getItem("vocal-sidebar-collapsed") === "true");
updateSidebarToggleLabel();
loadState();
render();
checkSession();

authForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const username = normalizeUsername(loginUsername.value);
  const password = loginPassword.value;

  if (authMode === "signup") {
    createAccount(username, password).catch(showAuthError);
    return;
  }

  login(username, password).catch(showAuthError);
});

authModeButton.addEventListener("click", () => {
  authMode = authMode === "login" ? "signup" : "login";
  authSubmit.textContent = authMode === "login" ? "Log in" : "Sign up";
  authModeButton.textContent = authMode === "login" ? "Create new account" : "Back to log in";
  loginPassword.autocomplete = authMode === "login" ? "current-password" : "new-password";
  setAuthMessage(authMode === "login" ? "" : "Create an account with a secure server-side password.", "success");
});

logoutButton.addEventListener("click", async () => {
  await fetch("/api/auth/logout", { method: "POST" });
  currentUser = null;
  renderAuth();
});

sidebarToggle.addEventListener("click", () => {
  document.body.classList.toggle("sidebar-collapsed");
  localStorage.setItem("vocal-sidebar-collapsed", document.body.classList.contains("sidebar-collapsed"));
  updateSidebarToggleLabel();
});

addSubjectButton.addEventListener("click", () => {
  subjectForm.classList.toggle("hidden");
  if (!subjectForm.classList.contains("hidden")) {
    subjectName.focus();
  }
});

subjectForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const name = normalizeSubject(subjectName.value);

  if (!name || state.subjects.some((subject) => subject.toLowerCase() === name.toLowerCase())) {
    return;
  }

  const response = await fetch("/api/subjects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });

  if (response.ok) {
    const newState = await response.json();
    state = newState;
    activeSubject = name;
    subjectName.value = "";
    subjectForm.classList.add("hidden");
    render();
  }
});

contentFile.addEventListener("change", () => {
  fileName.textContent = contentFile.files[0]?.name || "Choose teaching content";
});

dashboardTab.addEventListener("click", () => {
  activeView = "dashboard";
  render();
});

messagesTab.addEventListener("click", () => {
  activeView = "messages";
  if (currentUser) fetchMessages();
  render();
});

messageForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!activeConversation) return;
  const content = messageInput.value.trim();
  if (!content) return;
  
  const response = await fetch("/api/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ recipient: activeConversation, content }),
  });
  if (response.ok) {
    const data = await response.json();
    state.messages.push(data.message);
    messageInput.value = "";
    renderMessages();
  }
});

uploadTab.addEventListener("click", () => {
  activeView = "upload";
  render();
});

profileTab.addEventListener("click", () => {
  activeView = "profile";
  render();
});

profileUploadButton.addEventListener("click", () => {
  activeView = "upload";
  render();
});

uploadForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const file = contentFile.files[0];
  if (!file) return;

  const resource = {
    subject: uploadSubject.value,
    title: contentTitle.value.trim(),
    description: contentDescription.value.trim(),
    fileName: file.name,
    fileType: file.type || detectFileType(file.name),
    dataUrl: await readFileAsDataUrl(file),
  };

  const response = await fetch("/api/resources", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(resource),
  });

  if (response.ok) {
    const data = await response.json();
    state.resources.unshift(data.resource);
    activeSubject = data.resource.subject;
    activeView = "dashboard";
    uploadForm.reset();
    fileName.textContent = "Choose teaching content";
    render();
  }
});

searchInput.addEventListener("input", () => {
  activeView = "dashboard";
  render();
});

contentGrid.addEventListener("click", (event) => {
  if (handleMessageClick(event)) return;
  if (handleDeleteClick(event)) return;
  handleOpenPostClick(event);
});

profileGrid.addEventListener("click", (event) => {
  if (handleMessageClick(event)) return;
  if (handleDeleteClick(event)) return;
  handleOpenPostClick(event);
});

contentGrid.addEventListener("keydown", handlePostKeydown);
profileGrid.addEventListener("keydown", handlePostKeydown);

modalCloseButton.addEventListener("click", closePostModal);

modalActions.addEventListener("click", (event) => {
  handleDeleteClick(event);
});

postModal.addEventListener("click", (event) => {
  if (event.target.matches("[data-close-modal]")) {
    closePostModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !postModal.classList.contains("hidden")) {
    closePostModal();
  }
});

function handleMessageClick(event) {
  const messageButton = event.target.closest("[data-message-user]");
  if (!messageButton) return false;

  const user = messageButton.dataset.messageUser;
  activeConversation = user;
  activeView = "messages";
  if (currentUser) fetchMessages();
  render();
  return true;
}

async function handleDeleteClick(event) {
  const deleteButton = event.target.closest("[data-delete-id]");
  if (!deleteButton) return false;

  const resourceId = deleteButton.dataset.deleteId;
  const resourceIndex = state.resources.findIndex((resource) => resource.id === resourceId);
  if (resourceIndex === -1) return true;
  if (!isOwnResource(state.resources[resourceIndex])) {
    return true;
  }

  const response = await fetch(`/api/resources/${resourceId}`, { method: "DELETE" });
  if (response.ok) {
    state.resources.splice(resourceIndex, 1);
    render();
    closePostModal();
  }
  return true;
}

function handleOpenPostClick(event) {
  if (event.target.closest("a, button, video")) return;

  const post = event.target.closest("[data-open-post-id]");
  if (!post) return;

  const resource = state.resources.find((savedResource) => savedResource.id === post.dataset.openPostId);
  if (resource) {
    openPostModal(resource);
  }
}

function handlePostKeydown(event) {
  if (event.key !== "Enter" && event.key !== " ") return;

  const post = event.target.closest("[data-open-post-id]");
  if (!post) return;

  event.preventDefault();
  const resource = state.resources.find((savedResource) => savedResource.id === post.dataset.openPostId);
  if (resource) {
    openPostModal(resource);
  }
}

async function loadState() {
  try {
    const response = await fetch("/api/state");
    if (response.ok) {
      state = await response.json();
      render();
    }
  } catch (error) {
    console.error("Failed to load state", error);
  }
}

async function checkSession() {
  try {
    const response = await fetch("/api/auth/me");
    if (response.ok) {
      const data = await response.json();
      currentUser = data.user;
    }
  } catch {
    setAuthMessage("Start the local server to sign in.", "error");
  }

  render();
}

async function createAccount(username, password) {
  if (!username || password.length < 8) {
    setAuthMessage("Use a username and a password with at least 8 characters.", "error");
    return;
  }

  await authenticate("/api/auth/signup", username, password);
}

async function login(username, password) {
  await authenticate("/api/auth/login", username, password);
}

async function authenticate(url, username, password) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await response.json();

  if (!response.ok) {
    setAuthMessage(data.error || "Authentication failed.", "error");
    return;
  }

  startSession(data.user);
}

function startSession(user) {
  currentUser = user;
  loginPassword.value = "";
  setAuthMessage("", "success");
  render();
}

function showAuthError() {
  setAuthMessage("Authentication server is not available.", "error");
}

function setAuthMessage(message, type) {
  authMessage.textContent = message;
  authMessage.classList.toggle("error", type === "error");
  authMessage.classList.toggle("success", type === "success");
}

function render() {
  renderAuth();
  renderView();
  renderSubjects();
  renderUploadSubjects();
  renderContent();
  renderProfile();
}

function renderAuth() {
  const isLoggedIn = Boolean(currentUser);
  document.body.classList.toggle("auth-active", !isLoggedIn);
  authScreen.classList.toggle("hidden", isLoggedIn);

  if (!isLoggedIn) return;

  accountName.textContent = currentUser.username;
  accountAvatar.textContent = getInitials(currentUser.username) || "T";
}

function renderView() {
  const isUpload = activeView === "upload";
  const isProfile = activeView === "profile";
  const isMessages = activeView === "messages";
  uploadScreen.classList.toggle("hidden", !isUpload);
  dashboardScreen.classList.toggle("hidden", isUpload || isProfile || isMessages);
  profileScreen.classList.toggle("hidden", !isProfile);
  messagesScreen.classList.toggle("hidden", !isMessages);
  uploadTab.classList.toggle("active", isUpload);
  profileTab.classList.toggle("active", isProfile);
  messagesTab.classList.toggle("active", isMessages);
  dashboardTab.classList.toggle("active", activeView === "dashboard");
  if (isMessages) renderMessages();
}

function updateSidebarToggleLabel() {
  const isCollapsed = document.body.classList.contains("sidebar-collapsed");
  const label = isCollapsed ? "Expand sidebar" : "Collapse sidebar";
  sidebarToggle.title = label;
  sidebarToggle.setAttribute("aria-label", label);
}

function renderSubjects() {
  const subjects = ["All Subjects", ...state.subjects];

  subjectList.innerHTML = subjects
    .map((subject) => {
      const count = subject === "All Subjects"
        ? state.resources.length
        : state.resources.filter((resource) => resource.subject === subject).length;

      return `
        <button class="subject-button ${subject === activeSubject ? "active" : ""}" type="button" data-subject="${escapeHtml(subject)}">
          <span>${escapeHtml(subject)}</span>
          <strong>${count}</strong>
        </button>
      `;
    })
    .join("");

  subjectList.querySelectorAll("[data-subject]").forEach((button) => {
    button.addEventListener("click", () => {
      activeSubject = button.dataset.subject;
      activeView = "dashboard";
      render();
    });
  });
}

function renderUploadSubjects() {
  uploadSubject.innerHTML = state.subjects
    .map((subject) => `<option value="${escapeHtml(subject)}">${escapeHtml(subject)}</option>`)
    .join("");

  if (activeSubject !== "All Subjects" && state.subjects.includes(activeSubject)) {
    uploadSubject.value = activeSubject;
  }
}

function renderContent() {
  const query = searchInput.value.trim().toLowerCase();
  const resources = state.resources.filter((resource) => {
    const subjectMatch = activeSubject === "All Subjects" || resource.subject === activeSubject;
    const queryMatch = !query
      || resource.title.toLowerCase().includes(query)
      || (resource.teacher || "").toLowerCase().includes(query)
      || resource.description.toLowerCase().includes(query)
      || resource.fileName.toLowerCase().includes(query);

    return subjectMatch && queryMatch;
  }).sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt));

  pageTitle.textContent = activeSubject === "All Subjects" ? "Recent teacher posts" : activeSubject;
  contentHeading.textContent = activeSubject === "All Subjects" ? "Recently uploaded" : `Recent ${activeSubject} posts`;
  feedSummary.textContent = `${resources.length} ${pluralize("post", resources.length)} in view. Newest uploads appear first.`;
  emptyState.classList.toggle("hidden", resources.length > 0);
  contentGrid.innerHTML = resources.map(renderResourceCard).join("");
}

function renderProfile() {
  if (!currentUser) return;

  const ownResources = state.resources
    .filter((resource) => isOwnResource(resource))
    .sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt));
  const subjectNames = new Set(ownResources.map((resource) => resource.subject));
  const pdfCount = ownResources.filter((resource) => resource.fileType.includes("pdf")).length;

  profileName.textContent = currentUser.username;
  profileAvatar.textContent = getInitials(currentUser.username) || "T";
  profilePostCount.textContent = ownResources.length;
  profileSubjectCount.textContent = subjectNames.size;
  profilePdfCount.textContent = pdfCount;
  profileEmptyState.classList.toggle("hidden", ownResources.length > 0);
  profileGrid.innerHTML = ownResources.map(renderProfileTile).join("");

  if (activeView === "profile") {
    pageTitle.textContent = currentUser.username;
  }
}

function renderProfileTile(resource) {
  const created = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(resource.createdAt));

  return `
    <article class="profile-tile" data-open-post-id="${resource.id}" tabindex="0">
      <div class="preview">
        ${renderPreview(resource)}
      </div>
      <div class="profile-overlay">
        <div>
          <strong>${escapeHtml(resource.title)}</strong>
          <span>${escapeHtml(resource.subject)} &middot; ${created}</span>
        </div>
        <div class="profile-overlay-actions">
          <a class="link-button" href="${resource.dataUrl}" download="${escapeHtml(resource.fileName)}">Download</a>
          <button class="delete-button" type="button" data-delete-id="${resource.id}">Delete</button>
        </div>
      </div>
    </article>
  `;
}

function openPostModal(resource) {
  const created = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(resource.createdAt));
  const deleteAction = isOwnResource(resource)
    ? `<button class="delete-button" type="button" data-delete-id="${resource.id}">Delete</button>`
    : "";

  modalPreview.innerHTML = `<div class="preview">${renderPreview(resource)}</div>`;
  modalAvatar.textContent = getInitials(resource.teacher || "Teacher");
  modalTeacher.textContent = resource.teacher || "Teacher";
  modalMeta.textContent = `${resource.subject} - ${created} - ${labelForType(resource.fileType)}`;
  modalTitle.textContent = resource.title;
  modalDescription.textContent = resource.description || "No description added.";
  modalActions.innerHTML = `
    <a class="link-button" href="${resource.dataUrl}" download="${escapeHtml(resource.fileName)}">Download</a>
    ${deleteAction}
  `;
  
  if (!currentUser || resource.teacher.toLowerCase() === currentUser.username.toLowerCase()) {
    modalMessageButton.classList.add("hidden");
  } else {
    modalMessageButton.classList.remove("hidden");
    modalMessageButton.onclick = () => {
      closePostModal();
      activeConversation = resource.teacher;
      activeView = "messages";
      if (currentUser) fetchMessages();
      render();
    };
  }
  
  postModal.classList.remove("hidden");
  document.body.classList.add("modal-open");
  modalCloseButton.focus();
}

function closePostModal() {
  postModal.classList.add("hidden");
  document.body.classList.remove("modal-open");
  modalPreview.innerHTML = "";
  modalActions.innerHTML = "";
}

function renderResourceCard(resource) {
  const created = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(resource.createdAt));
  const deleteAction = isOwnResource(resource)
    ? `<button class="delete-button" type="button" data-delete-id="${resource.id}">Delete</button>`
    : "";
    
  const messageAction = (!currentUser || isOwnResource(resource))
    ? ""
    : `<button class="secondary-button compact-button" type="button" data-message-user="${escapeHtml(resource.teacher)}" style="margin-left: auto;">Message</button>`;

  return `
    <article class="resource-card" data-open-post-id="${resource.id}" tabindex="0">
      <header class="post-header">
        <span class="avatar">${escapeHtml(getInitials(resource.teacher || "Teacher"))}</span>
        <div>
          <strong>${escapeHtml(resource.teacher || "Teacher")}</strong>
          <span>${escapeHtml(resource.subject)} &middot; ${created} &middot; ${escapeHtml(labelForType(resource.fileType))}</span>
        </div>
      </header>
      <div class="preview">
        ${renderPreview(resource)}
      </div>
      <div class="resource-body">
        <div class="resource-meta">
          <span>${escapeHtml(resource.subject)}</span>
          <span>${escapeHtml(labelForType(resource.fileType))}</span>
        </div>
        <h3>${escapeHtml(resource.title)}</h3>
        <p>${escapeHtml(resource.description || "No description added.")}</p>
        <div class="post-actions">
          <a class="link-button" href="${resource.dataUrl}" download="${escapeHtml(resource.fileName)}">Download</a>
          ${deleteAction}
          ${messageAction}
        </div>
      </div>
    </article>
  `;
}

function renderPreview(resource) {
  if (resource.fileType.startsWith("image/")) {
    return `<img src="${resource.dataUrl}" alt="${escapeHtml(resource.title)}" />`;
  }

  if (resource.fileType.startsWith("video/")) {
    return `<video src="${resource.dataUrl}" controls muted></video>`;
  }

  if (resource.fileType.includes("pdf")) {
    return `
      <div class="pdf-preview" aria-label="PDF preview">
        <object data="${resource.dataUrl}#toolbar=0&navpanes=0&scrollbar=0&page=1&view=FitH" type="application/pdf">
          <span class="file-badge">PDF</span>
        </object>
      </div>
    `;
  }

  return `<span class="file-badge">FILE</span>`;
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function normalizeSubject(value) {
  return value.trim().replace(/\s+/g, " ");
}

function normalizeUsername(value) {
  return value.trim().replace(/\s+/g, "");
}

function detectFileType(name) {
  const lowerName = name.toLowerCase();
  if (lowerName.endsWith(".pdf")) return "application/pdf";
  if (lowerName.endsWith(".mp4")) return "video/mp4";
  if (lowerName.endsWith(".webm")) return "video/webm";
  return "application/octet-stream";
}

function labelForType(type) {
  if (type.startsWith("image/")) return "Diagram";
  if (type.startsWith("video/")) return "Video";
  if (type.includes("pdf")) return "PDF";
  return "File";
}

function isOwnResource(resource) {
  return Boolean(
    currentUser?.username
    && resource.teacher
    && resource.teacher.toLowerCase() === currentUser.username.toLowerCase()
  );
}

function pluralize(word, count) {
  return count === 1 ? word : `${word}s`;
}

function getInitials(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function fetchMessages() {
  if (!currentUser) return;
  const response = await fetch("/api/messages");
  if (response.ok) {
    const data = await response.json();
    state.messages = data.messages;
    renderMessages();
  }
}

function renderMessages() {
  if (activeView !== "messages") return;
  if (!currentUser) {
    messagesFeed.innerHTML = `<div class="empty-state"><h3>Not signed in</h3><p>Sign in to view your messages.</p></div>`;
    return;
  }
  
  const conversations = new Set();
  state.messages.forEach(m => {
    if (m.sender !== currentUser.username) conversations.add(m.sender);
    if (m.recipient !== currentUser.username) conversations.add(m.recipient);
  });
  
  const convoList = Array.from(conversations);
  if (!activeConversation && convoList.length > 0) {
    activeConversation = convoList[0];
  }

  conversationsList.innerHTML = convoList.length === 0 
    ? `<div style="padding:1rem;color:var(--text-dim)">No conversations yet.</div>`
    : convoList.map(user => `
      <button class="subject-button ${user === activeConversation ? 'active' : ''}" type="button" onclick="activeConversation='${escapeHtml(user)}'; renderMessages();">
        <span>${escapeHtml(user)}</span>
      </button>
    `).join("");

  if (activeConversation) {
    activeConversationHeader.textContent = `Chat with ${activeConversation}`;
    messageForm.classList.remove("hidden");
    
    const chatMessages = state.messages.filter(m => 
      (m.sender === currentUser.username && m.recipient === activeConversation) ||
      (m.sender === activeConversation && m.recipient === currentUser.username)
    ).sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt));

    messagesFeed.innerHTML = chatMessages.length === 0
      ? `<div class="empty-state" style="padding:2rem;">Say hi to ${escapeHtml(activeConversation)}!</div>`
      : chatMessages.map(m => {
          const isMine = m.sender === currentUser.username;
          return `
            <div class="chat-bubble ${isMine ? 'mine' : 'theirs'}">
              <div class="chat-sender">${escapeHtml(m.sender)}</div>
              <div class="chat-content">${escapeHtml(m.content)}</div>
            </div>
          `;
        }).join("");
        
    messagesFeed.scrollTop = messagesFeed.scrollHeight;
  } else {
    activeConversationHeader.textContent = "Select a conversation";
    messageForm.classList.add("hidden");
    messagesFeed.innerHTML = "";
  }
}
