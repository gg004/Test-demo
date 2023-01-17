import React, { useCallback, useEffect, useState } from "react";
import {
  AdminControlImg,
  AppStoreImg,
  BannerImg,
  CheckImg,
  CompanyImg,
  EmailImg,
  HybridImg,
  LockImg,
  MteamImg,
  Organization2Img,
  Organization3Img,
  Organization4Img,
  OrganizationImg,
  OutlookImg,
  PhoneImg,
  PlaystoreImg,
  SlackImg,
  SyncImg,
  TimeImg,
  WifiImg,
  LinkedInImg,
  FaceBookImg,
  InstagramImg,
  AboutImg,
  IntegrationImg,
  WorkFromHomeImg,
  SolutionImg,
} from "Assets/images";
import MarketingSecTitle from "Components/MarketingSecTitle";
import { NavLink } from "react-router-dom";
import MkdSDK from "Utils/MkdSDK";
import { assignCmsData } from "Utils/utils";
import Contact from "Components/Contact";

const sdk = new MkdSDK()
const MarketingPage = () => {
  const [ cmsData, setCmsData ] = useState( null );

  const getCms = useCallback( () => {
    ( async () => {
      try {
        const result = await sdk.cmsGet()
        console.log( result )
        if ( !result?.error ) {
          populateData( result?.list )
        }
      } catch ( error ) {
        console.log( error.message )

      }
    } )()
  }, [] )
  const populateData = useCallback( ( cms ) => {
    const data = assignCmsData( cms )
    console.log( data )
    setCmsData( () => ( { ...data } ) )
  }, [ cmsData ] )

  useEffect( () => {
    getCms()
  }, [] )


  
  return (
    <>
      <section className="banner-section pt-20 lg:pt-40 md:pt-40" >
        <div className="container">
          <div className="banner-content grid lg:grid-cols-2 md:grid-cols-1 items-center gap-20">
            <div className="banner-left">
              <h1>{ cmsData?.bannerTitle }</h1>
              {/* <h1>Modern Company Directory & Desk Hotelling</h1> */ }
              {/* <p className="text-white mt-10">
                Work from home or at the office let your team know your work
                environment. Best Tool for the Future of Work!!!
              </p> */}
              <p className="text-white mt-10">
                { cmsData?.bannerParah }
              </p>
            </div>
            <div className="banner-right">
              <img className="w-full" src={ BannerImg } />
            </div>
            <div className="col-span-full	text-center lg:mt-40 md:mt-40 mt-10 mb-10">
              <h1 className="text-2xl text-white font-bold	">
                Simple Design | Easy Setup | Data Encrypted
                {/* data.bannerTagLine */ }

              </h1>
            </div>
          </div>
        </div>
      </section>

      <div className="bg-lines pt-40 -mt-40" id="about">
        <div className="container">
          <section className="grid lg:grid-cols-2 cus-reverse md:flex	 md:grid-cols-1 items-center gap-20 mt-40  pb-0 ">
            <div className="bg-shape1">
              <img className="w-full" src={ AboutImg } />
            </div>
            <div className="w-full ">
              <MarketingSecTitle secTitle="About" coloredTitle="vaypoynt" />
              {/* <p className="mb-4">
                We are about to make a new change in the Work From Home Models
                help build a simple process for desk hoteling and company
                directory.
              </p>
              <p>
                Unlimited users and unlimited desks for a simple price will help
                manage a simple work flow for your company. Let us help you get
                your employees into a safe work environment.
              </p> */}
              <p className="mb-4">
                { cmsData?.aboutParah1 }
              </p>
              <p>
                { cmsData?.aboutParah2 }
              </p>
            </div>
          </section>

          <section className="how-it-work -mt-30 lg:-mt-0 text-center py-10 max-w-[600px] mx-auto w-full">
            <MarketingSecTitle secTitle="How it" coloredTitle="works" />
            <p>
              { cmsData?.hiwParah }
            </p>
            {/* <p>
              Have an Administrator to control company directory and desk
              hoteling Employees can use the app or web to show work location
              Add / Remove Departments or Employees Simple | Easy | Data
              Encrypted
            </p> */}
          </section>

          <section className="grid lg:grid-cols-2 cus-reverse md:grid-cols-1 items-center gap-20 py-10">
            <div className="bg-shape2">
              <img className="w-full" src={ WorkFromHomeImg } />
            </div>

            <div className="w-full">
              <MarketingSecTitle coloredTitle="Work From Home Work From Office Hybrid Work Model" />
              <p className="mb-4">
                { cmsData?.wifParah }
              </p>
              {/* <p className="mb-4">
                Employee’s working from home or at the office know how to
                organize and manage your team. View work status with our simple
                tool.
              </p> */}
              <div className="icon-box-holder grid lg:grid-cols-3 grid-cols-3 w-fit  gap-5 mt-10">
                <div className="hybird-box">
                  <img src={ LockImg } />
                  <h5>
                    Data
                    <br />
                    Encrypted
                  </h5>
                </div>
                <div className="hybird-box">
                  <img src={ WifiImg } />
                  <h5>
                    Live
                    <br />
                    Syncronization
                  </h5>
                </div>
                <div className="hybird-box">
                  <img src={ AdminControlImg } />
                  <h5>
                    User
                    <br />
                    Admin Controls
                  </h5>
                </div>
              </div>
            </div>
          </section>

          <section className="grid lg:grid-cols-2 md:grid-cols-1 items-center gap-20 py-10">
            <div className="w-full">
              <MarketingSecTitle coloredTitle="Easy Integration" />
              <p className="mb-4">
                { cmsData?.integrationParah }
              </p>
              <p>{ cmsData?.integrationInfo }</p>
              {/* <p className="mb-4">
                Easily integrate your everyday work tools to help keep your team
                organized.
              </p>
              <p>*More integration apps coming soon*</p> */}
              <div className="icon-box-holder grid lg:grid-cols-3 grid-cols-3 w-fit  gap-5 mt-10">
                <div className="hybird-box">
                  <img src={ MteamImg } />
                </div>
                <div className="hybird-box">
                  <img src={ SlackImg } />
                </div>
                <div className="hybird-box">
                  <img src={ OutlookImg } />
                </div>
              </div>
            </div>

            <div className="bg-shape2">
              <img className="w-full" src={ IntegrationImg } />
            </div>
          </section>

          <section className="grid lg:grid-cols-2 cus-reverse md:grid-cols-1 items-center gap-20 py-10">
            <div className="bg-shape2">
              <img className="w-full" src={ SolutionImg } />
            </div>

            <div className="w-full">
              <MarketingSecTitle coloredTitle="One Platform Multiple Solutions" />
              <p>
                { cmsData?.platformSolution }
              </p>
              {/* <p>
                Unlimited Users & Unlimited Desk Hoteling with a simple and
                affordable price
              </p> */}
              <div className="icon-box-holder grid lg:grid-cols-3 grid-cols-3 w-fit  gap-5 mt-10">
                <div className="hybird-box">
                  <img src={ TimeImg } />
                  <h5>
                    Time your
                    <br /> Desk Hoteling
                  </h5>
                </div>
                <div className="hybird-box">
                  <img src={ HybridImg } />
                  <h5>
                    View Hybrid
                    <br /> Work Schedules
                  </h5>
                </div>
                <div className="hybird-box">
                  <img src={ SyncImg } />
                  <h5>
                    Sync Across
                    <br /> All Devices
                  </h5>
                </div>
              </div>
            </div>
          </section>

          <section className="price-sec max-w-[767px] mx-auto py-10 px-10 mt-20 mb-20 text-white text-center rounded-4 rounded-lg">
            <h4>Desk Hoteling + Company Directory</h4>
            <h3>{ cmsData?.price }</h3>
            {/* <h3>$3.49</h3> */ }
            <h5>Monthly</h5>
            <div className="grid lg:grid-cols-2 md:grid-cols-1 w-fit gap-x-8 gap-y-2 mx-auto mt-10">
              <p className="flex items-center">
                <img className="mr-2" src={ CheckImg } /> Unlimited Users
              </p>
              <p className="flex items-center">
                <img className="mr-2" src={ CheckImg } /> Unlimited Desks
              </p>
              <p className="flex items-center">
                <img className="mr-2" src={ CheckImg } /> More Free Features
              </p>
              <p className="flex items-center">
                <img className="mr-2" src={ CheckImg } /> Early Access to Beta
              </p>
              <p className="flex items-center">
                <img className="mr-2" src={ CheckImg } /> Cancel Free Anytime
              </p>
              <p className="flex items-center">
                <img className="mr-2" src={ CheckImg } /> Data Encrypted
              </p>
            </div>
            {/* <h4 className="mt-8">NO MORE PER USER, PER DESK NONSENSE</h4> */}
          </section>
        </div>
      </div>

      <section className="py-20">
        <div className="container">
          <div className="text-center max-w-[767px] mx-auto ">
            <MarketingSecTitle secTitle={ cmsData?.directoryOrganization } />
          </div>
          <div className="grid lg:grid-cols-2 md:grid-cols-1 gap-10 mt-10">
            <img className="drop-shadow-xl" src={ OrganizationImg } />
            <img className="drop-shadow-xl" src={ Organization2Img } />
            <img className="drop-shadow-xl" src={ Organization3Img } />
            <img className="drop-shadow-xl" src={ Organization4Img } />
          </div>
        </div>
      </section>

      <section className="download-company py-10">
        <div className="container">
          <div className="grid lg:grid-cols-2 md:grid-cols-1 gap-10 mt-10 items-center">
            <div className="text-white">
              <MarketingSecTitle secTitle={ cmsData?.downloadTitle } />
              <p>
                { cmsData?.downloadParah }
              </p>
              {/* <p>
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry. Lorem Ipsum has been the industry's standard dummy
                text ever since the 1500s, when an unknown printer took a galley
                of type and scrambled it to make a type specimen book.
              </p> */}
              {/* <div className="store-img grid lg:grid-cols-2 md:grid-cols-2 grid-cols-2 w-fit  gap-5 mt-10">
                <img src={ AppStoreImg } />
                <img src={ PlaystoreImg } />
              </div> */}
            </div>
            <img className="w-full rounded-xl" src={ CompanyImg } />
          </div>
        </div>
      </section>

      <footer className="marketing-footer pb-10 pt-40" id="contact">
        <div className="container">
          <div className="grid lg:grid-cols-2 md:grid-cols-1 gap-20 lg:gap-y-30 md:gap-y-20 gap-y-10 -mt-40  items-end max-w-[990px] mx-auto w-full">
            <div className="marketing-form py-5 px-8 bg-white mt-10">
              <h4 className="text-center">Contact Us</h4>
              <p className="text-center">Have any suggestions let us know</p>
            <Contact/>
            </div>
            <div className="foot-marketing-info">
              <ul className="flex gap-6 flex-col">
                <li>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center justify-center p-4 rounded-full bg-white shadow-sm w-15 h-15">
                      <img className="object-contain	 w-10 h-10" src={ PhoneImg } />
                    </span>
                    <span>
                      <h5>Phone</h5>
                      <NavLink to="#">{ cmsData?.contactPhone }</NavLink>
                      {/* <NavLink to="#">(647) 802-3356</NavLink> */ }
                    </span>
                  </div>
                </li>
                <li>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center justify-center p-4 rounded-full bg-white shadow-sm w-15 h-15">
                      <img className="object-contain	 w-10 h-10" src={ EmailImg } />
                    </span>
                    <span>
                      <h5>Email</h5>
                      <NavLink to="#">
                        { cmsData?.contactEmail }
                      </NavLink>
                      {/* <NavLink to="#">
                        Vaypoyntsupport@gmail.com
                      </NavLink> */}
                    </span>
                  </div>
                </li>
              </ul>
            </div>

            <div className="foot-bottom-links lg:pt-10 md:pt-10 pt-5 col-span-full text-white lg:flex grid justify-between gap-4 grid-cols-2  items-center">
              <p className="sm:col-span-ful">
                Copyright Ⓒ Vaypoynt Inc 2023 All Rights Reserved
              </p>
              <ul className="flex foot-nav items-center gap-3 lg:ml-0 ml-auto">
                <li>
                  <NavLink to="/privacy_policy">Privacy Policy</NavLink>
                </li>
                <li>
                  <NavLink to="/terms_and_conditions">Terms & Conditions</NavLink>
                </li>
              </ul>
 
              <ul className="foot-social flex items-center gap-3 lg:ml-2 lg:border-l-2 pl-5 ml-auto">
                <li>
                  <NavLink
                    to="#"
                    className="flex justify-center items-center w-8 h-8 bg-[#1f389e] rounded-full border-2"
                  >
                    <img className="w-3 h-3 object-contain" src={ LinkedInImg } />
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="#"
                    className="flex justify-center items-center w-8 h-8 bg-[#1f389e] rounded-full border-2"
                  >
                    <img className="w-3 h-3 object-contain" src={ FaceBookImg } />
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="#"
                    className="flex justify-center items-center w-8 h-8 bg-[#1f389e] rounded-full border-2"
                  >
                    <img className="w-3 h-3 object-contain" src={ InstagramImg } />
                  </NavLink>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default MarketingPage;
