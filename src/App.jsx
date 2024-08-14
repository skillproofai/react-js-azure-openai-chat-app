import { useState } from 'react';
import './ChatApp.css'; // Create a CSS file for styling
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faTrashCan, faPaperPlane, faRobot } from '@fortawesome/free-solid-svg-icons';
import { AzureOpenAI } from "openai";
import { DefaultAzureCredential, getBearerTokenProvider } from "@azure/identity";

const ChatApp = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [settingsData, setSettingsData] = useState({
    apiUrl: 'Azure OpenAI Endpoint',
    apiKey: 'Azure OpenAI Key',
    deployment: 'gpt-35-turbo',
    apiVersion: '2024-04-01-preview',
  });

  const addMessage = (text, role) => {
    const newMessage = { text, role };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  const handleUserInput = (e) => {
    setInputText(e.target.value);
  };

  const handleSendMessage = async () => {
    if (inputText.trim() === '') return;

    addMessage(inputText, 'user');
    setInputText('');

    try {
      // Azure OpenAI SDK Setup
      const scope = "https://cognitiveservices.azure.com/.default";
      const azureADTokenProvider = getBearerTokenProvider(new DefaultAzureCredential(), scope);
      const client = new AzureOpenAI({
        azureADTokenProvider,
        deployment: settingsData.deployment,
        apiVersion: settingsData.apiVersion,
      });

      // Prepare the request payload
      const result = await client.chat.completions.create({
        messages: [
          { role: 'system', content: 'You are an AI assistant that helps people find information.' },
          { role: 'user', content: inputText },
        ],
        model: '', // Model name is not required for Azure OpenAI SDK
      });

      const assistantReply = result.choices[0]?.message.content;
      addMessage(assistantReply, 'assistant');
    } catch (error) {
      console.error('Error fetching data from the API:', error.message);
      addMessage('Error fetching data from the API', 'assistant');
    }
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  const handleSettingsClick = () => {
    setShowSettings(true);
  };

  const handleSettingsClose = () => {
    setShowSettings(false);
  };

  const handleSaveSettings = () => {
    setSettingsData({ ...settingsData });
    setShowSettings(false);
  };

  return (
    <div className="container">
      <h2><FontAwesomeIcon icon={faRobot} /> AI Chatapp</h2>

      {showSettings && (
        <div className="settings-popup">
          <div className="settings-content">
            <label htmlFor="apiUrl">API URL:</label>
            <input
              type="text"
              id="apiUrl"
              value={settingsData.apiUrl}
              onChange={(e) => setSettingsData({ ...settingsData, apiUrl: e.target.value })}
            />

            <label htmlFor="apiKey">API Key:</label>
            <input
              type="text"
              id="apiKey"
              value={settingsData.apiKey}
              onChange={(e) => setSettingsData({ ...settingsData, apiKey: e.target.value })}
            />

            <button onClick={handleSaveSettings}>Save</button>
            <button onClick={handleSettingsClose}>Cancel</button>
          </div>
        </div>
      )}

      <div className="chat-app">
        <div className="chat-window">
          {messages.map((message, index) => (
            <div key={index} className={message.role === 'user' ? 'user-message' : 'assistant-message'}>
              {message.text}
            </div>
          ))}
        </div>
        <div className="input-container">
          <input
            type="text"
            value={inputText}
            onChange={handleUserInput}
            placeholder="Type your message..."
          />
          <button onClick={handleSendMessage}><FontAwesomeIcon icon={faPaperPlane} /> Send</button>
          <button onClick={handleClearChat}><FontAwesomeIcon icon={faTrashCan} /> Clear</button>
          <button className="settings-button" onClick={handleSettingsClick}>
            <FontAwesomeIcon icon={faCog} /> Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatApp;
