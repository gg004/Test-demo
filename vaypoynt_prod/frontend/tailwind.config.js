const plugin = require( 'tailwindcss/plugin' )

/** @type {import('tailwindcss').Config} */


module.exports = {
  content: [ "./src/**/*.{js,jsx,ts,tsx}", "./node_modules/tw-elements/dist/js/**/*.js" ],
  theme: {
    extend: {
      // custom user configuration
      bgGradientDeg: {
        75: '75deg',
      }
    },
  },
  plugins: [ require( "tw-elements/dist/plugin" ),
  plugin( function ( { matchUtilities, theme } ) {
    matchUtilities(
      {
        'bg-gradient': ( angle ) => ( {
          'background-image': `linear-gradient(${ angle }, var(--tw-gradient-stops))`,
        } ),
      },
      {
        // values from config and defaults you wish to use most
        values: Object.assign(
          theme( 'bgGradientDeg', {} ), // name of config key. Must be unique
          {
            10: '10deg', // bg-gradient-10
            15: '15deg',
            20: '20deg',
            25: '25deg',
            30: '30deg',
            45: '45deg',
            60: '60deg',
            90: '90deg',
            120: '120deg',
            135: '135deg',
          }
        )
      }
    )
  } )
  ],
};
