const fieldValidation = (fieldName, value) => {
    let valid; 
    let msg;

    switch(fieldName) {
        
        case 'email':
            valid = value.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i);
            msg = valid ? '' : `is invalid`;
            break;  
            
        case 'password': 
            valid = value.length >= 4 && value.length <= 8;
            msg = valid ? '': `should be from 4 to 8`;
            break;

        case 'hour':
            valid = value >= 8 && value <= 17;
            msg = valid ? '': `should be from 8 to 15`;
            break;

        case 'min':
            valid = value >= 0 && value <= 59;
            msg = valid ? '': `should be from 0 to 59`;
            break;

        case 'title':
            valid = value.length !== 0 && value.length <= 100;
            msg = valid ? '': `should be not empty`;
            break;    

        default: 
            break;
    }
    return {valid, msg}
}

export default fieldValidation;