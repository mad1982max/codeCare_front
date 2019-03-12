import React, {Component, Fragment} from 'react';
import { Table, Row, Col, Container, Button, Form, FormGroup, Label, Input} from 'reactstrap';

import {getDayNotes, createNote, updateNote, deleteNote} from '../../services/userFunctions';

import AuthService from '../../services/tokenDecode';

import './UserPanel.css';
const FileSaver = require('file-saver');

class UserPanel extends Component {
    constructor() {
        super();
        this.state = {
            hour: 8,
            min: 0,
            duration: 5,
            title: 'Some text',
            noteId: '',
            action: 'create',
            day: '',
            currentUserEmail: '',
            submitErr: '',
            tasks: []
        }
    this.clickOnDay = this.clickOnDay.bind(this)
    }

    //download day to file JSON
    download = () => {
        if(!this.state.day) { //check for error
            this.setState({submitErr: 'please, choose day'});
            return
        }

        let dataDownloadArr = this.state.tasks.map(({start, duration, title}) => {
            return {start, duration, title}
        });
        const blob = new Blob([JSON.stringify(dataDownloadArr)], {type: "text/plain;charset=utf-8"});
        FileSaver.saveAs((blob), "one_day.json");
    }

    handleOptionChange = event => {
        this.setState({
          action: event.target.value
        });
    };

    clickOnDay(e) {
        let day = e.target.dataset.day;
        this.setState({day: day});
        let token = localStorage.getItem('x-access-token');
        
        getDayNotes(day, token)
            .then(result => {
                console.log(result);
                if(!result.sucess & result.msg === "error verifying local token") {
                    localStorage.removeItem('x-access-token');
                    this.props.history.push('/');
                }
                const taskElem = [...document.getElementsByClassName('task')];
                taskElem.forEach(item => item.remove());
                this.buildShedule(result);
                this.setState({tasks: result.data});
            })
            .catch(err => console.log(err)
            )
    }

    handleBlur = () => { //disapere err_message when lost focus
        this.setState({submitErr: ''});
    }

    //build tasks
    buildShedule = result => {
        const tableLeft = document.getElementById('tableLeft');
        const tableRight = document.getElementById('tableRight');
                
        let tasks = result.data.map(({start, duration, title, _id}) => {return {start, duration, end: start + duration, title, _id}}).sort((a, b) => a.end - b.end); //add duration & asc by end

        const pxPerMin = this.getOneMinHeight();

        //find overlap & position of individual task
        for(let i = 0; i < tasks.length; i++) {
            for(let j = i + 1; j < tasks.length; j++) {
                if(tasks[i].end > tasks[j].start) {
                    tasks[i].overlap = ++tasks[i].overlap || 1;
                    tasks[j].overlap = ++tasks[j].overlap || 1;
                    tasks[i].position = tasks[i].position++ || 1;
                    tasks[j].position = tasks[i].position + 1;
                }
            }
        }

        //build task
        tasks.forEach((item, i) => {
            let parent;
            let task = document.createElement('div');
            task.className = `task_${i} task`;
            task.innerHTML = item.title;
            task.dataset.id = item._id;
            task.dataset.start = item.start;
            task.dataset.duration = item.duration;
            task.dataset.title = item.title;
            task.setAttribute("data-toggle", "tooltip");
            task.setAttribute("data-placement", "top");
            task.setAttribute("title", item.title);
            task.style.height = `${item.duration * pxPerMin}px`;

            if (item.start < 300) { //choose left or right table
                parent = tableLeft;
                task.style.top = `${item.start * pxPerMin}px`;
            } else {
                parent = tableRight;
                task.style.top = `${(item.start - 300) * pxPerMin}px`;
            }

            if(item.overlap) { //change width when overlap
                let width = 100;
                task.style.width = `${width}px`;
                let left = (item.position - 1) * width + 60;

                if(item.position > 2 && item.start > tasks[i-2].end) {
                    left = 60;
                }
                task.style.left = `${left}px`;

            } else {
                task.style.width = '200px';
                task.style.left = '60px';
            }
            
            parent.appendChild(task);

            //bind clicks on tasks
            const taskClass = [...document.querySelectorAll('.task')];
            taskClass.forEach(item => {
                item.addEventListener('click', this.clickOnTask)
            })
        })
    } 

    timeToStart = (hour, min) => { // transform 10.30 to 150 
        return (+hour - 8) * 60 + +min
    }

    startToTime = (start) => { //revers transform
        let hour = Math.floor(start/60);
        let min = start - hour * 60;
        return {hour: hour + 8, min}
    }
    
    clickOnTask = (event) => {
        let start = event.target.dataset.start;
        let duration = event.target.dataset.duration;
        let title = event.target.dataset.title;
        let noteId = event.target.dataset.id;
        let timeObj = this.startToTime(start);
        
        this.setState({
            hour: timeObj.hour,
            min: timeObj.min,
            duration: +duration,
            title: title,
            noteId: noteId
        })
    }
    
    getOneMinHeight = () => { // find m in px
        const heightOfTd = document.querySelector('tr').offsetHeight;
        return heightOfTd/30
    }

    componentDidMount() {
        let token = localStorage.getItem('x-access-token');
        let email = AuthService.getCurrentUserEmail(token);
        this.setState({currentUserEmail: email});

        //bind clicks on days
        let buttons = [...document.getElementsByClassName('single-day')];
        buttons.forEach(item => {
            item.addEventListener('click', this.clickOnDay)
        })
    }

    validation = (action) => {
        let isValid, msg;

        let isValidMin = (+this.state.hour < 17 && +this.state.min >= 0) || (+this.state.hour === 17 && +this.state.min === 0);

        let isValidDuration = (+this.state.hour - 8) * 60 + +this.state.min + +this.state.duration <= 540;

        let isValidDay = [1, 2, 3].indexOf(+this.state.day) >= 0;
        let isValidNoteId = this.state.noteId.length > 0;

        switch(action) {

            case 'update':
            isValid = isValidMin && isValidDuration && isValidNoteId;
            msg = 'error in time or you don\'t choose task';
            break;

            case 'create':
            isValid = isValidMin && isValidDuration && isValidDay;
            msg = 'error in time or you don\'t choose day'
            break;

            case 'delete':
            isValid = isValidNoteId;
            msg = 'you don\'t choose task'
            break
        }
        return {isValid, msg};
    }    

    onSubmit = (event) => {
        event.preventDefault();
        let token = localStorage.getItem('x-access-token');
        if(new AuthService().isTokenExpired(token)) {
            console.log('auth', new AuthService().isTokenExpired(token));
            this.props.history.push('/');
            return
        }

        let action = this.state.action;

        let {isValid, msg} = this.validation(action); //filds validation
        if(!isValid) {
            this.setState({submitErr: msg});
            return
        }

        let noteId = this.state.noteId;
        let day = this.state.day;
        let userId = AuthService.getCurrentUserId(token);

        let start = this.timeToStart(this.state.hour, this.state.min);

        let obj = {
            start: start,
            duration: +this.state.duration,
            title: this.state.title,
            dayOfWeek: +day
        };

        switch(action) {

            case 'delete':
                deleteNote(noteId, token)
                    .then(result => {
                        getDayNotes(day, token)
                            .then(result => {
                                const taskElem = [...document.getElementsByClassName('task')];
                                taskElem.forEach(item => item.remove());
                                this.buildShedule(result);
                            })
                    })
                    .catch(err => console.log(err))
                break;

            case 'update':
                updateNote(noteId, obj, token)
                    .then(result => {
                        console.log(result);
                        
                        getDayNotes(day, token)
                            .then(result => {
                                const taskElem = [...document.getElementsByClassName('task')];
                                taskElem.forEach(item => item.remove());
                                this.buildShedule(result);
                            })
                    })
                    .catch(err => console.log(err))
                break;

            case 'create':
                obj.userId = userId;
                createNote(obj, token)
                    .then(result => {

                        getDayNotes(day, token)
                            .then(result => {
                                const taskElem = [...document.getElementsByClassName('task')];
                                taskElem.forEach(item => item.remove());
                                this.buildShedule(result);
                            })
                    })
                    .catch(err => console.log(err))
                break;
        }
    }

    handleOnChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        this.setState({
            [name]: value
        })
    }

    render() {
        return (
            <Fragment>
                <Container className = 'mt-2'>
                    <Row className = 'pt-2 panel justify-content-center align-items-center'>
                        <Col xs='3' className = 'userEmail'>{this.state.currentUserEmail}</Col>
                        
                        <Col xs='6' className = 'days d-flex text-center'>
                            <Button data-day = '1' className = 'single-day mx-1'>day1</Button>
                            <Button data-day = '2' disabled className = 'single-day mx-1'>day2</Button>
                            <Button data-day = '3' disabled className = 'single-day mx-1'>day3</Button>
                        </Col>

                        <Col>
                            <Button 
                                onBlur = {this.handleBlur}
                                onClick = {this.download}
                                className = "">Download
                            </Button>
                        </Col>

                        <Col xs='4' className = 'action text-left pl-3 row d-flex flex-column justify-content-center'>
                            <Form className = 'col'>        
                                <FormGroup tag="fieldset">
                                    <FormGroup check>
                                        <Label check>
                                        <Input 
                                        checked={this.state.action === "create"}
                                        onChange={this.handleOptionChange}
                                        type="radio" 
                                        value = "create" 
                                        name="action" />
                                        {' '}
                                        Create
                                        </Label>
                                    </FormGroup>
                                    <FormGroup check>
                                        <Label check>
                                        <Input 
                                        checked={this.state.action === "update"}
                                        onChange={this.handleOptionChange}
                                        type="radio" 
                                        value = "update" 
                                        name="action" />
                                        {' '}
                                        Update
                                        </Label>
                                    </FormGroup>
                                    <FormGroup check>
                                        <Label check>
                                        <Input 
                                        checked={this.state.action === "delete"}
                                        onChange={this.handleOptionChange}
                                        type="radio" 
                                        value = "delete" 
                                        name="action" />
                                        {' '}
                                        Delete
                                        </Label>
                                    </FormGroup>
                                </FormGroup>
                            </Form>
                            {(this.state.action === 'update'|| this.state.action === 'delete')&& <div className = 'actionMsg col'>Choose day &<br/> Click on task</div>}
                            {(this.state.action === 'create')&& <div className = 'actionMsg col'>Choose day</div>}
                        </Col>

                        <Col className = 'data '>
                            <Form 
                                onSubmit = {this.onSubmit}
                                onBlur = {this.handleBlur}>
                                <Row className = 'mt-2 pb-0'>
                                    <Col xs='4'>
                                        <FormGroup>
                                            <Label className = 'mb-1' for="hour">Hour</Label>
                                            <Input 
                                            onChange = {this.handleOnChange} 
                                            type="number" 
                                            name="hour" 
                                            id="start"
                                            max='17'
                                            min='8'
                                            value = {this.state.hour} 
                                            placeholder="8" />
                                        </FormGroup>
                                    </Col>

                                    <Col xs='4'>
                                        <FormGroup>
                                            <Label 
                                            className = 'mb-1' 
                                            for="min">Min</Label>
                                            <Input 
                                            onChange = {this.handleOnChange} 
                                            type="number" 
                                            name="min"
                                            max='60'
                                            min='0' 
                                            id="min"
                                            value = {this.state.min}
                                            placeholder="0" />
                                        </FormGroup>
                                    </Col>

                                    <Col xs='4'>
                                        <FormGroup>
                                            <Label 
                                            className = 'mb-1' for="duration">Duration, min</Label>
                                            <Input 
                                            onChange = {this.handleOnChange} 
                                            type="number"
                                            min='5'
                                            max='600'
                                            step ='5'
                                            name="duration" 
                                            id="duration"
                                            value = {this.state.duration} 
                                            placeholder="5" />
                                        </FormGroup>
                                    </Col>
                                
                                
                                </Row>
                                
                                <FormGroup>
                                    <Label className = 'mb-1' for="title">Title</Label>
                                    <Input 
                                    onChange = {this.handleOnChange}
                                    type="text"
                                    required 
                                    maxLength = "100"
                                    name="title"
                                    value = {this.state.title} 
                                    id="title" />
                                </FormGroup>

                                {this.state.submitErr.length > 0 && <div className = 'valiidation mb-2'>{this.state.submitErr}</div>}
                                
                                <Button 
                                    className = "mb-2">Submit
                                </Button>
                            </Form>
                        </Col>
                    </Row>
                </Container>

                <Container>
                    <Row className = 'align-items-center'>
                        <Col xs={{size:6}} className = 'part1 d-flex justify-content-center'>
                            <Table 
                                id = 'tableLeft' 
                                className = 'mt-0 table-borderless'>
        
                                <tbody className = 'd-flex flex-column'>
                                <tr className = 'col pl-0'>
                                    <td className = 'td-handle pt-0 pl-0'>8.00</td>
                                </tr>
                                <tr className = 'col pl-0'>
                                    <td className = 'td-handle pt-0 pl-0'>8.30</td>
                                </tr>
                                <tr className = 'col pl-0'>
                                    <td className = 'td-handle pt-0 pl-0'>9.00</td>
                                </tr>
                                <tr className = 'col pl-0'>
                                    <td className = 'td-handle pt-0 pl-0'>9.30</td>
                                </tr>
                                <tr className = 'col pl-0'>
                                    <td className = 'td-handle pt-0 pl-0'>10.00</td>
                                </tr>
                                <tr className = 'col pl-0'>
                                    <td className = 'td-handle pt-0 pl-0'>10.30</td>
                                </tr>
                                <tr className = 'col pl-0'>
                                    <td className = 'td-handle pt-0 pl-0'>11.00</td>
                                </tr>
                                <tr className = 'col pl-0'>
                                    <td className = 'td-handle pt-0 pl-0'>11.30</td>
                                </tr>
                                <tr className = 'col pl-0'>
                                    <td className = 'td-handle pt-0 pl-0'>12.00</td>
                                </tr>
                                <tr className = 'col pl-0'>
                                    <td className = 'td-handle pt-0 pl-0'>12.30</td>
                                </tr>
                                </tbody>
                            </Table>
                        </Col>
                            
                        <Col xs={{size:6}} className = 'part2 d-flex justify-content-center'>
                            <Table 
                                id = 'tableRight'
                                className = 'mt-0 table-borderless '>
                                
                                <tbody className = 'd-flex flex-column '>
                                    <tr className = 'col pl-0'>
                                        <td className = 'td-handle pt-0 pl-0'>1.00</td>
                                    </tr>
                                    <tr className = 'col pl-0'>
                                        <td className = 'td-handle pt-0 pl-0'>1.30</td>
                                    </tr>
                                    <tr className = 'col pl-0'>
                                        <td className = 'td-handle pt-0 pl-0'>2.00</td>
                                    </tr>
                                    <tr className = 'col pl-0'>
                                        <td className = 'td-handle pt-0 pl-0'>2.30</td>
                                    </tr>
                                    <tr className = 'col pl-0'>
                                        <td className = 'td-handle pt-0 pl-0'>3.00</td>
                                    </tr>
                                    <tr className = 'col pl-0'>
                                        <td className = 'td-handle pt-0 pl-0'>3.30</td>
                                    </tr>
                                    <tr className = 'col pl-0'>
                                        <td className = 'td-handle pt-0 pl-0'>4.00</td>
                                    </tr>
                                    <tr className = 'col pl-0'>
                                        <td className = 'td-handle pt-0 pl-0'>4.30</td>
                                    </tr>
                                    <tr className = 'col pl-0'>
                                        <td className = 'td-handle pt-0 pl-0'>5.00</td>
                                    </tr>
                                </tbody>
                            </Table>
                        </Col>
                    </Row>
                </Container>
            </Fragment>
        )
    }
}

export default UserPanel;
