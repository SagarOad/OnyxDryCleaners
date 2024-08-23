// pages/api/auth/error.js
export default function AuthError({ error }) {
    const errorMessage = error || "An unknown error occurred during authentication.";
  
    return (
      <div>
        <h1>Authentication Error</h1>
        <p>{errorMessage}</p>
      </div>
    );
  }
  
  // Get the error from the URL query string
  AuthError.getInitialProps = ({ query }) => {
    return {
      error: query.error,
    };
  };
  