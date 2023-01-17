import React, { useContext, useEffect, useState } from "react";
import "./DeskHotelling.css";
import Calender from "Components/Calender";
import MkdSDK from "Utils/MkdSDK";
import { InteractiveButton } from "Components/InteractiveButton";
import { statusTypes } from "Utils/utils";
import { useCallback } from "react";
import { AuthContext, tokenExpireError } from "../../../authContext";
import { GlobalContext, showToast } from "../../../globalContext";
import { btnNext, deskHotellingImage, DeskImg, FloorFieldImg } from "Assets/images";
import MobileHero from "Components/MobileHero";
import { Months } from "Utils/calendar";
import { Spinner } from "Components/Spinner";
import moment from "moment";

const sdk = new MkdSDK()
const now = new Date()
const timeDiff = ( start, end ) => {
  const getDateOnly = ( now ) => {
    const day = now.getDay().toString().length === 1 ? `0${ now.getDay() }` : now.getDay()
    const month = ( now.getMonth() + 1 ).toString().length === 1 ? `0${ now.getMonth() + 1 }` : now.getMonth() + 1
    return `${ now.getFullYear() }-${ month }-${ day }`
  }

  const startTime = moment( `${ getDateOnly( now ) }T${ start }:00` );//now
  const endTime = moment( `${ getDateOnly( now ) }T${ end }:00` );
  const timeInMinutes = Math.abs( endTime.diff( startTime, "minutes" ) )
  if ( timeInMinutes < 60 && timeInMinutes > 0 ) {
    return `0 HH : ${ timeInMinutes } MM`
  } else if ( timeInMinutes > 60 ) {
    const miuntes = timeInMinutes % 60
    const hours = ( timeInMinutes - miuntes ) / 60
    return `${ hours } HH : ${ miuntes } MM`
  } else if ( timeInMinutes === 0 ) {
    return `0 HH : ${ timeInMinutes } MM`
  }
}


function DeskHotelling ( { xnew, line39, preset, duration, path18, saveAsPreset } ) {
  const { state, dispatch: AuthDispatch } = useContext( AuthContext )
  const { dispatch } = useContext( GlobalContext )

  const [ selectedDay, setSelectedDay ] = useState( {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate()
  } );
  const [ dayViews, setDayViews ] = useState( [] );
  const [ bookedDesks, setBookedDesks ] = useState( [] );
  const [ bookedDesk, setBookedDesk ] = useState( null );
  const [ user, setUser ] = useState( null );
  const [ floors, setFloors ] = useState( [] );
  const [ desks, setDesks ] = useState( [] );
  const [ floor, setFloor ] = useState( null );
  const [ desk, setDesk ] = useState( null );
  const [ startTime, setStartTime ] = useState( null );
  const [ endTime, setEndTime ] = useState( null );
  const [ status, setStatus ] = useState( null );
  const [ bookingLoading, setBookingLoading ] = useState( false );
  const [ dayViewLoading, setDayViewLoading ] = useState( false );
  const [ lockOperations, setLockOperations ] = useState( false );

  const getSelectedDate = ( selectedDay ) => {
    return `${ selectedDay.year }-${ selectedDay.month.toString().length === 1 ? `0${ selectedDay.month }` : selectedDay.month }-${ selectedDay.day.toString().length === 1 ? `0${ selectedDay.day }` : selectedDay.day }`
  }
  const getUserProfile = useCallback( () => {
    ( async () => {
      sdk.setTable( "employee_profile" )
      try {
        const result = await sdk.callRestAPI( { id: state?.user }, 'GET' )
        console.log( result )
        if ( !result?.error ) {
          setUser( result?.model )
        }
      } catch ( error ) {
        console.log( error.message )
      }
    } )()

  }, [] )

  const setFloorDesk = useCallback( ( floorNum ) => {
    // console.log( floorNum, "floorNum" )
    setFloor( Number( floorNum ) )
    const foundFloor = floors.find( ( floor ) => {
      if ( Number( floor?.floor ) === Number( floorNum ) ) {
        return floor
      }
    } )
    setAllBookedDesks( floorNum, bookedDesks )

    // console.log( floorNum, "floorNum" )
    console.log( foundFloor )
    if ( foundFloor ) {
      let deskList = []
      for ( let i = foundFloor.start; i <= foundFloor.end; i++ ) {
        deskList.push( i )
      }
      setDesks( () => [ ...deskList ] )
    } else {
      setDesks( () => [] )
    }
  }, [ desks, floor, floors, bookedDesks, bookedDesk ] )

  const setAllBookedDesks = useCallback( ( floorNum, bookedDesks ) => {
    console.log( floorNum )
    const foundBookedDesks = bookedDesks.find( ( bookedDesk ) => {
      if ( Number( bookedDesk?.floor ) === Number( floorNum ) ) {
        return bookedDesk
      }
    } )
    console.log( foundBookedDesks )
    if ( foundBookedDesks ) {
      setBookedDesk( () => ( { ...foundBookedDesks } ) )
      console.log( bookedDesk )
    } else {
      setBookedDesk( () => null )
      console.log( bookedDesk )
    }

  }, [ bookedDesk ] )

  const getDesks = useCallback( () => {
    ( async () => {
      try {
        const result = await sdk.getDeskAndFloor()
        console.log( result )
        if ( !result?.error ) {
          setFloors( () => [ ...result?.list ] )
        }
      } catch ( error ) {
        console.log( error.message )
        tokenExpireError( AuthDispatch, error.message );
      }
    } )()

  }, [] )

  const bookDesk = useCallback( () => {
    if ( !floor || !startTime || !endTime || isNaN( status ) || !desk ) {
      return alert( "Please Select All fields" )
    }
    ( async () => {
      try {
        setBookingLoading( true )
        const result = await sdk.bookDesk( {
          floor: floor,
          // user_id: user.id,
          start_time: `${ getSelectedDate( selectedDay ) }T${ startTime }:00.000Z`,
          end_time: `${ getSelectedDate( selectedDay ) }T${ endTime }:00.000Z`,
          desk_number: desk,
          status_type: status
        } )
        if ( !result?.error ) {
          console.log( result )
          showToast( dispatch, "Desk Booked Successfully", 4000 )
          getDayView( selectedDay )
          setBookingLoading( false )
        }
      } catch ( error ) {
        console.log( error.message )
        setBookingLoading( false )
        tokenExpireError( AuthDispatch, error.message );
      }
    } )()

  }, [ bookingLoading, user, desk, floor, endTime, startTime, status ] )

  const getDayView = useCallback( ( selectedDay ) => {

    ( async () => {
      try {
        setDayViewLoading( true )
        const result = await sdk.dayView( { date: getSelectedDate( selectedDay ) } )
        console.log( result )
        if ( !result?.error ) {
          const noDuplicateFloor = result?.list.filter( ( item, index, self ) => {
            return index === self.findIndex( ( selfItem ) => selfItem.floor === item.floor )
          } )
          const combinedFloors = noDuplicateFloor.map( ( noDupItem ) => {
            return result?.list.filter( ( listItem ) => listItem.floor === noDupItem.floor )
          } )
          const mergedBookedDesks = combinedFloors.map( ( combinedFloorItem ) => {
            return {
              floor: combinedFloorItem[ 0 ].floor,
              bookedDesks: combinedFloorItem.map( ( floorItem ) => floorItem.desk_number ).filter( Boolean )
            }
          } )
          setBookedDesks( () => [ ...mergedBookedDesks ] )
          setAllBookedDesks( floor, mergedBookedDesks )
          setDayViews( () => [ ...result?.list ] )
          const userBookedToday = result?.list.find( ( data ) => data.id === state?.profile?.id )
          if ( userBookedToday ) {
            setLockOperations( true )
          } else {
            setLockOperations( false )
          }
        }
        // showToast( dispatch, "Desk Booked Successfully", 4000 )
        setDayViewLoading( false )
      } catch ( error ) {
        console.log( error.message )
        setDayViews( () => [] )
        setDayViewLoading( false )
        tokenExpireError( AuthDispatch, error.message );
      }
    } )()

  }, [ bookingLoading, user, desk, floor, endTime, startTime, status ] )

  useEffect( () => {
    getUserProfile()
    getDesks()
  }, [] )

  useEffect( () => {
    getDayView( selectedDay )
  }, [ selectedDay ] )

  return (
    // <div className="container-center-horizontal">
    <div className=" overflow-hidden md:pb-0 pb-5">
      <div className="md:hidden w-full">
        <MobileHero companyTitle={ `Desk Hoteling` } />

      </div>
      {/* <div className="flex-row poppins-normal-aluminium-16px">
        <div className="new-preset-overlap">
          <div className="new">{ xnew }</div>
          <img className="line-39" src={ line39 } alt="Line 39" />
        </div>
        <div className="preset">{ preset }</div>
      </div> */}
      <div className={ `md:flex w-full gap-x-5 md:min-h-screen md:max-h-screen md:h-screen px-5 md:pl-5 md:pr-0 md:justify-between` }>
        <div className={ `mb-5 h-full md:grow md:order-2 flex justify-center items-center relative md:flex md:flex-col md:justify-around md:py-5` }>

          <div className={ `hidden md:block absolute inset-0 m-auto w-full h-full` }>
            <img src={ deskHotellingImage } className={ `w-full h-full` } alt="" />
          </div>
          <Calender
            selectedDay={ selectedDay }
            setSelectedDay={ setSelectedDay }
          />
          <div style={ { zIndex: 99 } } className="hidden md:block mx-5 px-5 w-full h-[100px] text-center">
            <p className="text-white font-bold">Day View</p>

            <div className="viwed-people relative mt-2 flex justify-center items-center ">


              {
                dayViewLoading ? <div>
                  <Spinner className={ `h-20 w-20 m-auto mr-0` } fill={ `#4c6fff` } />
                </div> : null
              }
              { dayViews.length && !dayViewLoading ? dayViews.map( ( dayView, index ) => (
                <div key={ index }>
                  <img src={ dayView?.profile_photo } />
                </div>
              ) )
                : null }

            </div>
          </div>
        </div>
        <div className={ `w-full md:w-[40%] pt-5 md:flex md:flex-col md:justify-between md:pb-0` }>

          <fieldset className={ `w-full` }>
            <label className="block mb-2 text-md font-medium text-gray-900">
              Pick Floor
            </label>
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <img className="w-5 h-5 object-contain" src={ FloorFieldImg } />
              </div>
              <select
                type="text"
                disabled={ lockOperations }
                className="bg-gray-50  text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-5  dark:bg-gray-200 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500 poppins-normal-aluminium-16px"
                onChange={ ( e ) => setFloorDesk( Number( e.target.value ) ) }
              >
                <option></option>
                {
                  floors.length ? floors.map( ( floor ) => (
                    <option key={ floor?.floor } value={ floor?.floor }>{ floor?.floor }</option>
                  ) ) : null
                }
              </select>
            </div>
          </fieldset>
          {/* <Group543>{ group543Props.children }</Group543> */ }
          <fieldset className={ `w-full` }>
            <label className="block mb-2 text-md font-medium text-gray-900">
              Desk Number
            </label>
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <img className="w-5 h-5 object-contain" src={ DeskImg } />
              </div>
              <select
                type="text"
                disabled={ lockOperations }
                className="bg-gray-50  text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-5  dark:bg-gray-200 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500 poppins-normal-aluminium-16px"
                onChange={ ( e ) => setDesk( Number( e.target.value ) ) }
              >
                <option></option>
                {
                  desks.length ? desks.map( ( desk ) => (
                    <option disabled={ bookedDesk ? bookedDesk.bookedDesks.includes( desk ) : false } key={ desk } value={ desk }>{ desk }</option>
                  ) ) : null
                }
              </select>
            </div>
          </fieldset>
          <fieldset className={ `w-full` }>
            <label className="block mb-2 text-md font-medium text-gray-900">
              Status
            </label>
            <div className="relative mb-6 w-full">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <img className="w-5 h-5 object-contain" src={ DeskImg } />
              </div>
              <select
                type="text"
                disabled={ lockOperations }
                className="bg-gray-50  text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-5  dark:bg-gray-200 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500 poppins-normal-aluminium-16px"
                onChange={ ( e ) => setStatus( Number( e.target.value ) ) }
              >
                <option className={ `w-full` }></option>
                {
                  statusTypes.map( ( statusType ) => (
                    <option className={ `w-full` } key={ statusType.map } value={ statusType.map }>{ statusType.status }</option>
                  ) )
                }
              </select>
            </div>
          </fieldset>
          {/* here */ }

          <div className="poppins-normal-aluminium-16px">{ duration }</div>

          <div className="relative flex justify-between items-center gap-x-5 mb-2 w-full ">
            <div className="relative group w-1/2 flex justify-center items-center">
              <input disabled={ lockOperations } type={ `time` } className={ `w-full bg-transparent outline-none border-none mx-2` } onChange={ ( e ) => setStartTime( e.target.value ) } />

              <div className="absolute left-0 bottom-[-40px] m-auto hour">{ "From" }</div>
            </div>
            <div className="relative group w-1/2 flex justify-center items-center">
              <input disabled={ lockOperations } type={ `time` } className={ `w-full bg-transparent outline-none border-none mx-2` } onChange={ ( e ) => setEndTime( e.target.value ) } />

              <div className="absolute left-0 bottom-[-40px] m-auto minutes">{ "To" }</div>
            </div>
          </div>
          <div className="flex-row-1 poppins-normal-aluminium-16px">
          </div>
          { lockOperations && !dayViewLoading ? <div className={ `capitalize flex justify-center items-center h-fit p-5 text-base text-center text-red-600 italic font-semibold my-2` }>
            You have Booked this Day already, Therefore You Can not Book it Twice
          </div> : null }
          { dayViewLoading ? <div className={ `capitalize flex justify-center items-center` }>
            <Spinner className={ `h-10 w-10 m-auto ` } fill={ `#4c6fff` } />
          </div> : null }

          <div className="mt-5 flex hottelling-time items-center justify-between gap-x-4 border-b-4 pb-2 mx-auto w-full">
            <p className="text-2xl font-semibold">{ Months[ selectedDay.month - 1 ].month } { selectedDay.day }</p>
            <p className="text-2xl font-semibold">
              {
                startTime && endTime ?
                  timeDiff( startTime, endTime )
                  : "HH : MM"
              }
            </p>
          </div>
          <div className="w-full my-5">
            <InteractiveButton
              disabled={ bookingLoading || lockOperations }
              loading={ bookingLoading }
              className={ `relative button-class flex items-center bg-[#4c6fff] w-full h-[80px] px-5` }
              onClick={ bookDesk }
            >
              <span className={ `absolute h-fit inset-0 m-auto` }>Submit Booking</span> <img className={ `absolute inset-y-0 right-0 mr-5 m-auto filter invert w-[20px] ` } src={ btnNext } />
            </InteractiveButton>
            <img className="path-18" src={ path18 } alt="Path 18" />
          </div>
        </div>
        {/* // </div> */ }
      </div>
    </div >

  );
}

export default DeskHotelling;
