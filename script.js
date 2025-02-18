const typingForm = document.querySelector(".typing-form");
const chatContainer = document.querySelector(".chat-list");
const deleteChatButton = document.querySelector("#delete-chat-button");

// State variables
let userMessage = null;
let isResponseGenerating = false;

// API configuration
const API_KEY = "AIzaSyDt2vZ-EF7u7upFpDzL4YE_jPKRVE2tij0"; // Your API key here
const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`;

// Keyword-to-Response Map
const predefinedResponses = {
  'want to learn a calisthenics skill': "There are many calisthenics skills out there, which one do you want to learn specifically?",

  'teach me calisthenics skills': "There are many calisthenics skills out there, which one do you want to learn specifically?",

  'Can you show me calisthenics skills': "There are many calisthenics skills out there, which one do you want to learn specifically?",

  'i want to learn calisthenics skills': "There are many calisthenics skills out there, which one do you want to learn specifically?",

  

  
    'planche' : 'planche stuff',
    'crow pose': 'crow pose stuff',
    'frog pose' : 'frog pose stuff',
    'front lever' : 'front lever stuff',
    'muscle up': 'muscle up stuff',
    'pistol squats' : 'pistol squats stuff',
    'dragon squats' : 'dragon squats stuff',
    'one arm push ups' : 'one arm push ups stuff',
    'clap push ups' : ' clap push ups stuff',
    'back lever' : 'back lever stuff',
    'push ups' : 'push ups stuff',
    'pull ups,' : 'pull ups stuff',
    'pike press' : 'pike press stuff',
    'dragon flag' : 'dragon flag stuff',
    'burpee' : 'burpee stuff',
    'human flag' : 'human flag stuff',
    'handstand' : 'handstand stuff',
    'side plank' : 'side plank stuff',
    'plank' : 'plank stuff',



  'I want to build muscle': "What muscle group do you want to make stronger",

  
  'biceps' : 'biceps stuff',
  'triceps' : 'triceps stuff', 
  'forearms' : 'forearms stuff',
  'shoulders' : 'shoulders stuff',
  'chest' : 'chest stuff',
  'back' : 'back stuff',
  'legs' : 'legs stuff',
  'abs' : 'abs stuff',
  'core' : 'core stuff',
  'arms' : 'arms stuff',
  'glutes' : 'glutes stuff',
  'quadriceps' : 'quadriceps stuff',
  'hamstrings' : 'hamstrings stuff',  
  'calves' : 'calves stuff',
  'traps' : 'traps stuff',
  'lats' : 'lats stuff',
  

  'I want to be flexible' : 'Would you want to stretch a specific muscle or stretch your full body',

  'neck' : 'neck stuff',
  'shoulders' : 'shoulders stuff',
  

   'create me a upper body routine' : 'are you fat or skinny',
  



  'name': 'I am RapidRoutines',
  'dog': 'I do not understand. Please ask me a question related to calisthenics',
  'weather': 'I do not understand. Please ask me a question related to calisthenics',
  // Add other predefined responses...
};

// Function to check for predefined responses
const getPredefinedResponse = (message) => {
  for (const keyword in predefinedResponses) {
    if (message.toLowerCase().includes(keyword.toLowerCase())) {
      return predefinedResponses[keyword];
    }
  }
  return null;
};

// Load theme and chat data from local storage on page load
const loadDataFromLocalstorage = () => {
  const savedChats = localStorage.getItem("saved-chats");

  // Restore saved chats or show a welcome message
  if (chatContainer) {
    chatContainer.innerHTML = savedChats || '';
    document.body.classList.toggle("hide-header", savedChats);
    chatContainer.scrollTo(0, chatContainer.scrollHeight); // Scroll to the bottom

    // Display a welcome message if no chats are found
    if (!savedChats) {
      displayWelcomeMessage();
    }
  } else {
    console.error("Chat container not found");
  }
};

// Create a new message element and return it
const createMessageElement = (content, ...classes) => {
  const div = document.createElement("div");
  div.classList.add("message", ...classes);
  div.innerHTML = content;
  return div;
};

// Show typing effect by displaying words one by one
const showTypingEffect = (text, textElement, incomingMessageDiv) => {
  const words = text.split(' ');
  let currentWordIndex = 0;

  const typingInterval = setInterval(() => {
    // Append each word to the text element with a space
    textElement.innerText += (currentWordIndex === 0 ? '' : ' ') + words[currentWordIndex++];
    const icon = incomingMessageDiv.querySelector(".icon");
    if (icon) {
      icon.classList.add("hide");
    }

    // If all words are displayed
    if (currentWordIndex === words.length) {
      clearInterval(typingInterval);
      isResponseGenerating = false;
      if (icon) {
        icon.classList.remove("hide");
      }
      localStorage.setItem("saved-chats", chatContainer.innerHTML); // Save chats to local storage
    }
    chatContainer.scrollTo(0, chatContainer.scrollHeight); // Scroll to the bottom
  }, 75); // Typing speed in milliseconds
};

// Fetch response from the API based on user message
const generateAPIResponse = async (incomingMessageDiv) => {
  const textElement = incomingMessageDiv.querySelector(".text"); // Getting text element

  try {
    // Send a POST request to the API with the user's message
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [{ text: userMessage }]
        }]
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error.message);

    // Get the API response text and remove asterisks from it
    const apiResponse = data?.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, '$1');
    showTypingEffect(apiResponse, textElement, incomingMessageDiv); // Show typing effect
  } catch (error) { // Handle error
    isResponseGenerating = false;
    if (textElement) {
      textElement.innerText = error.message;
      textElement.parentElement.closest(".message").classList.add("error");
    }
  } finally {
    if (incomingMessageDiv) {
      incomingMessageDiv.classList.remove("loading");
    }
  }
};

// Show a placeholder message while waiting for the API response
const showPlaceholderMessage = () => {
  const html = `<div class="message-content">
                  <img class="avatar" src="logo.jpg" alt="">
                  <p class="text"></p>
                </div>`;

  const incomingMessageDiv = createMessageElement(html, "incoming", "loading");
  if (chatContainer) {
    chatContainer.appendChild(incomingMessageDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight); // Scroll to the bottom
    generateAPIResponse(incomingMessageDiv);
  } else {
    console.error("Chat container not found");
  }
};

// Show a predefined message
const showPredefinedMessage = (predefinedResponse) => {
  const html = `<div class="message-content">
                  <img class="avatar" src="logo.jpg" alt="">
                  <p class="text"></p> <!-- Empty text element for typing effect -->
                </div>`;

  const incomingMessageDiv = createMessageElement(html, "incoming");
  if (chatContainer) {
    chatContainer.appendChild(incomingMessageDiv);
    const textElement = incomingMessageDiv.querySelector(".text");
    showTypingEffect(predefinedResponse, textElement, incomingMessageDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight); // Scroll to the bottom
  } else {
    console.error("Chat container not found");
  }
};

// Handle sending outgoing chat messages
const handleOutgoingChat = () => {
  userMessage = typingForm.querySelector(".typing-input").value.trim() || userMessage;
  if (!userMessage || isResponseGenerating) return; // Exit if there is no message or response is generating

  isResponseGenerating = true;

  const html = `<div class="message-content">
                  <p class="text"></p>
                </div>`;

  const outgoingMessageDiv = createMessageElement(html, "outgoing");
  outgoingMessageDiv.querySelector(".text").innerText = userMessage;
  if (chatContainer) {
    chatContainer.appendChild(outgoingMessageDiv);
    typingForm.reset(); // Clear input field
    document.body.classList.add("hide-header");
    chatContainer.scrollTo(0, chatContainer.scrollHeight); // Scroll to the bottom

    // Check for predefined responses
    const predefinedResponse = getPredefinedResponse(userMessage);
    if (predefinedResponse) {
      showPredefinedMessage(predefinedResponse); // Show predefined response if found
    } else {
      setTimeout(showPlaceholderMessage, 500); // Show placeholder message after a delay
    }
  } else {
    console.error("Chat container not found");
  }
};

// Delete all chats from local storage when button is clicked
if (deleteChatButton) {
  deleteChatButton.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete all the chats?")) {
      localStorage.removeItem("saved-chats");
      loadDataFromLocalstorage();
    }
  });
} else {
  console.error("Delete chat button not found");
}

// Prevent default form submission and handle outgoing chat
if (typingForm) {
  typingForm.addEventListener("submit", (e) => {
    e.preventDefault();
    handleOutgoingChat();
  });
} else {
  console.error("Typing form not found");
}

// Get a random welcome message
const getRandomWelcomeMessage = () => {
  const welcomeMessages = [
    "Hi! Welcome to RapidRoutines AI. How can I help you today?",
    "Yo yo! RapidRoutines AI. How can I help?",
    "Yo what's up! This is RapidRoutines AI. Need some help creating a workout routine?",
    // Add more messages as needed
  ];
  return welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
};

// Display a welcome message with a typing effect
const displayWelcomeMessage = () => {
  const welcomeMessage = getRandomWelcomeMessage();
  const html = `<div class="message-content">
                  <img class="avatar" src="logo.jpg" alt="">
                  <p class="text"></p> <!-- Empty text element for typing effect -->
                </div>`;

  const welcomeMessageDiv = createMessageElement(html, "incoming");
  if (chatContainer) {
    chatContainer.appendChild(welcomeMessageDiv);
    const textElement = welcomeMessageDiv.querySelector(".text");
    showTypingEffect(welcomeMessage, textElement, welcomeMessageDiv); // Use typing effect
    chatContainer.scrollTo(0, chatContainer.scrollHeight); // Scroll to the bottom
  } else {
    console.error("Chat container not found");
  }
};

// Initialize the application
loadDataFromLocalstorage();



// Function to save chat history
function saveChatHistory() {
    const chat = document.getElementById('chat');
    const chatMessages = chat.querySelectorAll('.message');

    let htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Chat History</title>
        <style>
            body {
                font-family: 'Poppins', sans-serif;
                background: #f4f4f9;
                color: #333;
                padding: 20px;
                max-width: 800px;
                margin: auto;
            }
            .container {
                border-radius: 8px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                overflow: hidden;
                background: #fff;
            }
            .chat {
                padding: 20px;
                border-bottom: 1px solid #ddd;
            }
            .message {
                display: flex;
                align-items: center;
                padding: 10px;
                margin-bottom: 10px;
                border-radius: 8px;
            }
            .message.user {
                justify-content: flex-end;
                background-color: #eef2f7;
            }
            .message.bot {
                justify-content: flex-start;
                background-color: #e1ecf4;
            }
            .avatar {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background-size: cover;
                margin: 0 10px;
            }
            .user .avatar {
                order: 2;
                background-image: url('avatar.jpg');
            }
            .bot .avatar {
                order: 1;
                background-image: url('bot.jpg');
            }
            .text {
                max-width: 80%;
                padding: 10px;
                font-size: 16px;
                line-height: 1.5;
            }
            .user .text {
                background: #040137;
                color: #fff;
                border-radius: 15px 15px 0 15px;
            }
            .bot .text {
                background: #1e1e1e;
                color: #fff;
                border-radius: 15px 15px 15px 0;
            }
            h2 {
                text-align: center;
                color: #333;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>Chat History</h2>
            <div class="chat">`;

    // Loop through chat messages and append to HTML content
    chatMessages.forEach(message => {
        const messageContent = message.innerHTML;
        const classes = message.classList.contains('user') ? 'user' : 'bot';
        htmlContent += `
            <div class="message ${classes}">
                <div class="avatar"></div>
                <div class="text">${messageContent}</div>
            </div>`;
    });

    htmlContent += `
            </div>
        </div>
    </body>
    </html>`;

    // Create a Blob from the HTML content
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    // Create a link element and trigger a download
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chat_history.html';
    document.body.appendChild(a); // Append to body to make it work in Firefox
    a.click();
    document.body.removeChild(a); // Remove from body after download
    URL.revokeObjectURL(url); // Clean up the URL object
}

// Event listener for the Save button
const saveButton = document.querySelector('#save-button'); // Adjust selector to your actual button ID
if (saveButton) {
    saveButton.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent form submission
        saveChatHistory();
    });
} else {
    console.error("Save button not found");
}

// Existing code for handling other parts of your application...









