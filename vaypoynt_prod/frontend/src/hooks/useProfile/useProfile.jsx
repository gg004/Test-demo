import React from 'react'
import { AuthContext, tokenExpireError } from '../../authContext'
import MkdSDK from 'Utils/MkdSDK'

const sdk = new MkdSDK()

export const useProfile = () => {
  const { state: { profile: AuthProfile }, dispatch } = React.useContext( AuthContext )
  const [ profile, setProfile ] = React.useState( null )

  const getProfile = React.useCallback( () => {
    ( async () => {
      try {
        const result = await sdk.getUserProfile()
        // console.log( result )
        if ( !result?.error ) {
          setProfile( () => result?.model )
          dispatch( {
            type: "SET_USER_PROFILE",
            payload: result?.model
          } )
        }
      } catch ( error ) {
        console.log( error.message )
        tokenExpireError( dispatch, error.message )
      }
    } )()
  }, [ profile ] )

  React.useEffect( () => {
    if ( !AuthProfile ) {
      getProfile()
    } else {
      setProfile( AuthProfile )
    }
  }, [ AuthProfile ] )

  return [ profile, setProfile ]
}
