import React, { useContext } from 'react'
import { btnNext, CloseModalImg } from 'Assets/images'
import { InteractiveButton } from 'Components/InteractiveButton'
import { AuthContext } from '../../authContext'
// import { GlobalContext } from '../../globalContext'

export const SlackIntegrationModal = ( {
  onCloseSlackIntegrationModal,
  setSlackUsername,
  onIntegrateSlack,
  slackIntegrationLoading,
  slackDisconnectLoading,
  onDisconnectSlack
} ) => {
  const { state: { profile } } = useContext( AuthContext )

  return (

    <>
      <div style={ { alignItems: "center", justifyContent: "center" } } className="modal-wrapper flex items-center justify-center">
        <div className="filter-box-holder shadow p-4 bg-white">
          <h5 className="font-bold text-center text-lg">{ profile?.slack_username ? "Disconnect Slack" : "Integrate Slack" }</h5>
          <div className="filter-close" onClick={ onCloseSlackIntegrationModal }>
            <img className="w-5 h-5" src={ CloseModalImg } />
          </div>

          { !profile?.slack_username ? <div className="filter-field-holder mt-4">
            <fieldset className="cus-input mb-4">
              <label className="block mb-2 text-md font-medium text-gray-900">
                Slack Username
              </label>
              <div className="relative">
                <input
                  onChange={ ( event ) => setSlackUsername( event.target.value ) }
                  className="bg-white  text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-4  dark:bg-gray-200 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500" />

              </div>
            </fieldset>

            <InteractiveButton
              disabled={ slackIntegrationLoading }
              loading={ slackIntegrationLoading }
              onClick={ () => onIntegrateSlack() }
              className="form-submit mt-4"
              type="button">
              Integrate Slack <img src={ btnNext } />
            </InteractiveButton>
          </div> :
            <div className="filter-field-holder mt-4">
              <div className="cus-input w-full h-14 flex justify-center items-center mb-4">
                <div className="mb-2 capitalize text-lg font-medium text-black">
                  Are you Sure you want To Disconnect Slack ?
                </div>
              </div>

              <InteractiveButton
                disabled={ slackDisconnectLoading }
                loading={ slackDisconnectLoading }
                onClick={ () => onDisconnectSlack() }
                className="form-submit mt-4"
                type="button">
                Disconnect Slack <img src={ btnNext } />
              </InteractiveButton>
            </div> }
        </div>
      </div>
    </>
  )
}
