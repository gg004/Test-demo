import React, { useState, useContext } from "react";
import SearchBar from "Components/SearchBar";
import DepartmentCard from "Components/DepartmentCard";
import MkdSDK from "Utils/MkdSDK";
import { useEffect } from "react";
import ContentLoader from "Components/ContentLoader";
import { tokenExpireError, AuthContext } from "../../authContext";
import { departmentColors } from "Utils/utils";
import MobileHero from "Components/MobileHero";
const sdk = new MkdSDK();
const DepartmentPage = () => {

  const { dispatch } = useContext( AuthContext )

  const [ departments, setDepartments ] = useState( [] );
  const [ dataCopy, setDataCopy ] = useState( [] );
  const [ isLoading, setIsLoading ] = useState( true );

  const END_POINT = "/v2/api/custom/vaypoynt/company/departments";
  const getDepartments = () => {
    const PAYLOAD = {};
    setIsLoading( true )
    sdk.callRawAPI( END_POINT, PAYLOAD, "GET" ).then( ( res ) => {
      console.log( res )
      let currentColor = ""
      const departmentWithColors = res?.list?.map( ( department ) => {
        let index = Math.ceil( Math.random() * departmentColors.length )
        // console.log( index )
        let color = departmentColors[ index ]
        while ( currentColor === color ) {
          index = Math.ceil( Math.random() * departmentColors.length )
          // console.log( index )
          color = departmentColors[ index ]
        }
        department.color = color
        currentColor = color
        return department
      } )
      // console.log( departmentWithColors )
      setDepartments( () => [ ...departmentWithColors ] );
      setDataCopy( () => [ ...res.list ] );
      setIsLoading( false )
    } ).catch( ( error ) => {
      console.log( error.message )
      tokenExpireError( dispatch, error.message )
    } );
  };

  useEffect( () => {
    getDepartments();
  }, [] );

  const [ searchInput, setSearchInput ] = useState( "" );

  const handleChange = ( e ) => {
    e.preventDefault();
    setSearchInput( e.target.value );
  };

  if ( searchInput.length > 0 ) {
    countries.filter( ( country ) => {
      return country.name.match( searchInput );
    } );
  }

  return (
    <>
      <MobileHero
        companyTitle={ `Departments` }
      />
      <div className="container z-50 relative pb-5">
        <div className={ `relative -mt-6 w-full px-5` }>
          <SearchBar
            onChange={ ( event ) => {
              let text = event.target.value;
              if ( text.length > 0 ) {
                let tempData = departments.filter( ( it ) =>
                  it.name.toLowerCase().includes( text.toLowerCase() )
                );

                setDepartments( tempData );
              } else {
                setDepartments( dataCopy );
              }
            } }
            Placeholder="Find Your Departments"
            className={ ` z-50 relative` }
            hideFilter={ true }
          />
        </div>
        { isLoading && <ContentLoader /> }
        <div className="department-box-holder grid lg:grid-cols-3 md:grid-cols-2 items-center lg:gap-y-10 md:gap-y-10 gap-5 gap-x-10 mt-10 pb-10">
          { departments?.length ?
            departments?.map( ( item ) => {
              return (
                <DepartmentCard
                  departTitle={ item?.name }
                  departMembers={ item?.members }
                  color={ item?.color }
                />
              );
            } ) : null }
        </div>
      </div>
    </>
  );
};

export default DepartmentPage;
