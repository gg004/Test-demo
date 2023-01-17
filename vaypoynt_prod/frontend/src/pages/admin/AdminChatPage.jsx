import React from "react";
import { GlobalContext } from "../../globalContext";
import Chat from "../../components/Chat";

const AdminChatPage = () => {
  const { dispatch: globalDispatch } = React.useContext( GlobalContext );
  React.useEffect( () => {
    globalDispatch( {
      type: "SETPATH",
      payload: {
        path: "chat",
      },
    } );
  }, [] );

  return (
    <div className="flex-1 w-full h-full">
      <Chat />
    </div>
  );
};

export default AdminChatPage;
