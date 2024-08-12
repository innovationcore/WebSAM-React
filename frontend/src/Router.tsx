import React, {useEffect} from 'react';
import {Routes, Route, useParams} from 'react-router-dom';
import App from "./App.tsx";
import About from "./components/About.tsx";
import Home from "./components/Home.tsx";
import UI from "./components/UI";
import DBView from "./components/DBView";
import Checkpoint from "@/components/Checkpoint";

function Router() {

    return (
        <Routes>
            <Route path="/" element={<Home/>} />
            <Route path="/segment" element={<UI/>} />
            {/*<Route path="/segment/:filename" element={<Checkpoint filename={}/>} />*/}
            <Route exact path="/database" element={<DBView/>} />
        </Routes>
    );
}
export default Router;