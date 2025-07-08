// Add your Cloudflare Worker URL here
const WorkerUrl = "https://loreal-chatbot.arceok.workers.dev/"; // <-- Replace with your actual Worker URL
// script.js

// Store the conversation history
const conversationHistory = [
  {
    role: "system",
    content:
      "You are a friendly and knowledgeable beauty advisor for L'Oréal. Always provide expert advice on skincare, haircare, and makeup using L'Oréal products. Recommend routines, tips, and product suggestions based on user needs. Be positive, supportive, and focus on helping users achieve their beauty goals with L'Oréal's range. If a question is not about beauty or L'Oréal, politely guide the conversation back to beauty topics.",
  },
];

// This function sends the user's message to the OpenAI API and gets a response
async function getOpenAIResponse(userMessage) {
  // Use the Cloudflare Worker URL instead of the OpenAI endpoint
  const endpoint = WorkerUrl;

  // Add the user's message to the conversation history
  conversationHistory.push({ role: "user", content: userMessage });

  // The request body for the API call
  const requestBody = {
    model: "gpt-4o", // Use the gpt-4o model
    messages: conversationHistory,
  };

  try {
    // Make the API request using fetch and async/await
    // The Worker should handle authentication, so you don't need to send your API key from the browser
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    // Parse the response as JSON
    const data = await response.json();

    // Get the assistant's reply
    const assistantReply = data.choices[0].message.content;
    // Add the assistant's reply to the conversation history
    conversationHistory.push({ role: "assistant", content: assistantReply });
    // Return the assistant's reply
    return assistantReply;
  } catch (error) {
    // Handle errors
    console.error("Error fetching from OpenAI:", error);
    return "Sorry, I couldn't get a response from the assistant.";
  }
}

// This function adds a message to the chat window
function addMessageToChat(role, message) {
  const chatWindow = document.getElementById("chatWindow");
  const messageDiv = document.createElement("div");
  messageDiv.className = role === "user" ? "user-message" : "assistant-message";
  messageDiv.textContent = message;
  chatWindow.appendChild(messageDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Handle the chat form submission
document
  .getElementById("chatForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent the form from refreshing the page
    const userInput = document.getElementById("userInput");
    const userMessage = userInput.value.trim();
    if (!userMessage) return;

    // Add user's message to the chat window
    addMessageToChat("user", userMessage);
    userInput.value = "";

    // Show a loading message while waiting for the assistant
    addMessageToChat("assistant", "Thinking...");

    // Get the assistant's response from OpenAI
    const assistantReply = await getOpenAIResponse(userMessage);

    // Remove the loading message
    const chatWindow = document.getElementById("chatWindow");
    chatWindow.removeChild(chatWindow.lastChild);

    // Add assistant's reply to the chat window
    addMessageToChat("assistant", assistantReply);
  });

// Set initial message in the chat window when the page loads
window.addEventListener("DOMContentLoaded", function () {
  const chatWindow = document.getElementById("chatWindow");
  chatWindow.textContent = "👋 Hello! How can I help you today?";
});
