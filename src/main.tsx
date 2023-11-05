import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

import { Reflect } from "@rocicorp/reflect/client";
import { mutators } from "../reflect/mutators.js";

import {
  createHashRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";

import { Join } from './Join';
import { Root } from './Root';
import { Host } from './Host';



const Wrapper = () => {

  const router = createHashRouter(
    createRoutesFromElements(
      <>
        <Route path="/" element={<Root />} />
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

