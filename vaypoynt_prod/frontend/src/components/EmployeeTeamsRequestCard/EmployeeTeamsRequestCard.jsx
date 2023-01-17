import React, { useContext, useCallback, useState, memo } from "react";
import AppIntegrationCard from "../AppIntegrationCard";
import {
  SlackImg,
  MteamImg,
  OutlookImg
} from "Assets/images";
import { AuthContext, tokenExpireError } from "../../authContext";
import { GlobalContext, showToast } from "../../globalContext";
import { AppStatusColorType, AppStatusType } from "Utils/utils";
import MkdSDK from "Utils/MkdSDK";
import { SlackIntegrationModal } from "../SlackIntegrationModal";
import { useProfile } from "../../hooks/useProfile";
import { TeamsIntegrationModal } from "../TeamsIntegrationModal";
import { InteractiveButton } from "Components/InteractiveButton";

const sdk = new MkdSDK()

const EmployeeTeamsRequestCard = ( { request, onGetTeamsIntegrateRequest } ) => {

  const { state, dispatch } = useContext( AuthContext )
  const { state: GlobalState, dispatch: GlobalDispatch } = useContext( GlobalContext )

  const [ profile ] = useProfile()
  // const [ slackUsername, setSlackUsername ] = useState( "" )

  // const [ teamsIntegrationRequests, setTeamsIntegrationRequests ] = useState( [] )
  const [ teamsId, setTeamsId ] = useState( "" )
  const [ teamsApprovalLoading, setTeamsApprovalLoading ] = useState( false )

  const onTeamsApproval = useCallback( ( employeeId ) => {
    ( async () => {
      try {
        setTeamsApprovalLoading( true )
        const result = await sdk.approveTeamsIntegrationRequest( { teams_id: teamsId }, employeeId )
        if ( !result?.error ) {
          // showToast( GlobalDispatch, "Teams TeamsApproval Successfully!", 4000 )
          setTeamsApprovalLoading( false )
          onGetTeamsIntegrateRequest()
        }
      } catch ( error ) {
        setTeamsApprovalLoading( false )
        console.log( error.message )
        tokenExpireError( dispatch, error.message )
      }
    } )()
  }, [ teamsApprovalLoading, teamsId ] )

  // const onTeamsIdChange = useCallback( ( id ) => {
  //   setTeamsId( id )
  // }, [ teamsId ] )

  const onApprove = useCallback( ( id ) => {
    onTeamsApproval( id )
  }, [ teamsId ] )

  return (
    <>
      <div className={ `m-5 gap-x-2 rounded-[15px] filter-box-holder shadow p-4 bg-white w-full form-border font-medium text-lg` } >

        <div>Employee ID: { request?.employee_id }</div>
        <div>Employee Name: { request?.employee_name }</div>
        <div>Employee EMAIL: { request?.employee_email }</div>
        <div className={ `w-full h-[50px] flex justify-center items-center gap-x-2` }>
          <input className={ `h-full border-none grow text-center outline-none` } placeholder={ `Enter Employee Teams User Id` } onChange={ ( e ) => setTeamsId( e.target.value ) } />
          <InteractiveButton disabled={ teamsApprovalLoading } loading={ teamsApprovalLoading } className={ `form-submit border-2 w-fit px-2 py-1` } onClick={ () => onApprove( request?.id ) }>Approve</InteractiveButton>
        </div>
      </div>
    </>
  );
};

const EmployeeTeamsRequestCardMemo = memo( EmployeeTeamsRequestCard )
export { EmployeeTeamsRequestCardMemo as EmployeeTeamsRequestCard };
