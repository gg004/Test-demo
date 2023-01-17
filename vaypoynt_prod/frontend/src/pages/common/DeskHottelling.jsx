import React, { useCallback, useEffect, useState, useContext } from "react";
import {
  FloorFieldImg,
  DeskImg,
  ClockImg,
  btnNext,
  pic1,
  pic2,
  pic3,
  pic4,
} from "Assets/images";
import Calender from "Components/Calender";
import MkdSDK from "Utils/MkdSDK";
import { AuthContext, tokenExpireError } from "../../authContext";
import { GlobalContext, showToast } from "../../globalContext";
import { Months } from "Utils/calendar";
import { InteractiveButton } from "Components/InteractiveButton";
import { statusTypes } from "Utils/utils";
import { Spinner } from "Components/Spinner";

const sdk = new MkdSDK()
const now = new Date()
const getWorkHours = ( startHour, endHour ) => {
  if ( endHour < startHour ) {
    return 24 - startHour + endHour
  } else if ( endHour === 0 ) {
    return 24 - startHour
  } else {
    return endHour - startHour
  }
}
const getWorkMins = ( startMin, endMin ) => {
  return Math.abs( endMin - startMin )
  // if ( endMin < startMin ) {
  //   console.log( "IF" )
  //   return 60 - startMin + endMin
  // } else if ( endMin === 0 ) {
  //   console.log( "ELSE IF" )
  //   return 60 - startMin
  // } else {
  //   console.log( "ELSE" )
  //   return endMin - startMin
  // }
}

const DeskHottelling = () => {
  const { state, dispatch: AuthDispatch } = useContext( AuthContext )
  const { state: { bookingDate }, dispatch } = useContext( GlobalContext )
  console.log( bookingDate, "bookingDate" )
  const [ selectedDay, setSelectedDay ] = useState( bookingDate || {
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
  const [ time, setTime ] = useState( null );
  const [ status, setStatus ] = useState( null );
  const [ bookingLoading, setBookingLoading ] = useState( false );
  const [ dayViewLoading, setDayViewLoading ] = useState( false );
  const [ lockOperations, setLockOperations ] = useState( false );
  const [ startTime, setStartTime ] = useState( null );
  const [ endTime, setEndTime ] = useState( null );

  const getSelectedDate = ( selectedDay ) => {
    console.log( selectedDay.day )
    return `${ selectedDay.year }-${ selectedDay.month }-${ selectedDay.day.toString().length === 1 ? `0${ selectedDay.day }` : selectedDay.day }`
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

  const onSetTime = useCallback( ( time ) => {
    if ( Number( time.split( ":" )[ 0 ] ) > 17 ) {
      return alert( "Office hours are 9am to 5pm" )
    }
    if ( Number( time.split( ":" )[ 0 ] ) < 9 ) {
      return alert( "Office hours are 9am to 5pm" )
    }
    setTime( time )
  }, [ time ] )

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
      console.log( !floor, !startTime, !endTime, isNaN( status ), !desk )
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
        console.log( result )
        showToast( dispatch, "Desk Booked Successfully", 4000 )
        setBookingLoading( false )
      } catch ( error ) {
        console.log( error.message )
        setBookingLoading( false )
        tokenExpireError( AuthDispatch, error.message );
      }
    } )()

  }, [ bookingLoading, user, desk, floor, startTime, endTime, status ] )

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

  }, [ bookingLoading, user, desk, floor, time, status ] )

  useEffect( () => {
    getUserProfile()
    getDesks()
  }, [] )

  useEffect( () => {
    getDayView( selectedDay )
    dispatch( {
      type: "SET_BOOKING_DATE",
      payload: selectedDay
    } )
  }, [ selectedDay ] )

  return (
    <>
      <div className="desk-hottelling-wrapper">
        <div className="container">
          <div className="desk-hottel-container flex ">
            <div className="desk-hottel-left p-10 flex justify-center gap-10 max-w-[500px] flex-col w-full bg-white">
              <form className="w-full">
                <fieldset>
                  <label className="block mb-2 text-md font-medium text-gray-900">
                    Floor
                  </label>
                  <div className="relative mb-6">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <img
                        className="w-5 h-5 object-contain"
                        src={ FloorFieldImg }
                      />
                    </div>
                    <select
                      type="number"
                      disabled={ lockOperations }
                      className="bg-gray-50  text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-5  dark:bg-gray-200 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      onChange={ ( e ) => setFloorDesk( e.target.value ) }
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
                <fieldset>
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
                      className="bg-gray-50  text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-5  dark:bg-gray-200 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
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
                <fieldset>
                  <label className="block mb-2 text-md font-medium text-gray-900">
                    Status
                  </label>
                  <div className="relative mb-6">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <img className="w-5 h-5 object-contain" src={ DeskImg } />
                    </div>
                    <select
                      type="text"
                      disabled={ lockOperations }
                      className="bg-gray-50  text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-5  dark:bg-gray-200 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      onChange={ ( e ) => setStatus( Number( e.target.value ) ) }
                    >
                      <option></option>
                      {
                        statusTypes.map( ( statusType ) => (
                          <option key={ statusType.map } value={ statusType.map }>{ statusType.status }</option>
                        ) )
                      }
                    </select>
                  </div>
                </fieldset>
                <div className={ `block mb-2 text-md font-medium text-gray-900` }>Duration</div>
                <div className={ `w-full flex justify-center items-center gap-x-2` }>
                  <div className={ `w-1/2` }>

                    <fieldset>
                      <label className="block mb-2 text-md font-medium text-gray-900">
                        From
                      </label>
                      <div className="relative mb-6">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <img className="w-5 h-5 object-contain" src={ ClockImg } />
                        </div>
                        <input
                          type="time"
                          min={ `09:00` }
                          max={ `17:00` }
                          disabled={ lockOperations }
                          className="bg-gray-50  text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-5  dark:bg-gray-200 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                          onChange={ ( e ) => setStartTime( e.target.value ) }
                        />
                      </div>
                    </fieldset>
                  </div>
                  <div className={ `w-1/2` }>

                    <fieldset>
                      <label className="block mb-2 text-md font-medium text-gray-900">
                        To
                      </label>
                      <div className="relative mb-6">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <img className="w-5 h-5 object-contain" src={ ClockImg } />
                        </div>
                        <input
                          type="time"
                          min={ `09:00` }
                          max={ `17:00` }
                          disabled={ lockOperations }
                          className="bg-gray-50  text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-5  dark:bg-gray-200 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                          onChange={ ( e ) => setEndTime( e.target.value ) }
                        />
                      </div>
                    </fieldset>
                  </div>
                </div>
              </form>
              { lockOperations ? <div className={ `capitalize flex justify-center items-start h-[100px] p-5 text-base text-center text-red-600 italic font-semibold my-2` }>
                You have Booked this Day already, Therefore You Can not Book it Twice
              </div> : null }
              <div className="flex hottelling-time items-center justify-around gap-x-4 border-b-4 pb-2 mx-auto w-full">
                <p className="text-2xl font-semibold">{ Months[ selectedDay.month - 1 ].month } { selectedDay.day }</p>
                <p className="text-2xl font-semibold">
                  {
                    startTime && endTime ?
                      getWorkHours( Number( startTime.split( ":" )[ 0 ] ), Number( endTime.split( ":" )[ 0 ] ) ) + "H"
                      : "HH"
                  } : {
                    startTime && endTime ?
                      getWorkMins( Number( startTime.split( ":" )[ 1 ] ), Number( endTime.split( ":" )[ 1 ] ) ) + "M"
                      : "MM"
                  }
                </p>
              </div>

              {/* <button className="form-submit">
              </button> */}
              <InteractiveButton
                disabled={ lockOperations || bookingLoading }
                loading={ bookingLoading }
                onClick={ bookDesk }
                className={ `form-submit` }>
                Submit <img src={ btnNext } />
              </InteractiveButton>
            </div>
            <div className="desk-hottel-right p-10 flex items-center justify-center flex-col gap-5 w-full ">
              <Calender
                selectedDay={ selectedDay }
                setSelectedDay={ setSelectedDay }
              />

              <div className="w-full text-center">
                <p className="text-white font-bold">Day View</p>

                <div className="viwed-people mt-2 flex justify-center items-center">


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
          </div>
        </div>
      </div>
    </>
  );
};

export default DeskHottelling;
