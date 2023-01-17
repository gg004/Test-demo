import React, { useState } from "react";
import { useEffect } from "react";
import MkdSDK from "Utils/MkdSDK";
const AddSection = [
  { name: "Section", value: "North East" },
  { name: "Section", value: "North West" },
  { name: "Section", value: "South East" },
  { name: "Section", value: "South West" },
  { name: "Section", value: "North South" },
  { name: "Section", value: "East West" },
];



const DeskTicketBox = ({item,onRefresh}) => {
  const [floor, setFloor] = useState("");
  const [itemId, setItemId] = useState(undefined);
  const [section, setSection] = useState("North East");
  const [startDesk, setStartDesk] = useState("");
  const [endDesk, setEndDesk] = useState("");
  const [endDeskError, setEndDestError] = useState("");
  const [checked, setChecked] = React.useState(item?.status=='1'?true:false);

useEffect(()=>{

  if(item){
    setItemId(item.id)
    setFloor(item.floor)
    setSection(item.section)
    setStartDesk(item.start)
    setEndDesk(item.end)
    setChecked(item.status=='1'?true:false)
  }
},[item])

  const addTicket = async (isEdit) => {
    let sdk = new MkdSDK();
    try {
      const END_POINT = isEdit?"/v1/api/rest/desk_ticket/PUT":"/v2/api/custom/vaypoynt/company/desktickets/POST";
      const PAYLOAD = {
        id:itemId,
        floor,
        section,
        start: startDesk,
        end: endDesk,
        status: checked?'1':'0',
      };
      let resp = await sdk.callRawAPI(END_POINT, PAYLOAD, "POST");
      if (resp.error == false) {
        onRefresh()
      }
    
    } catch (error) {
      console.log("Error", error);
      alert(JSON.stringify(error));
    }
  };
  return (
    <div className="flex gap-5 desk-ticket-box-holder">
      <div className="desk-ticket-field-box flex gap-10 shadow-lg w-fit p-4 rounded-lg border">
        <fieldset>
          <label className="block mb-2 text-lg font-bold text-gray-900">
            Add Floor
          </label>
          <div className="relative mb-2">
            <input
            value={floor}
              min="1"
              max="50"
              onChange={(e) => {
                setFloor(e.target.value);
              }}
              type="number"
              className="bg-gray-50 text-center text-lg  text-black font-bold rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-20 h-14  dark:bg-gray-200 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder=""
            />
          </div>
        </fieldset>
        <fieldset>
          <label className="block mb-2 text-lg font-bold text-gray-900">
            Add Section
          </label>
          <div className="relative mb-2">
            <select
              onChange={(e) => {
                setSection(e.target.value);
              }}
              value={section}
              className="bg-gray-50 text-center py-4 px-5 text-md text-black font-bold rounded-lg focus:ring-blue-500 focus:border-blue-500 block  dark:bg-gray-200 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
            >
              {AddSection.map((option) => (
                <option
                  name={option.name}
                  value={option.value}
                  key={option.value}
                >
                  {option.value}
                </option>
              ))}
            </select>
          </div>
        </fieldset>
        <fieldset>
          <label className="block mb-2 text-lg font-bold text-gray-900">
            Add Desk Number
          </label>
          <div className="flex gap-2">
            <div className="relative mb-2">
              <input
                min="1"
                onChange={(e) => {
                  setStartDesk(e.target.value);
                }}
                value={startDesk}
                type="number"
                className="bg-gray-50 text-center text-lg  text-black font-bold rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-20 h-14  dark:bg-gray-200 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder=""
              />
            </div>
            <div className="relative mb-2">
              <input
                min={startDesk}
                type="number"
                value={endDesk}
                onBlur={(e) => {
                  if (Number(endDesk) < Number(startDesk)) {
                    setEndDesk(Number(startDesk) + 1);
                    setEndDestError("End Time should be greater");
                  }
                }}
                onChange={(e) => {
                  setEndDesk(e.target.value);
                }}
                className="bg-gray-50 text-center text-lg  text-black font-bold rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-20 h-14  dark:bg-gray-200 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder=""
              />
              {endDeskError && <p>{endDeskError}</p>}
            </div>
          </div>
        </fieldset>
        <div className="flex flex-col gap-1 desk-ticket-action">
         {item &&  <button
            onClick={() => {addTicket(true)}}
            className="text-lg font-semibold text-[#4c6fff]"
            type="button"
          >
            Edit
          </button>}
          {!item && <button
            onClick={() => {addTicket()}}
            className="text-lg font-semibold text-[#4c6fff]"
            type="button"
          >
            Add
          </button>}
        </div>
      </div>
      <label className="inline-flex relative items-center cursor-pointer">
        <input
          type="checkbox"
          value={checked}
          defaultChecked={checked}
          onChange={() => setChecked(!checked)}
          className="sr-only peer"
        />
        <div className="w-11 absolute h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
        <span className="ml-12 text-md font-medium text-gray-900  block">
          On/Off Floor
        </span>
      </label>
    </div>
  );
};

export default DeskTicketBox;
