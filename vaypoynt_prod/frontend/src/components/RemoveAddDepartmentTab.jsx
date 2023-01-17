import React, { useCallback, useState, useEffect } from "react";
import RemoveAddDepartmentCheckbox from "./RemoveAddDepartmentCheckbox";
import { btnNext, CloseModalImg, CompanyFieldImg } from "Assets/images";
import MkdSDK from "Utils/MkdSDK";
import ContentLoader from "./ContentLoader";

const sdk = new MkdSDK();

const RemoveAddDepartmentTab = () => {
  const [ ShowAddModal, setAddModal ] = useState( false );
  const [ fieldValue, setFieldValue ] = useState( "" );
  const onCloseAddModal = useCallback( () => {
    setAddModal( false );
  }, [ ShowAddModal ] );

  const [ departments, setDepartments ] = useState( [] );
  const [ isLoading, setIsLoading ] = useState( true );

  const getDepartments = () => {
    const END_POINT = "/v2/api/custom/vaypoynt/company/departments";
    const PAYLOAD = {};
    setIsLoading( true )
    sdk.callRawAPI( END_POINT, PAYLOAD, "GET" ).then( ( res ) => {
      setDepartments( res.list );
      setIsLoading( false )
    } );
  };
  useEffect( () => {
    getDepartments();
  }, [] );
  const addDepartmentApi = ( depName ) => {
    const END_POINT = "/v2/api/custom/vaypoynt/company/departments/POST";
    const PAYLOAD = {
      name: depName,
    };

    sdk.callRawAPI( END_POINT, PAYLOAD, "POST" ).then( ( res ) => {
      getDepartments();
      setAddModal( false )
    } );
  };

  const removeDepartments = ( departmentIds ) => {
    const END_POINT = "/v2/api/custom/vaypoynt/company/departments/DELETE";
    const PAYLOAD = {
      id: departmentIds,
    };

    sdk.callRawAPI( END_POINT, PAYLOAD, "POST" ).then( ( res ) => {
      getDepartments();
    } );
  };


  return (
    <>
      { ShowAddModal ? (
        <div className="modal-holder flex items-center justify-center">
          <div className="filter-box-holder shadow p-4 bg-white">
            <h5 className="font-bold text-center text-lg">Add Department</h5>
            <div className="filter-close" onClick={ onCloseAddModal }>
              <img className="w-5 h-5" src={ CloseModalImg } />
            </div>

            <div className="filter-field-holder mt-4">
              <fieldset>
                <label className="block mb-2 text-md font-medium text-gray-900">
                  Department
                </label>
                <div className="relative mb-2">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <img
                      className="w-5 h-5 object-contain"
                      src={ CompanyFieldImg }
                    />
                  </div>
                  <input
                    onChange={ ( event ) => setFieldValue( event.target.value ) }
                    type="text"
                    className="bg-gray-50  text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-5  dark:bg-gray-200 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder=""
                  />
                </div>
              </fieldset>
              <button
                onClick={ () => {
                  if ( fieldValue != "" ) addDepartmentApi( fieldValue );
                  else {
                    alert( "Field Can not me empty" );
                  }
                } }
                className="form-submit mt-4"
                type="button"
              >
                Add Department <img src={ btnNext } />
              </button>
            </div>
          </div>
        </div>
      ) : null }


      { isLoading && <ContentLoader /> }
      <div className="grid md:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        { departments.length > 0 &&
          departments.map( ( item, index ) => {
            return (
              <RemoveAddDepartmentCheckbox
                isChecked={ item.isChecked }
                onChecked={ ( isChecked ) => {
                  let temp = departments[ index ]
                  temp.isChecked = isChecked;
                  departments[ index ] = temp;
                  setDepartments( [ ...departments ] );
                } }
                ChecboxLabel={ item.name }
                departId={ item.id }
              />
            );
          } ) }
      </div>
      <div className="block lg:flex md:flex sm:flex mt-20 w-full gap-2">
        <button onClick={ () => {
          let temp = departments.map( ( item ) => {
            return { ...item, isChecked: true }
          } )
          setDepartments( temp )
        } } className="form-submit mt-2" type="button">
          Select All
        </button>
        <button onClick={ () => {
          let checkedDepartments = departments.filter( ( it ) => it.isChecked )
          let ids = checkedDepartments.map( ( item ) => {
            return item.id
          } )
          removeDepartments( ids )
        } } className="form-submit mt-2" type="button">
          Delete Selected
        </button>
        <button
          className="form-submit mt-2"
          type="button"
          onClick={ () => setAddModal( true ) }
        >
          Add Department
        </button>
      </div>
    </>
  );
};

export default RemoveAddDepartmentTab;
