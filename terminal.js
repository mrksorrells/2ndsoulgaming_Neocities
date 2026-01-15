let userInput, terminalOutput;
let projAsk = false;
let lastCommands = [];

const COMMANDS = {
  command1: `You can use <pre style="color:red">HTML, CSS, and JavaScript</tags> for commands! Try clicking on <h1 onclick="alert('hihi')">me<img src="https://media.giphy.com/media/3o7bu0ZQQp2QQQQQQQ/giphy.gif" alt="" width=50px height=50px></h1>`,
};

const app = () => {
  userInput = document.getElementById("userInput");
  terminalOutput = document.getElementById("terminalOutput");
  document.getElementById("keyboard").focus();
};

const execute = function executeCommand(input) {
  // 1. Keep a "raw" copy of the input so we preserve filename casing
  let rawInput = input;

  // 2. Lowercase the input for command matching (so 'CAT' works same as 'cat')
  input = input.toLowerCase();

  lastCommands.push(input);
  let output;

  if (input.length === 0) {
    return;
  }

  // --- NEW: The 'cat' command logic ---
  if (input.startsWith("cat ")) {
    // Split the RAW input to get the actual filename (e.g., "Newly_added_features.md")
    // We split by space and take the second part
    let fileName = rawInput.split(" ")[1];

    // Add the user's command to the screen immediately
    terminalOutput.innerHTML += `<div class="terminal-line"><span class="success">➜</span> <span class="directory">~</span> ${rawInput}</div>`;

    // Fetch the file content
    fetch(fileName)
    .then(response => {
      if (!response.ok) {
        throw new Error("File not found");
      }
      return response.text();
    })
    .then(text => {
      // Convert plain text line breaks to HTML <br> so it looks right
      // We also wrap it in <pre> tags to keep the spacing valid
      let formattedText = text.replace(/\n/g, "<br>");

      terminalOutput.innerHTML += `<div class="terminal-line">${formattedText}</div>`;
      terminalOutput.scrollTop = terminalOutput.scrollHeight;
    })
    .catch(error => {
      terminalOutput.innerHTML += `<div class="terminal-line" style="color: #ff5555;">Error: ${error.message} (Did you spell the file name correctly?)</div>`;
      terminalOutput.scrollTop = terminalOutput.scrollHeight;
    });

    // Return early so we don't trigger the "command not found" logic below
    return;
  }
  // ------------------------------------

  if (input.indexOf("sudo") >= 0) {
    input = "sudo";
  }

  if (input == "projects") {
    open("pages/projects.html");
  } else if (input === "clear" || input === "cls") {
    clearScreen();
  } else if (input === "history") {
    showHist();
  } else if (input === "github") {
    open("https://github.com/terminal-js");
  } else {
    // Modified to use rawInput for display so it looks nicer
    output = `<div class="terminal-line"><span class="success">➜</span> <span class="directory">~</span> ${rawInput}</div>`;
    if (!COMMANDS.hasOwnProperty(input)) {
      output += `<div class="terminal-line">command not found: ${rawInput}</div>`;
    } else {
      output += COMMANDS[input];
    }

    // Your fixed line from before (no extra <br>)
    terminalOutput.innerHTML = `${terminalOutput.innerHTML}<div class="terminal-line">${output}</div>`;
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
  }
};

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
    this.innerHTML = `
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
    <script src="https://kit.fontawesome.com/3f2db6afb6.js" crossorigin="anonymous"></script>
    <div class="terminal_window" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"></div>
    <div class="fakeMenu">
      <div class="fakeButtons fakeClose"></div>
      <div class="fakeButtons fakeMinimize"></div>
      <div class="fakeButtons fakeZoom"></div>
    </div>
    <div class="fakeScreen">
      <div class="terminal-window primary-bg" onclick="document.getElementById('dummyKeyboard').focus();">
        <div class="terminal-output" id="terminalOutput">
          <div class="terminal-line">
            <span class="help-msg">Type <span class="help">command1</span> to get started</span>
              commands.<br>
          </div>
        </div>
        <div class="terminal-line">
          <span class="success">➜</span>
          <span class="directory">~</span>
          <span class="user-input" id="userInput"></span>
          <span class="line anim-typewriter"></span>
          <input type="text" id="keyboard" class="dummy-keyboard" />
        </div>
      </div>
    </div>
  </div>
  `
  }
}

customElements.define("terminal-js", Terminal);
