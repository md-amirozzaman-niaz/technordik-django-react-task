import React from 'react';
import './App.css';


class App extends React.Component {
  constructor(props){
    super(props);
      this.state = {
        todoList:[],
        activeItem:{
          id:null, 
          title:'',
          completed:false,
          marked:true
        },
        editing:false,
        bulkTodoList:[]
      }
      this.fetchTasks = this.fetchTasks.bind(this)
      this.handleChange = this.handleChange.bind(this)
      this.handleSubmit = this.handleSubmit.bind(this)
      this.getCookie = this.getCookie.bind(this)


      this.startEdit = this.startEdit.bind(this)
      this.deleteItem = this.deleteItem.bind(this)
      this.strikeUnstrike = this.strikeUnstrike.bind(this)
      this.save = this.save.bind(this)
      this.taskMarking = this.taskMarking.bind(this)
      this.clear = this.clear.bind(this)
  };

  getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
  }

  componentWillMount(){
    this.fetchTasks()
  }

  fetchTasks(){
    console.log('Fetching...')

    fetch('http://127.0.0.1:8000/api/task-list/')
    .then(response => response.json())
    .then(data => 
      this.setState({
        todoList:data
      })
      )
  }

  handleChange(e){
    var name = e.target.name
    var value = e.target.value
    console.log('Name:', name)
    console.log('Value:', value)

    this.setState((state,props) => {
      return {
      activeItem:{
        ...state.activeItem,
        title:value
      }
    }})
  }

  updateBulkToDoList(){
    this.setState((state,props) => {
      return {bulkTodoList:[
        ...state.bulkTodoList,
        state.activeItem
      ]
    }})
  }
  handleSubmit(e){
    e.preventDefault()
    console.log('ITEM:', this.state.activeItem)
    this.updateBulkToDoList();
    this.setState((state,props) => {
      return {
      activeItem:{
        id:null, 
        title:'',
        completed:false,
        marked:true
      }
    }})
    var csrftoken = this.getCookie('csrftoken')

    var url = 'http://127.0.0.1:8000/api/task-create/'

    if(this.state.editing == true){
      url = `http://127.0.0.1:8000/api/task-update/${ this.state.activeItem.id}/`
      this.setState({
        editing:false
      })
    }



    // fetch(url, {
    //   method:'POST',
    //   headers:{
    //     'Content-type':'application/json',
    //     'X-CSRFToken':csrftoken,
    //   },
    //   body:JSON.stringify(this.state.activeItem)
    // }).then((response)  => {
    //     this.fetchTasks()
    //     this.setState({
    //        activeItem:{
    //       id:null, 
    //       title:'',
    //       completed:false,
    //     }
    //     })
    // }).catch(function(error){
    //   console.log('ERROR:', error)
    // })

  }

  startEdit(task){
    this.setState({
      activeItem:task,
      editing:true,
    })
  }

  deleteItem(task){
    var csrftoken = this.getCookie('csrftoken')

    fetch(`http://127.0.0.1:8000/api/task-delete/${task.id}/`, {
      method:'DELETE',
      headers:{
        'Content-type':'application/json',
        'X-CSRFToken':csrftoken,
      },
    }).then((response) =>{

      this.fetchTasks()
    })
  }

  taskMarking(task){
    task.marked = !task.marked
    this.forceUpdate();
  }
  strikeUnstrike(task){

    task.completed = !task.completed
    var csrftoken = this.getCookie('csrftoken')
    var url = `http://127.0.0.1:8000/api/task-update/${task.id}/`

      fetch(url, {
        method:'POST',
        headers:{
          'Content-type':'application/json',
          'X-CSRFToken':csrftoken,
        },
        body:JSON.stringify({'completed': task.completed, 'title':task.title})
      }).then(() => {
        this.fetchTasks()
      })

    console.log('TASK:', task.completed)
  }

  save(){
    var csrftoken = this.getCookie('csrftoken')
    var url = `http://127.0.0.1:8000/api/task-bulk/`
 
      fetch(url, {
        method:'POST',
        headers:{
          'Content-type':'application/json',
          'X-CSRFToken':csrftoken,
        },
        body:JSON.stringify(this.state.bulkTodoList.filter(e=> e.marked))
      }).then((res) => {
        console.log(res)
        this.setState({bulkTodoList:[]})
        this.fetchTasks()
      })

    
  }
  clear(){
    this.setState({bulkTodoList:this.state.bulkTodoList.map((task) => ({...task,marked:false}))})
  }

  render(){
    var tasks = this.state.todoList
    var bulkTasks = this.state.bulkTodoList
    var self = this
    return(
        <div className="container">
          <div id="task-container">
              <div  id="form-wrapper" className="p-3">
                 <form onSubmit={self.handleSubmit}  id="form">
                    <div className="flex-wrapper">
                        <div style={{flex: 13}}>
                            <input onChange={self.handleChange} className="form-control" id="title" value={this.state.activeItem.title} type="text" name="title" placeholder="Task name" />
                         </div>
                         <span style={{flex:0.5}} onClick={self.handleSubmit} className="btn btn-primary ml-1 material-icons">add</span>
                          
                      </div>
                </form>
             
              </div>
              <div className="pl-3 pr-3 py-0">         
                    {bulkTasks.map(function(task, index){
                      return(
                          <div key={index} className="flex-wrapper">
                            <span style={{flex:0.5}} onClick={() => self.taskMarking(task)} className={task.marked == false ? 'btn material-icons btn-default': 'btn material-icons check-task'}>
                              check
                            </span>
                            <div className="form-check form-group pl-1"  style={{flex:12}}>
                              <label className={task.marked == false ? 'form-check-label form-control': 'form-check-label form-control done-task'} > 
                                {task.title}
                              </label>
                            </div>
                          </div>
                        )
                    })}
              </div>
              <div  className="pl-3 pr-3 py-0  pb-3">
                    <div className='btn btn-sm action-btn' onClick={() => self.save()}>
                      save
                    </div>
                    <div className='btn btn-sm action-btn ml-1' onClick={() => self.clear()}>
                      clear
                    </div>
              </div>
              <hr/>
              <div  id="list-wrapper" className="pl-3 pr-3 py-0 pb-2">
                    <h6>Saved task</h6>         
                    {tasks.map(function(task, index){
                      return(
                          <div key={index} className="flex-wrapper"> 
                            <div className="form-check form-group pl-1"  style={{flex:12}}>
                              <label className={task.completed == false ? 'form-check-label form-control': 'form-check-label form-control done-task'}  htmlFor={task.id}> {task.completed == false ? (
                                    <span>{task.title}</span>

                                    ) : (

                                      <strike>{task.title}</strike>
                                    )}
                              </label>
                            </div>
                            <span style={{flex:0.5}} onClick={() => self.deleteItem(task)} className="btn btn-danger ml-1 material-icons">
                              clear
                            </span>
                          </div>
                        )
                    })}
              </div>
          </div>
          
        </div>
      )
  }
}



export default App;
