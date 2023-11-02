import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { Reflect } from "@rocicorp/reflect/client";
import { mutators } from "../reflect/mutators.js";
import App from "./App";
import Modal from 'react-modal';
import QRCode from 'react-qr-code';
const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
    },
};

export const Host = () => {


    const [formData, setFormData] = useState({
        hostCode: "1234", nrOfTeams: 2, nrOfQuestions: 10, countPoints: true,
        oneAnswerPerQuestion: true
    });

    const [reflect, setReflect] = useState<any>(null)
    const [submitted, setSubmitted] = useState(false)
    const [modalIsOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (submitted)
            reflect.mutate.createGame({
                id: formData.hostCode,
                nrOfTeams: formData.nrOfTeams,
                nrOfQuestions: formData.nrOfQuestions,
                countPoints: formData.countPoints,
                oneAnswerPerQuestion: formData.oneAnswerPerQuestion,
            });

    }, [reflect])



    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
    };

    const handleCheckChange = (event: ChangeEvent<HTMLInputElement>) => {

        const { name, checked } = event.target;
        setFormData((prevFormData) => ({ ...prevFormData, [name]: checked }));
    };


    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (formData.hostCode) {
            const reflect = new Reflect({
                roomID: formData.hostCode,
                userID: "host",
                server: "http://localhost:8080",
                mutators,
            })
            setReflect(reflect)
            setSubmitted(true)

        };
    }

    function openModal() {
        setIsOpen(true);
    }



    function closeModal() {
        setIsOpen(false);
    }


    return (
        <>
            <form onSubmit={handleSubmit}>
                <label htmlFor="hostCode">JoinCode:</label>
                <input type="text" id="hostCode" name="hostCode" value={formData.hostCode} onChange={handleChange} />
                <br />
                <label htmlFor="nrOfTeams">Antal lag</label>
                <input type="number" id="nrOfTeams" name="nrOfTeams" value={formData.nrOfTeams} onChange={handleChange} />
                <br />
                <label htmlFor="nrOfQuestions">Antal frågor</label>
                <input type="number" id="nrOfQuestions" name="nrOfQuestions" value={formData.nrOfQuestions} onChange={handleChange} />
                <br />
                <ul>
                    <label htmlFor="countPoints">Räkna poäng</label>
                    <input id="countPoints" name="countPoints" type="checkbox" checked={formData.countPoints} onChange={(handleCheckChange)} />
                    <br />
                    <label htmlFor="oneAnswerPerQuestion">En chans per fråga</label>
                    <input id="oneAnswerPerQuestion" name="oneAnswerPerQuestion" type="checkbox" checked={formData.oneAnswerPerQuestion} onChange={handleCheckChange} />
                </ul>
                <button type="submit">Skapa spel</button>
            </form>
            <br /><br />
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel="Example Modal"
                style={customStyles}
            >
                <QRCode value={`http://localhost:3000/join/${formData.hostCode}`} />


            </Modal >
            <button onClick={openModal}>
                visa qrKod
            </button>
            <br />
            {
                reflect && <App reflect={reflect} isHost={true} />
            }
        </>

    )
}