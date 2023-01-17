import SearchBar from "Components/SearchBar";
import React, { useState, useEffect } from "react";
import { BackImg, btnNext } from "Assets/images";
import MkdSDK from "Utils/MkdSDK";
import MobileHero from "Components/MobileHero";
const sdk = new MkdSDK();
import moment from "moment";
const StatusChartPage = () => {
  const [ statusChart, setStatusChart ] = useState( [] );
  const [ departments, setDepartments ] = useState( [] );
  const [ data, setData ] = useState( undefined );
  const [ selectedDepartments, setSelectedDepartments ] = useState( "" );
  const [ selectedDepartmentsIndex, setSelectedDepartmentsIndex ] = useState( 0 );

  const [ dataCopy, setDataCopy ] = useState( [] );

  const END_POINT = "/v3/api/custom/vaypoynt/statuschart";
  // const END_POINT = "/v3/api/custom/vaypoynt/deskhotelling";

  const getStatusChart = () => {
    sdk.callRawAPI( END_POINT, {}, "GET" ).then( ( res ) => {
      var keys = Object.keys( res.list );
      setDepartments( keys );
      if ( keys.length > 0 ) {
        setSelectedDepartments( keys[ 0 ] );
        setSelectedDepartmentsIndex( 0 );
        console.log( res.list )
        setData( res.list );
      }
    } );
  };
  const generateData = ( department, data ) => {
    let employeIds = getEmployees( data[ department ] );
    let finalObj = getEmployeWiseData( data[ department ], employeIds );
    setStatusChart( finalObj );
    setDataCopy( finalObj );
  };
  useEffect( () => {
    getStatusChart();
  }, [] );
  useEffect( () => {
    if ( data ) generateData( selectedDepartments, data );
  }, [ selectedDepartments ] );

  const getEmployeWiseData = ( data, employees ) => {
    const temp = [];

    employees.forEach( ( employee ) => {
      let empObj = {
        empName: "",
        Mon: "-",
        Tue: "-",
        Wed: "-",
        Thu: "-",
        Fri: "-",
        Sat: "-",
        Sun: "-",
      };
      data.forEach( ( item ) => {
        if ( item.user_id == employee ) {
          empObj.empName = item.first_name + " " + item.last_name;
          const weekDay = `${ moment().year() }-${ item.Month }-${ item.Day }`;
          empObj[ moment( weekDay ).format( "ddd" ) ] = getStatusName(
            item.status_type
          );
        }
      } );
      temp.push( empObj );
    } );
    return temp;
  };
  const getStatusName = ( statusCode ) => {
    if ( statusCode == "0" ) return "Office";
    if ( statusCode == "1" ) return "WFH";
    if ( statusCode == "2" ) return "Vacation";
    if ( statusCode == "3" ) return "Holiday";
    if ( statusCode == "4" ) return "Sick Day";
    if ( statusCode == "5" ) return "Meeting";
  };
  const getEmployees = ( data ) => {
    let emp = [];
    for ( let index = 0; index < data.length; index++ ) {
      const item = data[ index ];
      if ( !emp.includes( item.user_id ) ) emp.push( item.user_id );
    }
    return emp;
  };

  const selectNextDepartment = ( departments ) => {
    const nextIndex = selectedDepartmentsIndex + 1;
    if ( departments.length > nextIndex ) {
      setSelectedDepartments( departments[ nextIndex ] )
      setSelectedDepartmentsIndex( nextIndex )
    } else {
      setSelectedDepartments( departments[ 0 ] )
      setSelectedDepartmentsIndex( 0 )
    }
  };
  const selectPrevDepartment = ( departments ) => {
    const lastIdex = selectedDepartmentsIndex - 1;
    if ( lastIdex >= 0 ) {
      setSelectedDepartments( departments[ lastIdex ] )
      setSelectedDepartmentsIndex( lastIdex )
    } else {
      setSelectedDepartments( departments[ departments.length - 1 ] )
      setSelectedDepartmentsIndex( departments.length - 1 )
    }
  };
  return (
    <>
     <MobileHero
        companyTitle={`Status Chart`}
        arcPosition={`left`}
        className={`absolute inset-x-0 top-0`}
      />
      <div className="container z-10 relative">
        <SearchBar
          onChange={ ( event ) => {
            let text = event.target.value;
            if ( text.length > 0 ) {
              let tempData = statusChart.filter( ( it ) =>
                it.empName.toLowerCase().includes( text.toLowerCase() )
              );

              setStatusChart( tempData );
            } else {
              setStatusChart( dataCopy );
            }
          } }
          Placeholder="Find Your Employee"
          hideFilter={ true }
        />
        <div className="w-full max-w-[767px] m-auto">
          <div className="status-chart-head flex justify-between items-center">
            <h3 className="text-2xl font-semibold text-[#4c6fff]"></h3>
            <div className="table-nav flex items-center gap-4">
              <button onClick={ () => {
                selectPrevDepartment( departments )
              } } className="flex items-center justify-center w-8 h-8 rounded-full bg-[#4c6fff]">
                <img className="w-5 h-5 object-contain" src={ BackImg } />
              </button>
              <h4 className="text-xl font-semibold text-[#4c6fff] min-w-10" >
                { selectedDepartments }
              </h4>
              <button onClick={ () => {
                selectNextDepartment( departments )
              } } className="flex items-center justify-center w-8 rotate-180	 h-8 rounded-full bg-[#4c6fff]">
                <img className="w-5 h-5 object-contain" src={ BackImg } />
              </button>
            </div>
          </div>
          <div className="overflow-auto">
            <table className="status-table border-collapse w-full mt-8 shadow-sm min-w-full">
              <thead>
                <tr>
                  <th className="border"></th>
                  <th className="border">MON</th>
                  <th className="border">TUE</th>
                  <th className="border">WED</th>
                  <th className="border">THUR</th>
                  <th className="border">FRI</th>
                  <th className="border">SAT</th>
                  <th className="border">SUN</th>
                </tr>
              </thead>
              <tbody>
                { statusChart.map( ( item ) => {
                  return (
                    <tr>
                      <td className="border">{ item.empName }</td>
                      <td className="border">{ item.Mon }</td>
                      <td className="border">{ item.Tue }</td>
                      <td className="border">{ item.Wed }</td>
                      <td className="border">{ item.Thu }</td>
                      <td className="border">{ item.Fri }</td>
                    </tr>
                  );
                } ) }
              </tbody>
            </table>
          </div>

          <div className="flex status-chart-foot justify-between gap-4 mt-10">
            <div className="table-tag grid md:grid-cols-3 lg:grid-cols-3 sm:grid-cols-3 grid-cols-2 gap-4 w-full">
              <p>Vacation</p>
              <p>WFH</p>
              <p>Sick Day</p>
              <p>Holiday</p>
              <p>Office</p>
              <p>Meeting</p>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default StatusChartPage;
