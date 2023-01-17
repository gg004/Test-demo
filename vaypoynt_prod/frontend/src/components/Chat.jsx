import React from "react";
import MkdSDK from "../utils/MkdSDK";
import { AuthContext } from "../authContext";
import moment from "moment";
import ImagePreviewModal from './ImagePreviewModal'
import CreateNewRoomModal from "./CreateNewRoomModal";
import { UserCircleIcon, PaperAirplaneIcon, ArrowLeftIcon, PaperClipIcon } from '@heroicons/react/20/solid'
import { FaceSmileIcon } from '@heroicons/react/24/outline'

const Chat = () => {
  const { state } = React.useContext(AuthContext);
  const [rooms, setRooms] = React.useState();
  const [messages, setMessages] = React.useState([]);
  const [chatId, setChatId] = React.useState();
  const otherUserId = React.useRef()
  const currentRooms = React.useRef()
  const inputRef = React.useRef(null)
  const [message, setMessage] = React.useState("");
  const [roomId, setRoomId] = React.useState();
  const [file, setFile] = React.useState(null)
  const [previewModal, showPreviewModal] = React.useState(false)
  const [screenSize, setScreenSize] = React.useState(window.innerWidth);
  const [showContacts, setShowContacts] = React.useState(true);
  const [createRoom, setCreateRoom] = React.useState(false);

  function setDimension(e) {
    if (e.currentTarget.innerWidth > 1024) {
      setShowContacts(true);
    }
    setScreenSize(e.currentTarget.innerWidth);
  }

  let sdk = new MkdSDK();

  const handleClick = () => {
    inputRef.current.click()
  }

  const cancelFileUpload = () => {
    showPreviewModal(false)
    setFile(null)
    inputRef.current.value = ""
  }

  const formatDate = (time) => {
    let currentTime = moment(new Date)
    let messageDate = moment(time)
    if (currentTime.diff(messageDate, 'days') > 1) {
      return moment(messageDate).format("Do MMMM")
    } else {
      return moment(messageDate).format("hh:mm A")
    }
  }


  const handleFileUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    for (let i = 0; i < file.length; i++) {
      formData.append("file", file[i]);
    }
    try {
      const upload = await sdk.uploadImage(formData)
      await sendImageAsMessage(upload)
    } catch (err) {
      console.log(err)
    }

  }
  async function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }
  async function getRooms() {
    try {
      const chats = await sdk.getMyRoom();
      if (chats && chats.list && chats.list[0]) {
        setRooms(chats.list);
        currentRooms.current = chats.list
      }
    } catch (err) {
      console.log("Error:", err);
    }
  }

  async function createNewRoom(otherUser) {
    try {
      const createdRoom = await sdk.createRoom({ user_id: state.user, other_user_id: otherUser.id });
      let newRoom = {
        chat_id: createdRoom.chat_id,
        create_at: new Date(),
        email: otherUser.email,
        first_name: otherUser.first_name,
        id: createdRoom.room_id,
        last_name: otherUser.last_name,
        other_user_id: otherUser.id,
        other_user_update_at: new Date(),
        photo: otherUser.photo,
        unread: 0,
        update_at: new Date(),
        user_id: state.user,
        user_update_at: new Date()
      }
      const updatedRoomList = [newRoom, ...rooms]
      setRooms(updatedRoomList)
      currentRooms.current = updatedRoomList
      setCreateRoom(false)
    } catch (err) {
      console.log('Error:', err)
    }
  }

  async function getChats(room_id, chat_id) {
    try {
      setRoomId(room_id);
      setChatId(chat_id);
      let date = new Date().toISOString().split("T")[0];
      const messages = await sdk.getChats(room_id, chat_id, date);
      if (messages && messages.model) {
        setMessages(messages.model.reverse());
      }
    } catch (err) {
      console.log("Error:", err);
    }
  }


  async function sendMessage() {
    try {
      let date = new Date().toISOString().split("T")[0];
      await sdk.postMessage({ room_id: roomId, chat_id: chatId, user_id: state.user, message, date });
      let newMessageObj = {
        message: message,
        user_id: state.user,
        is_image: false,
        timeStamp: new Date(),
      };
      const updatedMessages = [...messages, newMessageObj];
      setMessages(updatedMessages);
      setMessage("");
    } catch (err) {
      console.log("Error:", err);
    }
  }
  async function sendImageAsMessage(upload) {
    try {
      let date = new Date().toISOString().split("T")[0];
      await sdk.postMessage({ room_id: roomId, chat_id: chatId, user_id: state.user, message: upload.url, date, is_image: true });
      let newMessageObj = {
        message: upload.url,
        user_id: state.user,
        is_image: true,
        timeStamp: new Date(),
      };
      const updatedMessages = [...messages, newMessageObj];
      setMessages(updatedMessages);
      showPreviewModal(false)
      setFile(null)
      inputRef.current.value = ""
      setMessage("");
    } catch (err) {
      console.log("Error:", err);
    }
  }


  async function startPooling() {
    try {
      const pool = await sdk.startPooling(state.user);
      if (pool.message) {
        let newMessageObj = {
          message: pool.message,
          user_id: pool.user_id,
          is_image: false,
          timeStamp: new Date(),
        };
        if (pool.user_id === otherUserId.current) {
          setMessages((prevMessages) => [...prevMessages, newMessageObj]);
          setTimeout(async () => {
            await startPooling();
          }, 2000);
        } else {
          setTimeout(async () => {
            await startPooling();
          }, 1000);
        }
      }

      else {
        setTimeout(async () => {
          startPooling();
        }, 1000);
      }
    } catch (err) {
      setTimeout(async () => {
        startPooling();
      }, 500);
    }
  }

  React.useEffect(() => {
    (async function () {
      await getRooms();
      await startPooling();
    })();
  }, []);

  React.useEffect(() => {
    window.addEventListener("resize", setDimension);

    return () => {
      window.removeEventListener("resize", setDimension);
    };
  }, [screenSize]);

  return (
    <div className="flex-1 pt-4 w-full h-full">
      <div className="main-body container m-auto w-11/12 h-full flex flex-col">
        <div className="main flex-1 flex flex-col">
          <div className="hidden lg:block heading flex-2">
            <h1 className="text-3xl text-gray-700 mb-4">Chat</h1>
          </div>
          <div className="flex-1 flex h-full">
            {showContacts && (
              <>
                <div className="flex justify-center">
                  <button
                    className="bg-blue-400 w-10 h-10 rounded-full inline-block text-white"
                    onClick={() => setCreateRoom(true)}
                  >
                    +
                  </button>
                </div>
                <div className="lg:flex lg:w-1/3 w-full flex-2 flex-col pr-6">
                  <div className="flex-2 pb-6 px-2">
                    <input
                      type="text"
                      className="outline-none py-2 block w-full bg-transparent border-b-2 border-gray-200"
                      placeholder="Search"
                    />
                  </div>

                  <div className="flex-1 h-full overflow-y-auto overflow-x-hidden px-2 max-h-[70vh]">
                    {rooms &&
                      rooms.map((room, idx) => (
                        <div
                          key={idx}
                          className="entry cursor-pointer items-center transform hover:scale-105 duration-300 transition-transform bg-white mb-4 rounded p-4 flex shadow-md"
                          onClick={() => {
                            getChats(room.id, room.chat_id);
                            otherUserId.current = room.other_user_id
                            if (screenSize < 1024) {
                              setShowContacts(false);
                            }
                          }}
                        >
                          <div className="flex-2">
                            <div className="w-12 h-12 relative">
                              {room.photo ? <img
                                className="w-12 h-12 rounded-full mx-auto"
                                src={room.photo}
                                alt="user-photo"
                              /> : <UserCircleIcon className="h-10 w-10" />}
                            </div>
                          </div>
                          <div className="flex-1 px-2">
                            <div className="truncate w-32">
                              <span className="text-gray-800">
                                {room.first_name} {room.last_name}
                              </span>
                            </div>
                          </div>
                          <div className="flex-2 text-right">
                            <div>
                              <small className="text-gray-500">{formatDate(room.update_at)}</small>
                            </div>
                            {room.unread > 0 &&
                              <div>
                                <small className="text-xs bg-green-500 text-white rounded-full h-6 w-6 leading-6 text-center inline-block">{room.unread}</small>
                              </div>}

                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </>
            )}

            {screenSize > 1023 || (screenSize < 1024 && !showContacts) ? (
              <div className="flex flex-col w-full max-h-[80vh] lg:max-h-[60vh]">
                {otherUserId?.current ? (
                  <div className="flex-1 flex flex-col">
                    <div className="flex-3">
                      <h2 className="text-xl py-1 mb-8 border-b-2 border-gray-200 flex">
                        <span
                          className="lg:hidden mr-4 my-auto"
                          onClick={() => setShowContacts(true)}
                        >
                          <ArrowLeftIcon className="h-6 w-6" />
                        </span>
                        Chatting with <b className="ml-2">{otherUserId.current}</b>
                      </h2>
                    </div>

                    {messages && (
                      <div className="flex-1 overflow-y-auto min-h-[60vh] max-h-[80vh] lg:max-h-[60vh]">
                        {messages.map((message, idx) => (
                          <div key={idx} className=" mb-4 flex">
                            {message?.user_id !== state.user && (
                              <div className="flex-2">
                                <div className="w-12 h-12 relative">
                                  <span className="absolute w-4 h-4 bg-gray-400 rounded-full right-0 bottom-0 border-2 border-white"></span>
                                </div>
                              </div>
                            )}
                            <div className={`flex-1 px-2 ${message?.user_id === state.user && "text-right"}`}>
                              <div className="inline-block" >
                                {message.is_image ? <img src={message?.message} className="h-40 md:h-52 lg:h-80" /> : <p className={`${message?.user_id === state.user ? "bg-gray-300 text-gray-700 " : "bg-blue-600 text-white"} rounded-xl whitespace-pre-line p-2 px-6 `}>{message?.message}</p>}

                              </div>
                              <div className="pl-4">
                                <small className="text-gray-500">{moment(message.timestamp).format("hh:mm A")}</small>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex-2 pt-4 pb-10 items-end">
                      <div className="write bg-white shadow flex rounded-lg">
                        <div className="flex-3 flex content-center items-center text-center p-4 pr-0">
                          <span className="block text-center text-gray-400 hover:text-gray-800">
                           <FaceSmileIcon className="h-6 w-6" />
                          </span>
                        </div>
                        <div className="flex-1">
                          <textarea
                            name="message"
                            className="w-full block outline-none py-4 px-4 bg-transparent h-full max-"
                            rows="1"
                            placeholder="Type a message..."
                            autoFocus
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                          ></textarea>
                        </div>
                        <div className="flex-2 w-32 p-2 flex content-center items-center">
                          <div className="flex-1 text-center">
                            <span className="text-gray-400 hover:text-gray-800">
                              <input className="hidden" ref={inputRef} type="file" accept="image/png, image/gif, image/jpeg" name="file" onChange={(e) => {
                                setFile(e.target.files)
                                showPreviewModal(true)
                              }} />
                              <button onClick={handleClick} className="inline-block align-text-bottom">
                                <PaperClipIcon className="h-6 w-6 text-black" />
                              </button>
                            </span>
                          </div>
                          <div className="flex-1">
                            <button
                              className="bg-blue-400 w-10 h-10 rounded-full inline-block"
                              onClick={() => sendMessage()}
                            >
                              <span className="inline-block align-text-bottom">
                              <PaperAirplaneIcon className="h-6 w-6 text-white" />
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full flex justify-center items-center text-7xl h-[70vh] text-gray-700 ">Select a Chat to view</div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
      {previewModal && file ? <ImagePreviewModal file={file} handleFileUpload={handleFileUpload} cancelFileUpload={cancelFileUpload} /> : null}
      {createRoom && <CreateNewRoomModal createNewRoom={createNewRoom} setCreateRoom={setCreateRoom} />}
    </div>
  );
};

export default Chat;