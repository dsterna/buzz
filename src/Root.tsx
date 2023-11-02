import { Link, Outlet } from "react-router-dom"


export const Root = () => {

    return (
        <div>
            <Link to="host" >Skapa spel</Link>
            <br />
            <Link to="join" >Anslut till spel</Link>
            <Outlet />
        </div>
    )
}