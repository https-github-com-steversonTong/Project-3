import "./App.css";
import Wrapper from "./components/Wrapper";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Main from "./pages/main";
import AboutUs from "./pages/AboutUs";
import PageNotFound from "./pages/PageNotFound";
import LiarLiar from "./games/LiarLiar";
import Footer from "./components/Footer";

function App() {
  return (
    <Router>
      <div>
        {/* Wrapper for background and centering things on the page. */}
        <Wrapper classes="min-h-screen h-full bg-gradient-to-tl from-babelBlue-1000 via-babelBlue-900 to-babelCyan-700">
          {/* Switch statement for the router. */}
          <Switch>
            {/* Render main page. */}
            <Route exact path="/">
              <Main />
              <Footer/>
            </Route>
            {/* Render Liar Liar */}
            <Route path="/liarliar">
              <LiarLiar />
            </Route>
            {/* Render About Us page on route. */}
            <Route exact path="/about-us">
              <AboutUs />
            </Route>
            {/* Render this if no other page was found. */}
            <Route>
              <PageNotFound />
            </Route>
          </Switch>
        </Wrapper>
      </div>
    </Router>
  );
}

export default App;
