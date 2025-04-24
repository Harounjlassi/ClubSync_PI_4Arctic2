// project-task-list.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjetTask } from 'app/models/projet-task';
import { TaskService } from 'app/services/task.service';

@Component({
  selector: 'app-project-task-list',
  templateUrl: './project-task-list.component.html',
  styleUrls: ['./project-task-list.component.scss']
})


export class ProjectTaskListComponent implements OnInit {
  tasks: ProjetTask[] = [];
  showTaskModal = false;
  isUpdateMode = false;
  draggedTaskId: string | null = null;
    taskForm: FormGroup;
  

  currentTask: ProjetTask = {
    id: '',
    titre: '',
    description: '',
    status: 'todo',
    priorite: 'medium',
    dueDate: new Date().toISOString().split('T')[0],
    progress: 0,
    assignee: '',
    label: '',
    completedDate: '',
    ProjetId: Number(this.route.snapshot.paramMap.get('id'))
  };

  constructor(
    private taskService: TaskService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) {

    this.taskForm = this.fb.group({
      titre: ['', Validators.required],
      description: [''],
      status: ['Pending', Validators.required],
      priorite: ['medium', Validators.required],
      dueDate: [new Date().toISOString().split('T')[0], Validators.required],
      progress: [0],
      assignee: [''],
      label: [''],
      completedDate: ['']

        });
  }

  ngOnInit(): void {
    this.listTasks();
  }

  listTasks() {
    const idProjet: number = Number(this.route.snapshot.paramMap.get('id')!);
    console.log('Project ID:', idProjet);

    this.taskService.getTasksByIdProjet(idProjet).subscribe(
      (data) => {
        console.log("Received tasks:", data);
        this.tasks = data || [];
        console.log("Tasks after assignment:", this.tasks);
      },
      (error) => {
        console.error("Error fetching tasks:", error);
      }
    );
  }

  getTasksByStatus(status: string): ProjetTask[] {
   /// console.log('GetTasksByStatus:', this.tasks.filter(task => task.status === status));
    return this.tasks.filter(task => task.status === status);
  }

  openTaskModal(status: 'todo' | 'inProgress' | 'done', task?: ProjetTask) {
    console.log('TopenTaskModalask:', task);
    this.isUpdateMode = !!task;
    this.currentTask = task ? { ...task } : {
      id: '',
      titre: '',
      description: '',
      status,
      priorite: 'medium',
      dueDate: new Date().toISOString().split('T')[0],
      progress: 0,
      assignee: '',
      label: '',
      completedDate: '',
      ProjetId: Number(this.route.snapshot.paramMap.get('id'))
      

    };
    this.showTaskModal = true;
  }
  

  closeTaskModal() {
    this.showTaskModal = false;
  }

  handleTaskSubmit() {
    if (this.isUpdateMode) {
      this.taskService.updateTask(this.currentTask).subscribe(
        (updatedTask) => {
          const index = this.tasks.findIndex(t => t.id === updatedTask.id);
          if (index !== -1) {
            this.tasks[index] = updatedTask;
          }
          this.closeTaskModal();
        }
      );
    } else {
      console.log('Form valsssssssssues:', this.taskForm.value);
      if (this.taskForm.valid ) {
        const updatedTask = {
          ...this.taskForm.value,
          lastUpdated: new Date(),
          ProjetId:Number(this.route.snapshot.paramMap.get('id')),
        };
  

      this.taskService.createTask(updatedTask).subscribe(
        (newTask) => {
          this.tasks.push(newTask);
          this.closeTaskModal();
        }
      );
    }
  }
}

  deleteTask(task: ProjetTask) {
    this.taskService.deleteTask(task.id).subscribe(
      () => {
        this.tasks = this.tasks.filter(t => t.id !== task.id);
      }
    );
  }

  reopenTask(task: ProjetTask) {
    task.status = 'todo';
    delete task.completedDate;
    this.taskService.updateTask(task).subscribe();
  }

  startTask(task: ProjetTask) {
    task.status = 'inProgress';
    task.progress = 0;
    this.taskService.updateTask(task).subscribe();
  }

  completeTask(task: ProjetTask) {
    task.status = 'done';
    task.progress = 100;
    task.completedDate = new Date().toISOString();
    this.taskService.updateTask(task).subscribe();
  }

  clearCompletedTasks() {
    const doneTasks = this.tasks.filter(task => task.status === 'done');
    doneTasks.forEach(task => {
      this.taskService.deleteTask(task.id).subscribe();
    });
    this.tasks = this.tasks.filter(task => task.status !== 'done');
  }

  onDragStart(event: DragEvent, task: ProjetTask) {
    this.draggedTaskId = task.id;
    event.dataTransfer?.setData('text/plain', task.id);
  }

  onDrop(event: DragEvent, newStatus: 'todo' | 'inProgress' | 'done') {
    event.preventDefault();
    const taskId = event.dataTransfer?.getData('text/plain');
    const task = this.tasks.find(t => t.id.toString() === taskId);
    
    if (!task) return;
  
    if (task.status === 'inProgress' && newStatus === 'todo') {
      alert('Cannot move task from In Progress back to Todo');
      this.draggedTaskId = null;
      return;
    }
  
    if (task.status === 'done' && newStatus === 'inProgress') {
      alert('Cannot move task from Done back to In Progress');
      this.draggedTaskId = null;
      return;
    }
  
    if (task.status === 'done' && newStatus === 'todo') {
      alert('Cannot move task from Done back to Todo');
      this.draggedTaskId = null;
      return;
    }
  
    task.status = newStatus;
    
    if (newStatus === 'inProgress' && !task.progress) {
      task.progress = 0;
    }
    
    if (newStatus === 'done') {
      task.progress = 100;
      task.completedDate = new Date().toISOString();
    }
    
    this.taskService.updateTask(task).subscribe(
      () => {
        this.listTasks();
      },
      (error) => {
        console.error('Error updating task:', error);
      }
    );
    
    this.draggedTaskId = null;
  }

  getPriorityIcon(priority: string): string {
    switch(priority) {
      case 'HIGH': return '🔥';
      case 'MEDIUM': return '⚠️';
      case 'LOW': return '🌱';
      default: return '🔹';
    }
  }

 

  openTaskMenu(event: MouseEvent, task: ProjetTask) {
    event.stopPropagation();
  }

 
  allowDrop(event: DragEvent) {
    event.preventDefault();
    (event.currentTarget as HTMLElement).classList.add('drop-target');
  }
  
  onDragLeave(event: DragEvent) {
    (event.currentTarget as HTMLElement).classList.remove('drop-target');
  }
}