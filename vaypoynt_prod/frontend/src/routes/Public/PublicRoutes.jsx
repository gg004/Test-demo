import React from 'react'
import { Route, Routes } from 'react-router'

// import { NotFoundPage } from 'Pages/404'
import MarketingPage from 'Pages/MarketingPage'
import PrivacyPolicyPage from 'Pages/PrivacyPolicyPage'
import TermsConditionPage from 'Pages/TermsConditionPage'
import { PublicPageWrapper } from 'Components/PageWrappers'
import CompanySignupPage from 'Pages/login/CompanySignupPage'
import {
  CompanyForgotPage,
  CompanyLoginPage,
  CompanyResetPage
} from 'Pages/company'

import { RecoveryEmail } from 'Pages/common'

import {
  EmployeeForgotPage,
  EmployeeLoginPage,
  EmployeeResetPage
} from 'Pages/employee'

import {
  AdminForgotPage,
  AdminLoginPage,
  AdminResetPage
} from 'Pages/admin'
import EmployeeSignupWrapper from 'Pages/login/EmployeeSignupWrapper'

export const PublicRoutes = () => {
  return (
    <Routes>

      <Route exact path="/admin/login" element={ <PublicPageWrapper> <AdminLoginPage /> </PublicPageWrapper> }></Route>
      <Route exact path="/admin/forgot" element={ <PublicPageWrapper> <AdminForgotPage /> </PublicPageWrapper> }></Route>
      <Route exact path="/admin/reset" element={ <PublicPageWrapper> <AdminResetPage /> </PublicPageWrapper> }></Route>

      <Route exact path="/employee/login" element={ <PublicPageWrapper> <EmployeeLoginPage /> </PublicPageWrapper> }></Route>
      <Route exact path="/employee/forgot" element={ <PublicPageWrapper> <EmployeeForgotPage /> </PublicPageWrapper> }></Route>
      <Route exact path="/employee/reset" element={ <PublicPageWrapper> <EmployeeResetPage /> </PublicPageWrapper> }></Route>

      <Route exact path="/company/login" element={ <PublicPageWrapper> <CompanyLoginPage /> </PublicPageWrapper> }></Route>
      <Route exact path="/company/forgot" element={ <PublicPageWrapper> <CompanyForgotPage /> </PublicPageWrapper> }></Route>
      <Route exact path="/company/reset" element={ <PublicPageWrapper> <CompanyResetPage /> </PublicPageWrapper> }></Route>
      <Route exact path="/company/recovery_email" element={ <PublicPageWrapper> <RecoveryEmail /> </PublicPageWrapper> }></Route>

      <Route exact path="/" element={ <PublicPageWrapper> <MarketingPage /> </PublicPageWrapper> }></Route>
      <Route exact path="privacy_policy" element={ <PublicPageWrapper> <PrivacyPolicyPage /> </PublicPageWrapper> }></Route>
      <Route exact path="terms_and_conditions" element={ <PublicPageWrapper> <TermsConditionPage /> </PublicPageWrapper> }></Route>

      <Route exact path="/company/signup" element={ <PublicPageWrapper><CompanySignupPage /></PublicPageWrapper> }></Route>
      {/* <Route exact path="/employee/signup" element={ <PublicPageWrapper> <EmployeeSignupPage /> </PublicPageWrapper> }></Route> */ }
      <Route exact path="/employee/signup" element={ <PublicPageWrapper> <EmployeeSignupWrapper /> </PublicPageWrapper> }></Route>

      {/* <Route path="*" exact
      element={ <PublicPageWrapper> <NotFoundPage /> </PublicPageWrapper> }
    ></Route> */}
    </Routes>
  )
}
