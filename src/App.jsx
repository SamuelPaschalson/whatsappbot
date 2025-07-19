import React from "react";
import Home from "./pages/home/Home";
import "./app.scss";
import Register from "./pages/register/Register";
//import Watch from './pages/watch/Watch'
import Login from "./pages/login/Login";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from "react-router-dom";

const App = () => {
  const user = true;
  return (
    <Router>
      <Switch>
        <Route exact path="/">
          {user ? <Home /> : <Redirect to="register" />}
        </Route>
        <Route exact path="/login">
          {!user ? <Login /> : <Redirect to="login" />}
        </Route>
        {user && (
          <>
            <Route exact path="/series">
              <Home type="series" />
            </Route>
            <Route exact path="/movies">
              <Home type="movie" />
            </Route>
          </>
        )}
      </Switch>
    </Router>
  );
};

export default App;
