import React from "react";
import { useState, useEffect } from "react";

import {motion} from "framer-motion";
import { Typewriter } from 'react-simple-typewriter';



function TypingEffect(){
    return(<b> <div
        style={{
            display: 'inline-block',
            fontFamily: "'Quicksand', sans-serif",
            fontSize: '1.3rem',
            margin: '2',
            boxShadow: ' 10px 10px 5px orange;',
            border: '3px solidrgb(162, 0, 255)',
            textShadow:"",
            letterSpacing: '1.5px',
            background: 'purple',
            color: 'pink',
            borderRadius: '12px',
            padding: '2rem'
        }}
        
>
        <span></span>
        <Typewriter
        words ={["Welcome to EmpathAI", "Your own trusted AI Therapist", "Be at ease and don't hesitate to be yourself"]}
        loop ={true}
        cursor
        cursorStyle='_'
        typeSpeed={60}
        deleteSpeed={40}
        delaySpeed={2000}
        
        >
        </Typewriter>

    </div>
</b>

    )
}


function Component(){



    return( <div>
        <h1>This is EmpathAI</h1>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <TypingEffect></TypingEffect>
    </div>






    )

}
export default Component;