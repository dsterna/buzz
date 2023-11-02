
import { useNavigate, useParams } from 'react-router-dom'

import { useState } from 'react'
import { Reflect } from "@rocicorp/reflect/client";
import { mutators } from "../reflect/mutators.js";

import App from './App.js';
import { useStoredUuid } from './hooks/useStoredUuid.js'


export const Join = () => {


    const { code } = useParams();
    const navigate = useNavigate();
    const [inputCode, setInputCode] = useState(code ?? "")
    const uuid = useStoredUuid();

    const [hasJoined, setHasJoined] = useState(false)
    const [reflect, setReflect] = useState<any>(null)
    const [notFound, setNotFound] = useState(false)


    const handleJoin = async () => {
        const loadGame = async (r: any) => {
            for (let index = 0; index <= 3; index++) {
                setTimeout(async () => {
                    const game = await r.mutate.getGameFromCode("game")
                    if (game) {
                        setReflect(r)
                        setHasJoined(true)
                        navigate(`/join/${inputCode}`)
                        clearInterval(10);
                        return true
                    }
                    else if (index === 3) { setNotFound(true) }
                }, 500);
            }
        }
        if (inputCode) {
            const r = new Reflect({
                roomID: inputCode,
                userID: uuid,
                server: "http://localhost:8080",
                mutators,
            })
            await loadGame(r)

        }
    }

    return (
        <div>{
            hasJoined ? <App reflect={reflect} isHost={false} /> :
                <>
                    <label htmlFor="joinCode">Kod:</label>
                    <br />
                    <input type="text" id="joinCode" value={inputCode} onChange={(e) => {
                        setInputCode(e.target.value)
                        setNotFound(false)
                        setHasJoined(false)
                    }} />
                    <button onClick={() => handleJoin()}>Join</button>

                    {notFound ? <>Inget spel hittades</> : <></>}
                    <br />
                </>
        }
        </div>
    )
}