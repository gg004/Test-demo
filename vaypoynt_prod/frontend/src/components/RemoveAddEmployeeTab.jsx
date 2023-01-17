import React, { useCallback, useState, useEffect } from "react";
import RemoveAddEmployeeCheckbox from "./RemoveAddEmployeeCheckbox";
import { btnNext, CloseModalImg, NameFieldImg } from "Assets/images";
import MkdSDK from "Utils/MkdSDK";
import ContentLoader from "./ContentLoader";
import { GlobalContext, showToast } from "../globalContext";
const sdk = new MkdSDK();

const RemoveAddEmployeeTab = () => {

  const { dispatch: globalDispatch } = React.useContext( GlobalContext );
  const [ ShowAddModal, setAddModal ] = useState( false );
  const onCloseAddModal = useCallback( () => {
    setAddModal( false );
  }, [ ShowAddModal ] );



  const [ employees, setEmployees ] = useState( [] );
  const [ regEmployees, setRegEmployees ] = useState( [] );
  const [ isLoading, setIsLoading ] = useState( true );
  const [ selectedEmpId, setSelectedEmpId ] = useState( '-1' );
  const [ selectedDepartmentId, setSelectedDepartmentId ] = useState( '-1' );

  const getEmployees = () => {
    const END_POINT = "/v2/api/custom/vaypoynt/employee";
    const PAYLOAD = {};
    setIsLoading( true )
    sdk.callRawAPI( END_POINT, PAYLOAD, "GET" ).then( ( res ) => {
      setEmployees( res.list );
      console.log( res.list );
      setIsLoading( false )
    } );
  };
  useEffect( () => {
    getEmployees();
    getDepartments();
    getRegEmployees();
  }, [] );


  const getRegEmployees = () => {
    const END_POINT = "/v2/api/custom/vaypoynt/employee/notregistered";
    const PAYLOAD = {};
    sdk.callRawAPI( END_POINT, PAYLOAD, "POST" ).then( ( res ) => {
      setRegEmployees( res.list );
      console.log( res.list );
    } );
  };


  const [ departments, setDepartments ] = useState( [] );
  const getDepartments = () => {
    // const END_POINT = "/v2/api/custom/vaypoynt/company/departments/GET";
    const END_POINT = "/v2/api/custom/vaypoynt/company/departments";
    const PAYLOAD = {};
    sdk.callRawAPI( END_POINT, PAYLOAD, "GET" ).then( ( res ) => {
      console.log( res )
      setDepartments( res.list );
    } );
  };

  const removeEmployees = ( ids ) => {
    const END_POINT = "/v2/api/custom/vaypoynt/employee/DELETE";
    const PAYLOAD = {
      id: ids,
    };

    sdk.callRawAPI( END_POINT, PAYLOAD, "POST" ).then( ( res ) => {
      getEmployees();
    } );
  };

  const assignEmployee = ( empId, depId ) => {
    const END_POINT = "/v2/api/custom/vaypoynt/employee/assign/department";
    const PAYLOAD = {
      "employee_id": Number( empId ),
      "department_id": Number( depId )
    }
    showToast( globalDispatch, "Invitation Sent" );


    sdk.callRawAPI( END_POINT, PAYLOAD, "POST" ).then( ( res ) => {
      getEmployees();
      onCloseAddModal()
    } ).catch( ( e ) => {
      alert( e );
    } )
      ;
  };
  return (
    <>
      { ShowAddModal ? (
        <div className="modal-holder flex items-center justify-center">
          <div className="filter-box-holder shadow p-4 bg-white">
            <h5 className="font-bold text-center text-lg">Add Employee</h5>
            <div className="filter-close" onClick={ onCloseAddModal }>
              <img className="w-5 h-5" src={ CloseModalImg } />
            </div>

            <div className="filter-field-holder mt-4">
              <fieldset className="cus-input mb-4">
                <label className="block mb-2 text-md font-medium text-gray-900">
                  Select Employee
                </label>
                <div className="relative">
                  <select
                    onChange={ ( event ) => {
                      setSelectedEmpId( event.target.value )

                    } }
                    className="bg-white  text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-4  dark:bg-gray-200 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500">
                    <option
                      name={ 'Select Employee' }
                      value={ "-1" }
                      key={ "-1" }
                    >
                      Select Employee
                    </option>
                    { regEmployees.length > 0 &&
                      regEmployees.map( ( item ) => {
                        return (
                          <option
                            name={ item.first_name }
                            value={ item.id }
                            key={ item.first_name }
                          >
                            { item.first_name }
                          </option>
                        );
                      } ) }
                  </select>
                </div>
              </fieldset>
              <fieldset className="cus-input mb-4">
                <label className="block mb-2 text-md font-medium text-gray-900">
                  Select Department
                </label>
                <div className="relative">
                  <select onChange={ ( event ) => {

                    setSelectedDepartmentId( event.target.value )

                  } } className="bg-white  text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-4  dark:bg-gray-200 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500">
                    <option
                      name={ 'Select Department' }
                      value={ "-1" }
                      key={ "-1" }
                    >
                      Select Department
                    </option>
                    { departments.length > 0 &&
                      departments.map( ( item ) => {
                        return (
                          <option
                            name={ item.name }
                            value={ item.id }
                            key={ item.name }
                          >
                            { item.name }
                          </option>
                        );
                      } ) }
                  </select>
                </div>
              </fieldset>
              <button onClick={ () => {
                if ( selectedEmpId == "-1" ) {
                  alert( 'Select Employee' )
                  return
                }
                if ( selectedDepartmentId == "-1" ) {
                  alert( 'Select depatment' )
                  return
                }
                assignEmployee( selectedEmpId, selectedDepartmentId )
              } } className="form-submit mt-4" type="button">
                Add Employee <img src={ btnNext } />
              </button>
            </div>
          </div>
        </div>
      ) : null }

      { isLoading && <ContentLoader /> }
      <div className="grid md:grid-cols-3 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        { employees.length > 0 &&
          employees.map( ( item, index ) => {
            return (
              <RemoveAddEmployeeCheckbox
                isChecked={ item.isChecked }
                onChecked={ ( isChecked ) => {
                  console.log( { isChecked } );
                  let temp = employees[ index ];
                  temp.isChecked = isChecked;
                  employees[ index ] = temp;
                  setEmployees( [ ...employees ] );
                } }
                ChecboxLabel={ item.first_name + " " + item.last_name }
              />
            );
          } ) }
      </div>
      <div className="block lg:flex md:flex sm:flex mt-20 w-full gap-2">
        <button
          onClick={ () => {
            let temp = employees.map( ( item ) => {
              return { ...item, isChecked: true };
            } );
            setEmployees( temp );
          } }
          className="form-submit mt-2"
          type="button"
        >
          Select All
        </button>
        <button onClick={ () => {
          let temDate = employees.filter( ( it ) => it.isChecked )
          let ids = temDate.map( ( item ) => {
            return item.id
          } )
          removeEmployees( ids )
        } } className="form-submit mt-2" type="button">
          Delete Selected
        </button>
        <button
          className="form-submit mt-2"
          type="button"
          onClick={ () => setAddModal( true ) }
        >
          Add Employee
        </button>
      </div>
    </>
  );
};

export default RemoveAddEmployeeTab;
