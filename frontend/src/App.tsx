import './assets/css/App.css'
import Header from "./Header.js";
import Footer from "./Footer.js";
import {BrowserRouter} from "react-router-dom";
import Router from "./Router.js";
import Two from "./Header.js";

function App() {

    return (
        <>
            <BrowserRouter>
                <Header/>
                <Router/>
                <Footer/>
            </BrowserRouter>
        </>
    )
}

export default App
