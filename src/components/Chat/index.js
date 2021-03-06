import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { useGame } from "games/LiarLiar/BabelBuilder/GameContext";
import { findCurrentUserIndex } from "games/LiarLiar/utils/currentUserIndex";
import './Chat.css';
import Twemoji from 'react-twemoji';

// for testing local server use "http://localhost:3001"  for deployed server use  https://babelboxdb.herokuapp.com/


const Chat = () => {
    const messageBottomRef = useRef(null);
    const gameState = useGame();
    const userIndex = findCurrentUserIndex(gameState.players, gameState.currentUser);
    const username = userIndex < 0 ? 'Spartacus' : gameState.players[userIndex].name;
    const avatar = userIndex < 0 ? '🐛' :  gameState.players[userIndex].avatar;
    const socketRef = useRef();
    const [chatOpen, setChatOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [message, setMessage] = useState("");
    const [newMsg, setNewMsg] = useState(0);
    const [otherUserColor, setOtherUserColor] = useState([]);

    //random color bubbles
    const randomColor = ()=> {
      const colorChoices = [
        "bg-gradient-to-t from-babelYellow-400 to-babelYellow-600",
        "bg-gradient-to-t from-pink-400 to-pink-600",
        "bg-gradient-to-t from-babelCyan-400 to-babelCyan-600",
        "bg-gradient-to-t from-babelRed-400 to-babelRed-600",
        "bg-gradient-to-t from-gray-300 to-gray-400",
        "bg-gradient-to-t from-green-400 to-green-600",
      ];
      const randomIndex = Math.floor(Math.random() * colorChoices.length);
      console.log(colorChoices[randomIndex]);
      return colorChoices[randomIndex];
    };

    const setRandomColors = () => {
      setOtherUserColor(randomColor());
    }

    useEffect(() => {
      setRandomColors()
    }, [])

    useEffect(() => {
    socketRef.current = io("https://babelboxdb.herokuapp.com/");

    //captures event from server
    socketRef.current.on("connect", () => {
        console.log(username || 'Spartacus');
        socketRef.current.emit('room', gameState._id);
        socketRef.current.emit("new-user", username || 'Spartacus');
    });

    //listens to message event from backend
    socketRef.current.on("message", data => {
        console.log(data);
    });

    //adds each new user to the existing users array
    socketRef.current.on("start", user => {
        console.log(users);
        setUsers(users => [...users, user]);
    });

    //adds incoming message to chat array
    socketRef.current.on('chat message', (msg) => {
      console.log(messages);
      setMessages([...messages, msg]);
      setNewMsg(newMsg+1);
    });

    //runs disconnect event
    socketRef.current.on('disconnect', id => {
      setUsers(users => {
        return users.filter(user => user.id !== id);
      });
    });

    return () => {
        socketRef.current.disconnect();
    };
    }, [messages]);

    //scroll to bottom constant
    const scrollToBottom = () => {
      messageBottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    //useEffect to scroll to bottom
    useEffect(() => {
      scrollToBottom()
    }, [messages]);

    // handle send message function
    const handleSend = () => {
        if(message){
            socketRef.current.emit('chat message', message);
            console.log("new msg");
            setMessage("");
        }
    };

    return (
        <div className="z-50 fixed bottom-5 right-5 md:bottom-10 md:right-10 ">
            <div className="flex justify-center items-center">
              {/* Closed Chat */}
              <div
              className={`bg-gradient-to-r from-green-400 to-blue-500 shadow-md rounded-full  h-20 w-20 flex items-center justify-center text-babelBlue-500 ${newMsg ? 'animate-bounce': 'nothing'} ${chatOpen ? 'hidden' : 'nothing'}`}
              onClick={() => {setChatOpen(!chatOpen); setRandomColors()}}>
                <svg
                className="text-babelYellow-500 transform w-12 h-12 cursor-pointer hover:scale-110 motion-reduce:transform-none"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20" fill="currentColor">
                  <path
                  fillRule="evenodd"
                  d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                  clipRule="evenodd"
                  />
                </svg>
              <span className={`z-0 absolute inline-flex h-full w-full rounded-full bg-babelYellow-400 opacity-75 ${newMsg ? 'animate-ping-slow': 'hidden'}`}>
              </span>
              </div>
                {/* Open Chat */}
                <div className={`w-80 h-96 bg-gray-100 rounded-2xl overflow-hidden shadow-2xl ${chatOpen ? 'nothing' : 'hidden'}`}>
                    {/* Top Header */}
                    <nav className="w-full h-10 bg-gradient-to-r to-green-400 from-blue-500 flex justify-between items-center">
                        <div className="flex justify-center items-center ml-1">
                          <div className="ml-1 textShadow">
                          <Twemoji options={{ className: "chat-emoji twemoji" }}> {avatar} </Twemoji>
                          </div>
                          <span className="text-sm textShadow font-medium text-gray-200 ml-1">
                            {username || 'Spartacus'}
                          </span>
                        </div>
                          <svg
                          className="text-babelRed-500 transform hover:scale-110 w-7 h-7 mr-2 cursor-pointer"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20" fill="currentColor"
                          onClick={() => {setChatOpen(!chatOpen); setNewMsg(0); }}>
                            <path
                            fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z"
                            clipRule="evenodd"
                            />
                          </svg>
                    </nav>
                    {/* Messages Map */}
                    <div
                    className="overflow-auto px-1 py-1"
                    style={{height: '19rem'}}
                    id="journal-scroll">
                        {messages.map(({user, text}, index) => {
                          //Your messages
                          if (username === user.name) {
                            return (
                              <div
                              className="textShadow flex items-center pr-10 mb-1"
                              key={index}
                              ref={messageBottomRef}>
                                <span className="ml-1">
                                  {user?.name}:
                                </span>
                                <span
                                className="flex ml-1 h-auto bg-gradient-to-t from-blue-400 to-blue-600 text-gray-200 text-sm font-normal rounded-full px-2 p-1"
                                style={{fontSize: "11px"}}>
                                  <Twemoji options={{ className: "chat-emoji twemoji" }}> {text} </Twemoji>
                                </span>
                              </div>
                            )
                        }
                        // Other user messages
                        return (
                        <div
                        className="textShadow flex items-center pr-10 mb-1"
                        key={index}
                        ref={messageBottomRef}>
                          <span className="ml-1">
                            {user?.name}:
                          </span>
                          <span
                          className={`flex ml-1 h-auto ${otherUserColor} text-black text-sm font-normal rounded-full px-2 p-1 items-end`}

                          style={{fontSize: "11px"}}>
                            <Twemoji options={{ className: "chat-emoji twemoji" }}> {text} </Twemoji>
                          </span>
                          </div>)}
                        )}
                    </div>
                    {/* Input and Send Area */}
                    <div className="flex justify-between items-center p-1 ">
                        <div className="relative">
                          <input type="text"
                            className="rounded-full pl-3 pr-3 py-2 focus:outline-none h-auto placeholder-gray-300 bg-gradient-to-r from-purple-500 via-pink-600 to-red-400 text-white border-gray-300"
                            style={{fontSize: "11px", width: "275px"}}
                            placeholder="BabelChat..."
                            id="typemsg" value={message}
                            onKeyPress={event => event.key === 'Enter' ? handleSend(event) : null}
                            onSubmit={handleSend}
                            onChange={(event) => setMessage(event.target.value)}
                          />
                        </div>
                        <div className="w-8 h-7 pr-1 rounded-full text-center items-center flex justify-center">

                          <button
                          className="w-7 h-7 rounded-full text-center items-center flex justify-center focus:outline-none hover:bg-blue-300 hover:text-white"
                          onClick={handleSend}>
                            <svg
                              className="svg-inline--fa text-gray-400 hover:text-babelBlue-800 fa-paper-plane fa-w-16 w-7 h-7 py-1 mr-1"
                              aria-hidden="true"
                              focusable="false"
                              data-prefix="fas"
                              data-icon="paper-plane"
                              role="img"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 512 512"
                            >
                              <path
                                fill="currentColor"
                                d="M476 3.2L12.5 270.6c-18.1 10.4-15.8 35.6 2.2 43.2L121 358.4l287.3-253.2c5.5-4.9 13.3 2.6 8.6 8.3L176 407v80.5c0 23.6 28.5 32.9 42.5 15.8L282 426l124.6 52.2c14.2 6 30.4-2.9 33-18.2l72-432C515 7.8 493.3-6.8 476 3.2z"
                              />
                            </svg>
                          </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chat;
