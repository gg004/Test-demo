import React from 'react'
import PublicHeader from 'Components/PublicHeader'

export const PublicPageWrapper = ( { children } ) => {

  return (
    <>
      <PublicHeader />

      { children }
    </>
  )
}
