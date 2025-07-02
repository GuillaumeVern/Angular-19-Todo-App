import { WeatherService } from './../service/weather.service';
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BackendService } from '../service/backend.service';
import { Task } from '../models/task.model';

@Component({
  selector: 'app-todo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.css']
})
export class TodoComponent implements OnInit {
  tasks: Task[] = [];
  newTask: string = '';
  editingTaskIndex: number | null = null;
  backendService = inject(BackendService)
  router = inject(Router); 
  ngOnInit() {
    if (this.backendService.getToken()) { 
      // Load tasks from local storage
      this.backendService.getAllTasks().then(tasks => {
        this.tasks = tasks;
      }).catch(error => {
        console.error('Error loading tasks:', error);
        alert('Failed to load tasks. Please try again.');
      });
    }

    // Request notification permission from the user
    if ("Notification" in window) {
      Notification.requestPermission();
    }

    // Run background task every minute
    setInterval(() => {
      this.showTaskNotification();
    }, 3600000); // Every 60 mins
  }


  private showTaskNotification() {

    const userName = localStorage.getItem('userName') || 'User';
    const appName = localStorage.getItem('appName') || 'Todo App';

    if (Notification.permission === "granted") {
      let notificationMessage = '';

      if (this.remainingTasks > 0) {
        // User has pending tasks
        notificationMessage = `Hey ${userName}, you have ${this.remainingTasks} tasks to complete! ✅`;
      } else {
        notificationMessage = `Hey ${userName}, you have no tasks! Add new tasks in "${appName}" to stay productive. 🚀`;
      }

      const notification = new Notification("🚀 Reminder!", {
        body: notificationMessage,
        icon: "/favicon.png"
      });

      notification.onclick = () => {
        window.focus();
        this.router.navigate(['/todos']); // Navigate to the task page
      };
    }else{
      if ("Notification" in window) {
        Notification.requestPermission();
      }
    }
  }


  addTask() {
    if (this.newTask.trim()) {
      
      this.backendService.addTask({ libelle: this.newTask, completed: false }).then(() => {
        console.log('Task added successfully');
        this.tasks.push({
          id: Date.now(), // Temporary ID, will be replaced by backend ID
          libelle: this.newTask,
          completed: false
        });
        this.newTask = '';
      }).catch(error => {
        console.error('Error adding task:', error);
        alert('Failed to add task. Please try again.');
      });
    }
  }

  toggleTaskCompletion(index: number) {
    this.tasks[index].completed = !this.tasks[index].completed;
    this.backendService.updateTask(this.tasks[index].id, { libelle: this.tasks[index].libelle, completed: this.tasks[index].completed }).then(() => {
      console.log('Task updated successfully');
    }).catch(error => {
      console.error('Error updating task:', error);  
      alert('Failed to update task. Please try again.');
    });
  }

  editTask(index: number) {
    this.editingTaskIndex = index;
  }

  updateTask(index: number) {
    if (this.tasks[index].libelle.trim()) {
      this.backendService.updateTask(this.tasks[index].id, { libelle: this.tasks[index].libelle, completed: this.tasks[index].completed }).then(() => {
        console.log('Task updated successfully');
        this.editingTaskIndex = null;
      }).catch(error => {
        console.error('Error updating task:', error);
        alert('Failed to update task. Please try again.');
      });
    } else {
      alert('Task description cannot be empty!');
    }
  }

  deleteTask(index: number) {
    this.backendService.deleteTask(this.tasks[index].id).then(() => {
      console.log('Task deleted successfully');
      this.tasks.splice(index, 1);
    }).catch(error => {
      console.error('Error deleting task:', error);
      alert('Failed to delete task. Please try again.');
    });
  }

  get remainingTasks() {
    return this.tasks.filter(task => !task.completed).length;
  }

  get completedTasks() {
    return this.tasks.filter(task => task.completed).length;
  }

}
