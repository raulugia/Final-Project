
//All the code in this file was written without assistance 

//method to validate email
const validateEmail = email => {
    //standard pattern for email addresses
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    //case email has a pattern that is not allowed
    if(!emailPattern.test(email)){
        return "Email addressed not valid"
    }

    //case email is too long
    if(email.length > 255){
        return "Email address cannot be more than 255 characters"
    }

    //case validated successfully 
    return true
}

//method to validate the username
const validateUsername = (username) => {
    //username pattern - letters, numbers, underscores, hyphens or periods allowed
    let usernamePattern = /^[a-zA-Z0-9._-]+$/

    //case username has characters that are not allowed
    if(!usernamePattern.test(username)){
        return "Usernames can only have letters, numbers, underscores, hyphens and periods"
    }

    //case username is too long
    if(username.length > 25){
        return "Username cannot exceed 25 characters"
    }

    //case validated successfully
    return true
}

//method to validate the name and surname
const validateNameSurname = (inputValue, inputType) => {
    //only letters, apostrophes and hyphens allowed
    let inputPattern = /^[a-zA-Z'-]/g

    //case name/surname has characters that are not allowed
    if(!inputPattern.test(inputValue)){
        return `${inputType} can only have letters, apostrophes and hyphens`
    }

    //case name/surname too long
    if(inputValue.length > 100){
        return `${inputType} cannot exceed 100 characters`
    }

    //case validated successfully
    return true
}

module.exports = { validateEmail, validateUsername, validateNameSurname }