import React from 'react'

const MarketingSecTitle = ( { secTitle, coloredTitle } ) => {
  return (
    <h3 className='sec-title text-5xl font-bold	'>{ secTitle }  <span className=''>{ coloredTitle }</span></h3>
  )
}

export default MarketingSecTitle
