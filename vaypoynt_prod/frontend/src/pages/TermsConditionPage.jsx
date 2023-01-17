import React from "react";
import MobileHero from "Components/MobileHero";
import { NavLink } from "react-router-dom";
const PrivacyPolicyPage = () => {
  return (
    <>
      <MobileHero companyTitle={`TERMS AND CONDITIONS`} className="mb-10" />
      <div className="main-condition-content-holder">
        <div className="container">
          <p>
            These terms and conditions (the "Terms and Conditions") govern the
            use of www.vaypoynt.com (the "Site"). This Site is owned and
            operated by Gurveer Garewal. This Site is an ecommerce website.
          </p>
          <p>
            By using this Site, you indicate that you have read and understand
            these Terms and Conditions and agree to abide by them at all times.
          </p>
          <h2>Intellectual Property</h2>
          <p>
            All content published and made available on our Site is the property
            of Gurveer Garewal and the Site's creators. This includes, but is
            not limited to images, text, logos, documents, downloadable files
            and anything that contributes to the composition of our Site.
          </p>
          <h2>Accounts</h2>
          <p>
            When you create an account on our Site, you agree to the following:
          </p>
          <ol>
            <li>
              You are solely responsible for your account and the security and
              privacy of your account, including passwords or sensitive
              information attached to that account; and
            </li>
            <li>
              All personal information you provide to us through your account is
              up to date, accurate, and truthful and that you will update your
              personal information if it changes.
            </li>
          </ol>
          <p>
            We reserve the right to suspend or terminate your account if you are
            using our Site illegally or if you violate these Terms and
            Conditions.
          </p>
          <h2>Sale of Goods And Services</h2>
          <p>
            These Terms and Conditions govern the sale of goods and services
            available on our Site.
          </p>
          <p>The following goods are available on our Site:</p>
          <ul>
            <li>Company Directory and Desk Booking (Hoteling).</li>
          </ul>
          <p>The following services are available on our Site:</p>
          <ul>
            <li>Desk Booking (Desk Hoteling).</li>
          </ul>
          <p>The services will be paid for in full end of month.</p>
          <p>
            These Terms and Conditions apply to all the goods and services that
            are displayed on our Site at the time you access it. This includes
            all products listed as being out of stock. All information,
            descriptions, or images that we provide about our goods and services
            are as accurate as possible. However, we are not legally bound by
            such information, descriptions, or images as we cannot guarantee the
            accuracy of all goods and services we provide. You agree to purchase
            goods and services from our Site at your own risk.
          </p>
          <p>
            We reserve the right to modify, reject or cancel your order whenever
            it becomes necessary. If we cancel your order and have already
            processed your payment, we will give you a refund equal to the
            amount you paid. You agree that it is your responsibility to monitor
            your payment instrument to verify receipt of any refund.
          </p>
          <h2>Subscriptions</h2>
          <p>
            Your subscription automatically renews and you will be automatically
            billed until we receive notification that you want to cancel the
            subscription.
          </p>
          <p>
            To cancel your subscription, please follow these steps: Cancellation
            is a Free of charge and can cancel at anytime.
          </p>
          <h2>Payments</h2>
          <p>We accept the following payment methods on our Site:</p>
          <ul>
            <li>Credit Card;</li>
            <li>PayPal;</li>
            <li>Debit;</li>
            <li>Direct Debit; and</li>
          </ul>
          <p>
            When you provide us with your payment information, you authorize our
            use of and access to the payment instrument you have chosen to use.
            By providing us with your payment information, you authorize us to
            charge the amount due to this payment instrument.
          </p>
          <p>
            If we believe your payment has violated any law or these Terms and
            Conditions, we reserve the right to cancel or reverse your
            transaction.
          </p>
          <h2>Consumer Protection Law</h2>
          <p>
            Where the Consumer Protection Act, or any other consumer protection
            legislation in your jurisdiction applies and cannot be excluded,
            these Terms and Conditions will not limit your legal rights and
            remedies under that legislation. These Terms and Conditions will be
            read subject to the mandatory provisions of that legislation. If
            there is a conflict between these Terms and Conditions and that
            legislation, the mandatory provisions of the legislation will apply.
          </p>
          <h2>Limitation of Liability</h2>
          <p>
            Gurveer Garewal and our directors, officers, agents, employees,
            subsidiaries, and affiliates will not be liable for any actions,
            claims, losses, damages, liabilities and expenses including legal
            fees from your use of the Site.
          </p>
          <h2>Indemnity</h2>
          <p>
            Except where prohibited by law, by using this Site you indemnify and
            hold harmless Gurveer Garewal and our directors, officers, agents,
            employees, subsidiaries, and affiliates from any actions, claims,
            losses, damages, liabilities and expenses including legal fees
            arising out of your use of our Site or your violation of these Terms
            and Conditions.
          </p>
          <h2>Applicable Law</h2>
          <p>
            These Terms and Conditions are governed by the laws of the Province
            of Ontario.
          </p>
          <h2>Severability</h2>
          <p>
            If at any time any of the provisions set forth in these Terms and
            Conditions are found to be inconsistent or invalid under applicable
            laws, those provisions will be deemed void and will be removed from
            these Terms and Conditions. All other provisions will not be
            affected by the removal and the rest of these Terms and Conditions
            will still be considered valid.
          </p>
          <h2>Changes</h2>
          <p>
            These Terms and Conditions may be amended from time to time in order
            to maintain compliance with the law and to reflect any changes to
            the way we operate our Site and the way we expect users to behave on
            our Site. We will notify users by email of changes to these Terms
            and Conditions or post a notice on our Site.
          </p>
          <h2>Contact Details</h2>
          <p>Please contact us if you have any questions or concerns. Our contact details are as follows:</p>
          <NavLink to="">(647) 802-3356</NavLink>
          <NavLink to="">urveerg@hotmail.com</NavLink>
          <hr/>
          <p>You can also contact us through the feedback form available on our Site.</p>
          <p className="text-right font-bold">Effective Date: 1st day of January, 2023</p>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicyPage;
