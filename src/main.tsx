import ReactDOM from 'react-dom/client'
import './index.css'

import {
  createHashRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";

import { Join } from './Join';
import { Root } from './Root';
import { Host } from './Host';

/**
 * Nästa steg blir att 
 * Timer
 */

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

