import { useState } from "react"

export function Skills(props){

    const addEmptySkill = () => {
        let skill = [...props.skills];

        if(skill.length == 2) return;

        skill.push({name: "", rating: null})
        props.setSkills(skill)
    }

    const removeSkill = (index) => {
        let skill = [...props.skills];
        skill.splice(index, 1);
        props.setSkills(skill)
    }

    const setSkillName = (name, index) => {
        const skill = [...props.skills] || [];
        skill[index]["name"] = name
        props.setSkills(skill);
    }

    return (
        <>
            <div className="contract-creation">
                <div className="question">
                    Add maximum two of your skills that you will use to complete this agreement.
                </div>
                <div className="note">( Ex: Adobe Photoshop, 3D Logo. Agreement will be converted into an SBT with the rating of these skills once the agreement is closed.)</div>
                <div className="add-skill-btn model-skill-btn" onClick={addEmptySkill}>ADD SKILL</div>
                {props.skills.map((skill, index) => (<>
                    <div className="skill-box" key={index}>
                        <input type="text" onChange={(e) => setSkillName(e.target.value, index)} value={skill.name} autoFocus/>
                        <div className="remove" onClick={() => removeSkill(index)}>x</div>
                    </div>
                </>))}

                <div className="btn bottom-left" onClick={() => props.nextStep(props.step - 1)}>Previous</div>
                <div className={"btn bottom-right " + (!props.skills[0]?.name && ' disabled')} onClick={() => props.sign()}>
                    {props.nextLoading && <div className="loading"><div className="bar"></div></div>}
                   Sign
                </div>
            </div> 
        </>
    )
}