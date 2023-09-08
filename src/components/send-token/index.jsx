import { useState } from "react";
import { Modal } from "../modal";

export function SendToken(props){
    return (
        <>
        <Modal isOpen={props.isOpen} closeModal={props.closeModal}>
            hiii
        </Modal>
        </>
    )
}