let obj = {
    1: null,
    2: null,
    3: null,
    4: null,
    5: null,
    6: null,
}

function moveToNextTextbox(event, currentTextbox) {
    var nextTextbox;
    if (event.keyCode === 13) return;
    if (event.keyCode === 37) {
      // Sol ok tuşu
      nextTextbox = currentTextbox - 1;
      if (nextTextbox >= 1 && nextTextbox <= 6) {
        var currentInput = document.querySelector(
          "input:nth-child(" + currentTextbox + ")"
        );
        var nextInput = document.querySelector(
          "input:nth-child(" + nextTextbox + ")"
        );
  
        nextInput.focus();
      }
      event.preventDefault();
      return false;
    } else if (event.keyCode === 39) {
      // Sağ ok tuşu
      nextTextbox = currentTextbox + 1;
      if (nextTextbox >= 1 && nextTextbox <= 6) {
        var currentInput = document.querySelector(
          "input:nth-child(" + currentTextbox + ")"
        );
        var nextInput = document.querySelector(
          "input:nth-child(" + nextTextbox + ")"
        );
  
        nextInput.focus();
      }
      event.preventDefault();
      return false;
    } else if (event.keyCode === 8) {
      nextTextbox = currentTextbox - 1;
      var currentInput = document.querySelector(
        "input:nth-child(" + currentTextbox + ")"
      );
      currentInput.value = "";
      if (nextTextbox >= 1 && nextTextbox <= 6) {
        var nextInput = document.querySelector(
          "input:nth-child(" + nextTextbox + ")"
        );
  
        nextInput.focus();
        obj[nextTextbox] = null;
      }
      event.preventDefault();
      return false;
    } else if (event.keyCode === 46) {
      nextTextbox = currentTextbox + 1;
      var currentInput = document.querySelector(
        "input:nth-child(" + currentTextbox + ")"
      );
      currentInput.value = "";
      if (nextTextbox >= 1 && nextTextbox <= 6) {
        var nextInput = document.querySelector(
          "input:nth-child(" + nextTextbox + ")"
        );
  
        nextInput.focus();
      }
      event.preventDefault();
      return false;
    } else if (
      event.keyCode === 48 ||
      event.keyCode === 49 ||
      event.keyCode === 50 ||
      event.keyCode === 51 ||
      event.keyCode === 52 ||
      event.keyCode === 53 ||
      event.keyCode === 54 ||
      event.keyCode === 55 ||
      event.keyCode === 56 ||
      event.keyCode === 57 ||
      event.keyCode === 96 ||
      event.keyCode === 97 ||
      event.keyCode === 98 ||
      event.keyCode === 99 ||
      event.keyCode === 100 ||
      event.keyCode === 101 ||
      event.keyCode === 102 ||
      event.keyCode === 103 ||
      event.keyCode === 104 ||
      event.keyCode === 105
    ) {
      var nextTextbox = currentTextbox + 1;
  
      var currentInput = document.querySelector(
        "input:nth-child(" + currentTextbox + ")"
      );
      var key = event.keyCode || event.which;
      var isKeypad = key >= 96 && key <= 105;
      var normalizedKeyCode = isKeypad ? key - 48 : key;
      var keyChar = String.fromCharCode(normalizedKeyCode);
      currentInput.value = keyChar;
      if (nextTextbox <= 6) {
        var nextInput = document.querySelector(
          "input:nth-child(" + nextTextbox + ")"
        );
  
        if (currentInput.value.length === 1) {
          nextInput.focus();
        }
        obj[nextTextbox - 1] = currentInput.value;
      }else {
        obj[6] = currentInput.value;
      }
      const otp = document.querySelector('#otp');
      let result = Object.values(obj).join('');
      otp.value = result;
      event.preventDefault();
      return false;
    } else {
      var currentInput = document.querySelector(
        "input:nth-child(" + currentTextbox + ")"
      );
      if (!Number(currentInput.value)) {
        currentInput.value = "";
      }
      event.preventDefault();
      return false;
    }
  }