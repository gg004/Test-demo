import React, { useContext, useCallback, useState, useEffect } from "react";
import AppIntegrationCard from "../../components/AppIntegrationCard";
import {
  SlackImg,
  MteamImg,
  OutlookImg
} from "Assets/images";
import { AuthContext, tokenExpireError } from "../../authContext";
import { GlobalContext, showToast } from "../../globalContext";
import { AppStatusColorType, AppStatusType, AppType } from "Utils/utils";
import MkdSDK from "Utils/MkdSDK";
import { InteractiveButton } from "Components/InteractiveButton";
import { EmployeeTeamsRequestCard } from "Components/EmployeeTeamsRequestCard";
import { TeamsIntegrationModal } from "Components/TeamsIntegrationModal";
import { TeamsIntegrationInfoModal } from "Components/TeamsIntegrationInfoModal";

const sdk = new MkdSDK()

const AppIntegrationTab = () => {

  const { state: { profile }, dispatch } = useContext( AuthContext )
  const { state: GlobalState, dispatch: GlobalDispatch } = useContext( GlobalContext )

  const [ activeApp, setActiveApp ] = useState( null )

  const [ teamsIntegrationRequests, setTeamsIntegrationRequests ] = useState( [] )
  const [ getTeamsIntegrationLoading, setGetTeamsIntegrationLoading ] = useState( false )
  const [ teamsModalInfoOpen, setTeamsModalInfoOpen ] = useState( false )


  const onAppChange = useCallback( ( app ) => {
    if ( app === AppType.Teams ) {
      onGetTeamsIntegrateRequest()
    }
    setActiveApp( app )

  }, [ activeApp ] )



  const onGetTeamsIntegrateRequest = useCallback( () => {
    ( async () => {
      try {
        setGetTeamsIntegrationLoading( true )
        const result = await sdk.getTeamsIntegrationRequest()
        if ( !result?.error ) {
          // showToast( GlobalDispatch, "Teams Integrated Successfully!", 4000 )
          setTeamsIntegrationRequests( () => [ ...result?.list ] )
          setGetTeamsIntegrationLoading( false )
        }
      } catch ( error ) {
        setGetTeamsIntegrationLoading( false )
        console.log( error.message )
        tokenExpireError( dispatch, error.message )
      }
    } )()
  }, [ getTeamsIntegrationLoading, teamsIntegrationRequests ] )

  // const onTeamsApproval = useCallback( ( employeeId ) => {
  //   ( async () => {
  //     try {
  //       setTeamsApprovalLoading( true )
  //       const result = await sdk.approveTeamsIntegrationRequest( { teams_id: teamsId }, employeeId )
  //       if ( !result?.error ) {
  //         // showToast( GlobalDispatch, "Teams TeamsApproval Successfully!", 4000 )
  //         setTeamsApprovalLoading( false )
  //         onGetTeamsIntegrateRequest()
  //       }
  //     } catch ( error ) {
  //       setTeamsApprovalLoading( false )
  //       console.log( error.message )
  //       tokenExpireError( dispatch, error.message )
  //     }
  //   } )()
  // }, [ teamsApprovalLoading, teamsId ] )

  useEffect( () => {
    // console.log( result?.list )
    console.log( teamsIntegrationRequests )

    onGetTeamsIntegrateRequest()

  }, [] )

  return (
    <>
      {
        teamsModalInfoOpen ? <TeamsIntegrationInfoModal
          onCloseTeamsIntegrationModal={ () => setTeamsModalInfoOpen( false ) } /> : null
      }
      <div className="grid lg:grid-cols-3 md:grid-cols-3 gap-10">
        <AppIntegrationCard
          AppImg={ SlackImg }
          AppStatus={ AppStatusType.Connected }
          AppStatusColor={ AppStatusColorType.Connected }
          onConnectClick={ () => onAppChange( AppType.Slack ) }
          appType={ AppType.Slack }
          activeApp={ activeApp }
        />
        {/* <a target={"_blank"} ></a> */ }
        <AppIntegrationCard
          AppImg={ MteamImg }
          AppStatus={ AppStatusType.Connected }
          AppStatusColor={ AppStatusColorType.Connected }
          onConnectClick={ () => onAppChange( AppType.Teams ) }
          appType={ AppType.Teams }
          activeApp={ activeApp }
        />
        <AppIntegrationCard
          AppImg={ OutlookImg }
          AppStatus={ AppStatusType.Connected }
          AppStatusColor={ AppStatusColorType.Connected }
          onConnectClick={ () => onAppChange( AppType.Outlook ) }
          appType={ AppType.Outlook }
          activeApp={ activeApp }
        />
      </div>

      <div className={ `hidden ${ activeApp === AppType.Slack ? "block" : "" }` }>

      </div>
      <div className={ ` ${ activeApp === AppType.Teams ? "block" : "hidden" }` }>
        <div className={ `w-full h-[50px] flex justify-end items-center` }>
          <button className={ `text-[#28a8ea] text-xs` } onClick={ () => setTeamsModalInfoOpen( true ) }>info</button>
        </div>
        {
          teamsIntegrationRequests.length ?
            <div className={ `mt-5` }>
              <div className={ `text-black text-3xl font-semibold` }>
                <h2>Employee's Teams Integration Request</h2>
              </div>
              <div className={ `w-full  flex justify-center` }>
                {
                  teamsIntegrationRequests.map( ( request, index ) => (
                    <EmployeeTeamsRequestCard
                      key={ index }
                      request={ request }
                      onGetTeamsIntegrateRequest={ onGetTeamsIntegrateRequest }
                    />
                  ) )
                }
              </div>
            </div> : null
        }
      </div>
      <div className={ `hidden ${ activeApp === AppType.Outlook ? "block" : "" }` }>

      </div>
    </>
  );
};

export default AppIntegrationTab;
