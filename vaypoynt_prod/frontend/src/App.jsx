import React from "react";
import AuthProvider from "./authContext";
import GlobalProvider from "./globalContext";
import Main from "./main";
import "@uppy/core/dist/style.css";
import "@uppy/dashboard/dist/style.css";
import { BrowserRouter as Router } from "react-router-dom";
import "react-loading-skeleton/dist/skeleton.css";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe( "pk_test_51Ll5ukBgOlWo0lDUrBhA2W7EX2MwUH9AR5Y3KQoujf7PTQagZAJylWP1UOFbtH4UwxoufZbInwehQppWAq53kmNC00UIKSmebO" );

// options={ options }
function App () {
  return (
    <AuthProvider>
      <GlobalProvider>
        <Router>
          <Elements stripe={ stripePromise }
          >
            <Main />
          </Elements>
        </Router>
      </GlobalProvider>
    </AuthProvider>
  );
}

export default App;
