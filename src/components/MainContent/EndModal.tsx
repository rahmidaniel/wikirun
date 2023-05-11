import {Dialog, Transition} from "@headlessui/react";
import React, {Fragment, useContext, useEffect, useRef, useState} from "react";
import {ArticleContext} from "../../utils/ArticleContext";
import {AppState} from "../../Types/AppStateEnum";

const EndModal = () => {
    const [isOpen, setIsOpen] = useState(false);
    const closeButtonRef = useRef(null)
    const {appState} = useContext(ArticleContext);

    useEffect(()=>{
        if(appState === AppState.ENDED) setIsOpen(true);
    },[appState])

    return (
        <Transition
            show={isOpen}
            enter="transition duration-100 ease-out"
            enterFrom="transform opacity-0"
            enterTo="transform opacity-100"
            leave="transition duration-200 ease-out"
            leaveFrom="transform opacity-100"
            leaveTo="transform opacity-0"
            as={Fragment}
        >
            <Dialog className="modal modal-open" initialFocus={closeButtonRef} onClose={() => setIsOpen(false)}>
                <Dialog.Panel className="modal-box">
                    <Dialog.Title className="font-bold text-xl">Congratulations, you won!</Dialog.Title>
                    <Dialog.Description className="py-4">
                        You've managed to navigate your way through Wikipedia. Let's see how you could've been faster!
                    </Dialog.Description>

                    <button ref={closeButtonRef} className="btn btn-accent mx-auto rounded-2xl m-2" onClick={() => setIsOpen(false)}>Show me</button>
                </Dialog.Panel>
            </Dialog>
        </Transition>
    )
}

export default EndModal;