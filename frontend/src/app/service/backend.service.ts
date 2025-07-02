import { Injectable } from '@angular/core';
import { User } from '../models/user.model';

import { environment } from '../../environments/environment';
import { UserSend } from '../models/user.send.model';
import { Task } from '../models/task.model';
import { TaskSend } from '../models/task.send.model';

@Injectable({
  providedIn: 'root'
})
export class BackendService {

  login(email: string): Promise<{"token": string}> {
    const url = `${environment.backendUrl}/auth/login`;
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    }).then(response => response.json());
  }

  register(userData: UserSend): Promise<{"token": string}> {
    const url = `${environment.backendUrl}/auth/register`;
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    }).then(response => response.json());
  }

  getUserData(email: string): Promise<User> {
    const url = `${environment.backendUrl}/users/by-email`;
    const token = this.getToken();

    return fetch(`${url}?email=${email}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include'
    }).then(response => response.json());
  }

  getAllMembers(): Promise<User[]> {
    const url = `${environment.backendUrl}/users`;
    const token = this.getToken();
    return fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }).then(response => response.json());
  }

  updateMember(userData: UserSend, userId: number): Promise<User> {
    const url = `${environment.backendUrl}/users/${userId}`;
    const token = this.getToken();
    return fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(userData)
    }).then(response => response.json());
  }

  deleteMember(userId: number): Promise<void> {
    const url = `${environment.backendUrl}/users/${userId}`;
    const token = this.getToken();
    return fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }).then(response => {
      if (!response.ok) {
        throw new Error('Failed to delete member');
      }
      return;
    });
  }

  addMember(userData: UserSend): Promise<User> {
    const url = `${environment.backendUrl}/users`;
    const token = this.getToken();
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(userData)
    }).then(response => response.json());
  }

  isJwtExpired(): boolean {
    const token = localStorage.getItem('jwt');
    if (!token) return true;

    const payload = token.split('.')[1];
    if (!payload) return true;

    try {
      const decoded = JSON.parse(atob(payload));
      if (!decoded.exp) return true;
      const now = Math.floor(Date.now() / 1000);
      return decoded.exp < now;
    } catch (e) {
      return true;
    }
  }

  getToken(): string | null {
    if (!localStorage.getItem('jwt')) {
      return null;
    }
    if (this.isJwtExpired()) {
      localStorage.removeItem('jwt');
      return null;
    }
    return localStorage.getItem('jwt');
  }

  refreshTokenIfExpired(): Promise<string | null> {
    if (this.isJwtExpired()) {
      return this.login(localStorage.getItem('email') || '').then(response => {
        localStorage.setItem('jwt', response.token);
        return response.token;
      }).catch(error => {
        console.error('Error refreshing token:', error);
        localStorage.removeItem('jwt');
        return null;
      });
    }
    return Promise.resolve(this.getToken());
  }

  getAllTasks(): Promise<Task[]> {
    const url = `${environment.backendUrl}/users/${localStorage.getItem('userId')}/tasks`;
    const token = this.getToken();
    return fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }).then(response => response.json());
  }

  addTask(task: TaskSend): Promise<Task> {
    const url = `${environment.backendUrl}/users/${localStorage.getItem('userId')}/tasks`;
    const token = this.getToken();
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(task)
    }).then(response => response.json());
  }

  deleteTask(taskId: number): Promise<void> {
    const url = `${environment.backendUrl}/users/${localStorage.getItem('userId')}/tasks/${taskId}`;
    const token = this.getToken();
    return fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }).then(response => {
      if (!response.ok) {
        throw new Error('Failed to delete task');
      }
      return;
    });
  }

  updateTask(taskId: number, task: TaskSend): Promise<Task> {
    const url = `${environment.backendUrl}/users/${localStorage.getItem('userId')}/tasks/${taskId}`;
    const token = this.getToken();
    return fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(task)
    }).then(response => response.json());
  }
}
