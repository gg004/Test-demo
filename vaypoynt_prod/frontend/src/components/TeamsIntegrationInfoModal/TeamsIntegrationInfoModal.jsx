import React from 'react'
import {
  btnNext,
  CloseModalImg,
  teamUserIdInstructions1,
  teamUserIdInstructions2,
  teamUserIdInstructions3,
  teamUserIdInstructions4
} from 'Assets/images'
import { InteractiveButton } from 'Components/InteractiveButton'
// import { AuthContext } from '../../authContext'
// import { useProfile } from '../../hooks/useProfile'
// import { GlobalContext } from '../../globalContext'

export const TeamsIntegrationInfoModal = ( { onCloseTeamsIntegrationModal } ) => {
  // const { state, dispatch } = useContext( AuthContext )

  // const [ profile ] = useProfile()

  const openAzure = () => {
    const A = document.createElement( "a" )
    A.href = "https://portal.azure.com/#home"
    A.target = "_blank"
    A.click()
  }
  // useEffect( () => {
  //   dispatch( {
  //     type: "SET_USER_PROFILE",
  //     payload: null
  //   } )
  // }, [] )

  return (

    <>
      <div style={ { alignItems: "center", justifyContent: "center" } } className="modal-wrapper flex items-center justify-center  ">
        <div className={ `w-full   max-h-[650px] overflow-auto` }>
          <div className="filter-box-wrapper shadow p-4 bg-white  w-full  ">
            <h5 className="font-bold text-center text-lg capitalize">How to Get your Employees User ID </h5>
            <div className="filter-close" onClick={ onCloseTeamsIntegrationModal }>
              <img className="w-5 h-5" src={ CloseModalImg } />
            </div>

            <div>
              <div className={ `my-2 text-2xl capitalize font-medium` }>

                To Successfully Integrate the Teams App, You would need to add the user ID or each Employee which can be gotten from your ACTIVE DIRECTORY.

              </div>
              <p className={ `text-2xl` }>Click on the Button Below</p>
              <div className={ `my-2 w-full grid grid-cols-1 gap-x-4` }>
                <img src={ teamUserIdInstructions1 } alt="" className="w-full my-2" />
                <img src={ teamUserIdInstructions2 } alt="" className="w-full my-2" />
                <img src={ teamUserIdInstructions3 } alt="" className="w-full my-2" />
                <img src={ teamUserIdInstructions4 } alt="" className="w-full my-2" />
              </div>
            </div>

            <InteractiveButton
              onClick={ () => openAzure() }
              className="form-submit mt-4 md:w-1/2"
              type="button">
              Get User ID <img src={ btnNext } />
            </InteractiveButton>

          </div>
        </div>
      </div>
    </>
  )
}
