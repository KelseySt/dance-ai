import React, { useState } from 'react';
import App from './App';
import Upload from './Upload';

function WrapperComponent({response}) {
    const [resp, setresp] = useState()
    console.log(resp ? true:false)
    return (
        <div>
            {
                resp ? 
                (
                    <>
                     <App response={resp}/> 
                    </>
                )
                :
                (
                    <> 
                        <Upload setResponse={setresp}/>
                    </>
                )
            }
        </div>
    );
}

export default WrapperComponent;
