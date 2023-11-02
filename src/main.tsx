import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

import { Reflect } from "@rocicorp/reflect/client";
import { mutators } from "../reflect/mutators.js";

import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";

import { Join } from './Join';
import { Root } from './Root';
import { Host } from './Host';







/**
 * Nästa steg blir att 
 *  kunna hosta rum (skit i options förutom antal frågor)
 * Kunna jona rum
 * host kunna bläddra mellan frågor 
 * 
 * nästa steg
 * lag 
 * 
 * 
 * Timer
 */


const r = new Reflect({
  userID: "someUser",
  server: "http://localhost:8080",
  mutators,
});

const Wrapper = () => {

  const [hostObject, setHostObject] = useState({})
  const [roomId, setRoomId] = useState(null)

  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path="/" element={<Root />} />
        {/* <Route path="/game" element={<App reflect={newR} />} /> */}
        <Route path="/gameForHost" element={<App />} />
        <Route path="/join/:code?" element={<Join />} />
        <Route path="/host" element={<Host />} />
      </>
    )
  );

  return (
    <div>
      <header className="App-header">
        <RouterProvider router={router} />
      </header>
    </div>
  )
}
ReactDOM.createRoot(document.getElementById('root')!).render(

  <Wrapper />

)

