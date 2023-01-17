import React, { useState } from "react";
import DeskTicketBox from "./DeskTicketBox";
import { PlusImg } from "Assets/images";
import ContentLoader from "./ContentLoader";
import { useEffect } from "react";
import MkdSDK from "Utils/MkdSDK";
const sdk = new MkdSDK();

const DeskHotellingTab = () => {
  const [DeskList, setDeskList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const getAllDesk = () => {
    const END_POINT = "/v2/api/custom/vaypoynt/company/desktickets";
    const PAYLOAD = {};
    setIsLoading(true);
    sdk
      .callRawAPI(END_POINT, PAYLOAD, "GET")
      .then((res) => {
        setIsLoading(false);
        console.log((res));
        let tempList  = []
        res.list.forEach(item => {
    
          tempList.push( <DeskTicketBox  onRefresh={()=> getAllDesk()}  item={item} key={item.id+item.update_at} />)

        });
        setDeskList(tempList)
      })
      .catch((error) => {
        console.log(error.message);
        // tokenExpireError(dispatch, error.message);
      });
  };
  useEffect(() => {
    getAllDesk();
  }, []);

  const AddDeskTicket = (event) => {
    setDeskList(DeskList.concat(<DeskTicketBox   onRefresh={()=> getAllDesk()} key={DeskList.length} />));
  };
  return (
    <>
      <button className="flex gap-1 text-md font-semibold items-center" onClick={AddDeskTicket}><img className="w-6 h-6 object-contain" src={PlusImg}/> Add Desk Ticket</button>
      {isLoading &&  <ContentLoader />}

      <div className="flex flex-col gap-5 mt-10">
        {DeskList}
      </div>
    </>
  );
};

export default DeskHotellingTab;
