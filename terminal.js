let userInput, terminalOutput;
let projAsk = false;
let lastCommands = [];

const COMMANDS = {
help: () => {
    // 1. Get the keys from your registry and sort them first
    const registryKeys = Object.keys(COMMANDS).sort();
    
    // 2. Add your manual/hardcoded commands to the end
    registryKeys.push("cat [filename]", "ls");
    
    // 3. Join them with a space for better readability
    const formattedList = registryKeys.join(", ");
    
    return `Available commands: <span class="help">${formattedList}</span>`;
  },

  github: () => window.open("https://github.com/mrksorrells", "_blank"),
  games: () => 'For my GameJam and various game projects, go to: <a href="https://2ndsoul.itch.io" target="_blank" class="terminal-link">2ndSouls Itch.io</a>',
  projects: () => window.open("pages/projects.html", "_self"),
  history: () => showHist(),
  clear: () => clearScreen(),
  cls: () => clearScreen(),
  sudo: () => "Nice try, but you don't have root privileges here. ;)",
};

const app = () => {
  userInput = document.getElementById("userInput");
  terminalOutput = document.getElementById("terminalOutput");
  document.getElementById("keyboard").focus();
};

// 1. Define static responses or complex functions here


const execute = function executeCommand(input) {
  let rawInput = input.trim();
  let cleanInput = input.toLowerCase().trim();
  lastCommands.push(rawInput);

  if (cleanInput.length === 0) return;

  // Add the prompt line to the terminal first
  terminalOutput.innerHTML += `<div class="terminal-line"><span class="success">➜</span> <span class="directory">~</span> ${rawInput}</div>`;

  // --- Handle LS Command ---
  if (cleanInput === "ls") {
    fetch("docs/directory.json")
      .then(res => res.json())
      .then(files => {
        let fileList = files.join("&nbsp;&nbsp;&nbsp;");
        printToTerminal(`<span style="color: #50fa7b;">${fileList}</span>`);
      })
      .catch(() => printToTerminal(`<span style="color: #ff5555;">Error: Could not read directory.</span>`));
    return;
  }

  // --- Handle CAT Command ---
  if (cleanInput.startsWith("cat ")) {
    let fileName = rawInput.split(" ")[1];
    fetch("docs/" + fileName)
      .then(res => {
        if (!res.ok) throw new Error();
        return res.text();
      })
      .then(text => {
        let formattedText = text.replace(/</g, "&lt;").replace(/\n/g, "<br>");
        printToTerminal(formattedText);
      })
      .catch(() => printToTerminal(`<span style="color: #ff5555;">File not found: ${fileName}</span>`));
    return;
  }

  // --- Handle Registry Commands ---
  // If the input exists in our COMMANDS object, run it
  if (COMMANDS.hasOwnProperty(cleanInput)) {
    const result = COMMANDS[cleanInput]();
    if (result) printToTerminal(result);
  } else if (cleanInput.includes("sudo")) {
    printToTerminal(COMMANDS.sudo());
  } else {
    printToTerminal(`command not found: ${rawInput}`);
  }
};

// Helper function to handle the repetitive UI updates
function printToTerminal(htmlContent) {
  terminalOutput.innerHTML += `<div class="terminal-line">${htmlContent}</div>`;
  
  // CHANGE: Target the parent window that actually has the scrollbar
  const scrollContainer = document.querySelector(".terminal-window");
  scrollContainer.scrollTop = scrollContainer.scrollHeight;
  
  userInput.innerHTML = "";
}

const key = (e) => {
  const input = userInput.innerHTML;

  if (e.key === "Enter") {
    execute(input);
    userInput.innerHTML = "";
    return;
  }

  userInput.innerHTML = input + e.key;
};

const backspace = (e) => {
  if (e.keyCode !== 8 && e.keyCode !== 46) {
    return;
  }
  userInput.innerHTML = userInput.innerHTML.slice(
    0,
    userInput.innerHTML.length - 1
  );
};

function showHist() {
  terminalOutput.innerHTML = `${
    terminalOutput.innerHTML
  }<div class="terminal-line">${lastCommands.join(", ")}</div>`;
}

let iter = 0;
const up = (e) => {
  if (e.key === "ArrowUp") {
    if (lastCommands.length > 0 && iter < lastCommands.length) {
      iter += 1;
      userInput.innerHTML = lastCommands[lastCommands.length - iter];
    }
  }

  if (e.key === "ArrowDown") {
    if (lastCommands.length > 0 && iter > 1) {
      iter -= 1;
      userInput.innerHTML = lastCommands[lastCommands.length - iter];
    }
  }
};

function clearScreen() {
  location.reload();
}
document.addEventListener("keydown", up);

document.addEventListener("keydown", backspace);
document.addEventListener("keypress", key);
document.addEventListener("DOMContentLoaded", app);


class Terminal extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    // Inside connectedCallback()
this.innerHTML = `
  <div class="fakeScreen">
    <div class="terminal-window primary-bg" onclick="document.getElementById('keyboard').focus();">
      <div id="terminalOutput">
        <div class="terminal-line">
          <span class="help-msg">Type <span class="help">help</span> to get started</span>
        </div>
      </div>
      <div class="terminal-line input-line">
        <span class="success">➜</span>
        <span class="directory">~</span>
        <span class="user-input" id="userInput"></span>
        <span class="line anim-typewriter"></span>
        <input type="text" id="keyboard" class="dummy-keyboard" />
      </div>
    </div>
  </div>
`;
  }
}

customElements.define("terminal-js", Terminal);
