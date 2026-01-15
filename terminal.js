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
  let rawInput = input;
  input = input.toLowerCase();
  lastCommands.push(input);

  if (input.length === 0) return;

  // --- 1. The 'ls' Command ---
  if (input === "ls") {
    // Print the command line first
    terminalOutput.innerHTML += `<div class="terminal-line"><span class="success">➜</span> <span class="directory">~</span> ls</div>`;

    // Fetch the directory list we made
    fetch("docs/directory.json")
    .then(response => response.json())
    .then(files => {
      // Create a string of files separated by spaces (using &nbsp; for HTML space)
      // You can change .join("&nbsp;&nbsp;&nbsp;") to .join("<br>") if you want a vertical list
      let fileList = files.join("&nbsp;&nbsp;&nbsp;");

      // Output nicely colored file names
      terminalOutput.innerHTML += `<div class="terminal-line" style="color: #50fa7b;">${fileList}</div>`;
      terminalOutput.scrollTop = terminalOutput.scrollHeight;
    })
    .catch(err => {
      terminalOutput.innerHTML += `<div class="terminal-line" style="color: #ff5555;">Error: Could not read directory.</div>`;
    });
    return;
  }

  // --- 2. The Updated 'cat' Command ---
  if (input.startsWith("cat ")) {
    let fileName = rawInput.split(" ")[1];
    terminalOutput.innerHTML += `<div class="terminal-line"><span class="success">➜</span> <span class="directory">~</span> ${rawInput}</div>`;

    // NOTICE: We added "docs/" here so it looks in the right folder!
    fetch("docs/" + fileName)
    .then(response => {
      if (!response.ok) throw new Error("File not found");
      return response.text();
    })
    .then(text => {
      // Simple Markdown parsing: Turn # Header into H1
      // We replace newlines with <br> first
      let formattedText = text.replace(/</g, "&lt;"); // Escape HTML to prevent running scripts in txt files
      formattedText = formattedText.replace(/\n/g, "<br>");

      terminalOutput.innerHTML += `<div class="terminal-line">${formattedText}</div>`;
      terminalOutput.scrollTop = terminalOutput.scrollHeight;
    })
    .catch(error => {
      terminalOutput.innerHTML += `<div class="terminal-line" style="color: #ff5555;">File not found: ${fileName}</div>`;
      terminalOutput.scrollTop = terminalOutput.scrollHeight;
    });
    return;
  }

  // --- Standard Commands ---
  if (input.indexOf("sudo") >= 0) {
    input = "sudo";
  }

  let output;
  if (input == "projects") {
    open("pages/projects.html");
  } else if (input === "clear" || input === "cls") {
    clearScreen();
  } else if (input === "history") {
    showHist();
  } else if (input === "github") {
    open("https://github.com/terminal-js");
  } else {
    output = `<div class="terminal-line"><span class="success">➜</span> <span class="directory">~</span> ${rawInput}</div>`;
    if (!COMMANDS.hasOwnProperty(input)) {
      output += `<div class="terminal-line">command not found: ${rawInput}</div>`;
    } else {
      output += COMMANDS[input];
    }
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
