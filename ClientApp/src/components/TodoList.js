import React, { Component } from 'react';
import { Button } from 'reactstrap';

export class TodoList extends Component {
    //static displayName = TodoList.name;
    constructor(props) {
        super(props);
        this.apiUri = 'https://localhost:7174/api/TodoItems/';
        this.state = { 
                        todolists: [], 
                        dataForm : { 
                                        id: 0, 
                                        name: null, 
                                        isComplete: false
                                    } 
                    };
        this.submitHandle = this.submitHandle.bind(this);
        this.clickEdit = this.clickEdit.bind(this);
        this.clickDelete = this.clickDelete.bind(this);
        this.changeHandle = this.changeHandle.bind(this);
        this.renderForm = this.renderForm.bind(this);
        this.renderList = this.renderList.bind(this);
        this.populateTodoItemsData = this.populateTodoItemsData.bind(this);        
    }

    populateTodoItemsData() {        
        fetch(this.apiUri)
            .then((response) => { 
                return response.json() 
            }).then((data) => {
                this.setState({ todolists: data });
            }).catch(error => console.error('Unable to action item.', error));
    }

    clickEdit(event){
        let id = event.target.value;
        let _uri = this.apiUri + id;
        fetch(_uri)
            .then((response) => { 
                return response.json() 
            }).then((data) => {
                this.setState({ dataForm: data });
            }).catch(error => console.error('Unable to action item.', error));
    }

    changeHandle(event){
        //console.log('onChangeHandle check');
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
        let _dataForm = this.state.dataForm;
        //console.log('name=',name,'value=',value);
        if (name === "name"){
            _dataForm.name = value;
        }
        else if (name === "isComplete"){
            _dataForm.isComplete = value;
        }
        //console.log('data=',_dataForm);
        this.setState({dataForm: _dataForm});
    }

    clickDelete(event){
        let id = event.target.value;
        let uri = this.apiUri + id;
        fetch(uri, { method: "DELETE" })
            .then((response) => {
                return response.status;
            }).then((status) => {
                if (status === 204) {
                    this.populateTodoItemsData();
                }
            }).catch(error => console.error('Unable to delete item.', error));
    }
    
    submitHandle(event){
        event.preventDefault();
        //console.log('submitHandle check');
        let item = this.state.dataForm;
        let uri = this.apiUri;

        let method = item.id == null || item.id === 0 ? "POST" : "PUT";
        let id = item.id == null || item.id === 0 ? "" : item.id;

        if (method === 'PUT'){
            uri += id;
        }
        //console.log('method',method,'uri',uri,'item',item);
        fetch(uri, { 
            method: method,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(item)
        }).then(function(response){
            //console.log('response',response);
            return response.status;
        }).then((statusCode) => {     
            //console.log('statusCode',statusCode);
            if ((statusCode === 200) || (statusCode === 201) || (statusCode === 204)){
                this.setState({dataForm: {id: 0,name: null,isComplete: false}});
                this.populateTodoItemsData();
            }
        }).catch(error => console.error('Unable to action item.', error));
    }

    renderForm(data){
        let IsNew = ((data == null) || (data.id === 0));
        let id = data.id;
        let name = data.name;
        let isComplete = data.isComplete;
        
        return (
        <form onSubmit={this.submitHandle}>
            <input type="hidden" id="id" name="id" defaultValue={id} />
            <label>
                Item:
                <input type="text" id="name" name="name" placeholder={IsNew ? "New To-do" : ""} defaultValue={name} onChange={this.changeHandle} />
            </label>
            <label>
                <input type="checkbox" id="isComplete" name="isComplete" defaultChecked={isComplete} onChange={this.changeHandle} /> Is Complete
            </label>
            
            <Button className="btn btn-primary" type="submit">Save</Button>
            <Button className="btn btn-secundary" type="reset">Cancel</Button>
        </form>);
    }

    renderList(listItems){
        const lst = listItems.length > 0 ? listItems : [];
        const counter = lst.length;
        
        return(
            <div>
                <p id="counter">{counter} {(counter >= 0 && counter <= 1) ? 'to-do' : 'to-dos'}</p>
                <table className='table table-striped' aria-labelledby="tabelLabel">
                    <thead>
                        <tr>
                            <th>Is Complete?</th>
                            <th>Name</th>
                            <th colSpan="2">Actions</th>
                        </tr>
                    </thead>
                    
                    <tbody id="todos">
                    {lst.map(item =>
                        <tr key={item.id}>
                            <td><input type="checkbox" checked={item.isComplete} disabled /></td>
                            <td>{item.name}</td>
                            <td><Button className="btn btn-primary" onClick={this.clickEdit} value={item.id}>Edit</Button></td>
                            <td><Button className="btn btn-primary" onClick={this.clickDelete} value={item.id}>Delete</Button></td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>);
    }

    componentDidMount() {
        this.populateTodoItemsData();
    }

    render() {
        return(
            <div>
                <h1>To-do CRUD</h1>
                {this.renderForm(this.state.dataForm)}
                {this.renderList(this.state.todolists)}
            </div>
        )
    }
}