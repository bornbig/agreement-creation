import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export function Deadline(props){

    return (
        <>
            <div className="contract-creation">
                <div className="question">
                    Deadline of the agreement.
                </div>
                <div className="note">( Ex: 3 days )</div>

                <div className="price-box">
                    <input type="text" onChange={(e) => props.setDeadlineValue(e.target.value)} value={props.deadlineValue} />
                    <div className="token-drop-down">
                        <div className="selected-token">{props.deadlineRange} <i className="arrow down"></i></div>
                        <div className="drop-down-list">
                            <div className="item selected" onClick={() => props.setDeadlineRange("Days")}>Days</div>
                            <div className="item selected" onClick={() => props.setDeadlineRange("Hours")}>Hours</div>
                            <div className="item selected" onClick={() => props.setDeadlineRange("Minutes")}>Minutes</div>
                        </div>
                    </div>
                </div>

                <div className="btn bottom-left" onClick={() => props.nextStep(props.step - 1)}>Previous</div>
                <div className="btn bottom-right" onClick={() => props.nextStep(props.step + 1)}>Next</div>
            </div> 
        </>
    )
}