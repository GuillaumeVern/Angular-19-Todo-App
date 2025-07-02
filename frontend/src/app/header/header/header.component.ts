import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, HostListener, AfterViewInit, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd, RouterLink, RouterOutlet } from '@angular/router';
import { BackendService } from '../../service/backend.service';
import { User } from '../../models/user.model';
import { UserSend } from '../../models/user.send.model';

declare let bootstrap: any; // Ensure Bootstrap is available globally

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule, RouterOutlet, FormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  appName = 'To-Do App'; // Default App Name (editable)
  userName = ''; // Stored username (requested once)
  tempUserName = ''; // Temporary storage for user input
  nom = ''; // User's first name
  prenom = ''; // User's last name
  email = ''; // User's email
  currentRoute = '';
  isEditing = false;
  userNameModalInstance: any; // Modal instance
  isRegister = false;
  router = inject(Router); // Inject Router service
  backendService = inject(BackendService); // Inject BackendService


  @ViewChild('appNameElement') appNameElement!: ElementRef;



  constructor() {
    this.loadAppName();

    this.backendService.refreshTokenIfExpired();

    // Listen for route changes and close navbar automatically
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = this.router.url;
        this.closeNavbar();
      }
    });
  }

  ngOnInit() { 
    if (this.backendService.isJwtExpired() || !localStorage.getItem('jwt')) {
      this.showUserNameModal();
    }
  }

  // === App Name Functions ===
  loadAppName() {
    const storedAppName = localStorage.getItem('appName');
    if (storedAppName) {
      this.appName = storedAppName;
    }
  }

  enableEditing() {
    this.isEditing = true;
  }

  saveAppName(event: any) {
    const newName = event.target.innerText.trim();
    if (newName) {
      this.appName = newName;
      localStorage.setItem('appName', newName);
    }
    this.isEditing = false;
  }

  toggleRegister() {
    this.isRegister = !this.isRegister;
  }

  register() { 
    if (this.nom.trim() && this.prenom.trim() && this.email.trim()) {
      const userData: UserSend = {
        nom: this.nom.trim(),
        prenom: this.prenom.trim(),
        email: this.email.trim()
      };

      this.backendService.register(userData).then(response => {
        console.log('User registered:', response);
        localStorage.setItem('jwt', response.token);
        localStorage.setItem('email', userData.email); 
        this.getUserId()
        if (this.userNameModalInstance) {
        this.userNameModalInstance.hide();
      }
      }).catch(error => {
        console.error('Registration error:', error);
        alert('Registration failed. Please try again.');
      });
    } else {
      alert("Please fill in all fields!");
    }
  }

  login() {
    if (this.email.trim()) {
      this.backendService.login(this.email.trim()).then(response => {
        console.log('User logged in:', response);
        localStorage.setItem('jwt', response.token); // Store JWT token
        localStorage.setItem('email', this.email);
        this.getUserId()
        if (this.userNameModalInstance) {
        this.userNameModalInstance.hide();
      }
      }).catch(error => {
        console.error('Login error:', error);
        alert('Login failed. Please try again.');
      });
    } else {
      alert("Please enter your email!");
    }
  }

  logout() {
    localStorage.removeItem('jwt'); // Remove JWT token
    localStorage.removeItem('email'); // Remove email
    localStorage.removeItem('userName'); // Remove user name
    localStorage.removeItem('userId'); // Remove user ID
    this.userName = ''; // Clear user name in component
    this.router.navigate(['/todos']); // Redirect to login page
    if (this.userNameModalInstance) {
      this.userNameModalInstance.hide(); // Hide modal if it's open
    }
    this.showUserNameModal();
  }

  getUserId() {
    const email = localStorage.getItem('email');
    if (email) {
      this.backendService.getUserData(email).then(user => {
        console.log('User data:', user);
        this.userName = `${user.nom} ${user.prenom}`;
        localStorage.setItem('userName', this.userName);
        if (user.id !== undefined) {
          localStorage.setItem('userId', user.id.toString());
        }
        window.location.reload();
      }).catch(error => {
        console.error('Error fetching user data:', error);
      });
    }
  }

  showUserNameModal() {
    setTimeout(() => {
      const modalElement = document.getElementById('userNameModal');
      if (modalElement) {
        this.userNameModalInstance = new bootstrap.Modal(modalElement, {
          backdrop: 'static', // Prevent closing by clicking outside
          keyboard: false, // Prevent closing by pressing Escape
        });
        this.userNameModalInstance.show();
      }
    }, 500);
  }

  saveUserName() {
    if (this.tempUserName.trim()) {
      this.userName = this.tempUserName.trim();
      localStorage.setItem('userName', this.userName);

      // Close modal after saving name
      if (this.userNameModalInstance) {
        this.userNameModalInstance.hide();
      }
    } else {
      alert("Please enter your name!"); // Show alert if the field is empty
    }
  }

  closeNavbar() {
    const navbar = document.getElementById('navbarNav');
    if (navbar?.classList.contains('show')) {
      navbar.classList.remove('show'); // Close Bootstrap navbar manually
    }
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbar = document.getElementById('navbarNav');

    if (
      navbar &&
      navbarToggler &&
      !navbar.contains(event.target as Node) &&
      !navbarToggler.contains(event.target as Node)
    ) {
      this.closeNavbar(); // Close navbar if clicked outside
    }
  }
  
}
