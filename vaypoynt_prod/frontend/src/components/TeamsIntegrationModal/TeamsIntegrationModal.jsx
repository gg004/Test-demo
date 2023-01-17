import React, { useContext, useEffect } from 'react'
import { btnNext, CloseModalImg } from 'Assets/images'
import { InteractiveButton } from 'Components/InteractiveButton'
import { AuthContext } from '../../authContext'
import { useProfile } from '../../hooks/useProfile'
// import { GlobalContext } from '../../globalContext'

export const TeamsIntegrationModal = ( {
  onCloseTeamsIntegrationModal,
  setTeamsName,
  setTeamsId,
  onTeamsIntegrateRequest,
  teamsIntegrationLoading,
  teamsDisconnectLoading,
  onDisconnectTeams,
  onTeamsIntegrateCancelRequest,
  teamsCancelLoading
} ) => {
  const { state, dispatch } = useContext( AuthContext )

  const [ profile ] = useProfile()

  useEffect( () => {
    dispatch( {
      type: "SET_USER_PROFILE",
      payload: null
    } )
  }, [] )

  return (

    <>
      <div style={ { alignItems: "center", justifyContent: "center" } } className="modal-wrapper flex items-center justify-center">
        <div className="filter-box-holder shadow p-4 bg-white">
          <h5 className="font-bold text-center text-lg">{ profile?.teams_id ? "Disconnect Teams" : "Request Integration" }</h5>
          <div className="filter-close" onClick={ onCloseTeamsIntegrationModal }>
            <img className="w-5 h-5" src={ CloseModalImg } />
          </div>

          { !profile?.teams_id && !profile?.teams_status ?
            // <div className="filter-field-holder mt-4">
            //   <fieldset className="cus-input mb-4">
            //     <label className="block mb-2 text-md font-medium text-gray-900">
            //       Teams Name
            //     </label>
            //     <div className="relative">
            //       <input
            //         onChange={ ( event ) => setTeamsName( event.target.value ) }
            //         className="bg-white  text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-4  dark:bg-gray-200 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500" />

            //     </div>
            //   </fieldset>
            //   <fieldset className="cus-input mb-4">
            //     <label className="block mb-2 text-md font-medium text-gray-900">
            //       Teams Directory ID
            //     </label>
            //     <div className="relative">
            //       <input
            //         onChange={ ( event ) => setTeamsId( event.target.value ) }
            //         className="bg-white  text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-4  dark:bg-gray-200 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500" />

            //     </div>
            //   </fieldset>
            // </div> 

            <InteractiveButton
              disabled={ teamsIntegrationLoading }
              loading={ teamsIntegrationLoading }
              onClick={ () => onTeamsIntegrateRequest() }
              className="form-submit mt-4"
              type="button">
              Send Request <img src={ btnNext } />
            </InteractiveButton>
            : null }
          { profile?.teams_status === "0" ?
            <div className="filter-field-holder mt-4">
              <div className="cus-input w-full h-14 flex justify-center items-center mb-4">
                <div className="mb-2 text-center capitalize text-lg font-medium text-black">
                  Waiting For Teams Integration Approval...
                  <br />
                  Changed Your Mind?
                </div>
              </div>

              <InteractiveButton
                disabled={ teamsCancelLoading }
                loading={ teamsCancelLoading }
                onClick={ () => onTeamsIntegrateCancelRequest() }
                className="form-submit mt-4"
                type="button">
                Cancel Request <img src={ btnNext } />
              </InteractiveButton>
            </div>
            :
            profile?.teams_id && profile?.teams_status === "1" ?
              <div className="filter-field-holder mt-4">
                <div className="cus-input w-full h-14 flex justify-center items-center mb-4">
                  <div className="mb-2 text-center capitalize text-lg font-medium text-black">
                    Are you Sure you want To Disconnect Teams ?

                  </div>
                </div>

                <InteractiveButton
                  disabled={ teamsDisconnectLoading }
                  loading={ teamsDisconnectLoading }
                  onClick={ () => onDisconnectTeams() }
                  className="form-submit mt-4"
                  type="button">
                  Disconnect Teams <img src={ btnNext } />
                </InteractiveButton>
              </div> : null
          }
        </div>
      </div>
    </>
  )
}
