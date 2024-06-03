// Colocar chave API na linha 17 no lugar de #
"use client";

import { useState, useEffect } from "react";
import {GoogleGenerativeAI,HarmCategory,HarmBlockThreshold,} from "@google/generative-ai";



export default function Home() {
   const [messages, setMessages]= useState([]);
   const [userInput, setUserInput] = useState("");
   const [btnDisabled, setBtnDisabled] = useState(false);
   const [chat, setChat] = useState(null);
   const [theme, setTheme] = useState("light");
   const [error, setError] = useState(null);

   const API_KEY = "#";
   const MODEL_NAME = "gemini-1.0-pro-001";

   const genAI = new GoogleGenerativeAI(API_KEY);

   const generativeConfig = {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 2048,
   };

   const safetySettings = [

    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
    },
   ];

   useEffect(() => {
     const initChat = async()=>{
      try {
        const newChat = genAI
        .getGenerativeModel({model: MODEL_NAME})
        .startChat({
          generativeConfig,
          safetySettings,
          history: messages.map((msg)=>({
            text: msg.text,
            role: msg.role,

          })),
        });
        setChat(newChat);

        
      } catch (error) {
        setError("Erro ao carregar new chat");
        
      }
     };
     initChat();
     
   }, []);

   const handlesSendMessage = async () =>{
    
    try{
      
      const userMessage ={
        text: userInput,
        role: "user",
        timestamp: new Date(), 
        
      }
      setBtnDisabled(true);
      
      setMessages((prevMessages) => [...prevMessages,userMessage]);
      
      setUserInput("");
      
      

      if (chat) {
        const result = await chat.sendMessage(userInput);
        const botMessage = {
          text: result.response.text(),
          role: "bot",
          timestamp: new Date(), 
        };

        setMessages((prevMessages)=>[...prevMessages,botMessage]);
        setBtnDisabled(false)
      }
    } catch(error){
        setError("Falied to send message.");
    }
    
   };

  //  Theme

  const handleThemeChange = (e)=>{
    setTheme(e.target.value);
  };

  // get the theme base color
   const getThemeColors = ()=>{
    switch (theme){
      case "light":
        return{
          primary: "bg-white",
          secondary: "bg-gray-100",
          accent: "bg-blue-500",
          text: "text-grey-800",
        };  
        case "dark":
        return{
          primary: "bg-stone-900",
          secondary: "bg-stone-600",
          accent: "color-white",
          text: "text-gray-100",
        };
      }
   };

   

   const {primary,secondary,accent,text}= getThemeColors();

   return(
    <div className={`flex flex-col h-screen p-4 ${primary}`}
    >
      <div className="flex justify-between items-center mb-4">
        <h1 className={`text-2x1 font-bold ${text}`}>Chat</h1>
        <div className="flex space-x-2">
          <label htmlFor="theme" className={`text-sm ${text}`}>
            Theme:
            </label>
            <select 
            id="theme" 
            value={theme}
            onChange={handleThemeChange}
            className={`p-1 ${primary} rounded-md border ${text}`}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
        </div>
      </div>
      <div className={`flex-1 overflow-y-auto ${secondary} rounded-md p-2`}>
        {messages.map((msg,index)=>(
          <div 
          key={index}
          className={`mb-4 ${
            msg.role === "user" ? "text-right": "text-left"
          }`}>
            <span
            className={`p-2 rounded-lg ${
              msg.role === "user" 
              ? `${accent} text-white`
              : `${primary} ${text}`
            }`}>{msg.text}</span>
            <p className={`text-xs ${text} mt-1`}>
              {msg.role === "bot" ? "Bot":"Você"} - {""}
              {msg.timestamp.toLocaleTimeString()}
            </p>
          </div>
        ))}
      </div>
      {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
      <div className="flex items-center mt-4">
        <input
         type="text"
         placeholder="Escreva sua pergunta..."
         value={userInput}
         onChange={(e)=>setUserInput(e.target.value)}
         
         className={`flex-1 p-2 rounded-1-md border-t border-b border-l 
         focus:outline-none focus:border-${accent}`} />
         <button
         id="btn"
         disabled={btnDisabled}
         onClick={handlesSendMessage}
         className={`p-2 bg-blue-900 text-white rounded-r-md hover:bg-opacity-80
         focus:outline-none`}>
          Enviar
         </button>
         
      </div>

    </div>
   );
}