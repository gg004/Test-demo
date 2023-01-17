import React from "react";
import MobileHero from "Components/MobileHero";
import { AuthContext } from "/src/authContext";
import { BackImg, btnNext } from "Assets/images";
import { NavLink } from "react-router-dom";
import { useState } from "react";
import moment from "moment";
import { useEffect } from "react";
import MkdSDK from "Utils/MkdSDK";
import ContentLoader from "Components/ContentLoader";
import StatusChartPage from "./StatusChartPage";

const sdk = new MkdSDK();
const EmployeeStatusChart = () => {
  const {
    state: { profile },
    dispatch,
  } = React.useContext(AuthContext);
  const ACTIONS = {
    NEXT: "next",
    PREV: "prev",
  };
  const WORKSTATUS = [
    {
        status:0,
        name:'Office'
    },
    {
        status:1,
        name:'WFH'
    },
    {
        status:2,
        name:'Vacation'
    },
    {
        status:3,
        name:'Holiday'
    },
    {
        status:4,
        name:'Sick Day'
    },
    {
        status:5,
        name:'Meeting'
    }
  ]
  
  const [selectedDate, setSelectedDate] = useState(moment());
  const [workStatusIndex, setWorkStatusIndex] = useState(0);
  const [response, setResponse] = useState(undefined);
  const [isLoading, setIsloading] = useState(true);
  
  

  const updateWorkStatus = (action)=>{
    if (action == ACTIONS.NEXT){
        let newStatusIndex = workStatusIndex+1
        if(newStatusIndex<WORKSTATUS.length) setWorkStatusIndex(newStatusIndex)
        else setWorkStatusIndex(0)
    }
    if (action == ACTIONS.PREV){
        let newStatusIndex = workStatusIndex-1
        if(newStatusIndex>=0) setWorkStatusIndex(newStatusIndex)
        else setWorkStatusIndex(WORKSTATUS.length-1)
    }
  }
  const updateDate = (action) => {
    if (action == ACTIONS.NEXT) {
      let date = selectedDate.add(1, "day");
      setSelectedDate(Object.create(date));
    }
    if (action == ACTIONS.PREV) {
      let date = selectedDate.subtract(1, "day");
      setSelectedDate(Object.create(date));
   
    }
  };
  const getStatusChart = (date,workStatusIndex) => {
    const END_POINT = "/v3/api/custom/vaypoynt/statuschart/employee";
    let payload = {
      day: date.format('DD'),
      month: (date.month()+1),
      year: date.year(),
      status_type: WORKSTATUS[workStatusIndex].status,
    };
    sdk.callRawAPI(END_POINT, payload, "POST").then((res) => {
        setIsloading(true)
        console.log(res);
        if(!res.error){
            setIsloading(false)
            setResponse(res.list)
        }
    });
  };

  useEffect(() => {
    getStatusChart(selectedDate,workStatusIndex);
  }, [selectedDate,workStatusIndex]);
  return (
    <>
      <MobileHero
        companyTitle={`Status`}
        arcPosition={`left`}
        className={`absolute inset-x-0 top-0`}
      />
      <div className="employeee-status-holder max-w-[767px] w-full mx-auto">
        <img
          className={`w-16 bg-white h-16 mx-auto -mt-8 boreder-white border-2 relative object-fit rounded-full `}
          src={
            profile?.profile_photo
              ? profile?.profile_photo
              : "https://via.placeholder.com/150"
          }
        />

        <div className="switch-status flex items-center gap-4 justify-center mt-10">
          <div
            onClick={() => updateDate(ACTIONS.PREV)}
            className="flex items-center justify-center p-2 w-10 h-10 bg-white rounded-full shadow-lg"
          >
            <img className="object-contain w-full h-full" src={BackImg} />
          </div>
          <p className="text-black text-[25px] font-medium">
            {selectedDate.format("ddd")}
          </p>
          <div
            onClick={() => updateDate(ACTIONS.NEXT)}
            className="flex items-center justify-center p-2 w-10 h-10 bg-white rounded-full shadow-lg"
          >
            <img
              className="object-contain w-full h-full rotate-180"
              src={BackImg}
            />
          </div>
        </div>

        <div className="switch-status flex items-center gap-4 justify-center mt-5">
          <div onClick={()=>updateWorkStatus(ACTIONS.PREV)} className="flex items-center justify-center p-2 w-10 h-10 bg-white rounded-full shadow-lg">
            <img className="object-contain w-full h-full" src={BackImg} />
          </div>
          <p className="text-black text-[25px] font-medium">{WORKSTATUS[workStatusIndex].name}</p>
          <div onClick={()=>updateWorkStatus(ACTIONS.NEXT)} className="flex items-center justify-center p-2 w-10 h-10 bg-white rounded-full shadow-lg">
            <img
              className="object-contain w-full h-full rotate-180"
              src={BackImg}
            />
          </div>
        </div>

        <ul className="text-center mt-10 flex flex-col gap-2">
            {isLoading && <ContentLoader/>}
          {!isLoading && response!=undefined && response.map((item)=>{
            return  <li>
            <p className="text-black text-[20px] font-medium">{item.first_name} {item.last_name}</p>
          </li>
          })}
         
         
        </ul>

        <NavLink
          to="/employee/dashboard"
          className="form-submit mt-20 max-w-[300px]"
        >
          <img className="rotate-180 left-[20px]" src={btnNext} /> back
        </NavLink>

      </div>
    </>
  );
};

export default EmployeeStatusChart;
