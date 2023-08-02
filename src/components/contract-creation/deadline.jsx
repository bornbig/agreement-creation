import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export function Deadline(props){

    // const setDeadlineTimestamp = (value) => {
    //     let valueInMinutes;
    //     if(deadlineRange == "Days"){
    //         valueInMinutes = value * 24 * 60 * 60;
    //     }else if(deadlineRange == "Hours"){
    //         valueInMinutes = value * 60 * 60;
    //     }else if(deadlineRange == "Minutes"){
    //         valueInMinutes = value * 60;
    //     }
    //     const newTimestamp = timestamp + valueInMinutes;

    //     props.setDeadline(newTimestamp)
    // }

    // const getDeadlineValue = () => {
    //     const diffTimestamp = (props.deadline - timestamp) / 60;

    //     console.log(deadlineRange);

    //     if(diffTimestamp < 60){
    //         setDeadlineRange("Minutes");
    //         return diffTimestamp;
    //     }else if(diffTimestamp < 60 * 60){
    //         setDeadlineRange("Hours");
    //         return diffTimestamp / 60;
    //     }else if(diffTimestamp < 60 * 60 * 24){
    //         setDeadlineRange("Days");
    //         return diffTimestamp / (60 * 24);
    //     }

    // }

    return (
        <>
            <div className="contract-creation">
                <div className="question">
                    Deadline of the agreement.
                </div>
                <div className="note">( Ex: 3 days )</div>

                {/* <div className="address-box">
                    <input type="text" onChange={(e) => setDeliveryTimestamp(e.target.value)} value={props.delivery} />
                </div> */}

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