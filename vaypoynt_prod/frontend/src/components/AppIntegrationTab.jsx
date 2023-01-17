import React, { useContext, useCallback, useState, memo } from "react";
import AppIntegrationCard from "./AppIntegrationCard";
import {
  SlackImg,
  MteamImg,
  OutlookImg
} from "Assets/images";
import { AuthContext, tokenExpireError } from "../authContext";
import { GlobalContext, showToast } from "../globalContext";
import { AppStatusColorType, AppStatusType } from "Utils/utils";
import MkdSDK from "Utils/MkdSDK";
import { SlackIntegrationModal } from "./SlackIntegrationModal";
import { useProfile } from "../hooks/useProfile";
import { TeamsIntegrationModal } from "./TeamsIntegrationModal";

const sdk = new MkdSDK()

const AppIntegrationTab = () => {

  const { state, dispatch } = useContext( AuthContext )
  const { state: GlobalState, dispatch: GlobalDispatch } = useContext( GlobalContext )
  const [ showSlackIntegrationModal, setShowSlackIntegrationModal ] = useState( false )
  const [ showTeamsIntegrationModal, setShowTeamsIntegrationModal ] = useState( false )



  const [ slackUsername, setSlackUsername ] = useState( "" )
  const [ slackIntegrationLoading, setSlackIntegrationLoading ] = useState( false )
  const [ slackDisconnectLoading, setSlackDisconnectLoading ] = useState( false )

  const [ teamsName, setTeamsName ] = useState( "" )
  const [ teamsId, setTeamsId ] = useState( "" )
  const [ teamsIntegrationLoading, setTeamsIntegrationLoading ] = useState( false )
  const [ teamsIntegrationCancelLoading, setTeamsIntegrationCancelLoading ] = useState( false )
  const [ teamsDisconnectLoading, setTeamsDisconnectLoading ] = useState( false )
  const [ profile ] = useProfile()
  // const [ slackUsername, setSlackUsername ] = useState( "" )

  const getStatus = () => {
    if ( profile?.teams_id ) {
      return AppStatusType.Connected
    }
    if ( profile?.teams_status && profile?.teams_status === "0" ) {
      return AppStatusType.Pending
    }
    if ( !profile?.teams_id && !profile?.teams_status ) {
      return AppStatusType.Setup
    }
  }
  const installSlackBot = () => {
    console.log( "installSlackBot" )
    window.open( "https://slack.com/oauth/v2/authorize?client_id=4353658102135.4368127139011&scope=commands,users:read.email,users:read,incoming-webhook&user_scope=email,identity.basic", "_blank", "noreferrer" )
  }
  const installTeamsBot = () => {
    console.log( "installTeamsBot" )
    window.open( "https://teams.microsoft.com/l/app/2798c67a-668f-463d-a1c2-e05913cf71c8?source=app-details-dialog", "_blank", "noreferrer" )
  }

  const onShowSlackIntegrationModal = useCallback( () => {
    setShowSlackIntegrationModal( true )
  }, [ showSlackIntegrationModal ] )
  const onCloseSlackIntegrationModal = useCallback( () => {
    setShowSlackIntegrationModal( false )
  }, [ showSlackIntegrationModal ] )

  const onShowTeamsIntegrationModal = useCallback( () => {
    setShowTeamsIntegrationModal( true )
  }, [ showTeamsIntegrationModal ] )
  const onCloseTeamsIntegrationModal = useCallback( () => {
    setShowTeamsIntegrationModal( false )
  }, [ showTeamsIntegrationModal ] )

  const onIntegrateSlack = useCallback( () => {
    ( async () => {
      try {
        setSlackIntegrationLoading( true )
        const result = await sdk.integrateApp( {
          id: profile?.id,
          slack_username: slackUsername
        } )
        if ( !result?.error ) {
          showToast( GlobalDispatch, "Slack Integrated Successfully!", 4000 )
          setSlackIntegrationLoading( false )
          installSlackBot()
          dispatch( {
            type: "SET_USER_PROFILE",
            payload: null
          } )
          setShowSlackIntegrationModal( false )
          // useProfile()
          // const anchor = document.createElement( "a" )
        }
      } catch ( error ) {
        setSlackIntegrationLoading( false )
        console.log( error.message )
        tokenExpireError( dispatch, error.message )
      }
    } )()
  }, [ slackIntegrationLoading, slackUsername, profile, showSlackIntegrationModal ] )

  const onDisconnectSlack = useCallback( () => {
    ( async () => {
      try {
        setSlackDisconnectLoading( true )
        const result = await sdk.integrateApp( {
          id: profile?.id,
          slack_username: null
        } )
        if ( !result?.error ) {
          showToast( GlobalDispatch, "Slack Disconnected Successfully!", 4000 )
          setSlackDisconnectLoading( false )
          dispatch( {
            type: "SET_USER_PROFILE",
            payload: null
          } )
          setShowSlackIntegrationModal( false )
          // useProfile()
        }
      } catch ( error ) {
        setSlackDisconnectLoading( false )
        console.log( error.message )
        tokenExpireError( dispatch, error.message )
      }
    } )()
  }, [ slackDisconnectLoading, profile, showSlackIntegrationModal ] )

  const onTeamsIntegrateRequest = useCallback( () => {
    ( async () => {
      try {
        setTeamsIntegrationLoading( true )
        const result = await sdk.requestTeamsIntegration()
        if ( !result?.error ) {
          showToast( GlobalDispatch, result?.message, 4000 )
          setTeamsIntegrationLoading( false )
          // installTeamsBot()
          dispatch( {
            type: "SET_USER_PROFILE",
            payload: null
          } )
          setShowTeamsIntegrationModal( false )
          useProfile()
          // const anchor = document.createElement( "a" )
        }
      } catch ( error ) {
        setTeamsIntegrationLoading( false )
        console.log( error.message )
        tokenExpireError( dispatch, error.message )
      }
    } )()
  }, [ teamsIntegrationLoading, teamsName, teamsId, profile, showTeamsIntegrationModal ] )

  const onTeamsIntegrateCancelRequest = useCallback( () => {
    ( async () => {
      try {
        setTeamsIntegrationCancelLoading( true )
        const result = await sdk.cancelTeamsIntegration()
        if ( !result?.error ) {
          showToast( GlobalDispatch, result?.message, 4000 )
          setTeamsIntegrationCancelLoading( false )
          // installTeamsBot()
          dispatch( {
            type: "SET_USER_PROFILE",
            payload: null
          } )
          setShowTeamsIntegrationModal( false )
          useProfile()
          // const anchor = document.createElement( "a" )
        }
      } catch ( error ) {
        setTeamsIntegrationCancelLoading( false )
        console.log( error.message )
        tokenExpireError( dispatch, error.message )
      }
    } )()
  }, [ teamsIntegrationCancelLoading, showTeamsIntegrationModal ] )

  const onDisconnectTeams = useCallback( () => {
    ( async () => {
      try {
        setTeamsDisconnectLoading( true )
        const result = await sdk.integrateApp( {
          id: profile?.id,
          teams_id: null,
          teams_status: null,
        } )
        if ( !result?.error ) {
          showToast( GlobalDispatch, "Teams Disconnected Successfully!", 4000 )
          setTeamsDisconnectLoading( false )
          dispatch( {
            type: "SET_USER_PROFILE",
            payload: null
          } )
          setShowTeamsIntegrationModal( false )
          useProfile()
        }
      } catch ( error ) {
        setTeamsDisconnectLoading( false )
        console.log( error.message )
        tokenExpireError( dispatch, error.message )
      }
    } )()
  }, [ teamsDisconnectLoading, profile, showTeamsIntegrationModal ] )


  return (
    <>
      {
        showSlackIntegrationModal ?
          <SlackIntegrationModal
            onCloseSlackIntegrationModal={ onCloseSlackIntegrationModal }
            onIntegrateSlack={ onIntegrateSlack }
            slackIntegrationLoading={ slackIntegrationLoading }
            setSlackUsername={ setSlackUsername }
            onDisconnectSlack={ onDisconnectSlack }
            slackDisconnectLoading={ slackDisconnectLoading }
          /> : null }
      {
        showTeamsIntegrationModal ?
          <TeamsIntegrationModal
            onCloseTeamsIntegrationModal={ onCloseTeamsIntegrationModal }
            onTeamsIntegrateRequest={ onTeamsIntegrateRequest }
            teamsIntegrationLoading={ teamsIntegrationLoading }
            setTeamsName={ setTeamsName }
            setTeamsId={ setTeamsId }
            onDisconnectTeams={ onDisconnectTeams }
            teamsDisconnectLoading={ teamsDisconnectLoading }
            onTeamsIntegrateCancelRequest={ onTeamsIntegrateCancelRequest }
            teamsCancelLoading={ teamsIntegrationCancelLoading }
          /> : null }
      <div className="grid lg:grid-cols-3 md:grid-cols-3 gap-10">
        <AppIntegrationCard
          AppImg={ SlackImg }
          AppStatus={ profile?.slack_username ? AppStatusType.Connected : AppStatusType.Setup }
          AppStatusColor={ profile?.slack_username ? AppStatusColorType.Connected : AppStatusColorType.Setup }
          onConnectClick={ onShowSlackIntegrationModal }
          AppLink={ profile?.slack_username ? { link: "https://slack.com/oauth/v2/authorize?client_id=4353658102135.4368127139011&scope=commands,users:read.email,users:read,incoming-webhook&user_scope=email,identity.basic", title: 'Install Slack Bot' } : null }
        />
        {/* <a target={"_blank"} ></a> */ }
        <AppIntegrationCard
          AppImg={ MteamImg }
          AppStatus={ getStatus() }
          AppStatusColor={ profile?.teams_id ? AppStatusColorType.Connected : AppStatusColorType.Setup }
          TeamsStatus={ profile?.teams_status ? AppStatusColorType.Connected : AppStatusColorType.Setup }
          onConnectClick={ onShowTeamsIntegrationModal }
        />
        {/* <AppIntegrationCard AppImg={OutlookImg} AppStatus="Connected" AppStatusColor="" /> */ }
      </div>
    </>
  );
};

const AppIntegrationTabMemo = memo( AppIntegrationTab )
export { AppIntegrationTabMemo as AppIntegrationTab };
