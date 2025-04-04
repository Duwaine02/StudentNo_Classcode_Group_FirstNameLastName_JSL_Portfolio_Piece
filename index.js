// TASK: import helper functions from utils
import { createNewTask,getTasks,patchTask} from "./utils/taskFunctions.js";
// TASK: import initialData
import { initialData } from "./initialData.js";


/*************************************************************************************************************************************************
 * FIX BUGS!!!
 * **********************************************************************************************************************************************/

// Function checks if local storage already has data, if not it loads initialData to localStorage
function initializeData() {
  if (!localStorage.getItem('tasks')) {
    localStorage.setItem('tasks', JSON.stringify(initialData)); 
    localStorage.setItem('showSideBar', 'true')
  } else { 
    console.log('Data already exists in Localstorage');
  }
};

// TASK: Get elements from the DOM
const elements = {
  sidebar: document.getElementById("side-bar-div"),
  sidebarLogo: document.getElementById("side-logo-div"),
  boardsNavLinksDiv: document.getElementById("boards-nav-links-div"),
  filterDiv: document.getElementById("filter-Div"),
  modalWindow: document.getElementById("new-task-modal-window"),
  headerBoardName: document.getElementById("header-board-name"),
  columnDivs: document.querySelectorAll(".column-div"),
  editTaskModal: document.getElementById("edit-task-form"),
  themeSwitch: document.getElementById("switch"),
  createNewTaskBtn: document.getElementById("create-task-btn"),
  cancelEditBtn: document.getElementById("cancel-edit-btn"),
  cancelAddTaskBtn: document.getElementById("cancel-add-task-btn"),
  hideSideBarBtn: document.getElementById("hide-side-bar-btn"),
  showSideBarBtn: document.getElementById("show-side-bar-btn"),
  taskTitleInput: document.getElementById("modal-title-input"),
  taskDescriptionInput: document.getElementById("modal-desc-input"),
};

let activeBoard = "";

// Extracts unique board names from tasks
// TASK: FIX BUGS
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();
  const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];
  displayBoards(boards);
  if (boards.length > 0) {
    const localStorageBoard = localStorage.getItem("activeBoard");
    activeBoard = localStorageBoard ? JSON.parse(localStorageBoard) : boards[0];
    elements.headerBoardName.textContent = activeBoard;
    styleActiveBoard(activeBoard);
    refreshTasksUI();
  }
}

// Creates different boards in the DOM
// TASK: Fix Bugs
function displayBoards(boards) {
  const boardsNavlinksDiv = document.getElementById("boards-nav-links-div")
  if (!elements.boardsNavLinksDiv) return;
  
  elements.boardsNavLinksDiv.innerHTML = '';

  boards.forEach(board => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");

    boardElement.addEventListener("click", function() {
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board;
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard));
      styleActiveBoard(activeBoard);
    });
    elements.boardsNavLinksDiv.appendChild(boardElement);
  });
  console.log("displayBoards")
}


// Filters tasks corresponding to the board name and displays them on the DOM.
// TASK: Fix Bugs
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks();// Fetch tasks from a simulated local storage function
  const filteredTasks = tasks.filter(task => task.board === boardName);

    // Ensure the column titles are set outside of this function or correctly initialized before this function runs

  elements.columnDivs.forEach(column => {
    const status = column.getAttribute("data-status");
     // Reset column content while preserving the column title
    column.innerHTML = 
      `<div class="column-head-div">
        <span class="dot" id="${status}-dot"></span>
        <h4 class="columnHeader">${status.toUpperCase()}</h4>
      </div>`;

    const tasksContainer = document.createElement("div");
    tasksContainer.classList.add("tasks-container");
    column.appendChild(tasksContainer);

    const statusTasks = filteredTasks.filter(task => task.status === status);
    statusTasks.forEach(task => {
      const taskElement = document.createElement("div");
      taskElement.classList.add("task-div");
      taskElement.textContent = task.title;
      taskElement.setAttribute('data-task-id', task.id);

         // Listen for a click event on each task and open a modal

      taskElement.addEventListener("click", function() {
        openEditTaskModal(task);
      });

      tasksContainer.appendChild(taskElement);
    });
  });
}


function refreshTasksUI() {
  console.log(activeBoard)
  filterAndDisplayTasksByBoard(activeBoard);
}

refreshTasksUI();

// Styles the active board by adding an active class
//TASK: FIX BUGS
function styleActiveBoard(boardName) {
  document.querySelectorAll('.board-btn').forEach(btn => {

    if (btn.textContent === boardName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}


function addTaskToUI(task) {
  const column = document.querySelector(`.column-div[data-status="${task.status}"]`);

  if (!column) {
    console.error(`Column not found for status: ${task.status}`);
    return;
  }

  let tasksContainer = column.querySelector('.tasks-container');
  if (!tasksContainer) {
    console.warn(`Tasks container not found for status: ${task.status}, creating one.`);
    tasksContainer = document.createElement('div');
    tasksContainer.className = 'tasks-container';
    column.appendChild(tasksContainer);
  }

  const taskElement = document.createElement('div');
  taskElement.className = 'task-div';  taskElement.textContent = task.title; //Modify as needed
  taskElement.setAttribute('data-task-id', task.id);
  
  taskElement.addEventListener('click', () => openEditTaskModal(task));
    tasksContainer.appendChild(taskElement);
}



function setupEventListeners() {
  // Cancel editing task event listener
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  cancelEditBtn.addEventListener('click', () => toggleModal(false, elements.editTaskModal));


  // Cancel adding new task event listener
  const cancelAddTaskBtn = document.getElementById('cancel-add-task-btn');
  cancelAddTaskBtn.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Clicking outside the modal to close it
  elements.filterDiv.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Show sidebar event listener
  elements.hideSideBarBtn.addEventListener('click', () => toggleSidebar(false));
  elements.showSideBarBtn.addEventListener('click', () => toggleSidebar(true));


  // Theme switch event listener
  elements.themeSwitch.addEventListener('change', toggleTheme);

  // Show Add New Task Modal event listener
  elements.createNewTaskBtn.addEventListener('click', () => {
    toggleModal(true);
    elements.filterDiv.style.display = 'block'; // Also show the filter overlay
  });

  // Add new task form submission event listener
  elements.modalWindow.addEventListener('submit',  (event) => {
    addTask(event)
  });
}
setupEventListeners();

//Toggle task modal
//fix: fix bugs
function toggleModal(show, modal = elements.modalWindow) {
  if (!modal) return;
  modal.style.display = show ? 'block' : 'none';
  elements.filterDiv.style.display = show ? 'block' : 'none';
}
toggleModal();

/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 ***********************************************************************************************************************************************/
function addTask(event) {
  event.preventDefault();

  const task = {
    id: Date.now(),
    title : elements.taskTitleInput.value,
    description : elements.taskDescriptionInput.value,
    status : 'todo',
    board : activeBoard
  };
  console.log("task")

  const newTask = createNewTask(task);
  if (newTask) {
    addTaskToUI(newTask);
    toggleModal(false);
    if (event.target.tagName === "FORM") {
      event.target.reset();
     
    }
  }
  console.log(task)
  console.log(newTask)
}

refreshTasksUI();


function toggleSidebar(show) {
  if (!elements.sidebar || !elements.showSideBarBtn) return;

  elements.sidebar.style.display = show ? "flex" : "none";
  elements.sidebar.classList.toggle("hidden", !show);
  elements.showSideBarBtn.style.display = show ? "none" : "block";
  localStorage.setItem('showSideBar', String(show));
}

function toggleTheme(theme) {
  const icondark = document.getElementById("icon-dark");
  const iconlight = document.getElementById("icon-light");

  if (elements.themeSwitch) {
    elements.themeSwitch.addEventListener('change', (event) => {
      const newTheme = event.target.checked ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
    });
  }

  if (theme === "dark") {
    document.body.classList.add("dark-theme");
    icondark && (icondark.style.display = "block");
    iconlight && (iconlight.style.display = "none");
  } else {
    document.body.classList.remove("dark-theme");
    icondark && (icondark.style.display = "none");
    iconlight && (iconlight.style.display = "block");
  }

  console.log("toggleTheme applied");
}

toggleTheme(); // Called after load



function openEditTaskModal(task) {

  if (!elements.editTaskModal) return;

  elements.taskTitleInput.value = task.title;
  elements.taskDescriptionInput.value = task.description;
  if (elements.taskDueDateInput) elements.taskDueDateInput.value = task.dueDate || '';
  if (elements.taskPrioritySelect) elements.taskPrioritySelect.value = task.priority || '';

  const saveChangesBtn = document.getElementById("saveTaskChanges");
  const deleteTaskBtn = document.getElementById("deleteTask");

  if (saveChangesBtn) {
    saveChangesBtn.onclick = function() {
      saveTaskChanges(task.id);
    };
  }

  if (deleteTaskBtn) {
    deleteTaskBtn.onclick = function() {
      deleteTask(task.id);
      toggleModal(false, elements.editTaskModal);
    };
  }
  console.log('openEditTaskModal')

  toggleModal(true, elements.editTaskModal);
}


function saveTaskChanges(taskId) {
  // Get new user inputs
  const updatedTask = {

    title: elements.taskTitleInput.value,
    description: elements.taskDescriptionInput.value,
    dueDate: elements.taskDueDateInput ? elements.taskDueDateInput.value : undefined,
    priority: elements.taskPrioritySelect ? elements.taskPrioritySelect.value : undefined
  };

  console.log("saveTaskChanges")

  patchTask(taskId, updatedTask);
  toggleModal(false, elements.editTaskModal);//  refreshTasksUI();
}

saveTaskChanges();



/*************************************************************************************************************************************************/

//  Your existing DOMContentLoaded setup
document.addEventListener('DOMContentLoaded', function () {
  init();
});

//  Custom init logic (you already had this, just continuing)
function init() {
  initializeData();
  const sidebar = document.getElementById("side-bar-div");
  console.log("Sidebar", sidebar);
  
  const themeSwitch = document.getElementById("switch");
  console.log("themeswitch", themeSwitch);
  
  const iconDark = document.getElementById("icon-dark");
  console.log("icon-dark");

  const iconLight = document.getElementById("icon-light");
  console.log("icon-light");

  //  Restore sidebar and theme state
  const showSidebar = localStorage.getItem('showSideBar') === 'true';
  toggleSidebar(showSidebar);

  const savedTheme = localStorage.getItem('theme') || 'light';
  if (elements.themeSwitch) {
    elements.themeSwitch.checked = savedTheme === 'dark';
  }
  console.log("init")

  // Add all the missing button logic below
  setupHeaderButtons();
  setupModalCancelButtons();
}



// This function handles all the header actions
function setupHeaderButtons() {
  // Add Task Button opens new task modal
  const addTaskBtn = document.getElementById("add-new-task-btn");
  if (addTaskBtn) {
    addTaskBtn.addEventListener("click", () => {
      toggleModal(true, elements.modalWindow);
    });
  }

  // this is the editboard div that hold a button which the button has a addeventlistener which is clickable
  const editBoardBtn = document.getElementById("edit-board-btn");// here we just calling the document by ID from the html file
  const editBoardDiv = document.getElementById("editBoardDiv");
  if (editBoardBtn && editBoardDiv) { 
    editBoardBtn.addEventListener("click", () => {
      const isVisible = editBoardDiv.style.display === "block";
      editBoardDiv.style.display = isVisible ? "none" : "block";
    });
  }

  // Delete Board Button clears tasks for current board
  const deleteBoardBtn = document.getElementById("deleteBoardBtn");
  if (deleteBoardBtn) {
    deleteBoardBtn.addEventListener("click", () => {
      const confirmDelete = confirm(`Are you sure you want to delete the board "${activeBoard}"?`);
      if (confirmDelete) {
        const tasks = getTasks();
        const remainingTasks = tasks.filter(task => task.board !== activeBoard);
        localStorage.setItem("tasks", JSON.stringify(remainingTasks));

        // Refresh UI with remaining boards
        fetchAndDisplayBoardsAndTasks();
      }
    });
  }
  console.log("setupHeaderButtons")
}
setupHeaderButtons();


//  Handles modal cancel buttons
function setupModalCancelButtons() {
  if (elements.cancelAddTaskBtn) {
    elements.cancelAddTaskBtn.addEventListener("click", () => toggleModal(false, elements.modalWindow));
  }
  if (elements.cancelEditBtn) {
    elements.cancelEditBtn.addEventListener("click", () => toggleModal(false, elements.editTaskModal));
  }
  console.log("setupModalCancelButtons")
}

//  Create Task Button Listener (if not already added in HTML)
if (elements.createNewTaskBtn) {
  elements.createNewTaskBtn.addEventListener("click", addTask);
  console.log("createNewTaskBtn")
}

 const showSidebar = localStorage.getItem('showSideBar') === 'true';
 toggleSidebar(showSidebar);
 
 const savedTheme = localStorage.getItem('theme') || 'light';
 if (elements.themeSwitch) {
   elements.themeSwitch.checked = savedTheme === 'dark';
   console.log("ThemeSwitch")
 }
setupModalCancelButtons();
fetchAndDisplayBoardsAndTasks();