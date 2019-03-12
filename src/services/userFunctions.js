import axios from 'axios';

export const loginUser = ({email, password}) => {
    return axios
        .post('http://localhost:8080/users/login', {
            email: email,
            password: password
        })
        .then(res => res.data)
        .catch(err => console.log('some err:', err.name))
}

export const getDayNotes = (day, token) => {
    return axios
        .get(`http://localhost:8080/notes/days/${day}`, {
            headers: {'x-access-token': token}
        })
        .then(res => res.data)
        .catch(err => console.log('some err:', err.name))
}

export const createNote = (noteObj, token) => {
    return axios
        .post(`http://localhost:8080/notes/`, noteObj ,{
            headers: {'x-access-token': token}
        })
        .then(res => res.data)
        .catch(err => console.log('some err:', err.name))
}

export const updateNote = (noteId, updateObj, token) => {
    return axios
        .put(`http://localhost:8080/notes/${noteId}`, updateObj, {
            headers: {'x-access-token': token}
        })
        .then(res => res.data)
        .catch(err => console.log('some err:', err.name))
}

export const deleteNote = (noteId, token) => {
    return axios
        .delete(`http://localhost:8080/notes/${noteId}`, {
            headers: {'x-access-token': token}
        })
        .then(res => res.data)
        .catch(err => console.log('some err:', err.name))
}